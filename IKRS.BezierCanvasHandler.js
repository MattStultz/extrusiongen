/**
 * @author Ikaros Kappler
 * @date 2013-08-14
 * @version 1.0.0
 **/

IKRS.BezierCanvasHandler = function() {

    IKRS.Object.call( this );
    
    // These are MouseEvent locations
    var latestMouseDownPosition;
    var latestMouseDragPosition;

    var currentDragPoint;

    var draggedCurveIndex = -1;
    var draggedPointID    = -1;

    var canvas_width  = 512;
    var canvas_height = 768;
    
    //this.bezierCurve = null;
    //this.bezierPath = null;

    this.canvas = document.getElementById("bezier_canvas");
    this.context = this.canvas.getContext( "2d" );
    

    this.canvas.onmousedown = this.mouseDownHandler;
    this.canvas.onmouseup   = this.mouseUpHandler;
    this.canvas.onmousemove = this.mouseMoveHandler; 

    //window.alert( "BB" );

    /*
    var bezierWidth = 400;
    var bezierHeight = 500;
    this.bezierCurve = new IKRS.CubicBezierCurve( new THREE.Vector2( bezierWidth/8,   5*bezierHeight/8 ),     // startPoint
						    new THREE.Vector2( 7*bezierWidth/8, 5*bezierHeight/8 ),     // endPoint
						    new THREE.Vector2( 3*bezierWidth/8, bezierHeight/4,   0),   // startControlPoint
						    new THREE.Vector2( 5*bezierWidth/8, bezierHeight/4,   0)    // endControlPoint
						  );
    // Store a reverse reference inside the handler so the mousehandlers can access this object
    this.canvas.bezierCanvasHandler = this;
        
    this.drawBezierCurve( this.context, 
			  this.bezierCurve, 
			  this.drawOffset,
			  true,  // drawStartPoint
			  true,  // drawEndPoint
			  true,  // drawStartControlPoint
			  true   // drawEndControlPoint
			);
			*/
    var bezierWidth = 400;
    var bezierHeight = 500;

    var pathPoints = [];
    pathPoints.push( new THREE.Vector2( bezierWidth/8, 5*bezierWidth/8 ) );
    pathPoints.push( new THREE.Vector2( 4*bezierWidth/8, 3*bezierWidth/8 ) );
    pathPoints.push( new THREE.Vector2( 7*bezierWidth/8, bezierWidth/8 ) );

    /*
    var bezierCurves = [];
    bezierCurves.push( new IKRS.CubicBezierCurve( new THREE.Vector2( bezierWidth/8,   5*bezierHeight/8 ),     // startPoint
						  new THREE.Vector2( 7*bezierWidth/8, 5*bezierHeight/8 ),     // endPoint
						  new THREE.Vector2( 3*bezierWidth/8, bezierHeight/4,   0),   // startControlPoint
						  new THREE.Vector2( 5*bezierWidth/8, bezierHeight/4,   0)    // endControlPoint
	
						)
		     );
		     */
    this.bezierPath = new IKRS.BezierPath( pathPoints ); // bezierCurves );
    //window.alert( "IKRS.BezierCanvashandler.bezierPath=" + this.bezierPath );
    // Store a reverse reference inside the handler so the mousehandlers can access this object
    this.canvas.bezierCanvasHandler = this;
        
    /*
    this.drawBezierPath( this.context, 
			 this.bezierPath, 
			 this.drawOffset,
			 true,  // drawStartPoint
			 true,  // drawEndPoint
			 true,  // drawStartControlPoint
			 true   // drawEndControlPoint
		       );
		       */
    this.redraw();
}


IKRS.BezierCanvasHandler.prototype = new IKRS.Object();
IKRS.BezierCanvasHandler.prototype.constructor = IKRS.BezierCanvasHandler;

IKRS.BezierCanvasHandler.prototype.drawOffset = new THREE.Vector2( 100, 0 );
// 0: start point
// 1: start control point
// 2: end control point
// 3: end point
IKRS.BezierCanvasHandler.prototype.draggedPointID = -1; 

