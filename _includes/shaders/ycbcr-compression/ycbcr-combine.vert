#version 300 es
precision highp float;

in vec2 aPos;
in vec2 aTexcoord;

uniform mat4x2 modelView;

out vec2 Texcoord;

void main() 
{
    Texcoord = aTexcoord;
    vec2 newPos = modelView * vec4(aPos, 0.0, 1.0);
    gl_Position = vec4(newPos, 0.0, 1.0);
}