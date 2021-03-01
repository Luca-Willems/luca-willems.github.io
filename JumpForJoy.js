/**
 * JumpForJoy
 * LED Game waarin de speler met een joystick over verschillende obstacles springt of bukt
 * Als de speler het obstacle raakt dan reset de game en houdt de highscore bij
 * @author Luca Willems, Jorbe Verrelst
 * @version 3.0 (11/02/2021)
 */
let matrix = new Matrix(WIDTH, HEIGHT);

// * Default waarden aanpassen in reset functie
let r //rij van het manntje
let c //colom van het mannetje
let obstacleR //rij van het obstacle
let obstacleC //colom van het obstacle
let jumpingTime
let obstacleFrame
let obstacleDelay //om de x frames gaat de obstacle naar links
let score
// * Default waarden aanpassen in reset functie

const Types = { "kleineCactus": 1, "groteCactus": 2, "kleineSteen": 3, "groteSteen": 4, "vogel": 5 } //de opsomming de verschillende obstacles
let obstacleType

let isCrawling //je bent niet aan het bukken
let isJumping //je bent niet aan het springen

let scoreField
let highscoreField

//zet alles naar de beginwaarde
function reset() {
    r = 7
    c = 2
    obstacleR = 7
    obstacleC = 7
    jumpingTime = 0
    obstacleFrame = 0
    obstacleDelay = 4
    isJumping = false
    isCrawling = false
    setScore(0) //zet de score gelijk aan 0
    pickObstacle() //kies een random obstacle
}

function setup() {
    scoreField = select('#score')
    highscoreField = select('#highscore')
    highscore = 0
    reset() //zet alles naar de beginwaarde
    matrix.init()
    frameRate(7)
}

function draw() {
    matrix.clear()
    console.log('obstacleDelay:', obstacleDelay);
    readJoystick() //besturing van joystick
    calcJump() //bereken waar je bent in de sprong
    drawPlayer(r, isCrawling) //tekent speler
    obstacleFrame++ //bij elke frame gaat er bij de obstacleFrame 1 bij
    showObstacle(obstacleType) //laat random obstacle zien
    checkCollision(obstacleType) //checkt of het mannetje botst met obstacle
    console.log('score:', score);
    matrix.show()
}

//tekent de speler van 3 hoog, @param r = de rij van het mannetje, @param isCrawling = de benaming van wanneer het mannetje aan het bukken is 
function drawPlayer(r, isCrawling) {
    for (let i = 0; i < 3 - isCrawling; i++) { //als isCrawling == true => 1 en wordt het mannetje 2 bolletjes hoog, anders 3
        setLed(r - i, c, color('yellow'))
    }
    if (isCrawling) {
        setLed(r - 1, c + 1, color('yellow'))
    }
}

//leest joystick
function readJoystick() {
    let x = readJoystickX()
    let y = readJoystickY()
    if (y > 687 && !isJumping) { //als de joystick omhoog gaat, springt de speler
        isJumping = true
        jumpingTime = 0
    }
    if (y < 337 && !isJumping) { //als de joystick naar beneden gaat, bukt de speler
        isCrawling = true
    } else {
        isCrawling = false
    }
}

//de jumpingTime gaat steeds met 1 omhoog, de speler springt in verschillende delen
function calcJump() {
    if (isJumping) {
        jumpingTime++
        if (jumpingTime <= 3) { //het mannetje springt omhoog
            r--
        } else if (jumpingTime >= 4 && jumpingTime <= 10) { } //hier blijft hij hangen in de lucht
        else if (jumpingTime <= 13) { //hij gaat naar beneden
            r++
        }
        if (jumpingTime == 13) { //als hij de grond raakt is hij niet meer aan het springen
            isJumping = false
        }
        if (obstacleDelay == 2 && jumpingTime >= 4 && jumpingTime <= 7) { } //hier blijft hij hangen in de lucht
        if (obstacleDelay == 2 && jumpingTime <= 10) { //hij gaat naar beneden
            r++
        }
        if (obstacleDelay == 2 && jumpingTime == 10) { //als hij de grond raakt is hij niet meer aan het springen
            isJumping = false
        }
    }
}

//1 * 1 bolletje
function kleineCactus() {
    moveObstacle(1)
    setLed(obstacleR, obstacleC, color('red'))
}

