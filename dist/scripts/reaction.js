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
import { Equation, SystemOfEquations } from './solveLgs';
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
            this.coefficient.toString() + atomString;
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
        this.currentSide = 1;
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
                this.switchToProduct();
            else if (!isNaN(Number(currentChar))) {
                lastNumber += currentChar;
                if (isNaN(Number(nextChar))) {
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
            console.log(sol);
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
    catch (ParsingError) {
        return "Parsing error: Check your input! 🥺";
    }
    return parsed_reaction.solve(showSteps);
}

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zY3JpcHRzL3JlYWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBQyxRQUFRLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFFdkQsSUFBTSxhQUFhLEdBQTRCO0lBQzNDLEdBQUcsRUFBRSxRQUFRO0lBQ2IsR0FBRyxFQUFFLFFBQVE7SUFDYixHQUFHLEVBQUUsUUFBUTtJQUNiLEdBQUcsRUFBRSxRQUFRO0lBQ2IsR0FBRyxFQUFFLFFBQVE7SUFDYixHQUFHLEVBQUUsUUFBUTtJQUNiLEdBQUcsRUFBRSxRQUFRO0lBQ2IsR0FBRyxFQUFFLFFBQVE7SUFDYixHQUFHLEVBQUUsUUFBUTtJQUNiLEdBQUcsRUFBRSxRQUFRO0NBQ2hCLENBQUM7QUFFRixJQUFNLE9BQU8sR0FBVyw2QkFBNkIsQ0FBQTtBQUdyRCxTQUFTLFdBQVcsQ0FBQyxZQUFpQjtJQUNsQyxPQUFPLElBQUksS0FBSyxDQUFDLEVBQUUsRUFBRTtRQUNuQixHQUFHLEVBQUUsVUFBQyxNQUFNLEVBQUUsSUFBSSxJQUFLLE9BQUEsSUFBSSxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLEVBQTVDLENBQTRDO0tBQ3BFLENBQUMsQ0FBQztBQUNQLENBQUM7QUFHRCxTQUFTLFdBQVcsQ0FBQyxHQUFXO0lBQzVCLE9BQU8sR0FBRyxLQUFLLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUNyQyxDQUFDO0FBRUQsU0FBUyxXQUFXLENBQUMsR0FBVztJQUM1QixPQUFPLEdBQUcsS0FBSyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDckMsQ0FBQztBQUVELFNBQVMsT0FBTyxDQUFDLEdBQVc7SUFDeEIsT0FBTyxhQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FB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QUFDLE9BQU0sWUFBWSxFQUFFO1FBQ2xCLE9BQU8scUNBQXFDLENBQUE7S0FDL0M7SUFFRCxPQUFPLGVBQWUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUE7QUFDM0MsQ0FBQyIsImZpbGUiOiJzY3JpcHRzL3JlYWN0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtFcXVhdGlvbiwgU3lzdGVtT2ZFcXVhdGlvbnN9IGZyb20gJy4vc29sdmVMZ3MnO1xuXG5jb25zdCBTVUJTQ1JJUFRfTUFQOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHtcbiAgICAnMCc6ICdcXHUyMDgwJyxcbiAgICAnMSc6ICdcXHUyMDgxJyxcbiAgICAnMic6ICdcXHUyMDgyJyxcbiAgICAnMyc6ICdcXHUyMDgzJyxcbiAgICAnNCc6ICdcXHUyMDg0JyxcbiAgICAnNSc6ICdcXHUyMDg1JyxcbiAgICAnNic6ICdcXHUyMDg2JyxcbiAgICAnNyc6ICdcXHUyMDg3JyxcbiAgICAnOCc6ICdcXHUyMDg4JyxcbiAgICAnOSc6ICdcXHUyMDg5Jyxcbn07XG5cbmNvbnN0IElEX0xJU1Q6IHN0cmluZyA9IFwiYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpeXCJcblxuXG5mdW5jdGlvbiBkZWZhdWx0RGljdChkZWZhdWx0VmFsdWU6IGFueSkge1xuICAgIHJldHVybiBuZXcgUHJveHkoe30sIHtcbiAgICAgIGdldDogKHRhcmdldCwgbmFtZSkgPT4gbmFtZSBpbiB0YXJnZXQgPyB0YXJnZXRbbmFtZV0gOiBkZWZhdWx0VmFsdWVcbiAgICB9KTtcbn1cblxuXG5mdW5jdGlvbiBpc1VwcGVyQ2FzZShzdHI6IHN0cmluZykge1xuICAgIHJldHVybiBzdHIgPT09IHN0ci50b1VwcGVyQ2FzZSgpO1xufVxuXG5mdW5jdGlvbiBpc0xvd2VyQ2FzZShzdHI6IHN0cmluZykge1xuICAgIHJldHVybiBzdHIgPT09IHN0ci50b0xvd2VyQ2FzZSgpO1xufVxuICBcbmZ1bmN0aW9uIGlzQWxwaGEoc3RyOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gL15bYS16QS1aXSskLy50ZXN0KHN0cik7XG59XG5cblxuY2xhc3MgUGFyc2luZ0Vycm9yIGV4dGVuZHMgRXJyb3Ige31cblxuXG5jbGFzcyBBdG9tIHtcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgY291bnQ6IG51bWJlclxuXG4gICAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nLCBjb3VudDogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMuY291bnQgPSBjb3VudDtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgICAgICBpZiAodGhpcy5jb3VudCA9PT0gMCkgcmV0dXJuIFwiXCI7XG4gICAgICAgIGlmICh0aGlzLmNvdW50ID09PSAxKSByZXR1cm4gdGhpcy5uYW1lO1xuXG4gICAgICAgIGxldCBzdWJzY3JpcHQgPSBcIlwiO1xuICAgICAgICBjb25zdCBjb3VudF9zdHIgPSB0aGlzLmNvdW50LnRvU3RyaW5nKCk7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudF9zdHIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHN1YnNjcmlwdCArPSBTVUJTQ1JJUFRfTUFQW2NvdW50X3N0cltpXV07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5uYW1lICsgc3Vic2NyaXB0O1xuICAgIH1cbn1cblxuXG5jbGFzcyBNb2xlY3VsZSB7XG4gICAgY29lZmZpY2llbnQ6IG51bWJlciA9IDE7XG4gICAgYXRvbUxpc3Q6IEF0b21bXSA9IFtdO1xuXG4gICAgaWQ6IHN0cmluZztcbiAgICBzaWRlOiBudW1iZXI7XG5cbiAgICBlbGVtZW50U2V0OiBTZXQ8c3RyaW5nPiA9IG5ldyBTZXQoKTtcbiAgICBwcml2YXRlIGF0b21NYXA6IHtba2V5OiBzdHJpbmddOiBudW1iZXJ9ID0gZGVmYXVsdERpY3QoMCk7XG5cbiAgICBjb25zdHJ1Y3RvcihpZDogc3RyaW5nLCBzaWRlOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xuICAgICAgICB0aGlzLnNpZGUgPSBzaWRlO1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgICAgIGlmICh0aGlzLmNvZWZmaWNpZW50ID09PSAwKSByZXR1cm4gXCJcIjtcblxuICAgICAgICBjb25zdCBhdG9tU3RyaW5nID0gdGhpcy5hdG9tTGlzdC5tYXAoYXRvbSA9PiBhdG9tLnRvU3RyaW5nKCkpLmpvaW4oXCJcIik7XG5cbiAgICAgICAgaWYgKHRoaXMuY29lZmZpY2llbnQgPT09IDEpIHJldHVybiBhdG9tU3RyaW5nO1xuICAgICAgICBlbHNlIHRoaXMuY29lZmZpY2llbnQudG9TdHJpbmcoKSArIGF0b21TdHJpbmc7XG4gICAgfVxuXG4gICAgc2V0Q29lZmljaWVudChjb2VmZmljaWVudDogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmF0b21MaXN0Lmxlbmd0aCA9PT0gMCkgdGhpcy5jb2VmZmljaWVudCAqPSBjb2VmZmljaWVudDtcbiAgICAgICAgZWxzZSB0aGlzLmF0b21MaXN0W3RoaXMuYXRvbUxpc3QubGVuZ3RoIC0gMV0uY291bnQgPSBjb2VmZmljaWVudDtcbiAgICB9XG5cbiAgICBhZGRBdG9tKG5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICB0aGlzLmF0b21MaXN0LnB1c2gobmV3IEF0b20obmFtZSwgMSkpO1xuICAgIH1cblxuICAgIG1vZGlmeUF0b21OYW1lKG5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5hdG9tTGlzdC5sZW5ndGggPT09IDApIHRocm93IFBhcnNpbmdFcnJvcjtcblxuICAgICAgICB0aGlzLmF0b21MaXN0W3RoaXMuYXRvbUxpc3QubGVuZ3RoIC0gMV0ubmFtZSArPSBuYW1lXG4gICAgfVxuXG4gICAgbWFwQXRvbSgpOiB2b2lkIHtcbiAgICAgICAgZm9yIChjb25zdCBhdG9tIG9mIHRoaXMuYXRvbUxpc3QpIHtcbiAgICAgICAgICAgIHRoaXMuYXRvbU1hcFthdG9tLm5hbWVdID0gYXRvbS5jb3VudDtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudFNldC5hZGQoYXRvbS5uYW1lKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldEF0b21Db3VudChlbGVtZW50OiBzdHJpbmcpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5hdG9tTWFwW2VsZW1lbnRdICogdGhpcy5jb2VmZmljaWVudCAqIHRoaXMuc2lkZTtcbiAgICB9XG5cbn1cblxuY2xhc3MgUmVhY3Rpb24ge1xuICAgIGVkdWN0OiBNb2xlY3VsZVtdO1xuICAgIHByb2R1Y3Q6IE1vbGVjdWxlW107XG5cbiAgICBwcml2YXRlIGxhc3RNb2xlY3VsZTogTW9sZWN1bGU7XG4gICAgcHJpdmF0ZSBjdXJyZW50U2lkZTogbnVtYmVyID0gMTtcblxuICAgIHByaXZhdGUgbW9sZWN1bGVQb29sOiBNb2xlY3VsZVtdO1xuICAgIHByaXZhdGUgaWRNb2xlY3VsZU1hcDoge1trZXk6IHN0cmluZ106IE1vbGVjdWxlfVxuXG4gICAgY29uc3RydWN0b3IocmVhY3Rpb246IHN0cmluZykge1xuICAgICAgICB0aGlzLnBhcnNlKHJlYWN0aW9uKTtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5lZHVjdC5tYXAobW9sZWN1bGUgPT4gbW9sZWN1bGUudG9TdHJpbmcoKSkuam9pbihcIiArIFwiKSArIFwiIOKftiBcIiArIHRoaXMucHJvZHVjdC5tYXAobW9sZWN1bGUgPT4gbW9sZWN1bGUudG9TdHJpbmcoKSkuam9pbihcIiArIFwiKVxuICAgIH1cblxuICAgIHByaXZhdGUgc3dpdGNoVG9Qcm9kdWN0KCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5jdXJyZW50U2lkZSA9PT0gLTEpIHRocm93IFBhcnNpbmdFcnJvcjtcblxuICAgICAgICB0aGlzLmN1cnJlbnRTaWRlID0gLTE7XG4gICAgICAgIHRoaXMuYWRkTW9sZWN1bGUoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFkZE1vbGVjdWxlKCk6IHZvaWQge1xuICAgICAgICB0aGlzLmxhc3RNb2xlY3VsZSA9IG5ldyBNb2xlY3VsZShJRF9MSVNUW3RoaXMubW9sZWN1bGVQb29sLmxlbmd0aF0sIHRoaXMuY3VycmVudFNpZGUpO1xuXG4gICAgICAgIHRoaXMubW9sZWN1bGVQb29sLnB1c2godGhpcy5sYXN0TW9sZWN1bGUpO1xuICAgICAgICB0aGlzLmlkTW9sZWN1bGVNYXBbdGhpcy5sYXN0TW9sZWN1bGUuaWRdID0gdGhpcy5sYXN0TW9sZWN1bGU7XG5cbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFNpZGUgPT09IDEpIHRoaXMuZWR1Y3QucHVzaCh0aGlzLmxhc3RNb2xlY3VsZSk7XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuY3VycmVudFNpZGUgPT09IC0xKSB0aGlzLnByb2R1Y3QucHVzaCh0aGlzLmxhc3RNb2xlY3VsZSk7XG4gICAgICAgIGVsc2UgdGhyb3cgUGFyc2luZ0Vycm9yO1xuICAgIH1cblxuICAgIHByaXZhdGUgcGFyc2UocmVhY3Rpb246IHN0cmluZyk6IHZvaWQge1xuICAgICAgICB0aGlzLmFkZE1vbGVjdWxlKCk7XG5cbiAgICAgICAgcmVhY3Rpb24gKz0gXCIgXCI7XG4gICAgICAgIGxldCBsYXN0TnVtYmVyOiBzdHJpbmcgPSBcIlwiO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpPHJlYWN0aW9uLmxlbmd0aC0xOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRDaGFyOiBzdHJpbmcgPSByZWFjdGlvbltpXTtcbiAgICAgICAgICAgIGNvbnN0IG5leHRDaGFyOiBzdHJpbmcgPSByZWFjdGlvbltpICsgMV07XG5cbiAgICAgICAgICAgIGlmIChjdXJyZW50Q2hhciA9PT0gXCIgXCIpIGNvbnRpbnVlO1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRDaGFyID09PSBcIitcIikgdGhpcy5zd2l0Y2hUb1Byb2R1Y3QoKTtcbiAgICAgICAgICAgIGVsc2UgaWYgKCFpc05hTihOdW1iZXIoY3VycmVudENoYXIpKSkge1xuICAgICAgICAgICAgICAgIGxhc3ROdW1iZXIgKz0gY3VycmVudENoYXI7XG5cbiAgICAgICAgICAgICAgICBpZiAoaXNOYU4oTnVtYmVyKG5leHRDaGFyKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXN0TW9sZWN1bGUuc2V0Q29lZmljaWVudChOdW1iZXIobGFzdE51bWJlcikpO1xuICAgICAgICAgICAgICAgICAgICBsYXN0TnVtYmVyID0gXCJcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpc0FscGhhKGN1cnJlbnRDaGFyKSAmJiBpc1VwcGVyQ2FzZShjdXJyZW50Q2hhcikpIHRoaXMubGFzdE1vbGVjdWxlLmFkZEF0b20oY3VycmVudENoYXIpO1xuICAgICAgICAgICAgZWxzZSBpZiAoaXNBbHBoYShjdXJyZW50Q2hhcikgJiYgaXNMb3dlckNhc2UoY3VycmVudENoYXIpKSB0aGlzLmxhc3RNb2xlY3VsZS5tb2RpZnlBdG9tTmFtZShjdXJyZW50Q2hhcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRTeXN0ZW1PZkxpbmVhckVxdWF0aW9ucygpOiBTeXN0ZW1PZkVxdWF0aW9ucyB7XG4gICAgICAgIC8vIEdldCBhbGwgZXhpc3RpbmcgZWxlbWVudHNcbiAgICAgICAgbGV0IGVsZW1lbnRTZXQ6IFNldDxzdHJpbmc+ID0gbmV3IFNldCgpO1xuICAgICAgXG4gICAgICAgIGZvciAoY29uc3QgbW9sZWN1bGUgb2YgdGhpcy5tb2xlY3VsZVBvb2wpIHtcbiAgICAgICAgICAgIG1vbGVjdWxlLm1hcEF0b20oKTtcbiAgICAgIFxuICAgICAgICAgICAgZWxlbWVudFNldCA9IG5ldyBTZXQoWy4uLmVsZW1lbnRTZXQsIC4uLm1vbGVjdWxlLmVsZW1lbnRTZXRdKVxuICAgICAgICB9XG4gICAgICBcbiAgICAgICAgLy8gQ3JlYXRlIGFuIGVxdWF0aW9uIGZvciBlYWNoIGVsZW1lbnRcbiAgICAgICAgY29uc3QgZXF1YXRpb25zOiBFcXVhdGlvbltdID0gW107XG4gICAgICBcbiAgICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGVsZW1lbnRTZXQpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvdW50czoge1tpZDogc3RyaW5nXTogbnVtYmVyfSA9IHt9O1xuICAgICAgICBcbiAgICAgICAgICAgIGZvciAoY29uc3QgbW9sZWN1bGUgb2YgdGhpcy5tb2xlY3VsZVBvb2wpIHtcbiAgICAgICAgICAgICAgICBjb3VudHNbbW9sZWN1bGUuaWRdID0gbW9sZWN1bGUuZ2V0QXRvbUNvdW50KGVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgICAgIGVxdWF0aW9ucy5wdXNoKG5ldyBFcXVhdGlvbihjb3VudHMpKTtcbiAgICAgICAgfVxuICAgICAgXG4gICAgICAgIHJldHVybiBuZXcgU3lzdGVtT2ZFcXVhdGlvbnMoZXF1YXRpb25zKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgc29sdmUoc2hvd1N0ZXBzOiBib29sZWFuKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3Qgc29sID0gdGhpcy5nZXRTeXN0ZW1PZkxpbmVhckVxdWF0aW9ucygpO1xuICAgICAgXG4gICAgICAgIGlmIChzaG93U3RlcHMpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHNvbCk7XG4gICAgICAgIH1cbiAgICAgIFxuICAgICAgICBjb25zdCBzb2x1dGlvbnMgPSBzb2wuc29sdmUoKTtcbiAgICAgIFxuICAgICAgICBpZiAoT2JqZWN0LmtleXMoc29sdXRpb25zKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gXCJObyBzb2x1dGlvbiBmb3VuZC4gU29ycnJ5eXl5IPCfpbpcIjtcbiAgICAgICAgfVxuICAgICAgXG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIHNvbHV0aW9ucykge1xuICAgICAgICAgIHRoaXMuaWRNb2xlY3VsZU1hcFtrZXldLmNvZWZmaWNpZW50ICo9IHNvbHV0aW9uc1trZXldO1xuICAgICAgICB9XG4gICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXMudG9TdHJpbmcoKTtcbiAgICB9ICAgICBcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gc29sdmUocmVhY3Rpb246IHN0cmluZywgc2hvd1N0ZXBzOiBib29sZWFuKTogc3RyaW5nIHtcbiAgICBsZXQgcGFyc2VkX3JlYWN0aW9uOiBSZWFjdGlvbjtcbiAgICBcbiAgICB0cnkge1xuICAgICAgICBwYXJzZWRfcmVhY3Rpb24gPSBuZXcgUmVhY3Rpb24ocmVhY3Rpb24pO1xuICAgIH0gY2F0Y2goUGFyc2luZ0Vycm9yKSB7XG4gICAgICAgIHJldHVybiBcIlBhcnNpbmcgZXJyb3I6IENoZWNrIHlvdXIgaW5wdXQhIPCfpbpcIlxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gcGFyc2VkX3JlYWN0aW9uLnNvbHZlKHNob3dTdGVwcylcbn1cbiJdfQ==
