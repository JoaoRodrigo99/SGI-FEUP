import { CGFobject, CGFappearance, CGFshader, CGFtexture} from "../lib/CGF.js";
import { MyTile } from "./MyTile.js";
import { MyPiece } from "./MyPiece.js";
import {MyGameBoard} from "./MyGameBoard.js";
import {MyGameMove} from "./MyGameMove.js";
import {MyGameSequence} from "./MyGameSequence.js";
import {MyAnimator} from "./MyAnimator.js";
import { MyAnimation } from "./MyAnimation.js";
import { MySceneGraph } from './MySceneGraph.js';
import { MyAnimationInfo } from "./MyAnimationInfo.js";
import {MyUnitCubeQuad} from "./MyUnitCubeQuad.js";
import { MyQuad } from "./MyQuad.js";

export class MyGameOrchestrator {
  tiles = [];
  constructor(myScene) {
    this.scene = myScene;
    this.pickedPiece = null;
    this.pickedTile = null;
    this.gameStart = false;
    this.gameDuration = 0;
    
    this.turnColor = "black";
    this.gameSequence = new MyGameSequence();
    this.animator = new MyAnimator(this.scene, this, this.gameSequence);

    var playTextureUrl = "scenes/images/play_button.jpg";
    this.playCube = new MyUnitCubeQuad(this.scene, playTextureUrl,playTextureUrl,playTextureUrl,playTextureUrl,playTextureUrl,playTextureUrl);
    var undoTextureUrl = "scenes/images/undo_button.png";
    this.undoCube = new MyUnitCubeQuad(this.scene, undoTextureUrl,undoTextureUrl,undoTextureUrl,undoTextureUrl,undoTextureUrl,undoTextureUrl);
    var cameraChangeTextureUrl = "scenes/images/camera_change.png";
    this.cameraChangeCube = new MyUnitCubeQuad(this.scene, cameraChangeTextureUrl,cameraChangeTextureUrl,cameraChangeTextureUrl,cameraChangeTextureUrl,cameraChangeTextureUrl,cameraChangeTextureUrl);
    var movieTextureUrl = "scenes/images/movie_button.png";
    this.movieCube = new MyUnitCubeQuad(this.scene, movieTextureUrl,movieTextureUrl,movieTextureUrl,movieTextureUrl,movieTextureUrl,movieTextureUrl);

    this.scoreBoardQuad = new MyQuad(this.scene);


    this.currentCamera = null;
    this.nextCamera = null;


    // create TILES
  for (let i = 0; i < 8; i++){
    for (let j = 0; j < 8; j++){
      this.tiles.push(new MyTile(this.scene, { x: j, y: i}));
    }
  }
    
  this.gameboard = new MyGameBoard(this.scene, this.tiles, "main");
  this.tiles = [];

  for (let i = 0; i < 8; i++){
        this.tiles.push(new MyTile(this.scene, { x: i, y: 1}));
        this.tiles.push(new MyTile(this.scene, { x: i, y: 0}));
  }

  this.auxboardRight = new MyGameBoard(this.scene, this.tiles, "aux");
  this.tiles = [];
  
  for (let i = 0; i < 8; i++){
    this.tiles.push(new MyTile(this.scene, { x: i, y: 12}));
    this.tiles.push(new MyTile(this.scene, { x: i, y: 13}));
  }

  this.auxboardLeft = new MyGameBoard(this.scene, this.tiles, "aux");
    
    // Can alternate scenes
    // this.theme = new MySceneGraph(filename, myScene);
  this.state = "menu";

  this.materialWhite = new CGFappearance(this.scene);
  // material.setTextureWrap("REPEAT", "REPEAT");
  this.materialWhite.setShininess(1);
  this.materialWhite.setEmission(0,0,0, 1);
  this.materialWhite.setAmbient(0.5,0.5,0.5, 1);
  this.materialWhite.setDiffuse(0.5,0.5,0.5, 1);
  this.materialWhite.setSpecular(0,0,0, 1);
  this.materialWhite.setTexture(null)


  this.appearance = new CGFappearance(this.scene);
  this.fontTexture = new CGFtexture(this.scene, "textures/oolite-font.trans.png");
  this.appearance.setTexture(this.fontTexture);

  // instatiate text shader (used to simplify access via row/column coordinates)
  // check the two files to see how it is done
  this.textShader =new CGFshader(this.scene.gl, "shaders/font.vert", "shaders/font.frag");

  // set number of rows and columns in font texture
  this.textShader.setUniformsValues({'dims': [16, 16]});

  }

