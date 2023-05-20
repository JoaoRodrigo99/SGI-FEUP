import { CGFobject } from "../lib/CGF.js";

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
    this.texCoords = [];

    var radiusDif = this.base - this.top;
    let ang = 0;
    var alphaAng = (2 * Math.PI) / this.slices;
    this.stackHeight = this.height / this.stacks;
    let radius = this.base;
    this.pointsPerStack = this.slices + 1;

    for (let x = 0; x <= this.stacks; x++) {
      ang = 0;
      for (let i = 0; i < this.pointsPerStack; i++) {
        this.vertices.push(
          radius * Math.cos(ang),
          -Math.sin(ang) * radius,
          this.stackHeight * x
        );
        if (x > 0 && i > 0) {
          this.indices.push(
            (x - 1) * this.pointsPerStack + i - 1,
            x * this.pointsPerStack + i - 1,
            x * this.pointsPerStack + i
          );
          this.indices.push(
            (x - 1) * this.pointsPerStack + i - 1,
            x * this.pointsPerStack + i,
            (x - 1) * this.pointsPerStack + i
          );
        }

        this.texCoords.push(-(i / this.slices), -(x * this.stacks));
        ang += alphaAng;
      }
      radius -= radiusDif / this.stacks;
    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
  }

  updateTexCoords(s, t) { }
}