IKRS.BezierCanvasHandler.prototype.redraw = function() {
    this.drawBezierPath( this.context, 
			 this.bezierPath, 
			 this.drawOffset,
			 true,  // drawStartPoint
			 true,  // drawEndPoint
			 true,  // drawStartControlPoint
			 true   // drawEndControlPoint
		       );
    //this.drawBezierPath();
}

IKRS.BezierCanvasHandler.prototype.drawBezierCurve = function( context,
							       bezierCurve,
							       drawOffset,
							       drawStartPoint,
							       drawEndPoint,
							       drawStartControlPoint,
							       drawEndControlPoint ) {
    

    context.strokeStyle = "#000000";
    context.lineWidth = 1;
    context.beginPath();
    // window.alert( "Beginning bezier path at: (" + bezierCurve.segmentCache[0].x + ", " + bezierCurve.segmentCache[0].y + ")" );
    context.moveTo( bezierCurve.segmentCache[0].x + drawOffset.x,
		    bezierCurve.segmentCache[0].y + drawOffset.y
		  );
    for( var i = 1; i < bezierCurve.segmentCache.length; i++ ) {

	
	context.lineTo( bezierCurve.segmentCache[i].x + drawOffset.x,
			bezierCurve.segmentCache[i].y + drawOffset.y
		      );	
    }
    context.stroke();



    // Draw tangents?
    if( document.forms["bezier_form"].elements["draw_tangents"].checked ) {

	context.strokeStyle = "#a8a8a8";

	// Draw start point tangent
	context.beginPath();
	context.moveTo( bezierCurve.getStartPoint().x + drawOffset.x,
			bezierCurve.getStartPoint().y + drawOffset.y
		      );
	context.lineTo( bezierCurve.getStartControlPoint().x + drawOffset.x,
			bezierCurve.getStartControlPoint().y + drawOffset.y 
		      );
	context.stroke();

	// Draw end point tangent
	context.beginPath();
	context.moveTo( bezierCurve.getEndPoint().x + drawOffset.x,
			bezierCurve.getEndPoint().y + drawOffset.y
		      );
	context.lineTo( bezierCurve.getEndControlPoint().x + drawOffset.x,
			bezierCurve.getEndControlPoint().y + drawOffset.y 
		      );
	context.stroke();

    }
    
    // Draw the end points
    if( drawStartPoint || drawEndPoint ) {
	context.fillStyle = "#B400FF";
	// Start point?
	if( drawStartPoint ) {
	    context.fillRect( bezierCurve.getStartPoint().x - 1 + drawOffset.x,
			      bezierCurve.getStartPoint().y - 1 + drawOffset.y,
			      3, 3 );
	}
	// End point?
	if( drawEndPoint ) {
	    context.fillRect( bezierCurve.getEndPoint().x - 1 + drawOffset.x,
			      bezierCurve.getEndPoint().y - 1 + drawOffset.y,
			      3, 3 );
	}
    }

    // Draw the control points?
    if( drawStartControlPoint || drawEndControlPoint ) {
	context.fillStyle = "#B8D438";
	// Start control point?
	if( drawStartControlPoint ) {
	    context.fillRect( bezierCurve.getStartControlPoint().x - 1 + drawOffset.x,
			      bezierCurve.getStartControlPoint().y - 1 + drawOffset.y,
			      3, 3 );
	}
	// End control point?
	if( drawEndControlPoint ) {
	    context.fillRect( bezierCurve.getEndControlPoint().x - 1 + drawOffset.x,
			      bezierCurve.getEndControlPoint().y - 1 + drawOffset.y,
			      3, 3 );
	}
    }
}

/*IKRS.BezierCanvasHandler.prototype.getBezierCurve = function() {
    return this.bezierCurve;
}
*/

IKRS.BezierCanvasHandler.prototype.getBezierPath = function() {
    return this.bezierPath;
}

