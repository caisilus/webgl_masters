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
  vec2 textureSize = vec2(textureSize(u_texture, 0));
  vec4 rp = texture(u_texture, texCoord + vec2(1.0 / textureSize[0], 0.0));
  vec4 lp = texture(u_texture, texCoord - vec2(1.0 / textureSize[0], 0.0));
  vec4 up = texture(u_texture, texCoord + vec2(0.0, 1.0 / textureSize[1]));
  vec4 dp = texture(u_texture, texCoord - vec2(0.0, 1.0 / textureSize[1]));

  vec4 xGrad =  lp - rp;
  vec4 yGrad =  dp - up;

  float coef = 1.0;
  vec3 norm = normalize(normal + (texCoord.x * xGrad * coef).xyz + (texCoord.y * yGrad * coef).xyz);
    // vec3 norm = normal;
  //vec3 normal = norm + vec3(xGrad.x, yGrad.y, 0.0);

  float d = distance(lightPosition, position);
  vec3 dirToLight = normalize(lightPosition - position); // l
  vec3 reflVec = normalize(reflect(-dirToLight, norm)); // r
  vec3 dirToView = normalize(0.0 - position); // v

  float diffLightDot = max(dot(norm, dirToLight),0.0);
  float specLightDot = max(dot(reflVec, dirToView),0.0);
  float specLightParam = pow(specLightDot, 16.0);

  float attenuation = 1.0 / (constantAttenuation + linearAttenuation * d + quadraticAttenuation * d * d);

  vec3 illumination = ambientLightColor + 
    attenuation * (diffuseLightColor * diffLightDot + specularLightColor * specLightParam); 

  fragColor = vec4(illumination * color, 1.0);
//   fragColor = vec4(color, 1.0);
}