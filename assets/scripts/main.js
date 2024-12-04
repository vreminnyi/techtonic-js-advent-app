const HIDDEN_CLASS = 'hidden';

class Encoder {
  static encode(text) {
    return btoa(encodeURIComponent(text));
  }

  static decode(encodedText) {
    try {
      return decodeURIComponent(atob(encodedText));
    } catch (e) {
      console.error('Decoding error!', e);
      return null;
    }
  }
}

class Storage {
  static localStorage = localStorage;

  static has(key) {
    return localStorage.getItem(key) !== null;
  }

  static get(key) {
    let item = localStorage.getItem(key);

    if (typeof item !== 'string') return item;

    if (item === 'undefined') return undefined;

    if (item === 'null') return null;

    // Check for numbers and floats
    if (/^'-?\d{1,}?\.?\d{1,}'$/.test(item)) return Number(item);

    // Check for serialized objects and arrays
    if (item[0] === '{' || item[0] === '[') return JSON.parse(item);

    return item;
  }

  static set(key, value) {
    if (typeof key !== 'string') {
      throw new TypeError(
        `localStorage: Key must be a string. (reading '${key}')`
      );
    }

    if (typeof value === 'object' || typeof value === 'array') {
      value = JSON.stringify(value);
    }

    localStorage.setItem(key, value);
  }

  static remove(key) {
    localStorage.removeItem(key);
  }
}

class DOMHelper {
  static prependElements(parent, ...elements) {
    elements.forEach((el) => parent.prepend(el));
  }

  static removeElements(...elements) {
    elements.forEach((el) => el.remove());
  }

  static hideElements(...elements) {
    elements.forEach((el) => el.classList.add(HIDDEN_CLASS));
  }

  static showElements(...elements) {
    elements.forEach((el) => el.classList.remove(HIDDEN_CLASS));
  }
}

class Greeting {
  static #instance;
  static hashParam = 'hash';

  #hash = '';
  title = '';
  text = 'Happy Holidays!';

  static get instance() {
    if (!Greeting.#instance) {
      Greeting.#instance = new Greeting();
    }

    return Greeting.#instance;
  }

  isViewed() {
    return (
      Storage.has(Greeting.hashParam) &&
      Storage.get(Greeting.hashParam) === this.#hash
    );
  }

  greet() {
    this.#parseHashData();

    if (this.#hash) {
      if (this.isViewed()) return true;
      this.#showGreeting();
    } else {
      this.#showGreetingForm();
    }

    return false;
  }

  #showGreetingForm() {
    const overlayElement = document.getElementById(
      'greeting-card-overlay'
    );
    const greetingForm = document.getElementById('greeting-form');
    const greetingLink = document.getElementById('greeting-link');
    const cardElement = document.getElementById('greeting-card');

    DOMHelper.showElements(cardElement, greetingForm, overlayElement);

    greetingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(e.target);
      const formProps = Object.fromEntries(formData);
      const hash = Greeting.instance.create(
        formProps.title,
        formProps.text
      );
      const url = new URL(window.location.href);
      url.searchParams.set(Greeting.hashParam, hash);

      const openButton = document.createElement('button');
      const copyButton = document.createElement('button');

      openButton.textContent = 'Open';
      copyButton.textContent = 'Copy';

      openButton.addEventListener('click', () => {
        window.open(url.toString(), '_blank').focus();
      });

      copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(url.toString());
        alert('Copied!');
      });

      DOMHelper.removeElements(...greetingLink.childNodes);
      DOMHelper.prependElements(greetingLink, openButton, copyButton);

      DOMHelper.showElements(greetingLink);
    });
  }

  #showGreeting() {
    const overlayElement = document.getElementById(
      'greeting-card-overlay'
    );
    const startButton = document.getElementById('start-game');
    const cardElement = document.getElementById('greeting-card');

    const titleElement = document.createElement('h1');
    const textElement = document.createElement('p');

    titleElement.textContent = this.title;
    textElement.textContent = this.text;

    cardElement.prepend(titleElement, textElement);
    DOMHelper.showElements(cardElement, overlayElement, startButton);

    startButton.addEventListener('click', () => {
      Storage.set(Greeting.hashParam, this.#hash);
      DOMHelper.hideElements(cardElement, overlayElement);
      DOMHelper.removeElements(cardElement, overlayElement);
      GameController.start();
    });
  }

  getHash() {
    if (this.#hash.length) return this.#hash;

    const url = new URL(document.location.href);

    if (!url.searchParams.has(Greeting.hashParam)) return this.#hash;

    return url.searchParams.get(Greeting.hashParam);
  }

  #parseHashData() {
    try {
      this.#hash = this.getHash();
      const decoded = Encoder.decode(this.#hash);
      if (!decoded) return;

      const { title, text } = JSON.parse(decoded);
      this.title = title;
      this.text = text;
    } catch (e) {
      console.error('Parse hash failure!', e);
    }
  }

  create(title, text) {
    return Encoder.encode(JSON.stringify({ title, text }));
  }
}

