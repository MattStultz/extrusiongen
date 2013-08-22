/**
 * @author Ikaros Kappler
 * @date 2013-08-14
 * @version 1.0.0
 **/

IKRS.BezierCanvasHandler = function() {

    IKRS.Object.call( this );
    
    // These are MouseEvent locations
    this.latestMouseDownPosition;
    this.latestMouseDragPosition;
    this.latestMouseDownTime = null; // ms
    
    //this.latestClickPosition;
    this.latestClickTime = null;

    this.currentDragPoint;
    this.currentDraggedPointIndex;

    this.selectedPointIndices = [];

    var draggedCurveIndex = -1;
    var draggedPointID    = -1;

    var canvas_width  = 512;
    var canvas_height = 768;

    this.canvasWidth  = canvas_width;
    this.canvasHeight = canvas_height;

    this.canvas       = document.getElementById("bezier_canvas");
    this.context      = this.canvas.getContext( "2d" );
    

    this.canvas.onmousedown = this.mouseDownHandler;
    this.canvas.onmouseup   = this.mouseUpHandler;
    this.canvas.onmousemove = this.mouseMoveHandler; 

    /*
      // This is the normal way (constructor) to create a new bezier path
    var pathPoints = [];
    pathPoints.push( new THREE.Vector2( -200, 200 ) );
    pathPoints.push( new THREE.Vector2( 0, 40 ) );
    pathPoints.push( new THREE.Vector2( 200, -130 ) );
    this.bezierPath = new IKRS.BezierPath( pathPoints ); 
    */

    // This is a new way: build from a JSON string
    /*
      var jsonString = "[ { \"startPoint\" : [-113,73], \"endPoint\" : [-58.454814814814796,4.460592592592583], \"startControlPoint\": [-110,13], \"endControlPoint\" : [-67.28766869253815,33.77964111961321] }, { \"startPoint\" : [-58.454814814814796,4.460592592592583], \"endPoint\" : [-41,-136], \"startControlPoint\": [-51.31974300727449,-19.222977798698675], \"endControlPoint\" : [-107.4320266593341,-79.6267965414431] }, { \"startPoint\" : [-41,-136], \"endPoint\" : [-2,-323], \"startControlPoint\": [-0.12927125352024404,-170.6822763505299], \"endControlPoint\" : [-72,-321] } ]";
      */
    var jsonString = "[ { \"startPoint\" : [-122,74], \"endPoint\" : [-57.454814814814796,5.460592592592583], \"startControlPoint\": [-119,14], \"endControlPoint\" : [-66.28766869253815,34.77964111961321] }, { \"startPoint\" : [-57.454814814814796,5.460592592592583], \"endPoint\" : [-47,-136], \"startControlPoint\": [-50.31974300727449,-18.222977798698675], \"endControlPoint\" : [-90.39852870089842,-53.03385508483299] }, { \"startPoint\" : [-47,-136], \"endPoint\" : [-51.66118578883062,-227.750293953586], \"startControlPoint\": [-23.468584251986567,-180.98564599883105], \"endControlPoint\" : [-56.750583998055625,-189.07086756347596] }, { \"startPoint\" : [-51.66118578883062,-227.750293953586], \"endPoint\" : [-2,-323], \"startControlPoint\": [-46.66118578883062,-265.75029395358604], \"endControlPoint\" : [-41,-324] } ]";
    this.bezierPath = IKRS.BezierPath.fromJSON( jsonString );

    //window.alert( "IKRS.BezierCanvashandler.bezierPath=" + this.bezierPath );
    // Store a reverse reference inside the handler so the mousehandlers can access this object
    this.canvas.bezierCanvasHandler = this;
        

    this.redraw();
}


IKRS.BezierCanvasHandler.prototype = new IKRS.Object();
IKRS.BezierCanvasHandler.prototype.constructor = IKRS.BezierCanvasHandler;

IKRS.BezierCanvasHandler.prototype.drawOffset = new THREE.Vector2( 256, 384 );
IKRS.BezierCanvasHandler.prototype.zoomFactor = 1.0;
// 0: start point
// 1: start control point
// 2: end control point
// 3: end point
IKRS.BezierCanvasHandler.prototype.draggedPointID = -1; 

IKRS.BezierCanvasHandler.prototype.increaseZoomFactor = function( redraw ) {
    this.zoomFactor *= 2.0;
    if( redraw )
	this.redraw();
}