  getPieceValidMoves(piece){
    // Returns [{tile: endTile, capture: capturedPiece}, ...]
    // Players can be moving in 2 directions, from right to left or left to right
    // If right to left can only move with positive y
    // If moving with y positive, get NE NW tiles, otherwise get SE SW tiles

    let possibleEndTiles = [];
    let pieceTile = piece.tile;
    let pieceColor = piece.type;

    // Get coords of piece's tile
    let currentCords = pieceTile.coords;

    // Get all diagonal tiles around piece - P - Piece
    // NE     NW
    //     P  
    // SE     SW


    // <----- Y+ direction
    let NEtile = this.gameboard.getTile(currentCords.x - 1, currentCords.y + 1);
    let NWtile = this.gameboard.getTile(currentCords.x + 1, currentCords.y + 1);

    // ------> Y- direction
    let SEtile = this.gameboard.getTile(currentCords.x - 1, currentCords.y - 1);
    let SWtile = this.gameboard.getTile(currentCords.x + 1, currentCords.y - 1);

    if(piece.isKing){
      // Can move in any directions
      while(NWtile != null){
        if(NWtile.piece == null){
          possibleEndTiles.push({"tile":NWtile, "capture": null});
        }
        else{
          // Check if tile is occupied by a piece of the same color
          if(NWtile.piece.type == pieceColor){
            // Same color, cant move there
            break;
          }
          else{
            // Different color, can capture piece
            // Verify if Nw of that tile is empty
            let NWtile2 = this.gameboard.getTile(NWtile.coords.x + 1, NWtile.coords.y + 1);
            if (NWtile2 != null && NWtile2.piece == null){
              possibleEndTiles.push({"tile":NWtile2, "capture": NWtile.piece});
              break;
            }
          }
        }
        NWtile = this.gameboard.getTile(NWtile.coords.x + 1, NWtile.coords.y + 1);
      }

      while(NEtile != null){
        if(NEtile.piece == null){
          possibleEndTiles.push({"tile":NEtile, "capture": null});
        }
        else{
          // Check if tile is occupied by a piece of the same color
          if(NEtile.piece.type == pieceColor){
            // Same color, cant move there
            break;
          }
          else{
            // Different color, can capture piece
            // Verify if Nw of that tile is empty
            let NEtile2 = this.gameboard.getTile(NEtile.coords.x - 1, NEtile.coords.y + 1);
            if (NEtile2 != null && NEtile2.piece == null){
              possibleEndTiles.push({"tile":NEtile2, "capture": NEtile.piece});
              break;
            }
          }
        }
        NEtile = this.gameboard.getTile(NEtile.coords.x - 1, NEtile.coords.y + 1);
      }

      while(SWtile != null){
        if(SWtile.piece == null){
          possibleEndTiles.push({"tile":SWtile, "capture": null});
        }
        else{
          // Check if tile is occupied by a piece of the same color
          if(SWtile.piece.type == pieceColor){
            // Same color, cant move there
            break;
          }
          else{
            // Different color, can capture piece
            // Verify if Nw of that tile is empty
            let SWtile2 = this.gameboard.getTile(SWtile.coords.x + 1, SWtile.coords.y - 1);
            if (SWtile2 != null && SWtile2.piece == null){
              possibleEndTiles.push({"tile":SWtile2, "capture": SWtile.piece});
              break;
            }
          }
        }
        SWtile = this.gameboard.getTile(SWtile.coords.x + 1, SWtile.coords.y - 1);
      }

      while(SEtile != null){
        if(SEtile.piece == null){
          possibleEndTiles.push({"tile":SEtile, "capture": null});
        }
        else{
          // Check if tile is occupied by a piece of the same color
          if(SEtile.piece.type == pieceColor){
            // Same color, cant move there
            break;
          }
          else{
            // Different color, can capture piece
            // Verify if Nw of that tile is empty
            let SEtile2 = this.gameboard.getTile(SEtile.coords.x - 1, SEtile.coords.y - 1);
            if (SEtile2 != null && SEtile2.piece == null){
              possibleEndTiles.push({"tile":SEtile2, "capture": SEtile.piece});
              break;
            }
          }
        }
        SEtile = this.gameboard.getTile(SEtile.coords.x - 1, SEtile.coords.y - 1);
      }

      return possibleEndTiles;
    }

    // 
    // Being that the piece is not a KING...

    if(pieceColor == "white"){
      if(NWtile != null){
        if(NWtile.piece == null){
          possibleEndTiles.push({"tile":NWtile, "capture": null});
        }
        else{
          // Check if tile is occupied by a piece of the same color
          if(NWtile.piece.type == pieceColor){
            // Same color, cant move there
          }
          else{
            // Different color, can capture piece

            // Verify if NE of that tile is empty
            let NWtile2 = this.gameboard.getTile(NWtile.coords.x + 1, NWtile.coords.y + 1);
            if (NWtile2 != null && NWtile2.piece == null)
              possibleEndTiles.push({"tile":NWtile2, "capture": NWtile.piece});
          }
        }
      }

      if(NEtile != null){
        if(NEtile.piece == null){
          possibleEndTiles.push({"tile":NEtile, "capture": null});
        }
        else{
          // Check if tile is occupied by a piece of the same color
          if(NEtile.piece.type == pieceColor){
            // Same color, cant move there
          }
          else{
            // Different color, can capture piece

            // Verify if NE of that tile is empty
            let NEtile2 = this.gameboard.getTile(NEtile.coords.x - 1, NEtile.coords.y + 1);
            if (NEtile2 != null && NEtile2.piece == null)
              possibleEndTiles.push({"tile":NEtile2, "capture": NEtile.piece});
          }
        }
      }

    } else{

      if(SWtile != null){
        if(SWtile.piece == null){
          possibleEndTiles.push({"tile":SWtile, "capture": null});
        }
        else{
          // Check if tile is occupied by a piece of the same color
          if(SWtile.piece.type == pieceColor){
            // Same color, cant move there
          }
          else{
            // Different color, can capture piece

            // Verify if NE of that tile is empty
            let SWtile2 = this.gameboard.getTile(SWtile.coords.x + 1, SWtile.coords.y - 1);
            if (SWtile2 != null && SWtile2.piece == null)
              possibleEndTiles.push({"tile":SWtile2, "capture": SWtile.piece});
          }
        }
      }

      if(SEtile != null){
        if(SEtile.piece == null){
          possibleEndTiles.push({"tile":SEtile, "capture": null});
        }
        else{
          // Check if tile is occupied by a piece of the same color
          if(SEtile.piece.type == pieceColor){
            // Same color, cant move there
          }
          else{
            // Different color, can capture piece
            
            // Verify if NE of that tile is empty
            let SEtile2 = this.gameboard.getTile(SEtile.coords.x - 1, SEtile.coords.y - 1);
            if (SEtile2 != null && SEtile2.piece == null)
              possibleEndTiles.push({"tile":SEtile2, "capture": SEtile.piece});
          }
        }
      }
    }

    return possibleEndTiles;
  }

  

