var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var LgsResult = /** @class */ (function () {
    function LgsResult(lgsHistory, solution) {
        this.lgsHistory = lgsHistory;
        this.solution = solution;
    }
    LgsResult.prototype.toString = function () {
        return this.lgsHistory.map(function (lgs) {
            return lgs.map(function (equation) {
                return equation.toString();
            }).join("\n");
        }).join("\n\n");
    };
    return LgsResult;
}());
export { LgsResult };
var Substitution = /** @class */ (function () {
    function Substitution(key, substitute) {
        this.key = key;
        this.substitute = substitute;
    }
    Substitution.prototype.toString = function () {
        return "".concat(this.key, " = ").concat(Object.entries(this.substitute.equation)
            .map(function (_a) {
            var _b = __read(_a, 2), key = _b[0], value = _b[1];
            return "".concat(value.toFixed(2)).concat(key);
        })
            .join(" + "));
    };
    Substitution.prototype.newSolution = function (currentSolution) {
        var e_1, _a;
        var possible_solution = 0;
        try {
            for (var _b = __values(Object.entries(this.substitute.equation)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), key = _d[0], value = _d[1];
                if (!(key in currentSolution)) {
                    return undefined;
                }
                possible_solution += value * currentSolution[key];
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (possible_solution === 0)
            return undefined;
        return possible_solution;
    };
    return Substitution;
}());
var Equation = /** @class */ (function () {
    function Equation(equation) {
        this.equation = equation;
        for (var key in this.equation) {
            if (this.equation[key] == 0) {
                delete this.equation[key];
            }
        }
    }
    Equation.prototype.div = function (divisor) {
        var flatCopy = __assign({}, this.equation);
        for (var key in flatCopy) {
            flatCopy[key] /= divisor;
        }
        return new Equation(flatCopy);
    };
    Equation.prototype.mul = function (factor) {
        var flatCopy = __assign({}, this.equation);
        for (var key in flatCopy) {
            flatCopy[key] *= factor;
        }
        return new Equation(flatCopy);
    };
    Equation.prototype.add = function (other) {
        var selfEquation = __assign({}, this.equation);
        var otherEquation = __assign({}, other.equation);
        for (var otherKey in otherEquation) {
            if (!(otherKey in selfEquation)) {
                selfEquation[otherKey] = otherEquation[otherKey];
            }
            else {
                selfEquation[otherKey] += otherEquation[otherKey];
            }
        }
        return new Equation(selfEquation);
    };
    Equation.prototype.sub = function (other) {
        var selfEquation = __assign({}, this.equation);
        var otherEquation = __assign({}, other.equation);
        for (var otherKey in otherEquation) {
            if (!(otherKey in selfEquation)) {
                selfEquation[otherKey] = -otherEquation[otherKey];
            }
            else {
                selfEquation[otherKey] -= otherEquation[otherKey];
            }
        }
        return new Equation(selfEquation);
    };
    Equation.prototype.len = function () {
        var length = 0;
        for (var key in this.equation) {
            if (this.equation[key] !== 0) {
                length++;
            }
        }
        return length;
    };
    Equation.prototype.solve = function (solveFor) {
        if (!(solveFor in this.equation)) {
            throw new Error("".concat(solveFor, " does not exist"));
        }
        return new Substitution(solveFor, this.pop(solveFor).invert().div(this.equation[solveFor]));
    };
    Equation.prototype.solveForFirst = function () {
        var e_2, _a;
        try {
            for (var _b = __values(Object.entries(this.equation)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), key = _d[0], value = _d[1];
                if (Math.round(value) !== 0) {
                    return this.solve(key);
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    Equation.prototype.invert = function () {
        var flatCopy = __assign({}, this.equation);
        for (var key in flatCopy) {
            flatCopy[key] = -flatCopy[key];
        }
        return new Equation(flatCopy);
    };
    Equation.prototype.pop = function (key) {
        if (!(key in this.equation)) {
            throw new Error("".concat(key, " does not exist"));
        }
        var flatCopy = __assign({}, this.equation);
        delete flatCopy[key];
        return new Equation(flatCopy);
    };
    Equation.prototype.substitute = function (substitution, silent) {
        if (silent === void 0) { silent = true; }
        if (!(substitution.key in this.equation)) {
            if (silent) {
                return this;
            }
            throw new Error("".concat(substitution.key, " does not exist"));
        }
        return this.pop(substitution.key).add(substitution.substitute.mul(this.equation[substitution.key]));
    };
    Equation.prototype.toString = function () {
        return Object.entries(this.equation).map(function (_a) {
            var _b = __read(_a, 2), key = _b[0], value = _b[1];
            return "".concat(value).concat(key);
        }).join(" + ") + " = 0";
    };
    return Equation;
}());
export { Equation };
var SystemOfEquations = /** @class */ (function () {
    function SystemOfEquations(equationList) {
        this.equationList = equationList;
    }
    SystemOfEquations.prototype.toString = function () {
        return this.equationList.map(function (equation) { return equation.toString(); }).join("\n");
    };
    SystemOfEquations.prototype.isSimplified = function () {
        var e_3, _a;
        try {
            for (var _b = __values(this.equationList), _c = _b.next(); !_c.done; _c = _b.next()) {
                var equation = _c.value;
                if (equation.len() > 2) {
                    return false;
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return true;
    };
    SystemOfEquations.prototype.substituteSmallest = function () {
        var smallestEquation = this.equationList.reduce(function (prev, curr) { return prev.equation.length < curr.equation.length ? prev : curr; });
        var to_substitute = smallestEquation.solveForFirst();
        for (var i = 0; i < this.equationList.length; i++) {
            if (this.equationList[i] === smallestEquation) {
                continue;
            }
            this.equationList[i] = this.equationList[i].substitute(to_substitute);
        }
        this.equationList.splice(this.equationList.indexOf(smallestEquation), 1);
        this.equationList.push(smallestEquation);
    };
    SystemOfEquations.prototype.getVariables = function () {
        var e_4, _a;
        var variable_frequencies = {};
        try {
            for (var _b = __values(this.equationList), _c = _b.next(); !_c.done; _c = _b.next()) {
                var equation = _c.value;
                for (var variable in equation.equation) {
                    variable_frequencies[variable] = (variable_frequencies[variable] || 0) + 1;
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
        return Object.keys(variable_frequencies).sort(function (a, b) { return variable_frequencies[b] - variable_frequencies[a]; });
    };
    SystemOfEquations.prototype.isNatural = function (solution, factor) {
        var e_5, _a;
        var close_to_natural = function (n) { return Math.abs(Math.round(n) - n) < 0.00001; };
        try {
            for (var _b = __values(Object.entries(solution)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), key = _d[0], value = _d[1];
                if (!close_to_natural(value * factor)) {
                    return false;
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_5) throw e_5.error; }
        }
        return true;
    };
    SystemOfEquations.prototype.solve = function () {
        var e_6, _a, e_7, _b;
        var lgsHistory = [
            this.equationList.slice(),
        ];
        var iteration = 0;
        while (!this.isSimplified() && iteration < 200) {
            this.substituteSmallest();
            lgsHistory.push(this.equationList.slice());
            iteration++;
        }
        var solutions = {};
        var iterations = this.getVariables().length;
        var inventedKeys = new Set();
        for (var n = 0; n < iterations; n++) {
            // set the first key to 1
            var variables = this.getVariables();
            var yetToInvent = true;
            for (var solved in solutions) {
                if (!(solved in inventedKeys)) {
                    inventedKeys.add(solved);
                    yetToInvent = false;
                }
            }
            var variableToIter = variables.slice();
            if (!(variables[0] in solutions) && yetToInvent) {
                inventedKeys.add(variables[0]);
                solutions[variables[0]] = 1;
                variableToIter = variables.slice(1);
            }
            try {
                // substitute back from the one key set
                for (var variableToIter_1 = (e_6 = void 0, __values(variableToIter)), variableToIter_1_1 = variableToIter_1.next(); !variableToIter_1_1.done; variableToIter_1_1 = variableToIter_1.next()) {
                    var variable = variableToIter_1_1.value;
                    if (variable in solutions)
                        continue;
                    // Choose a variable to set to 1
                    var equations = this.equationList.slice();
                    try {
                        for (var _c = (e_7 = void 0, __values(equations.slice())), _d = _c.next(); !_d.done; _d = _c.next()) {
                            var equationWithVar = _d.value;
                            if (!(variable in equationWithVar.equation)) {
                                continue;
                            }
                            var existingSolution = solutions[variable];
                            // Solve for that variable in one of the equations
                            var substitution = equationWithVar.solve(variable);
                            var newSolution = substitution.newSolution(solutions);
                            if (newSolution === undefined)
                                continue;
                            if (existingSolution !== undefined && newSolution !== existingSolution) {
                                return new LgsResult(lgsHistory, {});
                            }
                            var index = this.equationList.indexOf(equationWithVar);
                            if (index > -1) {
                                this.equationList.splice(index, 1);
                            }
                            solutions[variable] = newSolution;
                        }
                    }
                    catch (e_7_1) { e_7 = { error: e_7_1 }; }
                    finally {
                        try {
                            if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                        }
                        finally { if (e_7) throw e_7.error; }
                    }
                    lgsHistory.push(equations.slice());
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (variableToIter_1_1 && !variableToIter_1_1.done && (_a = variableToIter_1.return)) _a.call(variableToIter_1);
                }
                finally { if (e_6) throw e_6.error; }
            }
        }
        // find the correct factor
        var factor = 1;
        for (factor = 1; factor < 2000; factor++) {
            if (this.isNatural(solutions, factor)) {
                break;
            }
        }
        // apply the factor
        for (var key in solutions) {
            solutions[key] = Math.round(factor * solutions[key]);
        }
        return new LgsResult(lgsHistory, solutions);
    };
    return SystemOfEquations;
}());
export { SystemOfEquations };
//# sourceMappingURL=solveLgs.js.map