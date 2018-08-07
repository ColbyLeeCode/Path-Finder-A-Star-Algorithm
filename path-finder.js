
var padding = 2;
var tileDim = 20;
var mouseHeld = false;
var mouseX, mouseY, map, ctx;
var startButton, endButton, solidButton, blankButton, run, finder;
var tileType = { "blank": 0, "solid": 1, "start": 2, "end": 3 };
var path = [];


//time between updates
setInterval(update, 40);

function init() {
    //canvas.addEventListener('click', clickHandle, false);

    //add listeners to canvas for mouse input
    canvas.addEventListener('mousedown', mouseDownHandler);
    canvas.addEventListener('mouseup', mouseUpHandler);
    canvas.addEventListener('mousemove', updateMousePos);

    startButton = document.getElementById("start-button");
    endButton = document.getElementById("end-button");
    solidButton = document.getElementById("solid-button");
    blankButton = document.getElementById("blank-button");
    runButton = document.getElementById("run-button");
    //add listeners to buttons

    startButton.addEventListener('click', sButtonHit);
    endButton.addEventListener('click', eButtonHit);
    solidButton.addEventListener('click', solidButtonHit);
    blankButton.addEventListener('click', blankButtonHit);
    runButton.addEventListener('click', runButtonHit);

    ctx = canvas.getContext("2d");
    //build map 
    map = buildMap(adjMapSize(padding, tileDim, canvas.width), adjMapSize(padding, tileDim, canvas.height));

    //add neighbors to all tiles
    initTileNeighbors();
    //load the bursh with solid tile type
    brush = new Brush(tileType.solid);

}

function initTileNeighbors() {
    for (var x = 0; x < map.length; x++) {
        for (var y = 0; y < map[0].length; y++) {
            map[x][y].addNeighbors();
            console.log("adding neighbors");
        }
    }

}

function solidButtonHit() {
    brush.brush = tileType.solid;
}

function blankButtonHit() {
    brush.brush = tileType.blank;
}

function sButtonHit() {
    console.log("Next piece is a start tile");
    brush.brush = tileType.start;
}

function eButtonHit() {
    console.log("Next piece is an end tile");
    brush.brush = tileType.end;
}

function runButtonHit() {
    finder = new Pathfinder(map);
    finder.begin();

    console.log("Running path finder");
}

function updateMousePos(event) {
    var rect = canvas.getBoundingClientRect();
    mouseX = event.pageX - rect.left;
    mouseY = event.pageY - rect.top;
}

function update() {

    //handle mouse held
    handleMouseHeld(mouseX, mouseY);

    drawMap();

}

function handleMouseHeld(mouseX, mouseY) {
    //If the mouse is held paint whatever is under it with tiletype loaded into brush
    if (mouseHeld) {
        paintTileAt(mouseX, mouseY)
    }
}

function paintTileAt(mouseX, mouseY) {

    var tile = getTileAt(mouseX, mouseY, tileDim, padding);

    switch (brush.brush) {
        case tileType.blank:
            console.log("painting blank tile")
            tile.type = tileType.blank;
            tile.color = "#dae1ed";
            break;

        case tileType.solid:
            console.log("painting solid tile")
            tile.type = tileType.solid;
            tile.color = "#000000";
            break;

        case tileType.start:
            console.log("painting start tile")
            tile.type = tileType.start;
            tile.color = "#00ff99";
            break;

        case tileType.end:
            console.log("painting end tile")
            tile.type = tileType.end;
            tile.color = "#ff5050";
            break;
    }


}

function mouseDownHandler(event) {
    console.log("mouse down");
    mouseHeld = true;
    lastEvent = event;

}

function mouseUpHandler(event) {
    console.log("mouse up");
    mouseHeld = false;
    lastEvent = event;
}



function clickHandle(event) {

    console.log("Click recieved");

    //determine which tile was clicked
    var clickedTile = getTileAt(mouseX, mouseY, tileDim, padding);
    if (clickedTile != null) {
        console.log(clickedTile.toString());
        clickedTile.toggleSolid();
    }

    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    //draw map
    //drawMap();

}

