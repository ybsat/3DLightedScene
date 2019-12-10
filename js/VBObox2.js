function VBObox2() {

	this.VERT_SRC =	//--------------------- VERTEX SHADER source code
  'precision highp float;\n' +

	//--------------- GLSL Struct Definitions:
	'struct MatlT {\n' +		// Describes one Phong material by its reflectances:
	'		vec3 emit;\n' +			// Ke: emissive -- surface 'glow' amount (r,g,b);
	'		vec3 ambi;\n' +			// Ka: ambient reflectance (r,g,b)
	'		vec3 diff;\n' +			// Kd: diffuse reflectance (r,g,b)
	'		vec3 spec;\n' + 		// Ks: specular reflectance (r,g,b)
	'		int shiny;\n' +			// Kshiny: specular exponent (integer >= 1; typ. <200)
	'		};\n' +
	//

	// Attributes
	'attribute vec4 a_Pos4;\n' +				// vertex position (model coord sys)
	'attribute vec4 a_Normal; \n' +			// vertex normal vector (model coord sys)

	// Uniforms
	'uniform MatlT u_MatlSet;\n' +		// Array of all materials.
	'uniform mat4 u_MvpMatrix; \n' +
	'uniform mat4 u_ModelMatrix;\n' +
	'uniform mat4 u_NormalMatrix; \n' +  	// Inverse Transpose of ModelMatrix;

	// Varying
	'varying vec3 v_Kd; \n' +							// Phong Lighting: diffuse reflectance
	'varying vec4 v_Position; \n' +
	'varying vec3 v_Normal; \n' +

  //
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Pos4;\n' +
	'  v_Position = u_ModelMatrix * a_Pos4;\n' +
	'	 v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' + //3
	'	 v_Kd = u_MatlSet.diff; \n' +
  ' }\n';


	this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code
	'precision highp float;\n' +
	'precision highp int;\n' +

	//--------------- GLSL Struct Definitions:
	'struct LampT {\n' +		// Describes one point-like Phong light source
	'		vec3 pos;\n' +			// (x,y,z,w); w==1.0 for local light at x,y,z position
													//		   w==0.0 for distant light from x,y,z direction
	' 	vec3 ambi;\n' +			// Ia ==  ambient light source strength (r,g,b)
	' 	vec3 diff;\n' +			// Id ==  diffuse light source strength (r,g,b)
	'		vec3 spec;\n' +			// Is == specular light source strength (r,g,b)
	'}; \n' +
	//
	'struct MatlT {\n' +		// Describes one Phong material by its reflectances:
	'		vec3 emit;\n' +			// Ke: emissive -- surface 'glow' amount (r,g,b);
	'		vec3 ambi;\n' +			// Ka: ambient reflectance (r,g,b)
	'		vec3 diff;\n' +			// Kd: diffuse reflectance (r,g,b)
	'		vec3 spec;\n' + 		// Ks: specular reflectance (r,g,b)
	'		int shiny;\n' +			// Kshiny: specular exponent (integer >= 1; typ. <200)
	'		};\n' +
	//

	// Uniforms
	'uniform LampT u_LampSet[2];\n' +		// Array of all light sources.
	'uniform MatlT u_MatlSet;\n' +		// Array of all materials.
	'uniform vec3 u_eyePosWorld; \n' + 	// Camera/eye location in world coords.
	'uniform int lightMode; \n' + 	// LightMode: 0 for Phong, 1 for Bling-Phong

	// Varying
	'varying vec3 v_Normal;\n' +				// Find 3D surface normal at each pix
	'varying vec4 v_Position;\n' +			// pixel's 3D pos too -- in 'world' coords
	'varying vec3 v_Kd;	\n' +						// Find diffuse reflectance K_d per pix; // Ambient? Emissive? Specular are uniform

	'void main() {\n' +
	'  vec3 normal = normalize(v_Normal); \n' +
	'  vec3 eyeDirection = normalize(u_eyePosWorld - v_Position.xyz); \n' +
	// Light 0
	'  vec3 ambient0 = u_LampSet[0].ambi * u_MatlSet.ambi;\n' +
	'  vec3 lightDirection0 = normalize(u_LampSet[0].pos - v_Position.xyz);\n' +
	'  float nDotL0 = max(dot(lightDirection0, normal), 0.0); \n' +
	'  vec3 diffuse0 = u_LampSet[0].diff * v_Kd * nDotL0;\n' +
	'  vec3 speculr0;\n' +
	'	 if (lightMode == 1) {\n' +
	'    vec3 H0 = normalize(lightDirection0 + eyeDirection); \n' +
	'    float nDotH0 = max(dot(H0, normal), 0.0); \n' +
	'    float e640 = pow(nDotH0, float(u_MatlSet.shiny));\n' +
	'	   speculr0 = u_LampSet[0].spec * u_MatlSet.spec * e640;\n' +
	'  } else {\n' +
	'    vec3 C0 = normal * nDotL0; \n' +
	'    vec3 R0 = normalize(2.0*C0 - lightDirection0); \n' +
	'    float rDotV0 = max(dot(R0, eyeDirection), 0.0); \n' +
	'    float e640 = pow(rDotV0, float(u_MatlSet.shiny));\n' +
	'	   speculr0 = u_LampSet[0].spec * u_MatlSet.spec * e640;\n' +
	'  }\n' +
	// Light 1
	'  vec3 ambient1 = u_LampSet[1].ambi * u_MatlSet.ambi;\n' +
	'  vec3 lightDirection1 = normalize(u_LampSet[1].pos - v_Position.xyz);\n' +
	'  float nDotL1 = max(dot(lightDirection1, normal), 0.0); \n' +
	'  vec3 diffuse1 = u_LampSet[1].diff * v_Kd * nDotL1;\n' +
	'  vec3 speculr1;\n' +
	'	 if (lightMode == 1) {\n' +
	'    vec3 H1 = normalize(lightDirection1 + eyeDirection); \n' +
	'    float nDotH1 = max(dot(H1, normal), 0.0); \n' +
	'    float e641 = pow(nDotH1, float(u_MatlSet.shiny));\n' +
	'	   speculr1 = u_LampSet[1].spec * u_MatlSet.spec * e641;\n' +
	'  } else {\n' +
	'    vec3 C1 = normal * nDotL1; \n' +
	'    vec3 R1 = normalize(2.0*C1 - lightDirection1); \n' +
	'    float rDotV1 = max(dot(R1, eyeDirection), 0.0); \n' +
	'    float e641 = pow(rDotV1, float(u_MatlSet.shiny));\n' +
	'	   speculr1 = u_LampSet[1].spec * u_MatlSet.spec * e641;\n' +
	'  }\n' +
	//
	'	 vec3 emissive = 	u_MatlSet.emit;' +
	'  gl_FragColor = vec4(emissive + ambient0 + diffuse0 + speculr0 + ambient1 + diffuse1 + speculr1, 1.0);\n' +
	'}\n';

	this.vboFcount_a_Pos =  4;    // # of floats in the VBO needed to store the
  this.vboFcount_a_Norm = 4;   // # of floats for this attrib (x,y,z,w values)

	this.floatsPerVertex = this.vboFcount_a_Pos + this.vboFcount_a_Norm;

	var g_sphereAry =  makeSphere(this.floatsPerVertex);
	var g_cubeAry = makeCube();
	var g_tetraAry = makeTetrahedron();

	this.sphereSize = g_sphereAry.length;
	this.cubeSize = g_cubeAry.length;
	this.tetraSize = g_tetraAry.length;
	this.mySiz =  this.sphereSize + this.cubeSize + this.tetraSize;

	this.vboVerts = this.mySiz / this.floatsPerVertex; // # of vertices held in 'vboContents' array;

	this.vboContents = new Float32Array(this.mySiz);

	this.sphereStart = 0;							// we stored the sphere first.
  for(i=0,j=0; j< g_sphereAry.length; i++,j++) {
  	this.vboContents[i] = g_sphereAry[j];
		}
		this.cubeStart = i;						// next, we'll store the cube;
	for(j=0; j< g_cubeAry.length; i++, j++) {// don't initialize i -- reuse it!
		this.vboContents[i] = g_cubeAry[j];
		}
		this.tetraStart = i;						// next, we'll store the tetra;
	for(j=0; j< g_tetraAry.length; i++, j++) {
		this.vboContents[i] = g_tetraAry[j];
		}

	this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;
  this.vboBytes = this.vboContents.length * this.FSIZE;
	this.vboStride = this.vboBytes / this.vboVerts;

	            //----------------------Attribute sizes
  console.assert((this.vboFcount_a_Pos +     // check the size of each and
                  this.vboFcount_a_Norm)*// +
                  this.FSIZE == this.vboStride, // for agreeement with'stride'
                  "Uh oh! VBObox1.vboStride disagrees with attribute-size values!");

              //----------------------Attribute offsets
	this.vboOffset_a_Pos = 0;
  this.vboOffset_a_Norm = (this.vboFcount_a_Pos) * this.FSIZE;
	            //-----------------------GPU memory locations:
	this.vboLoc;
	this.shaderLoc;
	this.a_PosLoc;
	this.a_NormLoc;
	            //---------------------- Uniform locations &values in our shaders
	this.ModelMatrix = new Matrix4();
	this.u_ModelMatrix;

	this.eyePosWorld = new Float32Array(3);
	this.u_eyePosWorld;

	this.MvpMatrix = new Matrix4();
	this.u_MvpMatrix;

	this.VpMatrix = new Matrix4();

	this.NormalMatrix = new Matrix4();
	this.u_NormalMatrix;

	this.lclLmp0 = new LightsT(); // used to hold gpu locations only
	this.lclLmp1 = new LightsT(); // used to hold gpu locations only

	this.lclMat = new Material(); // used to hold gpu locations only

	this.u_lightMode;
};


