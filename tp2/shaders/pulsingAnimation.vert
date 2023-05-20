#ifdef GL_ES
precision highp float;
#endif

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;
uniform float timeFactor;
varying float sinResult;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform float normScale;
varying vec4 coords;
varying vec4 normal;

void main() {
	vec3 offset=vec3(0.0,0.0,0.0);
	
	vTextureCoord = aTextureCoord;

	/*if(sin(timeFactor * 0.1) > 0.0)
		offset=aVertexNormal*normScale*0.1*sin(timeFactor * 0.1);
	else
		offset= -1.0*aVertexNormal*normScale*0.1*sin(timeFactor * 0.1);
	*/

	sinResult = (sin(timeFactor * 0.1) / 2.0) + 0.5;
	offset=aVertexNormal*normScale*0.1*sinResult;

	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition+offset, 1.0);

}

