let matrix = new Matrix(WIDTH, HEIGHT);
let r = 3
let c = 2

function setup() {
    matrix.init()
    frameRate(10)
}

function draw() {
    matrix.clear()
    showLed(r, c)
    matrix.show()

    let x = readJoystickX()
}

function showLed(row, col) {
    matrix.setLed(row, col, true, color('yellow'))
}