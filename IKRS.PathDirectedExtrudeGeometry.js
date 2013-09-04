
/**
 * @author Ikaros Kappler
 * @date 2013-08-26
 * @version 1.0.0
 **/



IKRS.PathDirectedExtrudeGeometry = function( shape,
					     path,
					     shapedPath,
					     options
					   ) {
    

    // Call super 'constructor'
    THREE.Geometry.call( this );
 

    //window.alert( "options.perpendicularHullStrength=" + options.perpendicularHullStrength + ", options.closePathEnd=" + options.closePathEnd );
    if( options.hollow && !options.perpendicularHullStrength )
	options.perpendicularHullStrength = 50;
    
    //var MAX_BEND = Math.PI;
    
    //window.alert( "hollow=" + options.hollow );

    
    // Fetch the points from the shape
    //var shapePoints = shape.extractAllPoints();
    //shape = shapePoints.shape;
    
    /*
    if( !options.pathBend )
	options.pathBend = Math.PI/4.0;  // 45 degrees for testing:)
	*/
    
    //var bendRatio = options.pathBend / MAX_BEND;

    var shapedPathBounds = shapedPath.computeBoundingBox();
    // An object with 
    //  - minX
    //  - minY
    //  - maxX
    //  - maxY
    var pathBounds       = path.getBoundingBox(); 
    
    


    // Iterate through path elements in n steps
    var vertexCount      = 0;
    // Used to determine the 'tangent' along the path
    //var lastPathPoint    = null;
    //var pathTangent      = null;
    //var pathTangentSlope = 0.0;

    var old_closePathEnd = options.closePathEnd;
    if( options.hollow )
	options.closePathEnd = false;
    
    options.buildPerpendicularHull = true;

    var innerPathResult = this.buildPathExtrusion( shape, 
						   path, 
						   shapedPath, 
						   options, 
						   pathBounds, 
						   shapedPathBounds, 
						   vertexCount );
    // Restore old closePathEnd option?
    //window.alert( options.closePathEnd );
    
    if( options.hollow ) {

	// Fetch the points from the shape
	var shapePoints        = shape.extractAllPoints().shape;

	// This is new
	var shapeBounds        = IKRS.BoundingBox2.computeFromPoints( shapePoints );
	
	// window.alert( (shapeBounds.getWidth()  + options.perpendicularHullStrength) );
	// Scale shape
	var shapeScaleX        = (shapeBounds.getWidth()  + options.perpendicularHullStrength) / shapeBounds.getWidth();   // 1.2
	var shapeScaleY        = (shapeBounds.getHeight() + options.perpendicularHullStrength) / shapeBounds.getHeight();  // 1.2
	
	/*
	window.alert( "shapeBounds.width=" + shapeBounds.getWidth() + 
		      ", shapeBounds.height=" + shapeBounds.getHeight() + 
		      ", shapeScaleX=" + shapeScaleX + 
		      ", shapeScaleY=" + shapeScaleY + 
		      ", options.perpendicularHullStrength=" + options.perpendicularHullStrength 
		    );
		    */
	
	var scaledShapePoints  = [];
	for( var i = 0; i < shapePoints.length; i++ ) {

	    var scaledPoint = new THREE.Vector2( shapePoints[ i ].x * shapeScaleX,
						 shapePoints[ i ].y * shapeScaleY
					       );
	    scaledShapePoints.push( scaledPoint );

	}
	var scaledShape        = new THREE.Shape( scaledShapePoints );


	// Build the outer hull
	/*var tmpShapePoints = shape.extractAllPoints().shape;
	for( var s in tmpShapePoints ) {
	    tmpShapePoints[s] = new THREE.Vector2( tmpShapePoints[s].x*2, tmpShapePoints[s].y*2 );
	    //tmpShapePoints[s] = tmpShapePoints[s].clone();
	    //tmpShapePoints[s] = tmpShapePoints[s].multiplyScalar( 50.0 );
	}
	var outerHullShape = new THREE.Shape( tmpShapePoints ); // shape.clone();
	*/
	//outerHullShape.multiplyScalar( 50.0 );
	//window.alert( "innerPathResult.perpendicularHullPoints=" + innerPathResult.perpendicularHullPoints );
	//window.alert( "tmpShapePoints=" + tmpShapePoints );
	var outerHullPath  = new THREE.Path( innerPathResult.perpendicularHullPoints );
	// THERE IS A BUG IN THREE.js INSIDE THE PATH.getBounds() computation!
	// Don't use it.
	var outerHullPathBounds = IKRS.BoundingBox2.computeFromPoints( innerPathResult.perpendicularHullPoints );
	//window.alert( "shapedPathBounds=" + shapedPathBounds.toString() + ", outerHullPathBounds=" + outerHullPathBounds.toString() );
	

	// Display difference between inner and outer shape path
	/*
	for( var i = 0; i <= options.curveSegments; i++ ) {

	    var t = i / options.curveSegments;
	    var tmpInner = shapedPath.getPoint( t );
	    var tmpOuter = outerHullPath.getPoint( t );
	    
	    window.alert( "innerShapePoint["+i+"]=(" + tmpInner.x + ", " + tmpInner.y + "), innerShapePoint["+i+"]=(" + tmpOuter.x + ", " + tmpOuter.y + "), difference=(" + (tmpOuter.x-tmpInner.x) + ", " + (tmpOuter.y-tmpInner.y) + ")" );

	}
	*/

	// Scale the shape!
	

	
	//window.alert( "innerPathResult.extendedExtrusionPathPoints=" + innerPathResult.extendedExtrusionPathPoints );
	var extendedExtrusionPath       = new THREE.Path( innerPathResult.extendedExtrusionPathPoints );
	var extendedExtrusionPathBounds = IKRS.BoundingBox2.computeFromPoints( innerPathResult.extendedExtrusionPathPoints );
	
	
	options.hollow                 = false; // in-place
	options.buildPerpendicularHull = false;
	var outerPathResult = this.buildPathExtrusion( scaledShape, // shape, 
							   extendedExtrusionPath, 
							   outerHullPath, 
							   options, 
							   extendedExtrusionPathBounds, 
							   outerHullPathBounds, 
							   innerPathResult.vertexCount );
	/*
	var outerPathResult = this.buildPerpendicularHull( scaledShape, // shape, 
							   extendedExtrusionPath, 
							   outerHullPath, 
							   options, 
							   extendedExtrusionPathBounds, 
							   outerHullPathBounds, 
							   innerPathResult.vertexCount );
							   */
	/*
	var outerPathResult = this.buildPerpendicularHull( shape, 
							   path, 
							   outerHullPath, // shapedPath, 
							   options, 
							   pathBounds, 
							   outerHullPathBounds, // shapedPathBounds, 
							   innerPathResult.vertexCount );
	*/
	/*
	options.hollow = false; // in-place!
	var outerPathResult = this.buildPathExtrusion( shape, 
						       path, 
						       outerHullPath, 
						       options, 
						       pathBounds, 
						       outerHullPathBounds, 
						       innerPathResult.vertexCount );
*/

	
	// Build connection between outer and inner hull?
	//window.alert( "options.closePathEnd=" + options.closePathEnd );
	if( old_closePathEnd ) { // options.closePathEnd ) {

	    //window.alert( "Closing path end ..." );
	    // Note: outerPathResult.outerPointIndices.begin and innerPathResult.outerPointIndices.end
	    //       have the same lengths!
	    for( var i = 1; i < outerPathResult.outerPointIndices.begin.length; i++ ) {
	    	

		// if( triangulate )
		this.faces.push( new THREE.Face3( innerPathResult.outerPointIndices.begin[i-1],
						  outerPathResult.outerPointIndices.begin[i-1],
						  outerPathResult.outerPointIndices.begin[i]
						) );
		this.faces.push( new THREE.Face3( innerPathResult.outerPointIndices.begin[i],
						  innerPathResult.outerPointIndices.begin[i-1],
						  outerPathResult.outerPointIndices.begin[i]
						) );
		
		
		
		
	    }

	    // Connect first with last shape index
	    // if( triangulate )	
	    this.faces.push( new THREE.Face3( innerPathResult.outerPointIndices.begin[ outerPathResult.outerPointIndices.begin.length-1 ],
					      outerPathResult.outerPointIndices.begin[ outerPathResult.outerPointIndices.begin.length-1 ],
					      outerPathResult.outerPointIndices.begin[ 0 ]
					    ) );	
	    this.faces.push( new THREE.Face3( innerPathResult.outerPointIndices.begin[0],
					      innerPathResult.outerPointIndices.begin[ innerPathResult.outerPointIndices.begin.length-1 ],
					      outerPathResult.outerPointIndices.begin[0]
					    ) );

	} // END if [options.closePathEnd]
					



    } // END if [options.hollow]

    this.computeCentroids();
    this.computeFaceNormals();
}


