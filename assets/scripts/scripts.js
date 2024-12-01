const sceneContainer = document.getElementById('scene');
const snowflakeContainer = document.getElementById(
  'snowflake-container'
);
const gameContainer = document.getElementById('game-container');
const background = document.getElementById('background');
const moneyContainer = document.getElementById('money');
const treeButton = document.getElementById('tree-button');
const streetButton = document.getElementById('street-button');
const homeButton = document.getElementById('home-button');
const kitchenButton = document.getElementById('kitchen-button');

const smartphoneButton = document.getElementById('smartphone-button');
const smartphone = document.getElementById('smartphone');

const snowflakeEmoji = '❄️';
const moneyEmoji = '💸';
const moneyEmojiValue = 1;
const numberOfSnowflakes = 100;
const snowflakeClassName = 'snowflake';

let showSmartphone = false;
let treeLevel = 7;
let money = 0;

const scenes = {
  street: true,
  tree: false,
  home: false,
  kitchen: false,
  smartphone: false,
};

const buttons = {
  street: ['tree', 'home', 'kitchen', 'smartphone'],
  tree: ['street', 'smartphone'],
  home: ['tree', 'kitchen', 'street', 'smartphone'],
  kitchen: ['home'],
  smartphone: ['tree', 'home', 'kitchen', 'street', 'smartphone'],
};

function createSnowflake(i) {
  const isMoney = i % 20 === 0 && i !== 0;
  const snowflake = document.createElement('div');

  if (isMoney) {
    snowflake.onclick = clickMoneySnowflake.bind(this, snowflake);
  }

  snowflake.className = `${snowflakeClassName} ${
    isMoney ? 'money' : ''
  }`;
  const containerWidth = sceneContainer.clientWidth;
  snowflake.style.left = `${Math.random() * containerWidth}px`;
  snowflake.style.animationDuration = `${Math.random() * 5 + 5}s`;
  snowflake.innerText = isMoney ? moneyEmoji : snowflakeEmoji;
  snowflakeContainer.appendChild(snowflake);
}
async function startSnow() {
  for (let i = 0; i < numberOfSnowflakes; i++) {
    createSnowflake(i);
    if (i % 5) await sleep(500);
  }
}
function showSnowflakes(status) {
  if (status) {
    snowflakeContainer.classList.remove('invisible');
  } else {
    snowflakeContainer.classList.add('invisible');
  }
}

function clickMoneySnowflake(element) {
  element.classList.add('hidden');
  changeMoney(moneyEmojiValue);
  setTimeout(() => {
    element.classList.remove('hidden');
  }, 5000 + Math.random() * 1000);
}

function drawMoney() {
  moneyContainer.innerText = money;
}
function changeMoney(change) {
  money += change;
  drawMoney();
}
function setScene(scene) {
  showSnowflakes(['street', 'tree'].includes(scene));

  sceneContainer.className = 'scene';
  gameContainer.className = 'game-container';
  background.className = 'background';
  Object.keys(scenes).forEach((key) => {
    scenes[key] = key === scene;
  });
  const sceneClass = `scene-${scene}`;
  sceneContainer.classList.add(sceneClass);
  gameContainer.classList.add(sceneClass);
  background.classList.add(sceneClass);

  if (['tree', 'home']) {
    const sceneTreeClass = `${sceneClass}-${treeLevel}`;
    sceneContainer.classList.add(sceneTreeClass);
    background.classList.add(sceneTreeClass);
  }

  Object.keys(buttons).forEach((key) => {
    const scenesToShow = buttons[key];
    const buttonElement = document.getElementById(`${key}-button`);
    if (scenesToShow.includes(scene)) {
      buttonElement.classList.remove('hidden');
    } else {
      buttonElement.classList.add('hidden');
    }
  });
}

async function sleep(time) {
  return new Promise((done) => {
    setTimeout(done, time);
  });
}

treeButton.onclick = setScene.bind(this, 'tree');
streetButton.onclick = setScene.bind(this, 'street');
homeButton.onclick = setScene.bind(this, 'home');
kitchenButton.onclick = setScene.bind(this, 'kitchen');

smartphoneButton.onclick = () => {
  showSmartphone = !showSmartphone;
  if (showSmartphone) {
    smartphone.classList.remove('hidden');
  } else {
    smartphone.classList.add('hidden');
  }
};

window.addEventListener('resize', () => {
  container.innerHTML = '';
  for (let i = 0; i < numberOfSnowflakes; i++) {
    createSnowflake();
  }
});

document.addEventListener('DOMContentLoaded', (event) => {
  setScene('street');
  startSnow();
});
