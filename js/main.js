// Global Variables
// ============================================================================
// for WebGL usage:--------------------
var gl;
var g_canvasID;

// For multiple VBOs & Shaders:-----------------
planeBox = new VBObox0();		  // Holds VBO & shaders for 3D 'world' ground-plane grid, etc;
part1Box = new VBObox1();		  // "  "  for first set of custom-shaded 3D parts
part2Box = new VBObox2();     // "  "  for second set of custom-shaded 3D parts

var activeVBO = 1; // 1: Gouraud shading, 2: Phong Shading

var activeLighting = 0; // 0: Phong; 1: Blinn-Phong

// Materials
var matl0 = new Material(MATL_RED_PLASTIC); //1
var matl1 = new Material(MATL_CHROME);  //9
var matl2 = new Material(MATL_EMERALD); //17
var matl3 = new Material(MATL_PEARL); //20

// Lights
var lamp0 = new LightsT(); // headlight
var lamp1 = new LightsT(); // worldlight

// For animation:---------------------
var g_lastMS = Date.now();
var g_angleNow0  =  0.0; 			  // Current rotation angle, in degrees.
var g_angleRate0 = 45.0;				// Rotation angle rate, in degrees/second.
                                //---------------
var g_angleNow1  = 0.0;       // current angle, in degrees
var g_angleRate1 =  95.0;        // rotation angle rate, degrees/sec
var g_angleMax1  = 55.0;       // max, min allowed angle, in degrees
var g_angleMin1  =  -55.0;
                                //---------------
var g_angleNow2  =  0.0; 			  // Current rotation angle, in degrees.
var g_angleRate2 = -62.0;				// Rotation angle rate, in degrees/second.

                                //---------------
var g_posNow0 =  0.0;           // current position
var g_posRate0 = 0.6;           // position change rate, in distance/second.
var g_posMax0 =  0.5;           // max, min allowed for g_posNow;
var g_posMin0 = -0.5;
                                // ------------------
var g_posNow1 =  0.0;           // current position
var g_posRate1 = 0.5;           // position change rate, in distance/second.
var g_posMax1 =  1.0;           // max, min allowed positions
var g_posMin1 = -1.0;
                                //---------------

// For camera:---------------------------------
var eye_point = [3.0,3.0,2.0,1.0]; // ex, ey, ez, 1
var look_at_point = [0.0,0.0,0.0,1.0]; //atx, aty, atz, 1
var up_vector = [0.0,0.0,1.0,0.0]; //upx, upy, upz, 0

var ex = 3.0,
    ey = 0.0,
    ez = 1.0,
    ax = 2.0,
    ay = 0.0,
    az = 0.8,
    ux = 0.0,
    uy = 0.0,
    uz = 1.0,
    theta = Math.PI, // radians
    velocity = 0.1,
    d_tilt = 0.1,
    d_theta = Math.PI / 32; // rad

function main() {
//=============================================================================
  g_canvasID = document.getElementById('webgl');
  gl = g_canvasID.getContext("webgl", { preserveDrawingBuffer: true});

  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize each of our 'vboBox' objects:
  planeBox.init(gl);
  part1Box.init(gl);
	part2Box.init(gl);

  window.addEventListener("keydown", myKeyDown, false);

  gl.clearColor(0.0, 0.2, 0.1, 1);
  gl.enable(gl.DEPTH_TEST);

  // Initialize lights
  lamp0.I_pos.elements.set( [ex, ey, ez]);
  lamp0.I_ambi.elements.set([0.4, 0.4, 0.4]);
  lamp0.I_diff.elements.set([1.0, 1.0, 1.0]);
  lamp0.I_spec.elements.set([1.0, 1.0, 1.0]);

  lamp1.I_pos.elements.set( [1.0, 1.0, 1.0]);
  lamp1.I_ambi.elements.set([0.4, 0.4, 0.4]);
  lamp1.I_diff.elements.set([1.0, 1.0, 1.0]);
  lamp1.I_spec.elements.set([1.0, 1.0, 1.0]);

  var tick = function() {
    requestAnimationFrame(tick, g_canvasID);
    timerAll();
    drawAll();
    };
  //------------------------------------
  drawResize();
  tick();
}

