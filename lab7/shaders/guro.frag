#version 300 es

#ifdef GL_ES 
precision highp float;
#endif

uniform vec3 lightPosition;
uniform vec3 ambientLightColor;
uniform vec3 diffuseLightColor;
uniform vec3 specularLightColor;

uniform float constantAttenuation;
uniform float linearAttenuation;
uniform float quadraticAttenuation;

uniform sampler2D u_texture;
// uniform vec2 textureSize;

in vec2 texCoord;
in vec3 color;
in vec3 normal;
in vec3 position;

out vec4 fragColor;

void main() { 
  vec4 textColor = texture(u_texture, texCoord);

  float d = distance(lightPosition, position);
  vec3 dirToLight = normalize(lightPosition - position); // l
  vec3 reflVec = normalize(reflect(-dirToLight, normal)); // r
  vec3 dirToView = normalize(0.0 - position); // v

  float diffLightDot = max(dot(normal, dirToLight),0.0);
  float specLightDot = max(dot(reflVec, dirToView),0.0);
  float specLightParam = pow(specLightDot, 16.0);

  float attenuation = 1.0 / (constantAttenuation + linearAttenuation * d + quadraticAttenuation * d * d);

  vec3 illumination = ambientLightColor + 
    attenuation * (diffuseLightColor * diffLightDot + specularLightColor * specLightParam); 

  fragColor = vec4(color, 1.0) * textColor;
  fragColor.xyz = illumination * fragColor.xyz;
}