  isMoveValid(piece, endTile){
    var validMoves = this.getPieceValidMoves(piece);
    // If endTile is in validMoves, then the move is valid
    // If there is a possible capture, than the move must be a capture
    var hasCapture = false;

    if(this.turnColor == "white"){
      for(let pieceC of this.gameboard.getWhitePieces()){
        let pieceMoves = this.getPieceValidMoves(pieceC);
        for(let i = 0; i < pieceMoves.length; i++){
          if(pieceMoves[i].capture != null){
            hasCapture = true;
            break;
          }
        }
        if(hasCapture)
          break;
      }
    }
    else{
      for(let pieceC of this.gameboard.getBlackPieces()){
        let pieceMoves = this.getPieceValidMoves(pieceC);
        for(let i = 0; i < pieceMoves.length; i++){
          if(pieceMoves[i].capture != null){
            hasCapture = true;
            break;
          }
        }
        if(hasCapture)
          break;
      }
    }

    // Validates if endTile is in a possible valid move
    for(let i = 0; i < validMoves.length; i++){
      if(hasCapture){
        if(validMoves[i].tile == endTile && validMoves[i].capture != null)
          return validMoves[i];
      }
      else{
        if(validMoves[i].tile == endTile)
          return validMoves[i];
      }
    }

    // Warn if endTile was not valid because of available capture
    if(hasCapture)
      console.warn("Invalid move, a capture is avaible");
    return null;
  }

  makePieceKing(piece){
    if(piece.isKing == false){
      if(piece.type == "white" && piece.tile.coords.y == 7){
        piece.isKing = true;
      }
      if(piece.type == "black" && piece.tile.coords.y == 0){
        piece.isKing = true;
      }
    }
  }

  removeCapturedPiece(piece){
    piece.isDead = true;

    // Find empty tile in respective auxiliar board
    let endTile = null;
    if(piece.type == "white"){
      endTile = this.findEmptyTileGbAux(this.auxboardRight);
    }
    else{
      endTile = this.findEmptyTileGbAux(this.auxboardLeft);
    }
    // Add animation to capture piece
    let animInfo = new MyAnimationInfo(this.scene, piece, piece.tile, endTile, this.time , "capture");
    this.animator.addAnimation(new MyAnimation(this.scene, animInfo, this.time));
    piece.isMoving = true;

    return;
    
  }

  findEmptyTileGbAux(gameboard){
    for(let tile of gameboard.tiles){
      if(tile.piece == null)
        return tile;
    }
  }

