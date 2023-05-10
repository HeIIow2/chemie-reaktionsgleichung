import math
from collections import defaultdict
from typing import List, Dict, Tuple

EquationDict = Dict[str, float]


class Substitution:
    def __init__(self, key: str, substitute: "Equation"):
        self.key = key
        self.substitute = substitute

    def __str__(self):
        return f"{self.key} = " + " + ".join(f"{round(value, 2)}{key}" for key, value in self.substitute.equation.items())

    def new_solution(self, current_solution: Dict[str, float]):
        possible_solution = 0

        for key, value in self.substitute.equation.items():
            if key not in current_solution:
                return None

            possible_solution += value * current_solution[key]

        return possible_solution



class Equation:
    """
    2*a + 0*b -2*c = 0
    {'a': 2, 'b': 0, 'c': -2}
    """

    def __init__(self, equation: EquationDict):
        self.equation = equation

        for key, value in self.equation.copy().items():
            if value == 0:
                self.equation.pop(key)

    def __truediv__(self, divisor: float) -> "Equation":
        """
        divisor = 2
        2a - 2c = 0 -> a - c = 0
        """
        flat_copy = self.equation.copy()

        for key in flat_copy:
            flat_copy[key] = flat_copy[key] / divisor

        return Equation(flat_copy)

    def __mul__(self, factor: float) -> "Equation":
        """
        factor = 2
        2a - 2c = 0 -> 4a - 4c = 0
        """

        flat_copy = self.equation.copy()

        for key in flat_copy:
            flat_copy[key] = flat_copy[key] * factor

        return Equation(flat_copy)

    def __add__(self, other: "Equation") -> "Equation":
        """
        3a + 3c = 0
        2a - 2c = 0

        => 5a + 1c = 0
        """

        self_equation = self.equation.copy()
        other_equation = other.equation.copy()

        for other_key in other_equation:
            if other_key not in self_equation:
                self_equation[other_key] = other_equation[other_key]
                continue

            self_equation[other_key] += other_equation[other_key]

        return Equation(self_equation)

    def __sub__(self, other: "Equation") -> "Equation":
        """
        Subtract two equations
        """
        self_equation = self.equation.copy()
        other_equation = other.equation.copy()

        for other_key in other_equation:
            if other_key not in self_equation:
                self_equation[other_key] = -other_equation[other_key]
                continue

            self_equation[other_key] -= other_equation[other_key]

        return Equation(self_equation)

    def __len__(self) -> int:
        """
        3a + 0b - 1c = 0
        2
        :return:
        """
        length = 0

        for key, value in self.equation.items():
            if value != 0:
                length += 1

        return length

    def __str__(self):
        return " + ".join(f"{value}{key}" for key, value in self.equation.items()) + " = 0"

    def solve(self, solve_for: str) -> Substitution:
        """
        Solves a Linear Equation

        1. Removes the letter it should solve for
        2. inverts the equation
        3. divides everything by the coefficient to solve for

        :param solve_for:
        :return:
        """

        if solve_for not in self.equation:
            raise KeyError(f"{solve_for} does not exist")

        return Substitution(
            key=solve_for,
            substitute=self.pop(solve_for).invert() / self.equation[solve_for]
        )

    def invert(self) -> "Equation":
        """
        2a - 2c = 0 -> -2a + 2c = 0
        """

        flat_copy = self.equation.copy()

        for key in flat_copy:
            flat_copy[key] = -1 * flat_copy[key]

        return Equation(flat_copy)

    def pop(self, key: str) -> "Equation":
        """
        key = c

        2a - 2c = 0 -> 2a = 0
        """
        if key not in self.equation:
            return
            raise KeyError(f"{key} does not exist")

        flat_copy = self.equation.copy()

        flat_copy.pop(key)

        return Equation(flat_copy)

    def substitute(self, substitution: Substitution, silent: bool = True) -> "Equation":
        if substitution.key not in self.equation:
            if silent:
                return self
            raise KeyError(f"{substitution.key} does not exist")

        return self.pop(substitution.key) + (substitution.substitute * self.equation[substitution.key])

    def solve_for_first(self) -> Substitution:
        for key, value in self.equation.items():
            if round(value) != 0:
                return self.solve(key)


class SystemOfEquations:
    def __init__(self, equation_list: List[Equation]):
        self.equation_list: List[Equation] = equation_list

    def __str__(self):
        return "\n".join(str(equation) for equation in self.equation_list)

    def is_simplified(self) -> bool:
        for equation in self.equation_list:
            if len(equation) > 2:
                return False

        return True

    def substitute_smallest(self):
        smallest_equation = min(self.equation_list, key=len)
        to_substitute = smallest_equation.solve_for_first()

        for i, equation in enumerate(self.equation_list):
            if equation is smallest_equation:
                continue

            self.equation_list[i] = equation.substitute(to_substitute)
            
        self.equation_list.remove(smallest_equation)
        self.equation_list.append(smallest_equation)
        
    def __repr__(self):
        return self.__str__()

    def get_variables(self):
        variable_frequencies = defaultdict(lambda: 0)

        for equation in self.equation_list:
            for variable in equation.equation:
                variable_frequencies[variable] += 1

        sorted_variables = list(sorted(variable_frequencies, key=lambda k: variable_frequencies[k], reverse=True))

        max_variable = sorted_variables[0]

        sorted_variables = sorted_variables[1:]
        sorted_variables.reverse()

        return max_variable, *sorted_variables

    def is_natural(self, solution: Dict[str, float], factor: int) -> bool:
        def close_to_natural(n: float) -> bool:
            return abs(round(n) - n) < 0.00001
        
        for key, value in solution.items():
            if not close_to_natural(value * factor):
                return False
        return True

    def solve(self):
        """
        Solving the system of linear equations
        :return: a dictionary of solutions for the variables
        """

        iteration = 0
        while not self.is_simplified() and iteration < 200:
            self.substitute_smallest()
            
            iteration += 1

        # set the first key to 1
        variables = self.get_variables()
        solutions = {variables[0]: 1}

        # substitute back from the one key set
        for variable in variables[1:]:
            # Choose a variable to set to 1
            equations = self.equation_list.copy()
            for equation_with_var in equations:
                if variable not in equation_with_var.equation:
                    continue

                existing_solution = solutions.get(variable)

                # Solve for that variable in one of the equations
                substitution = equation_with_var.solve(variable)

                new_solution = substitution.new_solution(solutions)
                if new_solution is None:
                    continue

                if existing_solution is not None and new_solution != existing_solution:
                    return {}

                solutions[variable] = new_solution

        # find the correct factor:
        factor = 1
        for factor in range(1, 2000, 1):
            if self.is_natural(solutions, factor):
                break
        
        # apply the factor
        for key in solutions:
            solutions[key] = round(factor * solutions[key])

        return solutions


if __name__ == "__main__":
    # H2 + O2 = H20
    system_of_equation = SystemOfEquations([
        Equation({'a': 2, 'b': 0, 'c': -2}),
        Equation({'a': 0, 'b': 2, 'c': -1}),
    ])

    print(system_of_equation.solve())
