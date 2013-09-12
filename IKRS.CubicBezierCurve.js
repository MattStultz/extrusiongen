/**
 * @author Ikaros Kappler
 * @date 2013-08-15
 * @version 1.0.0
 **/

IKRS.CubicBezierCurve = function ( p_startPoint,        // THREE.Vector2
				   p_endPoint,          // THREE.Vector2
				   p_startControlPoint, // THREE.Vector2
				   p_endControlPoint    // THREE.Vector2
				 ) {
    
    //window.alert( "[IKRS.CubicBezierCurve] constructor called." );
    
    // Call super constructor
    IKRS.Object.call( this );
        
    // p0: start of the curve
    // p3: end of the curve
    
    // p1: help-point of p0
    // p2: help-point of p3
    
    this.startPoint         = p_startPoint;
    this.startControlPoint  = p_startControlPoint;
    this.endPoint           = p_endPoint;
    this.endControlPoint    = p_endControlPoint;
    
    
    this.curveIntervals     = 30;
    
    // An array of points
    this.segmentCache       = [];

    // An array of floats
    this.segmentLengths     = [];
    
    // float
    this.arcLength          = null;
	
    
    this.updateArcLengths();
};

IKRS.CubicBezierCurve.prototype = new IKRS.Object();
IKRS.CubicBezierCurve.prototype.constructor = IKRS.CubicBezierCurve; 
    
IKRS.CubicBezierCurve.prototype.START_POINT         = 0;
IKRS.CubicBezierCurve.prototype.START_CONTROL_POINT = 1;
IKRS.CubicBezierCurve.prototype.END_CONTROL_POINT   = 2;
IKRS.CubicBezierCurve.prototype.END_POINT           = 3;

IKRS.CubicBezierCurve.prototype.moveCurvePoint = function( pointID,           // int
							   moveAmount,        // THREE.Vector2
							   moveControlPoint,  // boolean
							   updateArcLengths   // boolean
					      ) {
    if( pointID == this.START_POINT ) {

	this.getStartPoint().add( moveAmount );	
	if( moveControlPoint )
	    this.getStartControlPoint().add( moveAmount );

    } else if( pointID == this.START_CONTROL_POINT ) {

	this.getStartControlPoint().add( moveAmount );

    } else if( pointID == this.END_CONTROL_POINT ) {
	
	this.getEndControlPoint().add( moveAmount );

    } else if( pointID == this.END_POINT ) {

	this.getEndPoint().add( moveAmount );
	if( moveControlPoint )
	    this.getEndControlPoint().add( moveAmount );

    } else {

	console.log( "[IKRS.CubicBezierCurve.moveCurvePoint] pointID '" + pointID +"' invalid." );

    }


    
    if( updateArcLengths )
	this.updateArcLengths();
}

IKRS.CubicBezierCurve.prototype.getLength = function() {
    return this.arcLength;
}
    
IKRS.CubicBezierCurve.prototype.updateArcLengths = function() {
    var 
    //x1 = this.startPoint.x, 
    //y1 = this.startPoint.y, 
    //x2, y2,
    pointA = new THREE.Vector2( this.startPoint.x,
				this.startPoint.y
			      ),
    pointB = new THREE.Vector2( 0, 0 ),
    curveStep = 1.0/this.curveIntervals;
    
    var   u = curveStep; 

    // Clear segment cache
    this.segmentCache = [];
    // Push start point into buffer
    this.segmentCache.push( this.startPoint );
    
    this.segmentLengths = [];
    
    this.arcLength = 0.0;

    //var point;
    for( var i = 0; i < this.curveIntervals; i++) {
	
	pointB = this.getPoint( (i+1) * curveStep );  // parameter is 'u' (not 't')
	
	
	// Store point into cache
	this.segmentCache.push( pointB ); // new THREE.Vector2(x2,y2) );

	// Calculate segment length
	//var tmpLength = Math.sqrt( Math.pow(x1-x2,2) + Math.pow(y1-y2,2) );
	var tmpLength = Math.sqrt( Math.pow(pointA.x-pointB.x,2) + Math.pow(pointA.y-pointB.y,2) );
	this.segmentLengths.push( tmpLength );
	this.arcLength += tmpLength;
	
        //x1 = point.x; // x2;
        //y1 = point.y; // y2;
	pointA = pointB;
        u += curveStep;
    } // END for


    // Check if there are enough segments so the max segment length is not bigger than 20px.
    // Each time the curce gets too long add more segments
    /* There's something going wrong
    if( this.arcLength/this.curveIntervals > 20 ) {

	//window.alert( "rescaling ..." );
	
	this.curveIntervals = this.arcLength / 20; 
	// recalculate (will only happen once)
	this.updateArcLengths();

    } else if( this.arcLength/this.curveIntervals < 10 ) {

	// But there should not be too many segments if the curve gets shorter
	this.curveIntervals = this.arcLength / 9; 
	// recalculate (will only happen once)
	this.updateArcLengths();

    }
    */

    //window.alert( "segmentCache=" + this.segmentCache + ", segmentLengths=" + this.segmentLengths + ", arcLength=" + this.arcLength );

}; // END function