IKRS.BezierCanvasHandler.prototype.pointIsNearPosition = function( point,
								   x, 
								   y,
								   tolerance ) {

    var distance = Math.sqrt( Math.pow(point.x-x,2) + Math.pow(point.y-y,2) );

    //window.alert( "point=(" + point.x + ", " + point.y + "), x=" + x + ", y=" + y + ", tolerance=" + tolerance + ", distance=" + distance );

    return ( distance <= tolerance );

}

IKRS.BezierCanvasHandler.prototype.mouseDownHandler = function( e ) {
    // window.alert( "mouse down. Event: " + e + ", e.pageX=" + e.pageX + ", e.pageY=" + e.pageY );
    this.bezierCanvasHandler.latestMouseDownPosition = new THREE.Vector2( e.pageX, e.pageY ); 
    this.bezierCanvasHandler.latestMouseDragPosition = new THREE.Vector2( e.pageX, e.pageY ); 
    
    //window.alert( this.bezierCanvasHandler.getBezierCurve() );
    // Find relative coordinates
    var rect = this.getBoundingClientRect();
    var left = e.clientX - rect.left - this.clientLeft + this.scrollLeft;
    var top = e.clientY - rect.top - this.clientTop + this.scrollTop;
    //window.alert( "left=" + left + ", top=" + top );

    // Add draw offset :)
    left -= this.bezierCanvasHandler.drawOffset.x;
    top -= this.bezierCanvasHandler.drawOffset.y;

    var clickTolerance = 10; // px

    /*
    // Find drag point?
    if( this.bezierCanvasHandler.pointIsNearPosition(this.bezierCanvasHandler.getBezierCurve().getStartPoint(), left, top, clickTolerance) ) {

	this.bezierCanvasHandler.currentDragPoint = this.bezierCanvasHandler.getBezierCurve().getStartPoint();
	this.bezierCanvasHandler.draggedPointID = 0;
	
    } else if( this.bezierCanvasHandler.pointIsNearPosition(this.bezierCanvasHandler.getBezierCurve().getEndPoint(), left, top, clickTolerance) ) {

	this.bezierCanvasHandler.currentDragPoint = this.bezierCanvasHandler.getBezierCurve().getEndPoint();
	this.bezierCanvasHandler.draggedPointID = 3;
	
    } else if( this.bezierCanvasHandler.pointIsNearPosition(this.bezierCanvasHandler.getBezierCurve().getStartControlPoint(), left, top, clickTolerance) ) {
	
	this.bezierCanvasHandler.currentDragPoint = this.bezierCanvasHandler.getBezierCurve().getStartControlPoint();
	this.bezierCanvasHandler.draggedPointID = 1;

    } else if( this.bezierCanvasHandler.pointIsNearPosition(this.bezierCanvasHandler.getBezierCurve().getEndControlPoint(), left, top, clickTolerance) ) {
	
	this.bezierCanvasHandler.currentDragPoint = this.bezierCanvasHandler.getBezierCurve().getEndControlPoint();
	this.bezierCanvasHandler.draggedPointID = 2;

    } else {
	
	this.bezierCanvasHandler.draggedPointID = -1;

    }
    */

    // Find a bezier curve and the respective point that was touched
    var pointTouched = false;
    for( var i = 0; i < this.bezierCanvasHandler.getBezierPath().getCurveCount() && !pointTouched; i++ ) {

	// Get next curve
	var bCurve = this.bezierCanvasHandler.getBezierPath().getCurveAt( i );
	
	// Find drag point?
	//  (try control point FIRST as they move WITH the start- and end- points!)
	if( this.bezierCanvasHandler.pointIsNearPosition(bCurve.getStartControlPoint(), left, top, clickTolerance) ) {
	    
	    this.bezierCanvasHandler.currentDragPoint = bCurve.getStartControlPoint();
	    this.bezierCanvasHandler.draggedPointID = this.bezierCanvasHandler.bezierPath.START_CONTROL_POINT;
	    this.bezierCanvasHandler.draggedCurveIndex = i;
	    pointTouched = true;

	} else if( this.bezierCanvasHandler.pointIsNearPosition(bCurve.getEndControlPoint(), left, top, clickTolerance) ) {
	    
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
	    if( this.bezierCanvasHandler.pointIsNearPosition(bCurve.getStartPoint(), left, top, clickTolerance) ) {

		this.bezierCanvasHandler.currentDragPoint = bCurve.getStartPoint();
		this.bezierCanvasHandler.draggedPointID = this.bezierCanvasHandler.bezierPath.START_POINT;
		this.bezierCanvasHandler.draggedCurveIndex = i;
		pointTouched = true;
		
	    } else if( this.bezierCanvasHandler.pointIsNearPosition(bCurve.getEndPoint(), left, top, clickTolerance) ) {

		this.bezierCanvasHandler.currentDragPoint = bCurve.getEndPoint();
		this.bezierCanvasHandler.draggedPointID = this.bezierCanvasHandler.bezierPath.END_POINT;
		this.bezierCanvasHandler.draggedCurveIndex = i;
		pointTouched = true;
		
	    } 

	} // END for
    } // END if

    
    if( !pointTouched ) {
	this.bezierCanvasHandler.draggedPointID = -1;
	this.bezierCanvasHandler.draggedCurveIndex = -1;
    }
    
}


