// Змінні
const HIDDEN_CLASS = 'hidden';
const INVISIBLE_CLASS = 'invisible';

const TREE_SIZE = Symbol('TREE_SIZE');

const STREET_SCENE = Symbol('STREET_SCENE');
const TREE_SCENE = Symbol('TREE_SCENE');
const HOME_SCENE = Symbol('HOME_SCENE');
const KITCHEN_SCENE = Symbol('KITCHEN_SCENE');

const SNOWFLAKE_GAME = Symbol('SNOWFLAKE_GAME');
const MONEY = Symbol('MONEY');

// Класи
class Encoder {
  static encode(text) {
    if (!['string', 'number', 'boolean'].includes(typeof text)) {
      throw new TypeError('Input must be a string/number/boolean');
    }
    return btoa(encodeURIComponent(text));
  }

  static decode(encodedText) {
    if (typeof encodedText !== 'string') {
      console.error('Decoding error: Input must be a string');
      return null;
    }
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

  static concealElements(...elements) {
    elements.forEach((el) => el.classList.add(INVISIBLE_CLASS));
  }

  static revealElements(...elements) {
    elements.forEach((el) => el.classList.remove(INVISIBLE_CLASS));
  }
}

class Greeting {
  static #instance;
  static hashParam = 'hash';

  #hash = '';
  title = '';
  text = 'Веселих свят!';

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
        window.location.href = url.toString();
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
  static #instance;
  #games = {};

  #money = 0;
  #moneyContainer;
  #dialog;

  static get instance() {
    if (!GameController.#instance) {
      GameController.#instance = new GameController();
    }

    return GameController.#instance;
  }

  constructor() {
    this.#money = Number(
      Storage.get(MONEY.toString()) ?? this.#money
    );
  }

  start(options) {
    this.#moneyContainer = options.moneyText;
    this.#dialog = new HelperDialog({
      dialogText: options.helperDialog,
    });
    this.#initGames();
    SceneController.instance.init(options.scene);
    SmartphoneController.instance.turnOn();
    this.drawMoney();
  }

  get treeSize() {
    return Storage.get(TREE_SIZE.toString()) || 0;
  }

  showDialog(dialog) {
    this.#dialog.showDialog(dialog);
  }

  #initGames() {
    Object.getOwnPropertySymbols(gameDict).forEach((key) => {
      const { instance, options } = gameDict[key];
      this.#games[key] = new instance(this, options);
    });
  }

  startGame(game, options) {
    if (!this.#games[game]) return;
    return this.#games[game].on(options);
  }

  stopGames() {
    Object.getOwnPropertySymbols(this.#games).forEach((key) => {
      const game = this.#games[key];
      game.off();
    });
  }

  changeMoney(change) {
    this.#money += change;
    Storage.set(MONEY.toString(), this.#money);
    this.drawMoney();
  }

  drawMoney() {
    this.#moneyContainer.innerText = this.#money;
  }
}

class Game {
  isActive = false;

  constructor(controller, options) {
    this.controller = controller;
    this.options = options;
  }

  on() {
    this.isActive = true;
  }

  off() {
    this.isActive = false;
  }
}

class SnowflakeGame extends Game {
  #moneyEmoji = '💸';
  #moneyEmojiValue = 1;
  #numberOfMoney = 5;
  #speed = 1000;
  #snowflakeClassName = 'snowflake';
  #moneyClassName = 'money';
  #snowflakes = [];
  #container;
  #interval;

  constructor(controller, options) {
    super(controller, options);

    this.#moneyEmoji = this.options.moneyEmoji ?? this.#moneyEmoji;
    this.#moneyEmojiValue =
      this.options.moneyEmojiValue ?? this.#moneyEmojiValue;
    this.#numberOfMoney =
      this.options.numberOfMoney ?? this.#numberOfMoney;
    this.#snowflakeClassName =
      this.options.snowflakeClassName ?? this.#snowflakeClassName;
    this.#moneyClassName =
      this.options.moneyClassName ?? this.#moneyClassName;
    this.#container = this.options.container ?? this.#container;
    this.#speed = this.options.speed ?? this.#speed;
  }

  on() {
    super.on();

    if (!this.#container) return;
    this.#snowflakes = [];

    this.#interval = setInterval(() => {
      if (this.#numberOfMoney > this.#snowflakes.length) {
        this.createMoneySnowflake();
      }
    }, this.#speed);
  }

