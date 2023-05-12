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
console.log(solve("H2 + O2 = H2O + N", true));
//# sourceMappingURL=reaction.js.map