IKRS.BezierCanvasHandler.prototype.drawBezierPath = function( context,
							      bezierPath,
							      drawOffset,
							      drawStartPoint,
							      drawEndPoint,
							      drawStartControlPoint,
							      drawEndControlPoint ) { 

    //window.alert( "# of bezier curves: " + bezierPath.getCurveCount() );


    // Clear screen?
    if( document.forms["bezier_form"].elements["clear_on_repaint"].checked ) {

	context.fillStyle = "#FFFFFF";
	context.fillRect( 0, 0, 512, 768 );
	
    }

    
    for( var i = 0; i < bezierPath.getCurveCount(); i++ ) {


	var bCurve = bezierPath.getCurveAt( i );


	// Clear linear path for debugging?
	if( document.forms["bezier_form"].elements["draw_linear_path_segments"].checked ) {
	    
	    context.strokeStyle = "#c8c8ff";
	    context.beginPath();
	    context.moveTo( bCurve.getStartPoint().x + drawOffset.x,
			    bCurve.getStartPoint().y + drawOffset.y );
	    context.lineTo( bCurve.getEndPoint().x + drawOffset.x,
			    bCurve.getEndPoint().y + drawOffset.y );
	    context.stroke();

	}


	// Draw the actual bezier curve
	this.drawBezierCurve( context,
			      bCurve,
			      drawOffset,
			      drawStartPoint,
			      drawEndPoint,
			      drawStartControlPoint,
			      drawEndControlPoint );


	

    }

}


IKRS.BezierCanvasHandler.prototype.mouseUpHandler = function( e ) {
    // window.alert( "mouse up. Event: " + e + ", e.pageX=" + e.pageX + ", e.pageY=" + e.pageY );
    // Clear mouse down position
    this.bezierCanvasHandler.latestMouseDownPosition = null; 
    this.bezierCanvasHandler.latestMouseDragPosition = null; 
    this.bezierCanvasHandler.currentDragPoint = null;
    this.bezierCanvasHandler.draggedPointID = -1;

    // And repaint the curve (to make the eventually hidden drag points to disappear)
    /*
    this.bezierCanvasHandler.drawBezierCurve( this.bezierCanvasHandler.context, 
					      this.bezierCanvasHandler.bezierCurve, 
					      this.bezierCanvasHandler.drawOffset,
					      (this.bezierCanvasHandler.draggedPointID != 0),  // drawStartPoint
					      (this.bezierCanvasHandler.draggedPointID != 3),  // drawEndPoint
					      (this.bezierCanvasHandler.draggedPointID != 1),  // drawStartControlPoint
					      (this.bezierCanvasHandler.draggedPointID != 2)   // drawEndControlPoint
					    );
    */
    /*
    this.bezierCanvasHandler.drawBezierPath( this.bezierCanvasHandler.context, 
					     this.bezierCanvasHandler.bezierPath, 
					     this.bezierCanvasHandler.drawOffset,
					     (this.bezierCanvasHandler.draggedPointID != this.bezierCanvasHandler.bezierPath.START_POINT),  // drawStartPoint
					     (this.bezierCanvasHandler.draggedPointID != this.bezierCanvasHandler.bezierPath.END_POINT),  // drawEndPoint
					     (this.bezierCanvasHandler.draggedPointID != this.bezierCanvasHandler.bezierPath.START_CONTROL_POINT),  // drawStartControlPoint
					     (this.bezierCanvasHandler.draggedPointID != this.bezierCanvasHandler.bezierPath.END_CONTROL_POINT)   // drawEndControlPoint
					   );
					   */
    this.bezierCanvasHandler.redraw();
}

