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