IKRS.PathDirectedExtrudeGeometry.prototype = new THREE.Geometry();
IKRS.PathDirectedExtrudeGeometry.prototype.constructor = IKRS.PathDirectedExtrudeGeometry;


/**
 * This function creates one single path extrusion along the given path.
 **/
IKRS.PathDirectedExtrudeGeometry.prototype.buildPathExtrusion = function( shape, 
									  path, 
									  shapedPath, 
									  options, 
									  pathBounds, 
									  shapedPathBounds, 
									  vertexCount 
									) {

    var shapePoints = shape.extractAllPoints();
    shape = shapePoints.shape;

    var result_perpendicularPathPoints   = [];
    //result_perpendicularPathPoints.push( shapedPath.getPoint(1) );
    var result_outerPointIndices_left    = [];
    var result_outerPointIndices_right   = [];
    var result_outerPointIndices_begin   = [];
    var result_outerPointIndices_end     = [];
    // Store the perpendicular shaped path for the case the mesh should be hollow
    // (required for the outer mesh)
    var result_extendedExtrusionPathPoints  = [];
    

    
    // Extend the extrusion path at begin and end.
    // Reason: otherwise the distance between inner and outer mesh at the path begin
    //         and -end would be 0 (zero).
    var pathBeginTangent = path.getTangent( 0.0 );
    // window.alert( "pathBeginTangent=(" + pathBeginTangent.x + ", " + pathBeginTangent.y + ")" );
    // Normalize tangent
    pathBeginTangent.normalize();
    // Set the hull-strength
    //pathBeginTangent.multiplyScalar( options.perpendicularHullStrength/2 );
    // Fetch old extrusion path point (at begin)
    //var pathBeginPoint   = path.getPoint( 0.0 );
    // Extend path by hull-strength (along the tangent)
    //pathBeginPoint.sub( pathBeginTangent );
    // And store as first path point :)
    //result_extendedExtrusionPathPoints.push( pathBeginPoint );
    // Note: The same will be done with the end-point after the for-loop


    //if( !options.pathBend )
    //	options.pathBend = Math.PI/4.0;  // 45 degrees for testing:)

    var lastPathPoint    = null;
    var pathTangent      = null;
    var pathTangentSlope = 0.0;
    
    // for( var i = 0; i <= options.curveSegments; i++ ) {
    var lastPerpendicularHullPoint = null;
    for( var i = options.curveSegments; i >= 0; i-- ) {

	var tSegment        = i / options.curveSegments;
	// This is a Vector2 (x,y)
	var pathPoint       = path.getPointAt( tSegment );
	var shapedPathPoint = shapedPath.getPoint( tSegment );
	var tHeight         = Math.min( 1.0, 
					(shapedPathBounds.getYMax() - shapedPathPoint.y) / shapedPathBounds.getHeight()
				      );
	
	
	// This only works with bezier curves!!!
	// (other paths have no perpendicular calculation implemented)
	if( options.buildPerpendicularHull ) {

	    // Remember perpendicular path points.
	    //var shapedPathTangent = shapedPath.getTangent( 1-tSegment );
	    // Normalize tangent?
	    //shapedPathTangent = shapedPathTangent.normalize();
	    // Convert tangent to perpendicular
	    //var shapedPathPerpendicular = new THREE.Vector2( shapedPathTangent.y, -shapedPathTangent.x );
	    var shapedPathPerpendicular = shapedPath.getPerpendicular( 1-tSegment );
	    //if( i == options.curveSegments )
	    //    shapedPathPerpendicular = new THREE.Vector2( -1, 0 );
	    // Normalize vector?
	    //window.alert( "shapedPathPerpendicular[" + i +"]=(" + shapedPathPerpendicular.x + ", " + shapedPathPerpendicular.y + "), t=" + tSegment + ", 1-t=" + (1-tSegment) );
	    // Normalize directive vector
	    shapedPathPerpendicular.normalize();
	    // And set to the default hull size
	    shapedPathPerpendicular.multiplyScalar( options.perpendicularHullStrength ); //50.0 );
	    var perpendicularHullPoint  = shapedPath.getPoint( 1-tSegment ); // shapedPathPoint.clone();
	    /*
	      if( i == 0 ) {
	      window.alert( "shapedPathPerpendicular[" + i +"]=(" + shapedPathPerpendicular.x + ", " + shapedPathPerpendicular.y + "), t=" + tSegment + ", 1-t=" + (1-tSegment) );
	      //shapedPathPerpendicular = new THREE.Vector2( -options.perpendicularHullStrength, 0 );
	      }
	    */
	    perpendicularHullPoint.add( shapedPathPerpendicular );
	    //var tmpX = shapedPathPoint.clone(); tmpX.add( new THREE.Vector3( 100, 100, 100 ) );
	    result_perpendicularPathPoints.push( perpendicularHullPoint );

	} // END if [buildPerpendicularHull]
	
	
	/*
	result_perpendicularPathPoints.push( shapedPath.getPoint( 1-tSegment ) );
	//result_perpendicularPathPoints[options.curveSegments - i - 1] = shapedPathPoint;
	*/
	
	//window.alert( "shapedPathPoint=(" + shapedPathPoint.x + ", " + shapedPathPoint.y + "), perpendicularHullPoint=(" + perpendicularHullPoint.x + ", " + perpendicularHullPoint.y + ")" );


	// Store path-point in extended path
	result_extendedExtrusionPathPoints.push( path.getPoint(1-tSegment) ); // pathPoint );

	
	//window.alert( "pathPoint=(" + pathPoint.x + ", " + pathPoint.y + ")" );

	if( i == options.curveSegments ) pathTangent = new THREE.Vector2( 0, 0 ); // No slope at first level?
	else                             pathTangent = new THREE.Vector2( pathPoint.x-lastPathPoint.x, pathPoint.y-lastPathPoint.y );
	
	// Calculate slope from tangent
	if( pathTangent.x == 0 ) pathTangentSlope = -Math.PI/2.0; // -90 deg
	else                     pathTangentSlope = Math.atan( pathTangent.y/pathTangent.x );
	
	// Don't forget to make a path curve by 'options.pathBend'
	//var pathBendAmount = options.pathBend * tHeight; // tSegment;
	
	var radiusFactor    = (shapedPathBounds.getXMax() - shapedPathPoint.x) / shapedPathBounds.getWidth();
	var heightFactor    = (shapedPathBounds.getYMax() - shapedPathPoint.y) / shapedPathBounds.getHeight();

	//for( var s = 0; s < shape.length; s++ ) { 
	var firstShapePointIndex = vertexCount;
	for( var s in shape ) {

	    
	    var shapePoint2 = shapePoints.shape[s];
	    var shapePoint3 = new THREE.Vector3( Math.sin(-pathTangentSlope) * shapePoint2.x,
						 shapePoint2.y, 
						 Math.cos(-pathTangentSlope) * shapePoint2.x
					       );
	    
	    shapePoint3.multiplyScalar( radiusFactor );
	    
	    // Translate along path		   
	    var pathHeightPoint = path.getPoint( tHeight );	    
	    shapePoint3.add( new THREE.Vector3( pathHeightPoint.x,  
						0, 
						pathHeightPoint.y 
					      ) 
			   ); // addSelf instead of add?!

			   
	    // Add path point?	    	    
	    // ... Vertex was replaced by Vector3 (Vertex is DEPRECATED!)
	    this.vertices.push( new THREE.Vector3( shapePoint3.x, 
						   shapePoint3.y, 
						   shapePoint3.z 
						 ) 
			      );



	    // Connect previous shape/level with current?
	    if( i < options.curveSegments ) { // > 0 ) {

		
		var soffset = (s==0) ? shape.length-1 : -1;
		// Triangulate?
		if( !options.triangulate ) {
		    
		    if( options.hollow ) {

			// Make hollow (inside out) by reversing the face indices
			this.faces.push( new THREE.Face4( vertexCount + soffset,
							  vertexCount,
							  vertexCount-shape.length,
							  vertexCount-shape.length + soffset
							) );
		    } else {
			
			this.faces.push( new THREE.Face4( vertexCount-shape.length + soffset,
							  vertexCount-shape.length,
							  vertexCount,
							  vertexCount + soffset
							) );
		    }
		    
		} else {
		    
		    // Triangulation=on
		    // -> add two Face3 facets instead of Face4!
		    // (Otherwise the STL export will fail as it only recognizes Face3)
		    if( options.hollow ) {

			// Make hollow (inside out) by reversing the face indices
			this.faces.push( new THREE.Face3( vertexCount + soffset,
							  vertexCount,
							  vertexCount-shape.length
							) );
			this.faces.push( new THREE.Face3( vertexCount-shape.length,
							  vertexCount-shape.length + soffset,
							  vertexCount + soffset
							) );
		    } else {
			
			this.faces.push( new THREE.Face3( vertexCount-shape.length,
							  vertexCount,
							  vertexCount + soffset
							) );
			this.faces.push( new THREE.Face3( vertexCount + soffset,
							  vertexCount-shape.length + soffset,
							  vertexCount-shape.length
							) );
		    }
		} // END else [triangulate]

	    } 

	    
	    // Close first and last shape/level (if at least 3 vertices are present: s > 1)
	    if( s > 1 ) {

		// If the mesh should be build hollow this is not yet the last segment
		if( i == options.curveSegments  && options.closePathBegin ) {

		    // Last segment
		    this.faces.push( new THREE.Face3( vertexCount,
						      vertexCount-1,
						      firstShapePointIndex
						    ) 
				   );
				   
		} else if( i == 0 && options.closePathEnd ) {
		    
		    //!!! !!!
		    
		    // First segment		    
		    this.faces.push( new THREE.Face3( firstShapePointIndex,
						      vertexCount-1,
						      vertexCount
						    ) 
				   );
				   
		}
		
	    }



	    // Remember plane's outer point indices
	    if( i == 0 ) {
		// At path begin
		result_outerPointIndices_begin.push( vertexCount );		
	    } else if( i == options.curveSegments ) {
		// At path end
		result_outerPointIndices_end.push( vertexCount );				
	    }
	    
	    if( s == 0 ) {
		// At shape path begin
		result_outerPointIndices_left.push( vertexCount );
	    } else if( s == shapePoints.length-1 ) {
		// At shape path end
		result_outerPointIndices_right.push( vertexCount );
	    }
	    
	    

	    vertexCount++;
	    lastPathPoint = pathPoint;
	    lastPerpendicularHullPoint = perpendicularHullPoint;
	} // END for [shape points]
    }
    
    // PROBLEM: the THREE.js Path implementation does not calculate the path tangent
    //          in a proper way at t=0 :(
    // SOLUTION: Add an additional path point with one pixel difference ;)
    // ???
    //var additionalPerpendicularHullPoint = lastPerpendicularHullPoint.clone();
    //additionalPerpendicularHullPoint.add( new THREE.Vector2(1,1) );
    //result_perpendicularPathPoints.push( additionalPerpendicularHullPoint );

    //result_perpendicularPathPoints.push( shapedPath.getPoint(0) );

    
    // Extend the extrusion path at begin and end.
    // Reason: otherwise the distance between inner and outer mesh at the path begin
    //         and -end would be 0 (zero).
    // Note: the begin-point was already added before the for-loop.
    var pathEndTangent = path.getTangent( 1.0 );
    // Normalize tangent
    pathEndTangent.normalize();
    // Set the hull-strength
    pathEndTangent.multiplyScalar( options.perpendicularHullStrength/2 );
    //window.alert( "pathEndTangent=(" + pathEndTangent.x + ", " + pathEndTangent.y + ")" );
    // Fetch old extrusion path point (at begin)
    var pathEndPoint   = path.getPoint( 1.0 );
    // Extend path by hull-strength (along the tangent)
    pathEndPoint.add( pathEndTangent );
    // And store as first path point :)
    result_extendedExtrusionPathPoints.push( pathEndPoint );


    
    //result_perpendicularPathPoints.push( shapedPath.getPoint(0) );
    
    return { perpendicularHullPoints: result_perpendicularPathPoints,
	     vertexCount: vertexCount,
	     outerPointIndices: { begin: result_outerPointIndices_begin,
				  end:   result_outerPointIndices_end,
				  left:  result_outerPointIndices_left,
				  right: result_outerPointIndices_right
				},
	     extendedExtrusionPathPoints: result_extendedExtrusionPathPoints
	   };
    //this.computeCentroids();
    //this.computeFaceNormals();
   
};




