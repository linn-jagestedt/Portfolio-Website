#version 300 es
precision highp float;

in vec2 aPos;
in vec2 aTexcoord;

uniform mat4 modelView;

out vec2 Texcoord;

void main() 
{
    Texcoord = aTexcoord;
    gl_Position = modelView * vec4(aPos, 0.0, 1.0);
}