#version 300 es

#ifdef GL_ES 
precision highp float;
#endif

uniform mat4 mView;

// Point lights
uniform int numPointLights;
uniform vec3[10] pointLightPositions;
uniform vec3[10] pointLightAmbientColors;
uniform vec3[10] pointLightDiffuseColors;
uniform vec3[10] pointLightSpecularColors;

// SpotLights
uniform int numSpotLights;
in vec3[10] toslDirection;
uniform vec3[10] slPosition;
uniform vec3[10] slDirection;
uniform float[10] slLimit;
uniform vec3[10] slAmbient;
uniform vec3[10] slDiffuse;
uniform vec3[10] slSpecular;

uniform bool useAmbientLight;
uniform bool usePointLight;
uniform bool useSpotLight;

uniform float constantAttenuation;
uniform float linearAttenuation;
uniform float quadraticAttenuation;

uniform sampler2D u_texture;

in vec2 texCoord;
in vec3 color;
in vec3 normal;
in vec3 position;

out vec4 fragColor;

void main() { 
  vec4 textColor = texture(u_texture, texCoord);

  vec3 sumAmbient = vec3(0.0, 0.0, 0.0);
  vec3 sumDiffuse = vec3(0.0, 0.0, 0.0);
  vec3 sumSpecular = vec3(0.0, 0.0, 0.0);

  if (usePointLight) {
    for (int i = 0; i < numPointLights; i++) {
      // ambient
      sumAmbient = sumAmbient + pointLightAmbientColors[i];

      float d = distance(pointLightPositions[i], position);
      vec3 dirToLight = normalize(pointLightPositions[i] - position); // l
      vec3 reflVec = normalize(reflect(-dirToLight, normal)); // r
      vec3 dirToView = normalize(0.0 - position); // v

      float attenuation = 1.0 / (constantAttenuation + linearAttenuation * d + quadraticAttenuation * d * d);

      // diffuse
      float diffLightDot = max(dot(normal, dirToLight),0.0);
      sumDiffuse += attenuation * pointLightDiffuseColors[i] * diffLightDot;

      // specular
      float specLightDot = max(dot(reflVec, dirToView),0.0);
      float specLightParam = pow(specLightDot, 16.0);
      sumSpecular += attenuation * pointLightSpecularColors[i] * specLightParam;
    }
  }

  if (useSpotLight) {
    for (int i = 0; i < numSpotLights; i++)
    {
      vec3 splPosition = (mView * vec4(slPosition[i], 1.0)).xyz;
      // vec3 splPosition = slPosition[i];
      vec3 splDirection = (mView * vec4(slDirection[i], 1.0)).xyz;
      // vec3 splDirection = slDirection[i];

      vec3 toslDirection = splPosition - position;
      vec3 l = normalize(toslDirection);
      vec3 d = normalize(splDirection);
      float dotFromDirection = dot(l,-d);

      if (dotFromDirection >= slLimit[i]) 
      {
          vec3 lightdir = l;
          vec3 r = normalize(-reflect(lightdir, normal));
          vec3 v = normalize(0.0 - position);

          vec3 ambient = slAmbient[i];
          // vec3 diffuse = slDiffuse[i] * max(dot(normal, lightdir),0.0);
          vec3 diffuse = slDiffuse[i];
          diffuse = clamp(diffuse, 0.0, 1.0);

          vec3 specular = slSpecular[i] * pow(max(dot(r,v),0.0), 300.0);
          specular = clamp(specular, 0.0, 1.0);
          
          sumAmbient += ambient;
          sumDiffuse += diffuse;
          sumSpecular += specular;     
      }else
      {
          sumAmbient += slAmbient[i];
      }
    }
  }

  // sumAmbient = sumAmbient / float(numPointLights);
  sumDiffuse = clamp(sumDiffuse, 0.0, 1.0);
  sumSpecular = clamp(sumSpecular, 0.0, 1.0);

  vec3 illumination = vec3(0.0, 0.0, 0.0);
  if (useAmbientLight) {
    illumination += sumAmbient;
  }
  illumination += sumDiffuse + sumSpecular; 

  fragColor = textColor;
  fragColor.xyz = illumination * fragColor.xyz;
  // fragColor = vec4(numSpotLights, numSpotLights, numSpotLights, 1.0);
  // fragColor.xyz = sumDiffuse;
}