IKRS.BezierCanvasHandler.prototype.decreaseZoomFactor = function( redraw ) {
    this.zoomFactor /= 2.0;
    if( redraw )
	this.redraw();
}

IKRS.BezierCanvasHandler.prototype.redraw = function() {

    // Clear screen?
    if( document.forms["bezier_form"].elements["clear_on_repaint"].checked ) {

	this.context.fillStyle = "#FFFFFF";
	this.context.fillRect( 0, 0, 512, 768 );
	
    }

    //window.alert( "drawOffset=(" + this.drawOffset.x + ", " + this.drawOffset.y + ")" );

    // Draw coordinate system (global crosshair)?
    if( document.forms["bezier_form"].elements["draw_coordinate_system"].checked ) {
	this.context.strokeStyle = "#d0d0d0";
	this.context.lineWidth   = 1;
	
	this.context.beginPath();
	this.context.moveTo( this.drawOffset.x, 0 );
	this.context.lineTo( this.drawOffset.x, this.canvasHeight );
	this.context.stroke();
	
	this.context.beginPath();
	this.context.moveTo( 0, this.drawOffset.y );
	this.context.lineTo( this.canvasWidth, this.drawOffset.y );
	this.context.stroke();

    }

    var drawTangents = document.forms["bezier_form"].elements["draw_tangents"].checked;
    
    this.drawBezierPath( this.context, 
			 this.bezierPath, 
			 this.drawOffset,
			 this.zoomFactor,
			 true,          // drawStartPoint
			 true,          // drawEndPoint
			 drawTangents,  // drawStartControlPoint
			 drawTangents,  // drawEndControlPoint
			 
			 drawTangents
		       );


    // Draw the bounding box?
    if( document.forms["bezier_form"].elements["draw_bounding_box"].checked ) {

	var boundingBox = this.bezierPath.getBoundingBox();
	// window.alert( boundingBox.getWidth );
	this.context.strokeStyle = "#888888";
	this.context.lineWidth   = 0.5;
	this.context.strokeRect( boundingBox.xMin * this.zoomFactor + this.drawOffset.x,
				 boundingBox.yMin * this.zoomFactor + this.drawOffset.y,
				 boundingBox.getWidth() * this.zoomFactor,
				 boundingBox.getHeight() * this.zoomFactor
			       );

    }
}

