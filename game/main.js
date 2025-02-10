// Variablen
let sketchWidth = blockSize * 16; //720 Pixel
let sketchHeight = blockSize * 10; //450 Pixel

let spielerImg, enemyImg, tileSheet;

let spieler;
let enemy = [];
let portal, schlüssel;
let unlocked = false;
let coins = [];
let counter = 0;
let levelData = [];
let currentLevelIndex = 0;
let gameStage = "start";
let pressedKeys = {};
let dataLoaded = false;

const bColor1 = '#ff216f80'; //Rose
const bColor2 = '#eb7a7acc'; //Light coral
const gruen1 = '#C9EB7B'; //Mindaro
const hell = '#F5F5F5'; //White smoke
const dunkel = '#383B53'; //Space cadet
const bgColor = '#CFD1E9'; //Lavender (web)
const violet = '#A6A9D3'; //etwas dunkler als BG

//-----------------------------------------------
function preload() {
  spielerImg = loadImage('/game/Aneye.png');
  tileSheet = loadImage('/game/Tilesheet.png');
  enemyImg = loadImage('/game/Gegner.png');
  startBG = loadImage('/game/HintergrundStart.png')

  loadJSON('/game/levels.json', handleData, handleError);  
}

function handleData(data) {
  levelData = data.levels; 
  dataLoaded = true;       
  console.log("Level-Daten erfolgreich geladen:", levelData);
  loadLevel(currentLevelIndex)
}

function handleError(error) {
  console.error("Fehler beim Laden der Level-Daten:", error);
}

function setup() {
  createCanvas(sketchWidth, sketchHeight);
}

function draw() {  
  if (!dataLoaded) {
    return;
  }
  switch (gameStage) {
    case "start":
      drawStartScreen();
      break;
    case "controls":
      drawControlScreen();
      break;
    case "playing":
      if (!dataLoaded) {
        loadLevel(currentLevelIndex); 
      }
      drawGame();
      break;
    case "pause":
      drawPauseScreen();
      break;
    case "win":
      drawWinScreen();
      break;
    case "lose":
      drawLoseScreen();
      break;
    default:
      console.error("Unbekannter Zustand:", gameStage);
      break;
  }
  console.log(currentLevelIndex);
  console.log(gameStage);   
}

function loadLevel(levelindex) {
  if (!levelData || levelData.length === 0) {
    console.error("Level-Daten noch nicht geladen.");
    return;
  }

  if (levelindex < 0 || levelindex >= levelData.length) {
    console.error("Ungültiger Levelindex:", levelindex);
    return;
  }
  
  let level = levelData[levelindex];

  if (!level) {
    console.error("Level nicht gefunden:", levelindex);
    return;
  }
  console.log("Lade Level mit ID:", levelindex);
  
  const coinsPos = level.coinsPos || []; 
  const enemyData = level.enemyData || []; 
  const keyPos = level.keyPos || null; 
  const portalPos = level.portalPos || null; 

  definitionLevel = level.tilesmap.map(row => row.split(""));
  
  spieler = new Spieler({x: level.spielerPos.x * blockSize, y: level.spielerPos.y * blockSize});
  enemy = enemyData.map(data => new Gegner({x: data.x * blockSize, y: data.y * blockSize - 16, moveStart: data.moveStart, moveMax: data.moveMax}));
  coins = coinsPos.map(data => new MünzenItem({x:data.x * blockSize, y: data.y * blockSize}));
  if(keyPos) {
    schlüssel = new SchlüsselItem({x: keyPos.x * blockSize, y: keyPos.y * blockSize});
  }
  if(portalPos) {
    portal = new Portal({x: portalPos.x * blockSize, y: portalPos.y * blockSize});
  }   
}
  
function nextLevel() {
  if (currentLevelIndex < levelData.length - 1) {
    currentLevelIndex++;
    console.log("Wechsel zum nächsten Level:", currentLevelIndex);
    unlocked = false;
    loadLevel(currentLevelIndex);
  } else {
    console.log("Alle Level durchgespielt!!");
    gameStage = "win";
  }
}