VBObox2.prototype.init = function() {
	this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
	if (!this.shaderLoc) {
    console.log(this.constructor.name +
    						'.init() failed to create executable Shaders on the GPU. Bye!');
    return;
  }

	gl.program = this.shaderLoc;

	this.vboLoc = gl.createBuffer();
  if (!this.vboLoc) {
    console.log(this.constructor.name +
    						'.init() failed to create VBO in GPU. Bye!');
    return;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER,this.vboLoc);

  gl.bufferData(gl.ARRAY_BUFFER,
 					 				this.vboContents,
  							 	gl.STATIC_DRAW);

  this.a_PosLoc = gl.getAttribLocation(this.shaderLoc, 'a_Pos4');
  if(this.a_PosLoc < 0) {
    console.log(this.constructor.name +
    						'.init() Failed to get GPU location of attribute a_Pos4');
    return -1;	// error exit.
  }
 	this.a_NormLoc = gl.getAttribLocation(this.shaderLoc, 'a_Normal');
  if(this.a_NormLoc < 0) {
    console.log(this.constructor.name +
    						'.init() failed to get the GPU location of attribute a_Normal');
    return -1;	// error exit.
  }

 	this.u_ModelMatrix = gl.getUniformLocation(this.shaderLoc, 'u_ModelMatrix');
  if (!this.u_ModelMatrix) {
    console.log(this.constructor.name +
    						'.init() failed to get GPU location for u_ModelMatrix uniform');
    return;
  }

	this.u_MvpMatrix = gl.getUniformLocation(this.shaderLoc, 'u_MvpMatrix');
  if (!this.u_MvpMatrix) {
    console.log(this.constructor.name +
    						'.init() failed to get GPU location for u_MvpMatrix uniform');
    return;
  }

	this.u_eyePosWorld = gl.getUniformLocation(this.shaderLoc, 'u_eyePosWorld');
	if (!this.u_eyePosWorld) {
		console.log(this.constructor.name +
								'.init() failed to get GPU location for u_eyePosWorld uniform');
		return;
	}

	this.u_NormalMatrix = gl.getUniformLocation(this.shaderLoc, 'u_NormalMatrix');
	if (!this.u_NormalMatrix) {
		console.log(this.constructor.name +
								'.init() failed to get GPU location for u_NormalMatrix uniform');
		return;
	}

	// Lamp location
	this.lclLmp0.u_pos  = gl.getUniformLocation(gl.program, 'u_LampSet[0].pos');
	this.lclLmp0.u_ambi = gl.getUniformLocation(gl.program, 'u_LampSet[0].ambi');
	this.lclLmp0.u_diff = gl.getUniformLocation(gl.program, 'u_LampSet[0].diff');
	this.lclLmp0.u_spec = gl.getUniformLocation(gl.program, 'u_LampSet[0].spec');
	if( !this.lclLmp0.u_pos || !this.lclLmp0.u_ambi	|| !this.lclLmp0.u_diff || !this.lclLmp0.u_spec) {
		console.log('Failed to get GPUs Lamp0 storage locations');
		return;
	}

	this.lclLmp1.u_pos  = gl.getUniformLocation(gl.program, 'u_LampSet[1].pos');
	this.lclLmp1.u_ambi = gl.getUniformLocation(gl.program, 'u_LampSet[1].ambi');
	this.lclLmp1.u_diff = gl.getUniformLocation(gl.program, 'u_LampSet[1].diff');
	this.lclLmp1.u_spec = gl.getUniformLocation(gl.program, 'u_LampSet[1].spec');
	if( !this.lclLmp1.u_pos || !this.lclLmp1.u_ambi	|| !this.lclLmp1.u_diff || !this.lclLmp1.u_spec) {
		console.log('Failed to get GPUs Lamp0 storage locations');
		return;
	}

	// Material location
	this.lclMat.uLoc_Ke = gl.getUniformLocation(gl.program, 'u_MatlSet.emit');
	this.lclMat.uLoc_Ka = gl.getUniformLocation(gl.program, 'u_MatlSet.ambi');
	this.lclMat.uLoc_Kd = gl.getUniformLocation(gl.program, 'u_MatlSet.diff');
	this.lclMat.uLoc_Ks = gl.getUniformLocation(gl.program, 'u_MatlSet.spec');
	this.lclMat.uLoc_Kshiny = gl.getUniformLocation(gl.program, 'u_MatlSet.shiny');
	if(!this.lclMat.uLoc_Ke || !this.lclMat.uLoc_Ka || !this.lclMat.uLoc_Kd
										|| !this.lclMat.uLoc_Ks || !this.lclMat.uLoc_Kshiny
		 ) {
		console.log('Failed to get GPUs Reflectance storage locations');
		return;
	}

	// LightMode location
	this.u_lightMode = gl.getUniformLocation(this.shaderLoc, 'lightMode');
	if (!this.u_lightMode) {
		console.log(this.constructor.name +
								'.init() failed to get GPU location for u_lightMode uniform');
		return;
	}

}