IKRS.BezierCanvasHandler.prototype.drawBezierCurve = function( context,
							       bezierCurve,
							       drawOffset,
							       zoomFactor,
							       drawStartPoint,
							       drawEndPoint,
							       drawStartControlPoint,
							       drawEndControlPoint,
							       
							       drawTangents,
							     
							       startPointIsSelected,
							       endPointIsSelected
							     ) {



    // Draw tangents?
    if( drawTangents ) {

	context.strokeStyle = "#a8a8a8";
	context.lineWidth   = 1;

	// Draw start point tangent
	context.beginPath();
	context.moveTo( bezierCurve.getStartPoint().x * zoomFactor + drawOffset.x,
			bezierCurve.getStartPoint().y * zoomFactor + drawOffset.y
		      );
	context.lineTo( bezierCurve.getStartControlPoint().x * zoomFactor + drawOffset.x,
			bezierCurve.getStartControlPoint().y * zoomFactor + drawOffset.y 
		      );
	context.stroke();

	// Draw end point tangent
	context.beginPath();
	context.moveTo( bezierCurve.getEndPoint().x * zoomFactor + drawOffset.x,
			bezierCurve.getEndPoint().y * zoomFactor + drawOffset.y
		      );
	context.lineTo( bezierCurve.getEndControlPoint().x * zoomFactor + drawOffset.x,
			bezierCurve.getEndControlPoint().y * zoomFactor + drawOffset.y 
		      );
	context.stroke();

    }


    // Draw curve itself
    context.strokeStyle = "#000000";
    context.lineWidth   = 2;
    context.beginPath();
    // window.alert( "Beginning bezier path at: (" + bezierCurve.segmentCache[0].x + ", " + bezierCurve.segmentCache[0].y + ")" );
    context.moveTo( bezierCurve.segmentCache[0].x * zoomFactor + drawOffset.x,
		    bezierCurve.segmentCache[0].y * zoomFactor + drawOffset.y
		  );
    for( var i = 1; i < bezierCurve.segmentCache.length; i++ ) {

	context.lineWidth = 2;
	context.lineTo( bezierCurve.segmentCache[i].x * zoomFactor + drawOffset.x,
			bezierCurve.segmentCache[i].y * zoomFactor + drawOffset.y
		      );	
    }
    context.stroke();


    
    // Draw the end points
    if( drawStartPoint || drawEndPoint ) {
	context.fillStyle = "#B400FF";
	// Start point?
	if( drawStartPoint ) {
	    if( startPointIsSelected ) {
		//context.fillStyle = "#FF0000";
		context.fillRect( bezierCurve.getStartPoint().x * zoomFactor - 2 + drawOffset.x,
				  bezierCurve.getStartPoint().y * zoomFactor - 2 + drawOffset.y,
				  5, 5 );
	    } else {
                //context.fillStyle = "#B400FF";
		context.fillRect( bezierCurve.getStartPoint().x * zoomFactor - 1 + drawOffset.x,
				  bezierCurve.getStartPoint().y * zoomFactor - 1 + drawOffset.y,
				  3, 3 );
	    }
	}
	// End point?
	if( drawEndPoint ) {
	    if( endPointIsSelected ) {
		//context.fillStyle = "#FF0000";
		context.fillRect( bezierCurve.getEndPoint().x * zoomFactor - 2 + drawOffset.x,
				  bezierCurve.getEndPoint().y * zoomFactor - 2 + drawOffset.y,
				  5, 5 );
	    } else {
                //context.fillStyle = "#B400FF";
		context.fillRect( bezierCurve.getEndPoint().x * zoomFactor - 1 + drawOffset.x,
				  bezierCurve.getEndPoint().y * zoomFactor - 1 + drawOffset.y,
				  3, 3 );
	    }
	}
    }

    // Draw the control points?
    if( // document.forms["bezier_form"].elements["draw_tangents"].checked &&
	(drawStartControlPoint || drawEndControlPoint) ) {
	context.fillStyle = "#B8D438";
	// Start control point?
	if( drawStartControlPoint ) {
	    context.fillRect( bezierCurve.getStartControlPoint().x * zoomFactor - 1 + drawOffset.x,
			      bezierCurve.getStartControlPoint().y * zoomFactor - 1 + drawOffset.y,
			      3, 3 );
	}
	// End control point?
	if( drawEndControlPoint ) {
	    context.fillRect( bezierCurve.getEndControlPoint().x * zoomFactor - 1 + drawOffset.x,
			      bezierCurve.getEndControlPoint().y * zoomFactor - 1 + drawOffset.y,
			      3, 3 );
	}
    }
}

IKRS.BezierCanvasHandler.prototype.getBezierPath = function() {
    return this.bezierPath;
}

IKRS.BezierCanvasHandler.prototype.locateCachedBezierPointNearPosition = function( point,
										   tolerance 
										 ) {
    
    //var curveIndex   = -1;
    //var segmentIndex = -1;
    for( var c = 0; c < this.getBezierPath().getCurveCount(); c++ ) {
	
	var bCurve = this.getBezierPath().getCurveAt( c );
	
	for( var s = 0; s < bCurve.segmentCache.length; s++ ) {

	    var tmpPoint = bCurve.segmentCache[ s ];
	    if( this.pointIsNearPosition( tmpPoint,
					  point.x,
					  point.y,
					  tolerance ) ) {

		return [ c, s ];
	    }

	}
    }

    return [ -1, -1 ];
}

IKRS.BezierCanvasHandler.prototype.pointIsNearPosition = function( point,
								   x, 
								   y,
								   tolerance ) {

    var distance = Math.sqrt( Math.pow(point.x-x,2) + Math.pow(point.y-y,2) );

    //window.alert( "point=(" + point.x + ", " + point.y + "), x=" + x + ", y=" + y + ", tolerance=" + tolerance + ", distance=" + distance );

    return ( distance <= tolerance );

}

IKRS.BezierCanvasHandler.prototype.translateMouseEventToRelativePosition = function( parent,
										     e ) {
    var rect = parent.getBoundingClientRect();
    var left = e.clientX - rect.left - parent.clientLeft + parent.scrollLeft;
    var top  = e.clientY - rect.top  - parent.clientTop  + parent.scrollTop;
    //window.alert( "left=" + left + ", top=" + top );

    // Add draw offset :)
    var relX = (left - this.drawOffset.x) / this.zoomFactor;
    var relY = (top  - this.drawOffset.y) / this.zoomFactor;

    return new THREE.Vector2( relX, relY );
}