  handlePick(pickedObject, pickedId) {

    // Handle object picking
    // 10k values are reserved for 3D objects that have "menu" functions

    if(pickedId == 10001 && this.state == "menu" ){
      this.startGame();
      return;
    }

    if(pickedId == 10002 && this.state == "renderPossibleMoves" ){
      this.undo();
      return;
    }

    if(pickedId == 10003 && this.state == "renderPossibleMoves" ){
      this.setMovie();
      return;
    }

    if(pickedId == 10004 && (this.state == "renderPossibleMoves" || this.state == "destinationSelection") ){

      // Set camera change increments
      if(this.scene.camera.position[2] > 0){
        this.cameraPosZInc = -0.3; 
        this.nextCamera = this.scene.cameraArray[1];
      }
      else{
        this.cameraPosZInc = 0.3;
        this.nextCamera = this.scene.cameraArray[2];
      }
      if(this.scene.camera.target[2] > 0)
        this.cameraTarZInc = -0.3;
      else
        this.cameraTarZInc = 0.3;
      this.state = "cameraChange";
      return;
    }

    if(this.state != "renderPossibleMoves" && this.state != "verifyMove" && this.state != "destinationSelection")
      return;

    // Id
    // 0-100 -> Tile
    // 100-1000 -> Piece
    // > 1000 -> Auxiliar Tile, not used

    if(this.extraCapturePiece != null){
      if(pickedId / 100 < 1){
        this.pickedTile = pickedObject;
        this.pickedPiece = this.extraCapturePiece;
        this.state = "verifyMove";
      }
      else{
        console.warn("Picked a piece when there is a piece that must be captured");
        return;
      }
    }

    if(pickedId / 100 < 1){
      // Picked a tile
      // Picked Tile and previously selected a piece
      if(this.pickedPiece != null){
        this.pickedTile = pickedObject;

        // Is move valid?
        // Player isnt obliged to eat pieces
        this.state = "verifyMove";
      }
      else{
        // Picked Tile but without previous selecting a piece, does nothing
        this.pickedTile = null;
        this.state = "renderPossibleMoves";
      }
    }
    else if (pickedId / 1000 < 1){
      // Picked a piece , next picks a tile
      if(this.pickedPiece == null){
        if(pickedObject.type != this.turnColor){
          console.warn("Picked a piece of the wrong color");
          return;
        }
        this.pickedPiece = pickedObject;
        this.pickedPiece.isPicked = true;
        // Change camera to point to piece

        this.scene.lights[2].position = [this.pickedPiece.tile.coords.x + 0.5, 5, -Math.abs(this.pickedPiece.tile.coords.y) -3.5, 1];
        this.state = "destinationSelection";
        console.log("Possible Moves :");
        console.log(this.getPieceValidMoves(this.pickedPiece));
      }
      else{
        // Picked a piece but had already picked one, picking resets
        this.pickedPiece.isPicked = false;
        this.pickedPiece = null;
        // this.pickedPiece.isPicked = false;
        this.scene.lights[2].position = [ 0.5, -500, -3.5, 1];
        this.state = "renderPossibleMoves";
      }
    }
    else{ //PickerId > 950

    }
  }

  update(time) {
    this.time = time;
    // console.log(this.state);
    this.animator.update(time);

    // State machine
    switch (this.state) {
      case "menu":
        this.menu();
        break;
      case "loadScenario":
        this.loadScenario();
        break;
      case "nextTurn":
        this.nextTurn();
        break;
      case "renderPossibleMoves":
        this.renderPossibleMoves();
        break;
      case "destinationSelection":
        this.destinationSelection();
        break;
      case "verifyMove":
        this.verifyMove();
        break;
      case "movementAnimation":
        this.movementAnimation();
        break;
      case "hasGameEnded":
        this.hasGameEnded();
        break;
      case "endGame":
        this.endGame();
        break;
      case "undo":
        this.undo();
        break;
      case "movie":
        this.movie();
        break;
      case "cameraChange":
        this.cameraChange();
        break;
      default:
        break;
    }

    // Turn menu buttons available
    if(this.state == "menu")
     this.playCube.available = true;

    if(this.state == "renderPossibleMoves"){
      this.undoCube.available = true;
      this.movieCube.available = true;
    }

    if((this.state == "renderPossibleMoves" || this.state == "destinationSelection"))
      this.cameraChangeCube.available = true;
  }


  display() {

    this.displayTime();
    this.displayScore();
    this.displayButtons();

    this.gameboard.display();
    this.auxboardLeft.display();
    this.auxboardRight.display();
    this.animator.display();
    
  }

