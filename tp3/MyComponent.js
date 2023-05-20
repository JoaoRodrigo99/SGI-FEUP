import { CGFobject } from "../lib/CGF.js";
/**
 * MyComponent
 * @constructor
 * @param scene - Reference to MyScene object
 * @param id - Reference to Component id
 * @param transformation - Reference to Component's transformation Matrix
 * @param materials - Reference to Component's material
 * @param texture - Reference to Component's texture
 * @param length_s - Reference to Component's texture length_s
 * @param length_t - Reference to Component's texture length_t
 * @param children - Reference to Component's children
 * @param leaves - Reference to Component's leaves
 */
export class MyComponent extends CGFobject {
	constructor(scene, id, transformation, materials, texture, length_s, length_t, children, leaves, animation, r, g, b, scale) {
		super(scene);
		this.scene = scene;
		this.id = id;
		this.transformation = transformation;
		this.materials = materials;
		this.currentMaterialIndex = 0;
		this.currentMaterialID = this.materials[0];
		this.texture = texture;
		this.length_s = length_s;
		this.length_t = length_t;
		this.children = children;
		this.leaves = leaves;
		this.animation = animation;
		this.r = r;
		this.g = g;
		this.b = b;
		this.scale = scale;
	}

	updateMaterial() {
		this.currentMaterialIndex++;
		if (this.currentMaterialIndex == this.materials.length)
			this.currentMaterialIndex = 0;

		this.currentMaterialID = this.materials[this.currentMaterialIndex];
	}
}