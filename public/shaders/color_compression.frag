#version 300 es
precision highp float;

in vec2 Texcoord;

uniform sampler2D colorTexture;
uniform vec2 textureSize;
uniform vec3 rgbScale;

out vec4 FragColor;

void main() 
{
    vec3 color = vec3(0.0f, 0.0f, 0.0f);
    
    vec2 targetResR = textureSize * rgbScale.r * 2.0;
    vec2 targetResG = textureSize * rgbScale.g * 2.0;
    vec2 targetResB = textureSize * rgbScale.b * 2.0;

    vec2 stepR = 1.0 / targetResR;
    vec2 stepG = 1.0 / targetResG;
    vec2 stepB = 1.0 / targetResB;

    vec2 uvRoundR = vec2(round(Texcoord.x * targetResR.x) / targetResR.x, round(Texcoord.y * targetResR.y) / targetResR.y);
    vec2 uvRoundG = vec2(round(Texcoord.x * targetResG.x) / targetResG.x, round(Texcoord.y * targetResG.y) / targetResG.y);
    vec2 uvRoundB = vec2(round(Texcoord.x * targetResB.x) / targetResB.x, round(Texcoord.y * targetResB.y) / targetResB.y);

    for (int i = -1; i < 2; i++) 
    {
        for (int j = -1; j < 2; j++) 
        {
            vec2 neighbourUvR = vec2(uvRoundR.x + float(i) * stepR.x, uvRoundR.y + float(j) * stepR.y);
            vec2 neighbourUvG = vec2(uvRoundG.x + float(i) * stepG.x, uvRoundG.y + float(j) * stepG.y);
            vec2 neighbourUvB = vec2(uvRoundB.x + float(i) * stepB.x, uvRoundB.y + float(j) * stepB.y);

            color.r += texture(colorTexture, neighbourUvR).r / 9.0f;    
            color.g += texture(colorTexture, neighbourUvG).g / 9.0f;            
            color.b += texture(colorTexture, neighbourUvB).b / 9.0f;            
        }
    }

    color.r = texture(colorTexture, uvRoundR).r;    
    color.g = texture(colorTexture, uvRoundG).g;            
    color.b = texture(colorTexture, uvRoundB).b;

    FragColor = vec4(color, 1.0);
}