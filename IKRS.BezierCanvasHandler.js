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
    this.latestMouseDownTime   = null; // ms
    
    this.latestClickTime       = null;

    this.currentDragPoint;
    this.currentDraggedPointIndex;

    this.selectedPointIndices  = [];

    var draggedCurveIndex      = -1;
    var draggedPointID         = -1;

    var canvas_width           = 512;
    var canvas_height          = 768;

    this.canvasWidth           = canvas_width;
    this.canvasHeight          = canvas_height;

    this.canvas                = document.getElementById("bezier_canvas");
    this.context               = this.canvas.getContext( "2d" );
    

    this.canvas.onmousedown    = this.mouseDownHandler;
    this.canvas.onmouseup      = this.mouseUpHandler;
    this.canvas.onmousemove    = this.mouseMoveHandler; 

    window.addEventListener( "keydown", this.keyDownHandler, false );

    // This is a new way: build from a JSON string
    var jsonString = "[ { \"startPoint\" : [-122,74], \"endPoint\" : [-57.454814814814796,5.460592592592583], \"startControlPoint\": [-119,14], \"endControlPoint\" : [-66.28766869253815,34.77964111961321] }, { \"startPoint\" : [-57.454814814814796,5.460592592592583], \"endPoint\" : [-55,-139], \"startControlPoint\": [-50.31974300727449,-18.222977798698675], \"endControlPoint\" : [-84.38654635129569,-50.09980658609145] }, { \"startPoint\" : [-55,-139], \"endPoint\" : [-51.66118578883062,-227.750293953586], \"startControlPoint\": [-39.46858425198657,-185.98564599883105], \"endControlPoint\" : [-56.750583998055625,-189.07086756347596] }, { \"startPoint\" : [-51.66118578883062,-227.750293953586], \"endPoint\" : [-2,-323], \"startControlPoint\": [-46.66118578883062,-265.75029395358604], \"endControlPoint\" : [-40,-323] } ]";
    this.bezierPath = IKRS.BezierPath.fromJSON( jsonString );
    
    // THE UNDO-HISTORY IS REALLY BUGGY AND CURRENTLY NOT IN USE.
    // THIS IS STILL TO BE FIXED!!!
    this.undoHistory = new IKRS.UndoHistory( this.bezierPath,
					     32
					   );
    //this.undoHistory.createHistoryEntry();
    //window.alert( "bezierPath=" + JSON.stringify(this.bezierPath) + ",\n current_state: " + JSON.stringify(this.undoHistory.getCurrentState()) + ",\n equal=" + this.bezierPath.equals(this.undoHistory.getCurrentState()) );
    this.bezierPath  = this.undoHistory.getCurrentState().clone();
    

    // Store a reverse reference inside the handler so the mousehandlers can access this object
    this.canvas.bezierCanvasHandler = this;
        

    this.redraw();
}

IKRS.BezierCanvasHandler.POINT_ID_LEFT_UPPER_BOUND  = -1001;
IKRS.BezierCanvasHandler.POINT_ID_RIGHT_UPPER_BOUND = -1002;
IKRS.BezierCanvasHandler.POINT_ID_RIGHT_LOWER_BOUND = -1003;
IKRS.BezierCanvasHandler.POINT_ID_LEFT_LOWER_BOUND  = -1004;

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
    this.zoomFactor *= 1.2;
    if( redraw )
	this.redraw();
}

IKRS.BezierCanvasHandler.prototype.decreaseZoomFactor = function( redraw ) {
    this.zoomFactor /= 1.2;
    if( redraw )
	this.redraw();
}

IKRS.BezierCanvasHandler.prototype.undo = function() {

    if( !this.undoHistory.undo() )
	return false;
     
    // this.undoHistory.createHistoryEntry();
    this.bezierPath = this.undoHistory.getCurrentState(); 
    this.redraw();
    
    return true;

}

