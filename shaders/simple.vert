#version 300 es
precision highp float;

in vec3 aPos;
in vec2 aTexcoord;

uniform mat4 modelView;
uniform vec2 drawingBufferSize;
uniform vec2 textureSize;

out vec2 Texcoord;

void main() 
{
    Texcoord = aTexcoord;
    vec3 pos = aPos;
    pos.y *= (drawingBufferSize.x / drawingBufferSize.y);
    pos.y *= (textureSize.x / textureSize.y);
    gl_Position = modelView * vec4(pos, 1.0);
}