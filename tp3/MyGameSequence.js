import {CGFobject} from '../lib/CGF.js';

export class MyGameSequence {
    
    gameMoves = []
    // executedGameMoves = []

    constructor() {
        this.gameMoves = []
        // this.executedGameMoves = []
    }

    addGameMove(move){
        this.gameMoves.push(move);
    }

    undo(){
        // execute last GameMove in reverse
        return this.gameMoves.pop();
    }

    replay(){
        // Replays last executed GameMove
    }

    // endGameMove(){
    //     move = this.gameMoves.pop();
    //     this.executedGameMoves.push(move);
    // }
}