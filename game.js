var myWidth = 800;
var myHeight = 600;
var windowsWidth = window.innerWidth;
var windowsHeight = window.innerHeight;
var ratio_width = windowsWidth / myWidth;
var ratio_height = windowsHeight / myHeight;
var pixelSize = Math.floor(Math.min(ratio_width, ratio_height));
var canvas = document.getElementById("myCanvas");
canvas.width = myWidth * pixelSize;
canvas.height = myHeight * pixelSize;
var ctx = canvas.getContext("2d");

var Area = (function () {
    function Area(xMin, xMax, yMin, yMax, zMin, zMax) {
        this.xMin = xMin;
        this.yMin = yMin;
        this.zMin = zMin;
        this.xMax = xMax;
        this.yMax = yMax;
        this.zMax = zMax;
    }
    return Area;
}());

var Point = (function () {
    function Point(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    return Point;
}());

var Vector = (function () {
    function Vector(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    return Vector;
}());

var Model = (function () {
    function Model(vertices, edges) {
        this.vertices = vertices;
        this.edges = edges;
    }
    return Model;
}());

var cubeModel = new Model([
    new Point(50, 50, 50),
    new Point(50, 50, -50),
    new Point(50, -50, 50),
    new Point(-50, 50, 50),
    new Point(50, -50, -50),
    new Point(-50, 50, -50),
    new Point(-50, -50, 50),
    new Point(-50, -50, -50),
], [
    [0, 1],
    [0, 2],
    [0, 3],
    [1, 4],
    [1, 5],
    [2, 4],
    [2, 6],
    [3, 5],
    [3, 6],
    [4, 7],
    [5, 7],
    [6, 7],
]);

var Instance = (function () {
    function Instance(model, location) {
        this.model = model;
        this.location = location;
    }
    return Instance;
}());

var objects = [
    //new Instance(cubeModel, new Point(0, 0, 200)),
    //new Instance(cubeModel, new Point(150, 0, 200)),
    //new Instance(cubeModel, new Point(-150, 0, 200))
];

var keyState = {
    up: false,
    down: false,
    left: false,
    right: false
};

document.addEventListener('keydown', function (e) {
    var keyName = e.key || e["keyIdentifier"]; // Chrome vs Safari
    if (keyName == "ArrowUp" || keyName == "Up")
        keyState.up = true;
    if (keyName == "ArrowDown" || keyName == "Down")
        keyState.down = true;
    if (keyName == "ArrowLeft" || keyName == "Left")
        keyState.left = true;
    if (keyName == "ArrowRight" || keyName == "Right")
        keyState.right = true;
});

document.addEventListener('keyup', function (e) {
    var keyName = e.key || e["keyIdentifier"];
    if (keyName == "ArrowUp" || keyName == "Up")
        keyState.up = false;
    if (keyName == "ArrowDown" || keyName == "Down")
        keyState.down = false;
    if (keyName == "ArrowLeft" || keyName == "Left")
        keyState.left = false;
    if (keyName == "ArrowRight" || keyName == "Right")
        keyState.right = false;
});
var screen_dist = 400;
var playerPos = { x: 0, y: 0, z: 0 };


function setCubes(num) {
    for (var i=0; i<num; i++) {
        var newx = Math.floor((Math.random() * (gameArea.xMax-50 - gameArea.xMin-50 )) + gameArea.xMin+50);
        var newz = Math.floor((Math.random() * Math.abs(Math.abs(gameArea.zMin - gameArea.zMax)-200) - gameArea.zMin-screen_dist));
        objects.push(new Instance(cubeModel, new Point(newx,0,newz)));
    }
}

function drawLine(ctx, p, q) {
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(q.x, q.y);
    ctx.stroke();
    ctx.closePath();
}

function drawLine3d(ctx, p1, p2) {
    var x1 = Math.round(p1.x * (screen_dist / p1.z));
    var y1 = Math.round(p1.y * (screen_dist / p1.z));
    var x2 = Math.round(p2.x * (screen_dist / p2.z));
    var y2 = Math.round(p2.y * (screen_dist / p2.z));
    drawLine(ctx, { x: x1 + myWidth / 2, y: y1 + myHeight / 2 }, { x: x2 + myWidth / 2, y: y2 + myHeight / 2 });
}

var finishLine = 600;
var gameArea = new Area(-400, 400, 0, 0, -finishLine, 0);
setCubes(20);

function redraw() {
    ctx.clearRect(0, 0, myWidth * pixelSize, myHeight * pixelSize);
    ctx.strokeStyle="#F00";
    for (var i = 0; i < objects.length; i++) {
        var object = objects[i];
        for (var j = 0; j < object.model.edges.length; j++) {
            var p1 = object.model.vertices[object.model.edges[j][0]];
            var p2 = object.model.vertices[object.model.edges[j][1]];
            var loc = object.location;
            var newP1 = new Point(p1.x + loc.x + playerPos.x, p1.y + loc.y + playerPos.y, p1.z + loc.z + playerPos.z);
            var newP2 = new Point(p2.x + loc.x + playerPos.x, p2.y + loc.y + playerPos.y, p2.z + loc.z + playerPos.z);
            var cutLine = cutLineToScreen(newP1, newP2);
            if (cutLine)
                drawLine3d(ctx, cutLine[0], cutLine[1]);
        }
    }
    if (keyState.up) {
        if (playerPos.z > gameArea.zMin) {
            playerPos.z -= 2;
        }
    }
    if (keyState.down) {
        if (playerPos.z < gameArea.zMax) {
            playerPos.z += 2;
        }
    }
    if (keyState.left) {
        if (playerPos.x < gameArea.xMax) {
            playerPos.x += 4;
        }
    }
    if (keyState.right) {
        if (playerPos.x > gameArea.xMin) {
            playerPos.x -= 4;
        }
    }

    for (var i=0; i<objects.length; i++) {
        var xMin = -(objects[i].location.x + 50);
        var xMax = xMin + 100;
        var zMin = -(objects[i].location.z) -50;
        var zMax = zMin+100;
        if (playerPos.x >= xMin && playerPos.x <= xMax && playerPos.z >= zMin && playerPos.z <= zMax) {
            playerPos.x = 0, playerPos.z = 0;
        }
    }
    if (playerPos.z <= -finishLine) {
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.font = "50px Arial";
        ctx.fillText("YOU WON!", myWidth /2, myHeight/2);
    }
    window.requestAnimationFrame(redraw);
}
window.requestAnimationFrame(redraw);

// Returns corss product of vectors u and v
function cross(u, v) {
    return new Vector(u.y * v.z - u.z * v.y, u.z * v.x - u.x * v.z, u.x * v.y - u.y * v.x);
}
// Returns dot product of vectors u and v
function dot(u, v) {
    return u.x * v.x + u.y * v.y + u.z * v.z;
}

var screenVertices = [
    new Point(myWidth / 2, myHeight / 2, screen_dist),
    new Point(-myWidth / 2, myHeight / 2, screen_dist),
    new Point(-myWidth / 2, -myHeight / 2, screen_dist),
    new Point(myWidth / 2, -myHeight / 2, screen_dist),
];

var screenNormals = [
    cross(screenVertices[0], screenVertices[1]),
    cross(screenVertices[1], screenVertices[2]),
    cross(screenVertices[2], screenVertices[3]),
    cross(screenVertices[3], screenVertices[0]),
];

// Returns true if point is inside the screen, false otherwise
function isInScreen(p) {
    for (var i = 0; i < screenNormals.length; i++)
        if (dot(p, screenNormals[i]) < -0.001) // 0 might cause problems while comparing - line disappears sometimes
            return false;
    return true;
}

// Returns part of the line between points if something is visible, null otherwise
function cutLineToScreen(p1, p2) {
    var isp1InScreen = isInScreen(p1);
    var isp2InScreen = isInScreen(p2);
    if (isp1InScreen && isp2InScreen)
        return [p1, p2];
    var firstVisible = isp1InScreen ? p1 : (isp2InScreen ? p2 : null);
    var secondVisible = null;
    // now find the intersections and keep going until we have two visible
    // points
    for (var i = 0; i < screenNormals.length; i++) {
        var ip = linePlaneIntersection(p1, p2, screenNormals[i]);
        if (ip != null && isInScreen(ip)) {
            if (firstVisible == null) {
                firstVisible = ip;
            }
            else if (secondVisible == null) {
                secondVisible = ip;
                break;
            }
        }
    }
    if (firstVisible != null && secondVisible != null)
        return [firstVisible, secondVisible];
    else
        return null;
}

// Returns point where line created by p1 and p2 intersects the plane or null if it doesn't
function linePlaneIntersection(p1, p2, n) {
    var v = [p2.x - p1.x, p2.y - p1.y, p2.z - p1.z];
    var t = -1 * (n.x * p1.x + n.y * p1.y + n.z * p1.z) /
        (n.x * v[0] + n.y * v[1] + n.z * v[2]);
    if (t < 0 || t > 1)
        return null;
    return new Point(p1.x + t * v[0], p1.y + t * v[1], p1.z + t * v[2]);
}