VBObox2.prototype.switchToMe = function () {
  gl.useProgram(this.shaderLoc);
	gl.bindBuffer(gl.ARRAY_BUFFER,
										this.vboLoc);

  gl.vertexAttribPointer(
		this.a_PosLoc,
		this.vboFcount_a_Pos,
		gl.FLOAT,
		false,
		this.vboStride,
		this.vboOffset_a_Pos);
  gl.vertexAttribPointer(this.a_NormLoc, this.vboFcount_a_Norm,
                         gl.FLOAT, false,
  						           this.vboStride,  this.vboOffset_a_Colr);

  gl.enableVertexAttribArray(this.a_PosLoc);
  gl.enableVertexAttribArray(this.a_NormLoc);
}

VBObox2.prototype.isReady = function() {
var isOK = true;

  if(gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc)  {
    console.log(this.constructor.name +
    						'.isReady() false: shader program at this.shaderLoc not in use!');
    isOK = false;
  }
  if(gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
      console.log(this.constructor.name +
  						'.isReady() false: vbo at this.vboLoc not in use!');
    isOK = false;
  }
  return isOK;
}


VBObox2.prototype.draw = function() {
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name +
  						'.draw() call you needed to call this.switchToMe()!!');
  }

	// Set lightMode
	gl.uniform1i(this.u_lightMode, activeLighting);

	// Set eyeWorld
	this.eyePosWorld.set([ex, ey, ez]);
	gl.uniform3fv(this.u_eyePosWorld, this.eyePosWorld);// use it to set our uniform

	// Set lights
	this.sendLights();

	// Rendering
	var vpAspect = g_canvasID.width /	g_canvasID.height;
	this.VpMatrix.setPerspective(30.0,vpAspect,1.0,20.0); // FOV-Y(deg), Aspect Ratio W/H, z-near, z-far
	this.VpMatrix.lookAt( ex, ey, ez, ax, ay, az, ux, uy, uz);

	this.switchMaterial(matl0);
	this.drawShape0();

	this.switchMaterial(matl1);
	this.drawShape1();

	this.switchMaterial(matl2);
	this.drawShape2();

	this.switchMaterial(matl3);
	this.drawShape3();
}

