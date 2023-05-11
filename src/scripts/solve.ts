class Substitution {
    key: string;
    substitute: Equation;

    constructor(key: string, substitute: Equation) {
        this.key = key;
        this.substitute = substitute;
    }

    toString(): string {
        return `${this.key} = ${Object.entries(this.substitute.equation)
                .map(([key, value]) => `${value.toFixed(2)}${key}`)
          .join(" + ")}`;
    }
    
    new_solution(current_solution: { [key: string]: number }): number | null {
        let possible_solution = 0;

        for (const [key, value] of Object.entries(this.substitute.equation)) {
            if (!(key in current_solution)) {
            return null;
            }

            possible_solution += value * current_solution[key];
        }

        return possible_solution;
    }
}


class Equation {
    equation: { [key: string]: number };

    constructor(equation: { [key: string]: number }) {
        this.equation = equation;

        for (const key in this.equation) {
            if (this.equation[key] == 0) {
                delete this.equation[key];
            }
        }
    }

    div(divisor: number): Equation {
        const flatCopy = { ...this.equation };

        for (const key in flatCopy) {
            flatCopy[key] /= divisor;
        }

        return new Equation(flatCopy);
    }

    mul(factor: number): Equation {
        const flatCopy = { ...this.equation };

        for (const key in flatCopy) {
            flatCopy[key] *= factor;
        }

        return new Equation(flatCopy);
    }

    add(other: Equation): Equation {
        const selfEquation = { ...this.equation };
        const otherEquation = { ...other.equation };

        for (const otherKey in otherEquation) {
            if (!(otherKey in selfEquation)) {
                selfEquation[otherKey] = otherEquation[otherKey];
            } else {
                selfEquation[otherKey] += otherEquation[otherKey];
            }
        }

        return new Equation(selfEquation);
    }

    sub(other: Equation): Equation {
        const selfEquation = { ...this.equation };
        const otherEquation = { ...other.equation };

        for (const otherKey in otherEquation) {
            if (!(otherKey in selfEquation)) {
                selfEquation[otherKey] = -otherEquation[otherKey];
            } else {
                selfEquation[otherKey] -= otherEquation[otherKey];
            }
        }

        return new Equation(selfEquation);
    }

    len(): number {
        let length = 0;

        for (const key in this.equation) {
            if (this.equation[key] !== 0) {
                length++;
            }
        }

        return length;
    }

    solve(solveFor: string): Substitution {
        if (!(solveFor in this.equation)) {
            throw new Error(`${solveFor} does not exist`);
        }

        return new Substitution(
            solveFor,
            this.pop(solveFor).invert().div(this.equation[solveFor])
        );
    }

    invert(): Equation {
        const flatCopy = { ...this.equation };

        for (const key in flatCopy) {
            flatCopy[key] = -flatCopy[key];
        }

        return new Equation(flatCopy);
    }

    pop(key: string): Equation {
        if (!(key in this.equation)) {
            throw new Error(`${key} does not exist`);
        }

        const flatCopy = { ...this.equation };
        delete flatCopy [key];

        return new Equation(flatCopy);
    }

    toString(): string {
        return Object.entries(this.equation).map(([key, value]) => `${value}${key}`).join(" + ") + " = 0";
    }
}
