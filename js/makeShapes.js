function makeGroundGrid(floatsPerVertex) {
//==============================================================================
// Create a list of vertices that create a large grid of lines in the x,y plane
// centered at x=y=z=0.  Draw this shape using the GL_LINES primitive.

	var xcount = 100;			// # of lines to draw in x,y to make the grid.
	var ycount = 100;
	var xymax	= 50.0;			// grid size; extends to cover +/-xymax in x and y.
 	var xColr = new Float32Array([1.0, 1.0, 0.3]);	// bright yellow
 	var yColr = new Float32Array([0.5, 1.0, 0.5]);	// bright green.

	// Create an (global) array to hold this ground-plane's vertices:
	var gndVerts = new Float32Array(floatsPerVertex*2*(xcount+ycount));
						// draw a grid made of xcount+ycount lines; 2 vertices per line.

	var xgap = xymax/(xcount-1);		// HALF-spacing between lines in x,y;
	var ygap = xymax/(ycount-1);		// (why half? because v==(0line number/2))

	// First, step thru x values as we make vertical lines of constant-x:
	for(v=0, j=0; v<2*xcount; v++, j+= floatsPerVertex) {
		if(v%2==0) {	// put even-numbered vertices at (xnow, -xymax, 0)
			gndVerts[j  ] = -xymax + (v  )*xgap;	// x
			gndVerts[j+1] = -xymax;								// y
			gndVerts[j+2] = 0.0;									// z
			gndVerts[j+3] = 1.0;									// w.
		}
		else {				// put odd-numbered vertices at (xnow, +xymax, 0).
			gndVerts[j  ] = -xymax + (v-1)*xgap;	// x
			gndVerts[j+1] = xymax;								// y
			gndVerts[j+2] = 0.0;									// z
			gndVerts[j+3] = 1.0;									// w.
		}
		gndVerts[j+4] = xColr[0];			// red
		gndVerts[j+5] = xColr[1];			// grn
		gndVerts[j+6] = xColr[2];			// blu
	}
	// Second, step thru y values as wqe make horizontal lines of constant-y:
	// (don't re-initialize j--we're adding more vertices to the array)
	for(v=0; v<2*ycount; v++, j+= floatsPerVertex) {
		if(v%2==0) {		// put even-numbered vertices at (-xymax, ynow, 0)
			gndVerts[j  ] = -xymax;								// x
			gndVerts[j+1] = -xymax + (v  )*ygap;	// y
			gndVerts[j+2] = 0.0;									// z
			gndVerts[j+3] = 1.0;									// w.
		}
		else {					// put odd-numbered vertices at (+xymax, ynow, 0).
			gndVerts[j  ] = xymax;								// x
			gndVerts[j+1] = -xymax + (v-1)*ygap;	// y
			gndVerts[j+2] = 0.0;									// z
			gndVerts[j+3] = 1.0;									// w.
		}
		gndVerts[j+4] = yColr[0];			// red
		gndVerts[j+5] = yColr[1];			// grn
		gndVerts[j+6] = yColr[2];			// blu
	}

	return gndVerts;
}


function makeSphere(floatsPerVertex) {
	var SPHERE_DIV = 13;

	var i, ai, si, ci;
	var j, aj, sj, cj;
	var p1, p2;

	var positions = [];
	var indices = [];
	var bufferData = [];

	// Generate coordinates
	for (j = 0; j <= SPHERE_DIV; j++) {
		aj = j * Math.PI / SPHERE_DIV;
		sj = Math.sin(aj);
		cj = Math.cos(aj);
		for (i = 0; i <= SPHERE_DIV; i++) {
			ai = i * 2 * Math.PI / SPHERE_DIV;
			si = Math.sin(ai);
			ci = Math.cos(ai);

			positions.push(si * sj);  // X
			positions.push(cj);       // Y
			positions.push(ci * sj);  // Z
			positions.push(1.0);      // W
			//positions.push(Math.random());      // R
			//positions.push(Math.random());			// G
			//positions.push(Math.random());			// B
			// normal components are X,Y,Z again
			positions.push(si * sj);  // X
			positions.push(cj);       // Y
			positions.push(ci * sj);  // Z
			positions.push(1.0);      // W
		}
	}

	for (j = 0; j < SPHERE_DIV; j++) {
		for (i = 0; i < SPHERE_DIV; i++) {
			p1 = j * (SPHERE_DIV+1) + i;
			p2 = p1 + (SPHERE_DIV+1);

			indices.push(p1);
			indices.push(p2);
			indices.push(p1 + 1);

			indices.push(p1 + 1);
			indices.push(p2);
			indices.push(p2 + 1);
		}
	}

	for (i = 0; i < indices.length; i++) {
		for (j = 0; j < floatsPerVertex; j++) {
			bufferData.push(positions[indices[i]*floatsPerVertex + j]);
		}
	}


	var g_sphVertAry = new Float32Array(bufferData);
	return g_sphVertAry;
}