  displayScore(){
    // Enable shader

    // "White Score"
    let whiteScore = this.auxboardLeft.getNumberPieces();
    this.scene.pushMatrix();

    // Shaders values...
    this.scene.activeShader.setUniformsValues({'charCoords': [whiteScore % 10,3]});	// Set the char coords

    // Transformations - translate rotate scale
    var translateMatrix = mat4.create();
    mat4.translate(translateMatrix, translateMatrix, [11, 2, -5.5]);
    mat4.rotateY(translateMatrix, translateMatrix, -Math.PI/2);
    mat4.scale(translateMatrix, translateMatrix, [1, 1, 1]);
    this.scene.multMatrix(translateMatrix);

    this.scoreBoardQuad.display();

    this.scene.popMatrix();

    this.scene.pushMatrix();

    // Shaders values...
    this.scene.activeShader.setUniformsValues({'charCoords': [Math.floor(whiteScore / 10),3]});	// Set the char coords

    // Transformations - translate rotate scale
    var translateMatrix = mat4.create();
    mat4.translate(translateMatrix, translateMatrix, [11, 2, -6]);
    mat4.rotateY(translateMatrix, translateMatrix, -Math.PI/2);
    mat4.scale(translateMatrix, translateMatrix, [1, 1, 1]);
    this.scene.multMatrix(translateMatrix);

    this.scoreBoardQuad.display();

    this.scene.popMatrix();

    // "-" between scores
    this.scene.pushMatrix();

    // Shaders values...
    this.scene.activeShader.setUniformsValues({'charCoords': [6,9]});	// Set the char coords

    // Transformations - translate rotate scale
    var translateMatrix = mat4.create();
    mat4.translate(translateMatrix, translateMatrix, [11, 2, -6.5]);
    mat4.rotateY(translateMatrix, translateMatrix, -Math.PI/2);
    mat4.scale(translateMatrix, translateMatrix, [1, 1, 1]);
    this.scene.multMatrix(translateMatrix);

    this.scoreBoardQuad.display();

    this.scene.popMatrix();

    // "Black Score"
    let blackScore = this.auxboardRight.getNumberPieces();
    this.scene.pushMatrix();

    // Shaders values...
    this.scene.activeShader.setUniformsValues({'charCoords': [blackScore % 10,3]});	// Set the char coords

    // Transformations - translate rotate scale
    var translateMatrix = mat4.create();
    mat4.translate(translateMatrix, translateMatrix, [11, 2, -7]);
    mat4.rotateY(translateMatrix, translateMatrix, -Math.PI/2);
    mat4.scale(translateMatrix, translateMatrix, [1, 1, 1]);
    this.scene.multMatrix(translateMatrix);

    this.scoreBoardQuad.display();

    this.scene.popMatrix();

    this.scene.pushMatrix();

    // Shaders values...
    this.scene.activeShader.setUniformsValues({'charCoords': [blackScore / 10,3]});	// Set the char coords

    // Transformations - translate rotate scale
    var translateMatrix = mat4.create();
    mat4.translate(translateMatrix, translateMatrix, [11, 2, -7.5]);
    mat4.rotateY(translateMatrix, translateMatrix, -Math.PI/2);
    mat4.scale(translateMatrix, translateMatrix, [1, 1, 1]);
    this.scene.multMatrix(translateMatrix);

    this.scoreBoardQuad.display();

    this.scene.popMatrix();

    // Default Shaders
    this.scene.setActiveShader(this.scene.defaultShader);

    
  }

  displayTime(){

    let timeSeconds = Math.floor(this.time/1000) % 60;
    let timeMinutes = Math.floor(this.time/1000/60);

    if(this.state == "menu"){
      timeSeconds = this.gameDuration % 60;
      timeMinutes = this.gameDuration;
    }
    
    // Enable shader
    this.scene.setActiveShader(this.textShader);
    this.appearance.apply();

    // "Minutes X_"
    let minuteTenth = Math.floor(timeMinutes / 10);
    this.scene.pushMatrix();

    // Shaders values...
    this.scene.activeShader.setUniformsValues({'charCoords': [minuteTenth,3]});	// Set the char coords

    // Transformations - translate rotate scale
    var translateMatrix = mat4.create();
    mat4.translate(translateMatrix, translateMatrix, [-3, 2, -5.5]);
    mat4.rotateY(translateMatrix, translateMatrix, Math.PI/2);
    mat4.scale(translateMatrix, translateMatrix, [1, 1, 1]);
    this.scene.multMatrix(translateMatrix);

    this.scoreBoardQuad.display();

    this.scene.popMatrix();

    // "Minutes _X"
    let minuteUnit = Math.floor(timeMinutes % 10);
    this.scene.pushMatrix();

    // Shaders values...
    this.scene.activeShader.setUniformsValues({'charCoords': [minuteUnit,3]});	// Set the char coords

    // Transformations - translate rotate scale
    var translateMatrix = mat4.create();
    mat4.translate(translateMatrix, translateMatrix, [-3, 2, -6]);
    mat4.rotateY(translateMatrix, translateMatrix, Math.PI/2);
    mat4.scale(translateMatrix, translateMatrix, [1, 1, 1]);
    this.scene.multMatrix(translateMatrix);

    this.scoreBoardQuad.display();

    this.scene.popMatrix();


    // ":" between time numbers
    this.scene.pushMatrix();
    // Shaders values...
    this.scene.activeShader.setUniformsValues({'charCoords': [10,3]});	// Set the char coords

    // Transformations - translate rotate scale
    var translateMatrix = mat4.create();
    mat4.translate(translateMatrix, translateMatrix, [-3, 2, -6.5]);
    mat4.rotateY(translateMatrix, translateMatrix, Math.PI/2);
    mat4.scale(translateMatrix, translateMatrix, [1, 1, 1]);
    this.scene.multMatrix(translateMatrix);

    this.scoreBoardQuad.display();

    this.scene.popMatrix();

    // "Seconds X_"
    let secondTenth = Math.floor(timeSeconds / 10);
    this.scene.pushMatrix();

    // Shaders values...
    this.scene.activeShader.setUniformsValues({'charCoords': [secondTenth,3]});	// Set the char coords

    // Transformations - translate rotate scale
    var translateMatrix = mat4.create();
    mat4.translate(translateMatrix, translateMatrix, [-3, 2, -7]);
    mat4.rotateY(translateMatrix, translateMatrix, Math.PI/2);
    mat4.scale(translateMatrix, translateMatrix, [1, 1, 1]);
    this.scene.multMatrix(translateMatrix);

    this.scoreBoardQuad.display();

    this.scene.popMatrix();

    // "Seconds _X"
    let secondUnit = Math.floor(timeSeconds % 10);
    this.scene.pushMatrix();

    // Shaders values...
    this.scene.activeShader.setUniformsValues({'charCoords': [secondUnit,3]});	// Set the char coords

    // Transformations - translate rotate scale
    var translateMatrix = mat4.create();
    mat4.translate(translateMatrix, translateMatrix, [-3, 2, -7.5]);
    mat4.rotateY(translateMatrix, translateMatrix, Math.PI/2);
    mat4.scale(translateMatrix, translateMatrix, [1, 1, 1]);
    this.scene.multMatrix(translateMatrix);

    this.scoreBoardQuad.display();

    this.scene.popMatrix();

    // Default Shaders
    // this.scene.setActiveShader(this.scene.defaultShader);

  }