VBObox2.prototype.sendLights = function() {
	gl.uniform3fv(this.lclLmp0.u_pos,  lamp0.I_pos.elements.slice(0,3));
	if (lamp0.ambi_isLit && lamp0.isLit) {
		gl.uniform3fv(this.lclLmp0.u_ambi, lamp0.I_ambi.elements);		// ambient
	} else {
		gl.uniform3fv(this.lclLmp0.u_ambi, [0,0,0]);		// ambient
	}
	if (lamp0.diff_isLit && lamp0.isLit) {
		gl.uniform3fv(this.lclLmp0.u_diff, lamp0.I_diff.elements);		// diffuse
	} else {
		gl.uniform3fv(this.lclLmp0.u_diff, [0,0,0]);		// diffuse
	}
	if (lamp0.spec_isLit && lamp0.isLit) {
		gl.uniform3fv(this.lclLmp0.u_spec, lamp0.I_spec.elements);		// Specular
	} else {
		gl.uniform3fv(this.lclLmp0.u_spec, [0,0,0]);		// diffuse
	}


	gl.uniform3fv(this.lclLmp1.u_pos,  lamp1.I_pos.elements.slice(0,3));
	if (lamp1.ambi_isLit && lamp1.isLit) {
		gl.uniform3fv(this.lclLmp1.u_ambi, lamp1.I_ambi.elements);		// ambient
	} else {
		gl.uniform3fv(this.lclLmp1.u_ambi, [0,0,0]);		// ambient
	}
	if (lamp1.diff_isLit && lamp1.isLit) {
		gl.uniform3fv(this.lclLmp1.u_diff, lamp1.I_diff.elements);		// diffuse
	} else {
		gl.uniform3fv(this.lclLmp1.u_diff, [0,0,0]);		// diffuse
	}
	if (lamp1.spec_isLit && lamp1.isLit) {
		gl.uniform3fv(this.lclLmp1.u_spec, lamp1.I_spec.elements);		// Specular
	} else {
		gl.uniform3fv(this.lclLmp1.u_spec, [0,0,0]);		// diffuse
	}
}


