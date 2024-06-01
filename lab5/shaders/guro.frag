#version 300 es

precision mediump float;

in vec3 color;
in vec2 fragTexCoord;
in vec3 illumination;
out vec4 fragColor;

uniform sampler2D u_texture1;
uniform sampler2D u_texture2;

uniform float texturesMix;
        
void main()
{
    vec4 tex_col1 = texture(u_texture1, fragTexCoord);
    vec4 tex_col2 = texture(u_texture2, fragTexCoord);
    vec4 mixedTextures = mix(tex_col1, tex_col2, texturesMix);
    fragColor = vec4(color, 1.0) * mixedTextures;
    fragColor.xyz = illumination * fragColor.xyz;
}