  displayButtons(){

    // Play Button
    this.scene.pushMatrix();
    var translateMatrix = mat4.create();
    mat4.translate(translateMatrix, translateMatrix, [12, 2, -4]);
    mat4.scale(translateMatrix, translateMatrix, [2, 2, 2])
    this.scene.multMatrix(translateMatrix);
    this.scene.registerForPick(10001, this.playCube);
    this.playCube.display();
    this.scene.popMatrix();

    // Undo Button
    this.scene.pushMatrix();
    var translateMatrix = mat4.create();
    mat4.translate(translateMatrix, translateMatrix, [12, 2, -9]);
    mat4.scale(translateMatrix, translateMatrix, [2, 2, 2])
    this.scene.multMatrix(translateMatrix);
    this.scene.registerForPick(10002, this.undoCube);
    this.undoCube.display();
    this.scene.popMatrix();

    // Movie Button
    this.scene.pushMatrix();
    var translateMatrix = mat4.create();
    mat4.translate(translateMatrix, translateMatrix, [-4, 2, -4]);
    mat4.scale(translateMatrix, translateMatrix, [2, 2, 2])
    this.scene.multMatrix(translateMatrix);
    this.scene.registerForPick(10003, this.movieCube);
    this.movieCube.display();
    this.scene.popMatrix();

    // Camera Button
    this.scene.pushMatrix();
    var translateMatrix = mat4.create();
    mat4.translate(translateMatrix, translateMatrix, [-4, 2, -9]);
    mat4.scale(translateMatrix, translateMatrix, [2, 2, 2])
    this.scene.multMatrix(translateMatrix);
    this.scene.registerForPick(10004, this.cameraChangeCube);
    this.cameraChangeCube.display();
    this.scene.popMatrix();

    // Reset  button avaiability
    this.playCube.available = false;
    this.undoCube.available = false;
    this.movieCube.available = false;
    this.cameraChangeCube.available = false;

  }

  // Game States:

  startGame(){
    this.gameStart = true;
    if(this.turnColor == "white"){
      this.scene.camera = this.scene.cameraArray[2];
      this.scene.selectedCamera = 1;
    }
    else{
      this.scene.camera = this.scene.cameraArray[1];
      this.scene.selectedCamera = 2;
    }

    // Save camera coordinates Z values
    this.cameraWhite = {"target": this.scene.cameraArray[2].target[2], "position" : this.scene.cameraArray[2].position[2]};
    this.cameraBlack = {"target" : this.scene.cameraArray[1].target[2], "position" : this.scene.cameraArray[1].position[2]};

    // this.scene.graph.reinit("outsideScene.xml");
  }

  // Menu -> show menu and handle settings.
  menu(){
    if(this.gameStart){
      this.state = "renderPossibleMoves";
      if(this.gameDuration != 0){
        this.gameDuration = 0;
        this.resetGame();

      }
    }

    this.scene.startTime = 0;
    

  }

  // Load scenario -> (keep game state), load file, render scene, board, pieces, etc.

  loadScenario(filename){

  }

    
  // Next turn
    // • Human 1? Wait for pick piece.
    // • Human 2? Wait for pick piece.

  nextTurn(){
    
  }

  // Render possible moves-> after previous state, render possible target tiles
    // • Human 1? render and move to next state.
    // • Human 2? render and move to next state.

  renderPossibleMoves(){

  }

  
  // Destination piece/tile selection -> after previous state,
    // • Human 1? Wait for pick destination tile/piece.
    // • Human 2? Wait for pick destination tile/piece.

  destinationSelection(){

  }

  // Movement animation -> after previous state, selection object is moved based on some
  //  defined animation f(t).

