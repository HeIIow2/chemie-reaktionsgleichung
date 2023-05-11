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
    Substitution.prototype.newSolution = function (current_solution) {
        var e_1, _a;
        var possible_solution = 0;
        try {
            for (var _b = __values(Object.entries(this.substitute.equation)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), key = _d[0], value = _d[1];
                if (!(key in current_solution)) {
                    return null;
                }
                possible_solution += value * current_solution[key];
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
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
        var _a, e_6, _b, e_7, _c;
        var iteration = 0;
        while (!this.isSimplified() && iteration < 200) {
            this.substituteSmallest();
            iteration++;
        }
        // set the first key to 1
        var variables = this.getVariables();
        var solutions = (_a = {}, _a[variables[0]] = 1, _a);
        try {
            // substitute back from the one key set
            for (var _d = __values(variables.slice(1)), _e = _d.next(); !_e.done; _e = _d.next()) {
                var variable = _e.value;
                // Choose a variable to set to 1
                var equations = this.equationList.slice();
                try {
                    for (var equations_1 = (e_7 = void 0, __values(equations)), equations_1_1 = equations_1.next(); !equations_1_1.done; equations_1_1 = equations_1.next()) {
                        var equationWithVar = equations_1_1.value;
                        if (!(variable in equationWithVar.equation)) {
                            continue;
                        }
                        var existingSolution = solutions[variable];
                        // Solve for that variable in one of the equations
                        var substitution = equationWithVar.solve(variable);
                        var newSolution = substitution.newSolution(solutions);
                        if (newSolution === null) {
                            continue;
                        }
                        if (existingSolution !== null && newSolution !== existingSolution) {
                            return {};
                        }
                        solutions[variable] = newSolution;
                    }
                }
                catch (e_7_1) { e_7 = { error: e_7_1 }; }
                finally {
                    try {
                        if (equations_1_1 && !equations_1_1.done && (_c = equations_1.return)) _c.call(equations_1);
                    }
                    finally { if (e_7) throw e_7.error; }
                }
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_e && !_e.done && (_b = _d.return)) _b.call(_d);
            }
            finally { if (e_6) throw e_6.error; }
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
        return solutions;
    };
    return SystemOfEquations;
}());
export { SystemOfEquations };

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zY3JpcHRzL3NvbHZlTGdzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7SUFJSSxzQkFBWSxHQUFXLEVBQUUsVUFBb0I7UUFDekMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztJQUNqQyxDQUFDO0lBRUQsK0JBQVEsR0FBUjtRQUNJLE9BQU8sVUFBRyxJQUFJLENBQUMsR0FBRyxnQkFBTSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDO2FBQ3ZELEdBQUcsQ0FBQyxVQUFDLEVBQVk7Z0JBQVosS0FBQSxhQUFZLEVBQVgsR0FBRyxRQUFBLEVBQUUsS0FBSyxRQUFBO1lBQU0sT0FBQSxVQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFNBQUcsR0FBRyxDQUFFO1FBQTNCLENBQTJCLENBQUM7YUFDeEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFFLENBQUM7SUFDckIsQ0FBQztJQUVELGtDQUFXLEdBQVgsVUFBWSxnQkFBMkM7O1FBQ25ELElBQUksaUJBQWlCLEdBQUcsQ0FBQyxDQUFDOztZQUUxQixLQUEyQixJQUFBLEtBQUEsU0FBQSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUEsZ0JBQUEsNEJBQUU7Z0JBQTFELElBQUEsS0FBQSxtQkFBWSxFQUFYLEdBQUcsUUFBQSxFQUFFLEtBQUssUUFBQTtnQkFDbEIsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLGdCQUFnQixDQUFDLEVBQUU7b0JBQ2hDLE9BQU8sSUFBSSxDQUFDO2lCQUNYO2dCQUVELGlCQUFpQixJQUFJLEtBQUssR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUN0RDs7Ozs7Ozs7O1FBRUQsT0FBTyxpQkFBaUIs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Wjt3QkFFRCxJQUFJLGdCQUFnQixLQUFLLElBQUksSUFBSSxXQUFXLEtBQUssZ0JBQWdCLEVBQUU7NEJBQy9ELE9BQU8sRUFBRSxDQUFDO3lCQUNiO3dCQUVELFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxXQUFXLENBQUM7cUJBQ3JDOzs7Ozs7Ozs7YUFDSjs7Ozs7Ozs7O1FBRUQsMEJBQTBCO1FBQzFCLElBQUksTUFBTSxHQUFXLENBQUMsQ0FBQztRQUN2QixLQUFLLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLElBQUksRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUN0QyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxFQUFFO2dCQUNuQyxNQUFNO2FBQ1Q7U0FDSjtRQUVELG1CQUFtQjtRQUNuQixLQUFLLElBQU0sR0FBRyxJQUFJLFNBQVMsRUFBRTtZQUN6QixTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7U0FDeEQ7UUFFRCxPQUFPLFNBQVMsQ0FBQTtJQUNwQixDQUFDO0lBQ0wsd0JBQUM7QUFBRCxDQWxIQSxBQWtIQyxJQUFBIiwiZmlsZSI6InNjcmlwdHMvc29sdmVMZ3MuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBTdWJzdGl0dXRpb24ge1xuICAgIGtleTogc3RyaW5nO1xuICAgIHN1YnN0aXR1dGU6IEVxdWF0aW9uO1xuXG4gICAgY29uc3RydWN0b3Ioa2V5OiBzdHJpbmcsIHN1YnN0aXR1dGU6IEVxdWF0aW9uKSB7XG4gICAgICAgIHRoaXMua2V5ID0ga2V5O1xuICAgICAgICB0aGlzLnN1YnN0aXR1dGUgPSBzdWJzdGl0dXRlO1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBgJHt0aGlzLmtleX0gPSAke09iamVjdC5lbnRyaWVzKHRoaXMuc3Vic3RpdHV0ZS5lcXVhdGlvbilcbiAgICAgICAgICAgICAgICAubWFwKChba2V5LCB2YWx1ZV0pID0+IGAke3ZhbHVlLnRvRml4ZWQoMil9JHtrZXl9YClcbiAgICAgICAgICAuam9pbihcIiArIFwiKX1gO1xuICAgIH1cbiAgICBcbiAgICBuZXdTb2x1dGlvbihjdXJyZW50X3NvbHV0aW9uOiB7IFtrZXk6IHN0cmluZ106IG51bWJlciB9KTogbnVtYmVyIHwgbnVsbCB7XG4gICAgICAgIGxldCBwb3NzaWJsZV9zb2x1dGlvbiA9IDA7XG5cbiAgICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXModGhpcy5zdWJzdGl0dXRlLmVxdWF0aW9uKSkge1xuICAgICAgICAgICAgaWYgKCEoa2V5IGluIGN1cnJlbnRfc29sdXRpb24pKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcG9zc2libGVfc29sdXRpb24gKz0gdmFsdWUgKiBjdXJyZW50X3NvbHV0aW9uW2tleV07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcG9zc2libGVfc29sdXRpb247XG4gICAgfVxufVxuXG5cbmV4cG9ydCBjbGFzcyBFcXVhdGlvbiB7XG4gICAgZXF1YXRpb246IHsgW2tleTogc3RyaW5nXTogbnVtYmVyIH07XG5cbiAgICBjb25zdHJ1Y3RvcihlcXVhdGlvbjogeyBba2V5OiBzdHJpbmddOiBudW1iZXIgfSkge1xuICAgICAgICB0aGlzLmVxdWF0aW9uID0gZXF1YXRpb247XG5cbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gdGhpcy5lcXVhdGlvbikge1xuICAgICAgICAgICAgaWYgKHRoaXMuZXF1YXRpb25ba2V5XSA9PSAwKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuZXF1YXRpb25ba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRpdihkaXZpc29yOiBudW1iZXIpOiBFcXVhdGlvbiB7XG4gICAgICAgIGNvbnN0IGZsYXRDb3B5ID0geyAuLi50aGlzLmVxdWF0aW9uIH07XG5cbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gZmxhdENvcHkpIHtcbiAgICAgICAgICAgIGZsYXRDb3B5W2tleV0gLz0gZGl2aXNvcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgRXF1YXRpb24oZmxhdENvcHkpO1xuICAgIH1cblxuICAgIG11bChmYWN0b3I6IG51bWJlcik6IEVxdWF0aW9uIHtcbiAgICAgICAgY29uc3QgZmxhdENvcHkgPSB7IC4uLnRoaXMuZXF1YXRpb24gfTtcblxuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBmbGF0Q29weSkge1xuICAgICAgICAgICAgZmxhdENvcHlba2V5XSAqPSBmYWN0b3I7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IEVxdWF0aW9uKGZsYXRDb3B5KTtcbiAgICB9XG5cbiAgICBhZGQob3RoZXI6IEVxdWF0aW9uKTogRXF1YXRpb24ge1xuICAgICAgICBjb25zdCBzZWxmRXF1YXRpb24gPSB7IC4uLnRoaXMuZXF1YXRpb24gfTtcbiAgICAgICAgY29uc3Qgb3RoZXJFcXVhdGlvbiA9IHsgLi4ub3RoZXIuZXF1YXRpb24gfTtcblxuICAgICAgICBmb3IgKGNvbnN0IG90aGVyS2V5IGluIG90aGVyRXF1YXRpb24pIHtcbiAgICAgICAgICAgIGlmICghKG90aGVyS2V5IGluIHNlbGZFcXVhdGlvbikpIHtcbiAgICAgICAgICAgICAgICBzZWxmRXF1YXRpb25bb3RoZXJLZXldID0gb3RoZXJFcXVhdGlvbltvdGhlcktleV07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlbGZFcXVhdGlvbltvdGhlcktleV0gKz0gb3RoZXJFcXVhdGlvbltvdGhlcktleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IEVxdWF0aW9uKHNlbGZFcXVhdGlvbik7XG4gICAgfVxuXG4gICAgc3ViKG90aGVyOiBFcXVhdGlvbik6IEVxdWF0aW9uIHtcbiAgICAgICAgY29uc3Qgc2VsZkVxdWF0aW9uID0geyAuLi50aGlzLmVxdWF0aW9uIH07XG4gICAgICAgIGNvbnN0IG90aGVyRXF1YXRpb24gPSB7IC4uLm90aGVyLmVxdWF0aW9uIH07XG5cbiAgICAgICAgZm9yIChjb25zdCBvdGhlcktleSBpbiBvdGhlckVxdWF0aW9uKSB7XG4gICAgICAgICAgICBpZiAoIShvdGhlcktleSBpbiBzZWxmRXF1YXRpb24pKSB7XG4gICAgICAgICAgICAgICAgc2VsZkVxdWF0aW9uW290aGVyS2V5XSA9IC1vdGhlckVxdWF0aW9uW290aGVyS2V5XTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VsZkVxdWF0aW9uW290aGVyS2V5XSAtPSBvdGhlckVxdWF0aW9uW290aGVyS2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgRXF1YXRpb24oc2VsZkVxdWF0aW9uKTtcbiAgICB9XG5cbiAgICBsZW4oKTogbnVtYmVyIHtcbiAgICAgICAgbGV0IGxlbmd0aCA9IDA7XG5cbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gdGhpcy5lcXVhdGlvbikge1xuICAgICAgICAgICAgaWYgKHRoaXMuZXF1YXRpb25ba2V5XSAhPT0gMCkge1xuICAgICAgICAgICAgICAgIGxlbmd0aCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGxlbmd0aDtcbiAgICB9XG5cbiAgICBzb2x2ZShzb2x2ZUZvcjogc3RyaW5nKTogU3Vic3RpdHV0aW9uIHtcbiAgICAgICAgaWYgKCEoc29sdmVGb3IgaW4gdGhpcy5lcXVhdGlvbikpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJHtzb2x2ZUZvcn0gZG9lcyBub3QgZXhpc3RgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgU3Vic3RpdHV0aW9uKFxuICAgICAgICAgICAgc29sdmVGb3IsXG4gICAgICAgICAgICB0aGlzLnBvcChzb2x2ZUZvcikuaW52ZXJ0KCkuZGl2KHRoaXMuZXF1YXRpb25bc29sdmVGb3JdKVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHNvbHZlRm9yRmlyc3QoKTogU3Vic3RpdHV0aW9uIHtcbiAgICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXModGhpcy5lcXVhdGlvbikpIHtcbiAgICAgICAgICAgIGlmIChNYXRoLnJvdW5kKHZhbHVlKSAhPT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNvbHZlKGtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpbnZlcnQoKTogRXF1YXRpb24ge1xuICAgICAgICBjb25zdCBmbGF0Q29weSA9IHsgLi4udGhpcy5lcXVhdGlvbiB9O1xuXG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIGZsYXRDb3B5KSB7XG4gICAgICAgICAgICBmbGF0Q29weVtrZXldID0gLWZsYXRDb3B5W2tleV07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IEVxdWF0aW9uKGZsYXRDb3B5KTtcbiAgICB9XG5cbiAgICBwb3Aoa2V5OiBzdHJpbmcpOiBFcXVhdGlvbiB7XG4gICAgICAgIGlmICghKGtleSBpbiB0aGlzLmVxdWF0aW9uKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAke2tleX0gZG9lcyBub3QgZXhpc3RgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZsYXRDb3B5ID0geyAuLi50aGlzLmVxdWF0aW9uIH07XG4gICAgICAgIGRlbGV0ZSBmbGF0Q29weSBba2V5XTtcblxuICAgICAgICByZXR1cm4gbmV3IEVxdWF0aW9uKGZsYXRDb3B5KTtcbiAgICB9XG5cbiAgICBzdWJzdGl0dXRlKHN1YnN0aXR1dGlvbjogU3Vic3RpdHV0aW9uLCBzaWxlbnQgPSB0cnVlKTogRXF1YXRpb24ge1xuICAgICAgICBpZiAoIShzdWJzdGl0dXRpb24ua2V5IGluIHRoaXMuZXF1YXRpb24pKSB7XG4gICAgICAgICAgICBpZiAoc2lsZW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7c3Vic3RpdHV0aW9uLmtleX0gZG9lcyBub3QgZXhpc3RgKTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICByZXR1cm4gdGhpcy5wb3Aoc3Vic3RpdHV0aW9uLmtleSkuYWRkKHN1YnN0aXR1dGlvbi5zdWJzdGl0dXRlLm11bCh0aGlzLmVxdWF0aW9uW3N1YnN0aXR1dGlvbi5rZXldKSk7XG4gICAgfVxuICAgIFxuXG4gICAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5lbnRyaWVzKHRoaXMuZXF1YXRpb24pLm1hcCgoW2tleSwgdmFsdWVdKSA9PiBgJHt2YWx1ZX0ke2tleX1gKS5qb2luKFwiICsgXCIpICsgXCIgPSAwXCI7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgU3lzdGVtT2ZFcXVhdGlvbnMge1xuICAgIGVxdWF0aW9uTGlzdDogRXF1YXRpb25bXVxuXG4gICAgY29uc3RydWN0b3IoZXF1YXRpb25MaXN0OiBFcXVhdGlvbltdKSB7XG4gICAgICAgIHRoaXMuZXF1YXRpb25MaXN0ID0gZXF1YXRpb25MaXN0O1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmVxdWF0aW9uTGlzdC5tYXAoZXF1YXRpb24gPT4gZXF1YXRpb24udG9TdHJpbmcoKSkuam9pbihcIlxcblwiKTtcbiAgICB9XG5cbiAgICBpc1NpbXBsaWZpZWQoKTogYm9vbGVhbiB7XG4gICAgICAgIGZvciAoY29uc3QgZXF1YXRpb24gb2YgdGhpcy5lcXVhdGlvbkxpc3QpIHtcbiAgICAgICAgICAgIGlmIChlcXVhdGlvbi5sZW4oKSA+IDIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgc3Vic3RpdHV0ZVNtYWxsZXN0KCk6IHZvaWQge1xuICAgICAgICBjb25zdCBzbWFsbGVzdEVxdWF0aW9uID0gdGhpcy5lcXVhdGlvbkxpc3QucmVkdWNlKChwcmV2LCBjdXJyKSA9PiBwcmV2LmVxdWF0aW9uLmxlbmd0aCA8IGN1cnIuZXF1YXRpb24ubGVuZ3RoID8gcHJldiA6IGN1cnIpO1xuICAgICAgICBjb25zdCB0b19zdWJzdGl0dXRlID0gc21hbGxlc3RFcXVhdGlvbi5zb2x2ZUZvckZpcnN0KCk7XG4gICAgXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5lcXVhdGlvbkxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAodGhpcy5lcXVhdGlvbkxpc3RbaV0gPT09IHNtYWxsZXN0RXF1YXRpb24pIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICB0aGlzLmVxdWF0aW9uTGlzdFtpXSA9IHRoaXMuZXF1YXRpb25MaXN0W2ldLnN1YnN0aXR1dGUodG9fc3Vic3RpdHV0ZSk7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgdGhpcy5lcXVhdGlvbkxpc3Quc3BsaWNlKHRoaXMuZXF1YXRpb25MaXN0LmluZGV4T2Yoc21hbGxlc3RFcXVhdGlvbiksIDEpO1xuICAgICAgICB0aGlzLmVxdWF0aW9uTGlzdC5wdXNoKHNtYWxsZXN0RXF1YXRpb24pO1xuICAgICAgfVxuICAgIFxuICAgICAgZ2V0VmFyaWFibGVzKCk6IHN0cmluZ1tdIHtcbiAgICAgICAgY29uc3QgdmFyaWFibGVfZnJlcXVlbmNpZXM6IHtba2V5OiBzdHJpbmddOiBudW1iZXJ9ID0ge307XG4gICAgXG4gICAgICAgIGZvciAoY29uc3QgZXF1YXRpb24gb2YgdGhpcy5lcXVhdGlvbkxpc3QpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgdmFyaWFibGUgaW4gZXF1YXRpb24uZXF1YXRpb24pIHtcbiAgICAgICAgICAgICAgICB2YXJpYWJsZV9mcmVxdWVuY2llc1t2YXJpYWJsZV0gPSAodmFyaWFibGVfZnJlcXVlbmNpZXNbdmFyaWFibGVdIHx8IDApICsgMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIFxuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXModmFyaWFibGVfZnJlcXVlbmNpZXMpLnNvcnQoKGEsIGIpID0+IHZhcmlhYmxlX2ZyZXF1ZW5jaWVzW2JdIC0gdmFyaWFibGVfZnJlcXVlbmNpZXNbYV0pO1xuICAgICAgfVxuICAgIFxuICAgIGlzTmF0dXJhbChzb2x1dGlvbjoge1trZXk6IHN0cmluZ106IG51bWJlcn0sIGZhY3RvcjogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IGNsb3NlX3RvX25hdHVyYWwgPSAobjogbnVtYmVyKSA9PiBNYXRoLmFicyhNYXRoLnJvdW5kKG4pIC0gbikgPCAwLjAwMDAxO1xuICAgIFxuICAgICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhzb2x1dGlvbikpIHtcbiAgICAgICAgICAgIGlmICghY2xvc2VfdG9fbmF0dXJhbCh2YWx1ZSAqIGZhY3RvcikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIFxuICAgIHNvbHZlKCk6IHtba2V5OiBzdHJpbmddOiBudW1iZXJ9IHtcbiAgICAgICAgbGV0IGl0ZXJhdGlvbiA9IDA7XG4gICAgICAgIHdoaWxlICghdGhpcy5pc1NpbXBsaWZpZWQoKSAmJiBpdGVyYXRpb24gPCAyMDApIHtcbiAgICAgICAgICAgIHRoaXMuc3Vic3RpdHV0ZVNtYWxsZXN0KCk7XG5cbiAgICAgICAgICAgIGl0ZXJhdGlvbisrO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc2V0IHRoZSBmaXJzdCBrZXkgdG8gMVxuICAgICAgICBjb25zdCB2YXJpYWJsZXMgPSB0aGlzLmdldFZhcmlhYmxlcygpO1xuICAgICAgICBjb25zdCBzb2x1dGlvbnM6IHtba2V5OiBzdHJpbmddOiBudW1iZXJ9ID0ge1t2YXJpYWJsZXNbMF1dOiAxfTtcblxuICAgICAgICAvLyBzdWJzdGl0dXRlIGJhY2sgZnJvbSB0aGUgb25lIGtleSBzZXRcbiAgICAgICAgZm9yIChjb25zdCB2YXJpYWJsZSBvZiB2YXJpYWJsZXMuc2xpY2UoMSkpIHtcbiAgICAgICAgICAgIC8vIENob29zZSBhIHZhcmlhYmxlIHRvIHNldCB0byAxXG4gICAgICAgICAgICBjb25zdCBlcXVhdGlvbnMgPSB0aGlzLmVxdWF0aW9uTGlzdC5zbGljZSgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGVxdWF0aW9uV2l0aFZhciBvZiBlcXVhdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBpZiAoISh2YXJpYWJsZSBpbiBlcXVhdGlvbldpdGhWYXIuZXF1YXRpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nU29sdXRpb24gPSBzb2x1dGlvbnNbdmFyaWFibGVdO1xuXG4gICAgICAgICAgICAgICAgLy8gU29sdmUgZm9yIHRoYXQgdmFyaWFibGUgaW4gb25lIG9mIHRoZSBlcXVhdGlvbnNcbiAgICAgICAgICAgICAgICBjb25zdCBzdWJzdGl0dXRpb24gPSBlcXVhdGlvbldpdGhWYXIuc29sdmUodmFyaWFibGUpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgbmV3U29sdXRpb24gPSBzdWJzdGl0dXRpb24ubmV3U29sdXRpb24oc29sdXRpb25zKTtcbiAgICAgICAgICAgICAgICBpZiAobmV3U29sdXRpb24gPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGV4aXN0aW5nU29sdXRpb24gIT09IG51bGwgJiYgbmV3U29sdXRpb24gIT09IGV4aXN0aW5nU29sdXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHNvbHV0aW9uc1t2YXJpYWJsZV0gPSBuZXdTb2x1dGlvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGZpbmQgdGhlIGNvcnJlY3QgZmFjdG9yXG4gICAgICAgIGxldCBmYWN0b3I6IG51bWJlciA9IDE7XG4gICAgICAgIGZvciAoZmFjdG9yID0gMTsgZmFjdG9yIDwgMjAwMDsgZmFjdG9yKyspIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzTmF0dXJhbChzb2x1dGlvbnMsIGZhY3RvcikpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGFwcGx5IHRoZSBmYWN0b3JcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gc29sdXRpb25zKSB7XG4gICAgICAgICAgICBzb2x1dGlvbnNba2V5XSA9IE1hdGgucm91bmQoZmFjdG9yICogc29sdXRpb25zW2tleV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNvbHV0aW9uc1xuICAgIH1cbn1cbiAiXX0=
