#version 310 es

#extension GL_GOOGLE_include_directive : enable

#include "constants.h"

precision highp float;
precision highp int;

layout(input_attachment_index = 0, set = 0, binding = 0) uniform highp subpassInput in_color;

layout(set = 0, binding = 1) uniform sampler2D color_grading_lut_texture_sampler;

layout(location = 0) out highp vec4 out_color;

vec4 SampleTexture(sampler2D tex,highp vec2 uv,int level,vec2 texSize);

void main()
{
    highp ivec2 lut_tex_size = textureSize(color_grading_lut_texture_sampler, 0);
    highp float _COLORS      = float(lut_tex_size.y);

    highp vec4 color       = subpassLoad(in_color).rgba;

    highp float level = color.b * (_COLORS - 1.0);

    highp int level_low = int(floor(level));
    highp int level_high = min(level_low + 1, int(_COLORS) - 1);

    highp vec2 uv0 = color.rg;
    highp vec2 uv1 = color.rg;

    highp vec4 color0 = SampleTexture(color_grading_lut_texture_sampler,uv0,level_low,vec2(lut_tex_size));
    highp vec4 color1 = SampleTexture(color_grading_lut_texture_sampler,uv1,level_high,vec2(lut_tex_size));

    out_color =  mix(color0,color1,fract(level));
}

vec4 SampleTexture(sampler2D tex,highp vec2 uv,int level,vec2 texSize){
    highp float x = 0.0;
    float a = texSize.y;
    x += float(level) * a;
    x += uv.x * (a - 1.0);
    x += 0.5;
    x /= texSize.x;

    highp float y = 0.0;
    y += uv.y * (a - 1.0);
    y += 0.5;
    y /= texSize.y;

    return texture(tex,vec2(x,y));
}