function timerAll() {
//=============================================================================
  var nowMS = Date.now();             // current time (in milliseconds)
  var elapsedMS = nowMS - g_lastMS;   //
  g_lastMS = nowMS;                   // update for next webGL drawing.
  if(elapsedMS > 1000.0) {
    elapsedMS = 1000.0/30.0;
    }
  // Find new time-dependent parameters using the current or elapsed time:
  // Continuous rotation:
  g_angleNow0 = g_angleNow0 + (g_angleRate0 * elapsedMS) / 1000.0;
  g_angleNow1 = g_angleNow1 + (g_angleRate1 * elapsedMS) / 1000.0;
  g_angleNow2 = g_angleNow2 + (g_angleRate2 * elapsedMS) / 1000.0;
  g_angleNow0 %= 360.0;   // keep angle >=0.0 and <360.0 degrees
  g_angleNow1 %= 360.0;
  g_angleNow2 %= 360.0;
  if(g_angleNow1 > g_angleMax1) {
    g_angleNow1 = g_angleMax1;    // move back down to the max, and
    g_angleRate1 = -g_angleRate1; // reverse direction of change.
    }
  else if(g_angleNow1 < g_angleMin1) {  // below the min?
    g_angleNow1 = g_angleMin1;    // move back up to the min, and
    g_angleRate1 = -g_angleRate1;
    }
  // Continuous movement:
  g_posNow0 += g_posRate0 * elapsedMS / 1000.0;
  g_posNow1 += g_posRate1 * elapsedMS / 1000.0;
  // apply position limits
  if(g_posNow0 > g_posMax0) {   // above the max?
    g_posNow0 = g_posMax0;      // move back down to the max, and
    g_posRate0 = -g_posRate0;   // reverse direction of change
    }
  else if(g_posNow0 < g_posMin0) {  // or below the min?
    g_posNow0 = g_posMin0;      // move back up to the min, and
    g_posRate0 = -g_posRate0;   // reverse direction of change.
    }
  if(g_posNow1 > g_posMax1) {   // above the max?
    g_posNow1 = g_posMax1;      // move back down to the max, and
    g_posRate1 = -g_posRate1;   // reverse direction of change
    }
  else if(g_posNow1 < g_posMin1) {  // or below the min?
    g_posNow1 = g_posMin1;      // move back up to the min, and
    g_posRate1 = -g_posRate1;   // reverse direction of change.
    }

}

function drawAll() {
//=============================================================================
  // Clear on-screen HTML-5 <canvas> object:
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.viewport(0,0,g_canvasID.width,g_canvasID.height);

  planeBox.switchToMe();
  planeBox.adjust();
	planeBox.draw();

  if (activeVBO == 1) {
    part1Box.switchToMe();
    part1Box.draw();
  } else if (activeVBO == 2) {
    part2Box.switchToMe();
    part2Box.draw();
  }
}

function drawResize() {
	//Make canvas fill the top 4/5th of our browser window:
	var xtraMargin = 16;    // keep a margin (otherwise, browser adds scroll-bars)
	g_canvasID.width = innerWidth - xtraMargin;
	g_canvasID.height = (innerHeight*4/5) - xtraMargin;
}

function changeShading() {
  activeVBO = document.getElementById("shading-mode").value;
}

function changeLighting() {
  activeLighting = document.getElementById("light-mode").value;
}


function setMat0(val) {
  matl0.setMatl(mat_lookup[val]);
}

function setMat1(val) {
  matl1.setMatl(mat_lookup[val]);
}

function setMat2(val) {
  matl2.setMatl(mat_lookup[val]);
}

function setMat3(val) {
  matl3.setMatl(mat_lookup[val]);
}


function headLightOnOff() {
  if (lamp0.isLit) {
    lamp0.isLit = false;
    document.getElementById("hlo").innerHTML = "off";
  } else {
    lamp0.isLit = true;
    document.getElementById("hlo").innerHTML = "on";
  }
}


function worldLightOnOff() {
  if (lamp1.isLit) {
    lamp1.isLit = false;
    document.getElementById("wlo").innerHTML = "off";
  } else {
    lamp1.isLit = true;
    document.getElementById("wlo").innerHTML = "on";
  }
}


function headAmbientOnOff() {
  if (lamp0.ambi_isLit) {
    lamp0.ambi_isLit = false;
    document.getElementById("hao").innerHTML = "off";
  } else {
    lamp0.ambi_isLit = true;
    document.getElementById("hao").innerHTML = "on";
  }
}


function worldAmbientOnOff() {
  if (lamp1.ambi_isLit) {
    lamp1.ambi_isLit = false;
    document.getElementById("wao").innerHTML = "off";
  } else {
    lamp1.ambi_isLit = true;
    document.getElementById("wao").innerHTML = "on";
  }
}

