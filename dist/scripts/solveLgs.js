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
                    return undefined;
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
                        if (newSolution === undefined) {
                            continue;
                        }
                        if (existingSolution !== undefined && newSolution !== existingSolution) {
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zY3JpcHRzL3NvbHZlTGdzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7SUFJSSxzQkFBWSxHQUFXLEVBQUUsVUFBb0I7UUFDekMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztJQUNqQyxDQUFDO0lBRUQsK0JBQVEsR0FBUjtRQUNJLE9BQU8sVUFBRyxJQUFJLENBQUMsR0FBRyxnQkFBTSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDO2FBQ3ZELEdBQUcsQ0FBQyxVQUFDLEVBQVk7Z0JBQVosS0FBQSxhQUFZLEVBQVgsR0FBRyxRQUFBLEVBQUUsS0FBSyxRQUFBO1lBQU0sT0FBQSxVQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFNBQUcsR0FBRyxDQUFFO1FBQTNCLENBQTJCLENBQUM7YUFDeEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFFLENBQUM7SUFDckIsQ0FBQztJQUVELGtDQUFXLEdBQVgsVUFBWSxnQkFBMkM7O1FBQ25ELElBQUksaUJBQWlCLEdBQUcsQ0FBQyxDQUFDOztZQUUxQixLQUEyQixJQUFBLEtBQUEsU0FBQSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUEsZ0JBQUEsNEJBQUU7Z0JBQTFELElBQUEsS0FBQSxtQkFBWSxFQUFYLEdBQUcsUUFBQSxFQUFFLEtBQUssUUFBQTtnQkFDbEIsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLGdCQUFnQixDQUFDLEVBQUU7b0JBQ2hDLE9BQU8sU0FBUyxDQUFDO2lCQUNoQjtnQkFFRCxpQkFBaUIsSUFBSSxLQUFLLEdBQUcsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDdEQ7Ozs7Ozs7OztRQUVELElBQUksaUJBQWlC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O3dCQUN4RCxJQUFJLFdBQVcsS0FBSyxTQUFTLEVBQUU7NEJBQzNCLFNBQVM7eUJBQ1o7d0JBRUQsSUFBSSxnQkFBZ0IsS0FBSyxTQUFTLElBQUksV0FBVyxLQUFLLGdCQUFnQixFQUFFOzRCQUNwRSxPQUFPLEVBQUUsQ0FBQzt5QkFDYjt3QkFFRCxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsV0FBVyxDQUFDO3FCQUNyQzs7Ozs7Ozs7O2FBQ0o7Ozs7Ozs7OztRQUVELDBCQUEwQjtRQUMxQixJQUFJLE1BQU0sR0FBVyxDQUFDLENBQUM7UUFDdkIsS0FBSyxNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxJQUFJLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDdEMsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsRUFBRTtnQkFDbkMsTUFBTTthQUNUO1NBQ0o7UUFFRCxtQkFBbUI7UUFDbkIsS0FBSyxJQUFNLEdBQUcsSUFBSSxTQUFTLEVBQUU7WUFDekIsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQ3hEO1FBRUQsT0FBTyxTQUFTLENBQUE7SUFDcEIsQ0FBQztJQUNMLHdCQUFDO0FBQUQsQ0FsSEEsQUFrSEMsSUFBQSIsImZpbGUiOiJzY3JpcHRzL3NvbHZlTGdzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgU3Vic3RpdHV0aW9uIHtcbiAgICBrZXk6IHN0cmluZztcbiAgICBzdWJzdGl0dXRlOiBFcXVhdGlvbjtcblxuICAgIGNvbnN0cnVjdG9yKGtleTogc3RyaW5nLCBzdWJzdGl0dXRlOiBFcXVhdGlvbikge1xuICAgICAgICB0aGlzLmtleSA9IGtleTtcbiAgICAgICAgdGhpcy5zdWJzdGl0dXRlID0gc3Vic3RpdHV0ZTtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gYCR7dGhpcy5rZXl9ID0gJHtPYmplY3QuZW50cmllcyh0aGlzLnN1YnN0aXR1dGUuZXF1YXRpb24pXG4gICAgICAgICAgICAgICAgLm1hcCgoW2tleSwgdmFsdWVdKSA9PiBgJHt2YWx1ZS50b0ZpeGVkKDIpfSR7a2V5fWApXG4gICAgICAgICAgLmpvaW4oXCIgKyBcIil9YDtcbiAgICB9XG4gICAgXG4gICAgbmV3U29sdXRpb24oY3VycmVudF9zb2x1dGlvbjogeyBba2V5OiBzdHJpbmddOiBudW1iZXIgfSk6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gICAgICAgIGxldCBwb3NzaWJsZV9zb2x1dGlvbiA9IDA7XG5cbiAgICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXModGhpcy5zdWJzdGl0dXRlLmVxdWF0aW9uKSkge1xuICAgICAgICAgICAgaWYgKCEoa2V5IGluIGN1cnJlbnRfc29sdXRpb24pKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBwb3NzaWJsZV9zb2x1dGlvbiArPSB2YWx1ZSAqIGN1cnJlbnRfc29sdXRpb25ba2V5XTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwb3NzaWJsZV9zb2x1dGlvbiA9PT0gMCkgcmV0dXJuIHVuZGVmaW5lZFxuXG4gICAgICAgIHJldHVybiBwb3NzaWJsZV9zb2x1dGlvbjtcbiAgICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIEVxdWF0aW9uIHtcbiAgICBlcXVhdGlvbjogeyBba2V5OiBzdHJpbmddOiBudW1iZXIgfTtcblxuICAgIGNvbnN0cnVjdG9yKGVxdWF0aW9uOiB7IFtrZXk6IHN0cmluZ106IG51bWJlciB9KSB7XG4gICAgICAgIHRoaXMuZXF1YXRpb24gPSBlcXVhdGlvbjtcblxuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiB0aGlzLmVxdWF0aW9uKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5lcXVhdGlvbltrZXldID09IDApIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5lcXVhdGlvbltrZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZGl2KGRpdmlzb3I6IG51bWJlcik6IEVxdWF0aW9uIHtcbiAgICAgICAgY29uc3QgZmxhdENvcHkgPSB7IC4uLnRoaXMuZXF1YXRpb24gfTtcblxuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBmbGF0Q29weSkge1xuICAgICAgICAgICAgZmxhdENvcHlba2V5XSAvPSBkaXZpc29yO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBFcXVhdGlvbihmbGF0Q29weSk7XG4gICAgfVxuXG4gICAgbXVsKGZhY3RvcjogbnVtYmVyKTogRXF1YXRpb24ge1xuICAgICAgICBjb25zdCBmbGF0Q29weSA9IHsgLi4udGhpcy5lcXVhdGlvbiB9O1xuXG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIGZsYXRDb3B5KSB7XG4gICAgICAgICAgICBmbGF0Q29weVtrZXldICo9IGZhY3RvcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgRXF1YXRpb24oZmxhdENvcHkpO1xuICAgIH1cblxuICAgIGFkZChvdGhlcjogRXF1YXRpb24pOiBFcXVhdGlvbiB7XG4gICAgICAgIGNvbnN0IHNlbGZFcXVhdGlvbiA9IHsgLi4udGhpcy5lcXVhdGlvbiB9O1xuICAgICAgICBjb25zdCBvdGhlckVxdWF0aW9uID0geyAuLi5vdGhlci5lcXVhdGlvbiB9O1xuXG4gICAgICAgIGZvciAoY29uc3Qgb3RoZXJLZXkgaW4gb3RoZXJFcXVhdGlvbikge1xuICAgICAgICAgICAgaWYgKCEob3RoZXJLZXkgaW4gc2VsZkVxdWF0aW9uKSkge1xuICAgICAgICAgICAgICAgIHNlbGZFcXVhdGlvbltvdGhlcktleV0gPSBvdGhlckVxdWF0aW9uW290aGVyS2V5XTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VsZkVxdWF0aW9uW290aGVyS2V5XSArPSBvdGhlckVxdWF0aW9uW290aGVyS2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgRXF1YXRpb24oc2VsZkVxdWF0aW9uKTtcbiAgICB9XG5cbiAgICBzdWIob3RoZXI6IEVxdWF0aW9uKTogRXF1YXRpb24ge1xuICAgICAgICBjb25zdCBzZWxmRXF1YXRpb24gPSB7IC4uLnRoaXMuZXF1YXRpb24gfTtcbiAgICAgICAgY29uc3Qgb3RoZXJFcXVhdGlvbiA9IHsgLi4ub3RoZXIuZXF1YXRpb24gfTtcblxuICAgICAgICBmb3IgKGNvbnN0IG90aGVyS2V5IGluIG90aGVyRXF1YXRpb24pIHtcbiAgICAgICAgICAgIGlmICghKG90aGVyS2V5IGluIHNlbGZFcXVhdGlvbikpIHtcbiAgICAgICAgICAgICAgICBzZWxmRXF1YXRpb25bb3RoZXJLZXldID0gLW90aGVyRXF1YXRpb25bb3RoZXJLZXldO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWxmRXF1YXRpb25bb3RoZXJLZXldIC09IG90aGVyRXF1YXRpb25bb3RoZXJLZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBFcXVhdGlvbihzZWxmRXF1YXRpb24pO1xuICAgIH1cblxuICAgIGxlbigpOiBudW1iZXIge1xuICAgICAgICBsZXQgbGVuZ3RoID0gMDtcblxuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiB0aGlzLmVxdWF0aW9uKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5lcXVhdGlvbltrZXldICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgbGVuZ3RoKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbGVuZ3RoO1xuICAgIH1cblxuICAgIHNvbHZlKHNvbHZlRm9yOiBzdHJpbmcpOiBTdWJzdGl0dXRpb24ge1xuICAgICAgICBpZiAoIShzb2x2ZUZvciBpbiB0aGlzLmVxdWF0aW9uKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAke3NvbHZlRm9yfSBkb2VzIG5vdCBleGlzdGApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBTdWJzdGl0dXRpb24oXG4gICAgICAgICAgICBzb2x2ZUZvcixcbiAgICAgICAgICAgIHRoaXMucG9wKHNvbHZlRm9yKS5pbnZlcnQoKS5kaXYodGhpcy5lcXVhdGlvbltzb2x2ZUZvcl0pXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgc29sdmVGb3JGaXJzdCgpOiBTdWJzdGl0dXRpb24ge1xuICAgICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyh0aGlzLmVxdWF0aW9uKSkge1xuICAgICAgICAgICAgaWYgKE1hdGgucm91bmQodmFsdWUpICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc29sdmUoa2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGludmVydCgpOiBFcXVhdGlvbiB7XG4gICAgICAgIGNvbnN0IGZsYXRDb3B5ID0geyAuLi50aGlzLmVxdWF0aW9uIH07XG5cbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gZmxhdENvcHkpIHtcbiAgICAgICAgICAgIGZsYXRDb3B5W2tleV0gPSAtZmxhdENvcHlba2V5XTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgRXF1YXRpb24oZmxhdENvcHkpO1xuICAgIH1cblxuICAgIHBvcChrZXk6IHN0cmluZyk6IEVxdWF0aW9uIHtcbiAgICAgICAgaWYgKCEoa2V5IGluIHRoaXMuZXF1YXRpb24pKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7a2V5fSBkb2VzIG5vdCBleGlzdGApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZmxhdENvcHkgPSB7IC4uLnRoaXMuZXF1YXRpb24gfTtcbiAgICAgICAgZGVsZXRlIGZsYXRDb3B5IFtrZXldO1xuXG4gICAgICAgIHJldHVybiBuZXcgRXF1YXRpb24oZmxhdENvcHkpO1xuICAgIH1cblxuICAgIHN1YnN0aXR1dGUoc3Vic3RpdHV0aW9uOiBTdWJzdGl0dXRpb24sIHNpbGVudCA9IHRydWUpOiBFcXVhdGlvbiB7XG4gICAgICAgIGlmICghKHN1YnN0aXR1dGlvbi5rZXkgaW4gdGhpcy5lcXVhdGlvbikpIHtcbiAgICAgICAgICAgIGlmIChzaWxlbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJHtzdWJzdGl0dXRpb24ua2V5fSBkb2VzIG5vdCBleGlzdGApO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIHJldHVybiB0aGlzLnBvcChzdWJzdGl0dXRpb24ua2V5KS5hZGQoc3Vic3RpdHV0aW9uLnN1YnN0aXR1dGUubXVsKHRoaXMuZXF1YXRpb25bc3Vic3RpdHV0aW9uLmtleV0pKTtcbiAgICB9XG4gICAgXG5cbiAgICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmVudHJpZXModGhpcy5lcXVhdGlvbikubWFwKChba2V5LCB2YWx1ZV0pID0+IGAke3ZhbHVlfSR7a2V5fWApLmpvaW4oXCIgKyBcIikgKyBcIiA9IDBcIjtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTeXN0ZW1PZkVxdWF0aW9ucyB7XG4gICAgZXF1YXRpb25MaXN0OiBFcXVhdGlvbltdXG5cbiAgICBjb25zdHJ1Y3RvcihlcXVhdGlvbkxpc3Q6IEVxdWF0aW9uW10pIHtcbiAgICAgICAgdGhpcy5lcXVhdGlvbkxpc3QgPSBlcXVhdGlvbkxpc3Q7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXF1YXRpb25MaXN0Lm1hcChlcXVhdGlvbiA9PiBlcXVhdGlvbi50b1N0cmluZygpKS5qb2luKFwiXFxuXCIpO1xuICAgIH1cblxuICAgIGlzU2ltcGxpZmllZCgpOiBib29sZWFuIHtcbiAgICAgICAgZm9yIChjb25zdCBlcXVhdGlvbiBvZiB0aGlzLmVxdWF0aW9uTGlzdCkge1xuICAgICAgICAgICAgaWYgKGVxdWF0aW9uLmxlbigpID4gMikge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBzdWJzdGl0dXRlU21hbGxlc3QoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHNtYWxsZXN0RXF1YXRpb24gPSB0aGlzLmVxdWF0aW9uTGlzdC5yZWR1Y2UoKHByZXYsIGN1cnIpID0+IHByZXYuZXF1YXRpb24ubGVuZ3RoIDwgY3Vyci5lcXVhdGlvbi5sZW5ndGggPyBwcmV2IDogY3Vycik7XG4gICAgICAgIGNvbnN0IHRvX3N1YnN0aXR1dGUgPSBzbWFsbGVzdEVxdWF0aW9uLnNvbHZlRm9yRmlyc3QoKTtcbiAgICBcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmVxdWF0aW9uTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmICh0aGlzLmVxdWF0aW9uTGlzdFtpXSA9PT0gc21hbGxlc3RFcXVhdGlvbikge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgIFxuICAgICAgICAgIHRoaXMuZXF1YXRpb25MaXN0W2ldID0gdGhpcy5lcXVhdGlvbkxpc3RbaV0uc3Vic3RpdHV0ZSh0b19zdWJzdGl0dXRlKTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICB0aGlzLmVxdWF0aW9uTGlzdC5zcGxpY2UodGhpcy5lcXVhdGlvbkxpc3QuaW5kZXhPZihzbWFsbGVzdEVxdWF0aW9uKSwgMSk7XG4gICAgICAgIHRoaXMuZXF1YXRpb25MaXN0LnB1c2goc21hbGxlc3RFcXVhdGlvbik7XG4gICAgICB9XG4gICAgXG4gICAgZ2V0VmFyaWFibGVzKCk6IHN0cmluZ1tdIHtcbiAgICBjb25zdCB2YXJpYWJsZV9mcmVxdWVuY2llczoge1trZXk6IHN0cmluZ106IG51bWJlcn0gPSB7fTtcblxuICAgIGZvciAoY29uc3QgZXF1YXRpb24gb2YgdGhpcy5lcXVhdGlvbkxpc3QpIHtcbiAgICAgICAgZm9yIChjb25zdCB2YXJpYWJsZSBpbiBlcXVhdGlvbi5lcXVhdGlvbikge1xuICAgICAgICAgICAgdmFyaWFibGVfZnJlcXVlbmNpZXNbdmFyaWFibGVdID0gKHZhcmlhYmxlX2ZyZXF1ZW5jaWVzW3ZhcmlhYmxlXSB8fCAwKSArIDE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gT2JqZWN0LmtleXModmFyaWFibGVfZnJlcXVlbmNpZXMpLnNvcnQoKGEsIGIpID0+IHZhcmlhYmxlX2ZyZXF1ZW5jaWVzW2JdIC0gdmFyaWFibGVfZnJlcXVlbmNpZXNbYV0pO1xuICAgIH1cbiAgICBcbiAgICBpc05hdHVyYWwoc29sdXRpb246IHtba2V5OiBzdHJpbmddOiBudW1iZXJ9LCBmYWN0b3I6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBjbG9zZV90b19uYXR1cmFsID0gKG46IG51bWJlcikgPT4gTWF0aC5hYnMoTWF0aC5yb3VuZChuKSAtIG4pIDwgMC4wMDAwMTtcbiAgICBcbiAgICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoc29sdXRpb24pKSB7XG4gICAgICAgICAgICBpZiAoIWNsb3NlX3RvX25hdHVyYWwodmFsdWUgKiBmYWN0b3IpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBcbiAgICBzb2x2ZSgpOiB7W2tleTogc3RyaW5nXTogbnVtYmVyfSB7XG4gICAgICAgIGxldCBpdGVyYXRpb24gPSAwO1xuICAgICAgICB3aGlsZSAoIXRoaXMuaXNTaW1wbGlmaWVkKCkgJiYgaXRlcmF0aW9uIDwgMjAwKSB7XG4gICAgICAgICAgICB0aGlzLnN1YnN0aXR1dGVTbWFsbGVzdCgpO1xuXG4gICAgICAgICAgICBpdGVyYXRpb24rKztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNldCB0aGUgZmlyc3Qga2V5IHRvIDFcbiAgICAgICAgY29uc3QgdmFyaWFibGVzID0gdGhpcy5nZXRWYXJpYWJsZXMoKTtcbiAgICAgICAgY29uc3Qgc29sdXRpb25zOiB7W2tleTogc3RyaW5nXTogbnVtYmVyfSA9IHtbdmFyaWFibGVzWzBdXTogMX07XG5cbiAgICAgICAgLy8gc3Vic3RpdHV0ZSBiYWNrIGZyb20gdGhlIG9uZSBrZXkgc2V0XG4gICAgICAgIGZvciAoY29uc3QgdmFyaWFibGUgb2YgdmFyaWFibGVzLnNsaWNlKDEpKSB7XG4gICAgICAgICAgICAvLyBDaG9vc2UgYSB2YXJpYWJsZSB0byBzZXQgdG8gMVxuICAgICAgICAgICAgY29uc3QgZXF1YXRpb25zID0gdGhpcy5lcXVhdGlvbkxpc3Quc2xpY2UoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yIChjb25zdCBlcXVhdGlvbldpdGhWYXIgb2YgZXF1YXRpb25zKSB7XG4gICAgICAgICAgICAgICAgaWYgKCEodmFyaWFibGUgaW4gZXF1YXRpb25XaXRoVmFyLmVxdWF0aW9uKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zdCBleGlzdGluZ1NvbHV0aW9uID0gc29sdXRpb25zW3ZhcmlhYmxlXTtcblxuICAgICAgICAgICAgICAgIC8vIFNvbHZlIGZvciB0aGF0IHZhcmlhYmxlIGluIG9uZSBvZiB0aGUgZXF1YXRpb25zXG4gICAgICAgICAgICAgICAgY29uc3Qgc3Vic3RpdHV0aW9uID0gZXF1YXRpb25XaXRoVmFyLnNvbHZlKHZhcmlhYmxlKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1NvbHV0aW9uID0gc3Vic3RpdHV0aW9uLm5ld1NvbHV0aW9uKHNvbHV0aW9ucyk7XG4gICAgICAgICAgICAgICAgaWYgKG5ld1NvbHV0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGV4aXN0aW5nU29sdXRpb24gIT09IHVuZGVmaW5lZCAmJiBuZXdTb2x1dGlvbiAhPT0gZXhpc3RpbmdTb2x1dGlvbikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc29sdXRpb25zW3ZhcmlhYmxlXSA9IG5ld1NvbHV0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gZmluZCB0aGUgY29ycmVjdCBmYWN0b3JcbiAgICAgICAgbGV0IGZhY3RvcjogbnVtYmVyID0gMTtcbiAgICAgICAgZm9yIChmYWN0b3IgPSAxOyBmYWN0b3IgPCAyMDAwOyBmYWN0b3IrKykge1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNOYXR1cmFsKHNvbHV0aW9ucywgZmFjdG9yKSkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gYXBwbHkgdGhlIGZhY3RvclxuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBzb2x1dGlvbnMpIHtcbiAgICAgICAgICAgIHNvbHV0aW9uc1trZXldID0gTWF0aC5yb3VuZChmYWN0b3IgKiBzb2x1dGlvbnNba2V5XSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc29sdXRpb25zXG4gICAgfVxufVxuICJdfQ==
