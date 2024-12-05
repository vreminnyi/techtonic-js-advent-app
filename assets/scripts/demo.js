let message = 'Hello 👋'; // String
const snowflake = '❄️'; // String
let balance = 0; // Number or BigInt
let isSnowing = true; // Boolean
let gift = null; // Null
let secret; // undefined
let street = Symbol('street'); // Symbol

const isNewGreeting = false;

function encode(text) {
  return btoa(encodeURIComponent(text));
}

function decode(text) {
  return decodeURIComponent(atob(text));
}

function getHash() {
  const url = new URL(window.location.href);
  return url.searchParams.get('hash') || '';
}

function greet(title, text) {
  const greetingCard = document.getElementById('greeting-card');

  const titleElement = document.createElement('h1');
  const textElement = document.createElement('p');

  titleElement.textContent = title;
  textElement.textContent = text;

  greetingCard.prepend(titleElement, textElement);
  greetingCard.classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  const greetingForm = document.getElementById('greeting-form');
  const greetingCard = document.getElementById('greeting-card');

  const hash = getHash();

  if (isNewGreeting || !hash) {
    greetingCard.classList.remove('hidden');
    greetingForm.classList.remove('hidden');

    greetingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const data = new FormData(e.target);
      const obj = Object.fromEntries(data);
      const hash = encode(JSON.stringify(obj));

      const url = new URL(window.location.href);
      url.searchParams.set('hash', hash);

      const openButton = document.createElement('button');
      const copyButton = document.createElement('button');

      openButton.textContent = 'Відкрити';
      copyButton.textContent = 'Зкопіювати';

      openButton.addEventListener('click', () => {
        window.location.href = url.toString();
      });

      copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(url.toString());
        alert('Зкопійовано!');
      });

      const greetingLink = document.getElementById('greeting-link');

      greetingLink.textContent = '';
      greetingLink.append(openButton, copyButton);
      greetingLink.classList.remove('hidden');
    });
  } else {
    const data = JSON.parse(decode(hash));
    greet(data.title, data.text);
  }
});