IKRS.BezierCanvasHandler.prototype.mouseDownHandler = function( e ) {
    // window.alert( "mouse down. Event: " + e + ", e.pageX=" + e.pageX + ", e.pageY=" + e.pageY );
    this.bezierCanvasHandler.latestMouseDownPosition = new THREE.Vector2( e.pageX, e.pageY ); 
    this.bezierCanvasHandler.latestMouseDragPosition = new THREE.Vector2( e.pageX, e.pageY ); 
    this.bezierCanvasHandler.latestMouseDownTime = new Date().getTime();
    
    //window.alert( this.bezierCanvasHandler.getBezierCurve() );
    // Find relative coordinates
    /*
    var rect = this.getBoundingClientRect();
    var left = e.clientX - rect.left - this.clientLeft + this.scrollLeft;
    var top = e.clientY - rect.top - this.clientTop + this.scrollTop;
    //window.alert( "left=" + left + ", top=" + top );

    // Add draw offset :)
    var relX = (left - this.bezierCanvasHandler.drawOffset.x) / this.bezierCanvasHandler.zoomFactor;
    var relY = (top  - this.bezierCanvasHandler.drawOffset.y) / this.bezierCanvasHandler.zoomFactor;
    */
    var relativeP = this.bezierCanvasHandler.translateMouseEventToRelativePosition( this, e );

    var clickTolerance = 10; // px
    // Find a bezier curve and the respective point that was touched
    var pointTouched = false;
    for( var i = 0; i < this.bezierCanvasHandler.getBezierPath().getCurveCount() && !pointTouched; i++ ) {

	// Get next curve
	var bCurve = this.bezierCanvasHandler.getBezierPath().getCurveAt( i );
	
	// Find drag point?
	//  (try control point FIRST as they move WITH the start- and end- points!)
	if( this.bezierCanvasHandler.pointIsNearPosition(bCurve.getStartControlPoint(), relativeP.x, relativeP.y, clickTolerance) ) {
	    
	    this.bezierCanvasHandler.currentDragPoint = bCurve.getStartControlPoint();
	    this.bezierCanvasHandler.draggedPointID = this.bezierCanvasHandler.bezierPath.START_CONTROL_POINT;
	    this.bezierCanvasHandler.draggedCurveIndex = i;
	    pointTouched = true;

	} else if( this.bezierCanvasHandler.pointIsNearPosition(bCurve.getEndControlPoint(), relativeP.x, relativeP.y, clickTolerance) ) {
	    
	    this.bezierCanvasHandler.currentDragPoint = bCurve.getEndControlPoint();
	    this.bezierCanvasHandler.draggedPointID = this.bezierCanvasHandler.bezierPath.END_CONTROL_POINT;
	    this.bezierCanvasHandler.draggedCurveIndex = i;
	    pointTouched = true;

	} 

    } // END for

    
    if( !pointTouched ) {

	// Try again with normal start- and end-points
	for( var i = 0; i < this.bezierCanvasHandler.getBezierPath().getCurveCount() && !pointTouched; i++ ) {

	    // Get next curve
	    var bCurve = this.bezierCanvasHandler.getBezierPath().getCurveAt( i );
	    
	    // Find drag point?
	    if( this.bezierCanvasHandler.pointIsNearPosition(bCurve.getStartPoint(), relativeP.x, relativeP.y, clickTolerance) ) {

		this.bezierCanvasHandler.currentDragPoint = bCurve.getStartPoint();
		this.bezierCanvasHandler.draggedPointID = this.bezierCanvasHandler.bezierPath.START_POINT;
		this.bezierCanvasHandler.draggedCurveIndex = i;
		this.bezierCanvasHandler.currentDraggedPointIndex = i;
		pointTouched = true;
		
	    } else if( this.bezierCanvasHandler.pointIsNearPosition(bCurve.getEndPoint(), relativeP.x, relativeP.y, clickTolerance) ) {

		this.bezierCanvasHandler.currentDragPoint = bCurve.getEndPoint();
		this.bezierCanvasHandler.draggedPointID = this.bezierCanvasHandler.bezierPath.END_POINT;
		this.bezierCanvasHandler.draggedCurveIndex = i;
		this.bezierCanvasHandler.currentDraggedPointIndex = i+1;
		pointTouched = true;
		
	    } 

	} // END for
    } // END if

    
    if( !pointTouched ) {
	this.bezierCanvasHandler.draggedPointID = -1;
	this.bezierCanvasHandler.draggedCurveIndex = -1;
	this.bezierCanvasHandler.currentDraggedPointIndex = -1;
    } 
    
}

