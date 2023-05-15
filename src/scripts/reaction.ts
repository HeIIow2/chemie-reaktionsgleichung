import {Equation, SystemOfEquations} from './solveLgs.js';

const SUBSCRIPT_MAP: {[key: string]: string} = {
    '0': '\u2080',
    '1': '\u2081',
    '2': '\u2082',
    '3': '\u2083',
    '4': '\u2084',
    '5': '\u2085',
    '6': '\u2086',
    '7': '\u2087',
    '8': '\u2088',
    '9': '\u2089',
};
const UN_SUBSCRIPT_MAP = Object.fromEntries(Object.entries(SUBSCRIPT_MAP).map(([key, value]) => [value, key]));

const ID_LIST: string = "abcdefghijklmnopqrstuvwxyz^"


function defaultDict(defaultValue: any) {
    return new Proxy({}, {
      get: (target, name) => name in target ? target[name] : defaultValue
    });
}


function isUpperCase(str: string) {
    return str === str.toUpperCase();
}

function isLowerCase(str: string) {
    return str === str.toLowerCase();
}
  
function isAlpha(str: string) {
    return /^[a-zA-Z]+$/.test(str);
}

function isDigit(str: string): boolean {
    return /^[0-9\u2080-\u2089]+$/.test(str);
}


class ParsingError extends Error {}


class Solution {
    reaction: Reaction;

    parsingError: boolean;
    hasNoSollution: boolean;

    constructor(reaction: Reaction, parsingError: boolean, hasNoSollution: boolean) {
        this.reaction = reaction;
        this.parsingError = parsingError;
        this.hasNoSollution = hasNoSollution;
    }

    toString(): string {
        if (this.parsingError) return "Maybe check your input(?) 🥺";
        if (this.hasNoSollution) return "No solution found. I'm soooooryyyy!! 🥺"

        return this.reaction.toString();
    }

    isSucess(): boolean {
        return !this.parsingError && !this.hasNoSollution;
    }

    originalReaction(): string {
        return this.reaction.originalReaction;
    }
}


class Atom {
    name: string;
    count: number

    oldCount: number = 0;

    constructor(name: string, count: number) {
        this.name = name;
        this.count = count;
    }

    setCount(count: number, isNew: boolean = false): void {
        if (isNew) {
            this.oldCount = this.count;
        }

        this.count = this.oldCount + count;
    }

    toString(): string {
        if (this.count === 1) return this.name;
        if (this.count === 0) return "";
        

        let subscript = "";
        const count_str = this.count.toString();

        for (let i = 0; i < count_str.length; i++) {
            subscript += SUBSCRIPT_MAP[count_str[i]];
        }

        return this.name + subscript;
    }
}


class Molecule {
    coefficient: number = 1;
    atomList: Atom[] = [];

    printableAtomList: Atom[] = []

    id: string;
    side: number;

    elementSet: Set<string> = new Set();
    private atomMap: {[key: string]: Atom} = defaultDict(0);

    constructor(id: string, side: number) {
        this.id = id;
        this.side = side;
    }

    toString(): string {
        if (this.coefficient === 0) return "";

        const atomString = this.atomList.map(atom => atom.toString()).join("");

        if (this.coefficient === 1) return atomString;
        else return this.coefficient.toString() + atomString;
    }

    setCoeficient(coefficient: number): void {
        if (this.atomList.length === 0) this.coefficient *= coefficient;
        else this.printableAtomList[this.printableAtomList.length - 1].setCount(coefficient);
    }

    addAtom(name: string): void {
        this.mapAtom();

        let newAtom: Atom;

        if (name in this.atomMap) {
            newAtom = this.atomMap[name];
            newAtom.setCount(1, true)
        } else {
            newAtom = new Atom(name, 1);
            this.atomList.push(newAtom);
        }

        this.printableAtomList.push(newAtom);
    }

    modifyAtomName(name: string): void {
        if (this.atomList.length === 0) throw ParsingError;

        this.printableAtomList[this.printableAtomList.length - 1].name += name
    }

    mapAtom(): void {
        for (const atom of this.atomList) {
            this.atomMap[atom.name] = atom;
            this.elementSet.add(atom.name);
        }
    }

    getAtomCount(element: string): number {
        if (!(element in this.atomMap)) return 0;
        return this.atomMap[element].count * this.coefficient * this.side;
    }

}

class Reaction {
    originalReaction: string;

    educt: Molecule[] = [];
    product: Molecule[] = [];

    private lastMolecule: Molecule;
    private currentSide: number = 1;

    private moleculePool: Molecule[] = [];
    private idMoleculeMap: {[key: string]: Molecule} = {};

    private parsingError: boolean = false;

    constructor(reaction: string) {
        this.parse(reaction);
    }

    toString(): string {
        return this.educt.map(molecule => molecule.toString()).join(" + ") + " ⟶ " + this.product.map(molecule => molecule.toString()).join(" + ")
    }

    private switchToProduct(): void {
        if (this.currentSide === -1) {
            this.parsingError = true;
            return
        }

        this.currentSide = -1;
        this.addMolecule();
    }

