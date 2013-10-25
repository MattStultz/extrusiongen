
/**
 * @author Ikaros Kappler
 * @date 2013-10-13
 * @version 1.0.0
 **/

function createHumanReadableTimestamp() {

    // Append the current date to the output filename values
    var curDate = new Date();
    //var ts      = curDate.toString( "yyyy-MM-dd H-i" );
    var ts        = "" +
	curDate.getFullYear() +
	"-" +
	(curDate.getMonth()+1) +  // months start at 0
	"-" +
	curDate.getDate() +
	"_" +
	curDate.getHours() + 
	"." +
	curDate.getMinutes() +
	"." +
	curDate.getSeconds();

    return ts;
}

function getDefaultBezierJSON() {
    return "[ { \"startPoint\" : [-122,77.80736634304651], \"endPoint\" : [-65.59022229786551,21.46778533702511], \"startControlPoint\": [-121.62058129515852,25.08908859418696], \"endControlPoint\" : [-79.33419353770395,48.71529293460728] }, { \"startPoint\" : [-65.59022229786551,21.46778533702511], \"endPoint\" : [-65.66917273472913,-149.23537680826058], \"startControlPoint\": [-52.448492057756646,-4.585775770903305], \"endControlPoint\" : [-86.1618869001374,-62.11613821618976] }, { \"startPoint\" : [-65.66917273472913,-149.23537680826058], \"endPoint\" : [-61.86203591980055,-243.8368165606738], \"startControlPoint\": [-53.701578771473564,-200.1123697454778], \"endControlPoint\" : [-69.80704300441666,-205.36451303641783] }, { \"startPoint\" : [-61.86203591980055,-243.8368165606738], \"endPoint\" : [-21.108966092052256,-323], \"startControlPoint\": [-54.08681426887413,-281.486963896856], \"endControlPoint\" : [-53.05779349623559,-323] } ]";
}

function onloadHandler() {
    
    // Append the current date to the output filename values
/*
    var curDate = new Date();
    //var ts      = curDate.toString( "yyyy-MM-dd H-i" );
    var ts        = "" +
	curDate.getFullYear() +
	"-" +
	(curDate.getMonth()+1) +  // months start at 0
	"-" +
	curDate.getDate() +
	"_" +
	curDate.getHours() + 
	"." +
	curDate.getMinutes() +
	"." +
	curDate.getSeconds();
	
    
    //window.alert( ts );
    document.forms[ "stl_form" ].elements[ "stl_filename" ].value = "my_extrusion_" + ts + ".stl";
    document.forms[ "zip_form" ].elements[ "zip_filename" ].value = "settings_" + ts + ".zip";
    */
}

// IE < v9 does not support this function.
if( window.addEventListener ) {
    window.addEventListener( "load",
			     onloadHandler,
			     false
			   );
} else {
    window.onload = onloadHandler;}




function getPreviewMeshes() {
    //return preview_mesh;
    //return previewCanvasHandler.preview_mesh;
    return previewCanvasHandler.getMeshes();
}

function bezier_undo() {
    var hasMoreUndoSteps = this.bezierCanvasHandler.undo();
    
    window.alert( this.bezierCanvasHandler.undoHistory._toString() );
    
    //document.getElementById( "bezier_undo" ).disabled = !hasMoreUndoSteps;
}

function bezier_redo() {
    var hasMoreRedoteps = this.bezierCanvasHandler.redo();
    //document.getElementById( "bezier_redo" ).disabled = !hasMoreRedoSteps;
}

function setBezierPath( bezierPath ) {
    //this.bezierCanvasHandler.bezierPath = bezierPath;
    
    this.bezierCanvasHandler.setBezierPath( bezierPath );
    //addToBezierUndoHistory( bezierPath );
    //this.bezierCanvasHandler.redraw();

    
    
    preview_rebuild_model();
}

function getBezierPath() {
    return this.bezierCanvasHandler.bezierPath;
}

this.bezierCanvasHandler = new IKRS.BezierCanvasHandler();




var previewCanvasHandler = new IKRS.PreviewCanvasHandler( this.bezierCanvasHandler,
							  512, 
							  768 
							  );

previewCanvasHandler.preview_rebuild_model();
// previewCanvasHandler.preview_camera.position.z = 500;



function preview_render() {
  
  // Recursive call
  requestAnimationFrame( this.preview_render ); 
  previewCanvasHandler.render( this.preview_scene, 
			       this.preview_camera 
			       ); 
}

function decreaseZoomFactor( redraw ) {
    this.previewCanvasHandler.decreaseZoomFactor();
    if( redraw )
	preview_render();
}

function increaseZoomFactor( redraw ) {
    this.previewCanvasHandler.increaseZoomFactor();
    if( redraw )
	preview_render();
}

