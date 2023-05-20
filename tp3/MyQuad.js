import {CGFobject} from '../lib/CGF.js';
/**
 * MyQuad
 * @constructor
 * @param {MyScene} scene - Reference to MyScene object
 * @param {Array} coords - Array of texture coordinates (optional)
 */
export class MyQuad extends CGFobject {
	constructor(scene) {
		super(scene);
		this.initBuffers();
		// if (coords != undefined)
		// 	this.updateTexCoords(coords);
	}
	
	initBuffers() {
		this.vertices = [
			-0.5, -0.5, 0,	//0 esquerda baixo
			0.5, -0.5, 0,	//1 direita baixo
			-0.5, 0.5, 0,	//2 esquerda cima
			0.5, 0.5, 0		//3 direita baixo
		];

		//Counter-clockwise reference of vertices
		this.indices = [
			0, 1, 2,
			1, 3, 2
		];

		//Facing Z positive
		this.normals = [
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			0, 0, 1
		];
		
		/*
		Texture coords (s,t)
		+----------> s
        |
        |
		|
		v
        t
        */

		this.texCoords = [
			0, 1,
            1, 1,
            0, 0,
            1, 0
			// 0, 2, // esq baixo
			// 3, 2, // dir baixo
			// 0, 0, // esq cima
			// 3, 0 // dir cima
			// 0, 0, //  inverter a figura na vertical
			// 3, 0, // 
			// 0, 2, // 
			// 3, 2, // 
		];
		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}

	/**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the quad
	 * @param {Array} coords - Array of texture coordinates
	 */
	updateTexCoords(coords) {
		this.texCoords = [...coords];
		this.updateTexCoordsGLBuffers();
	}
}
