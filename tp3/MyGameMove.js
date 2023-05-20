import {CGFobject} from '../lib/CGF.js';

export class MyGameMove{
    

    piece = null;
    startTile = null;
    endTile = null;
    gameBoardState = null;
    startTime = null;
    capturedPiece = null;
    // endTime = null;


    constructor(piece, startTile, endTile, capturedPiece, turnColor, startTime, capturedTile)
	{
        this.piece = piece;
        this.startTile = startTile;
        this.endTile = endTile;
        this.capturedPiece = capturedPiece;
        this.turnColor = turnColor;
        // this.gameBoardState = gameBoardState; 
        this.startTime = startTime;
        this.capturedTile = capturedTile;
	};

    //TYPE
    animate(t){ 
        if (this.initial_time==0){
            this.initial_time=t;
            this.previous_t=t;
        }
        //delta is the time since t0
        var delta=t-this.initial_time;

        // Update coords on the piece

        // Start Piece coords
        var startX = this.startPiece.coords.x;
        var startY = this.startPiece.coords.y;        

        // End Piece coords
        var endX = this.endPiece.coords.x;
        var endY = this.endPiece.coords.y;

        var tx= startX + (endX - startX) * (delta/1000);
        var ty= startY + (endY - startY) * (delta/1000);

        this.matrix=mat4.create();
        mat4.translate(this.matrix, this.matrix, [tx, ty, 0]);

        // Time for animation to finish
        if(delta>1000)
            return true;

        return false;

        // var tz= this.lasttz + (keyframe2.tz )*(delta-keyframe1.instant)/(keyframe2.instant-keyframe1.instant);
    }


}