function increase_mesh_details() {
	var shape_segments = this.document.forms["mesh_form"].elements["shape_segments"].value;
	var path_segments  = this.document.forms["mesh_form"].elements["path_segments"].value;		
			
	shape_segments     = parseInt( shape_segments );
	path_segments      = parseInt( path_segments );
			
	shape_segments     = Math.ceil( shape_segments * 1.2 );
	path_segments      = Math.ceil( path_segments  * 1.2 );
			
	this.document.forms["mesh_form"].elements["shape_segments"].value = shape_segments;
	this.document.forms["mesh_form"].elements["path_segments"].value  = path_segments;
			
	preview_rebuild_model();
}

function decrease_mesh_details() {

	var shape_segments = this.document.forms["mesh_form"].elements["shape_segments"].value;
	var path_segments  = this.document.forms["mesh_form"].elements["path_segments"].value;		
			
	shape_segments     = parseInt( shape_segments );
	path_segments      = parseInt( path_segments );
			
	shape_segments     = Math.max( 3, Math.floor( shape_segments / 1.2 ) );
	path_segments      = Math.max( 2, Math.floor( path_segments  / 1.2 ) );

        if( shape_segments < 3 && path_segments < 2 )
	    return; // No change
			
	this.document.forms["mesh_form"].elements["shape_segments"].value = shape_segments;
	this.document.forms["mesh_form"].elements["path_segments"].value  = path_segments;
			
	preview_rebuild_model();

}

function preview_rebuild_model() {
  this.previewCanvasHandler.preview_rebuild_model();
}


window.onload = preview_render;


function newScene() {
    
    
    var defaultSettings = {
	shapeSegments:     80,
	pathSegments:      80,
	bendAngle:         0,
	buildNegativeMesh: false,
	meshHullStrength:  0,
	closePathBegin:    false,
	closePathEnd:      true,
	wireframe:         false,
	triangulate:       true
    };

    ZipFileImporter._apply_mesh_settings( defaultSettings );


    var json = getDefaultBezierJSON();
    try {
	bezierPath = IKRS.BezierPath.fromJSON( json );		    
    } catch( e ) {
	window.alert( "Error: " + e );
	return false;
    }

    setBezierPath( bezierPath );

    preview_rebuild_model();
}

function saveShape() {

    saveTextFile( bezierCanvasHandler.bezierPath.toJSON(), 'bezier_shape.json', 'application/json' );

}

function loadShape() {
    upload_bezier_json_file( document.forms['bezier_file_upload_form'].elements['bezier_json_file'] );
}

function exportZIP() {
    //var zip_filename = document.forms['zip_form'].elements['zip_filename'].value;
    var zip_filename = "settings_" + createHumanReadableTimestamp() + ".zip";
    ZipFileExporter.exportZipFile( zip_filename );
}

function importZIP() {
    var zip_filename = document.forms['zip_import_form'].elements['zip_upload_file'];
    if( zip_filename )
	ZipFileImporter.importZipFile( zip_filename );
}


function debug() {
    window.alert( 
	"camera.ikrsSettings.rotation=" + JSON.stringify(this.previewCanvasHandler.preview_camera.ikrsSettings.rotation) + ",\n" + 
	    "camera.ikrsSettings.position=" + JSON.stringify(this.previewCanvasHandler.preview_camera.ikrsSettings.position) + ",\n" +
	    "camera.rotation=" + JSON.stringify(this.previewCanvasHandler.preview_camera.rotation) + ",\n" +
	    "camera.position=" + JSON.stringify(this.previewCanvasHandler.preview_camera.position) + "\n"
    );
}


var divisibleSTLBuilder = null;
function exportSTL() {

    if( !divisibleSTLBuilder ) { 
	
	var meshes        = getPreviewMeshes();
	var filename      = null;
	if( document.forms['stl_form'].elements['stl_filename'] )
	    filename =  document.forms['stl_form'].elements['stl_filename'].value;
	else
	    filename = "mesh.stl";

	var merge_meshes  = false;
	if( document.forms["stl_form"] &&
	    document.forms["stl_form"].elements["stl_merge_meshes"] &&
	    document.forms["stl_form"].elements["stl_merge_meshes"].checked ) {

	    merge_meshes = true;
	}
	
	// Init the divisible STL builder
	divisibleSTLBuilder = new IKRS.DivisibleSTLBuilder( meshes,
							    filename,
							    function( e ) { },
							    1024*128,    // 128 kB chunks,
							    this.bezierCanvasHandler.getMillimeterPerUnit(),
							    !merge_meshes        // export as single mesh?
							  );
	
	showLoadingBar( "exportSTL_cancelHandler()" );

    }
    
    if( divisibleSTLBuilder.isInterrupted() ) {

	divisibleSTLBuilder = null;
	hideLoadingBar();
	return;

    }

    //console.log( "Next chunk (" + divisibleSTLBuilder.chunkResults.length + ")." );
    displayProcessState( divisibleSTLBuilder.getProcessedChunkCount(),
			 divisibleSTLBuilder.getProjectedChunkCount() 
		       );

    var hasNextChunk = divisibleSTLBuilder.processNextChunk();
    
    if( hasNextChunk ) 
	window.setTimeout( "exportSTL();", 100 );
    else {
	
	//window.alert( "Finished. " + divisibleSTLBuilder.chunkResults.length + " chunks calculated." );
	displayProcessState( divisibleSTLBuilder.getProcessedChunkCount(), 
			     divisibleSTLBuilder.getProjectedChunkCount() 
			   );
	divisibleSTLBuilder.saveSTLResult();
	divisibleSTLBuilder = null;
	
	hideLoadingBar();

    }
    
}

