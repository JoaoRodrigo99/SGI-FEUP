import {CGFobject} from '../lib/CGF.js';

export class MyAnimator {
    
    orchestrator = null;
    gameSequence = null;


    constructor(scene, orchestrator, gameSequence)
	{
        this.orchestrator = orchestrator;
        this.gameSequence = gameSequence;
        this.currentAnimation = null;
        this.animations = [];
        this.finishedAnimations = [];
        this.scene = scene;
        this.animatingPiece = null;
        // this.currentGameMove = null;
	};

    fullReset(){
        this.currentAnimation = null;
        this.animations = [];
        this.finishedAnimations = [];
        this.animatingPiece = null;
    }

    addAnimation(animation){
        if(this.currentAnimation == null){
            this.currentAnimation = 0;
            this.animations.push(animation);
        }
        else{
            this.animations.push(animation);
        }

    
    }

    reset(){
        // Plays the game from the beggining
        let resetAnims = [];
        // Reset animations and clear finished animations
        for(let anim of this.finishedAnimations)
            resetAnims.push(anim);
        for(let anim of this.animations)
            resetAnims.push(anim);
        this.finishedAnimations = [];
        this.animations = resetAnims;
    }

    start(){
        // Plays the game from the current state
    }

    update(t){
        // console.log(this.currentAnimation);
        this.time = t;
        if(this.currentAnimation == null)
            return;

        

        for(let i = 0; i < this.animations.length; i++){

            if(this.animations[i].animationInfo.startTime > t)
                continue;
            else{
                if(this.orchestrator.state == "movie"){
                    this.animations[i].animationInfo.piece.isMoving = true;
                }
            }

            // Update animations that are not done
            if(this.animations[i].animationInfo.piece.isMoving){
                if(!this.animations[i].isDone(t)){
                    this.animations[i].update(t);
                    this.animatingPiece = this.animations[i].animationInfo.piece;
                }
                else{
                    this.animations[i].animationInfo.piece.isMoving = false;
                    if(this.animations[i].animationInfo.endTile.piece == null){
                        // Animation is done, move piece to end tile
                        this.orchestrator.gameboard.movePiece(this.animations[i].animationInfo.startTile, this.animations[i].animationInfo.endTile);
                        
                    }
                    
                    // Check if piece becomes a king
                    this.orchestrator.makePieceKing(this.animations[i].animationInfo.piece);

                    // If move is undo, remove corresponding animation from finished animations
                    if(!this.animations[i].animationInfo.undo){
                        this.finishedAnimations.push(this.animations[i]);
                    }
                    else{
                        this.finishedAnimations.splice(this.finishedAnimations.length-1,1);
                    }
                    this.animations.splice(i, 1);
                }
            }

        }
        
    }

    display(){
        if(this.currentAnimation == null)
        return;

        for(let i = this.currentAnimation ; i < this.animations.length; i++){
            if(this.animations[i].animationInfo.piece.isMoving){
                if(!this.animations[i].isDone(this.time)){

                    this.scene.pushMatrix();
                    // Apply transf matrix
                    this.scene.multMatrix(this.animations[i].matrix);

                    // All translations piece normally has....
                    var rotationMatrix = mat4.create();
                    mat4.rotateX(rotationMatrix, rotationMatrix, -Math.PI/2);
                    this.scene.multMatrix(rotationMatrix);

                    var rotationMatrix = mat4.create();
                    mat4.translate(rotationMatrix, rotationMatrix, [0, 3, 0]);
                    this.scene.multMatrix(rotationMatrix);

                    this.animations[i].animationInfo.piece.display();
                    this.scene.popMatrix();
                }
            }
    }

        
    }


}