IKRS.BezierCanvasHandler.prototype.redraw = function() {

    // Clear screen?
    if( !document.forms["bezier_form"] ||
	!document.forms["bezier_form"].elements["clear_on_repaint"] ||
	document.forms["bezier_form"].elements["clear_on_repaint"].checked ) {

	this.context.fillStyle = "#FFFFFF";
	this.context.fillRect( 0, 0, 512, 768 );
	
    }

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

	var boundingBox = this.bezierPath.computeBoundingBox();
	this.context.strokeStyle = "#888888";
	this.context.lineWidth   = 0.5;
	this.context.strokeRect( boundingBox.xMin * this.zoomFactor + this.drawOffset.x,
				 boundingBox.yMin * this.zoomFactor + this.drawOffset.y,
				 boundingBox.getWidth() * this.zoomFactor,
				 boundingBox.getHeight() * this.zoomFactor
			       );
	// Draw bounding box handles
	var leftUpperPoint  = boundingBox.getLeftUpperPoint();
	var rightLowerPoint = boundingBox.getRightLowerPoint();
	
	this.context.lineWidth   = 1.0;
	var lineDistance = 3; // px
	// ... handle for the upper left point
	this.context.beginPath();
	this.context.moveTo( leftUpperPoint.x * this.zoomFactor + this.drawOffset.x + lineDistance,
			     leftUpperPoint.y * this.zoomFactor + this.drawOffset.y + lineDistance + 10 
			   );
	this.context.lineTo( leftUpperPoint.x * this.zoomFactor + this.drawOffset.x + lineDistance,
			     leftUpperPoint.y * this.zoomFactor + this.drawOffset.y + lineDistance 
			   );
	this.context.lineTo( leftUpperPoint.x * this.zoomFactor + this.drawOffset.x + lineDistance + 10,
			     leftUpperPoint.y * this.zoomFactor + this.drawOffset.y + lineDistance 
			   );
	this.context.stroke();

	// ... handle for the upper left point
	this.context.beginPath();
	this.context.moveTo( rightLowerPoint.x * this.zoomFactor + this.drawOffset.x - lineDistance,
			     rightLowerPoint.y * this.zoomFactor + this.drawOffset.y - lineDistance - 10 
			   );
	this.context.lineTo( rightLowerPoint.x * this.zoomFactor + this.drawOffset.x - lineDistance,
			     rightLowerPoint.y * this.zoomFactor + this.drawOffset.y - lineDistance 
			   );
	this.context.lineTo( rightLowerPoint.x * this.zoomFactor + this.drawOffset.x - lineDistance - 10,
			     rightLowerPoint.y * this.zoomFactor + this.drawOffset.y - lineDistance 
			   );
	this.context.stroke();
	

    }
}

