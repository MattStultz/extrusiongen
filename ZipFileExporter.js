/**
 * This script requires jszip.js
 *
 * @author Ikaros Kappler
 * @date 2013-09-05
 * @version 1.0.0
 **/

ZipFileExporter = {

    _build_export_data: function() {

	    // Build a geometry-array
	//var geoms = [];
	//var meshes = getPreviewMeshes();
	//	for( var i = 0; i < meshes.length; i++ ) {
	//geoms[i] = meshes[i].geometry;
	//}
	
	var msh = getPreviewMeshes();

	return { 
	    //geometry:          getPreviewMesh().geometry,
	    meshes:              msh,
	    bezierPath:          getBezierPath(),
	    meshSettings:      {
		shapeSegments:     document.forms[ "mesh_form" ].elements[ "shape_segments" ].value,
		pathSegments:      document.forms[ "mesh_form" ].elements[ "path_segments" ].value,
		bendAngle:         document.forms[ "mesh_form" ].elements[ "preview_bend" ].value,
		buildNegativeMesh: document.forms[ "mesh_form" ].elements[ "build_negative_mesh" ].checked,
		meshHullStrength:  document.forms[ "mesh_form" ].elements[ "mesh_hull_strength" ].value,
		closePathBegin:    document.forms[ "mesh_form" ].elements[ "mesh_close_path_begin" ].checked,
		closePathEnd:      document.forms[ "mesh_form" ].elements[ "mesh_close_path_end" ].checked,
		wireframe:         document.forms[ "mesh_form" ].elements[ "wireframe" ].checked,
		triangulate:       document.forms[ "mesh_form" ].elements[ "triangulate" ].checked
	    },
	    compress:          document.forms[ "zip_form" ].elements[ "compress_zip" ].checked
	}; // END object
    }, // END function


    /**
     * data must be an object with the members
     *  - geometries (a THREE.js geometry array)
     *  - bezierPath
     *  - meshSettings { shapeSegments, 
     *                   pathSegments, 
     *                   bendAngle, 
     *                   buildNegativeMesh, 
     *                   meshHullStrength, 
     *                   closePathBegin, 
     *                   closePathEnd, 
     *                   wireframe, 
     *                   triangulate } 
     **/
    exportZipFile: function( filename, data ) {

	// Data passed?
	data = data || ZipFileExporter._build_export_data();


	// OK, also allow to pass a single geometry ... for downward compatibility.
	//if( data.geoy && !data.geometries )
	//    data.geometries = [ data.geometry ];


	// Convert THREE.js geometry (object) to STL (string)
	//var stlData = STLBuilder.buildSTL( data.geometry );
	var stlData = STLBuilder.buildSTLFromMeshArray( data.meshes ); 

	var zip = new JSZip();
	
	// Remember: btoa() converts string data to base64, 
	//           atob() converts base64 data to string.

	/*
	stringData = "{ test: \"true\" }";
	zip.file( "test.json",
		  stringData,
		  { base64: false,
		    binary: false,
		    type: "application/json"
		  }
		);
	*/

	// Add STL model to zip
	zip.file( "model.stl",
		  stlData,
		  { base64: false,
		    binary: false,
		    type: "application/sla"
		  }
		);
	
	// Add bezier path (JSON) to zip
	var bezierJSON = data.bezierPath.toJSON( true );
	//window.alert( bezierJSON );
	zip.file( "shape.bezierpath.json",
		  bezierJSON,
		  { base64: false,
		    binary: false,
		    type: "application/json"
		  }
		);

	// Add mesh settings (JSON) to zip
	var meshSettingsJSON = JSON.stringify( data.meshSettings, null, "\t" );
	//window.alert( meshSettingsJSON );
	zip.file( "mesh_settings.json",
		  meshSettingsJSON,
		  { base64: false,
		    binary: false,
		    type: "application/json"
		  }
		);
	

	// The generate-function returns a base64 string
	var zipData = zip.generate( { type: "base64", 
				      compression: ( data.compress ? "DEFLATE" : "STORE" )
				    } ); 
	//window.alert( "zipData=" + zipData );

	// This is one possibilty to send binary data: base64-encoded
	// inside the window location. 
	// Problem 1: this does not support a preset download file name!
	// Problem 2: what about the location max length constraint???
	//location.href="data:application/zip;base64,"+zipData;
	
	// This is a better way:
	//  use the browser built-in saveAs function.
	var uintArray = Base64Binary.decode(zipData);  
	var blob = new Blob( [uintArray], // [atob(zipData)], 
			     {type: "application/zip"}
			   );
	window.saveAs(blob, filename);

    } // END function

} // END ZipFileExporter