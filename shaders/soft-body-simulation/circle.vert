#version 300 es
precision highp float;

#define INSTANCES_PER_DRAWCALL 200

in vec2 aPos;
in vec2 aTexcoord;

uniform mat4x2 modelView[INSTANCES_PER_DRAWCALL];

out vec2 Texcoord;

void main() 
{
    Texcoord = aTexcoord;
    vec2 newPos = modelView[gl_InstanceID] * vec4(aPos, 0.0, 1.0);
    gl_Position = vec4(newPos, 0.0, 1.0);
}