IKRS.BezierCanvasHandler.prototype._drawSelectedPoint = function( context,
								  point,
								  zoomFactor,
								  drawOffset
								) {

    context.beginPath();
    context.arc( point.x * zoomFactor + drawOffset.x,  // centerX
		 point.y * zoomFactor + drawOffset.y,  // centerY
		 3,          // radius,
		 0.0,         // start angle
		 2.0*Math.PI, // end angle
		 true         // anti clock wise
	       );
    context.fillStyle   = "#B400FF"; // "#FF0000";
    context.fill();
    
    
    context.beginPath();
    context.arc( point.x * zoomFactor + drawOffset.x,  // centerX
		 point.y * zoomFactor + drawOffset.y,  // centerY
		 8,          // radius,
		 0.0,         // start angle
		 2.0*Math.PI, // end angle
		 true         // anti clock wise 
	       );
    context.strokeStyle = "#B400FF"; // "#FF0000";
    context.stroke();

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
	context.fillStyle   = "#B400FF";
	context.strokeStyle = "#B400FF";
	context.lineWidth   = 1;
	// Start point?
	if( drawStartPoint ) {
	    if( startPointIsSelected ) {
	
		this._drawSelectedPoint( context,
					 bezierCurve.getStartPoint(),
					 zoomFactor, 
					 drawOffset );
					
				    
	    } else {
                context.fillStyle   = "#B400FF";
		context.strokeStyle = "#B400FF";
		context.fillRect( bezierCurve.getStartPoint().x * zoomFactor - 2 + drawOffset.x,
				  bezierCurve.getStartPoint().y * zoomFactor - 2 + drawOffset.y,
				  5, 5 );
	    }
	}
	// End point?
	if( drawEndPoint ) {
	    if( endPointIsSelected ) {
		context.fillStyle   = "#FF0000";
		context.strokeStyle = "#FF0000";

		this._drawSelectedPoint( context,
					 bezierCurve.getEndPoint(),
					 zoomFactor, 
					 drawOffset );
				    
	    } else {
                context.fillStyle   = "#B400FF";
		context.strokeStyle = "#B400FF";
		context.fillRect( bezierCurve.getEndPoint().x * zoomFactor - 2 + drawOffset.x,
				  bezierCurve.getEndPoint().y * zoomFactor - 2 + drawOffset.y,
				  5, 5 );
	    }
	}
	
    }

    // Draw the control points?
    if( // document.forms["bezier_form"].elements["draw_tangents"].checked &&
	(drawStartControlPoint || drawEndControlPoint) ) {
	context.fillStyle = "#B8D438";
	// Start control point?
	if( drawStartControlPoint ) {
	    context.fillRect( bezierCurve.getStartControlPoint().x * zoomFactor - 2 + drawOffset.x,
			      bezierCurve.getStartControlPoint().y * zoomFactor - 2 + drawOffset.y,
			      5, 5 );
	}
	// End control point?
	if( drawEndControlPoint ) {
	    context.fillRect( bezierCurve.getEndControlPoint().x * zoomFactor - 2 + drawOffset.x,
			      bezierCurve.getEndControlPoint().y * zoomFactor - 2 + drawOffset.y,
			      5, 5 );
	}
    }
}


IKRS.BezierCanvasHandler.prototype.drawPerpendiculars = function( context,
								  bezierCurve,
								  drawOffset,
								  zoomFactor ) {

    context.strokeStyle = "#a0a0fF";
    context.lineWidth   = 0.5;
    
    // This is very ungly!
    // TODO: pass as param
    var perpendicularLength = document.forms["mesh_form"].elements["mesh_hull_strength"].value; // 20

    var pDistance = 6; // px
    var i = 0;
    while( i*pDistance <= bezierCurve.getLength() ) {
	
	
	var t             = (i*pDistance)/bezierCurve.getLength();
	var point         = bezierCurve.getPoint( t );

	// Draw inner or outer perpendicular???
	var perpendicular = bezierCurve.getPerpendicular( t ).normalize();
	
	// Draw perpendiculars?
	// Note: the perpendicular at the point is the tangent rotated by 90 deg
	context.beginPath();
	context.moveTo( point.x * zoomFactor + drawOffset.x,
			point.y * zoomFactor + drawOffset.y 
		      );
	context.lineTo( point.x * zoomFactor + drawOffset.x + perpendicular.x * (perpendicularLength*zoomFactor),
			point.y * zoomFactor + drawOffset.y + perpendicular.y * (perpendicularLength*zoomFactor)
		      );
	context.stroke();

	i++;

    }

}

IKRS.BezierCanvasHandler.prototype.setBezierPath = function( path ) {
    if( !path ) {
	console.log( "Error: cannot set bezier path to null." );
	return false;
    }
    
    this.bezierPath = path;
    this.undoHistory.createHistoryEntry( path );
    this.redraw();
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
    
	// Try to locate a bounding box point near the clicked position.
	// If there is no point function returns -1.
	this.bezierCanvasHandler.draggedPointID = this.bezierCanvasHandler.resolveBoundingBoxPointNear( relativeP, clickTolerance );
	this.bezierCanvasHandler.draggedCurveIndex = -1;
	this.bezierCanvasHandler.currentDraggedPointIndex = -1;
    } 
    
}