IKRS.BezierCanvasHandler.prototype.mouseUpHandler = function( e ) {
    //window.alert( "mouse up. Event: " + e + ", e.pageX=" + e.pageX + ", e.pageY=" + e.pageY + ", latestMouseDragPosition=(" + this.bezierCanvasHandler.latestMouseDragPosition.x + ", " + bezierCanvasHandler.latestMouseDragPosition.y + ")");

    // A click: a mouse-down followed by a mouse-up WITHOUT any mouse-move event in-between
    //if( this.bezierCanvasHandler.latestMouseDownPosition.x == e.pageX &&
	//this.bezierCanvasHandler.latestMouseDownPosition.y == e.pageY ) {

    var currentTime = new Date().getTime();
    // It is a click (mouse down and -up at the same position)
    // Check if not more than n milliseconds have passed
    if( this.bezierCanvasHandler.latestClickTime 
	&& (currentTime - this.bezierCanvasHandler.latestClickTime) < 300 ) {
	
	//window.alert( "Double click at (" + e.pageX+ ", " + e.pageY + ")" );
	/*
	var relativeP = this.bezierCanvasHandler.translateMouseEventToRelativePosition( this, e );
	var location = locateCachedBezierPointNearPosition = 
	    this.bezierCanvasHandler.locateCachedBezierPointNearPosition( relativeP,  // point
									  10.0        // tolerance
									);
	//window.alert( "Double click at (" + e.pageX+ ", " + e.pageY + "). Point nearby found: " + location );
	*/
	this.bezierCanvasHandler.doubleClickHandler( this, e );
	

    } else if( this.bezierCanvasHandler.latestClickTime &&
	       (currentTime-this.bezierCanvasHandler.latestMouseDownTime) < 300 ) {
	
	// window.alert( "Single click at (" + e.pageX+ ", " + e.pageY + ")" );
	this.bezierCanvasHandler.latestClickTime = currentTime;

	if( this.bezierCanvasHandler.currentDraggedPointIndex != -1 )
	    this.bezierCanvasHandler.selectedPointIndices = [ this.bezierCanvasHandler.currentDraggedPointIndex ];
	else
	    this.bezierCanvasHandler.selectedPointIndices = [];

	//window.alert( "this.bezierCanvasHandler.selectedPoints=" + this.bezierCanvasHandler.selectedPoints );
    } 
	
   // }

    this.bezierCanvasHandler.latestClickTime = currentTime;

    // Clear mouse down position
    this.bezierCanvasHandler.latestMouseDownPosition = null; 
    this.bezierCanvasHandler.latestMouseDragPosition = null; 
    this.bezierCanvasHandler.currentDragPoint = null;
    this.bezierCanvasHandler.draggedPointID = -1;



    // And repaint the curve (to make the eventually hidden drag points to disappear)
    this.bezierCanvasHandler.redraw();
} // END mouseUpHandler

IKRS.BezierCanvasHandler.prototype.mouseMoveHandler = function( e ) {
   //window.alert( "mouse move. Event: " + e + ", e.pageX=" + e.pageX + ", e.pageY=" + e.pageY + ", lastMouseDownPosition=" + this.bezierCanvasHandler.latestMouseDownPosition + ", currentDragPoint=" + this.bezierCanvasHandler.currentDragPoint );
    
    if( this.bezierCanvasHandler.latestMouseDownPosition ) {

	if( this.bezierCanvasHandler.currentDragPoint ) {

	    // Update dragges point's position
	    var moveX = (this.bezierCanvasHandler.latestMouseDragPosition.x - e.pageX) / this.bezierCanvasHandler.zoomFactor;
	    var moveY = (this.bezierCanvasHandler.latestMouseDragPosition.y - e.pageY) / this.bezierCanvasHandler.zoomFactor;

	    this.bezierCanvasHandler.getBezierPath().moveCurvePoint( this.bezierCanvasHandler.draggedCurveIndex,
								     this.bezierCanvasHandler.draggedPointID,
								     new THREE.Vector2(-moveX,-moveY)
								   );
	    

	    // And repaint the curve
	    this.bezierCanvasHandler.redraw();
	}
	

	this.bezierCanvasHandler.latestMouseDownPosition.set( e.pageX, e.pageY );
	this.bezierCanvasHandler.latestMouseDragPosition.set( e.pageX, e.pageY );
	
    }
}


