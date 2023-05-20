import { CGFobject } from "../lib/CGF.js";
export class MyAnimationInfo {


	constructor(scene, piece, startTile, endTile, startTime, type){
        this.scene = scene;
        this.piece = piece;
        this.startTile = startTile;
        this.endTile = endTile;
        this.duration = this.getDuration();
        this.startTime = startTime
        this.endTime = startTime + this.duration;
        this.type = type;
        this.undo = false;

        // this.initial_time = 0;
        // this.matrix=mat4.create();
    };

    getDuration(){
        // 300 ms per tile, if duration > 4000 ms, then 0.4 * duration (second applies more to captures)
        let duration =( Math.abs(this.endTile.getCords().x - this.startTile.getCords().x) + Math.abs(this.endTile.getCords().y - this.startTile.getCords().y)) * 300;
        if(duration > 4000)
            return duration * 0.4;
        return duration;
    }
    
}