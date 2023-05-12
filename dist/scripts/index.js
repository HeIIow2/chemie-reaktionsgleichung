import { solve } from "./reaction.js";
var form = document.querySelector('form');
var input = document.getElementById('reaktion');
var result = document.getElementById('result');
console.log("Initializing Solver.");
form.addEventListener('submit', function (event) {
    event.preventDefault();
    var inputReaction = input.value;
    console.log(inputReaction);
    result.innerHTML = solve(inputReaction, true);
});
//# sourceMappingURL=index.js.map