const form = document.querySelector('form')!;
const input = document.querySelector('input[type="text"]') as HTMLInputElement;
const result = document.querySelector('#result')!;

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = input.value;
  result.innerHTML = `Hello, ${name}!`;
});

