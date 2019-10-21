////////////  GLOBAL VARIABLES ////////////

var capture; //contains webcam rec
var pixelGrid = []; //contains the grid made from CAPTURE
var rec = false; //play and stop the rec
var pixelColor = 10; //base color of pixels of the PIXELGRID

//MOJU sprites
var moju; //neutral
var mojuCorrect; //correct
var mojuWrong; //wrong

//variables that manage the different STATES
/*
0 = start
1 =  second sentence
2 and 3 = ask for a color
4 = right answer
5 and 6 = wrong answer
*/
var stateChanger; //object that change the state
var state = 0; //starting state
var texto = "Hello! I'm MOJU, the color theorist..."; //starting text
var bright; //contains a string "DARK", "LIGHT" or " "

//points of the webcam CAPTURE RECTANGLE
var xStart;
var xFin;
var yStart;
var yFin;

//SENTENCES LISTS. each sentence is chosen at random
var ask; //ask for a color
var askList = [
  "RED",
  "GREEN",
  "BLUE"
]

var right; //correct answer
var rightList = [
  "Wow! that's a super cool",
  "That's a nice",
  "What a beautiful",
  "I really like this",
  "OW! i love this kind of",
  "That's what i was looking for! \n a natural"
]

var wrong; //wrong answer
var wrongList = [
  "It doesn't seem",
  "You're probably wrong, that's not",
  "Are you kidding me?! It's not",
  "You're colorblind! It isn't",
  "Wait! I've never seen this kind of",
  "That's not what i was looking for! \n not a"
]

////////////  PRELOAD-SETUP-DRAW ////////////

function preload() {
  //load MOJU sprites
  moju = loadImage("assets/moju.png")
  mojuCorrect = loadImage("assets/mojuCorrect.png")
  mojuWrong = loadImage("assets/mojuWrong.png")
}

function setup() {
  createCanvas(windowWidth, windowHeight)

  //create the capture from the webcam
  capture = createCapture(VIDEO);
  capture.size(640, 480);
  capture.hide(); // hide the capture

  //create the stateChanger object
  stateChanger = new ChangeState(width / 2, height / 2 + 120);

  //set the points of the capture rectangle
  xStart = width / 2 - capture.width / 4;
  yStart = height / 2 - capture.height / 2;
  xFin = width / 2 + capture.width / 4;
  yFin = height / 2;
}

function draw() {
  noStroke();

  //_______DRAW THE WEBCAM CAPTURE_______

  //take the pixels from the capture and draw it
  var myFeed = capture.loadPixels();
  imageMode(CORNER)
  image(myFeed, xStart, yStart, capture.width / 2, capture.height / 2);

  //if the REC is true create a PIXELGRID
  //taking colors from the CAPTURE
  if (rec == true) {
    gridCreate(xStart, xFin, yStart, yFin, 10);
  }
  //cover the capture
  background(10);
  //display the PIXELGRID
  for (var i = 0; i < pixelGrid.length; i++) {
    var p = pixelGrid[i]
    p.display();
  }

  //_______DRAW SQUARES AND BORDERS_______

  //create squares with the COLOR chosen by CLICKING
  fill(pixelColor);
  stroke("250")
  strokeWeight(5)
  square(width / 2 + 190, height / 2 - 100, 100)
  square(width / 2 - 290, height / 2 - 100, 100)
  //create a white border around the PIXELGRID
  noFill();
  rect(xStart, yStart, capture.width / 2, capture.height / 2)

  //_______DRAW THE TEXT_______

  //set the TEXTO properties
  drawingContext.font = "40px VT323";
  drawingContext.textAlign = "center";
  textLeading(35);
  fill(250);
  noStroke();
  //set the TEXTO content
  textState();
  //display TEXTO
  text(texto, width / 2, height / 2 + 50);

  //_______DRAW MOJU :)_______

  //display MOJU changing his sprites according to the STATE
  imageMode(CENTER);
  mojuSprite();

  //change the CURSOR in the PIXELGRID
  if (isInWindow()) {
    cursor(HAND)
  } else {
    cursor(ARROW)
  }
  //change the CURSOR on the STATECHANGER element
  if (state != 3 && state != 5) {
    stateChanger.display(); //display (or not) the stateChanger
    stateChanger.cursor();
  }
}

////////////  FUNCTIONS ////////////

//create the PIXELGRID array getting the color of the capture
function gridCreate(_xStart, _xFin, _yStart, _yFin, _dim) {
  var pos = 0; //position in the array
  for (var x = _xStart; x < _xFin; x += _dim) {
    for (var y = _yStart + 1; y < _yFin; y += _dim) {

      var color = get(x, y); //get the COLOR in the X an Y position
      var tempPixel = new Pixel(x, y, color, _dim); //create the PIXEL object

      pixelGrid[pos] = tempPixel; //put the PIXEL in the PIXELGRID array
      pos++; //go to the next element in the array
    }
  }
}

