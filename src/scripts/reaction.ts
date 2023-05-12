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
    return /^[0-9]+$/.test(str);
}


class ParsingError extends Error {}


class Atom {
    name: string;
    count: number

    constructor(name: string, count: number) {
        this.name = name;
        this.count = count;
    }

    toString(): string {
        if (this.count === 0) return "";
        if (this.count === 1) return this.name;

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

    id: string;
    side: number;

    elementSet: Set<string> = new Set();
    private atomMap: {[key: string]: number} = defaultDict(0);

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
        else this.atomList[this.atomList.length - 1].count = coefficient;
    }

    addAtom(name: string): void {
        this.atomList.push(new Atom(name, 1));
    }

    modifyAtomName(name: string): void {
        if (this.atomList.length === 0) throw ParsingError;

        this.atomList[this.atomList.length - 1].name += name
    }

    mapAtom(): void {
        for (const atom of this.atomList) {
            this.atomMap[atom.name] = atom.count;
            this.elementSet.add(atom.name);
        }
    }

    getAtomCount(element: string): number {
        return this.atomMap[element] * this.coefficient * this.side;
    }

}

class Reaction {
    educt: Molecule[] = [];
    product: Molecule[] = [];

    private lastMolecule: Molecule;
    private currentSide: number = 1;

    private moleculePool: Molecule[] = [];
    private idMoleculeMap: {[key: string]: Molecule} = {}

    constructor(reaction: string) {
        this.parse(reaction);
    }

    toString(): string {
        return this.educt.map(molecule => molecule.toString()).join(" + ") + " ⟶ " + this.product.map(molecule => molecule.toString()).join(" + ")
    }

    private switchToProduct(): void {
        if (this.currentSide === -1) throw ParsingError;

        this.currentSide = -1;
        this.addMolecule();
    }

    private addMolecule(): void {
        this.lastMolecule = new Molecule(ID_LIST[this.moleculePool.length], this.currentSide);

        this.moleculePool.push(this.lastMolecule);
        this.idMoleculeMap[this.lastMolecule.id] = this.lastMolecule;

        if (this.currentSide === 1) this.educt.push(this.lastMolecule);
        else if (this.currentSide === -1) this.product.push(this.lastMolecule);
        else throw ParsingError;
    }

    private parse(reaction: string): void {
        this.addMolecule();

        reaction += " ";
        let lastNumber: string = "";

        for (let i = 0; i<reaction.length-1; i++) {
            const currentChar: string = reaction[i];
            const nextChar: string = reaction[i + 1];

            if (currentChar === " ") continue;
            if (currentChar === "+") this.addMolecule();
            else if (currentChar === "=") this.switchToProduct();
            else if (isDigit(currentChar)) {
                lastNumber += currentChar;

                if (!isDigit(nextChar)) {
                    this.lastMolecule.setCoeficient(Number(lastNumber));
                    lastNumber = "";
                }
            }
            else if (isAlpha(currentChar) && isUpperCase(currentChar)) this.lastMolecule.addAtom(currentChar);
            else if (isAlpha(currentChar) && isLowerCase(currentChar)) this.lastMolecule.modifyAtomName(currentChar);
        }
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
      
    solve(showSteps: boolean): string {
        const sol = this.getSystemOfLinearEquations();
      
        if (showSteps) {
            console.log(sol.toString());
        }
      
        const solutions = sol.solve();
      
        if (Object.keys(solutions).length === 0) {
          return "No solution found. Sorrryyyy 🥺";
        }
      
        for (const key in solutions) {
          this.idMoleculeMap[key].coefficient *= solutions[key];
        }
      
        return this.toString();
    }     
}


export function solve(reaction: string, showSteps: boolean): string {
    let parsed_reaction: Reaction;
    
    try {
        parsed_reaction = new Reaction(reaction);
    } catch(error) {
        console.error(error);
        if (error instanceof ParsingError) {
            return "Parsing error: Check your input! 🥺";
        }
    }
    
    return parsed_reaction.solve(showSteps)
}

console.log(solve("H2 + O2 = H2O + N", true));
