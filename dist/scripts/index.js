import { solve } from "./reaction.js";
var form = document.querySelector('form');
var input = document.getElementById('reaktion');
var result = document.getElementById('result');
console.log("Initializing Solver.");
form.addEventListener('submit', function (event) {
    event.preventDefault();
    var inputReaction = input.value;
    console.log(inputReaction);
    var solution = solve(inputReaction, true);
    result.innerHTML = solution.toString();
    input.value = solution.originalReaction();
});
//# sourceMappingURL=index.js.map