  off() {
    super.off();
    clearInterval(this.#interval);
    DOMHelper.removeElements(...this.#snowflakes);
    this.#snowflakes = [];
    return true;
  }

  createMoneySnowflake() {
    const snowflake = document.createElement('div');

    snowflake.classList.add(this.#snowflakeClassName);
    snowflake.classList.add(this.#moneyClassName);

    snowflake.addEventListener('click', (e) => {
      this.clickMoneySnowflake(e.target);
    });

    const containerWidth = this.#container.clientWidth;
    const shift = Math.min(Math.random(), 0.9);
    snowflake.style.left = `${shift * containerWidth}px`;
    snowflake.style.animationDuration = `${Math.random() * 5 + 5}s`;
    snowflake.innerText = this.#moneyEmoji;
    this.#container.appendChild(snowflake);
    this.#snowflakes.push(snowflake);
  }

  clickMoneySnowflake(element) {
    DOMHelper.hideElements(element);
    const containerWidth = this.#container.clientWidth;
    element.style.left = `${Math.random() * containerWidth}px`;
    this.controller.changeMoney(this.#moneyEmojiValue);
    setTimeout(() => {
      if (element) DOMHelper.showElements(element);
    }, 5000 + Math.random() * 1000);
  }
}

class SceneController {
  #scenes = {};
  #currentScene;
  #effects = new Set();

  #sceneContainer;
  #gameContainer;
  #background;

  #sceneDialogTimeout;

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

  get currentScene() {
    return this.#currentScene;
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
    const sceneInstance = this.#scenes[scene];

    if (!sceneInstance) return;

    if (this.#currentScene) {
      const currentClass = this.#currentScene.className;
      this.#sceneContainer.classList.remove(currentClass);
      this.#gameContainer.classList.remove(currentClass);
      this.#background.classList.remove(currentClass);
    }

    this.#currentScene = sceneInstance;
    const currentClass = sceneInstance.className;

    this.#sceneContainer.classList.add(currentClass);
    this.#gameContainer.classList.add(currentClass);
    this.#background.classList.add(currentClass);

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

    const options = {
      sceneContainer: this.#sceneContainer,
      background: this.#background,
    };

    sceneInstance.applyEffects(options);
    sceneInstance.gamesOn(options);
    setTimeout(() => this.showSceneDialog(), 1000);
  }

  showSceneDialog() {
    clearTimeout(this.#sceneDialogTimeout);
    const { dialogs = [] } = this.#currentScene;
    const randomIndex = Math.floor(Math.random() * dialogs.length);
    GameController.instance.showDialog(dialogs[randomIndex]);
    this.#sceneDialogTimeout = setTimeout(
      () => this.showSceneDialog(),
      30000
    );
  }

  addEffect(effect) {
    if (this.#effects.has(effect)) return;

    if (effect.container) {
      this.#sceneContainer.prepend(effect.container);
    }

    effect.initEffect();

    if (effect.container) {
      DOMHelper.concealElements(effect.container);
    }

    this.#effects.add(effect);
  }

  applyEffects(effects = [], opts) {
    this.#effects.forEach((effect) => {
      effect.off(opts);
    });

    effects.forEach((effect) => {
      effect.on(opts);
    });
  }
}

class Scene {
  constructor({ name, buttons, effects, games, dialogs }) {
    this.name = name;
    this.buttons = buttons;
    this.className = `scene-${name}`;
    this.effects = effects;
    this.games = games;
    this.dialogs = dialogs;
  }

  applyEffects(opts) {
    return SceneController.instance.applyEffects(this.effects, opts);
  }

  gamesOn(opts) {
    GameController.instance.stopGames();
    return this.games.forEach((game) =>
      GameController.instance.startGame(game, opts)
    );
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
  isActive = false;
  container;

  on() {
    this.isActive = true;
    DOMHelper.revealElements(this.container);
  }

  off() {
    this.isActive = false;
    DOMHelper.concealElements(this.container);
  }

  initEffect() {
    console.log(`Init ${this.constructor.name}`);
  }
}

class SnowEffect extends SceneEffect {
  static #instance;
  #numberOfSnowflakes = 100;
  #snowflakeClassName = 'snowflake';
  #snowflakeEmoji = '❄️';

  static get instance() {
    if (!SnowEffect.#instance) {
      const effect = new SnowEffect();
      effect.createContainer();
      SnowEffect.#instance = effect;
    }

    return SnowEffect.#instance;
  }

  get snowflakeClass() {
    return this.#snowflakeClassName;
  }

  createContainer() {
    this.container = document.createElement('div');
    this.container.id = 'snowflake-effect-container';
  }

  initEffect() {
    for (let i = 0; i < this.#numberOfSnowflakes; i++) {
      setTimeout(this.createSnowflake.bind(this), i * 100);
    }
  }

  createSnowflake() {
    const snowflake = document.createElement('div');

    snowflake.classList.add(this.#snowflakeClassName);
    const containerWidth = this.container.clientWidth;
    snowflake.style.left = `${Math.random() * containerWidth}px`;
    snowflake.style.animationDuration = `${Math.random() * 5 + 5}s`;
    snowflake.innerText = this.#snowflakeEmoji;
    this.container.appendChild(snowflake);
  }
}

class ChristmasTreeEffect extends SceneEffect {
  static #instance;

  static get instance() {
    if (!ChristmasTreeEffect.#instance) {
      const effect = new ChristmasTreeEffect();
      ChristmasTreeEffect.#instance = effect;
    }

    return ChristmasTreeEffect.#instance;
  }

  on(opts) {
    this.isActive = true;
    const sceneTreeClass = `tree-${GameController.instance.treeSize}`;
    opts.sceneContainer.classList.add(sceneTreeClass);
    opts.background.classList.add(sceneTreeClass);
  }

  off(opts) {
    this.isActive = false;
    const sceneTreeClass = `tree-${GameController.instance.treeSize}`;
    opts.sceneContainer.classList.remove(sceneTreeClass);
    opts.background.classList.remove(sceneTreeClass);
  }
}

class Countdown {
  static #interval;
  static #time = {};

  static start(container) {
    clearInterval(Countdown.#interval);
    Object.keys(timeDict).forEach((unit) => {
      const timeBlock = document.createElement('div');
      timeBlock.className = 'time-block';

      const timeValue = document.createElement('div');
      timeValue.className = 'time';
      timeValue.id = unit;
      timeValue.textContent = '00';

      const timeLabel = document.createElement('div');
      timeLabel.className = 'label';
      timeLabel.textContent = timeDict[unit];

      timeBlock.appendChild(timeValue);
      timeBlock.appendChild(timeLabel);

      container.appendChild(timeBlock);
      Countdown.#time[unit] = timeValue;
    });
    Countdown.#updateCountdown();
    Countdown.#interval = setInterval(
      Countdown.#updateCountdown,
      1000
    );
  }

  static #updateCountdown() {
    const now = new Date();
    const nextNewYear = new Date(now.getFullYear() + 1, 0, 1);

    let diff = nextNewYear - now;
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);

    if (startOfDay.getTime() === firstDayOfYear.getTime()) {
      diff = 0;
    }

    const time = {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      ),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
    };

    Object.keys(time).forEach((unit) => {
      if (!Countdown.#time[unit]) return;
      Countdown.#time[unit].textContent = time[unit]
        .toString()
        .padStart(2, '0');
    });
  }
}

class HelperDialog {
  #charIndex = 0;
  #typeTimeout;

  constructor(options) {
    this.dialogText = options.dialogText;
  }

  #typeText(content) {
    if (this.#charIndex >= content.length) return;

    this.dialogText.textContent += content.charAt(this.#charIndex);
    this.#charIndex++;
    this.#typeTimeout = setTimeout(() => this.#typeText(content), 50);
  }

  showDialog(dialog) {
    clearTimeout(this.#typeTimeout);
    this.dialogText.textContent = '';
    this.#charIndex = 0;
    if (dialog.type === 'text') {
      this.#typeText(dialog.content);
    } else if (dialog.type === 'question') {
      this.#typeText(dialog.content);
    }
  }
}

class Dialog {
  constructor(content, options = {}) {
    this.content = content;
    this.type = options.type ?? 'text';
    this.options = options;
  }

  get() {
    if (this.type === 'text') return this.getText();
  }

  getText() {
    return this.content;
  }
}

// Логіка
const sceneDict = {
  [STREET_SCENE]: {
    name: 'street',
    buttons: [TREE_SCENE, HOME_SCENE],
    effects: [SnowEffect.instance],
    games: [SNOWFLAKE_GAME],
    dialogs: [
      new Dialog('З наступаючим новим роком 🎅'),
      new Dialog(
        'Чому сніговик завжди у гарному настрої? Бо він живе у моменті й не хвилюється про те, що може розтанути!'
      ),
      new Dialog(
        'Хочеш пограти в сніжки? Сніг сьогодні саме той, що треба!'
      ),
      new Dialog(
        'Відчуй свіжий зимовий вітер і запах ялинки у повітрі.'
      ),
      new Dialog(
        'Сніжинки танцюють у повітрі, запрошуючи нас до казкового світу.'
      ),
      new Dialog(
        'На вулиці так холодно, що я тільки що бачив, як сніжинка шепнула іншій: "Тримайся, ми це переживемо!"'
      ),
      new Dialog('Нехай цей рік буде для тебе особливим! ✨'),
      new Dialog('Зима - це час чудес! ⛄'),
    ],
  },
  [TREE_SCENE]: {
    name: 'tree',
    buttons: [STREET_SCENE, HOME_SCENE],
    effects: [SnowEffect.instance, ChristmasTreeEffect.instance],
    games: [],
    dialogs: [
      new Dialog(
        'Чуєш, як тріщать гілочки на ялинці? Це від морозу.'
      ),
      new Dialog('Мені подобається запах свіжого снігу та хвої.'),
      new Dialog(
        'Відчуй свіжий зимовий вітер і запах ялинки у повітрі.'
      ),
      new Dialog(
        'Задній двір перетворився на справжню зимову казку. Давайте зробимо сніговика!'
      ),
      new Dialog(
        'Бажаю тобі щасливого Нового року та веселих свят! 🎄'
      ),
    ],
  },
  [HOME_SCENE]: {
    name: 'home',
    buttons: [TREE_SCENE, STREET_SCENE, KITCHEN_SCENE],
    effects: [ChristmasTreeEffect.instance],
    games: [],
    dialogs: [
      new Dialog(
        'Час зібратися разом, щоб святкувати та обмінюватися подарунками!'
      ),
      new Dialog(
        'Я попросив Санту принести мені гарний настрій на Різдво. А він відповів: "Немає проблем, просто сам собі подаруй вихідний!"'
      ),
      new Dialog(
        'У цьому теплому куточку святкової зали кожен знайде місце для себе.'
      ),
      new Dialog(
        'Підняти келихи за святковий настрій і за те, щоб всі мрії здійснилися.'
      ),
      new Dialog(
        'У гостинній залі завжди панує атмосфера радості та сімейного затишку.'
      ),
      new Dialog(
        'Що зробити, якщо ти не відчуваєш святкової атмосфери? Зʼїж мандаринку – це завжди працює!'
      ),
      new Dialog(
        'Смачний запах ялинки і печива наповнює весь будинок.'
      ),
      new Dialog(
        'Подивися, який гарний новорічний стіл! Скільки смаколиків!'
      ),
    ],
  },
  [KITCHEN_SCENE]: {
    name: 'kitchen',
    buttons: [HOME_SCENE],
    games: [],
    dialogs: [
      new Dialog(
        'Запах свіжоспечених пирогів та глінтвейну наповнює дім.'
      ),
      new Dialog(
        'Час прикрашати імбирні пряники та готувати святкові ласощі!'
      ),
      new Dialog(
        'Найкращі святкові вечори починаються з дружньої кухні.'
      ),
      new Dialog(
        'Не забудьте залишити трохи печива та молока для Санти!'
      ),
      new Dialog(
        'Який смачний аромат випічки! Хотілося б спробувати!'
      ),
      new Dialog('На кухні так затишно і тепло.'),
    ],
  },
};

const gameDict = {
  [SNOWFLAKE_GAME]: {
    instance: SnowflakeGame,
    options: {
      moneyEmoji: '💸',
      moneyEmojiValue: 1,
      numberOfMoney: 10,
      speed: 1000,
      snowflakeClassName: SnowEffect.instance.snowflakeClass,
      container: SnowEffect.instance.container,
    },
  },
};

const timeDict = {
  days: 'дн.',
  hours: 'год.',
  minutes: 'хв.',
  seconds: 'сек.',
};

document.addEventListener('DOMContentLoaded', () => {
  const gameOptions = {
    scene: STREET_SCENE,
    moneyText: document.getElementById('money'),
    helperDialog: document.getElementById('helper-dialog'),
  };

  Greeting.instance.greet();
  GameController.instance.start(gameOptions);
  Countdown.start(document.getElementById('countdown'));
});
