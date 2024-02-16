#version 300 es
precision highp float;

in vec3 aPos;
in vec2 aTexcoord;

uniform mat4 modelView;

out vec2 Texcoord;

void main() 
{
    Texcoord = aTexcoord;
    gl_Position = modelView * vec4(aPos, 1.0);
}