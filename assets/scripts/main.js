// Змінні
const HIDDEN_CLASS = 'hidden';
const INVISIBLE_CLASS = 'invisible';
const SUCCESS_CLASS = 'success';
const FAILURE_CLASS = 'failure';

const TREE_SIZE = Symbol('TREE_SIZE');

const STREET_SCENE = Symbol('STREET_SCENE');
const TREE_SCENE = Symbol('TREE_SCENE');
const HOME_SCENE = Symbol('HOME_SCENE');
const KITCHEN_SCENE = Symbol('KITCHEN_SCENE');

// Константи для ігор
const SNOWFLAKE_GAME = Symbol('SNOWFLAKE_GAME');
const SNOWFLAKE_GAME_STATE = Symbol('SNOWFLAKE_GAME_STATE');
const GROW_TREE_GAME = Symbol('GROW_TREE_GAME');
const GROW_TREE_STATE = Symbol('GROW_TREE_STATE');
const GROW_TREE_MAX_HEIGHT = 250;
const GROW_TREE_HEIGHT_LEVEL = [
  0,
  20,
  60,
  100,
  120,
  150,
  200,
  GROW_TREE_MAX_HEIGHT,
];
const GROW_TREE_ACTION_PLANT = Symbol.for('GROW_TREE_ACTION_PLANT');
const GROW_TREE_ACTION_WATER = Symbol.for('GROW_TREE_ACTION_WATER');
const GROW_TREE_ACTION_FILL = Symbol.for('GROW_TREE_ACTION_FILL');
const GROW_TREE_ACTION_PEST = Symbol.for('GROW_TREE_ACTION_PEST');
const HELPER_GAME = Symbol('HELPER_GAME');
const HELPER_GAME_STATE = Symbol('HELPER_GAME_STATE');
const MUSIC_GAME = Symbol('MUSIC_GAME');
const MUSIC_GAME_STATE = Symbol('MUSIC_GAME_STATE');

