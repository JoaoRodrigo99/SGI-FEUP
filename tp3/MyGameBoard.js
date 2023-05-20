import {CGFobject, CGFappearance} from '../lib/CGF.js';
import {MyTile} from './MyTile.js';
import { MyPiece } from './MyPiece.js';

export class MyGameBoard {
    
    tiles = []
    type = null; //aux or main


    constructor(scene, tiles, type)
	{
        // super(scene);
        this.scene = scene;
        this.type = type;
        
        this.tiles = tiles;

        for (let tile of this.tiles)
            tile.setBoard(this);

	};


    getNumberPieces(){
        let count = 0;
        for(let tile of this.tiles){
            if(tile.piece != null)
                count++;
        }
        return count;
    }

    getWhitePieces(){
        let pieces = [];
        for(let tile of this.tiles){
            if(tile.piece != null && tile.piece.type == "white")
                pieces.push(tile.piece);
        }
        return pieces;
    }

    getBlackPieces(){
        let pieces = [];
        for(let tile of this.tiles){
            if(tile.piece != null && tile.piece.type == "black")
                pieces.push(tile.piece);
        }
        return pieces;
    }


    addPieceTile(tile, piece){
        tile.setPiece(piece);
    }

    removePieceTile(tile,piece){
        if(tile.piece == piece){
            tile.unsetPiece();
        }
    }

    getPieceTile(tile){
        return tile.piece;
    }

    getTilePiece(piece){
        for(let tile in this.tiles){
            if(tile.piece == piece)
                return tile
        }
    }

    getTile(x, y){ 
        // +----------> x
        // |
        // |
		// |
		// y

        if( x < 0 || x > 7 || y < 0 || y > 7)
            return null;

        return this.tiles[x + 8*y]
    }

    movePiece(startTile, endTile){
        let piece = startTile.unsetPiece();
        endTile.setPiece(piece);
    }

    // Reset Board
    resetBoard(){
        // Unset all pieces 
        let pieces = [];
        for(let tile of this.tiles){
            if(tile.piece != null)
                pieces.push(tile.unsetPiece());
            
        }


        // whites y 0-2 ; blacks y 5-7
        for (let i = 0; i < 8; i++){
            if(pieces.length == 0 && this.type == "main"){
                if(this.getTile(i,0).color == "black")
                    this.addPieceTile(this.getTile(i,0), new MyPiece(this.scene,"white", this.getTile(i,0)));
                if(this.getTile(i,1).color == "black")
                    this.addPieceTile(this.getTile(i,1), new MyPiece(this.scene,"white", this.getTile(i,1)));
                if(this.getTile(i,2).color == "black")
                    this.addPieceTile(this.getTile(i,2), new MyPiece(this.scene,"white", this.getTile(i,2)));
                if(this.getTile(i,5).color == "black")
                    this.addPieceTile(this.getTile(i,5), new MyPiece(this.scene,"black", this.getTile(i,5)));
                if(this.getTile(i,6).color == "black")
                    this.addPieceTile(this.getTile(i,6), new MyPiece(this.scene,"black", this.getTile(i,6)));
                if(this.getTile(i,7).color == "black")
                    this.addPieceTile(this.getTile(i,7), new MyPiece(this.scene,"black", this.getTile(i,7)));
            }
            else{
                // Reset piece to original tiles
                for(let piece of pieces){
                    piece.originTile.setPiece(piece);
                }
            }
        }
    }

    display(){



        this.scene.pushMatrix();

        var rotationMatrix = mat4.create();

        mat4.rotateX(rotationMatrix, rotationMatrix, -Math.PI/2);

        this.scene.multMatrix(rotationMatrix);
        // Display Board border

        // Display Tiles
        if(this.type == "main"){
            var rotationMatrix = mat4.create();

            mat4.translate(rotationMatrix, rotationMatrix, [0, 3, 0]);
    
            this.scene.multMatrix(rotationMatrix);
        }
        for(let tile of this.tiles){
            tile.display();
        }

        this.scene.popMatrix();
    }

}