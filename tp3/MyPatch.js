import { CGFobject } from "../lib/CGF.js";
import { CGFscene } from '../lib/CGF.js';
import { CGFaxis, CGFcamera, CGFappearance, CGFtexture, CGFnurbsSurface, CGFnurbsObject  } from '../lib/CGF.js';
import { MyTriangle } from "./MyTriangle.js";
/**
 * MyComponent
 * @constructor
 * @param scene 
 * @param id 
 * @param degree_u
 * @param parts_u
 * @param degree_v 
 * @param parts_v 
 * @param control_vertexes

 */
export class MyPatch extends CGFobject {
	constructor(scene, id, degree_u, parts_u, degree_v, parts_v, control_vertexes) {
		super(scene);
		this.scene = scene;
		this.id = id;
        this.degree_u = degree_u;
        this.parts_u = parts_u;
        this.degree_v = degree_v;
        this.parts_v =  parts_v;
        this.control_vertexes = control_vertexes;
        this.initBuffers();

        // <patch degree_u=”ii” parts_u=”ii” degree_v=”ii” parts_v=”ii” ></patch>
        // <controlpoint x=”ff” y=”ff” z=”ff” />
	}

    initBuffers() {
		this.nurbsSurface = new CGFnurbsSurface(this.degree_u, this.degree_v, this.control_vertexes);
		this.surfaceObject = new CGFnurbsObject(this.scene, this.parts_u, this.parts_v, this.nurbsSurface ); // must provide an object with the function getPoint(u, v) (CGFnurbsSurface has it)
    }

  
    display(){
      this.surfaceObject.display();
    }

    updateTexCoords(s, t) { }
}