function getTileAt(mouseX, mouseY, dim, pad) {

    var tilePbx = mouseX / dim;
    var padSub = tilePbx * pad / dim;
    var tileX = Math.ceil(tilePbx - padSub) - 1;

    console.log("tileX: " + tileX);

    var tilePbx = mouseY / dim;
    var padSub = tilePbx * pad / dim;
    var tileY = Math.ceil(tilePbx - padSub) - 1;

    console.log("tileY: " + tileY);

    //Check if tile is on the map
    if (tileX < map.length && tileY < map[0].length)
        return map[tileX][tileY];
}



/*This function will return the max number of tiles that can be 
fit within the canvas given canvas dimension, square tile dimension and padding size*/
function adjMapSize(padding, tileDim, cDim) {
    var maxTiles = cDim / tileDim;
    var paddingSub = maxTiles * padding / tileDim;
    maxTiles = maxTiles - paddingSub;
    console.log("max tiles: " + maxTiles);
    return maxTiles;

}

function drawMap() {

    for (x = 0; x < map.length; x++) {
        for (y = 0; y < map[x].length; y++) {
            //console.log("x: " + x + " y: " + y );
            //console.log(map[x][y].toString());
            map[x][y].draw(ctx, padding);


        }
    }

    if (finder) {
        for (j = 0; j < finder.open.length; j++) {
            if (!path.includes(finder.open[j])) {
                finder.open[j].color = "#d942f4";
                finder.open[j].draw(ctx, padding);
            }
        }

        for (j = 0; j < finder.closed.length; j++) {
            if (!path.includes(finder.closed[j])) {
                finder.closed[j].color = "#751f84";
                finder.closed[j].draw(ctx, padding);
            }
        }
    }

    if (path) {
        for (j = 0; j < path.length; j++) {
            if (path[j].type != tileType.start && path[j].type != tileType.end) {
                path[j].color = "#0000ff";
            }
        }
    }
}


//Builds tile map array with given dimensions
function buildMap(width, height) {
    var map = [[]];
    for (x = 0; x < width; x++) {
        map[x] = [];
        for (y = 0; y < height; y++) {
            map[x][y] = new myTile(tileDim, tileDim, x, y);
            console.log("added new tile to map");
        }
    }

    return map
}


function findTileByType(mapIn, tType) {
    for (x = 0; x < mapIn.length; x++) {
        for (y = 0; y < mapIn[0].length; y++) {
            var chkTile = mapIn[x][y];

            if (chkTile.type === tType) {
                console.log("Tile of type: " + tType + " found at: " + chkTile.posX + ", " + chkTile.posY);
                return chkTile;
            }
        }
    }
    alert("Please place a start and end tile.");
    console.log("No tile " + tType + " found");
}

function removeFromArray(arr, elt) {

    for (var i = arr.length; i >= 0; i--) {
        if (arr[i] == elt) {
            arr.splice(i, 1);
        }
    }

}

function heuristic(a, b) {
    var x = a.posX - b.posX;
    var y = a.posY - b.posY;

    var d = Math.sqrt(x * x + y * y);

    //var d = Math.abs(a.posX - b.posX) + Math.abs(a.posY - b.posY);
    return d;
}

function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
      end = new Date().getTime();
   }
 }



//Tile parameters are height and width in px, and pos on map
class myTile {
    constructor(height, width, posX, posY) {
        this.height = height;
        this.width = width;
        this.posX = posX;
        this.posY = posY;
        this.type = tileType.blank;
        this.color = "#dae1ed";
        this.neighbors = [];
        this.data = new NodeData();
        this.previous = undefined;
    }

    addNeighbors() {

        var x = this.posX;
        var y = this.posY;

        if (x < map.length - 1) {
            this.neighbors.push(map[x + 1][y]);
        }
        if (x > 0) {
            this.neighbors.push(map[x - 1][y]);
        }
        if (y < map[0].length - 1) {
            this.neighbors.push(map[x][y + 1]);
        }
        if (y > 0) {
            this.neighbors.push(map[x][y - 1]);
        }

        //top left
        if (x > 0 && y > 0) {
            this.neighbors.push(map[x - 1][y - 1]);
        }
        //top right
        if (x < map.length - 1 && y > 0) {
            this.neighbors.push(map[x + 1][y - 1]);
        }

        //bottom left
        if (x > 0 && y < map[0].length - 1) {
            this.neighbors.push(map[x - 1][y + 1]);
        }

        //bottom right
        if (x < map.length - 1 && y > 0) {
            this.neighbors.push(map[x + 1][y + 1]);
        }


    }