VBObox2.prototype.switchMaterial = function(mat) {
	gl.uniform3fv(this.lclMat.uLoc_Ke, mat.K_emit.slice(0,3));				// Ke emissive
	gl.uniform3fv(this.lclMat.uLoc_Ka, mat.K_ambi.slice(0,3));				// Ka ambient
	gl.uniform3fv(this.lclMat.uLoc_Kd, mat.K_diff.slice(0,3));				// Kd	diffuse
	gl.uniform3fv(this.lclMat.uLoc_Ks, mat.K_spec.slice(0,3));				// Ks specular
	gl.uniform1i(this.lclMat.uLoc_Kshiny, parseInt(mat.K_shiny, 10));     // Kshiny
}

VBObox2.prototype.sendMatrices = function() {
	this.MvpMatrix.set(this.VpMatrix);
	this.MvpMatrix.multiply(this.ModelMatrix);
	this.NormalMatrix.setInverseOf(this.ModelMatrix);
	this.NormalMatrix.transpose();

	gl.uniformMatrix4fv(this.u_MvpMatrix,false,this.MvpMatrix.elements);
	gl.uniformMatrix4fv(this.u_ModelMatrix,false,this.ModelMatrix.elements);
	gl.uniformMatrix4fv(this.u_NormalMatrix,false,this.NormalMatrix.elements);
}

VBObox2.prototype.drawShape0 = function() {
	this.ModelMatrix.setTranslate(0, 0, 0.5);

  this.ModelMatrix.rotate(g_angleNow2, 0, 0, 1);	// -spin drawing axes,
	this.ModelMatrix.scale(0.3,0.3,0.3);
	this.drawSphere();
}

