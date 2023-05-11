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
    
    newSolution(current_solution: { [key: string]: number }): number | null {
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


export class Equation {
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

    solveForFirst(): Substitution {
        for (const [key, value] of Object.entries(this.equation)) {
            if (Math.round(value) !== 0) {
                return this.solve(key);
            }
        }
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

    substitute(substitution: Substitution, silent = true): Equation {
        if (!(substitution.key in this.equation)) {
            if (silent) {
                return this;
            }
            throw new Error(`${substitution.key} does not exist`);
        }
    
        return this.pop(substitution.key).add(substitution.substitute.mul(this.equation[substitution.key]));
    }
    

    toString(): string {
        return Object.entries(this.equation).map(([key, value]) => `${value}${key}`).join(" + ") + " = 0";
    }
}

export class SystemOfEquations {
    equationList: Equation[]

    constructor(equationList: Equation[]) {
        this.equationList = equationList;
    }

    toString(): string {
        return this.equationList.map(equation => equation.toString()).join("\n");
    }

    isSimplified(): boolean {
        for (const equation of this.equationList) {
            if (equation.len() > 2) {
                return false;
            }
        }
        return true;
    }

    substituteSmallest(): void {
        const smallestEquation = this.equationList.reduce((prev, curr) => prev.equation.length < curr.equation.length ? prev : curr);
        const to_substitute = smallestEquation.solveForFirst();
    
        for (let i = 0; i < this.equationList.length; i++) {
          if (this.equationList[i] === smallestEquation) {
            continue;
          }
    
          this.equationList[i] = this.equationList[i].substitute(to_substitute);
        }
    
        this.equationList.splice(this.equationList.indexOf(smallestEquation), 1);
        this.equationList.push(smallestEquation);
      }
    
      getVariables(): string[] {
        const variable_frequencies: {[key: string]: number} = {};
    
        for (const equation of this.equationList) {
            for (const variable in equation.equation) {
                variable_frequencies[variable] = (variable_frequencies[variable] || 0) + 1;
            }
        }
    
        return Object.keys(variable_frequencies).sort((a, b) => variable_frequencies[b] - variable_frequencies[a]);
      }
    
    isNatural(solution: {[key: string]: number}, factor: number): boolean {
        const close_to_natural = (n: number) => Math.abs(Math.round(n) - n) < 0.00001;
    
        for (const [key, value] of Object.entries(solution)) {
            if (!close_to_natural(value * factor)) {
                return false;
            }
        }
        return true;
    }
    
    solve(): {[key: string]: number} {
        let iteration = 0;
        while (!this.isSimplified() && iteration < 200) {
            this.substituteSmallest();

            iteration++;
        }

        // set the first key to 1
        const variables = this.getVariables();
        const solutions: {[key: string]: number} = {[variables[0]]: 1};

        // substitute back from the one key set
        for (const variable of variables.slice(1)) {
            // Choose a variable to set to 1
            const equations = this.equationList.slice();
            
            for (const equationWithVar of equations) {
                if (!(variable in equationWithVar.equation)) {
                    continue;
                }

                const existingSolution = solutions[variable];

                // Solve for that variable in one of the equations
                const substitution = equationWithVar.solve(variable);

                const newSolution = substitution.newSolution(solutions);
                if (newSolution === null) {
                    continue;
                }

                if (existingSolution !== null && newSolution !== existingSolution) {
                    return {};
                }

                solutions[variable] = newSolution;
            }
        }

        // find the correct factor
        let factor: number = 1;
        for (factor = 1; factor < 2000; factor++) {
            if (this.isNatural(solutions, factor)) {
                break;
            }
        }

        // apply the factor
        for (const key in solutions) {
            solutions[key] = Math.round(factor * solutions[key]);
        }

        return solutions
    }
}
 