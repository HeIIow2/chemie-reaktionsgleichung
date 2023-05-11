var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { Equation, SystemOfEquations } from './solveLgs.js';
var SUBSCRIPT_MAP = {
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
var ID_LIST = "abcdefghijklmnopqrstuvwxyz^";
function defaultDict(defaultValue) {
    return new Proxy({}, {
        get: function (target, name) { return name in target ? target[name] : defaultValue; }
    });
}
function isUpperCase(str) {
    return str === str.toUpperCase();
}
function isLowerCase(str) {
    return str === str.toLowerCase();
}
function isAlpha(str) {
    return /^[a-zA-Z]+$/.test(str);
}
function isDigit(str) {
    return /^[0-9]+$/.test(str);
}
var ParsingError = /** @class */ (function (_super) {
    __extends(ParsingError, _super);
    function ParsingError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ParsingError;
}(Error));
var Atom = /** @class */ (function () {
    function Atom(name, count) {
        this.name = name;
        this.count = count;
    }
    Atom.prototype.toString = function () {
        if (this.count === 0)
            return "";
        if (this.count === 1)
            return this.name;
        var subscript = "";
        var count_str = this.count.toString();
        for (var i = 0; i < count_str.length; i++) {
            subscript += SUBSCRIPT_MAP[count_str[i]];
        }
        return this.name + subscript;
    };
    return Atom;
}());
var Molecule = /** @class */ (function () {
    function Molecule(id, side) {
        this.coefficient = 1;
        this.atomList = [];
        this.elementSet = new Set();
        this.atomMap = defaultDict(0);
        this.id = id;
        this.side = side;
    }
    Molecule.prototype.toString = function () {
        if (this.coefficient === 0)
            return "";
        var atomString = this.atomList.map(function (atom) { return atom.toString(); }).join("");
        if (this.coefficient === 1)
            return atomString;
        else
            return this.coefficient.toString() + atomString;
    };
    Molecule.prototype.setCoeficient = function (coefficient) {
        if (this.atomList.length === 0)
            this.coefficient *= coefficient;
        else
            this.atomList[this.atomList.length - 1].count = coefficient;
    };
    Molecule.prototype.addAtom = function (name) {
        this.atomList.push(new Atom(name, 1));
    };
    Molecule.prototype.modifyAtomName = function (name) {
        if (this.atomList.length === 0)
            throw ParsingError;
        this.atomList[this.atomList.length - 1].name += name;
    };
    Molecule.prototype.mapAtom = function () {
        var e_1, _a;
        try {
            for (var _b = __values(this.atomList), _c = _b.next(); !_c.done; _c = _b.next()) {
                var atom = _c.value;
                this.atomMap[atom.name] = atom.count;
                this.elementSet.add(atom.name);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    Molecule.prototype.getAtomCount = function (element) {
        return this.atomMap[element] * this.coefficient * this.side;
    };
    return Molecule;
}());
var Reaction = /** @class */ (function () {
    function Reaction(reaction) {
        this.educt = [];
        this.product = [];
        this.currentSide = 1;
        this.moleculePool = [];
        this.idMoleculeMap = {};
        this.parse(reaction);
    }
    Reaction.prototype.toString = function () {
        return this.educt.map(function (molecule) { return molecule.toString(); }).join(" + ") + " ⟶ " + this.product.map(function (molecule) { return molecule.toString(); }).join(" + ");
    };
    Reaction.prototype.switchToProduct = function () {
        if (this.currentSide === -1)
            throw ParsingError;
        this.currentSide = -1;
        this.addMolecule();
    };
    Reaction.prototype.addMolecule = function () {
        this.lastMolecule = new Molecule(ID_LIST[this.moleculePool.length], this.currentSide);
        this.moleculePool.push(this.lastMolecule);
        this.idMoleculeMap[this.lastMolecule.id] = this.lastMolecule;
        if (this.currentSide === 1)
            this.educt.push(this.lastMolecule);
        else if (this.currentSide === -1)
            this.product.push(this.lastMolecule);
        else
            throw ParsingError;
    };
    Reaction.prototype.parse = function (reaction) {
        this.addMolecule();
        reaction += " ";
        var lastNumber = "";
        for (var i = 0; i < reaction.length - 1; i++) {
            var currentChar = reaction[i];
            var nextChar = reaction[i + 1];
            if (currentChar === " ")
                continue;
            if (currentChar === "+")
                this.addMolecule();
            else if (currentChar === "=")
                this.switchToProduct();
            else if (isDigit(currentChar)) {
                lastNumber += currentChar;
                if (!isDigit(nextChar)) {
                    this.lastMolecule.setCoeficient(Number(lastNumber));
                    lastNumber = "";
                }
            }
            else if (isAlpha(currentChar) && isUpperCase(currentChar))
                this.lastMolecule.addAtom(currentChar);
            else if (isAlpha(currentChar) && isLowerCase(currentChar))
                this.lastMolecule.modifyAtomName(currentChar);
        }
    };
    Reaction.prototype.getSystemOfLinearEquations = function () {
        var e_2, _a, e_3, _b, e_4, _c;
        // Get all existing elements
        var elementSet = new Set();
        try {
            for (var _d = __values(this.moleculePool), _e = _d.next(); !_e.done; _e = _d.next()) {
                var molecule = _e.value;
                molecule.mapAtom();
                elementSet = new Set(__spreadArray(__spreadArray([], __read(elementSet), false), __read(molecule.elementSet), false));
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
            }
            finally { if (e_2) throw e_2.error; }
        }
        // Create an equation for each element
        var equations = [];
        try {
            for (var elementSet_1 = __values(elementSet), elementSet_1_1 = elementSet_1.next(); !elementSet_1_1.done; elementSet_1_1 = elementSet_1.next()) {
                var element = elementSet_1_1.value;
                var counts = {};
                try {
                    for (var _f = (e_4 = void 0, __values(this.moleculePool)), _g = _f.next(); !_g.done; _g = _f.next()) {
                        var molecule = _g.value;
                        counts[molecule.id] = molecule.getAtomCount(element);
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (_g && !_g.done && (_c = _f.return)) _c.call(_f);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
                equations.push(new Equation(counts));
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (elementSet_1_1 && !elementSet_1_1.done && (_b = elementSet_1.return)) _b.call(elementSet_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return new SystemOfEquations(equations);
    };
    Reaction.prototype.solve = function (showSteps) {
        var sol = this.getSystemOfLinearEquations();
        if (showSteps) {
            console.log(sol.toString());
        }
        var solutions = sol.solve();
        if (Object.keys(solutions).length === 0) {
            return "No solution found. Sorrryyyy 🥺";
        }
        for (var key in solutions) {
            this.idMoleculeMap[key].coefficient *= solutions[key];
        }
        return this.toString();
    };
    return Reaction;
}());
export function solve(reaction, showSteps) {
    var parsed_reaction;
    try {
        parsed_reaction = new Reaction(reaction);
    }
    catch (error) {
        console.error(error);
        if (error instanceof ParsingError) {
            return "Parsing error: Check your input! 🥺";
        }
    }
    return parsed_reaction.solve(showSteps);
}

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zY3JpcHRzL3JlYWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBQyxRQUFRLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFMUQsSUFBTSxhQUFhLEdBQTRCO0lBQzNDLEdBQUcsRUFBRSxRQUFRO0lBQ2IsR0FBRyxFQUFFLFFBQVE7SUFDYixHQUFHLEVBQUUsUUFBUTtJQUNiLEdBQUcsRUFBRSxRQUFRO0lBQ2IsR0FBRyxFQUFFLFFBQVE7SUFDYixHQUFHLEVBQUUsUUFBUTtJQUNiLEdBQUcsRUFBRSxRQUFRO0lBQ2IsR0FBRyxFQUFFLFFBQVE7SUFDYixHQUFHLEVBQUUsUUFBUTtJQUNiLEdBQUcsRUFBRSxRQUFRO0NBQ2hCLENBQUM7QUFFRixJQUFNLE9BQU8sR0FBVyw2QkFBNkIsQ0FBQTtBQUdyRCxTQUFTLFdBQVcsQ0FBQyxZQUFpQjtJQUNsQyxPQUFPLElBQUksS0FBSyxDQUFDLEVBQUUsRUFBRTtRQUNuQixHQUFHLEVBQUUsVUFBQyxNQUFNLEVBQUUsSUFBSSxJQUFLLE9BQUEsSUFBSSxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLEVBQTVDLENBQTRDO0tBQ3BFLENBQUMsQ0FBQztBQUNQLENBQUM7QUFHRCxTQUFTLFdBQVcsQ0FBQyxHQUFXO0lBQzVCLE9BQU8sR0FBRyxLQUFLLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUNyQyxDQUFDO0FBRUQsU0FBUyxXQUFXLENBQUMsR0FBVztJQUM1QixPQUFPLEdBQUcsS0FBSyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDckMsQ0FBQztBQUVELFNBQVMsT0FBTyxDQUFDLEdBQVc7SUFDeEIsT0FBTyxhQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FB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LFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN2RDtRQUVELE9BQU8sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzNCLENBQUM7SUFDTCxlQUFDO0FBQUQsQ0EzR0EsQUEyR0MsSUFBQTtBQUdELE1BQU0sVUFBVSxLQUFLLENBQUMsUUFBZ0IsRUFBRSxTQUFrQjtJQUN0RCxJQUFJLGVBQXlCLENBQUM7SUFFOUIsSUFBSTtRQUNBLGVBQWUsR0FBRyxJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUM1QztJQUFDLE9BQU0sS0FBSyxFQUFFO1FBQ1gsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNyQixJQUFJLEtBQUssWUFBWSxZQUFZLEVBQUU7WUFDL0IsT0FBTyxxQ0FBcUMsQ0FBQztTQUNoRDtLQUNKO0lBRUQsT0FBTyxlQUFlLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFBO0FBQzNDLENBQUMiLCJmaWxlIjoic2NyaXB0cy9yZWFjdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RXF1YXRpb24sIFN5c3RlbU9mRXF1YXRpb25zfSBmcm9tICcuL3NvbHZlTGdzLmpzJztcblxuY29uc3QgU1VCU0NSSVBUX01BUDoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7XG4gICAgJzAnOiAnXFx1MjA4MCcsXG4gICAgJzEnOiAnXFx1MjA4MScsXG4gICAgJzInOiAnXFx1MjA4MicsXG4gICAgJzMnOiAnXFx1MjA4MycsXG4gICAgJzQnOiAnXFx1MjA4NCcsXG4gICAgJzUnOiAnXFx1MjA4NScsXG4gICAgJzYnOiAnXFx1MjA4NicsXG4gICAgJzcnOiAnXFx1MjA4NycsXG4gICAgJzgnOiAnXFx1MjA4OCcsXG4gICAgJzknOiAnXFx1MjA4OScsXG59O1xuXG5jb25zdCBJRF9MSVNUOiBzdHJpbmcgPSBcImFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6XlwiXG5cblxuZnVuY3Rpb24gZGVmYXVsdERpY3QoZGVmYXVsdFZhbHVlOiBhbnkpIHtcbiAgICByZXR1cm4gbmV3IFByb3h5KHt9LCB7XG4gICAgICBnZXQ6ICh0YXJnZXQsIG5hbWUpID0+IG5hbWUgaW4gdGFyZ2V0ID8gdGFyZ2V0W25hbWVdIDogZGVmYXVsdFZhbHVlXG4gICAgfSk7XG59XG5cblxuZnVuY3Rpb24gaXNVcHBlckNhc2Uoc3RyOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gc3RyID09PSBzdHIudG9VcHBlckNhc2UoKTtcbn1cblxuZnVuY3Rpb24gaXNMb3dlckNhc2Uoc3RyOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gc3RyID09PSBzdHIudG9Mb3dlckNhc2UoKTtcbn1cbiAgXG5mdW5jdGlvbiBpc0FscGhhKHN0cjogc3RyaW5nKSB7XG4gICAgcmV0dXJuIC9eW2EtekEtWl0rJC8udGVzdChzdHIpO1xufVxuXG5mdW5jdGlvbiBpc0RpZ2l0KHN0cjogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIC9eWzAtOV0rJC8udGVzdChzdHIpO1xufVxuXG5cbmNsYXNzIFBhcnNpbmdFcnJvciBleHRlbmRzIEVycm9yIHt9XG5cblxuY2xhc3MgQXRvbSB7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIGNvdW50OiBudW1iZXJcblxuICAgIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZywgY291bnQ6IG51bWJlcikge1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLmNvdW50ID0gY291bnQ7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKHRoaXMuY291bnQgPT09IDApIHJldHVybiBcIlwiO1xuICAgICAgICBpZiAodGhpcy5jb3VudCA9PT0gMSkgcmV0dXJuIHRoaXMubmFtZTtcblxuICAgICAgICBsZXQgc3Vic2NyaXB0ID0gXCJcIjtcbiAgICAgICAgY29uc3QgY291bnRfc3RyID0gdGhpcy5jb3VudC50b1N0cmluZygpO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnRfc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzdWJzY3JpcHQgKz0gU1VCU0NSSVBUX01BUFtjb3VudF9zdHJbaV1dO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZSArIHN1YnNjcmlwdDtcbiAgICB9XG59XG5cblxuY2xhc3MgTW9sZWN1bGUge1xuICAgIGNvZWZmaWNpZW50OiBudW1iZXIgPSAxO1xuICAgIGF0b21MaXN0OiBBdG9tW10gPSBbXTtcblxuICAgIGlkOiBzdHJpbmc7XG4gICAgc2lkZTogbnVtYmVyO1xuXG4gICAgZWxlbWVudFNldDogU2V0PHN0cmluZz4gPSBuZXcgU2V0KCk7XG4gICAgcHJpdmF0ZSBhdG9tTWFwOiB7W2tleTogc3RyaW5nXTogbnVtYmVyfSA9IGRlZmF1bHREaWN0KDApO1xuXG4gICAgY29uc3RydWN0b3IoaWQ6IHN0cmluZywgc2lkZTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuaWQgPSBpZDtcbiAgICAgICAgdGhpcy5zaWRlID0gc2lkZTtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgICAgICBpZiAodGhpcy5jb2VmZmljaWVudCA9PT0gMCkgcmV0dXJuIFwiXCI7XG5cbiAgICAgICAgY29uc3QgYXRvbVN0cmluZyA9IHRoaXMuYXRvbUxpc3QubWFwKGF0b20gPT4gYXRvbS50b1N0cmluZygpKS5qb2luKFwiXCIpO1xuXG4gICAgICAgIGlmICh0aGlzLmNvZWZmaWNpZW50ID09PSAxKSByZXR1cm4gYXRvbVN0cmluZztcbiAgICAgICAgZWxzZSByZXR1cm4gdGhpcy5jb2VmZmljaWVudC50b1N0cmluZygpICsgYXRvbVN0cmluZztcbiAgICB9XG5cbiAgICBzZXRDb2VmaWNpZW50KGNvZWZmaWNpZW50OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuYXRvbUxpc3QubGVuZ3RoID09PSAwKSB0aGlzLmNvZWZmaWNpZW50ICo9IGNvZWZmaWNpZW50O1xuICAgICAgICBlbHNlIHRoaXMuYXRvbUxpc3RbdGhpcy5hdG9tTGlzdC5sZW5ndGggLSAxXS5jb3VudCA9IGNvZWZmaWNpZW50O1xuICAgIH1cblxuICAgIGFkZEF0b20obmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIHRoaXMuYXRvbUxpc3QucHVzaChuZXcgQXRvbShuYW1lLCAxKSk7XG4gICAgfVxuXG4gICAgbW9kaWZ5QXRvbU5hbWUobmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmF0b21MaXN0Lmxlbmd0aCA9PT0gMCkgdGhyb3cgUGFyc2luZ0Vycm9yO1xuXG4gICAgICAgIHRoaXMuYXRvbUxpc3RbdGhpcy5hdG9tTGlzdC5sZW5ndGggLSAxXS5uYW1lICs9IG5hbWVcbiAgICB9XG5cbiAgICBtYXBBdG9tKCk6IHZvaWQge1xuICAgICAgICBmb3IgKGNvbnN0IGF0b20gb2YgdGhpcy5hdG9tTGlzdCkge1xuICAgICAgICAgICAgdGhpcy5hdG9tTWFwW2F0b20ubmFtZV0gPSBhdG9tLmNvdW50O1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50U2V0LmFkZChhdG9tLm5hbWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0QXRvbUNvdW50KGVsZW1lbnQ6IHN0cmluZyk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0b21NYXBbZWxlbWVudF0gKiB0aGlzLmNvZWZmaWNpZW50ICogdGhpcy5zaWRlO1xuICAgIH1cblxufVxuXG5jbGFzcyBSZWFjdGlvbiB7XG4gICAgZWR1Y3Q6IE1vbGVjdWxlW10gPSBbXTtcbiAgICBwcm9kdWN0OiBNb2xlY3VsZVtdID0gW107XG5cbiAgICBwcml2YXRlIGxhc3RNb2xlY3VsZTogTW9sZWN1bGU7XG4gICAgcHJpdmF0ZSBjdXJyZW50U2lkZTogbnVtYmVyID0gMTtcblxuICAgIHByaXZhdGUgbW9sZWN1bGVQb29sOiBNb2xlY3VsZVtdID0gW107XG4gICAgcHJpdmF0ZSBpZE1vbGVjdWxlTWFwOiB7W2tleTogc3RyaW5nXTogTW9sZWN1bGV9ID0ge31cblxuICAgIGNvbnN0cnVjdG9yKHJlYWN0aW9uOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5wYXJzZShyZWFjdGlvbik7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWR1Y3QubWFwKG1vbGVjdWxlID0+IG1vbGVjdWxlLnRvU3RyaW5nKCkpLmpvaW4oXCIgKyBcIikgKyBcIiDin7YgXCIgKyB0aGlzLnByb2R1Y3QubWFwKG1vbGVjdWxlID0+IG1vbGVjdWxlLnRvU3RyaW5nKCkpLmpvaW4oXCIgKyBcIilcbiAgICB9XG5cbiAgICBwcml2YXRlIHN3aXRjaFRvUHJvZHVjdCgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFNpZGUgPT09IC0xKSB0aHJvdyBQYXJzaW5nRXJyb3I7XG5cbiAgICAgICAgdGhpcy5jdXJyZW50U2lkZSA9IC0xO1xuICAgICAgICB0aGlzLmFkZE1vbGVjdWxlKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhZGRNb2xlY3VsZSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5sYXN0TW9sZWN1bGUgPSBuZXcgTW9sZWN1bGUoSURfTElTVFt0aGlzLm1vbGVjdWxlUG9vbC5sZW5ndGhdLCB0aGlzLmN1cnJlbnRTaWRlKTtcblxuICAgICAgICB0aGlzLm1vbGVjdWxlUG9vbC5wdXNoKHRoaXMubGFzdE1vbGVjdWxlKTtcbiAgICAgICAgdGhpcy5pZE1vbGVjdWxlTWFwW3RoaXMubGFzdE1vbGVjdWxlLmlkXSA9IHRoaXMubGFzdE1vbGVjdWxlO1xuXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRTaWRlID09PSAxKSB0aGlzLmVkdWN0LnB1c2godGhpcy5sYXN0TW9sZWN1bGUpO1xuICAgICAgICBlbHNlIGlmICh0aGlzLmN1cnJlbnRTaWRlID09PSAtMSkgdGhpcy5wcm9kdWN0LnB1c2godGhpcy5sYXN0TW9sZWN1bGUpO1xuICAgICAgICBlbHNlIHRocm93IFBhcnNpbmdFcnJvcjtcbiAgICB9XG5cbiAgICBwcml2YXRlIHBhcnNlKHJlYWN0aW9uOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5hZGRNb2xlY3VsZSgpO1xuXG4gICAgICAgIHJlYWN0aW9uICs9IFwiIFwiO1xuICAgICAgICBsZXQgbGFzdE51bWJlcjogc3RyaW5nID0gXCJcIjtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaTxyZWFjdGlvbi5sZW5ndGgtMTsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50Q2hhcjogc3RyaW5nID0gcmVhY3Rpb25baV07XG4gICAgICAgICAgICBjb25zdCBuZXh0Q2hhcjogc3RyaW5nID0gcmVhY3Rpb25baSArIDFdO1xuXG4gICAgICAgICAgICBpZiAoY3VycmVudENoYXIgPT09IFwiIFwiKSBjb250aW51ZTtcbiAgICAgICAgICAgIGlmIChjdXJyZW50Q2hhciA9PT0gXCIrXCIpIHRoaXMuYWRkTW9sZWN1bGUoKTtcbiAgICAgICAgICAgIGVsc2UgaWYgKGN1cnJlbnRDaGFyID09PSBcIj1cIikgdGhpcy5zd2l0Y2hUb1Byb2R1Y3QoKTtcbiAgICAgICAgICAgIGVsc2UgaWYgKGlzRGlnaXQoY3VycmVudENoYXIpKSB7XG4gICAgICAgICAgICAgICAgbGFzdE51bWJlciArPSBjdXJyZW50Q2hhcjtcblxuICAgICAgICAgICAgICAgIGlmICghaXNEaWdpdChuZXh0Q2hhcikpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXN0TW9sZWN1bGUuc2V0Q29lZmljaWVudChOdW1iZXIobGFzdE51bWJlcikpO1xuICAgICAgICAgICAgICAgICAgICBsYXN0TnVtYmVyID0gXCJcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpc0FscGhhKGN1cnJlbnRDaGFyKSAmJiBpc1VwcGVyQ2FzZShjdXJyZW50Q2hhcikpIHRoaXMubGFzdE1vbGVjdWxlLmFkZEF0b20oY3VycmVudENoYXIpO1xuICAgICAgICAgICAgZWxzZSBpZiAoaXNBbHBoYShjdXJyZW50Q2hhcikgJiYgaXNMb3dlckNhc2UoY3VycmVudENoYXIpKSB0aGlzLmxhc3RNb2xlY3VsZS5tb2RpZnlBdG9tTmFtZShjdXJyZW50Q2hhcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRTeXN0ZW1PZkxpbmVhckVxdWF0aW9ucygpOiBTeXN0ZW1PZkVxdWF0aW9ucyB7XG4gICAgICAgIC8vIEdldCBhbGwgZXhpc3RpbmcgZWxlbWVudHNcbiAgICAgICAgbGV0IGVsZW1lbnRTZXQ6IFNldDxzdHJpbmc+ID0gbmV3IFNldCgpO1xuICAgICAgXG4gICAgICAgIGZvciAoY29uc3QgbW9sZWN1bGUgb2YgdGhpcy5tb2xlY3VsZVBvb2wpIHtcbiAgICAgICAgICAgIG1vbGVjdWxlLm1hcEF0b20oKTtcbiAgICAgIFxuICAgICAgICAgICAgZWxlbWVudFNldCA9IG5ldyBTZXQoWy4uLmVsZW1lbnRTZXQsIC4uLm1vbGVjdWxlLmVsZW1lbnRTZXRdKVxuICAgICAgICB9XG4gICAgICBcbiAgICAgICAgLy8gQ3JlYXRlIGFuIGVxdWF0aW9uIGZvciBlYWNoIGVsZW1lbnRcbiAgICAgICAgY29uc3QgZXF1YXRpb25zOiBFcXVhdGlvbltdID0gW107XG4gICAgICBcbiAgICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGVsZW1lbnRTZXQpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvdW50czoge1tpZDogc3RyaW5nXTogbnVtYmVyfSA9IHt9O1xuICAgICAgICBcbiAgICAgICAgICAgIGZvciAoY29uc3QgbW9sZWN1bGUgb2YgdGhpcy5tb2xlY3VsZVBvb2wpIHtcbiAgICAgICAgICAgICAgICBjb3VudHNbbW9sZWN1bGUuaWRdID0gbW9sZWN1bGUuZ2V0QXRvbUNvdW50KGVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgICAgIGVxdWF0aW9ucy5wdXNoKG5ldyBFcXVhdGlvbihjb3VudHMpKTtcbiAgICAgICAgfVxuICAgICAgXG4gICAgICAgIHJldHVybiBuZXcgU3lzdGVtT2ZFcXVhdGlvbnMoZXF1YXRpb25zKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgc29sdmUoc2hvd1N0ZXBzOiBib29sZWFuKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3Qgc29sID0gdGhpcy5nZXRTeXN0ZW1PZkxpbmVhckVxdWF0aW9ucygpO1xuICAgICAgXG4gICAgICAgIGlmIChzaG93U3RlcHMpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHNvbC50b1N0cmluZygpKTtcbiAgICAgICAgfVxuICAgICAgXG4gICAgICAgIGNvbnN0IHNvbHV0aW9ucyA9IHNvbC5zb2x2ZSgpO1xuICAgICAgXG4gICAgICAgIGlmIChPYmplY3Qua2V5cyhzb2x1dGlvbnMpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiBcIk5vIHNvbHV0aW9uIGZvdW5kLiBTb3Jycnl5eXkg8J+lulwiO1xuICAgICAgICB9XG4gICAgICBcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gc29sdXRpb25zKSB7XG4gICAgICAgICAgdGhpcy5pZE1vbGVjdWxlTWFwW2tleV0uY29lZmZpY2llbnQgKj0gc29sdXRpb25zW2tleV07XG4gICAgICAgIH1cbiAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcy50b1N0cmluZygpO1xuICAgIH0gICAgIFxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBzb2x2ZShyZWFjdGlvbjogc3RyaW5nLCBzaG93U3RlcHM6IGJvb2xlYW4pOiBzdHJpbmcge1xuICAgIGxldCBwYXJzZWRfcmVhY3Rpb246IFJlYWN0aW9uO1xuICAgIFxuICAgIHRyeSB7XG4gICAgICAgIHBhcnNlZF9yZWFjdGlvbiA9IG5ldyBSZWFjdGlvbihyZWFjdGlvbik7XG4gICAgfSBjYXRjaChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgUGFyc2luZ0Vycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJQYXJzaW5nIGVycm9yOiBDaGVjayB5b3VyIGlucHV0ISDwn6W6XCI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIHBhcnNlZF9yZWFjdGlvbi5zb2x2ZShzaG93U3RlcHMpXG59XG4iXX0=