IKRS.CubicBezierCurve.prototype.getStartPoint = function() {
    return this.startPoint;
};

IKRS.CubicBezierCurve.prototype.getEndPoint = function() {
    return this.endPoint;
};

IKRS.CubicBezierCurve.prototype.getStartControlPoint = function() {
    return this.startControlPoint;
};

IKRS.CubicBezierCurve.prototype.getEndControlPoint = function() {
    return this.endControlPoint;
};

IKRS.CubicBezierCurve.prototype.getPoint = function( t ) {
    
    // Perform some powerful math magic
    var x = this.startPoint.x * Math.pow(1.0-t,3) + this.startControlPoint.x*3*t*Math.pow(1.0-t,2)
	+ this.endControlPoint.x*3*Math.pow(t,2)*(1.0-t)+this.endPoint.x*Math.pow(t,3);
    
    var y = this.startPoint.y*Math.pow(1.0-t,3)+this.startControlPoint.y*3*t*Math.pow(1.0-t,2)
	+ this.endControlPoint.y*3*Math.pow(t,2)*(1.0-t)+this.endPoint.y*Math.pow(t,3);
    
    return new THREE.Vector2( x, y );
};

IKRS.CubicBezierCurve.prototype.getPointAt = function( u ) {  
    
    //return this.getPointAt( t * this.arcLength );
    return this.getPoint( u / this.arcLength );
};


IKRS.CubicBezierCurve.prototype.getTangent = function( t ) {

    var a = this.getStartPoint();
    var b = this.getStartControlPoint();
    var c = this.getEndControlPoint();
    var d = this.getEndPoint();  
    
    // THIS IS CORRECT (it is the original formula with tons of arithmetic operations)
    /* 
    var tX = -3 * a.x * Math.pow( 1-t, 2 ) +
	b.x * (3 * Math.pow(1-t,2) - 6 *(1-t)*t ) +
	c.x * (6 *(1-t)*t - 3*t*t) +
	3*d.x*t*t;
    var tY = -3 * a.y * Math.pow( 1-t, 2 ) +
	b.y * (3 * Math.pow(1-t,2) - 6 *(1-t)*t ) +
	c.y * (6 *(1-t)*t - 3*t*t) +
	3*d.y*t*t;	
	*/

    // This is the shortened one
    var t2 = t * t;
    var t3 = t * t2;
    // (1 - t)^2 = (1-t)*(1-t) = 1 - t - t + t^2 = 1 - 2*t + t^2
    var nt2 = 1 - 2*t + t2;

    var tX = -3 * a.x * nt2 + 
    b.x * (3 * nt2 - 6 *(t-t2) ) +
	c.x * (6 *(t-t2) - 3*t2) +
	3*d.x*t2;
    var tY = -3 * a.y * nt2 + 
	b.y * (3 * nt2 - 6 *(t-t2) ) +
	c.y * (6 *(t-t2) - 3*t2) +
	3*d.y*t2;
    
    // Note: my implementation does NOT normalize tangent vectors!
    return new THREE.Vector2( tX, tY );
    
}

IKRS.CubicBezierCurve.prototype.convertU2T = function( u ) {

    return Math.max( 0.0, 
		     Math.min( 1.0, 
			       ( u / this.arcLength ) 
			     )
		   );

}

IKRS.CubicBezierCurve.prototype.getTangentAt = function( u ) {

    return this.getTangent( this.convertU2T(u) );

}

IKRS.CubicBezierCurve.prototype.getPerpendicularAt = function( u ) {

    return this.getPerpendicular( this.convertU2T(u) );
							

}