//1 * 2 bolletjes
function groteCactus() {
    moveObstacle(1)
    setLed(obstacleR, obstacleC, color('red'))
    setLed(obstacleR - 1, obstacleC, color('red'))
}

//2 * 1 bolletjes
function kleineSteen() {
    moveObstacle(2)
    setLed(obstacleR, obstacleC, color('red'))
    setLed(obstacleR, obstacleC + 1, color('red'))
}

//2 * 2 bolletjes
function groteSteen() {
    moveObstacle(2)
    setLed(obstacleR, obstacleC, color('red'))
    setLed(obstacleR - 1, obstacleC, color('red'))
    setLed(obstacleR, obstacleC + 1, color('red'))
    setLed(obstacleR - 1, obstacleC + 1, color('red'))
}

//2 * 1 vliegende bolletjes
function vogel() {
    moveObstacle(2)
    setLed(obstacleR - 2, obstacleC, color('red'))
    setLed(obstacleR - 2, obstacleC + 1, color('red'))
}

//laat het obstacle overgaan afhankelijk van de breedte van het obstacle, @param widht = de breedte van het obstacle
function moveObstacle(width) {
    if (obstacleFrame == obstacleDelay) {
        obstacleC--
        if (obstacleC < 1 - width) { //obstakel valt links van de matrix
            obstacleC = 7 //volgende obstakel weer rechts plaatsen
            pickObstacle() //nieuw obstakel kiezen
            setScore(score + 10)
            calcSpeed(score)
        }
        obstacleFrame = 0
    }
}

//kijkt of de speler het obstacle raakt, @param type = de opsomming van alle obstacles
function checkCollision(type) {
    let collided = false;
    switch (type) {
        case Types.kleineSteen: //type == kleineSteen?
            if ((c == obstacleC || c == obstacleC + 1) && r == obstacleR) collided = true
            break;

        case Types.kleineCactus: //type == kleineCactus?
            if (c == obstacleC && r == obstacleR) collided = true
            break;

        case Types.groteSteen: //type == groteSteen?
            if ((c == obstacleC || c == obstacleC + 1) && r == obstacleR || isCrawling && c + 1 == obstacleC) collided = true
            break;

        case Types.groteCactus: //type == groteCactus
            if (c == obstacleC && r == obstacleR || isCrawling && c + 1 == obstacleC) collided = true
            break;

        case Types.vogel: //type == vogel?
            if (c == obstacleC || c == obstacleC + 1) collided = true
            if (isCrawling) collided = false
            break;

        default:
            break;
    }
    if (collided) {
        setAll('red')
        console.log("Botsing!")
        reset()
    }
}

//zet alle ledjes rood, @param color = kleur van de bolletjes 
function setAll(Color) {
    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            setLed(y, x, Color)
        }
    }
}

//kiest random obstacle
function pickObstacle() {
    const type = Math.floor(random(1, 6)) //kiest een random getal tussen 1 en 6 en rondt het af naar beneden
    obstacleType = type
}

//laat een obstacle zien, @param type = een keuze van 1 van alle obstacles
function showObstacle(type) {
    switch (type) {
        case 1:
            kleineCactus(); //laat kleineCactus zien
            break;
        case 2:
            groteCactus(); //laat groteSteen zien
            break;
        case 3:
            kleineSteen(); //laat kleineSteen zien
            break;
        case 4:
            groteSteen(); //laat groteSteen zien
            break;
        case 5:
            vogel() //e nat vogel zien
            break;

        default:
            break;
    }
}

//maakt een ledje met bepaalde positie en kleur, @param r = de rij, @param c = de kolom, @param color = de kleur van de bolletjes 
function setLed(r, c, color) {
    if (c >= 0 && c < WIDTH) { //als led binnen matrix valt dan ...
        matrix.setLed(r, c, true, color)
    }
}

//laat de score zien in de html, @param s = de score
function setScore(s) {
    score = s
    scoreField.html('Score: ' + score)
    checkHighscore()
}

//maakt de score gelijk aan de highscore als score groter is dan highscore en laat highscore zien in html
function checkHighscore() {
    if (score >= highscore) {
        highscore = score
        highscoreField.html('Highscore: ' + highscore)
    }
}

//berekent de snelheid van het obstacle aan de hand van de score, @param score = de score
function calcSpeed(score) {
    if (score != 0 && score % 10 == 0 && obstacleDelay != 1) {
        obstacleDelay--
    }
}