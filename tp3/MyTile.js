import {CGFobject, CGFappearance} from '../lib/CGF.js';
import { MyRectangle } from "./MyRectangle.js";

export class MyTile {
    
    gameboard = null;
    piece = null;
    coords = {"x" : null, "y" : null}; // 0..7 or not..
    
    constructor(scene, coords, gameboard)
	{
        // super(scene);
        this.scene = scene;
        // this.gameboard = gameboard;
        // this.gameboard = gameboard;
        this.coords = coords;

        this.geometry = new MyRectangle(this.scene, 0, this.coords.x, this.coords.x+1, this.coords.y, this.coords.y+1);
        this.geometry2 = new MyRectangle(this.scene, 0, this.coords.x, this.coords.x+1, this.coords.y, this.coords.y+1);

        if((this.coords.x % 2) !=  Math.abs(this.coords.y % 2))
            this.color = "white";
        else
            this.color = "black";

        // White and black materials
        this.material = new CGFappearance(this.scene);
        // material.setTextureWrap("REPEAT", "REPEAT");
        this.material.setShininess(1);
        this.material.setEmission(0,0,0, 1);
        this.material.setAmbient(0,0,0, 1);
        this.material.setDiffuse(0,0,0, 1);
        this.material.setSpecular(0,0,0, 1);
        this.material.setTexture(null)

        this.materialWhite = new CGFappearance(this.scene);
        // material.setTextureWrap("REPEAT", "REPEAT");
        this.materialWhite.setShininess(1);
        this.materialWhite.setEmission(0,0,0, 1);
        this.materialWhite.setAmbient(0,0,0, 1);
        this.materialWhite.setDiffuse(0.5,0.5,0.5, 1);
        this.materialWhite.setSpecular(0,0,0, 1);
        this.materialWhite.setTexture(null)

        this.materialGreen = new CGFappearance(this.scene);
        // material.setTextureWrap("REPEAT", "REPEAT");
        this.materialGreen.setShininess(1);
        this.materialGreen.setEmission(0,0,0, 1);
        this.materialGreen.setAmbient(0,0,0, 1);
        this.materialGreen.setDiffuse(0.5,0.5,0.5, 1);
        this.materialGreen.setSpecular(0,0,0, 1);
        this.materialGreen.setTexture(null)

	};

    //TYPE
    setPiece(piece){ 
        this.piece = piece;
        piece.tile = this;
    }

    unsetPiece(){
        if(this.piece == null)
            return null;
        let returnP = this.piece;
        this.piece = null;
        return returnP;
    }

    getPiece(){
        return this.piece;
    }

    setBoard(board){
        this.gameboard = board;
    }

    getBoard(){
        return this.gameboard;
    }

    getCords(){
        // GameBoard translantions... and sclae...
        return {x : this.coords.x , y : this.coords.y + 3}
    }

    display(){

        // Pick material
        if((this.coords.x % 2) !=  Math.abs(this.coords.y % 2))
            this.materialWhite.apply();
        else
            this.material.apply();

        // Register for pick if main board
        if(this.gameboard.type == "main"){
            this.scene.registerForPick(this.coords.x * 8 + this.coords.y, this.geometry);
            this.scene.registerForPick(this.coords.x * 8 + this.coords.y, this);
        }
        else{
            this.scene.registerForPick((this.coords.x * 8 + this.coords.y) + 1000, this.geometry);
            this.scene.registerForPick((this.coords.x * 8 + this.coords.y) + 1000, this);
        }

        // DIsplay rectangle
        this.geometry.display();

        // Apply transformations
        this.scene.pushMatrix();
        var translateMatrix = mat4.create();
        mat4.translate(translateMatrix, translateMatrix, [8, 0, -0.01]);
        mat4.rotate(translateMatrix, translateMatrix, Math.PI, [0, 1, 0])
        this.scene.multMatrix(translateMatrix);
        this.geometry2.display();
        this.scene.popMatrix();

        // Display Piece

        if(this.piece != null && this.piece.isMoving == false){
            this.piece.display();
        }


    }


}