IKRS.CubicBezierCurve.prototype.getPerpendicular = function( t ) {

    var tangentVector = this.getTangent( t );
    var perpendicular = new THREE.Vector3( tangentVector.y, - tangentVector.x );
    return perpendicular;

}


IKRS.CubicBezierCurve.prototype.computeBoundingBox = function() {

    return IKRS.BoundingBox2.computeFromPoints( this.segmentCache );
}


IKRS.CubicBezierCurve.prototype.clone = function() {

    var curve = new IKRS.CubicBezierCurve( this.getStartPoint().clone(),
					   this.getEndPoint().clone(),
					   this.getStartControlPoint().clone(),
					   this.getEndControlPoint().clone()
					 );
    //curve.updateArcLengths();
    return curve;
}

IKRS.CubicBezierCurve.prototype.equals = function( curve ) {
    
    if( !curve )
	return false;
    
    if( !curve.startPoint ||
	!curve.endPoint ||
	!curve.startControlPoint ||
	!curve.endControlPoint )
	return false;

 
    return this.startPoint.equals(curve.startPoint) 
	&& this.endPoint.equals(curve.endPoint)
	&& this.startControlPoint.equals(curve.startControlPoint)
	&& this.endControlPoint.equals(curve.endControlPoint);
	
}


IKRS.CubicBezierCurve.prototype.toJSON = function( prettyFormat ) {
    
    var jsonString = "{ " + // begin object
        ( prettyFormat ? "\n\t" : "" ) +
	"\"startPoint\" : [" + this.getStartPoint().x + "," + this.getStartPoint().y + "], " +
	( prettyFormat ? "\n\t" : "" ) +
	"\"endPoint\" : [" + this.getEndPoint().x + "," + this.getEndPoint().y + "], " +
	( prettyFormat ? "\n\t" : "" ) +
	"\"startControlPoint\": [" + this.getStartControlPoint().x + "," + this.getStartControlPoint().y + "], " +
	( prettyFormat ? "\n\t" : "" ) +
	"\"endControlPoint\" : [" + this.getEndControlPoint().x + "," + this.getEndControlPoint().y + "]" +
	( prettyFormat ? "\n\t" : "" ) +
	" }";  // end object
    
    return jsonString;
}


IKRS.CubicBezierCurve.fromJSON = function( jsonString ) {
    
    var obj = JSON.parse( jsonString );
    return IKRS.CubicBezierCurve.fromObject( obj );
}


IKRS.CubicBezierCurve.fromObject = function( obj ) {
    
    if( typeof obj !== "object" ) 
	throw "[IKRS.CubicBezierCurve.fromArray] Can only build from object.";


    if( !obj.startPoint )
	throw "[IKRS.CubicBezierCurve.fromObject] Object member \"startPoint\" missing.";
    if( !obj.endPoint )
	throw "[IKRS.CubicBezierCurve.fromObject] Object member \"endPoint\" missing.";
    if( !obj.startControlPoint )
	throw "[IKRS.CubicBezierCurve.fromObject] Object member \"startControlPoint\" missing.";
    if( !obj.endControlPoint )
	throw "[IKRS.CubicBezierCurve.fromObject] Object member \"endControlPoint\" missing.";
    
    return new IKRS.CubicBezierCurve( new THREE.Vector2(obj.startPoint[0],        obj.startPoint[1]),
				      new THREE.Vector2(obj.endPoint[0],          obj.endPoint[1]),
				      new THREE.Vector2(obj.startControlPoint[0], obj.startControlPoint[1]),
				      new THREE.Vector2(obj.endControlPoint[0],   obj.endControlPoint[1])
				    );
}


/*
var tmpBC = new IKRS.CubicBezierCurve( new THREE.Vector2(10,20),
				       new THREE.Vector2(40,40),
				       new THREE.Vector2(60,40),
				       new THREE.Vector2(80,20)
				     );
var tmpJSON = tmpBC.toJSON()
window.alert( "toJSON(...)=" + tmpJSON );
window.alert( "fromJSON(...)=" + IKRS.CubicBezierCurve.fromJSON(tmpJSON) );
*/
                                               

//window.alert( "IKRS.CubicBezierCurve=" +IKRS.CubicBezierCurve );
//window.alert( "IKRS.CubicBezierCurve.prototype=" + IKRS.CubicBezierCurve.prototype );