IKRS.BezierCanvasHandler.prototype.mouseMoveHandler = function( e ) {
   //window.alert( "mouse move. Event: " + e + ", e.pageX=" + e.pageX + ", e.pageY=" + e.pageY + ", lastMouseDownPosition=" + this.bezierCanvasHandler.latestMouseDownPosition + ", currentDragPoint=" + this.bezierCanvasHandler.currentDragPoint );
    
    if( this.bezierCanvasHandler.latestMouseDownPosition ) {

	if( this.bezierCanvasHandler.currentDragPoint ) {

	    // Update dragges point's position
	    var moveX = this.bezierCanvasHandler.latestMouseDragPosition.x - e.pageX;
	    var moveY = this.bezierCanvasHandler.latestMouseDragPosition.y - e.pageY;
	    /*
	    this.bezierCanvasHandler.currentDragPoint.add( new THREE.Vector2(-moveX,-moveY) );
	    
	    // window.alert( "Point moved by (" + moveX + ", " + moveY + ")" );
	    
	    // Re-calculate the segment cache
	    //this.bezierCanvasHandler.getBezierCurve().updateArcLengths();
	    //window.alert( "bezierCanvasHandler.getBezierPath()=" + this.bezierCanvasHandler.getBezierPath() );
	    this.bezierCanvasHandler.getBezierPath().getCurveAt( this.bezierCanvasHandler.draggedCurveIndex ).updateArcLengths();
	    */

	    this.bezierCanvasHandler.getBezierPath().moveCurvePoint( this.bezierCanvasHandler.draggedCurveIndex,
								     this.bezierCanvasHandler.draggedPointID,
								     new THREE.Vector2(-moveX,-moveY)
								   );
	    

	    // And repaint the curve
	    /*
	    this.bezierCanvasHandler.drawBezierCurve( this.bezierCanvasHandler.context, 
						      this.bezierCanvasHandler.bezierCurve, 
						      this.bezierCanvasHandler.drawOffset,
						      (this.bezierCanvasHandler.draggedPointID != 0),  // drawStartPoint
						      (this.bezierCanvasHandler.draggedPointID != 3),  // drawEndPoint
						      (this.bezierCanvasHandler.draggedPointID != 1),  // drawStartControlPoint
						      (this.bezierCanvasHandler.draggedPointID != 2)   // drawEndControlPoint
						    );
						    */
	    /*
	    this.bezierCanvasHandler.drawBezierPath( this.bezierCanvasHandler.context, 
						     this.bezierCanvasHandler.bezierPath, 
						     this.bezierCanvasHandler.drawOffset,
						     (this.bezierCanvasHandler.draggedPointID != 0),  // drawStartPoint
						     (this.bezierCanvasHandler.draggedPointID != 3),  // drawEndPoint
						     (this.bezierCanvasHandler.draggedPointID != 1),  // drawStartControlPoint
						     (this.bezierCanvasHandler.draggedPointID != 2)   // drawEndControlPoint
						   );
	    */
	    this.bezierCanvasHandler.redraw();
	}
	

	this.bezierCanvasHandler.latestMouseDownPosition.set( e.pageX, e.pageY );
	this.bezierCanvasHandler.latestMouseDragPosition.set( e.pageX, e.pageY );
	
    }
}


//window.alert( "IKRS.BezierCanvasHandler=" + IKRS.BezierCanvasHandler );
//window.alert( "IKRS.BezierCanvasHandler.prototype=" + IKRS.BezierCanvasHandler.prototype );