function makeTetrahedron() {
	var c30 = Math.sqrt(0.75);					// == cos(30deg) == sqrt(3) / 2
	var sq2	= Math.sqrt(2.0);
	// for surface normals:
	var sq23 = Math.sqrt(2.0/3.0)
	var sq29 = Math.sqrt(2.0/9.0)
	var sq89 = Math.sqrt(8.0/9.0)
	var thrd = 1.0/3.0;

  var colorShapes = new Float32Array([

/*	Nodes:
		 0.0,	 0.0, sq2, 1.0,			0.0, 	0.0,	1.0,	// Node 0 (apex, +z axis;  blue)
     c30, -0.5, 0.0, 1.0, 		1.0,  0.0,  0.0, 	// Node 1 (base: lower rt; red)
     0.0,  1.0, 0.0, 1.0,  		0.0,  1.0,  0.0,	// Node 2 (base: +y axis;  grn)
    -c30, -0.5, 0.0, 1.0, 		1.0,  1.0,  1.0, 	// Node 3 (base:lower lft; white)
*/

// Face 0: (right side).  Unit Normal Vector: N0 = (sq23, sq29, thrd)
     // Node 0 (apex, +z axis; 			color--blue, 				surf normal (all verts):
          0.0,	 0.0, sq2, 1.0,			sq23,	sq29, thrd, 1.0,
     // Node 1 (base: lower rt; red)
     			c30, -0.5, 0.0, 1.0, 			sq23,	sq29, thrd, 1.0,
     // Node 2 (base: +y axis;  grn)
     			0.0,  1.0, 0.0, 1.0,  		sq23,	sq29, thrd, 1.0,
// Face 1: (left side).		Unit Normal Vector: N1 = (-sq23, sq29, thrd)
		 // Node 0 (apex, +z axis;  blue)
		 			0.0,	 0.0, sq2, 1.0,			-sq23,	sq29, thrd, 1.0,
     // Node 2 (base: +y axis;  grn)
     			0.0,  1.0, 0.0, 1.0,  		-sq23,	sq29, thrd, 1.0,
     // Node 3 (base:lower lft; white)
    			-c30, -0.5, 0.0, 1.0, 		-sq23,	sq29,	thrd, 1.0,
// Face 2: (lower side) 	Unit Normal Vector: N2 = (0.0, -sq89, thrd)
		 // Node 0 (apex, +z axis;  blue)
		 			0.0,	 0.0, sq2, 1.0,			0.0, -sq89,	thrd, 1.0,
    // Node 3 (base:lower lft; white)
    			-c30, -0.5, 0.0, 1.0, 		0.0, -sq89,	thrd, 1.0,         																							//0.0, 0.0, 0.0, // Normals debug
     // Node 1 (base: lower rt; red)
     			c30, -0.5, 0.0, 1.0, 			0.0, -sq89,	thrd, 1.0,
// Face 3: (base side)  Unit Normal Vector: N2 = (0.0, 0.0, -1.0)
    // Node 3 (base:lower lft; white)
    			-c30, -0.5, 0.0, 1.0, 		0.0, 	0.0, -1.0, 1.0,
    // Node 2 (base: +y axis;  grn)
     			0.0,  1.0, 0.0, 1.0,  		0.0, 	0.0, -1.0, 1.0,
    // Node 1 (base: lower rt; red)
     			c30, -0.5, 0.0, 1.0, 			0.0, 	0.0, -1.0, 1.0,
	]);

	return colorShapes;
}


