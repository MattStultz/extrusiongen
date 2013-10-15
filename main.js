
/**
 * @author Ikaros Kappler
 * @date 2013-10-13
 * @version 1.0.0
 **/

  /**
   * ...
   **/
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




function mouseWheelHandler( e ) {
  
  //this.previewCanvasHandler.handleMouseWheelEvent( e );
  
  var delta = 0;
  if (!e) /* For IE. */
    e = window.event;
  if (e.wheelDelta) { /* IE/Opera. */
    delta = e.wheelDelta/120;
  } else if (e.detail) { /** Mozilla case. */
    /** In Mozilla, sign of delta is different than in IE.
     * Also, delta is multiple of 3.
     */
    delta = -e.detail/3;
  }
  /** If delta is nonzero, handle it.
   * Basically, delta is now positive if wheel was scrolled up,
   * and negative, if wheel was scrolled down.
   */
  if (delta) {
    
    if( delta < 0 )
      decreaseZoomFactor( true ); // redraw
    else
      increaseZoomFactor( true ); // redraw
    

  }
  /** Prevent default actions caused by mouse wheel.
   * That might be ugly, but we handle scrolls somehow
   * anyway, so don't bother here..
   */
  if (e.preventDefault)
    e.preventDefault();
  e.returnValue = false;

}



// Install a mouse wheel listener
if( window.addEventListener ) {

  // For Mozilla 
  window.addEventListener( 'DOMMouseScroll', mouseWheelHandler, false );
}
    
// IE and Opera
window.onmousewheel = document.onmousewheel = mouseWheelHandler;
// window.previewCanvasHandler = this;



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
	var filename      = document.forms['stl_form'].elements['stl_filename'].value;
	var merge_meshes  = document.forms["stl_form"].elements["stl_merge_meshes"].checked;
	
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