  verifyMove(){
        // Piece goes from start tile to end tile
    // Piece can "capture" another piece on this move (if the piece jumps over it)
    let turnColorBeforeChange = this.turnColor;
    let valResult = this.isMoveValid(this.pickedPiece, this.pickedTile);

    if(this.extraCapturePiece != null){
      if(valResult.capture == null){
        console.warn("Extra capture piece was not captured");
        this.pickedTile = null;
        this.state = "destinationSelection";
        return;
      }
      else{
        this.extraCapturePiece = null;
      }
    }

    if(valResult != null){

      // Move piece
      let previousTile = this.pickedPiece.tile;
      let captureTile = null;

      // Move piece with or without animation
      // this.gameboard.movePiece(this.pickedPiece.tile, this.pickedTile);


      if(valResult.capture != null){
        // Remove captured piece
        // Turn color stays the same...
        this.extraCapturePiece = null;
        let possibleCaptures = this.getPieceValidMoves(new MyPiece(this.scene, this.pickedPiece.type, this.pickedTile));

        for(let captures of possibleCaptures){
          if(captures.capture != null){
            this.extraCapturePiece = this.pickedPiece;
          }
        }

        if(this.extraCapturePiece == null)
          this.turnColor = this.turnColor == "white" ? "black" : "white";

        captureTile = valResult.capture.tile;
        this.removeCapturedPiece(valResult.capture);
      }
      else{
        // Verify if player can capture another piece

        // Turn color changes
        this.turnColor = this.turnColor == "white" ? "black" : "white";
      }


      if(this.turnColor == "white"){
        if(this.scene.camera != this.scene.cameraArray[2])
          this.nextCamera = this.scene.cameraArray[2];
      }
      else{
        if(this.scene.camera != this.scene.cameraArray[1])
          this.nextCamera = this.scene.cameraArray[1];      
      }

      // Set camera increments
      if(this.scene.camera.position[2] > 0)
        this.cameraPosZInc = -0.25; 
      else
        this.cameraPosZInc = 0.25;
      if(this.scene.camera.target[2] > 0)
        this.cameraTarZInc = -0.25;
      else
        this.cameraTarZInc = 0.25;



      let gameMove = new MyGameMove(this.pickedPiece, previousTile, this.pickedTile, valResult.capture, turnColorBeforeChange, this.time, captureTile);
      this.gameSequence.addGameMove(gameMove);

      
      let animInfo = new MyAnimationInfo(this.scene, this.pickedPiece, previousTile, this.pickedTile, this.time , "move");
      this.animator.addAnimation(new MyAnimation(this.scene, animInfo, this.time));
      
      this.pickedPiece.isMoving = true;
      this.state = "movementAnimation";
      

      return;
      
    }
    else{
      this.pickedTile = null;
      this.state = "destinationSelection";
    }
  }

  movementAnimation(){

    // IF animator has stoped, stop animation
    if(this.animator.animatingPiece.isMoving == false){
      if(this.pickedPiece != null)
        this.pickedPiece.isPicked = false;
      this.pickedPiece = null;
      this.pickedTile = null;
      
      // If it's mid turn, camera change animation...
      if(this.nextCamera != null && this.extraCapturePiece == null){
        this.state = "cameraChange";
        return;
      }
      this.state = "hasGameEnded";
    }
  }

  // Has game ended? -> after previous state, evaluate if End Game or Next turn.

  hasGameEnded(curTurnColor){
    // End game? -> display winner and go to menu
    let enemyColor = this.turnColor;
    let blackCount = 0;
    let whiteCount = 0;
    for(let tile of this.gameboard.tiles){
      // Count black and white pieces
      if(tile.piece != null){
        if(tile.piece.type == "black"){
          blackCount++;
          
        }
        else if(tile.piece.type == "white"){
          whiteCount++;
        }
     }
      if(tile.piece != null)
        if(tile.piece.type == enemyColor){
          // IF player has any possible moves, next turn
          if(this.getPieceValidMoves(tile.piece).length > 0){
            this.state = "renderPossibleMoves";
            return;
          }
        }

    }

    if(enemyColor == "black"){
      if(blackCount == 0){
        this.state = "endGame";
        return;
      }
      else{
        this.state = "renderPossibleMoves";
        return;
      }
    }
    else if(enemyColor == "white"){
      if(whiteCount == 0){
        this.state = "endGame";
        return;
      }
      else{
        this.state = "renderPossibleMoves";
        return;
      }
    }

    // Is end game, even thought player has pieces left there are no possble moves
    this.state = "endGame";
    return;
    
    // Next turn? -> go to next turn
  }

  // End game -> display winner and go to menu
  endGame(){
    this.gameDuration = this.time;
    console.log("Game duration was : " + this.gameDuration);
    this.state = "menu";
  }

  resetGame(){
    this.gameboard.resetBoard();
    this.auxboardLeft.resetBoard();
    this.auxboardRight.resetBoard();
    this.animator.fullReset();
    this.scene.startTime = 0;
    this.scene.camera = this.scene.cameraArray[0];
    this.scene.interface.setActiveCamera(this.scene.cameraArray[0]);
    // this.scene.camera.
    this.state = "menu";
    this.turnColor = "black";
    this.gameStart = false;
  }

// May interrupt other States :

