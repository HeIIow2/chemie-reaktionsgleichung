import { solve } from "./reaction.js";
console.log("Initializing Solver.");
function testSolve(reaction) {
    console.log(reaction);
    var sollution = solve(reaction, true);
    console.log(sollution);
}
testSolve("H2 + O2 = H2O");
//# sourceMappingURL=debug.js.map