/**
 * This function creates one single path extrusion (here: from the perpendiculars!) along the given path.
 **/
IKRS.PathDirectedExtrudeGeometry.prototype.buildPerpendicularHull = function( shape, 
									      path, 
									      shapedPath, 
									      options, 
									      pathBounds, 
									      shapedPathBounds, 
									      vertexCount 
									    ) {

    var shapePoints = shape.extractAllPoints();
    shape = shapePoints.shape;

    if( !options.pathBend )
	options.pathBend = Math.PI/4.0;  // 45 degrees for testing:)

    var lastPathPoint    = null;
    var pathTangent      = null;
    var pathTangentSlope = 0.0;
    
    // for( var i = 0; i <= options.curveSegments; i++ ) {
    for( var i = options.curveSegments; i >= 0; i-- ) {

	var tSegment        = i / options.curveSegments;
	// This is a Vector2 (x,y)
	var pathPoint       = path.getPointAt( tSegment );	
	var shapedPathPoint = shapedPath.getPoint( tSegment );

	//var shapedPathTangent = shapedPath.getTangent( tSegment );
	// Convert tangent to perpendicular
	//var shapedPathPerpendicular = new THREE.Vector2( shapedPathTangent.y, -shapedPathTangent.x );
	//shapedPathPoint.add( shapedPathPerpendicular );

	var tHeight         = Math.min( 1.0, 
					(shapedPathBounds.getYMax() - shapedPathPoint.y) / shapedPathBounds.getHeight()
				      );
	
	//window.alert( "pathPoint=(" + pathPoint.x + ", " + pathPoint.y + ")" );

	if( i == options.curveSegments ) pathTangent = new THREE.Vector2( 0, 0 ); // No slope at first level
	else                             pathTangent = new THREE.Vector2( pathPoint.x-lastPathPoint.x, pathPoint.y-lastPathPoint.y );
	
	// Calculate slope from tangent
	if( pathTangent.x == 0 ) pathTangentSlope = -Math.PI/2.0; // 90 deg
	else                     pathTangentSlope = Math.atan( pathTangent.y/pathTangent.x );
	
	// Don't forget to make a path curve by 'options.pathBend'
	//var pathBendAmount = options.pathBend * tHeight; // tSegment;
	
	var radiusFactor    = (shapedPathBounds.getXMax() - shapedPathPoint.x) / shapedPathBounds.getWidth();
	var heightFactor    = (shapedPathBounds.getYMax() - shapedPathPoint.y) / shapedPathBounds.getHeight();

	//for( var s = 0; s < shape.length; s++ ) { 
	var firstShapePointIndex = vertexCount;
	for( var s in shape ) {

	    
	    var shapePoint2 = shapePoints.shape[s];
	    var shapePoint3 = new THREE.Vector3( Math.sin(-pathTangentSlope) * shapePoint2.x,
						 shapePoint2.y, 
						 Math.cos(-pathTangentSlope) * shapePoint2.x
					       );
	    
	    shapePoint3.multiplyScalar( radiusFactor );
	    
	    // Translate along path		   
	    var pathHeightPoint = path.getPoint( tHeight );	    
	    shapePoint3.add( new THREE.Vector3( pathHeightPoint.x,  
						0, 
						pathHeightPoint.y 
					      ) 
			   ); // addSelf instead of add?!

			   
	    // Add path point?	    	    
	    // ... Vertex was replaced by Vector3 (Vertex is DEPRECATED!)
	    this.vertices.push( new THREE.Vector3( shapePoint3.x, 
						   shapePoint3.y, 
						   shapePoint3.z 
						 ) 
			      );
	    // Connect previous shape/level with current?
	    if( i < options.curveSegments ) { // > 0 ) {

		
		var soffset = (s==0) ? shape.length-1 : -1;
		// Triangulate?
		if( !options.triangulate ) {
		    
		    if( options.hollow ) {

			// Make hollow (inside out) by reversing the face indices
			this.faces.push( new THREE.Face4( vertexCount + soffset,
							  vertexCount,
							  vertexCount-shape.length,
							  vertexCount-shape.length + soffset
							) );
		    } else {
			
			this.faces.push( new THREE.Face4( vertexCount-shape.length + soffset,
							  vertexCount-shape.length,
							  vertexCount,
							  vertexCount + soffset
							) );
		    }
		    
		} else {
		    
		    // Triangulation=on
		    // -> add two Face3 facets instead of Face4!
		    // (Otherwise the STL export will fail as it only recognizes Face3)
		    if( options.hollow ) {

			// Make hollow (inside out) by reversing the face indices
			this.faces.push( new THREE.Face3( vertexCount + soffset,
							  vertexCount,
							  vertexCount-shape.length
							) );
			this.faces.push( new THREE.Face3( vertexCount-shape.length,
							  vertexCount-shape.length + soffset,
							  vertexCount + soffset
							) );
		    } else {
			
			this.faces.push( new THREE.Face3( vertexCount-shape.length,
							  vertexCount,
							  vertexCount + soffset
							) );
			this.faces.push( new THREE.Face3( vertexCount + soffset,
							  vertexCount-shape.length + soffset,
							  vertexCount-shape.length
							) );
		    }
		} // END else [triangulate]

	    } 

	    // Close first and last shape/level (if at least 3 vertices are present: s > 1)
	    /*
	    if( s > 1 ) {

		// If the mesh should be build hollow this is not yet the last segment
		if( i == options.curveSegments ) { //&& !options.hollow ) {

		    // Last segment
		    this.faces.push( new THREE.Face3( vertexCount,
						      vertexCount-1,
						      firstShapePointIndex
						    ) 
				   );
		} else if( i == 0 && !options.hollow) {

		    // First segment
		    this.faces.push( new THREE.Face3( firstShapePointIndex,
						      vertexCount-1,
						      vertexCount
						    ) 
				   );
		}
		
	    }
	    */

	    vertexCount++;
	    lastPathPoint = pathPoint;
	} // END for [shape points]
    }
    
    

    //this.computeCentroids();
    //this.computeFaceNormals();
   
};




//IKRS.PathDirectedExtrudeGeometry.prototype = new THREE.Geometry();
//IKRS.PathDirectedExtrudeGeometry.prototype.constructor = IKRS.PathDirectedExtrudeGeometry;

//IKRS.PathDirectedExtrudeGeometry.prototype.computePathBounds

// window.alert( "IKRS.ShapedPathGeometry=" + IKRS.ShapedPathGeometry );