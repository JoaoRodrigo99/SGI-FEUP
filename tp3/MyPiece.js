import {CGFobject, CGFappearance} from '../lib/CGF.js';
import {MyCylinder}from './MyCylinder.js';
import { MyCircle } from './MyCircle.js';

export class MyPiece {
    
    type = null; //white black
    geometry = null; // ?
    tile = null;
    isMoving = false;
    isDead = false;
    isKing = false;

    // coords
    // Apply transformation based on coords
    // Update coords after GameMove of the piece is finished


    constructor(scene,type, tile)
	{
        this.scene = scene;
        this.isMoving = false;
        this.isKing = false;
        this.isPicked = false;
        this.type = type;
        this.tile = tile;
        this.originTile = tile;
        this.geometry = new MyCylinder(this.scene, 1, 1, 1, 1, 30, 10);
        this.cylinderTop = new MyCircle(this.scene, 20);
        this.cylinderBot = new MyCircle(this.scene, 20);
        // Bouding box of the piece (Cube surrounding the piece)


        this.materialGreen = new CGFappearance(this.scene);
        // material.setTextureWrap("REPEAT", "REPEAT");
        this.materialGreen.setShininess(1);
        this.materialGreen.setEmission(0,0,0, 1);
        this.materialGreen.setAmbient(0.0,0.0,0.0, 1);
        this.materialGreen.setDiffuse(0.2,0.35,0.2, 1);
        this.materialGreen.setSpecular(0,0,0, 1);
        this.materialGreen.setTexture(null)

        this.materialDarkGray = new CGFappearance(this.scene);
        // material.setTextureWrap("REPEAT", "REPEAT");
        this.materialDarkGray.setShininess(1);
        this.materialDarkGray.setEmission(0,0,0, 1);
        this.materialDarkGray.setAmbient(0,0,0, 1);
        this.materialDarkGray.setDiffuse(0.2,0.2,0.2, 1);
        this.materialDarkGray.setSpecular(0,0,0, 1);
        this.materialDarkGray.setTexture(null)

        this.materialLighGray = new CGFappearance(this.scene);
        // material.setTextureWrap("REPEAT", "REPEAT");
        this.materialLighGray.setShininess(1);
        this.materialLighGray.setEmission(0,0,0, 1);
        this.materialLighGray.setAmbient(0,0,0, 1);
        this.materialLighGray.setDiffuse(0.8,0.8,0.8, 1);
        this.materialLighGray.setSpecular(0,0,0, 1);
        this.materialLighGray.setTexture(null)
	};

    //TYPE
    get(){ 
        return this;
    }

    set(type){
        this.type = type;
    }

    display(){
        // Display piece
        this.scene.pushMatrix();

        // Pick material
        if(this.type == "black")
            this.materialDarkGray.apply();
        else
            this.materialLighGray.apply();

        if(this.isPicked)
            this.materialGreen.apply();

        // Translate to tile position
        var translateMatrix = mat4.create();
        mat4.translate(translateMatrix, translateMatrix, [this.tile.coords.x + 0.5, this.tile.coords.y + 0.5, 0]);

        // Make piece bigger if it's a king
        if(this.isKing)
            mat4.scale(translateMatrix, translateMatrix, [0.4, 0.4, 0.6]);
        else
            mat4.scale(translateMatrix, translateMatrix, [0.4, 0.4, 0.3]);

        this.scene.multMatrix(translateMatrix);

        // Register for picking
        if(!this.isDead)
            this.scene.registerForPick((this.tile.coords.x * 8 + this.tile.coords.y)+100, this.geometry);
        this.geometry.display();

        if(!this.isDead)
            this.scene.registerForPick((this.tile.coords.x * 8 + this.tile.coords.y)+100, this.cylinderTop);
        this.cylinderTop.display();

        this.scene.pushMatrix();

        // Go up 1 unit
        var translateMatrix = mat4.create();
        mat4.translate(translateMatrix, translateMatrix, [0, 0, 0.95]);
        mat4.rotate(translateMatrix, translateMatrix, Math.PI, [1, 0, 0])
        this.scene.multMatrix(translateMatrix);

        // Display and register pick
        if(!this.isDead)
            this.scene.registerForPick((this.tile.coords.x * 8 + this.tile.coords.y)+100, this.cylinderTop);

        this.cylinderBot.display();

        if(!this.isDead)
            this.scene.registerForPick((this.tile.coords.x * 8 + this.tile.coords.y)+100, this);

        this.scene.popMatrix();

        this.scene.popMatrix();

        


    }


}