  // Undo -> undo the last game move. Updates game sequence and turn

  undo(){
    var move = this.gameSequence.undo();
    if(move == undefined){
      console.warn("No moves to undo");
      return;
    }


    // Undo non captured piece move
    var animInfo = new MyAnimationInfo(this.scene, move.piece, move.endTile, move.startTile, this.time , "move");
    animInfo.undo = true;
    this.animator.addAnimation(new MyAnimation(this.scene, animInfo, this.time));
    move.piece.isMoving = true;
    


    // Find captured piece aux board tile
    if(move.capturedPiece != null){
      let capturedPieceAuxTile = null;
      if(move.turnColor == "white"){
        for(let i = this.auxboardLeft.tiles.length - 1; i >= 0; i--){
          if(this.auxboardLeft.tiles[i].piece != null){
            capturedPieceAuxTile = this.auxboardLeft.tiles[i];
            break;
          }
        }
      }
      else{
        for(let i = this.auxboardRight.tiles.length - 1; i >= 0; i--){
          if(this.auxboardRight.tiles[i].piece != null){
            capturedPieceAuxTile = this.auxboardRight.tiles[i];
            break;
          }
        }
      }


      // Undo captured piece
      move.capturedPiece.isDead = false;
      let animInfo = new MyAnimationInfo(this.scene, move.capturedPiece, capturedPieceAuxTile, move.capturedTile, this.time , "capture");
      animInfo.undo = true;
      this.animator.addAnimation(new MyAnimation(this.scene, animInfo, this.time));
      move.capturedPiece.isMoving = true;
      
    }

    this.turnColor = move.turnColor;

    // Set camera increments
    if(this.turnColor == "white"){
      this.scene.camera = this.scene.cameraArray[2];
      this.scene.selectedCamera = 1;
    }
    else{
      this.scene.camera = this.scene.cameraArray[1];
      this.scene.selectedCamera = 2;
    }

    // UnPick 
    if(this.pickedPiece != null)
      this.pickedPiece.isPicked = false;
    this.pickedPiece = null;
    this.pickedTile = null;

    this.state = "movementAnimation";

  }

  // Movie -> keep current game state. Renders all the game movements (should use the same
    // animation features used for movement animation). After, return to current game state.
    
  setMovie(){
    this.state = "movie";
    this.scene.startTime = 0;
    this.gameboard.resetBoard();
    this.auxboardLeft.resetBoard();
    this.auxboardRight.resetBoard();
    this.animator.reset();
    this.scene.camera = this.scene.cameraArray[3];
    this.scene.selectedCamera = 3;
  }

  movie(){

    if(this.animator.animations.length == 0){
      this.state = "renderPossibleMoves";
      if(this.turnColor == "white"){
        this.scene.camera = this.scene.cameraArray[2];
        this.scene.selectedCamera = 1;
      }
      else{
        this.scene.camera = this.scene.cameraArray[1];
        this.scene.selectedCamera = 2;
      }
      return;
    }
    // Movement animations all in a row...
  }

  // Load scennario -> keep game state. Load file render scene, board, pieces, etc. Return to
    // current game state.
  loadScenario(){

  }

  
  cameraChange(){
    // Gradually change camera
 
    if(this.cameraPosZInc > 0){
      if(this.scene.camera.position[2] <= this.nextCamera.position[2]){
        this.scene.camera.position[2] += this.cameraPosZInc;
      }
      else{
        this.cameraPosZInc = 0;
      }
    }
    else{
      if(this.scene.camera.position[2] >= this.nextCamera.position[2]){
        this.scene.camera.position[2] += this.cameraPosZInc;
      }
      else{
        this.cameraPosZInc = 0;
      }
    }

    if(this.cameraTarZInc > 0){
      if(this.scene.camera.target[2] <= this.nextCamera.target[2]){
        this.scene.camera.target[2] += this.cameraTarZInc;
      }
      else{
        this.cameraTarZInc = 0;
      }
    }
    else{
      if(this.scene.camera.target[2] >= this.nextCamera.target[2]){
        this.scene.camera.target[2] += this.cameraTarZInc;
      }
      else{
        this.cameraTarZInc = 0;
      }
    }

    if(this.cameraPosZInc == 0 && this.cameraTarZInc == 0){
      this.scene.camera = this.nextCamera;
      this.scene.selectedCamera = this.scene.cameraArray.findIndex(object => object === this.nextCamera);
      this.nextCamera = null;
      this.state = "hasGameEnded";

      // Reset values since they are changed in the animation
      this.scene.cameraArray[2].position[2] = this.cameraWhite.position;
      this.scene.cameraArray[2].target[2] = this.cameraWhite.target;
      this.scene.cameraArray[1].position[2] = this.cameraBlack.position;
      this.scene.cameraArray[1].target[2] = this.cameraBlack.target;
    }

  }
  

}
