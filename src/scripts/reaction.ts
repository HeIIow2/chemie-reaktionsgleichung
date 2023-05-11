import { SystemOfEquations } from './solve';

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


function defaultDict(defaultValue: any) {
    return new Proxy({}, {
      get: (target, name) => name in target ? target[name] : defaultValue
    });
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

    private elementSet: Set<string> = new Set();
    private atomMap: {[key: string]: number} = defaultDict(0);

    constructor(id: string, side: number) {
        this.id = id;
        this.side = side;
    }

    toString(): string {
        if (this.coefficient === 0) return "";

        const atomString = this.atomList.map(atom => atom.toString()).join("");

        if (this.coefficient === 1) return atomString;
        else this.coefficient.toString() + atomString;
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