function makeCube() {
	var vertices = new Float32Array([   // Coordinates
		 1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0, // v0-v1-v2-v3 front
		 1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0, // v0-v3-v4-v5 right
		 1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
		-1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0, // v1-v6-v7-v2 left
		-1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0, // v7-v4-v3-v2 down
		 1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0  // v4-v7-v6-v5 back
	]);


	var colors = new Float32Array([    // Colors
		1, 0, 1,   1, 0, 1,   1, 0, 0,  1, 1, 0,     // v0-v1-v2-v3 front
		1, 0, 0,   1, 0, 0,   1, 0, 1,  1, 0, 1,     // v0-v3-v4-v5 right
		1, 0, 0,   1, 0, 1,   1, 0, 1,  1, 1, 0,     // v0-v5-v6-v1 up
		1, 0, 1,   1, 0, 0,   1, 0, 0,  1, 0, 1,     // v1-v6-v7-v2 left
		1, 0, 0,   1, 0, 1,   1, 1, 0,  1, 0, 0,     // v7-v4-v3-v2 down
		1, 0, 1,   1, 0, 0,   1, 0, 0,  1, 0, 0　    // v4-v7-v6-v5 back
 	]);


	var normals = new Float32Array([    // Normal
		0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
		1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
		0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
	 -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
		0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
		0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
	]);


	// Indices of the vertices
	var indices = new Uint8Array([
		 0, 1, 2,   0, 2, 3,    // front
		 4, 5, 6,   4, 6, 7,    // right
		 8, 9,10,   8,10,11,    // up
		12,13,14,  12,14,15,    // left
		16,17,18,  16,18,19,    // down
		20,21,22,  20,22,23     // back
 	]);

	var vertCount = vertices.length;
	var bufferData = [];

	for(i = 0; i < indices.length; i++) {
		bufferData.push(vertices[indices[i]*3 + 0]); // X
		bufferData.push(vertices[indices[i]*3 + 1]); // Y
		bufferData.push(vertices[indices[i]*3 + 2]); // Z
		bufferData.push(1.0);													// W
		bufferData.push(normals[indices[i]*3 + 0]);    // X
		bufferData.push(normals[indices[i]*3 + 1]);		// Y
		bufferData.push(normals[indices[i]*3 + 2]);		// Z
		bufferData.push(1.0);													// W
	}

	var g_cube = new Float32Array(bufferData);
	return g_cube;

}


function makeSphereColored(floatsPerVertex) {
	var SPHERE_DIV = 13; //default: 13.  JT: try others: 11,9,7,5,4,3,2,

	var i, ai, si, ci;
	var j, aj, sj, cj;
	var p1, p2;

	var positions = [];
	var indices = [];
	var bufferData = [];

	// Generate coordinates
	for (j = 0; j <= SPHERE_DIV; j++) {
		aj = j * Math.PI / SPHERE_DIV;
		sj = Math.sin(aj);
		cj = Math.cos(aj);
		for (i = 0; i <= SPHERE_DIV; i++) {
			ai = i * 2 * Math.PI / SPHERE_DIV;
			si = Math.sin(ai);
			ci = Math.cos(ai);

			positions.push(si * sj);  // X
			positions.push(cj);       // Y
			positions.push(ci * sj);  // Z
			positions.push(1.0);      // W
			positions.push(Math.random());      // R
			positions.push(Math.random());			// G
			positions.push(Math.random());			// B
			// normal components are X,Y,Z again
		}
	}

	for (j = 0; j < SPHERE_DIV; j++) {
		for (i = 0; i < SPHERE_DIV; i++) {
			p1 = j * (SPHERE_DIV+1) + i;
			p2 = p1 + (SPHERE_DIV+1);

			indices.push(p1);
			indices.push(p2);
			indices.push(p1 + 1);

			indices.push(p1 + 1);
			indices.push(p2);
			indices.push(p2 + 1);
		}
	}

	for (i = 0; i < indices.length; i++) {
		for (j = 0; j < floatsPerVertex; j++) {
			bufferData.push(positions[indices[i]*floatsPerVertex + j]);
		}
	}

	var g_sphVertAry = new Float32Array(bufferData);
	return g_sphVertAry;
}
