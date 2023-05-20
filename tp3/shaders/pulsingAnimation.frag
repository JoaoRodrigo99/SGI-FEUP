#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
varying vec4 coords;
varying vec4 normal;
uniform float normScale;
uniform float timeFactor;
uniform vec4 passedColor;

void main() {

	vec3 texture = texture2D(uSampler, vTextureCoord).rgb;

	//(passedColor - texture) - interval


	float sinResult = (sin(timeFactor * 0.1) / 2.0) + 0.5 ;

	vec3 mixedColor = mix(passedColor.rgb, texture, 1.0 - sinResult);

    gl_FragColor = vec4(mixedColor, 1.0);



}