IKRS.BezierCanvasHandler.prototype.mouseUpHandler = function( e ) {
    //window.alert( "mouse up. Event: " + e + ", e.pageX=" + e.pageX + ", e.pageY=" + e.pageY + ", latestMouseDragPosition=(" + this.bezierCanvasHandler.latestMouseDragPosition.x + ", " + bezierCanvasHandler.latestMouseDragPosition.y + ")");

    var currentTime = new Date().getTime();
    // It is a click (mouse down and -up at the same position)
    // Check if not more than n milliseconds have passed
    if( this.bezierCanvasHandler.latestClickTime 
	&& (currentTime - this.bezierCanvasHandler.latestClickTime) < 300 ) {
	
	this.bezierCanvasHandler.doubleClickHandler( this, e );
	

    } else if( this.bezierCanvasHandler.latestClickTime &&
	       (currentTime-this.bezierCanvasHandler.latestMouseDownTime) < 300 ) {
	
	this.bezierCanvasHandler.latestClickTime = currentTime;

	if( this.bezierCanvasHandler.currentDraggedPointIndex != -1 ) {
	    this.bezierCanvasHandler.selectedPointIndices = [ this.bezierCanvasHandler.currentDraggedPointIndex ];
	} else {
	    this.bezierCanvasHandler.selectedPointIndices = [];
	}


    } 
	

    this.bezierCanvasHandler.latestClickTime = currentTime;

    // If any points were dragged: create a history entry
    if( this.bezierCanvasHandler.draggedPointID != -1 )
	this.bezierCanvasHandler.undoHistory.createHistoryEntry();

    // Clear mouse down position
    this.bezierCanvasHandler.latestMouseDownPosition = null; 
    this.bezierCanvasHandler.latestMouseDragPosition = null; 
    this.bezierCanvasHandler.currentDragPoint = null;
    this.bezierCanvasHandler.draggedPointID = -1;



    // And repaint the curve (to make the eventually hidden drag points to disappear)
    this.bezierCanvasHandler.redraw();
} // END mouseUpHandler

IKRS.BezierCanvasHandler.prototype.mouseMoveHandler = function( e ) {
    
    if( this.bezierCanvasHandler.latestMouseDownPosition ) {

	// Update dragges point's position
	var moveX = (this.bezierCanvasHandler.latestMouseDragPosition.x - e.pageX) / this.bezierCanvasHandler.zoomFactor;
	var moveY = (this.bezierCanvasHandler.latestMouseDragPosition.y - e.pageY) / this.bezierCanvasHandler.zoomFactor;

	if( this.bezierCanvasHandler.currentDragPoint ) {

	    this.bezierCanvasHandler.getBezierPath().moveCurvePoint( this.bezierCanvasHandler.draggedCurveIndex,
								     this.bezierCanvasHandler.draggedPointID,
								     new THREE.Vector2(-moveX,-moveY)
								   );
	    

	    // And repaint the curve
	    this.bezierCanvasHandler.redraw();
	} else if( this.bezierCanvasHandler.draggedPointID == IKRS.BezierCanvasHandler.POINT_ID_LEFT_UPPER_BOUND 
		   && document.forms["bezier_form"].elements["draw_bounding_box"].checked ) {
	  
	    var oldBounds = this.bezierCanvasHandler.getBezierPath().computeBoundingBox();
	    var newBounds = new IKRS.BoundingBox2( oldBounds.getXMin() + moveX,
						   oldBounds.getXMax(),
						   oldBounds.getYMin() + moveY,
						   oldBounds.getYMax()
						 );	    
	    this.bezierCanvasHandler._scaleBezierPath( oldBounds,
						       newBounds,
						       oldBounds.getRightLowerPoint(), // anchor
						       true  // redraw
						     );

	} else if( this.bezierCanvasHandler.draggedPointID == IKRS.BezierCanvasHandler.POINT_ID_RIGHT_UPPER_BOUND 
		   && document.forms["bezier_form"].elements["draw_bounding_box"].checked ) {

	    var oldBounds = this.bezierCanvasHandler.getBezierPath().computeBoundingBox();
	    var newBounds = new IKRS.BoundingBox2( oldBounds.getXMin(),
						   oldBounds.getXMax() + moveX,
						   oldBounds.getYMin() + moveY,
						   oldBounds.getYMax()
						 );	    
	    this.bezierCanvasHandler._scaleBezierPath( oldBounds,
						       newBounds,
						       oldBounds.getLeftLowerPoint(), // anchor
						       true  // redraw
						     );
	    
	} else if( this.bezierCanvasHandler.draggedPointID == IKRS.BezierCanvasHandler.POINT_ID_RIGHT_LOWER_BOUND 
		   && document.forms["bezier_form"].elements["draw_bounding_box"].checked ) {

	    var oldBounds = this.bezierCanvasHandler.getBezierPath().computeBoundingBox();
	    var newBounds = new IKRS.BoundingBox2( oldBounds.getXMin(),
						   oldBounds.getXMax() + moveX,
						   oldBounds.getYMin(),
						   oldBounds.getYMax() + moveY
						 );	    
	    this.bezierCanvasHandler._scaleBezierPath( oldBounds,
						       newBounds,
						       oldBounds.getLeftUpperPoint(), // anchor
						       true  // redraw
						     );
						   

	} else if( this.bezierCanvasHandler.draggedPointID == IKRS.BezierCanvasHandler.POINT_ID_LEFT_LOWER_BOUND 
		   && document.forms["bezier_form"].elements["draw_bounding_box"].checked ) {

	    var oldBounds = this.bezierCanvasHandler.getBezierPath().computeBoundingBox();
	    var newBounds = new IKRS.BoundingBox2( oldBounds.getXMin() + moveX,
						   oldBounds.getXMax(),
						   oldBounds.getYMin(),
						   oldBounds.getYMax() + moveY
						 );	    
	    this.bezierCanvasHandler._scaleBezierPath( oldBounds,
						       newBounds,
						       oldBounds.getRightUpperPoint(), // anchor
						       true  // redraw
						     );

	}
	

	this.bezierCanvasHandler.latestMouseDownPosition.set( e.pageX, e.pageY );
	this.bezierCanvasHandler.latestMouseDragPosition.set( e.pageX, e.pageY );
	
    }
}

