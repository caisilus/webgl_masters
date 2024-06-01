#version 300 es

precision mediump float;

in vec3 vertPosition;
in vec3 vertColor;
in vec3 vertNormal;
in vec2 vertTexCoord;

uniform mat4 mProj;  // projection matrix, e.g. perspective
uniform mat4 mView;  // 'camera' position
uniform mat4 mModel; // affine transformations
uniform mat3 mNormal;

uniform vec3 lightPosition;
uniform vec3 ambientLightColor;
uniform vec3 diffuseLightColor;
uniform vec3 specularLightColor;

uniform float constantAttenuation;
uniform float linearAttenuation;
uniform float quadraticAttenuation;

uniform int lightModel;

out vec3 color;
out vec3 illumination;
out vec2 fragTexCoord;

const float shininess = 16.0;

void main() {
  vec4 vertextPositionEye4 = mModel * vec4(vertPosition, 1.0);
  vec3 vertextPositionEye3 = vertextPositionEye4.xyz / vertextPositionEye4.w;

  vec3 lightDirection = normalize(lightPosition - vertextPositionEye3);

  vec3 normal = normalize(mNormal * vertNormal);

  float diffuseLightDot = max(dot(normal, lightDirection), 0.0);

  vec3 reflectionDirection = normalize(reflect(-lightDirection, normal));
  vec3 viewDirection = normalize(-vertextPositionEye3);
  float specularLightDot = max(dot(reflectionDirection, viewDirection), 0.0);
  float specularLightParam = pow(specularLightDot, shininess);


  float distanceToLight = length(lightDirection);
  float attenuation = 1.0 / (constantAttenuation + linearAttenuation * distanceToLight + quadraticAttenuation * distanceToLight * distanceToLight);

  // Lambert
  if (lightModel == 0) {
    illumination = ambientLightColor + diffuseLightColor * diffuseLightDot * attenuation;
  // Phong
  } else if (lightModel == 1) {
    illumination = (ambientLightColor + diffuseLightColor * diffuseLightDot + specularLightColor * specularLightParam) * attenuation;
  // Blinn-Phong
  } else if (lightModel == 2) {
    vec3 halfVector = normalize(lightDirection + viewDirection);
    float blinnPhong = max(dot(halfVector, normal), 0.0);
    float blinnPhongParam = pow(blinnPhong, shininess / 2.0);

    illumination = (ambientLightColor + diffuseLightColor * diffuseLightDot + specularLightColor * blinnPhongParam) * attenuation;
  // Toon shading
  } else if (lightModel == 3) {
    float numberOfShades = 16.0;
    vec3 ambientLightShade = ceil(ambientLightColor * numberOfShades) / numberOfShades;
    float diffuseLightShade = ceil(diffuseLightDot * numberOfShades) / numberOfShades;
    float specularLightShade = ceil(specularLightParam * numberOfShades) / numberOfShades;
    vec3 lightWeighting = ambientLightShade + diffuseLightShade + specularLightShade;

    illumination = lightWeighting * attenuation;

    // float numberOfShades = 16.0;
    // float shade = ceil(diffuseLightDot * numberOfShades) / numberOfShades;

    // illumination = vec3(shade);
  } 
  gl_Position = mProj * mView * mModel * vec4(vertPosition, 1);
  color = vertColor;
  fragTexCoord = vertTexCoord;
  // color = vec3(diffuseLightDot, diffuseLightDot, diffuseLightDot);
  // color = vec3(1.0, 1.0, 1.0);
}