function headDiffuseOnOff() {
  if (lamp0.diff_isLit) {
    lamp0.diff_isLit = false;
    document.getElementById("hdo").innerHTML = "off";
  } else {
    lamp0.diff_isLit = true;
    document.getElementById("hdo").innerHTML = "on";
  }
}


function worldDiffuseOnOff() {
  if (lamp1.diff_isLit) {
    lamp1.diff_isLit = false;
    document.getElementById("wdo").innerHTML = "off";
  } else {
    lamp1.diff_isLit = true;
    document.getElementById("wdo").innerHTML = "on";
  }
}

function headSpectralOnOff() {
  if (lamp0.spec_isLit) {
    lamp0.spec_isLit = false;
    document.getElementById("hso").innerHTML = "off";
  } else {
    lamp0.spec_isLit = true;
    document.getElementById("hso").innerHTML = "on";
  }
}


function worldSpectralOnOff() {
  if (lamp1.spec_isLit) {
    lamp1.spec_isLit = false;
    document.getElementById("wso").innerHTML = "off";
  } else {
    lamp1.spec_isLit = true;
    document.getElementById("wso").innerHTML = "on";
  }
}

function updateLightPos(val,ind) {
  lamp1.I_pos.elements[ind] = val;
  if (ind == 0) {
    document.getElementById("xpos").innerHTML = "X: " + val;
  } else if (ind == 1) {
    document.getElementById("ypos").innerHTML = "Y: " + val;
  } else {
    document.getElementById("zpos").innerHTML = "Z: " + val;
  }
}

// Keyboard and camera movements

function cameraFly(direction) {
  var dx = (ax - ex) * velocity * direction;
  var dy = (ay - ey) * velocity * direction;
  var dz = (az - ez) * velocity * direction;
  ex += dx;
  ey += dy;
  ez += dz;
  ax += dx;
  ay += dy;
  az += dz;
  lamp0.I_pos.elements.set( [ex, ey, ez]);
}


function cameraStrafe(direction) {
  // find view vector
  var dx = (ax - ex);
  var dy = (ay - ey);
  var dz = (az - ez);

  // calculate cross product
  var cx = dy * uz - dz*uy;
  cx = cx * velocity * direction;

  var cy = dz * ux;
  cy -= dx * uz;
  cy = cy * velocity * direction;

  var cz = dx * uy;
  cz -= dy * ux;
  cz = cz * velocity * direction;

  ex += cx;
  ey += cy;
  ez += cz;
  ax += cx;
  ay += cy;
  az += cz;
  lamp0.I_pos.elements.set( [ex, ey, ez]);
}

function cameraTilt(direction) {
  az += d_tilt * direction;
}

function cameraTurn(direction) {
  theta += (direction * d_theta);
  ax = ex + Math.cos(theta);
  ay = ey + Math.sin(theta);
}

function myKeyDown(kev) {
  switch (kev.code) {
    case "KeyW":
      cameraFly(1); // move forward
      break;
    case "KeyS":
      cameraFly(-1); // move backward
      break;
    case "KeyA":
      cameraStrafe(-1); // move left
      break;
    case "KeyD":
      cameraStrafe(1); // move right
      break;
    case "KeyI":
      cameraTilt(1); // tilt upward
      break;
    case "KeyK":
      cameraTilt(-1); // tilt downward
      break;
    case "KeyJ":
      cameraTurn(1); // turn left
      break;
    case "KeyL":
      cameraTurn(-1); // turn right
      break;
  }
}


// Color pickers

pickr_hac.on('save',(color) => {
  var cols = color.toRGBA().map(x => x/255);
  lamp0.I_ambi.elements.set([cols[0], cols[1], cols[2]]);
});

pickr_hdc.on('save',(color) => {
  var cols = color.toRGBA().map(x => x/255);
  lamp0.I_diff.elements.set([cols[0], cols[1], cols[2]]);
});

pickr_hsc.on('save',(color) => {
  var cols = color.toRGBA().map(x => x/255);
  lamp0.I_spec.elements.set([cols[0], cols[1], cols[2]]);
});

pickr_wac.on('save',(color) => {
  var cols = color.toRGBA().map(x => x/255);
  lamp1.I_ambi.elements.set([cols[0], cols[1], cols[2]]);
});

pickr_wdc.on('save',(color) => {
  var cols = color.toRGBA().map(x => x/255);
  lamp1.I_diff.elements.set([cols[0], cols[1], cols[2]]);
});

pickr_wsc.on('save',(color) => {
  var cols = color.toRGBA().map(x => x/255);
  lamp1.I_spec.elements.set([cols[0], cols[1], cols[2]]);
});
