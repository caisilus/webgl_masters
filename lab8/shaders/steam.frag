#version 300 es
precision mediump float;

uniform sampler2D u_texture;
uniform float u_alpha;

out vec4 fragColor;

void main() {
    fragColor = texture(u_texture, gl_PointCoord).rgba;
    fragColor.a = u_alpha;
}
