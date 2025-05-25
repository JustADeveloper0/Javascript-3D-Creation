const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d");

const cssWidth = 800;
const cssHeight = 800;

const scale = 100;
const scaleFactor = 2;

const cameraPos = [0, 0, 0];
const fov = 500;

const movementSpeed = 0.1;
const keys = {};

var circle_pos = [(cssWidth / 2) * scaleFactor, (cssHeight / 2) * scaleFactor];

var angle = 0;

canvas.width = cssWidth * scaleFactor;
canvas.height = cssHeight * scaleFactor;

canvas.style.width = `${cssWidth}px`;
canvas.style.height = `${cssHeight}px`;

const projection_matrix = [
    [1, 0, 0],
    [0, 1, 0]
];

var points = [];

points.push([-1, -1, 1]);
points.push([1, -1, 1]);
points.push([1, 1, 1]);
points.push([-1, 1, 1]);
points.push([-1, -1, -1]);
points.push([1, -1, -1]);
points.push([1, 1, -1]);
points.push([-1, 1, -1]);

document.addEventListener('keydown', (event) => {
    keys[event.key] = true;
});

document.addEventListener('keyup', (event) => {
    keys[event.key] = false;
});

const FPS = 60;
const frameInterval = 1000 / FPS;
let lastFrameTime = 0;

function update() {
    updateCamera();
    angle += 0.01;
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const rotation_y = [
        [Math.cos(angle), 0, Math.sin(angle)],
        [0, 1, 0],
        [-Math.sin(angle), 0, Math.cos(angle)]
    ];

    const rotation_z = [
        [Math.cos(angle), -Math.sin(angle), 0],
        [Math.sin(angle), Math.cos(angle), 0],
        [0, 0, 1]
    ];

    var projected_points = Array.from({ length: points.length }, (_, n) => [n, n]);

    let i = 0;

    points.forEach((point) => {
        var rotated2d = dot(rotation_z, reshape(point, 3, 1));
        rotated2d = dot(rotation_y, rotated2d);

        const cameraAdjustedPoint = [
            rotated2d[0] - cameraPos[0],
            rotated2d[1] - cameraPos[1],
            rotated2d[2] - cameraPos[2]
        ];

        var perspectiveFactor = fov / (cameraAdjustedPoint[2] + fov);
        var projected2d = dot(projection_matrix, cameraAdjustedPoint);
        projected2d[0] *= perspectiveFactor;
        projected2d[1] *= perspectiveFactor;

        let pointX = (projected2d[0] * scale) + circle_pos[0];
        let pointY = (projected2d[1] * scale) + circle_pos[1];

        projected_points[i] = [pointX, pointY];

        ctx.beginPath();
        ctx.arc(pointX, pointY, 3, 0, 2 * Math.PI);
        ctx.fillStyle = 'black';
        ctx.fill();
        ctx.closePath();

        i++;
    });

    for (let p = 0; p < 4; p++) {
        connectPoints(p, (p + 1) % 4, projected_points);
        connectPoints(p + 4, (p + 1) % 4 + 4, projected_points);
        connectPoints(p, (p + 4), projected_points);
    }
}

function gameLoop(currentTime) {
    const deltaTime = currentTime - lastFrameTime;

    if (deltaTime >= frameInterval) {
        lastFrameTime = currentTime - (deltaTime % frameInterval);

        update();
        render();
    }

    requestAnimationFrame(gameLoop);
}

function dot(a, b) {
    if (Array.isArray(a[0]) && Array.isArray(b[0])) {
        let result = [];
        for (let i = 0; i < a.length; i++) {
            let row = [];
            for (let j = 0; j < b[0].length; j++) {
                let sum = 0;
                for (let k = 0; k < b.length; k++) {
                    sum += a[i][k] * b[k][j];
                }
                row.push(sum);
            }
            result.push(row);
        }
        return result;
    }
    else if (a.length == b.length && !Array.isArray(a[0]) && !Array.isArray(b[0])) {
        let result = 0;
        for (let i = 0; i < a.length; i++) {
            result += a[i] * b[i];
        }
        return result;
    }
    else if (Array.isArray(a[0]) && !Array.isArray(b[0])) {
        let result = [];
        for (let i = 0; i < a.length; i++) {
            let sum = 0;
            for (let j = 0; j < b.length; j++) {
                sum += a[i][j] * b[j];
            }
            result.push(sum);
        }
        return result;
    } else {
        throw new Error("Bad dimensions!");
    }
}

function reshape(arr, r, c) {
    if (arr.length !== r * c) {
        throw new Error("Total of elements is not equal to the wanted shape!");
    }

    let reshapedArr = [];
    for (let i = 0; i < r; i++) {
        reshapedArr.push(arr.slice(i * c, i * c + c));
    }
    return reshapedArr;
}

function connectPoints(i, j, points) {
    ctx.beginPath();
    ctx.moveTo(points[i][0], points[i][1]);
    ctx.lineTo(points[j][0], points[j][1]);
    ctx.stroke();
}

function updateCamera() {
    if (keys['w']) {
        cameraPos[2] += movementSpeed * 75;
    }
    if (keys['s']) {
        cameraPos[2] -= movementSpeed * 75;
    }
    if (keys['a']) {
        cameraPos[0] -= movementSpeed;
    }
    if (keys['d']) {
        cameraPos[0] += movementSpeed;
    }
    if (keys[' ']) {
        cameraPos[1] -= movementSpeed;
    }
    if (keys['Shift']) {
        cameraPos[1] += movementSpeed;
    }
}

gameLoop();