// Dialog
const DIALOG_TEXT = Symbol('DIALOG_TEXT');
const DIALOG_QUIZ = Symbol('DIALOG_QUIZ');
const DIALOG_TYPE = {
  text: DIALOG_TEXT,
  quiz: DIALOG_QUIZ,
};

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
    elements.forEach((el) => (el ? el.remove() : null));
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
      GameController.instance.start();
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

  get treeSize() {
    return this.#games[GROW_TREE_GAME].treeSize ?? 999;
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
    this.drawMoney(0);
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

  get money() {
    return Number(this.#money);
  }

  changeMoney(change) {
    this.#money += Number(change);
    Storage.set(MONEY.toString(), this.#money);
    this.drawMoney();
  }

  drawMoney(duration = 1000) {
    const currentMoney = parseInt(this.#moneyContainer.innerText, 10);
    const increment =
      (this.#money - currentMoney) / (duration / 16.67);

    let currentValue = currentMoney;

    const updateCounter = () => {
      currentValue += increment;
      if (
        (increment > 0 && currentValue >= this.#money) ||
        (increment < 0 && currentValue <= this.#money)
      ) {
        this.#moneyContainer.textContent = this.#money;
      } else {
        this.#moneyContainer.textContent = Math.round(currentValue);
        requestAnimationFrame(updateCounter);
      }
    };

    updateCounter();
  }
}

class Game {
  container;
  containerId = 'game-container';
  isActive = false;
  dialogs = [];
  dialogTimeout;

  constructor(controller, options = {}) {
    this.controller = controller;
    this.options = options;
    this.dialogs = this.options.dialogs ?? this.dialogs;
  }

  on() {
    this.isActive = true;
    this.createGameContainer();
    setTimeout(this.showDialog.bind(this), 10000);
  }

  off() {
    this.isActive = false;
    if (this.container) {
      DOMHelper.removeElements(this.container);
      this.container = null;
    }
    if (this.dialogTimeout) clearTimeout(this.dialogTimeout);
  }

  createGameContainer() {
    if (this.container || !this.containerId) return;

    this.container = document.createElement('div');
    this.container.id = this.containerId;
    SceneController.instance.sceneContainer.appendChild(
      this.container
    );
  }

  showDialog() {
    if (!this.dialogs.length || !this.isActive) return;
    clearTimeout(this.dialogTimeout);
    const randomIndex = Math.floor(
      Math.random() * this.dialogs.length
    );
    GameController.instance.showDialog(this.dialogs[randomIndex]);
    this.dialogTimeout = setTimeout(() => this.showDialog(), 20000);
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
  #interval;
  #state;

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
    this.container = this.options.container ?? this.container;
    this.#speed = this.options.speed ?? this.#speed;
    this.dialogs = this.options.dialogs ?? this.dialogs;

    if (Storage.has(SNOWFLAKE_GAME_STATE.toString())) {
      this.#state = Storage.get(SNOWFLAKE_GAME_STATE.toString());
    } else {
      this.#state = {
        collected: 0,
      };
    }
  }

  on() {
    this.isActive = true;

    if (!this.container) return;
    this.#snowflakes = [];

    this.#interval = setInterval(() => {
      if (this.#numberOfMoney > this.#snowflakes.length) {
        this.createMoneySnowflake();
      }
    }, this.#speed);

    setTimeout(this.showDialog.bind(this), 10000);
  }

  off() {
    this.isActive = false;
    clearInterval(this.#interval);
    DOMHelper.removeElements(...this.#snowflakes);
    this.#snowflakes = [];
    clearTimeout(this.dialogTimeout);
    return true;
  }

  createMoneySnowflake() {
    const snowflake = document.createElement('div');

    snowflake.classList.add(this.#snowflakeClassName);
    snowflake.classList.add(this.#moneyClassName);

    snowflake.addEventListener('click', (e) => {
      this.clickMoneySnowflake(e.target);
    });

    const containerWidth = this.container.clientWidth;
    const shift = Math.min(Math.random(), 0.9);
    snowflake.style.left = `${shift * containerWidth}px`;
    snowflake.style.animationDuration = `${Math.random() * 5 + 5}s`;
    snowflake.innerText = this.#moneyEmoji;
    this.container.appendChild(snowflake);
    this.#snowflakes.push(snowflake);
  }

  clickMoneySnowflake(element) {
    DOMHelper.hideElements(element);
    const containerWidth = this.container.clientWidth;
    element.style.left = `${Math.random() * containerWidth}px`;
    this.controller.changeMoney(this.#moneyEmojiValue);
    this.#state.collected++;
    this.#saveState();
    setTimeout(() => {
      if (element) DOMHelper.showElements(element);
    }, 5000 + Math.random() * 1000);
  }

  #saveState() {
    Storage.set(SNOWFLAKE_GAME_STATE.toString(), this.#state);
  }
}

class GrowTreeGame extends Game {
  containerId = 'grow-tree-game-container';
  #heightLabel;
  #statistic;
  #button;
  #state;
  pestsDialogs = [];
  dialogStorage;

  #pestCost = 50;

  constructor(controller, options) {
    super(controller, options);

    if (Storage.has(GROW_TREE_STATE.toString())) {
      this.#state = Storage.get(GROW_TREE_STATE.toString());
    } else {
      this.#state = {
        height: 0,
        level: 999,
        waterCost: 10,
        cooldown: 0,
        action: Symbol.keyFor(GROW_TREE_ACTION_PLANT),
        lastActionTime: 0,
        actions: [],
      };
    }

    this.pestsDialogs = options.pestsDialogs ?? this.pestsDialogs;
  }

  on() {
    super.on();
    this.createStatistic();
    this.createGameButton();
  }

  off() {
    super.off();
    if (this.container) DOMHelper.removeElements(this.container);
    if (this.#button) {
      DOMHelper.removeElements(this.#button);
      this.#button = null;
    }
  }

  createStatistic() {
    this.#statistic = document.createElement('div');
    this.#statistic.className = 'grow-tree-statistic';
    this.writeStatistic();
    this.container.appendChild(this.#statistic);
  }

  createGameButton() {
    if (this.#button) return;

    this.#button = document.createElement('button');
    this.#button.className = 'grow-tree-game-button';

    this.#button.addEventListener('click', () => {
      switch (this.#state.action) {
        case Symbol.keyFor(GROW_TREE_ACTION_PLANT):
          this.plantTree();
          break;
        case Symbol.keyFor(GROW_TREE_ACTION_WATER):
          this.waterTree();
          break;
        case Symbol.keyFor(GROW_TREE_ACTION_FILL):
          this.fillWater();
          break;
        case Symbol.keyFor(GROW_TREE_ACTION_PEST):
          this.removePests();
          break;
      }
      this.save();
    });

    this.setAction(this.#state.action);
    this.container.appendChild(this.#button);
  }

  plantTree() {
    const { level } = this.#state;

    this.setAction(Symbol.keyFor(GROW_TREE_ACTION_WATER));
    this.#state.height = 0;
    this.#state.level = 0;
    this.#state.waterCost = 10;
    this.#state.cooldown = 0;
    this.addAction(Symbol.keyFor(GROW_TREE_ACTION_PLANT), 0);
    this.save();

    this.#state.level = GROW_TREE_HEIGHT_LEVEL.findLastIndex(
      (height) => height <= this.#state.height
    );

    if (level !== this.#state.level) {
      SceneController.instance.change(TREE_SCENE);
    }
  }

  waterTree() {
    const money = GameController.instance.money;
    const { waterCost, action, level } = this.#state;

    const enoughMoney = money >= waterCost;
    const noPests = action !== Symbol.keyFor(GROW_TREE_ACTION_PEST);
    const noCooldown = this.waterCooldown === 0;

    if (!enoughMoney) {
      alert('Недостатньо коштів для поливу ☹️');
    }

    if (!noPests) {
      alert('Треба прибрати шкідників 🪳');
    }

    if (!noCooldown) {
      alert('Недостатньо води для поливу ☹️');
    }

    if (enoughMoney && noPests && noCooldown) {
      const waterCount = this.#state.actions.filter(
        ([action]) => action === Symbol.keyFor(GROW_TREE_ACTION_WATER)
      ).length;
      this.#state.height += 5;
      this.#state.waterCost = Math.ceil(this.#state.waterCost * 1.2);
      this.#state.cooldown = 30 * (waterCount + 1);
      this.#state.lastActionTime = Date.now();
      this.addAction(
        Symbol.keyFor(GROW_TREE_ACTION_WATER),
        waterCost
      );

      GameController.instance.changeMoney(-waterCost);

      this.#state.level = GROW_TREE_HEIGHT_LEVEL.findLastIndex(
        (height) => height <= this.#state.height
      );

      if (level !== this.#state.level) {
        SceneController.instance.change(TREE_SCENE);
      }

      const pests =
        Math.random() < 0.2 ? this.#state.cooldown - 1 : 0;

      this.setAction(
        Symbol.keyFor(GROW_TREE_ACTION_FILL),
        pests * 1000
      );
    }
  }

  fillWater() {
    if (
      confirm(
        `Витратити ${this.waterCooldownCost}грн., щоб скоріше набрати води?`
      )
    ) {
      const money = GameController.instance.money;
      const cost = this.waterCooldownCost;
      const enoughMoney = money >= cost;
      const noCooldown = this.waterCooldown !== 0;

      if (!enoughMoney) {
        alert('Недостатньо коштів для поливу ☹️');
      }

      if (!noCooldown) {
        alert('Недостатньо води для поливу ☹️');
      }

      if (enoughMoney && noCooldown) {
        this.#state.cooldown = 0;
        this.#state.lastActionTime = Date.now();
        this.addAction(Symbol.keyFor(GROW_TREE_ACTION_FILL), cost);

        GameController.instance.changeMoney(-cost);

        this.setAction(Symbol.keyFor(GROW_TREE_ACTION_WATER));
      }
    }
  }

  removePests() {
    if (
      confirm(
        `Витратити ${this.#pestCost}грн., щоб прибрати шкідників?`
      )
    ) {
      const { action } = this.#state;
      const money = GameController.instance.money;
      const enoughMoney = money >= this.#pestCost;
      const hasPests =
        action === Symbol.keyFor(GROW_TREE_ACTION_PEST);

      if (!enoughMoney) {
        alert('Недостатньо коштів для операції ☹️');
      }

      if (!hasPests) {
        alert('Шкідники відсутні 😊');
      }

      if (enoughMoney && hasPests) {
        this.#state.lastActionTime = Date.now();
        this.addAction(
          Symbol.keyFor(GROW_TREE_ACTION_PEST),
          this.#pestCost
        );

        GameController.instance.changeMoney(-this.#pestCost);

        this.dialogs = this.dialogStorage;

        this.setAction(Symbol.keyFor(GROW_TREE_ACTION_WATER));
      }
    }
  }

  setAction(action, pests = 0) {
    this.#state.action = action;

    switch (action) {
      case Symbol.keyFor(GROW_TREE_ACTION_PLANT):
        this.#button.textContent = '🎄 Посадити ялинку';
        break;
      case Symbol.keyFor(GROW_TREE_ACTION_WATER):
        this.#button.textContent = `🚿 Полити 💸${
          this.#state.waterCost
        }`;
        break;
      case Symbol.keyFor(GROW_TREE_ACTION_FILL):
        this.fillButtonText();
        break;
      case Symbol.keyFor(GROW_TREE_ACTION_PEST): {
        this.dialogStorage = this.dialogs;
        this.dialogs = this.pestsDialogs;
        this.#button.textContent = `🪳 Прибрати шкідників 💸${
          this.#pestCost
        }`;
        break;
      }
    }

    if (pests && pests <= this.#state.cooldown * 1000) {
      setTimeout(
        this.setAction.bind(this),
        pests,
        Symbol.keyFor(GROW_TREE_ACTION_PEST)
      );
    }
  }

  addAction(action, price) {
    this.#state.actions.push([action, price, Date.now()]);
  }

  writeStatistic() {
    let height = this.#state.height;

    if (this.#state.height < 100) {
      height = `${this.#state.height}см.`;
    } else {
      height = `${this.#state.height / 100}м.`;
    }

    const statisticObject = {
      money: 0,
      ...Object.keys(growTreeGameDict).reduce(
        (acc, key) => ({
          ...acc,
          [key]: { money: 0, count: 0, label: growTreeGameDict[key] },
        }),
        {}
      ),
    };

    const statistic = this.#state.actions.reduce((acc, row) => {
      const [action, cost, timestamp] = row;

      if (action === Symbol.keyFor(GROW_TREE_ACTION_PLANT)) {
        acc[action].count = new Date(timestamp).toLocaleDateString();
      } else {
        acc[action].count++;
        acc[action].money += cost;
      }

      acc.money += cost;

      return acc;
    }, statisticObject);

    let statisticText = `Статистика:
    Висота ялинки: ${height}`;

    Object.keys(statistic).forEach((key) => {
      if (key === 'money') return;
      statisticText += `\n${statistic[key].label}: ${statistic[key].count} 💸 ${statistic[key].money}`;
    });

    statisticText += `\nЗагалом витрачено: 💸 ${statistic.money}`;
    this.#statistic.innerText = statisticText;
  }

  get waterCooldown() {
    const { lastActionTime, cooldown } = this.#state;
    const now = Date.now();
    const timePassed = Math.floor((now - lastActionTime) / 1000);
    return Math.max(cooldown - timePassed, 0);
  }

  get waterCooldownCost() {
    const cooldown = this.waterCooldown;
    return Math.floor(cooldown * 0.1 + this.#state.waterCost / 2);
  }

  get treeSize() {
    return this.#state.level ?? 999;
  }

  fillButtonText() {
    const cooldown = this.waterCooldown;

    if (cooldown) {
      this.#button.textContent = `🪣 Вода набирається ще ${cooldown}с. 💸${this.waterCooldownCost}`;
      setTimeout(this.fillButtonText.bind(this), 1000);
    } else {
      this.setAction(Symbol.keyFor(GROW_TREE_ACTION_WATER));
    }
  }

  save() {
    Storage.set(GROW_TREE_STATE.toString(), this.#state);
    this.writeStatistic();
  }
}

class HelperGame extends Game {
  containerId = null;
  #state;
  quizzes = [];

  constructor(controller, options) {
    super(controller, options);

    if (Storage.has(HELPER_GAME_STATE.toString())) {
      this.#state = Storage.get(HELPER_GAME_STATE.toString());
    } else {
      this.#state = {
        quizzes: [],
      };
    }

    this.quizzes = (
      (this.options.quizzes ?? this.quizzes) ||
      []
    ).filter((row) => !this.#state.quizzes.includes(row.id));
  }

  on() {
    super.on();
    setTimeout(this.showDialog.bind(this), 30000);
  }

  off() {
    super.off();
  }

  showDialog() {
    if (!this.quizzes.length || !this.isActive) return;
    clearTimeout(this.dialogTimeout);
    const randomIndex = Math.floor(
      Math.random() * this.quizzes.length
    );

    const { id, dialog } = this.quizzes[randomIndex];

    dialog.on('win', (e) => {
      this.addQuiz(id);
      GameController.instance.changeMoney(e.prize);
    });

    GameController.instance.showDialog(dialog);
    this.dialogTimeout = setTimeout(() => this.showDialog(), 60000);
  }

  addQuiz(id) {
    this.#state.quizzes.push(id);
    this.quizzes = this.quizzes.filter(
      (row) => !this.#state.quizzes.includes(row.id)
    );
    this.save();
  }

  save() {
    Storage.set(HELPER_GAME_STATE.toString(), this.#state);
  }
}

class MusicGame extends Game {
  containerId = 'music-game-container';
  #state;
  #songIndex = 0;
  songs = [];

  constructor(controller, options) {
    super(controller, options);

    if (Storage.has(MUSIC_GAME_STATE.toString())) {
      this.#state = Storage.get(MUSIC_GAME_STATE.toString());
    } else {
      this.#state = {
        songs: [],
      };
    }

    this.songs = ((this.options.songs ?? this.songs) || []).filter(
      (row) => !this.#state.songs.includes(row.id)
    );
  }

  on() {
    super.on();
    if (this.songs.length) {
      this.createControls();
      this.loadSong(this.#songIndex);
    } else {
      this.songsOver();
    }
  }

  off() {
    super.off();
    if (this.audio) this.audio.pause();
    DOMHelper.removeElements(
      this.audio,
      this.controls,
      this.playButton,
      this.optionsContainer
    );
  }

  createControls() {
    this.audio = document.createElement('audio');
    this.audio.id = 'music-game-player';
    this.audio.setAttribute('preload', 'auto');

    this.controls = document.createElement('div');
    this.controls.id = 'music-game-controls';

    this.playButton = document.createElement('button');
    this.playButton.id = 'music-game-play-pause';
    this.playButton.textContent = '▶️';

    this.playButton.addEventListener('click', () => {
      if (this.audio.paused) {
        this.audio.play();
        this.playButton.textContent = '⏸️';
      } else {
        this.audio.pause();
        this.playButton.textContent = '▶️';
      }
    });

    this.optionsContainer = document.createElement('div');
    this.optionsContainer.id = 'music-game-options';

    this.controls.appendChild(this.playButton);
    DOMHelper.prependElements(
      this.container,
      this.audio,
      this.controls,
      this.optionsContainer
    );
  }

  songsOver() {
    this.container.innerHTML = `<div class="songs-over-text"><p>Ви вгадали всі пісні 👏 </p><p>Можете прослухати їх у вашому смартфоні 📱</p></div><div>👇</div>`;
  }

  loadSong(index) {
    if (!this.songs.length) return this.songsOver();
    const song = this.songs[index];
    this.audio.src = song.src;
    this.optionsContainer.innerHTML = '';

    song.options.forEach((option, i) => {
      const button = document.createElement('button');
      button.textContent = option;
      button.addEventListener(
        'click',
        i === song.correct
          ? () => {
              button.classList.add(SUCCESS_CLASS);
              this.addSong(song.id);
              GameController.instance.changeMoney(10);
              setTimeout(this.nextSong.bind(this), 5000);
            }
          : () => {
              button.classList.add(FAILURE_CLASS);
              setTimeout(this.nextSong.bind(this), 1000);
            }
      );
      this.optionsContainer.appendChild(button);
    });
  }

  nextSong() {
    if (!this.songs.length) return this.songsOver();
    this.#songIndex = (this.#songIndex + 1) % this.songs.length;
    this.loadSong(this.#songIndex);
    this.audio.pause();
    this.playButton.textContent = '▶️';
  }

  addSong(id) {
    this.#state.songs.push(id);
    this.songs = this.songs.filter(
      (row) => !this.#state.songs.includes(row.id)
    );
    this.save();
  }

  save() {
    Storage.set(MUSIC_GAME_STATE.toString(), this.#state);
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

  get sceneContainer() {
    return this.#sceneContainer;
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
      60000
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

  static get isCelebrateDate() {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);

    return startOfDay.getTime() === firstDayOfYear.getTime();
  }

  static #updateCountdown() {
    const now = new Date();
    const nextNewYear = new Date(now.getFullYear() + 1, 0, 1);

    let diff = nextNewYear - now;

    if (Countdown.isCelebrateDate) {
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

  #typeQuiz(dialog) {
    const { container, content } = dialog;
    if (!container || !content) return;
    if (this.#charIndex >= content.length) {
      DOMHelper.showElements(container.querySelector('div'));
      return;
    }

    if (this.#charIndex === 0) {
      this.dialogText.appendChild(container);
    }

    container.querySelector('p').textContent += content.charAt(
      this.#charIndex
    );
    this.#charIndex++;
    this.#typeTimeout = setTimeout(() => this.#typeQuiz(dialog), 50);
  }

  showDialog(dialog) {
    clearTimeout(this.#typeTimeout);
    this.dialogText.textContent = '';
    this.#charIndex = 0;
    if (dialog.type === DIALOG_TYPE['text']) {
      this.#typeText(dialog.get());
    } else if (dialog.type === DIALOG_TYPE['quiz']) {
      this.#typeQuiz(dialog.get());
    }
  }
}

class Dialog {
  constructor(content, options = {}) {
    this.content = content;
    this.type = options.type ?? DIALOG_TYPE['text'];
    this.options = options;
    this.events = {};
  }

  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  emit(event, ...args) {
    if (this.events[event]) {
      this.events[event].forEach((listener) => listener(...args));
    }
  }

  get() {
    if (this.type === DIALOG_TYPE['text']) return this.getText();
    if (this.type === DIALOG_TYPE['quiz']) return this.getQuiz();
  }

  getText() {
    return this.content;
  }

  getQuiz() {
    const quizContainer = document.createElement('div');
    quizContainer.id = 'dialog-quiz-container';
    const quizText = document.createElement('p');
    const quizOptions = document.createElement('div');
    DOMHelper.hideElements(quizOptions);

    (this.options.options || []).forEach((option) => {
      const button = document.createElement('button');
      button.textContent = option.value;

      if (option.isAnswer) {
        button.addEventListener('click', () => {
          this.emit('win', { prize: this.options.prize });
          button.classList.add(SUCCESS_CLASS);
        });
      } else {
        button.addEventListener('click', () => {
          button.classList.add(FAILURE_CLASS);
        });
      }
      quizOptions.appendChild(button);
    });

    quizContainer.appendChild(quizText);
    quizContainer.appendChild(quizOptions);

    return {
      container: quizContainer,
      content: this.content,
    };
  }
}

// Логіка
const sceneDict = {
  [STREET_SCENE]: {
    name: 'street',
    buttons: [TREE_SCENE, HOME_SCENE],
    effects: [SnowEffect.instance],
    games: [SNOWFLAKE_GAME, HELPER_GAME],
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
    effects: [SnowEffect.instance],
    games: [GROW_TREE_GAME],
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
    effects: [],
    games: [MUSIC_GAME],
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
      dialogs: [
        new Dialog(
          'Гроші летять із неба! Хапай швидше, поки сніг не розтанув! 💸❄️'
        ),
        new Dialog(
          'Це пташка? Це літак? Ні, це купюра, яку ти майже зловив! 😂'
        ),
        new Dialog(
          'Обережно, не переплутай банкноту зі сніжинкою – одна з них точно не гріє гаманець!'
        ),
        new Dialog(
          'Зловив купюру? Тепер головне – не витратити все на мандарини! 🍊💰'
        ),
        new Dialog(
          'Снігопад? Чи грошопад? У будь-якому випадку твоя удача десь поруч!'
        ),
        new Dialog(
          'Чи знаєш ти, що кожна зловлена купюра додає +10 до твого святкового настрою?'
        ),
      ],
    },
  },
  [GROW_TREE_GAME]: {
    instance: GrowTreeGame,
    options: {
      dialogs: [
        new Dialog(
          'Чим більше води, тим вище ялинка. Але не перестарайся – не хочеш же виростити аквапарк! 💦🌲'
        ),
        new Dialog(
          'Твоя ялинка точно любить тебе, якщо терпляче чекає на воду навіть у мороз! ❄️❤️'
        ),
        new Dialog(
          'Відро набирається так повільно, наче воно відчуває святковий настрій. 🎄⏳'
        ),
        new Dialog(
          `Пам'ятай: ялинка – це не кактус. Без води вона не витримає! 😜💧`
        ),
        new Dialog(
          'Твоє відро повільно наповнюється... Може, це натяк, що ти маєш час на каву? ☕🌲'
        ),
        new Dialog(
          'З такою ялинкою навіть Санта захоче переїхати до твого двору! 🎅🎄'
        ),
        new Dialog(
          'Все в цьому світі має ціну… навіть вода для ялинки! 💸🌲'
        ),
        new Dialog(
          'Ти інвестуєш у ялинку – це найзимовіший стартап! 😜🌟'
        ),
        new Dialog(
          'Скільки грошей залишилося? Сподіваюся, вистачить і на подарунки під ялинку! 🎁💵'
        ),
      ],
      pestsDialogs: [
        new Dialog(
          'О ні! Шкідники атакують! Мабуть, їм теж подобається твоя ялинка. 💀🪲'
        ),
        new Dialog(
          'Швидше виводь цих хвостатих і вусатих! Інакше замість ялинки отримаєш кормовий завод! 😂🐛'
        ),
        new Dialog(
          'Ці шкідники такі нахабні, що вже майже прикрасили себе гірляндами! 🎄🐜'
        ),
        new Dialog(
          'Якщо побачиш шкідника з валізою – це твій шанс домовитися, щоб він поїхав! 😅🛄'
        ),
        new Dialog(
          'Твоя ялинка – справжній магніт для комах! Може, вони хочуть стати її іграшками? 🐞🎀'
        ),
      ],
    },
  },
  [HELPER_GAME]: {
    instance: HelperGame,
    options: {
      quizzes: [
        {
          id: '09d189af-c179-4424-8a15-5a9442d4c245',
          dialog: new Dialog(
            'Який популярний напій асоціюється з зимовими святами?',
            {
              type: DIALOG_TYPE['quiz'],
              prize: 100,
              options: [
                {
                  value: 'Лимонад',
                  isAnswer: false,
                },
                {
                  value: 'Гарячий шоколад',
                  isAnswer: true,
                },
                {
                  value: 'Сидр',
                  isAnswer: false,
                },
                {
                  value: 'Кава',
                  isAnswer: false,
                },
              ],
            }
          ),
        },
        {
          id: '7739819a-5025-404a-bb3e-3b17ba455dd1',
          dialog: new Dialog(
            'Що традиційно ставлять на верхівку ялинки?',
            {
              type: DIALOG_TYPE['quiz'],
              prize: 100,
              options: [
                {
                  value: 'Дзвіночок',
                  isAnswer: false,
                },
                {
                  value: 'Сніговика',
                  isAnswer: false,
                },
                {
                  value: 'Зірку',
                  isAnswer: true,
                },
                {
                  value: 'Гірлянду',
                  isAnswer: false,
                },
              ],
            }
          ),
        },
        {
          id: '947a0328-23f7-45ae-bedb-41f0d9af86c8',
          dialog: new Dialog('Що НЕ є символом зими?', {
            type: DIALOG_TYPE['quiz'],
            prize: 50,
            options: [
              {
                value: 'Сніговик',
                isAnswer: false,
              },
              {
                value: 'Сани',
                isAnswer: false,
              },
              {
                value: 'Соняшник',
                isAnswer: true,
              },
              {
                value: 'Ковзани',
                isAnswer: false,
              },
            ],
          }),
        },
        {
          id: '7a3afebf-4253-4cbf-a7a7-2abbbe1456d4',
          dialog: new Dialog(
            'Як більшість тварин переживають зиму?',
            {
              type: DIALOG_TYPE['quiz'],
              prize: 75,
              options: [
                {
                  value: 'Переїжджають до іншого лісу.',
                  isAnswer: false,
                },
                {
                  value: 'Засинають на всю зиму.',
                  isAnswer: true,
                },
                {
                  value: 'Одягають теплі шуби',
                  isAnswer: false,
                },
                {
                  value: 'Йдуть до міста',
                  isAnswer: false,
                },
              ],
            }
          ),
        },
      ],
    },
  },
  [MUSIC_GAME]: {
    instance: MusicGame,
    options: {
      songs: [
        {
          id: '09d189af-c179-4424-8a15-5a9442d4c245',
          title: 'Jingle Bell Rock',
          src: 'assets/songs/Jingle Bell Rock.mp3',
          options: [
            'Jingle Bell Rock',
            'Silent Night',
            'Deck the Halls',
            'We Wish You a Merry Christmas',
          ],
          correct: 0,
        },
        {
          id: '7739819a-5025-404a-bb3e-3b17ba455dd1',
          title: 'Feliz Navidad',
          src: 'assets/songs/Feliz Navidad.mp3',
          options: [
            'Jingle Bells',
            'Feliz Navidad',
            'O Holy Night',
            'Let It Snow',
          ],
          correct: 1,
        },
        {
          id: '947a0328-23f7-45ae-bedb-41f0d9af86c8',
          title: "Rockin' Around The Christmas Tree",
          src: "assets/songs/Rockin' Around The Christmas Tree.mp3",
          options: [
            'White Christmas',
            'Jingle Bells',
            "Rockin' Around The Christmas Tree",
            'Frosty the Snowman',
          ],
          correct: 2,
        },
      ],
    },
  },
};

const timeDict = {
  days: 'дн.',
  hours: 'год.',
  minutes: 'хв.',
  seconds: 'сек.',
};
const growTreeGameDict = {
  [Symbol.keyFor(GROW_TREE_ACTION_PLANT)]: 'Посаджена',
  [Symbol.keyFor(GROW_TREE_ACTION_WATER)]: 'Полито',
  [Symbol.keyFor(GROW_TREE_ACTION_FILL)]: 'Прискорено',
  [Symbol.keyFor(GROW_TREE_ACTION_PEST)]: 'Врятовано',
};

document.addEventListener('DOMContentLoaded', () => {
  Countdown.start(document.getElementById('countdown'));

  // 1 січня ялинка повинна бути у домі, в інші дні на подвір'ї
  const treeEffectScene = Countdown.isCelebrateDate
    ? HOME_SCENE
    : TREE_SCENE;
  sceneDict[treeEffectScene].effects.push(
    ChristmasTreeEffect.instance
  );

  Greeting.instance.greet();
  GameController.instance.start({
    scene: STREET_SCENE,
    moneyText: document.getElementById('money'),
    helperDialog: document.getElementById('helper-dialog'),
  });

  // Прибрати кнопку сервісу при перегляді сайту
  const removeWatermark = () => {
    const ids = [];
    const iframes = document.body.querySelectorAll('iframe');
    for (const iframe of iframes) {
      if (iframe.id.startsWith('sb__open-sandbox'))
        ids.push(iframe.id);
    }
    for (const id of ids) {
      const node = document.createElement('div');
      node.style.setProperty('display', 'none', 'important');
      node.id = id;
      document.getElementById(id).remove();
      document.body.appendChild(node);
    }
  };

  setTimeout(removeWatermark, 1000);
});
