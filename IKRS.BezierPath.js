/**
 * @author Ikaros Kappler
 * @date 2013-08-19
 * @version 1.0.0
 **/



IKRS.BezierPath = function( pathPoints ) {

    //window.alert( "bezierCurves=" + bezierCurves );
    //window.alert( "pathPoints=" + pathPoints );

    IKRS.Object.call( this );

    if( !pathPoints )
	pathPoints = [];

    
    this.bezierCurves = [];
    for( var i = 1; i < pathPoints.length; i++ ) {

	var bounds = new THREE.Box2( pathPoints[i].x - pathPoints[i-1].x, 
				     pathPoints[i].y - pathPoints[i-1].y
				   );

	// window.alert( "pathSegment=(" + pathPoints[i-1].x + "," + pathPoints[i-1].y + ") to (" + pathPoints[i].x + "," + pathPoints[i].y + "); bounds=(" + bounds.max + ", " + bounds.min + ")" );


	// Create a new Bezier curve inside the box
	var bCurve =  new IKRS.CubicBezierCurve( pathPoints[i-1],
						 pathPoints[i],
						 new THREE.Vector2( pathPoints[i-1].x, // + bounds.max/2,
								    pathPoints[i-1].y - bounds.min/2
								  ),
						 // This control point will be auto-adjusted in the next step
						 new THREE.Vector2( pathPoints[i].x + bounds.max/2,
								    pathPoints[i].y // - bounds.min/2
								  )
					       );
	this.bezierCurves.push( bCurve );
	
	// Auto adjust the second control point (should be on a linear sub-space)
	if( this.bezierCurves.length >= 2 ) {
	    this.adjustSuccessorControlPoint( this.bezierCurves.length-2, // curveIndex, 
					      true,                       // obtain handle length?
					      true                        // update arc lengths
					    );
	}

    }

}

IKRS.BezierPath.prototype = new IKRS.Object();
IKRS.BezierPath.prototype.constructor = IKRS.BezierPath;

// These variables equal the values from IKRS.CubicBezierCurve
IKRS.BezierPath.prototype.START_POINT         = 0;
IKRS.BezierPath.prototype.START_CONTROL_POINT = 1;
IKRS.BezierPath.prototype.END_CONTROL_POINT   = 2;
IKRS.BezierPath.prototype.END_POINT           = 3;


IKRS.BezierPath.prototype.getCurveCount = function() {
    return this.bezierCurves.length;
}

IKRS.BezierPath.prototype.getCurveAt = function( curveIndex ) {
    return this.bezierCurves[ curveIndex ];
}


IKRS.BezierPath.prototype.moveCurvePoint = function( curveIndex,      // int
						     pointID,         // int
						     moveAmount       // THREE.Vector2
						   ) {
    var bCurve = this.getCurveAt( curveIndex );
    bCurve.moveCurvePoint( pointID,
			   moveAmount,
			   true,       // move control point, too
			   true        // updateArcLengths
			 );
    //window.alert( "old.x=" + bCurve.getStartPoint().x + ", new.x=" + (this.getCurveAt( curveIndex ).getStartPoint()).x ); 

    // If inner point and NOT control point
    //  --> move neightbour
    if( pointID == this.START_POINT && curveIndex > 0 ) {

	// Set predecessor's control point!
	var predecessor = this.getCurveAt( curveIndex-1 );
	predecessor.moveCurvePoint( this.END_CONTROL_POINT, 
				    moveAmount,
				    true,                    // move control point, too
				    true                     // updateArcLengths
				  );

    } else if( pointID == this.END_POINT && curveIndex+1 < this.bezierCurves.length ) {

	// Set successcor
	var successor = this.getCurveAt( curveIndex+1 );
	successor.moveCurvePoint( this.START_CONTROL_POINT, 
				  moveAmount, 
				  true,                  // move control point, too
				  true                   // updateArcLengths
			  );
			  

    } else if( pointID == this.START_CONTROL_POINT && curveIndex > 0 ) {
	
	this.adjustPredecessorControlPoint( curveIndex, 
					    true,            // obtain handle length?
					    true             // update arc lengths
					  );
					  
    } else if( pointID == this.END_CONTROL_POINT && curveIndex+1 < this.getCurveCount() ) {
	
	this.adjustSuccessorControlPoint( curveIndex, 
					  true,            // obtain handle length?
					  true             // update arc lengths
					);
					  
    }

    //bCurve.updateArcLengths();

}