IKRS.BezierCanvasHandler.prototype.doubleClickHandler = function( parent,
								  e ) {
    var relativeP = this.translateMouseEventToRelativePosition( parent, e );
    var location = locateCachedBezierPointNearPosition = 
	this.locateCachedBezierPointNearPosition( relativeP,  // point
						  10.0        // tolerance
						);
    // window.alert( "Double click at (" + e.pageX+ ", " + e.pageY + "); relative (" + relativeP.x + ", " + relativeP.y + "). Point nearby found: " + location );
    
    // Will return false if any index is out of (valid) bounds
    var splitSucceeded = this.bezierPath.splitAt( location[0],   // curveIndex
						  location[1]    // segmentIndex
						);
    if( splitSucceeded )
	this.redraw();
}


IKRS.BezierCanvasHandler.prototype.drawBezierPath = function( context,
							      bezierPath,
							      drawOffset,
							      zoomFactor,
							      drawStartPoint,
							      drawEndPoint,
							      drawStartControlPoint,
							      drawEndControlPoint,
							    
							      drawTangents 
							    ) { 

    //window.alert( "# of bezier curves: " + bezierPath.getCurveCount() );   

    // This way of rendering the curve uses the curves' internal
    // segment cache.
    // This way of retrieving random points from the curve SHOULD NOT
    // be used for further calculations (it is not accurate as the 
    // cache only contains linear approximations!)
    //
    // See below for a more accurate (but slower) algorithm.
    for( var i = 0; i < bezierPath.getCurveCount(); i++ ) {


	var bCurve = bezierPath.getCurveAt( i );


	// Clear linear path for debugging?
	if( document.forms["bezier_form"].elements["draw_linear_path_segments"].checked ) {
	    
	    context.strokeStyle = "#c8c8ff";
	    context.lineWidth   = 1;
	    context.beginPath();
	    context.moveTo( bCurve.getStartPoint().x * zoomFactor + drawOffset.x,
			    bCurve.getStartPoint().y * zoomFactor + drawOffset.y );
	    context.lineTo( bCurve.getEndPoint().x * zoomFactor + drawOffset.x,
			    bCurve.getEndPoint().y * zoomFactor + drawOffset.y );
	    context.stroke();

	}


	// Draw the actual bezier curve
	this.drawBezierCurve( context,
			      bCurve,
			      drawOffset,
			      zoomFactor,
			      drawStartPoint,
			      drawEndPoint,
			      drawStartControlPoint,
			      drawEndControlPoint,

			      drawTangents,  // drawTangents
			    
			      IKRS.Utils.inArray( this.selectedPointIndices, i ),               // startPointIsSelected
			      IKRS.Utils.inArray( this.selectedPointIndices, i+1 )              // endPointIsSelected
			    );


	

    }
    
    
    // This is a different way to draw the bezier curve:
    //  it uses REAL interpolation, and NOT the segment cache!
    // This way should be used to pick random points from the curve
    // for further calculation.
    /*
    var steps = 50;
    var lastPoint = this.bezierPath.getPoint( 0.0 );
    context.strokeStyle = "#000000";
    context.beginPath();
    context.moveTo( lastPoint.x * zoomFactor + drawOffset.x, 
		    lastPoint.y * zoomFactor + drawOffset.y
		  );
    for( var i = 1; i <= steps; i++ ) {

	var t = (i/steps);
	var point = this.bezierPath.getPoint( t );
	
	//window.alert( "t=" + t + ", point=(" + point.x + ", " + point.y + ")" );
	
	context.lineTo( point.x * zoomFactor + drawOffset.x, 
			point.y * zoomFactor + drawOffset.y
		      );
	
	lastPoint = point;
    }
    context.stroke();
    */

}



//window.alert( "IKRS.BezierCanvasHandler=" + IKRS.BezierCanvasHandler );
//window.alert( "IKRS.BezierCanvasHandler.prototype=" + IKRS.BezierCanvasHandler.prototype );