function drawGame() {
  background(bgColor);
  noStroke();

  levelDraw();

  handleGameLogic();
  
  textFont('Courier New');
  textAlign(LEFT);
  textSize(20);
  fill('white');
  text('Münzen: ', blockSize/3, blockSize/2);
  text(counter, 2.3 * blockSize, blockSize/2);     
}

function handleGameLogic() {
  if (!spieler || !enemy) {
    console.error("Fehler: Spieler oder Gegner nicht definiert");
    return;
  }

  for (let e = enemy.length - 1; e > -1; e -= 1) {
      enemy[e].moving();
      enemy[e].show();
      if((enemy[e].sides.top < spieler.sides.bottom && enemy[e].sides.top >= spieler.Yold) && 
         (enemy[e].sides.left <= spieler.position.x && enemy[e].sides.right >= spieler.position.x)){
          enemy.splice(e, 1);
      } else if (collisionWithItem(enemy[e])){
          gameStage = "lose";
      }
  }
  for (let c = coins.length - 1; c > -1; c -= 1) {
      coins[c].show();
      if(collisionWithItem(coins[c])) {
        coins.splice(c, 1);
        counter++;
      };
  }
  schlüssel.show();
  if (collisionWithItem(schlüssel)) {
      schlüssel.itemLook = '#00000009';
      unlocked = true;
  }
  if (unlocked == false) {
      portal.inaktiv();
  } else if (unlocked == true) {
      portal.aktiv();
  }
  if (unlocked && collisionWithPortal()) {
      nextLevel();
  }
  spieler.falling();
  spieler.move();
  spieler.show();
  kollisionen.handleCollision(spieler, definitionLevel); 
}

function collisionWithItem(item) {
    const itemSides = item.sides || item.points;

    return spieler.position.x >= itemSides.left &&
           spieler.position.x <= itemSides.right &&
           spieler.position.y >= itemSides.top &&
           spieler.position.y <= itemSides.bottom;
}

function collisionWithPortal() {
    return  (portal.sides.left + 50 <= spieler.sides.left && spieler.sides.left <= portal.sides.right - 50) &&
            (portal.sides.left + 50 <= spieler.sides.right && spieler.sides.right <= portal.sides.right - 50) &&
            (portal.sides.top <= spieler.sides.top && spieler.sides.top <= portal.sides.bottom) &&
            (portal.sides.top <= spieler.sides.bottom && spieler.sides.bottom <= portal.sides.bottom);           
}

function keyPressed() {
  pressedKeys[key] = true;

  switch (gameStage) {
    case "start": 
      if (key === "Enter") {
        gameStage = "controls";
      }
      break;
    case "controls": 
      if (key === "Enter") {
        gameStage = "playing";
      }
      break;
    case "win":
    case "lose":
      if ((key === "r") || (key === "Enter")) {
        resetGame();
      }
      break;
    case "playing":
      if (key === "p") {
        gameStage = "pause";
      } else if (key === "r") {
        resetGame();
      }
      break;
    case "pause": 
      if ((key === "Enter") || (key === "p")) {
        gameStage = "playing";
      } else if (key === "r") {
        resetGame();
      }
      break;
    default:
      console.error("Unbekannter Zustand beim Drücken einer Taste", gameStage);
  }
}

function keyReleased() {
  delete pressedKeys[key];
}

function drawStartScreen() {
  background('#CFD1E9');
  imageMode(CENTER);
  image(startBG, sketchWidth/2, sketchHeight/2, sketchWidth,sketchHeight);

  translate(0, -75);
  textFont('Courier New');
  stroke(dunkel);
  strokeWeight(1);
  fill(dunkel);
  textSize(17);
  textAlign(LEFT);
  text('by Jacqueline Esbach', 115, 315);
  textAlign(RIGHT);
  text('V.2.0', 630, 315);
    
  noStroke();
  fill(bColor1);
  rect(0, 387, 760, 40);
  fill(bColor2);
  rect(0, 387, 760, 40);
  fill(hell);
  stroke(hell);
  textAlign(CENTER);
  text("Drücke 'Enter' um Spiel zu starten", sketchWidth/2, 410);
}