//when SPACEBAR is pressed stop taking pixels information from the capture
//so that the REC STOPS
function keyPressed() {
  if (keyCode == 32) {
    rec = !rec;
  }
}

//se if the CURSOR is in the capture rectangle (TRUE) or not (FALSE)
function isInWindow() {
  if (mouseX > xStart && mouseX < xFin && mouseY > yStart && mouseY < yFin) {
    return true
  } else {
    return false
  }
}

//functions tha start when the MOUSE is PRESSED
function mousePressed() {
  //if the cursor is over the STATECHANGER in the correct state
  //change the STATE
  if (stateChanger.cursor() && state != 3) {
    state++;
    if (state >= 4) {
      state = 2
    }
  }
  //if the cursor is over the CAPTURE rectangle, in the correct state
  //get the COLOR informations from the PIXEL
  if (isInWindow() && (state == 3 || state == 5)) {
    //get the COLOR where the mouse is and then take R, G and B components
    pixelColor = get(mouseX, mouseY);
    var red = pixelColor[0];
    var green = pixelColor[1];
    var blue = pixelColor[2];
    //calculate the TOTAL value and %R, %G, and %B
    var tot = red + green + blue;
    var percR = (red * 100) / tot;
    var percG = (green * 100) / tot;
    var percB = (blue * 100) / tot;
    //TOT indicates the BRIGHTNESS of the pixel
    //(0 = BLACK and 255 = WHITE)
    if (tot < 150) {
      bright = " DARK "
    } else if (tot > 250) {
      bright = " LIGHT "
    } else {
      bright = " "
    }
    //check the COLOR and change to the correct STATE
    if (percR > 40) {
      if (askList[ask] == "RED") {
        state = 4; //correct
      } else {
        state = 6; //wrong
      }
    } else if (percB > 45 && percB > percG) {
      if (askList[ask] == "BLUE") {
        state = 4; //correct
      } else {
        state = 6; //wrong
      }
    } else if (percG > 40 && percG > percB) {
      if (askList[ask] == "GREEN") {
        state = 4; //correct
      } else {
        state = 6; //wrong
      }
    } else {
      state = 6; //wrong
    }

  }

}

//change TEXTO according to the STATE
function textState() {
  switch (state) {
    case 0:
      texto = "Hello! I'm MOJU, the color theorist..."
      break;
    case 1:
      texto = "Press (SPACEBAR) to play/stop your webcam \n then (CLICK) on the color i ask for"
      break;
    case 2:
      right = round(random(0, rightList.length - 1)); //choose at random from the CORRECT list
      ask = round(random(0, 2)); //choose at random from RED, GREEN or BLUE
      state = 3; //go to the state 3 to create the ask sentence
      break;
    case 3:
      texto = "Show me something " + askList[ask]; //create the ASK sentence
      break;
    case 4:
      texto = rightList[right] + bright + askList[ask] + "!" //create the CORRECT sentence
      fill(0, 255, 0)
      break;
    case 5:
      texto = wrongList[wrong] + " " + askList[ask] + "!" //create the WRONG sentence
      fill(255, 0, 0)
      break;
    case 6:
      wrong = round(random(0, rightList.length - 1)); //choose at random from the WRONG list
      state = 5; //go to the state 5 to create the wrong sentence
      break;
    default:
      texto = ""
  }
}

//set the SPRITE of MOJU
function mojuSprite() {
  if (state == 4) {
    image(mojuCorrect, width / 2, height / 2 + 220); //CORRECT (happy)
  } else if (state == 5) {
    image(mojuWrong, width / 2, height / 2 + 220); //WRONG (angry)
  } else {
    image(moju, width / 2, height / 2 + 220); //NEUTRAL
  }
}

////////////  OBJECTS ////////////

//PIXEL object (a square)
function Pixel(_x, _y, _color, _dim) {
  //PROPERTIES
  this.x = _x;
  this.y = _y;
  this.color = _color;
  this.dim = _dim;
  //METHODS
  //DRAW the PIXEL
  this.display = function() {
    noStroke();
    fill(this.color);
    square(this.x, this.y, this.dim);
  }
}

//CHANGESTATE, object that increments the state
function ChangeState(_x, _y) {
  //PROPERTIES
  this.x = _x;
  this.y = _y;
  //METHODS
  //DRAW ">>"
  this.display = function() {
    fill(200)
    text(">>", this.x, this.y)
  }
  //CHECK if the cursor is OVER the object
  this.cursor = function() {
    if (mouseX > this.x - 30 && mouseX < this.x + 30 && mouseY > this.y - 30 && mouseY < this.y + 30) {
      cursor(HAND)
      return true
    }
    return false
  }
}
