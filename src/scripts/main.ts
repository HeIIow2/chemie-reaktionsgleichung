import { solve } from "./reaction";


const form = document.querySelector('form')!;
const input = document.getElementById('reaktion') as HTMLInputElement;
const result = document.getElementById('result')!;

console.log("Initializing Solver.");

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const inputReaction = input.value;
  result.innerHTML = solve(inputReaction, true);
});
