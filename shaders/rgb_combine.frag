#version 300 es
precision highp float;

in vec2 Texcoord;

uniform sampler2D textureR;
uniform sampler2D textureG;
uniform sampler2D textureB;

out vec4 FragColor;

void main() 
{
    vec3 color;

    color.r = texture(textureR, Texcoord).r;
    color.g = texture(textureG, Texcoord).g;
    color.b = texture(textureB, Texcoord).b;

    FragColor = vec4(color, 1.0);
}