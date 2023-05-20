import { CGFobject } from "../../lib/CGF.js";

export class MyCylinder extends CGFobject {
  constructor(scene, id, height, top = 1, base = 1, slices, stacks) {
    super(scene);
    this.slices = slices;
    this.stacks = stacks;
    this.height = height;
    this.base = base;
    this.top = top;
    this.id = id;

    this.initBuffers();
  }

  initBuffers() {
    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.texCoords = [];
  
   var ang = 2*Math.PI/this.slices;
   
   for(var j = 0; j < this.stacks+1; j++){
     
     var z = (j/this.stacks);
  
     for(var i = 0; i < this.slices; i++)
     {
       this.vertices.push(Math.cos(i * ang),Math.sin(i * ang), z);
       this.normals.push(Math.cos(i * ang),Math.sin(i * ang), 0);
       this.texCoords.push(i/this.slices,j/this.stacks);
     }
  
   }
  
  
   for(var j = 0; j < this.stacks; j++){
     for(var i = 0; i < this.slices; i++)
     {
       this.indices.push(this.slices*j+i,this.slices*j+i+1,this.slices*(j+1)+i);
       if (i != (this.slices - 1)) {
         this.indices.push(this.slices*(j+1)+i+1,this.slices*(j+1)+i,this.slices*j+i+1);
       }
       else {
         this.indices.push(this.slices*j,this.slices*j+i+1,this.slices*j+i);
       }
       
     }
  
   }
  
  
    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
  }

  updateTexCoords(s, t) { }
}
