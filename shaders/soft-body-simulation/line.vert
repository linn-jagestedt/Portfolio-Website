#version 300 es
precision highp float;

#define INSTANCES_PER_DRAWCALL 200

in vec2 aPos;
in vec2 aTexcoord;

uniform mat4 modelView[INSTANCES_PER_DRAWCALL];

out vec2 Texcoord;

void main() 
{
    Texcoord = aTexcoord;
    gl_Position = modelView[gl_InstanceID] * vec4(aPos, 0.0, 1.0);
}