// Variables
const HIDDEN_CLASS = 'hidden';

const TREE_SIZE = Symbol('TREE_SIZE');

const STREET_SCENE = Symbol('STREET_SCENE');
const TREE_SCENE = Symbol('TREE_SCENE');
const HOME_SCENE = Symbol('HOME_SCENE');
const KITCHEN_SCENE = Symbol('KITCHEN_SCENE');

// Classes
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
      if (!this.isViewed()) this.#showGreeting();
    } else {
      this.#showGreetingForm();
    }
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

      openButton.textContent = 'Відкрити';
      copyButton.textContent = 'Зкопіювати';

      openButton.addEventListener('click', () => {
        window.open(url.toString(), '_blank').focus();
      });

      copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(url.toString());
        alert('Зкопійовано!');
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

class GameController {
  static start() {
    SceneController.instance.init(STREET_SCENE);
    SmartphoneController.instance.turnOn();
  }

  static get treeSize() {
    return Storage.get(TREE_SIZE.toString()) || 0;
  }
}

class SceneController {
  #scenes = {};
  #currentScene;
  #effects = new Set();

  #sceneContainer;
  #gameContainer;
  #background;

  static #instance;

  static get instance() {
    if (!SceneController.#instance) {
      SceneController.#instance = new SceneController();
    }

    return SceneController.#instance;
  }

  constructor() {
    this.#sceneContainer = document.getElementById('scene');
    this.#gameContainer = document.getElementById('game-container');
    this.#background = document.getElementById('background');
  }

  init(scene) {
    this.loadScenes();
    this.change(scene);
  }

  loadScenes() {
    Object.getOwnPropertySymbols(sceneDict).forEach((key) => {
      const sceneData = sceneDict[key];
      this.#scenes[key] = new Scene(sceneData);

      // Init buttons
      const buttonId = `${sceneData.name}-button`;
      const buttonElement = document.getElementById(buttonId);
      buttonElement.addEventListener('click', () => {
        SceneController.instance.change(key);
      });

      // Init effects
      const { effects = [] } = sceneData;
      effects.forEach(this.addEffect.bind(this));
    });
  }

  change(scene) {
    if (!this.#scenes[scene]) return;

    const sceneInstance = this.#scenes[scene];

    if (this.#currentScene) {
      this.#sceneContainer.classList.remove(
        this.#currentScene.className
      );
      this.#gameContainer.classList.remove(
        this.#currentScene.className
      );
      this.#background.classList.remove(this.#currentScene.className);
    }

    this.#currentScene = sceneInstance;

    this.#sceneContainer.classList.add(sceneInstance.className);
    this.#gameContainer.classList.add(sceneInstance.className);
    this.#background.classList.add(sceneInstance.className);

    if ([TREE_SCENE, HOME_SCENE].includes(scene)) {
      const sceneTreeClass = `${sceneInstance.className}-${GameController.treeSize}`;
      this.#sceneContainer.classList.add(sceneTreeClass);
      this.#background.classList.add(sceneTreeClass);
    }

    Object.getOwnPropertySymbols(this.#scenes).forEach((key) => {
      const scene = this.#scenes[key];
      const buttonElement = document.getElementById(
        `${scene.name}-button`
      );
      if (sceneInstance.buttons.includes(key)) {
        DOMHelper.showElements(buttonElement);
      } else {
        DOMHelper.hideElements(buttonElement);
      }
    });

    this.applyEffects(sceneInstance.effects);
  }

  addEffect(effect) {
    if (this.#effects.has(effect)) return;
    this.#sceneContainer.prepend(effect.container);
    effect.initEffect();
    DOMHelper.hideElements(effect.container);
    this.#effects.add(effect);
  }

  applyEffects(effects = []) {
    this.#effects.forEach((effect) => {
      effect.off();
    });
    effects.forEach((effect) => {
      effect.on();
    });
  }
}

class Scene {
  constructor({ name, buttons, effects }) {
    this.name = name;
    this.buttons = buttons;
    this.className = `scene-${name}`;
    this.effects = effects;
  }
}

class SmartphoneController {
  static #instance;

  #showSmartphone = false;

  static get instance() {
    if (!SmartphoneController.#instance) {
      SmartphoneController.#instance = new SmartphoneController();
    }

    return SmartphoneController.#instance;
  }

  constructor() {
    this.button = document.getElementById('smartphone-button');
    this.smartphone = document.getElementById('smartphone');
  }

  turnOn() {
    this.#initToggle();
  }

  #initToggle() {
    this.button.addEventListener('click', () => {
      this.#showSmartphone = !this.#showSmartphone;
      if (this.#showSmartphone) {
        DOMHelper.showElements(smartphone);
      } else {
        DOMHelper.hideElements(smartphone);
      }
    });
  }
}

class SceneEffect {
  container;

  on() {
    DOMHelper.showElements(this.container);
  }

  off() {
    DOMHelper.hideElements(this.container);
  }

  initEffect() {
    console.log('Init scene effect');
  }
}

class SnowGameEffect extends SceneEffect {
  static #instance;

  snowflakeEmoji = '❄️';
  moneyEmoji = '💸';
  moneyEmojiValue = 1;
  numberOfSnowflakes = 100;
  snowflakeClassName = 'snowflake';

  static get instance() {
    if (!SnowGameEffect.#instance) {
      const effect = new SnowGameEffect();
      effect.createContainer();
      SnowGameEffect.#instance = effect;
    }

    return SnowGameEffect.#instance;
  }

  createContainer() {
    this.container = document.createElement('div');
    this.container.id = 'snowflake-effect-container';
  }

  initEffect() {
    for (let i = 0; i < this.numberOfSnowflakes; i++) {
      this.createSnowflake(i);
    }
  }

  createSnowflake(i) {
    const isMoney = i % 20 === 0 && i !== 0;
    const snowflake = document.createElement('div');
    // if (isMoney) {
    //   snowflake.onclick = clickMoneySnowflake.bind(this, snowflake);
    // }
    snowflake.className = `${this.snowflakeClassName} ${
      isMoney ? 'money' : ''
    }`;
    const containerWidth = this.container.clientWidth;
    snowflake.style.left = `${Math.random() * containerWidth}px`;
    snowflake.style.animationDuration = `${Math.random() * 5 + 5}s`;
    snowflake.innerText = isMoney
      ? this.moneyEmoji
      : this.snowflakeEmoji;
    this.container.appendChild(snowflake);
  }
}

// Logic
const sceneDict = {
  [STREET_SCENE]: {
    name: 'street',
    buttons: [TREE_SCENE, HOME_SCENE],
    effects: [SnowGameEffect.instance],
  },
  [TREE_SCENE]: {
    name: 'tree',
    buttons: [STREET_SCENE, HOME_SCENE],
    effects: [SnowGameEffect.instance],
  },
  [HOME_SCENE]: {
    name: 'home',
    buttons: [TREE_SCENE, STREET_SCENE, KITCHEN_SCENE],
  },
  [KITCHEN_SCENE]: {
    name: 'kitchen',
    buttons: [HOME_SCENE],
  },
};

document.addEventListener('DOMContentLoaded', () => {
  Greeting.instance.greet();
  GameController.start();
});
