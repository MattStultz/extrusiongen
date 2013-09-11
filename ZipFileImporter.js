/**
 * @author Ikaros Kappler
 * @date 2013-09-11
 * @version 1.0.0
 **/



ZipFileImporter = {

    _apply_mesh_settings: function( meshSettings ) {

	/*
	return { 
	    geometry:          getPreviewMesh().geometry,
	    bezierPath:        getBezierPath(),
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
	*/
	
	if( meshSettings.shapeSegments )
	    document.forms[ "mesh_form" ].elements[ "shape_segments" ].value = meshSettings.shapeSegments;

	if( meshSettings.pathSegment )
	    document.forms[ "mesh_form" ].elements[ "path_segments" ].value = meshSettings.pathSegments;

	if( typeof meshSettings.bendAngle != "undefined" ) // || meshSettings.bendAngle == 0 )
	    document.forms[ "mesh_form" ].elements[ "preview_bend" ].value = meshSettings.bendAngle;
	else
	    document.forms[ "mesh_form" ].elements[ "preview_bend" ].value = 0;

	
	if( meshSettings.buildNegativeMesh )
	    document.forms[ "mesh_form" ].elements[ "build_negative_mesh" ].checked = "checked";
	else
	    document.forms[ "mesh_form" ].elements[ "build_negative_mesh" ].checked = false;

	if( typeof meshSettings.meshHullStrength != "undefined" )
	    document.forms[ "mesh_form" ].elements[ "mesh_hull_strength" ].value = meshSettings.meshHullStrength;

	if( meshSettings.closePathBegin )
	    document.forms[ "mesh_form" ].elements[ "mesh_close_path_begin" ].checked = "checked";
	else
	    document.forms[ "mesh_form" ].elements[ "mesh_close_path_begin" ].checked = false;

	if( meshSettings.closePathEnd )
	    document.forms[ "mesh_form" ].elements[ "mesh_close_path_end" ].checked = "checked";
	else
	    document.forms[ "mesh_form" ].elements[ "mesh_close_path_end" ].checked = false;

	if( meshSettings.wireframe )
	    document.forms[ "mesh_form" ].elements[ "wireframe" ].checked = "checked";
	else
	    document.forms[ "mesh_form" ].elements[ "wireframe" ].checked = false;

	if( meshSettings.triangulate )
	    document.forms[ "mesh_form" ].elements[ "triangulate" ].checked = "checked";
	else
	    document.forms[ "mesh_form" ].elements[ "triangulate" ].checked = false;

	
	return false;
    },

    importZipFile: function( inputFileElement ) {

	//window.alert( JSON.stringify(inputFileElement) );
	//window.alert( "FileReader=" + FileReader + ", type=" + (typeof FileReader) );

	if( typeof FileReader == "undefined" || !inputFileElement.files ) {

	    window.alert( "Your browser does not support the HTML5 file API!" );
	    return;

	}
	
	if( inputFileElement.files.length == 0 ) {

	    window.alert( "Please select a file." );
	    return;

	}

	// window.alert( inputFileElement.files[0] );
	
	var json_file = inputFileElement.files[ 0 ];  
	var reader = new FileReader();
	reader.onload = function( e ) {

	    //window.alert( "File uploaded. Value=" + e.target.result );
	    try {
		//var bezierPath = IKRS.BezierPath.fromJSON( e.target.result );
		//setBezierPath( bezierPath );
		

		var zip              = new JSZip( e.target.result );
		
		//window.alert( zip );
		var shapedPathFile   = zip.file( "shape.bezierpath.json" );
		var meshSettingsFile = zip.file( "mesh_settings.json" );

		if( !shapedPathFile ) {

		    window.alert( "The passed zip file does not contain the 'shape.bezierpath.json' file." );
		    return false;

		}

		if( !meshSettingsFile ) {

		    window.alert( "The passed zip file does not contain the 'mesh_settings.json' file." );
		    return false;

		}
		    

		// Prepare variables
		var bezierPath   = null;
		var meshSettings = null;
		
		//window.alert( "shapedPathFile=" + shapedPathFile + ", meshSettingsFile=" + meshSettingsFile );
		
		// Parse bezier path
		try {
		    bezierPath = IKRS.BezierPath.fromJSON( shapedPathFile.asText() );		    
		} catch( e ) {
		    window.alert( "Error: " + e );
		    return false;
		}
		
		
		// Parse mesh settings
		try {
		    meshSettings = JSON.parse( meshSettingsFile.asText() );
		} catch( e ) {
		    window.alert( "Error: " + e );
		    return false;
		}

		// Apply path
		setBezierPath( bezierPath );
		
		// Apply settings
		ZipFileImporter._apply_mesh_settings( meshSettings );
		
		// Rebuild model with new settings
		preview_rebuild_model();

		//window.alert( "meshSettings=" + JSON.stringify(meshSettings) );

	    } catch( e ) {
		window.alert( "Error: " + e );
	    }
	    
	    /*
	    // Send to server?
	    var xhr = new XMLHttpRequest();
	    xhr.onreadystatechange = function() {

	    };
	    xhr.open( "POST", "ajax_file_uploader.php" );
	    xhr.setRequestHeader( "Content-Type", "application/x-www-form-urlencoded" );
	    xhr.send( "file=" + uncodeURIComponent(e.target.result) );
	    */
	    
	};
	reader.onprogress = function( e ) {
	    // NOOP
	    // (display progress?)
	};
	reader.onerror = function( e ) {
	    window.alert( "File upload error (code=" + e.target.error.code+")." );
	};
	reader.readAsBinaryString( json_file );

    }


};