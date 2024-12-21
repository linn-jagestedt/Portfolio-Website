#version 300 es
precision highp float;

#define INSTANCES_PER_DRAWCALL 200

in vec2 aPos;
in vec2 aTexcoord;

uniform float lineWidth;

uniform vec2 sourcePositions[INSTANCES_PER_DRAWCALL];
uniform vec2 targetPositions[INSTANCES_PER_DRAWCALL];

out vec2 Texcoord;

void main() 
{
    Texcoord = aTexcoord;
    
    vec2 diff = targetPositions[gl_InstanceID] - sourcePositions[gl_InstanceID];
    vec2 pos = sourcePositions[gl_InstanceID] + 0.5 * diff;

    float lineLength = length(diff) * 0.5;

    float angle = -atan(diff.y, diff.x);

    float sinZ = sin(angle);
    float cosZ = cos(angle);

    mat4x2 modelView = mat4x2(
        lineLength * cosZ, lineLength * -sinZ,
        lineWidth * sinZ,  lineWidth * cosZ,
        0.0,               0.0,
        pos.x,             pos.y
    );

    vec2 newPos = modelView * vec4(aPos, 0.0, 1.0);
    gl_Position = vec4(newPos, 0.0, 1.0);
}