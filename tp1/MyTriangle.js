import {CGFobject} from '../lib/CGF.js';

export class MyTriangle extends CGFobject {
	constructor(scene, id, x1, y1, z1, x2, y2, z2, x3, y3, z3) {
		super(scene);
		this.x1 = x1;
		this.y1 = y1;
		this.z1 = z1;
		this.x2 = x2;
		this.y2 = y2;
		this.z2 = z2;
		this.x3 = x3;
		this.y3 = y3;
		this.z3 = z3;
		this.id = id;
		this.initBuffers();
	}
	
	initBuffers() {
		this.vertices = [

			this.x1, this.y1, this.z1,
			this.x2, this.y2, this.z2,
			this.x3, this.y3, this.z3,
			this.x1, this.y1, this.z1,
			this.x2, this.y2, this.z2,
			this.x3, this.y3, this.z3,
		];

		//Counter-clockwise reference of vertices
		this.indices = [
			0, 1, 2,
			5, 4, 3
			
		];

		this.normals = [
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			0, 0, -1,
			0, 0, -1,
			0, 0, -1
		];

		// V1(x1,y1,z1) , V2(x2,y2,z2) , V3(x3,y3,z3) 

		// Distance V1V2
		// a = sqrt((x2-x1)2 + (y2-y1)2 + (z2-z1)2)
		this.a = Math.sqrt(Math.pow(this.x2-this.x1,2) + Math.pow(this.y2-this.y1,2) + Math.pow(this.z2-this.z1,2));

		// Distance V2V3
		// b = sqrt((x3-x2)2 + (y3-y2)2 + (z3-z2)2)
		this.c = Math.sqrt(Math.pow(this.x3-this.x2,2) + Math.pow(this.y3-this.y2,2) + Math.pow(this.z3-this.z2,2));

		// Distance V3V1
		// c = sqrt((x1-x3)2 + (y1-y3)2 + (z1-z3)2)
		this.b = Math.sqrt(Math.pow(this.x1-this.x3,2) + Math.pow(this.y1-this.y3,2) + Math.pow(this.z1-this.z3,2));

		// cos(α) = (𝑎~2 − 𝑏~2 + 𝑐~2) / 2𝑎𝑐
		this.cos = (Math.pow(this.a, 2) - Math.pow(this.b, 2) + Math.pow(this.c, 2)) / (2 * this.a * this.c);

		// sin(α) = sqrt(1 − 𝑐𝑜𝑠^2(∝))
		this.sin = Math.sqrt(1 - Math.pow(this.cos, 2));

		this.T1x = 0;
		this.T1y= 0;
		this.T2x = this.a;
		this.T2y= 0;
		this.T3x = this.c * this.cos;
		this.T3y= this.c * this.sin;


		this.texCoords = [
			this.T1x, this.T1y, //1
			this.T2x, this.T2y, // 2
			this.T3x, this.T3y, // 3
			this.T1x, this.T1y, //1
			this.T2x, this.T2y, // 2
			this.T3x, this.T3y, // 3
			this.T3x, this.T3y, //1
		];

		//The defined indices (and corresponding vertices)
		//will be read in groups of three to draw triangles
		this.primitiveType = this.scene.gl.TRIANGLES;

		this.initGLBuffers();
	}

	updateTexCoords(s, t) {
		this.texCoords = [
			0, 1,
			this.a / s, 0,
			this.c * this.cos / s, this.c * this.sin / t,
			0, 1,
			this.a / s, 0,
			this.c * this.cos / s, this.c * this.sin / t,
		];

		this.updateTexCoordsGLBuffers();
	}
}