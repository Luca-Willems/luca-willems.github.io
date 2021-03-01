/**
 * @file LedGame.js is een bibliotheek die een virtuele omgeving van de Led Game maakt, gelijkaardig aan het aansluiten van een led matrix en een joystick aan een Arduino Uno. De functies zijn dezelfde als die van LedControl om deze later gemakkelijk te kunnen vertalen naar de MAX7219.
 * 
 * Bekijk de tutorials voor voorbeelden.
 * 
 * @author Robbe Vorsselmans
 * @version v1.0 - April 2020
 */

/**
 * Aantal leds in de breedte van de matrix, i.e. het aantal kolommen. Default: 8
 * @type {Number}
 */
const WIDTH = 8;
/**
 * Aantal leds in de hoogte van de matrix, i.e. het aantal rijen. Default: 8
 * @type {Number}
 */
const HEIGHT = 8;

/**
 * Diameter van een enkele led in pixels. Best oneven om een geheel getal als middelpunt te bekomen.
 * @type {Number}
 */
const DIAMETER = 25;

/**
 * Grootte van de joystick in pixels
 * @type {Number}
 */
const JOYSTICKSIZE = 102;

/**
 * Aantal pixels tussen de led matrix en de joystick
 */
const SPACING = 25;

// Globale variabelen voor de joystick
let gui, joystick;

/**
 * Inlezen van de x-waarde van de joystick
 * @returns {Number} - Geheel getal tussen 0 en 1023
 */
function readJoystickX() {
    let x = Math.round(joystick.valX)
    return x
}

/**
 * Inlezen van de y-waarde van de joystick
 * @returns {Number} - Geheel getal tussen 0 en 1023
 */
function readJoystickY() {
    let y = Math.round(joystick.valY)
    return y
}

/**
 * Matrix Class voor het tonen van de UI met een matrix en een joystick - Zie {@tutorial ledgame-tutorial}.
 */
class Matrix {
    /**
     * Matrix Object aanmaken
     * @param {Number} width - Aantal leds (kolommen) in de breedte
     * @param {Number} [height] - Aantal leds (rijen) in de hoogte. Wanneer deze niet wordt meegegeven maak je een vierkante matrix met 'height' gelijk aan 'width'
     */
    constructor(width, height = -1) {
        this.Pixels = []
        this.width = Math.max(1, width)
        this.height = height == -1 ? width : height
        this.nLeds = this.width * this.height // aantal leds in de matrix
        for (let p = 0; p < this.nLeds; p++) {
            let pixel = new Pixel(this.width, this.height)
            this.Pixels.push(pixel)
        }
    };
    /**
     * Initialiseren van de matrix. Spreek deze functie één keer aan in je setup().
     */
    init() {
        let can = createCanvas(this.width * DIAMETER, this.height * DIAMETER + JOYSTICKSIZE + SPACING)
        can.parent('canvas')
        gui = createGui()
        joystick = createJoystick("Joystick", (this.width * DIAMETER - JOYSTICKSIZE) / 2, this.height * DIAMETER + SPACING, JOYSTICKSIZE, JOYSTICKSIZE, 0, 1023, 0, 1023)
        this.show()
    }

    /**
     * Matrix tonen, waarbij de toestand van iedere led intern werd opgeslagen.
     */
    show() {
        background(0)
        for (let p = 0; p < this.nLeds; p++) {
            this.Pixels[p].show()
        }
        drawGui()
    }

    /**
     * Zet iedere led van de matrix uit. Let op: het resultaat wordt pas weergegeven wanneer je show gebruikt. Zie {@link show()}.
     */
    clear() {
        for (let p = 0; p < this.nLeds; p++) {
            this.Pixels[p].turn(false)
        }
    }

    /**
     * Zet de status van een specifieke led
     * @param {Number} row - Rijnummer van de led, te beginnen bij 0 
     * @param {Number} col - Kolomnummer van de led, te beginnen bij 0
     * @param {Boolean} [state] - Status van de led
     * @param {p5.Color} [color] - Kleur van de led, standaard: geel
     */
    setLed(row, col, state = true, color = null) {
        if (row >= 0 && row < this.height) {
            if (col >= 0 && col < this.width) {
                let nr = this.width * row + col
                this.Pixels[nr].turn(state, color)
            } else {
                console.warn("De kolom die je opgaf als tweede parameter aan setLed() valt buiten de matrix");
            }
        } else {
            console.warn("De rij die je opgaf als eerste parameter aan setLed() valt buiten de matrix");
        }
    }
}

/**
 * Pixel Class voor het weergeven van pixels in de led matrix. Deze wordt gebruik door Matrix, maar zou je niet rechtstreeks moeten aanspreken.
 */
class Pixel {
    constructor(matrixWidth = WIDTH, matrixHeight = HEIGHT) {
        this.index = Pixel.counter
        this.width = matrixWidth
        this.height = matrixHeight
        this.row = this.getRow()
        this.col = this.getCol()
        this.diameter = DIAMETER
        this.xPos = this.col * this.diameter + Math.ceil(this.diameter / 2)
        this.yPos = this.row * this.diameter + Math.ceil(this.diameter / 2)
        this.state = false
        this.color = ('#ffff00')
    }
    show() {
        if (this.state) {
            fill(this.color);
            ellipse(this.xPos, this.yPos, this.diameter);
        } else {
            fill('#222');
            ellipse(this.xPos, this.yPos, this.diameter);
        }
    }
    turn(state, color = null) {
        if (color) { this.color = color }
        this.state = !!state
    }
    getRow(index = this.index) {
        return Math.floor(index / this.width)
    }
    getCol(index = this.index) {
        return index % this.width
    }
    static get counter() {
        Pixel._counter = (Pixel._counter || 0) + 1
        return Pixel._counter - 1
    }
}