    draw(ctx, padding) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.posX * this.width + padding * this.posX, this.posY * this.height + padding * this.posY, this.width, this.height);
    }

    toString() {
        return "Tile x,y: " + this.posX + ", " + this.posY + "solid: " + this.solid;
    }

    toggleSolid() {
        if (this.solid)
            this.solid = false;
        else
            this.solid = true;
    }
}

//Node data class used to hold scores for tiles
class NodeData {
    constructor() {
        //distance from starting node
        this.g = 0;

        //distance from the end node
        this.h = 0;

        //final score
        this.f = 0;

        //which node/tile it we step from
        this.previous = undefined;

    }
}

//Load brush with tile type enums 
class Brush {
    constructor(tType) {
        this.brush = tType;
    }
}

class Pathfinder {
    //Returns the first starting tile found on map passed in
    constructor(mapIn) {

        this.tileMap = mapIn;
        this.start = findTileByType(mapIn, tileType.start);
        this.end = findTileByType(mapIn, tileType.end);
        this.open = [];
        this.closed = [];

    }



    //called to initiate path finder
    begin() {
        console.log("beginning search");
        //push start tile into open list

        // console.log("start tile: " + this.start.toString());
        this.open.push(this.start);

        //console.log("first element of open: " + this.open[0].toString());

        //console.log("open tile count: " + this.open.length);


        while (this.open.length > 0) {
           

            //console.log("closed size: " + this.closed.length);
            //console.log("open size: " + this.open.length);


            if(this.step() == 1)
                break;

            
            


        }

    }

    step()
    {
         //find the lowest scored node on the list
         var lowest = 0;
         for (var i = 0; i < this.open.length; i++) {
             if (this.open[i].data.f < this.open[lowest].data.f) {
                 lowest = i;
             }
         }

         var focused = this.open[lowest];
         //console.log("focused tile at: " + focused.posX + ", " +focused.posY);

         if (focused === this.end) {
             //console.log("path finding complete");
             //find path
             path = [];
             var temp = focused;
             path.push(temp);
             while (temp.previous) {
                 //temp.previous.color = "#0000ff";
                 path.push(temp.previous);
                 temp = temp.previous;
             }

             return 1;
         }

         //console.log("closed size: " + this.closed.length);
         //console.log("open size: " + this.open.length);

         this.closed.push(focused);
         removeFromArray(this.open, focused);

         //console.log("closed size: " + this.closed.length);
         //console.log("open size: " + this.open.length);



         //console.log("focused tiles neighbor count: " + focused.neighbors.length)
         for (var j = 0; j < focused.neighbors.length; j++) {
             //console.log("checking neighbors scores");
             var neighbor = focused.neighbors[j];
             if (neighbor) {

                 if (!this.closed.includes(neighbor) && neighbor.type != tileType.solid) {
                     //console.log("neighbor not included in closed, testing score");
                     var tempG = focused.data.g + 1;

                     var newPath = false;
                     if (this.open.includes(neighbor)) {
                         if (tempG < neighbor.data.g) {
                             neighbor.data.g = tempG;
                             newPath = true;
                         }
                     } else {
                         neighbor.data.g = tempG;
                         newPath = true;
                         this.open.push(neighbor);
                     }

                     if (newPath) {
                         neighbor.previous = focused;
                     }
                     neighbor.data.h = heuristic(neighbor, this.end);
                     neighbor.data.f = neighbor.data.g + neighbor.data.h;

                     //console.log("Neighbors heuristic: " + neighbor.data.h);
                     //console.log("Neighbors final: " + neighbor.data.f);
                 }
             }
         }

    }





}



init();

