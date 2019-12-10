//		lights.js
//		based on:
//		 	J. Tumblin, Northwestern University EECS Dept.

var LightsT = function() {
//===============================================================================
// Constructor function:
	var I_pos = new Vector4();	// x,y,z,w:   w==1 for local 3D position,
															// w==0 for light at infinity in direction (x,y,z)
	var isLit = true;						// true/false for ON/OFF
	var I_ambi = new Vector3();		// ambient illumination: r,g,b
	var I_diff = new Vector3();		// diffuse illumination: r,g,b.
	var I_spec = new Vector3();		// specular illumination: r,g,b.
	//
	var u_pos = false;						// GPU location for 'uniform' that holds I_pos
	var u_ambi = false;						// 																			 I_ambi
	var u_diff = false;						//																			 I_diff
	var u_spec = false;						//																			 I_spec.

	var ambi_isLit = true;
	var diff_isLit = true;
	var spec_isLit = true;

	return {I_pos, isLit, I_ambi, I_diff, I_spec,
	        u_pos,        u_ambi, u_diff, u_spec,
					ambi_isLit, diff_isLit, spec_isLit};
}


const pickr_hac = Pickr.create({
    el: document.getElementById("hac"),
    theme: 'monolith', // or 'monolith', or 'nano'
		lockOpacity: true,
		defaultRepresentation: 'RGBA',
		default: 'rgba(102,102,102,1)',
		appClass: 'pickerextra',
    swatches: [
        'rgba(244, 67, 54, 1)',
        'rgba(233, 30, 99, 1)',
        'rgba(156, 39, 176, 1)',
        'rgba(103, 58, 183, 1)',
        'rgba(63, 81, 181, 1)',
        'rgba(33, 150, 243, 1)',
        'rgba(3, 169, 244, 1)',
        'rgba(0, 188, 212, 1)',
        'rgba(0, 150, 136, 1)',
        'rgba(76, 175, 80, 1)',
        'rgba(139, 195, 74, 1)',
        'rgba(205, 220, 57, 1)',
        'rgba(255, 235, 59, 1)',
        'rgba(255, 193, 7, 1)'
    ],
    components: {
        preview: true,
        opacity: false,
        hue: true,
        interaction: {
            hex: false,
            rgba: true,
            hsla: false,
            hsva: false,
            cmyk: false,
            input: true,
            clear: false,
            save: true
        }
    }
});

const pickr_hdc = Pickr.create({
    el: document.getElementById("hdc"),
    theme: 'monolith', // or 'monolith', or 'nano'
		lockOpacity: true,
		defaultRepresentation: 'RGBA',
		default: 'rgba(255,255,255,1)',
		appClass: 'pickerextra',
    swatches: [
        'rgba(244, 67, 54, 1)',
        'rgba(233, 30, 99, 1)',
        'rgba(156, 39, 176, 1)',
        'rgba(103, 58, 183, 1)',
        'rgba(63, 81, 181, 1)',
        'rgba(33, 150, 243, 1)',
        'rgba(3, 169, 244, 1)',
        'rgba(0, 188, 212, 1)',
        'rgba(0, 150, 136, 1)',
        'rgba(76, 175, 80, 1)',
        'rgba(139, 195, 74, 1)',
        'rgba(205, 220, 57, 1)',
        'rgba(255, 235, 59, 1)',
        'rgba(255, 193, 7, 1)'
    ],
    components: {
        preview: true,
        opacity: false,
        hue: true,
        interaction: {
            hex: false,
            rgba: true,
            hsla: false,
            hsva: false,
            cmyk: false,
            input: true,
            clear: false,
            save: true
        }
    }
});


const pickr_hsc = Pickr.create({
    el: document.getElementById("hsc"),
    theme: 'monolith', // or 'monolith', or 'nano'
		lockOpacity: true,
		defaultRepresentation: 'RGBA',
		default: 'rgba(255,255,255,1)',
		appClass: 'pickerextra',
    swatches: [
        'rgba(244, 67, 54, 1)',
        'rgba(233, 30, 99, 1)',
        'rgba(156, 39, 176, 1)',
        'rgba(103, 58, 183, 1)',
        'rgba(63, 81, 181, 1)',
        'rgba(33, 150, 243, 1)',
        'rgba(3, 169, 244, 1)',
        'rgba(0, 188, 212, 1)',
        'rgba(0, 150, 136, 1)',
        'rgba(76, 175, 80, 1)',
        'rgba(139, 195, 74, 1)',
        'rgba(205, 220, 57, 1)',
        'rgba(255, 235, 59, 1)',
        'rgba(255, 193, 7, 1)'
    ],
    components: {
        preview: true,
        opacity: false,
        hue: true,
        interaction: {
            hex: false,
            rgba: true,
            hsla: false,
            hsva: false,
            cmyk: false,
            input: true,
            clear: false,
            save: true
        }
    }
});