IKRS.BezierPath.prototype.adjustPredecessorControlPoint = function( curveIndex,          // int
								    obtainHandleLength,  // boolean
								    updateArcLengths     // boolean
								  ) {
    
    if( curveIndex <= 0 )
	return false;

    /*
    return this.adjustNeighbourControlPoint( this.getCurveAt( curveIndex ),   // mainCurve, 
					     this.getCurveAt( curveIndex-1 ), //neighbourCurve
					     obtainHandleLength,
					     updateArcLengths
					   );
*/
    var mainCurve      = this.getCurveAt( curveIndex );
    var neighbourCurve = this.getCurveAt( curveIndex-1 );
    return this.adjustNeighbourControlPoint( mainCurve,
					     neighbourCurve,
					     mainCurve.getStartPoint(),            // the reference point
					     mainCurve.getStartControlPoint(),     // the dragged control point
					     neighbourCurve.getEndPoint(),         // the neighbour's point
					     neighbourCurve.getEndControlPoint(),  // the neighbour's control point to adjust
					     obtainHandleLength,
					     updateArcLengths
					   );
}

IKRS.BezierPath.prototype.adjustSuccessorControlPoint = function( curveIndex,          // int
								  obtainHandleLength,  // boolean
								  updateArcLengths     // boolean
								) {
    
    if( curveIndex+1 > this.getCurveCount() )
	return false;


    var mainCurve      = this.getCurveAt( curveIndex );
    var neighbourCurve = this.getCurveAt( curveIndex+1 );
    return this.adjustNeighbourControlPoint( mainCurve,
					     neighbourCurve,
					     mainCurve.getEndPoint(),                // the reference point
					     mainCurve.getEndControlPoint(),         // the dragged control point
					     neighbourCurve.getStartPoint(),         // the neighbour's point
					     neighbourCurve.getStartControlPoint(),  // the neighbour's control point to adjust
					     obtainHandleLength,
					     updateArcLengths
					   );
}

// private
IKRS.BezierPath.prototype.adjustNeighbourControlPoint = function( mainCurve,
								  neighbourCurve,
								  mainPoint,
								  mainControlPoint,
								  neighbourPoint,
								  neighbourControlPoint,
								  obtainHandleLengths,  // boolean
								  updateArcLengths
								) {

    /*
    var neighbourPoint          = neighbourCurve.getEndPoint();
    var neighbourControlPoint   = neighbourCurve.getEndControlPoint();
    
    var mainPoint               = mainCurve.getStartPoint();
    var mainControlPoint        = mainCurve.getStartControlPoint();
    */

    // Calculate start handle length
    var mainHandleBounds        = new THREE.Vector2( mainControlPoint.x - mainPoint.x,
						     mainControlPoint.y - mainPoint.y
						);
    var neighbourHandleBounds   = new THREE.Vector2( neighbourControlPoint.x - neighbourPoint.x,
						     neighbourControlPoint.y - neighbourPoint.y
						   );
    var mainHandleLength        = Math.sqrt( Math.pow(mainHandleBounds.x,2) + Math.pow(mainHandleBounds.y,2) );
    var neighbourHandleLength   = Math.sqrt( Math.pow(neighbourHandleBounds.x,2) + Math.pow(neighbourHandleBounds.y,2) );

    if( mainHandleLength <= 0.1 ) 
	return; // no secure length available for division
    
    
    // Just invert the main handle
    
    neighbourControlPoint.set( neighbourPoint.x - mainHandleBounds.x * (neighbourHandleLength/mainHandleLength),
			       neighbourPoint.y - mainHandleBounds.y * (neighbourHandleLength/mainHandleLength)
			     );
    neighbourCurve.updateArcLengths();

}

//window.alert( "IKRS.BezierPath.prototype=" + IKRS.BezierPath.prototype );