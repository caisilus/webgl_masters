#version 300 es

uniform mat4 mProj;  // projection matrix, e.g. perspective
uniform mat4 mView;  // 'camera' position
uniform mat4 mModel; // affine transformations
uniform mat3 mNormal;

in vec3 vertPosition;
out vec3 position;

in vec3 vertColor;
out vec3 color;

in vec3 vertNormal;
out vec3 normal;

in vec2 vertTexCoord;
out vec2 texCoord;

void main() {
  vec4 surfacePos = mModel * vec4(vertPosition, 1.0);
  position = surfacePos.xyz / surfacePos.w;
  // position = surfacePos.xyz;
  normal = normalize(mNormal * vertNormal);
  texCoord = vertTexCoord;
  color = vertColor;

  gl_Position = mProj * mView * surfacePos;
}