const pickr_wac = Pickr.create({
    el: document.getElementById("wac"),
    theme: 'monolith', // or 'monolith', or 'nano'
		lockOpacity: true,
		defaultRepresentation: 'RGBA',
		default: 'rgba(102,102,102,1)',
		appClass: 'pickerextra',
    swatches: [
        'rgba(244, 67, 54, 1)',
        'rgba(233, 30, 99, 1)',
        'rgba(156, 39, 176, 1)',
        'rgba(103, 58, 183, 1)',
        'rgba(63, 81, 181, 1)',
        'rgba(33, 150, 243, 1)',
        'rgba(3, 169, 244, 1)',
        'rgba(0, 188, 212, 1)',
        'rgba(0, 150, 136, 1)',
        'rgba(76, 175, 80, 1)',
        'rgba(139, 195, 74, 1)',
        'rgba(205, 220, 57, 1)',
        'rgba(255, 235, 59, 1)',
        'rgba(255, 193, 7, 1)'
    ],
    components: {
        preview: true,
        opacity: false,
        hue: true,
        interaction: {
            hex: false,
            rgba: true,
            hsla: false,
            hsva: false,
            cmyk: false,
            input: true,
            clear: false,
            save: true
        }
    }
});

const pickr_wdc = Pickr.create({
    el: document.getElementById("wdc"),
    theme: 'monolith', // or 'monolith', or 'nano'
		lockOpacity: true,
		defaultRepresentation: 'RGBA',
		default: 'rgba(255,255,255,1)',
		appClass: 'pickerextra',
    swatches: [
        'rgba(244, 67, 54, 1)',
        'rgba(233, 30, 99, 1)',
        'rgba(156, 39, 176, 1)',
        'rgba(103, 58, 183, 1)',
        'rgba(63, 81, 181, 1)',
        'rgba(33, 150, 243, 1)',
        'rgba(3, 169, 244, 1)',
        'rgba(0, 188, 212, 1)',
        'rgba(0, 150, 136, 1)',
        'rgba(76, 175, 80, 1)',
        'rgba(139, 195, 74, 1)',
        'rgba(205, 220, 57, 1)',
        'rgba(255, 235, 59, 1)',
        'rgba(255, 193, 7, 1)'
    ],
    components: {
        preview: true,
        opacity: false,
        hue: true,
        interaction: {
            hex: false,
            rgba: true,
            hsla: false,
            hsva: false,
            cmyk: false,
            input: true,
            clear: false,
            save: true
        }
    }
});


const pickr_wsc = Pickr.create({
    el: document.getElementById("wsc"),
    theme: 'monolith', // or 'monolith', or 'nano'
		lockOpacity: true,
		defaultRepresentation: 'RGBA',
		default: 'rgba(255,255,255,1)',
		appClass: 'pickerextra',
    swatches: [
        'rgba(244, 67, 54, 1)',
        'rgba(233, 30, 99, 1)',
        'rgba(156, 39, 176, 1)',
        'rgba(103, 58, 183, 1)',
        'rgba(63, 81, 181, 1)',
        'rgba(33, 150, 243, 1)',
        'rgba(3, 169, 244, 1)',
        'rgba(0, 188, 212, 1)',
        'rgba(0, 150, 136, 1)',
        'rgba(76, 175, 80, 1)',
        'rgba(139, 195, 74, 1)',
        'rgba(205, 220, 57, 1)',
        'rgba(255, 235, 59, 1)',
        'rgba(255, 193, 7, 1)'
    ],
    components: {
        preview: true,
        opacity: false,
        hue: true,
        interaction: {
            hex: false,
            rgba: true,
            hsla: false,
            hsva: false,
            cmyk: false,
            input: true,
            clear: false,
            save: true
        }
    }
});
