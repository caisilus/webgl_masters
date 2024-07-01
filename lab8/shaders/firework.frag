#version 300 es
precision mediump float;

uniform sampler2D u_texture;
uniform vec3 sparkColor;

out vec4 fragColor;

void main() {
    fragColor = texture(u_texture, gl_PointCoord).rgba;
    fragColor.xyz *= sparkColor;
}
