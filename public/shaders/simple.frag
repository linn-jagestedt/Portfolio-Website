#version 300 es
precision highp float;

in vec2 Texcoord;
uniform sampler2D colorTexture;

out vec4 FragColor;

void main() 
{
    vec4 color = texture(colorTexture, Texcoord);
    FragColor = vec4(color.rgb, 1.0);
}