const TREE_SIZE = Symbol('TREE_SIZE');

class GameController {
  static start() {
    SceneController.instance.init(STREET_SCENE);
  }

  static get treeSize() {
    return Storage.get(TREE_SIZE.toString()) || 0;
  }
}

const STREET_SCENE = Symbol('STREET_SCENE');
const TREE_SCENE = Symbol('TREE_SCENE');
const HOME_SCENE = Symbol('HOME_SCENE');
const KITCHEN_SCENE = Symbol('KITCHEN_SCENE');
const SMARTPHONE_SCENE = Symbol('SMARTPHONE_SCENE');

const sceneDict = {
  [STREET_SCENE]: {
    name: 'street',
    buttons: [
      TREE_SCENE,
      HOME_SCENE,
      KITCHEN_SCENE,
      SMARTPHONE_SCENE,
    ],
  },
  [TREE_SCENE]: {
    name: 'tree',
    buttons: [STREET_SCENE, SMARTPHONE_SCENE],
  },
  [HOME_SCENE]: {
    name: 'home',
    buttons: [
      TREE_SCENE,
      STREET_SCENE,
      KITCHEN_SCENE,
      SMARTPHONE_SCENE,
    ],
  },
  [KITCHEN_SCENE]: {
    name: 'kitchen',
    buttons: [HOME_SCENE, SMARTPHONE_SCENE],
  },
  [SMARTPHONE_SCENE]: {
    name: 'smartphone',
    buttons: [
      STREET_SCENE,
      TREE_SCENE,
      HOME_SCENE,
      KITCHEN_SCENE,
      SMARTPHONE_SCENE,
    ],
  },
};

class SceneController {
  #scenes = {};
  #currentScene;
  static #instance;

  static get instance() {
    if (!SceneController.#instance) {
      SceneController.#instance = new SceneController();
    }

    return SceneController.#instance;
  }

  init(scene) {
    this.loadScenes();
    this.change(scene);
  }

  loadScenes() {
    Object.getOwnPropertySymbols(sceneDict).forEach((key) => {
      const sceneData = sceneDict[key];
      this.#scenes[key] = new Scene(sceneData);

      const buttonId = `${sceneData.name}-button`;
      const buttonElement = document.getElementById(buttonId);
      buttonElement.addEventListener('click', () => {
        SceneController.instance.change(key);
      });
    });
  }

  change(scene) {
    if (!this.#scenes[scene]) return;

    const sceneInstance = this.#scenes[scene];

    const sceneContainer = document.getElementById('scene');
    const gameContainer = document.getElementById('game-container');
    const background = document.getElementById('background');

    if (this.#currentScene) {
      sceneContainer.classList.remove(this.#currentScene.className);
      gameContainer.classList.remove(this.#currentScene.className);
      background.classList.remove(this.#currentScene.className);
    }

    this.#currentScene = sceneInstance;

    sceneContainer.classList.add(sceneInstance.className);
    gameContainer.classList.add(sceneInstance.className);
    background.classList.add(sceneInstance.className);

    if ([TREE_SCENE, HOME_SCENE].includes(scene)) {
      const sceneTreeClass = `${sceneInstance.className}-${GameController.treeSize}`;
      sceneContainer.classList.add(sceneTreeClass);
      background.classList.add(sceneTreeClass);
    }

    Object.getOwnPropertySymbols(this.#scenes).forEach((key) => {
      const scene = this.#scenes[key];
      const buttonElement = document.getElementById(
        `${scene.name}-button`
      );
      if (sceneInstance.buttons.includes(key)) {
        buttonElement.classList.remove('hidden');
      } else {
        buttonElement.classList.add('hidden');
      }
    });
  }
}

class Scene {
  constructor({ name, buttons }) {
    this.name = name;
    this.buttons = buttons;
    this.className = `scene-${name}`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const isViewed = Greeting.instance.greet();
  if (isViewed) GameController.start();
});
