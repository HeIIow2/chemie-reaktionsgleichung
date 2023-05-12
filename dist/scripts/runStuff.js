import { solve } from "./reaction.js";
console.log("Initializing Solver.");
function testSolve(reaction) {
    console.log(reaction);
    var sollution = solve(reaction, true);
    console.log(sollution);
    console.log();
}
testSolve("H2 + O2 = H2O");
//# sourceMappingURL=runStuff.js.map