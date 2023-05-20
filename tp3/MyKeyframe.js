import { CGFobject } from "../lib/CGF.js";

export class MyKeyframe extends CGFobject {
	constructor(scene, instant, tx, ty, tz, rx, ry, rz, sx, sy, sz){
        super(scene);
        this.instant=instant * 1000;
        this.tx=tx;
        this.ty=ty;
        this.tz=tz;
        this.rx=rx;
        this.ry=ry;
        this.rz=rz;
        this.sx=sx;
        this.sy=sy;
        this.sz=sz;
    };
}