function exportSTL_cancelHandler() {
    if( divisibleSTLBuilder ) {
	
	//messageBox.show( "<br/><br/>Interrupted ...<br/><br/>Please wait for process to terminate.<br/>\n" );
	divisibleSTLBuilder.interrupt();	
	
    }
}

/**
 * This script adds the message box/layer to the DOM and initializes
 * the process listener.
 **/

var messageBox = new IKRS.MessageBox( "message_layer" );
/*
messageBox.getBlanket().addEventListener( "mousedown",
                                          function() { messageBox.hide(); 
                                                       stopLoadingAnimation(); 
                                          }
);
*/

function displayProcessState( currentStep, maxStep ) {
    var pct = ( (1.0 * currentStep) / maxStep ) * 100;
    pct = pct.toFixed( 2 );
    document.getElementById( "process_div" ).innerHTML = "" + currentStep + "/" + maxStep + " [" + pct + "%]";
}

/*
var stlProcessListener = new IKRS.ProcessListener( null,   // startCallback
                                                   null,   // stepCallback
                                                   null,   // terminationCallback
                                                   75      // stepIntervalLength
                                                 );
stlProcessListener.startCallback       = function(x,y) { }; // displayProcessState;
stlProcessListener.stepCallback        = function(x,y) { }; // displayProcessState;
stlProcessListener.terminationCallback = function(x,y) { }; // displayProcessState;
*/



function showLoadingBar( buttonHandler ) {
    
    if( !buttonHandler )
	buttonHandler = "hideLoadingBar()";
    
    messageBox.show( 
        "<br/><br/>Loading ...<br/>\n" +
            "<br/>\n" +
            "<span id=\"loading_span\"></span><br/>\n" +
            "<div id=\"process_div\">X</div><br/>\n" +
            "<br/><button onclick=\"" + buttonHandler + "\"" + (buttonHandler?"":" disabled") + ">Cancel</button>" 
    );

    startLoadingAnimation();

    
    //window.setTimeout( tmp_process, 100 );
}

function hideLoadingBar() {

    // !!! FIX THIS !!!
    // THIS SOMEHOW MAKES THE PROGRESS INDICATOR TO FAIL!
    //stopLoadingAnimation();
    
    
     messageBox.hide();
}

/*
function tmp_process() {
    var maxSteps = 65535;
    stlProcessListener.reportStart( maxSteps );
    for( var i = 0; i < maxSteps; i++ ) {

 	 stlProcessListener.reportCurrentStep( i );

	 delay( 10 ); 
    }
    stlProcessListener.reportTemination();		
}

function delay( ms ) {
	 var startTime = new Date().getTime();
         var currentTime;
	 var delay;
         do {
	       currentTime = new Date().getTime();
               delay       = currentTime - startTime;
               // NOOP
               console.log( "startTime=" + startTime + ", currentTime=" + currentTime + ", delay=" + delay  );
         } while( delay < ms );
}
*/

var loadingAnimationKey = null;
var loadingAnimationElements = [ '|', '/', '&ndash;', '\\' ];
var loadingAnimationPointer  = 0;
function startLoadingAnimation() {
      if( !loadingAnimationKey )
          loadingAnimationKey = window.setInterval( "startLoadingAnimation();", 250 );

      document.getElementById("loading_span").innerHTML = loadingAnimationElements[loadingAnimationPointer];
      //displayProcessState( stlProcessListener.getCurrentStep(), stlProcessListener.getTotalStepCount() );
      loadingAnimationPointer = (loadingAnimationPointer + 1) % loadingAnimationElements.length;
}



function stopLoadingAnimation() {
      if( loadingAnimationKey )
           window.clearInterval( loadingAnimationKey );

      loadingAnimationKey;
}


