import { CGFobject } from "../lib/CGF.js";
export class MyAnimation {


	constructor(scene, animationInfo, startTime){
        this.scene = scene;
        this.animationInfo = animationInfo;
        this.startTime = startTime;
        this.duration = animationInfo.duration;
        this.endTime = startTime + this.duration;

        this.initial_time = 0;
        this.matrix=mat4.create();
    };
    
    update(t){
        // Apply transformation to this.matrix
        if(this.isDone(t))
            return;
        
        // Update animation
        var delta=t-this.startTime;

        // Non capture animations
        if(this.animationInfo.type != "capture"){
            var tx=(this.animationInfo.endTile.getCords().x - this.animationInfo.startTile.getCords().x)*(delta)/(this.endTime-this.startTime);
            var ty=(this.animationInfo.endTile.getCords().y - this.animationInfo.startTile.getCords().y)*(delta)/(this.endTime-this.startTime);
            var tz=0;    
            this.scene.lights[2].position = [this.animationInfo.startTile.coords.x + 0.5 + tx, 5, -Math.abs(this.animationInfo.startTile.coords.y + ty) -3.5, 1];
        }
        else{
            // Capture animations

            // Z axis -> 3/4 of the animation upwards, 1/4 downwards
            if(t - this.startTime < this.animationInfo.duration*3/4){
                var tz=(3)*(delta)/((this.endTime - this.duration/4)-this.startTime);
            }
            else{
                let delta2 = t - (this.startTime + this.duration*3/4);
                var tz=(3)*(1-(delta2)/(this.endTime-(this.startTime+this.duration*3/4)));
            }

            // X and Y axis
            // Captures travel faster than non capture animations
            if(this.animationInfo.piece.type == "white"){
                if(!this.animationInfo.undo){
                    var tx=(this.animationInfo.endTile.getCords().x - this.animationInfo.startTile.getCords().x)*(delta)/(this.endTime-this.startTime);
                    var ty=((this.animationInfo.endTile.getCords().y-3) - (this.animationInfo.startTile.getCords().y))*(delta)/(this.endTime-this.startTime);
                }
                else{
                    var tx=(this.animationInfo.endTile.getCords().x - this.animationInfo.startTile.getCords().x)*(delta)/(this.endTime-this.startTime);
                    var ty=((this.animationInfo.endTile.getCords().y) - (this.animationInfo.startTile.getCords().y-5))*(delta)/(this.endTime-this.startTime);
                    ty = ty - 5;
                }
        }
            else{
                if(!this.animationInfo.undo){
                    var tx=(this.animationInfo.endTile.getCords().x - this.animationInfo.startTile.getCords().x)*(delta)/(this.endTime-this.startTime);
                    var ty=((this.animationInfo.endTile.getCords().y-3) - (this.animationInfo.startTile.getCords().y))*(delta)/(this.endTime-this.startTime);
               }
                else{
                    var tx=(this.animationInfo.endTile.getCords().x - this.animationInfo.startTile.getCords().x)*(delta)/(this.endTime-this.startTime);
                    var ty=((this.animationInfo.endTile.getCords().y) - (this.animationInfo.startTile.getCords().y-1))*(delta)/(this.endTime-this.startTime);
                }
                 }
            

        }

        
        this.matrix=mat4.create();
        mat4.translate(this.matrix, this.matrix, [tx, tz, -ty]);
        this.previous_t=t;

        return (delta)/(this.endTime-this.startTime);
    };

    isDone(t){
        // Check if animation is done

        if(t - this.startTime > this.duration){
            return true;
            
        }

        return false;

    }

    // apply(){};
}