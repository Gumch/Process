
const cube = document.getElementById("cube");
const scene = document.querySelector(".scene");

const clockwiseButton = document.getElementById("clockwise");
const anticlockwiseButton = document.getElementById("anticlockwise");

// ======================================
// SETTINGS
// ======================================

const cubeSensitivity = 0.01;

// Quaternion format: [x, y, z, w]

let rotation = [0, 0, 0, 1];

let draggingCube = false;

let previousX = 0;
let previousY = 0;

// Check HTML elements

if (!cube || !scene) {
    throw new Error("Cube or scene element not found!");
}

// ======================================
// QUATERNION MULTIPLICATION
// ======================================

function multiply(a, b) {

    const [ax, ay, az, aw] = a;
    const [bx, by, bz, bw] = b;

    return [
        aw * bx + ax * bw + ay * bz - az * by,
        aw * by - ax * bz + ay * bw + az * bx,
        aw * bz + ax * by - ay * bx + az * bw,
        aw * bw - ax * bx - ay * by - az * bz
    ];
}

// ======================================
// AXIS ROTATION
// ======================================

function axisRotation(axis, angle) {

    const half = angle / 2;

    const s = Math.sin(half);
    const c = Math.cos(half);

    if (axis === "x") {
        return [s, 0, 0, c];
    }

    if (axis === "y") {
        return [0, s, 0, c];
    }

    if (axis === "z") {
        return [0, 0, s, c];
    }
}

// ======================================
// NORMALIZE QUATERNION
// ======================================

function normalize(q) {

    const length = Math.hypot(...q);

    return q.map(value => value / length);
}

// ======================================
// UPDATE 3D CUBE
// ======================================

function updateCube() {

    const [x, y, z, w] = rotation;

    const xx = x * x;
    const yy = y * y;
    const zz = z * z;

    const xy = x * y;
    const xz = x * z;
    const yz = y * z;

    const wx = w * x;
    const wy = w * y;
    const wz = w * z;

    const matrix = [

        1 - 2 * (yy + zz),
        2 * (xy + wz),
        2 * (xz - wy),
        0,

        2 * (xy - wz),
        1 - 2 * (xx + zz),
        2 * (yz + wx),
        0,

        2 * (xz + wy),
        2 * (yz - wx),
        1 - 2 * (xx + yy),
        0,

        0, 0, 0, 1
    ];

    cube.style.transform =
        `matrix3d(${matrix.join(",")})`;
}

// ======================================
// CLOCKWISE / ANTICLOCKWISE
// ======================================

function rotateCubeStep(direction) {

    // Rotate around Z-axis by 90 degrees

    const step = axisRotation(
        "z",
        direction * Math.PI / 2
    );

    rotation = normalize(
        multiply(step, rotation)
    );

    updateCube();
}

// Clockwise button

if (clockwiseButton) {

    clockwiseButton.addEventListener("click", () => {

        rotateCubeStep(1);

    });

}

// Anticlockwise button

if (anticlockwiseButton) {

    anticlockwiseButton.addEventListener("click", () => {

        rotateCubeStep(-1);

    });

}

// ======================================
// INITIAL ORIENTATION
// ======================================

rotation = multiply(
    axisRotation("x", -20 * Math.PI / 180),
    axisRotation("y", -30 * Math.PI / 180)
);

rotation = normalize(rotation);

updateCube();

// ======================================
// START MOUSE DRAGGING
// ======================================

scene.addEventListener("pointerdown", function(event) {

    if (event.pointerType === "mouse" && event.button !== 0) {
        return;
    }

    draggingCube = true;

    previousX = event.clientX;
    previousY = event.clientY;

    scene.setPointerCapture(event.pointerId);

});

// ======================================
// HANDLE MOUSE MOVEMENT
// ======================================

scene.addEventListener("pointermove", function(event) {

    if (!draggingCube) return;

    const moveX = event.clientX - previousX;
    const moveY = event.clientY - previousY;

    // Horizontal rotation

    const horizontal = axisRotation(
        "y",
        -moveX * cubeSensitivity
    );

    // Vertical rotation

    const vertical = axisRotation(
        "x",
        moveY * cubeSensitivity
    );

    const movement = multiply(
        horizontal,
        vertical
    );

    rotation = normalize(
        multiply(movement, rotation)
    );

    previousX = event.clientX;
    previousY = event.clientY;

    updateCube();

});

// ======================================
// STOP DRAGGING
// ======================================

function stopDragging() {

    draggingCube = false;

}

scene.addEventListener("pointerup", stopDragging);

scene.addEventListener("pointercancel", stopDragging);

scene.addEventListener("lostpointercapture", stopDragging);