    private addMolecule(): void {
        this.lastMolecule = new Molecule(ID_LIST[this.moleculePool.length], this.currentSide);

        this.moleculePool.push(this.lastMolecule);
        this.idMoleculeMap[this.lastMolecule.id] = this.lastMolecule;

        if (this.currentSide === 1) this.educt.push(this.lastMolecule);
        else if (this.currentSide === -1) this.product.push(this.lastMolecule);
        else this.parsingError = true;
    }

    private parse(reaction: string): void {
        this.addMolecule();

        reaction += " ";
        let lastNumber: string = "";
        let lastAtomName: string = "";

        for (let i = 0; i<reaction.length-1; i++) {
            const currentChar: string = reaction[i];
            const nextChar: string = reaction[i + 1];

            if (currentChar === " ") continue;
            if (currentChar === "+") this.addMolecule();
            else if (currentChar === "=" || currentChar === "⟶") this.switchToProduct();

            else if (isDigit(currentChar)) {
                let digit: string = currentChar
                if (currentChar in UN_SUBSCRIPT_MAP) digit = UN_SUBSCRIPT_MAP[currentChar];
                lastNumber += digit;

                if (!isDigit(nextChar)) {
                    this.lastMolecule.setCoeficient(Number(lastNumber));
                    lastNumber = "";
                }
            }

            else if (isAlpha(currentChar)) {
                lastAtomName += currentChar;

                if (!(isAlpha(nextChar) && isLowerCase(nextChar))) {
                    this.lastMolecule.addAtom(lastAtomName);
                    lastAtomName = "";
                }
            }
        }

        this.originalReaction = this.toString();
    }

    getSystemOfLinearEquations(): SystemOfEquations {
        // Get all existing elements
        let elementSet: Set<string> = new Set();
      
        for (const molecule of this.moleculePool) {
            molecule.mapAtom();
      
            elementSet = new Set([...elementSet, ...molecule.elementSet])
        }
      
        // Create an equation for each element
        const equations: Equation[] = [];
      
        for (const element of elementSet) {
            const counts: {[id: string]: number} = {};
        
            for (const molecule of this.moleculePool) {
                counts[molecule.id] = molecule.getAtomCount(element);
            }
        
            equations.push(new Equation(counts));
        }
      
        return new SystemOfEquations(equations);
    }
      
    solve(showSteps: boolean): Solution {
        const sol = this.getSystemOfLinearEquations();
      
        if (showSteps) {
            console.log(sol.toString());
        }
      
        const solutions = sol.solve();

        if (showSteps) {
            // console.log(solutions.toString());
        }
        
        for (const key of sol.getVariables()) {
            let solutionForKey = solutions.solution[key];
            
            if (solutionForKey === undefined ||  solutionForKey === 0) {
                return new Solution(this, this.parsingError, true);
            }
        }

        if (Object.keys(solutions.solution).length === 0) {
          return new Solution(this, this.parsingError, true);
        }
      
        for (const key in solutions.solution) {
          this.idMoleculeMap[key].coefficient *= solutions.solution[key];
        }
      
        return new Solution(this, this.parsingError, false);
    }     
}


export function solve(reaction: string, showSteps: boolean): Solution {
    let parsed_reaction: Reaction = new Reaction(reaction);
    return parsed_reaction.solve(showSteps);
}

function testSolving(override: string = "") {
    let cases: string[] = [
        "H2 + O2 = H2O",
        "C3H6O3 + O2 = H2O + CO2",
        "NaOH + CO2 = Na2CO3 + H2O",
        "C8H18 + O2 = CO2 + H2O",
        "C12H22O11 + H2SO4 = C + H2O + H2SO4",
        "C3H8 + O2 = CO2 + H2O",
        "C6H12O6 + O2 = CO2 + H2O",
        "C7H16 + O2 = CO2 + H2O",
        "C4H10 + O2 = CO2 + H2O",
        "C8H18 + O2 = CO2 + H2O",
        "C3H8O3 + HNO3 = CH3NO3 + CH3COOH + H2O",
        "C6H5CH3 + KMnO4 = CO2 + H2O + MnO2 + KCl",
        "C6H5CH3 + Br2 = C6H5CHBr2 + HBr",
        "C₇H₈ + Br₂ ⟶ C₇H₆Br₂ + HBr",
        "Pb + PbO₂ + H₂SO₄ ⟶ PbSO₄ + H₂O"
    ]

    if (override !== "") {
        cases = [override];
    }

    for (const reaction of cases) {
        const reactionObject: Reaction = new Reaction(reaction);
        const solution: Solution = reactionObject.solve(true);
        console.log(solution.originalReaction());
        console.log(solution.toString())
        console.log("");
    }
}

// testSolving("Pb + PbO₂ + H₂SO₄ ⟶ PbSO₄ + H₂O");
// testSolving("C₁₂H₂₂O₁₁ + H₂SO₄ ⟶ C + H₂O + H₂SO₄")

testSolving();