VBObox2.prototype.drawShape1 = function() {
	this.ModelMatrix.setTranslate(0, -1, 0.5);
	this.ModelMatrix.scale(0.25,0.25,0.25);
	this.drawCube();

	pushMatrix(this.ModelMatrix);

	this.ModelMatrix.translate(0.0, 1.0, 1.0);
	this.ModelMatrix.rotate(g_angleNow1, 1, 0, 0);
	this.ModelMatrix.scale(2/Math.sqrt(3), 2/Math.sqrt(3), 2/Math.sqrt(3));
	this.ModelMatrix.translate(0.0, 0.5, 0.0);
	this.drawTetra();

	this.ModelMatrix = popMatrix();

	this.ModelMatrix.translate(0.0, -1.0, 1.0);
	this.ModelMatrix.rotate(180, 0, 0, 1);
	this.ModelMatrix.rotate(g_angleNow1, 1, 0, 0);

	this.ModelMatrix.scale(2/Math.sqrt(3), 2/Math.sqrt(3), 2/Math.sqrt(3));
	this.ModelMatrix.translate(0.0, 0.5, 0.0);
	this.drawTetra();
}

VBObox2.prototype.drawShape2 = function() {
	this.ModelMatrix.setTranslate(0, 1.0, 0.0);

	this.ModelMatrix.scale(0.4,0.4,0.4);
	this.drawTetra();

	this.ModelMatrix.translate(0, 0, Math.sqrt(2));
	this.ModelMatrix.rotate(g_angleNow2, 0, 0, 1);
	this.ModelMatrix.rotate(g_angleNow1*0.75, 1, 0, 0);
	this.ModelMatrix.scale(1.0,1.0,-1.0);
	this.ModelMatrix.scale(0.5,0.5,0.5);
	this.ModelMatrix.translate(0, 0, -Math.sqrt(2));
	this.drawTetra();
}

VBObox2.prototype.drawShape3 = function() {
	this.ModelMatrix.setTranslate(-2.0, 1.0, 0.5);
	this.ModelMatrix.scale(0.25,0.25,0.25);
	this.ModelMatrix.rotate(g_angleNow2*2, 0, 0, 1);
	this.ModelMatrix.rotate(45, 1, 1, 0);
	this.drawCube();

	pushMatrix(this.ModelMatrix);
	pushMatrix(this.ModelMatrix);

	this.ModelMatrix.translate(-1.0, 1.0, 1.0);
	this.ModelMatrix.rotate(g_angleNow1*1.2, 0, 0, 1);
	this.ModelMatrix.rotate(30+g_angleNow1*0.8, 0, 1, 0);
	this.ModelMatrix.scale(0.5,0.5,0.5);
	this.ModelMatrix.translate(-1.0, 1.0, 1.0);
	this.drawCube();

	this.ModelMatrix = popMatrix();
	this.ModelMatrix.translate(1.0, 1.0, 1.0);
	this.ModelMatrix.rotate(45+g_angleNow1*0.75, 0, 0, 1);
	this.ModelMatrix.rotate(60+g_angleNow1*0.75, 0, 1, 0);
	this.ModelMatrix.scale(0.25,0.25,0.25);
	this.ModelMatrix.translate(1.0, 1.0, 1.0);
	this.drawCube();

	this.ModelMatrix = popMatrix();
	this.ModelMatrix.translate(1.0, -1.0, 1.0);
	this.ModelMatrix.rotate(15+g_angleNow1*0.6, 0, 0, 1);
	this.ModelMatrix.rotate(20+g_angleNow1*0.6, 0, 1, 0);
	this.ModelMatrix.scale(0.25,0.25,0.25);
	this.ModelMatrix.translate(1.0, -1.0, 1.0);
	this.drawCube();
}

VBObox2.prototype.drawSphere = function() {
	this.sendMatrices();
	gl.drawArrays(gl.TRIANGLES,
								this.sphereStart/this.floatsPerVertex,
								this.sphereSize / this.floatsPerVertex);
}

VBObox2.prototype.drawCube = function() {
	this.sendMatrices();
	gl.drawArrays(gl.TRIANGLE_STRIP,
								this.cubeStart/this.floatsPerVertex, 								// location of 1st vertex to draw;
								this.cubeSize / this.floatsPerVertex);		// number of vertices to draw on-screen.
}

VBObox2.prototype.drawTetra = function() {
	this.sendMatrices();
	gl.drawArrays(gl.TRIANGLE_STRIP,
								this.tetraStart/this.floatsPerVertex,
								this.tetraSize / this.floatsPerVertex);
}



VBObox2.prototype.reload = function() {
 gl.bufferSubData(gl.ARRAY_BUFFER,0,this.vboContents);
}
