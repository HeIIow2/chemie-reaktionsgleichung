from typing import List, Dict, Set
from collections import defaultdict

from .solve_lgs import SystemOfEquations, Equation

SUB_SUPER_MAP = {
    #           superscript     subscript
    '0': ('\u2070', '\u2080'),
    '1': ('\u00B9', '\u2081'),
    '2': ('\u00B2', '\u2082'),
    '3': ('\u00B3', '\u2083'),
    '4': ('\u2074', '\u2084'),
    '5': ('\u2075', '\u2085'),
    '6': ('\u2076', '\u2086'),
    '7': ('\u2077', '\u2087'),
    '8': ('\u2078', '\u2088'),
    '9': ('\u2079', '\u2089'),
}

ID_TUPLE = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u',
            'v', 'w', 'x', 'y', 'z']


class ParsingException(Exception):
    pass


class Atom:
    def __init__(self, name: str, count: int = 1) -> None:
        self.name = name
        self.count = count

    def __str__(self) -> str:
        if self.count == 0:
            return ""
        if self.count == 1:
            return self.name

        subscript_count = ""
        for char in str(self.count):
            if char not in SUB_SUPER_MAP:
                subscript_count += char
                continue
            subscript_count += SUB_SUPER_MAP[char][1]

        return f"{self.name}{subscript_count}"


class Molecule:
    def __init__(self, side: int, id_: str) -> None:
        self.side = side

        self.coefficient = 1
        self.id_ = id_
        self.atom_list: List[Atom] = []

        self.element_set: Set[str] = set()
        self.atom_map: Dict[str, int] = defaultdict(lambda: 0)

    def set_coeficient(self, coeficient: int):
        if len(self.atom_list) == 0:
            self.coefficient = self.coefficient * coeficient
        else:
            self.atom_list[-1].count = coeficient

    def add_atom(self, name: str):
        self.atom_list.append(Atom(name=name))

    def modify_atom_name(self, name: str):
        if len(self.atom_list) == 0:
            raise ParsingException(f"can't modifie a nonexisting molecule")

        self.atom_list[-1].name += name

    def __str__(self) -> str:
        atom_str = "".join(str(atom) for atom in self.atom_list)

        if self.coefficient == 0:
            return ""
        if self.coefficient == 1:
            return atom_str

        return str(self.coefficient) + atom_str

    def map_atom(self):
        for atom in self.atom_list:
            self.atom_map[atom.name] = atom.count

            self.element_set.add(atom.name)

    def get_atom_count(self, element: str) -> int:
        return self.atom_map[element] * self.coefficient * self.side


class Reaction:
    def __init__(self, reaction: str) -> None:
        self.educt: List[Molecule] = []
        self.product: List[Molecule] = []

        self.last_molecule = None

        self.default_coeficient = 1

        # after parsing, the molecules in the producs side have negative signs
        self.molecule_pool: List[Molecule] = []
        self.id_molecule_map: Dict[str, Molecule] = {}

        self.parse(reaction)

    def __str__(self) -> str:
        return " + ".join(str(molecule) for molecule in self.educt) + " ⟶ " + " + ".join(
            str(molecule) for molecule in self.product)

    def _to_product(self):
        if self.default_coeficient == -1:
            raise ParsingException("Can only contain 1 '='.")
        self.default_coeficient = -1

        self._add_molecule()

    def _add_molecule(self):
        self.last_molecule = Molecule(self.default_coeficient, ID_TUPLE[len(self.molecule_pool)])

        self.molecule_pool.append(self.last_molecule)

        self.id_molecule_map[self.last_molecule.id_] = self.last_molecule

        if self.default_coeficient == 1:
            self.educt.append(self.last_molecule)
        elif self.default_coeficient == -1:
            self.product.append(self.last_molecule)
        else:
            raise ParsingException(f"weird default coeficient: {self.default_coeficient}")

    def parse(self, reaction: str):
        """
        +: next molecule
        capital letter: next atom
        non capital letter: added to last atom
        = next part
        """

        self._add_molecule()

        # add a space at the end that will be ignored, but allows to easily loop
        reaction += " "

        last_number = ""

        for i in range(len(reaction) - 1):
            current_char: str = reaction[i]
            next_char: str = reaction[i + 1]

            if current_char == " ":
                continue

            if current_char == "+":
                self._add_molecule()

            if current_char == "=" or current_char == "→":
                self._to_product()

            if current_char.isdigit():
                last_number += current_char

                if not next_char.isdigit():
                    self.last_molecule.set_coeficient(int(last_number))
                    last_number = ""

                continue

            if current_char.isalpha() and current_char.isupper():
                self.last_molecule.add_atom(current_char)
                continue

            if current_char.isalpha() and current_char.islower():
                self.last_molecule.modify_atom_name(current_char)
                continue

    def get_system_of_linear_equations(self) -> SystemOfEquations:
        # get all existing elements
        element_set: Set[str] = set()

        for molecule in self.molecule_pool:
            molecule.map_atom()

            element_set = element_set.union(molecule.element_set)

        # create a equation for this
        equations: List[Equation] = []

        for element in element_set:
            equations.append(Equation({m.id_: m.get_atom_count(element) for m in self.molecule_pool}))

        return SystemOfEquations(equations)

    def solve(self, show_steps: bool) -> str:
        sol = self.get_system_of_linear_equations()

        if show_steps:
            print(sol)

        solutions = sol.solve()

        if solutions == {}:
            return "No solution found."

        for key in solutions:
            self.id_molecule_map[key].coefficient *= solutions[key]

        return str(self)


def solve(reaction: str, show_steps: bool) -> str:
    reaction_obj = Reaction(reaction)

    return reaction_obj.solve(show_steps)

