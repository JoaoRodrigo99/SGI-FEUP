import { MyAnimation } from "./MyAnimation.js";
import { CGFobject } from "../lib/CGF.js";
import { MyKeyframe } from "./MyKeyframe.js";
export class MyKeyframeAnimation extends CGFobject {
	constructor(scene, id, keyframes){
        super(scene);
        this.id=id;
        this.keyframes=keyframes;
        this.keyframes.sort((a, b) => (a.instant > b.instant) ? 1 : -1);
        if(this.keyframes[0].instant != 0)
        {
           this.keyframes.push(new MyKeyframe(scene, 0, 0,0,0,0,0,0,1,1,1)); 
           this.keyframes.sort((a, b) => (a.instant > b.instant) ? 1 : -1);
        } 
    
        this.initial_time=0;
        this.previous_t=0;
        this.matrix=mat4.create();
        this.lastKeyframe = 0;
        this.lastty = 0;
        this.lasttx = 0;
        this.lasttz = 0;
        this.lastrx = 0;
        this.lastry = 0;
        this.lastrz = 0;
    }
    
    update(t){
        if (this.initial_time==0){
            this.initial_time=t;
            this.previous_t=t;
        }

        //delta is the time since t0
        var delta=t-this.initial_time;
        var f=-1;
        for (var i=1; i<this.keyframes.length; i++){
            if (this.keyframes[i].instant > delta){
                f=i;
                break;
            }
        }

        if (f==-1)
            return;

        // if(this.lastKeyframe == f)
        //     return;

        var keyframe1 = this.keyframes[f-1];
        var keyframe2 = this.keyframes[f];

        //delta_t represents the time since this function was lastly called
        var delta_t = t - this.previous_t;
        //n is the number of times the function is called betwen keyframe1.instant and keyframe2.instant
        var n = (keyframe2.instant-keyframe1.instant)/(delta_t);
        //current n represents how many times the function has been called since keyframe1.instant
        var current_n = (delta-keyframe1.instant)/delta_t;

        var rx= this.lastrx*Math.PI/180 + (keyframe2.rx)*Math.PI/180*(delta-keyframe1.instant)/(keyframe2.instant-keyframe1.instant);
        var ry=this.lastry*Math.PI/180 + (keyframe2.ry )*Math.PI/180*(delta-keyframe1.instant)/(keyframe2.instant-keyframe1.instant);
        var rz= this.lastrz*Math.PI/180 + (keyframe2.rz )*Math.PI/180*(delta-keyframe1.instant)/(keyframe2.instant-keyframe1.instant);
        var tx= this.lasttx + (keyframe2.tx )*(delta-keyframe1.instant)/(keyframe2.instant-keyframe1.instant);

        var ty= this.lastty + keyframe2.ty *(delta-keyframe1.instant)/(keyframe2.instant-keyframe1.instant);
        var tz= this.lasttz + (keyframe2.tz )*(delta-keyframe1.instant)/(keyframe2.instant-keyframe1.instant);
        
        var sx, sy, sz;

        //scale sx
        if ((keyframe2.sx*keyframe1.sx) <= 0)
        {
            var d = 1 - Math.min(keyframe2.sx, keyframe1.sx);
            var sx1 = keyframe1.sx + d;
            var sx2 = keyframe2.sx + d;
            sx = sx1 * Math.pow(Math.pow(sx2/sx1, 1/n), current_n) - d;
        }
        else
            sx=keyframe1.sx*Math.pow(Math.pow(keyframe2.sx/keyframe1.sx, 1/n), current_n);

        //scale sy
        if ((keyframe2.sy*keyframe1.sy) <= 0)
        {
            var d = 1 - Math.min(keyframe2.sy, keyframe1.sy);
            var sy1 = keyframe1.sy + d;
            var sy2 = keyframe2.sy + d;
            sy = sy1 * Math.pow(Math.pow(sy2/sy1, 1/n), current_n) - d;
        }
        else
            sy=keyframe1.sy*Math.pow(Math.pow(keyframe2.sy/keyframe1.sy, 1/n), current_n);

        //scale sz
        if ((keyframe2.sz*keyframe1.sz) <= 0)
        {
            var d = 1 - Math.min(keyframe2.sz, keyframe1.sz);
            var sx1 = keyframe1.sz + d;
            var sx2 = keyframe2.sz + d;
            sx = sz1 * Math.pow(Math.pow(sz2/sz1, 1/n), current_n) - d;
        }
        else
            sz=keyframe1.sz*Math.pow(Math.pow(keyframe2.sz/keyframe1.sz, 1/n), current_n);

        this.matrix=mat4.create();
        mat4.translate(this.matrix, this.matrix, [tx, ty, tz]);
        mat4.scale(this.matrix, this.matrix, [sx, sy, sz]);   
        mat4.rotateX( this.matrix, this.matrix, rx);
        mat4.rotateY( this.matrix, this.matrix, ry);
        mat4.rotateZ( this.matrix, this.matrix, rz);
        this.previous_t=t;
        this.previoustx=tx;
        // this.previousty=ty;
        this.previoustz=tz;
        this.preivousrx=rx;
        this.previousry=ry;
        this.previousrz=rz;

        // Last keyframe reached

        for (var i=0; i<this.keyframes.length; i++){
            if (this.keyframes[i].instant < delta){
                if(this.lastKeyframe < i){
                    this.lastKeyframe = i;
                    // Change keygframe add values to the animation
                    this.lastty += this.keyframes[i].ty;
                    this.lasttx += this.keyframes[i].tx;
                    this.lasttz += this.keyframes[i].tz;
                    this.lastrx += this.keyframes[i].rx;
                    this.lastry += this.keyframes[i].ry;
                    this.lastrz += this.keyframes[i].rz;
                    return;
                }
            }
        }

        
        
    };


    apply(){
        this.scene.multMatrix(this.matrix);
    };
}