IKRS.BezierCanvasHandler.prototype._scaleBezierPath = function( oldBounds,
								newBounds,
								anchor,
								redraw
							      ) {
    // Calculate scale factors
    var scaling    = new THREE.Vector2( oldBounds.getWidth()  / newBounds.getWidth(),
					oldBounds.getHeight() / newBounds.getHeight()
				      );

    // Warning: do not scale too small!
    // HINT: THIS DOES SOMEHOW NOT PREVENT THE PATH TO BE SCALED TOO SMALL :(
    //       THIS BUG NEEDS TO BE FIXED
    if( newBounds.getWidth() < 25 && newBounds.getWidth() < oldBounds.getWidth() )
	scaling.x = oldBounds.getWidth() / 25.0; // 1.0; 
    if( newBounds.getHeight() < 25 && newBounds.getHeight() < oldBounds.getHeight() )
	scaling.y = oldBounds.getHeight() / 25.0; // 1.0;
    
    //if( newBounds.getWidth() < 25 ) {
	//window.alert( "newBounds.width=" + newBounds.getWidth() );
	//window.alert( "scaling.x=" + scaling.x + ", scaling.y=" + scaling.y + ", newBounds=" + newBounds._toString() + ", oldBounds=" + oldBounds._toString() );
    //}
    
    this.getBezierPath().scale( anchor,
				scaling 
			      );
    if( redraw )
	this.redraw();

}


IKRS.BezierCanvasHandler.prototype.doubleClickHandler = function( parent,
								  e ) {
    var relativeP = this.translateMouseEventToRelativePosition( parent, e );
    var location = locateCachedBezierPointNearPosition = 
	this.locateCachedBezierPointNearPosition( relativeP,  // point
						  10.0        // tolerance
						);
    
    // Will return false if any index is out of (valid) bounds
    var splitSucceeded = this.bezierPath.splitAt( location[0],   // curveIndex
						  location[1]    // segmentIndex
						);
    if( splitSucceeded ) {
	this.undoHistory.createHistoryEntry();
	this.redraw();
    }
}