function drawControlScreen() {
  background(bgColor);
  textAlign(CENTER);
  textFont('Courier New');
  fill(dunkel);
  textSize(28);
  stroke(dunkel)
  text('STEUERUNG', sketchWidth / 2, 50);

  let keySize = 50;
  let wasdX = sketchWidth / 2 - 150;
  let arrowX = sketchWidth / 2 + 100;
  let keysY = 110;

  function drawKey(x, y, label, active = true) {
    fill(active ? hell : violet);
    stroke(dunkel);
    strokeWeight(2);
    rect(x, y, keySize, keySize, 5);
    fill(dunkel);
    noStroke();
    textSize(24);
    text(label, x + keySize / 2, y + 30);
  }

  drawKey(wasdX, keysY - keySize - 3, 'W'); 
  drawKey(wasdX - keySize - 5, keysY, 'A'); 
  drawKey(wasdX, keysY, 'S', false);
  drawKey(wasdX + keySize + 5, keysY, 'D'); 

  drawKey(arrowX, keysY - keySize - 3, '↑'); 
  drawKey(arrowX - keySize - 5, keysY, '←'); 
  drawKey(arrowX, keysY, '↓', false); 
  drawKey(arrowX + keySize + 5, keysY, '→'); 

  textSize(16);
  noStroke();
  text('Typ1 (WASD)', wasdX + keySize / 2, keysY + 80);
  text('Typ2 (Pfeiltasten)', arrowX + keySize / 2, keysY + 80);
    
  let extraKeysY = 230;
  let centerX = sketchWidth / 2 - keySize / 2;
  drawKey(centerX - 220, extraKeysY, 'R'); 
  drawKey(centerX + 220, extraKeysY, 'P'); 
  textSize(16);
  text('Pause', centerX + 220 + keySize / 2, extraKeysY + 70);
  text('Reset', centerX - 220 + keySize / 2, extraKeysY + 70);

  textSize(22);
  strokeWeight(1);
  stroke(dunkel);
  text('🎯SPIELZIEL🎯', sketchWidth / 2, 240);
  textSize(18);
  noStroke();
  text('Sammle den 🔑 Schlüssel', sketchWidth / 2, 250+20);
  text('Gehe ins Portal 🚪', sketchWidth / 2, 275+20);
  text('Erreiche das letzte Level!', sketchWidth / 2, 300+20);

  textSize(16);
  fill(bColor1);
  rect(0, 360, 760, 40);
  fill(bColor2);
  rect(0, 360, 760, 40);
  fill(hell);
  stroke(hell);
  textAlign(CENTER);
  text("Drücke 'Enter' um zu starten", sketchWidth/2, 382);
}

function drawPauseScreen() {
  fill('rgba(161, 165, 211, 0.02)');
  rect(0, 0, sketchWidth, sketchHeight);
  fill(dunkel);
  stroke(dunkel);
  textAlign(CENTER, CENTER);
  textSize(40);
  text("⏸Pause", sketchWidth / 2, sketchHeight / 3);
  textSize(20);
  text("Drücke 'P' oder 'Enter', um fortzusetzen", sketchWidth / 2, sketchHeight / 2);
}

function drawWinScreen() {
  background(gruen1);
  fill(dunkel);
  stroke(dunkel);
  textAlign(CENTER, CENTER);
  textSize(40);
  text("🎉Gewonnen!🎉", sketchWidth / 2, sketchHeight / 3);
  textSize(20);
  text("Drücke 'R' oder 'Enter', um neu zu starten", sketchWidth / 2, sketchHeight / 2);    
}

function drawLoseScreen() {
  background(bColor1);
  background(bColor2);
  fill(hell);
  stroke(hell);
  textAlign(CENTER, CENTER);
  textSize(40);
  text("💀Game Over💀", sketchWidth / 2, sketchHeight / 3);
  textSize(20);
  text("Drücke 'R' oder 'Enter', um neu zu starten", sketchWidth / 2, sketchHeight / 2);
}

function resetGame() {
  counter = 0;
  currentLevelIndex = 0;
  unlocked = false;
  coins = [];
  enemy = [];
  spieler = null;
  portal = null;
  schlüssel = null;
  gameStage = "start";
  clear();
  loadLevel(currentLevelIndex);
}