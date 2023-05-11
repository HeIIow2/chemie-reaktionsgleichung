import { solve } from "./reaction.js";


const form = document.querySelector('form')!;
const input = document.getElementById('reaktion') as HTMLInputElement;
const result = document.getElementById('result')!;

console.log("Initializing Solver.");

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const inputReaction = input.value;
  console.log(inputReaction)
  result.innerHTML = solve(inputReaction, true);
});
