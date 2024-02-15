uniform sampler2D colorTexture;
varying vec2 vUv;

void main() 
{
    vec3 color = texture2D(colorTexture, vUv).rgb;
    gl_FragColor = vec4(color, 1.0);
}