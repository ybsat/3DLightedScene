function VBObox0() {

	this.VERT_SRC =	//--------------------- VERTEX SHADER source code
  'precision highp float;\n' +
  //
  'uniform mat4 u_ModelMat0;\n' +
  'attribute vec4 a_Pos0;\n' +
  'attribute vec3 a_Colr0;\n'+
  'varying vec3 v_Colr0;\n' +
  //
  'void main() {\n' +
  '  gl_Position = u_ModelMat0 * a_Pos0;\n' +
  '	 v_Colr0 = a_Colr0;\n' +
  ' }\n';

	this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code
  'precision mediump float;\n' +
  'varying vec3 v_Colr0;\n' +
  'void main() {\n' +
  '  gl_FragColor = vec4(v_Colr0, 1.0);\n' +
  '}\n';

		//----------------------Attribute sizes
	this.vboFcount_a_Pos0 =  4;    // # of floats in the VBO needed to store the
											// attribute named a_Pos0. (4: x,y,z,w values)
	this.vboFcount_a_Colr0 = 3;   // # of floats for this attrib (r,g,b values)

	this.vboContents = makeGroundGrid(this.vboFcount_a_Pos0 + this.vboFcount_a_Colr0)

	this.vboVerts = this.vboContents.length / (this.vboFcount_a_Pos0 + this.vboFcount_a_Colr0); // # of vertices held in 'vboContents' array
	this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;
	                              // bytes req'd by 1 vboContents array element;
  this.vboBytes = this.vboContents.length * this.FSIZE;
                                // total number of bytes stored in vboContents
                                // (#  of floats in vboContents array) *
                                // (# of bytes/float).
	this.vboStride = this.vboBytes / this.vboVerts;
	                              // (== # of bytes to store one complete vertex).

  console.assert((this.vboFcount_a_Pos0 +
                  this.vboFcount_a_Colr0) *
                  this.FSIZE == this.vboStride,
                  "Uh oh! VBObox0.vboStride disagrees with attribute-size values!");

              //----------------------Attribute offsets
	this.vboOffset_a_Pos0 = 0;    // # of bytes from START of vbo to the START
  this.vboOffset_a_Colr0 = this.vboFcount_a_Pos0 * this.FSIZE;

	            //-----------------------GPU memory locations:
	this.vboLoc;
	this.shaderLoc;
	this.a_PosLoc;

	this.ModelMat = new Matrix4();
	this.u_ModelMatLoc;
}

VBObox0.prototype.init = function() {
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

  gl.bindBuffer(gl.ARRAY_BUFFER,
  								this.vboLoc);

  gl.bufferData(gl.ARRAY_BUFFER,
 					 				this.vboContents,
  							 	gl.STATIC_DRAW);

  this.a_PosLoc = gl.getAttribLocation(this.shaderLoc, 'a_Pos0');
  if(this.a_PosLoc < 0) {
    console.log(this.constructor.name +
    						'.init() Failed to get GPU location of attribute a_Pos0');
    return -1;
  }
 	this.a_ColrLoc = gl.getAttribLocation(this.shaderLoc, 'a_Colr0');
  if(this.a_ColrLoc < 0) {
    console.log(this.constructor.name +
    						'.init() failed to get the GPU location of attribute a_Colr0');
    return -1;
  }

	this.u_ModelMatLoc = gl.getUniformLocation(this.shaderLoc, 'u_ModelMat0');
  if (!this.u_ModelMatLoc) {
    console.log(this.constructor.name +
    						'.init() failed to get GPU location for u_ModelMat1 uniform');
    return;
  }
}


VBObox0.prototype.switchToMe = function() {

  gl.useProgram(this.shaderLoc);
	gl.bindBuffer(gl.ARRAY_BUFFER,
										this.vboLoc);

  gl.vertexAttribPointer(
		this.a_PosLoc,
		this.vboFcount_a_Pos0,
		gl.FLOAT,
		false,
		this.vboStride,
		this.vboOffset_a_Pos0);

  gl.vertexAttribPointer(this.a_ColrLoc, this.vboFcount_a_Colr0,
                        gl.FLOAT, false,
                        this.vboStride, this.vboOffset_a_Colr0);

  gl.enableVertexAttribArray(this.a_PosLoc);
  gl.enableVertexAttribArray(this.a_ColrLoc);
}

VBObox0.prototype.isReady = function() {
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

VBObox0.prototype.adjust = function() {
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name +
  						'.adjust() call you needed to call this.switchToMe()!!');
  }

	this.ModelMat.setIdentity();

	var vpAspect = g_canvasID.width /	g_canvasID.height;

	this.ModelMat.perspective(30.0,vpAspect,1.0,20.0); // FOV-Y(deg), Aspect Ratio W/H, z-near, z-far

	this.ModelMat.lookAt( ex, ey, ez,	// center of projection
											ax, ay, az,	// look-at point
											ux, uy, uz);	// View UP vector.

	this.ModelMat.scale(0.1,0.1, 0.1);

  gl.uniformMatrix4fv(this.u_ModelMatLoc,
  										false,
  										this.ModelMat.elements);
}

VBObox0.prototype.draw = function() {
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name +
  						'.draw() call you needed to call this.switchToMe()!!');
  }

  gl.drawArrays(gl.LINES,0,this.vboVerts);
}

VBObox0.prototype.reload = function() {
 gl.bufferSubData(gl.ARRAY_BUFFER,0,this.vboContents); 
}