IKRS.BezierCanvasHandler.prototype.keyDownHandler = function( e ) {
    
    // The key code for 'delete' is 46
    if( e.keyCode != 46 ) 
	return;

    // Are there any selected shape points at all?
    if( this.bezierCanvasHandler.selectedPointIndices.length == 0 ) 
	return;


    // window.alert( "Sorry. Deleting shape points is not yet supported. Please come back later." );

    // Join in the middle or return begin/end point?
    var pointIndex = this.bezierCanvasHandler.selectedPointIndices[0];
    //window.alert( "pointIndex=" + pointIndex + ", bezierCount=" + this.bezierCanvasHandler.getBezierPath().getCurveCount() );
    
    this.bezierCanvasHandler.selectedPointIndices = [];
    if( pointIndex == 0 ) {

	if( this.bezierCanvasHandler.getBezierPath().removeStartPoint() )
	    this.bezierCanvasHandler.redraw();

    } else if( pointIndex == this.bezierCanvasHandler.getBezierPath().getCurveCount() ) {
	
	if( this.bezierCanvasHandler.getBezierPath().removeEndPoint() )
	    this.bezierCanvasHandler.redraw();

    } else {

	this.bezierCanvasHandler.bezierPath.joinAt( pointIndex );  // Join the curve at given index with predecessor
	this.bezierCanvasHandler.redraw();
    }
  
}


IKRS.BezierCanvasHandler.prototype.resolveBoundingBoxPointNear = function( point,
									   tolerance
									 ) {
    var bounds = this.getBezierPath().computeBoundingBox();
    if( this.pointIsNearPosition( bounds.getLeftUpperPoint(),
				  point.x,
				  point.y,
				  tolerance ) ) {
	return IKRS.BezierCanvasHandler.POINT_ID_LEFT_UPPER_BOUND;
    } else if( this.pointIsNearPosition( bounds.getRightUpperPoint(),
					 point.x,
					 point.y,
					 tolerance ) ) {
	return IKRS.BezierCanvasHandler.POINT_ID_RIGHT_UPPER_BOUND;
    } else if( this.pointIsNearPosition( bounds.getRightLowerPoint(),
					 point.x,
					 point.y,
					 tolerance ) ) {
	return IKRS.BezierCanvasHandler.POINT_ID_RIGHT_LOWER_BOUND;
    } else if( this.pointIsNearPosition( bounds.getLeftLowerPoint(),
					 point.x,
					 point.y,
					 tolerance ) ) {
	return IKRS.BezierCanvasHandler.POINT_ID_LEFT_LOWER_BOUND;
    } else {
	return -1;
    }
    
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
	    context.lineTo( bCurve.getEndPoint().x   * zoomFactor + drawOffset.x,
			    bCurve.getEndPoint().y   * zoomFactor + drawOffset.y );
	    context.stroke();

	}

	// Draw tangent?
	// Note: the tangentVector is NOT normalized in this implementation.
	//       THREE.js normalizes tangents, my implementation does NOT!
	var tangentVector = bCurve.getTangent( 0.5 );
	var perpendicular = new THREE.Vector2( tangentVector.y, - tangentVector.x );
	var tangentPoint  = bCurve.getPoint( 0.5 );
	var tangentDrawLength = 200; // px
	// Normalize tangent
	tangentVector = tangentVector.normalize();
	context.strokeStyle = "#0000FF";
	context.lineWidth = 1;


	if( document.forms["bezier_form"].elements["draw_perpendiculars"].checked ) {
	    this.drawPerpendiculars( context,
				     bCurve,
				     drawOffset,
				     zoomFactor
			       );
	}


	// Draw the actual bezier curve
	this.drawBezierCurve( context,
			      bCurve,
			      drawOffset,
			      zoomFactor,
			      drawStartPoint, 
			      drawEndPoint && i+1 == bezierPath.getCurveCount(), // avoid to double-paint start and end points
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