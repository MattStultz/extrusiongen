
/**
 * @author Ikaros Kappler
 * @date 2013-08-26
 * @modified 2014-03-30 Ikaros Kappler (options.meshHullType added).
 * @version 1.0.1
 **/


/**
 * The constructor.
 *
 * @param shape
 * @param path
 * @param shapedPath
 * @param options        [optional]
 *                       Supports following members:
 *                         - ... 
 *                          
 * @param vectorFactory  [optional]
 *                       If passed must have following function member:
 *                         createVector3( x, y, z ) : Vector3
 **/
IKRS.PathDirectedExtrudeGeometry = function( shape,
					     path,
					     shapedPath,
					     options,
					     
					     vectorFactory
					   ) {
    
    //window.alert( "typeof vectorFactory=" + (typeof vectorFactory) + ", " + JSON.stringify(vectorFactory) );

    // Call super 'constructor'
    THREE.Geometry.call( this );
 

    if( options.hollow && !options.perpendicularHullStrength )
	options.perpendicularHullStrength = 50;
    
    if( typeof options.closeShape === "undefined" )
	options.closeShape = true;
    
    if( typeof options.meshOffset === "undefined" ) 
	options.meshOffset = new THREE.Vector2( 0, 0 );

    if( typeof vectorFactory === "undefined" )
	vectorFactory = new IKRS.VectorFactory();
    

    
    //window.alert( JSON.stringify(vectorFactory.createVector3(1,2,3)) );



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

    var old_closePathEnd   = options.closePathEnd;
    var old_closePathBegin = options.closePathBegin;
    var old_meshHullType   = options.meshHullType;
    if( options.hollow ) {
	options.closePathEnd   = false;
	options.closePathBegin = false;
	options.meshHullType   = false; // The default value is "perpendicular"
    }
    
    options.buildPerpendicularHull = true;

    var innerPathResult = this.buildPathExtrusion( shape, 
						   path, 
						   shapedPath, 
						   options, 
						   pathBounds, 
						   shapedPathBounds, 
						   vertexCount,
						   
						   vectorFactory
						 );
    // Restore old closePathEnd option?
    //window.alert( options.closePathEnd );
    
    if( options.hollow ) {

	options.meshHullType = old_meshHullType; // DEFAULT (the inner shape is ALWAYS the shape itself)

	// Fetch the points from the shape
	var shapePoints        = shape.extractAllPoints().shape;

	// This is new
	var shapeBounds        = IKRS.BoundingBox2.computeFromPoints( shapePoints );
	
	// Scale shape
	var shapeScaleX        = (shapeBounds.getWidth()  + options.perpendicularHullStrength) / shapeBounds.getWidth();   // 1.2
	var shapeScaleY        = (shapeBounds.getHeight() + options.perpendicularHullStrength) / shapeBounds.getHeight();  // 1.2
	
	// MHMMM ... this only works if the cicular shape angle is PI (half arc)
	if( !options.closeShape )
	    shapeScaleY        = (shapeBounds.getHeight() + options.perpendicularHullStrength/2) / shapeBounds.getHeight();
	    //shapeScaleY /= 2.0;
	
	var scaledShapePoints  = [];
	for( var i = 0; i < shapePoints.length; i++ ) {

	    /*
	    var scaledPoint = vectorFactory.createVector2( shapePoints[ i ].x * shapeScaleX,
							   shapePoints[ i ].y * shapeScaleY
							 );
	    */
	    var scaledPoint = new THREE.Vector2( shapePoints[ i ].x * shapeScaleX,
						 shapePoints[ i ].y * shapeScaleY
					       );
	    scaledShapePoints.push( scaledPoint );

	}
	var scaledShape        = new THREE.Shape( scaledShapePoints );


	// Build the outer hull
	var outerHullPath  = new THREE.Path( innerPathResult.perpendicularHullPoints );
	// THERE IS A BUG IN THREE.js INSIDE THE PATH.getBounds() computation!
	// Don't use it.
	var outerHullPathBounds = IKRS.BoundingBox2.computeFromPoints( innerPathResult.perpendicularHullPoints );
	//window.alert( "shapedPathBounds=" + shapedPathBounds.toString() + ", outerHullPathBounds=" + outerHullPathBounds.toString() );
		
	
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
						       innerPathResult.vertexCount,
						     
						       vectorFactory
						     );

	
	// Build connection between outer and inner hull?
	if( old_closePathEnd ) { // options.closePathEnd ) {

	    //window.alert( "Closing path end ..." );
	    // Note: outerPathResult.outerPointIndices.begin and innerPathResult.outerPointIndices.end
	    //       have the same length!
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

	    // Connect first with last shape index ONLY if the shape is closed.
	    if( options.closeShape ) {
		
		// triangulate yes or no?
		this.faces.push( new THREE.Face3( innerPathResult.outerPointIndices.begin[ outerPathResult.outerPointIndices.begin.length-1 ],
						  outerPathResult.outerPointIndices.begin[ outerPathResult.outerPointIndices.begin.length-1 ],
						  outerPathResult.outerPointIndices.begin[ 0 ]
						) );	
		this.faces.push( new THREE.Face3( innerPathResult.outerPointIndices.begin[0],
						  innerPathResult.outerPointIndices.begin[ innerPathResult.outerPointIndices.begin.length-1 ],
						  outerPathResult.outerPointIndices.begin[0]
						) );
	    }

	} // END if [options.closePathEnd]
	


	// Connect inner and outer hull?
	// (Only if shape is not closed)
	// Note: outerPathResult.outerPointIndices.left and outerPathResult.outerPointIndices.right
	//       have the same length!
	if( !options.closeShape ) {

	    //window.alert( outerPathResult.outerPointIndices.left.length );
	    for( var i = 1; i < outerPathResult.outerPointIndices.left.length; i++ ) {

		// Triangulate yes or no?
		// ... on the left side ...
		this.faces.push( new THREE.Face3( innerPathResult.outerPointIndices.left[i-1],
						  outerPathResult.outerPointIndices.left[i-1],
						  outerPathResult.outerPointIndices.left[i]
						) );
		this.faces.push( new THREE.Face3( innerPathResult.outerPointIndices.left[i],
						  innerPathResult.outerPointIndices.left[i-1],
						  outerPathResult.outerPointIndices.left[i]
						) );

		this.faces.push( new THREE.Face3( innerPathResult.outerPointIndices.right[i-1],
						  outerPathResult.outerPointIndices.right[i],
						  outerPathResult.outerPointIndices.right[i-1]
						) );
		this.faces.push( new THREE.Face3( innerPathResult.outerPointIndices.right[i-1],
						  innerPathResult.outerPointIndices.right[i],
						  outerPathResult.outerPointIndices.right[i]
						) );
						

	    }


	} // END if [options.closeShape]


    } // END if [options.hollow]
    else if( !options.closeShape ) {

	// The shape is NOT closed, but the mesh isn't hollow.
	//  -> Make a plane of faces along the cut to close the mesh.
	// NOTE: THIS ALGORITHM HAS TO BE OPTIMIZED, BECAUSE THIS IS _NOT_
	//       A PROPER SHAPE TRIANGULATION.
	//       (on non-convex bezier shapes this algorithm heavily fails on the 
	//        concave parts!).
	// Note 2: there is no outer path result, as there is no outer path.
	for( var i = 1; i < innerPathResult.outerPointIndices.left.length; i++ ) {

	    // Triangulate yes or no?
	    // Connect the left with the right side.
	    this.faces.push( new THREE.Face3( innerPathResult.outerPointIndices.left[i-1],
					      innerPathResult.outerPointIndices.left[i],
					      innerPathResult.outerPointIndices.right[i]
					    ) );
	    this.faces.push( new THREE.Face3( innerPathResult.outerPointIndices.right[i],
					      innerPathResult.outerPointIndices.right[i-1],
					      innerPathResult.outerPointIndices.left[i-1]
					    ) );

	}

    } else // END else [not hollow but closeShape]
	if( old_closePathBegin ) {

	    // Close path Begin
	for( var i = 2; i < innerPathResult.outerPointIndices.begin.length; i++ ) {

	    // Triangulate yes or no?
	    // Connect the left with the right side.
	    this.faces.push( new THREE.Face3( innerPathResult.outerPointIndices.end[0],
					      innerPathResult.outerPointIndices.end[i],
					      innerPathResult.outerPointIndices.end[i-1]
					    ) );

	}

    }

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
									  vertexCount,
									  
									  vectorFactory
									) {

    var shapePoints = shape.extractAllPoints();
    shape = shapePoints.shape;

    var shapeBounds = IKRS.BoundingBox2.computeFromPoints( shape );
    //window.alert( "shapeBounds=" + shapeBounds );
    
    //window.alert( 

    var result_perpendicularPathPoints        = [];
    var result_outerPointIndices_left         = [];
    var result_outerPointIndices_right        = [];
    var result_outerPointIndices_begin        = [];
    var result_outerPointIndices_end          = [];
    // Store the perpendicular shaped path for the case the mesh should be hollow
    // (required for the outer mesh)
    var result_extendedExtrusionPathPoints    = [];
    


    if( !options.meshHullType )
	options.meshHullType = "perpendicular";
    

    
    // Extend the extrusion path at begin and end.
    // Reason: otherwise the distance between inner and outer mesh at the path begin
    //         and -end would be 0 (zero).
    var pathBeginTangent = path.getTangent( 0.0 );
    // Normalize tangent
    pathBeginTangent.normalize();


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
	
	//window.alert( "options.perpendicularHullStrength=" + options.perpendicularHullStrength );

	// This only works with bezier curves!!!
	// (other paths have no perpendicular calculation implemented)
	if( options.buildPerpendicularHull ) {

	    // Remember perpendicular path points.
	    var shapedPathPerpendicular = shapedPath.getPerpendicular( 1-tSegment );
	    // Normalize directive vector
	    shapedPathPerpendicular.normalize();
	    // And set to the default hull size
	    shapedPathPerpendicular.multiplyScalar( options.perpendicularHullStrength );
	    var perpendicularHullPoint  = shapedPath.getPoint( 1-tSegment );
	    perpendicularHullPoint.add( shapedPathPerpendicular );
	    result_perpendicularPathPoints.push( perpendicularHullPoint );

	} // END if [buildPerpendicularHull]
	

	// Store path-point in extended path
	result_extendedExtrusionPathPoints.push( path.getPoint(1-tSegment) ); // pathPoint );

	/*
	if( i == options.curveSegments ) pathTangent = vectorFactory.createVector2( 0, 0 ); // No slope at first level?
	else                             pathTangent = vectorFactory.createVector2( pathPoint.x-lastPathPoint.x, pathPoint.y-lastPathPoint.y );
	*/
	if( i == options.curveSegments ) pathTangent = new THREE.Vector2( 0, 0 ); // No slope at first level?
	else                             pathTangent = new THREE.Vector2( pathPoint.x-lastPathPoint.x, pathPoint.y-lastPathPoint.y );	
	
	// Calculate slope from tangent
	if( pathTangent.x == 0 ) pathTangentSlope = -Math.PI/2.0; // -90 deg
	else                     pathTangentSlope = Math.atan( pathTangent.y/pathTangent.x );
	
	var radiusFactor    = (shapedPathBounds.getXMax() - shapedPathPoint.x) / shapedPathBounds.getWidth();
	var heightFactor    = (shapedPathBounds.getYMax() - shapedPathPoint.y) / shapedPathBounds.getHeight();

	var firstShapePointIndex = vertexCount;
	for( var s in shape ) {
	    
	    //window.alert( "s=" + s + ", len=" + shape.length + ", s+1=" + (s+1) + ", s+1 < len: " + (s+1 < shape.length) );
	    
	    var shapePoint2 = shapePoints.shape[s];
	    /*
	    var shapePoint3 = vectorFactory.createVector3( Math.sin(-pathTangentSlope) * shapePoint2.x,
							   shapePoint2.y, 
							   Math.cos(-pathTangentSlope) * shapePoint2.x
							 );
	    */
	    var shapePoint3 = new THREE.Vector3( Math.sin(-pathTangentSlope) * shapePoint2.x,
						 shapePoint2.y, 
						 Math.cos(-pathTangentSlope) * shapePoint2.x
					       );
	    
	    shapePoint3.multiplyScalar( radiusFactor );

	    // Translate along path		   
	    var pathHeightPoint = path.getPoint( tHeight );
/*	   
	    shapePoint3.add( vectorFactory.createVector3( pathHeightPoint.x,  
							  0, 
							  pathHeightPoint.y 
							) 
			   ); // addSelf instead of add?!
*/
	    shapePoint3.add( new THREE.Vector3( pathHeightPoint.x,  
							  0, 
							  pathHeightPoint.y 
							) 
			   ); // addSelf instead of add?!


	    // Add the passed mesh offset before adding.
	    /*
	    shapePoint3.add( vectorFactory.createVector3( options.meshOffset.z, // 0, // options.meshOffset.x,
							  options.meshOffset.y,
							  options.meshOffset.x
							)
			   );
	    */
	    shapePoint3.add( new THREE.Vector3( options.meshOffset.z, // 0, // options.meshOffset.x,
							  options.meshOffset.y,
							  options.meshOffset.x
							)
			   );

	   // window.alert( options.meshHullType );
	    if( options.meshHullType == "perpendicular" ) {

		// NOOP

	    } else if( options.meshHullType == "prism" ) {
	
		//window.alert( "shapeBounds.getHeight()=" + shapeBounds.getHeight() + ", options.perpendicularHullStrength=" + options.perpendicularHullStrength );
		var maxHeight = shapedPathBounds.getWidth(); //shapeBounds.getHeight(); // + options.perpendicularHullStrength/10.0;
		//window.alert( maxHeight );

		// The direction of the prism only depends on the split 2D-shape! As it is split
		// on the x axis, the (-y,+y) range defines the prism sign.
		var prismDirection = Math.sign( Math.round( shapeBounds.getYMax() + shapeBounds.getYMin() ) );
		if( s != 0 && parseInt(s)+1 < shape.length ) {
		    var tmp = vectorFactory.createVector3( maxHeight, maxHeight, maxHeight );
		    //if( Math.sign(vectorFactory.signX * vectorFactory.signY * vectorFactory.signZ) == -1 )
		    shapePoint3.y = maxHeight * prismDirection; //tmp.y * vectorFactory.signY; //Math.sign(tmp.y*tmp.z*tmp.x) * vectorFactory.signZ * vectorFactory.signZ; //(-tmp.y); //-tmp.z; //tmp.x;
		    //else
		//	shapePoint3.y = maxHeight * vectorFactory.signY * vectorFactory.signZ; //Math.sign(tmp.y); //  * Math.sign(tmp.y*tmp.z*tmp.x);	;
		}

	    } else {
		var errmsg = "[IKRS.PathDirectedExtrudeGeometry.buildPathExtrusion() Illegal value for options.meshHullType: " + options.meshHullType;
		console.log( errmsg );
		throw errmsg;
	    }
	    

	    // Add path point?
            // ... Vertex was replaced by Vector3 (Vertex is DEPRECATED!)                                                
            this.vertices.push( vectorFactory.createVector3( shapePoint3.x,                                              
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

			// Do not close shape if not permitted.
			if( s != 0 || options.closeShape ) {
			    
			    // Make hollow (inside out) by reversing the face indices.
			    this.faces.push( new THREE.Face4( vertexCount + soffset,
							      vertexCount,
							      vertexCount-shape.length,
							      vertexCount-shape.length + soffset
							    ) );

			}
			
		    } else {
			
			// Do not close shape if not permitted.
			if( s != 0 || options.closeShape ) {
			    this.faces.push( new THREE.Face4( vertexCount-shape.length + soffset,
							      vertexCount-shape.length,
							      vertexCount,
							      vertexCount + soffset
							    ) );
			}
		    }
		    
		} else {
		    
		    // Triangulation=on
		    // -> add two Face3 facets instead of Face4!
		    // (Otherwise the STL export will fail as it only recognizes Face3)
		    if( options.hollow ) {
			
			// Make hollow (inside out) by reversing the face indices

			// Do not close shape if not permitted.
			if( s != 0 || options.closeShape ) {
			    this.faces.push( new THREE.Face3( vertexCount + soffset,
							      vertexCount,
							      vertexCount-shape.length
							    ) );
			    this.faces.push( new THREE.Face3( vertexCount-shape.length,
							      vertexCount-shape.length + soffset,
							      vertexCount + soffset
							    ) );
			}
		    } else {
			
			// Do not close shape if not permitted.
			if( s != 0 || options.closeShape ) {
			    this.faces.push( new THREE.Face3( vertexCount-shape.length,
							      vertexCount,
							      vertexCount + soffset
							    ) );
			    this.faces.push( new THREE.Face3( vertexCount + soffset,
							      vertexCount-shape.length + soffset,
							      vertexCount-shape.length
							    ) );
			}
		    }
		} // END else [triangulate]

	    } 

	    
	    // Close first and last shape/level (if at least 3 vertices are present: s > 1)
	    if( s > 1 || options.closeShape ) {

		// If the mesh should be build hollow this is not yet the last segment
		if( i == options.curveSegments && options.closePathBegin ) {

		    // Last segment 
		    // ??? !!!
		    /*
		    this.faces.push( new THREE.Face3( vertexCount,
						      vertexCount-1,
						      firstShapePointIndex
						    ) 
				   );
				   */
				   
		} else if( i == 0 && options.closePathEnd ) {
		    
		    // !!! The respective checkbox is currently disabled, so review this !!!
		    
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
	    } else if( s == shape.length-1 ) {
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
									      vertexCount,
									      
									      vectorfactory
									    ) {

    var shapePoints = shape.extractAllPoints();
    shape = shapePoints.shape;

    if( !options.pathBend )
	options.pathBend = Math.PI/4.0;  // 45 degrees for testing:)

    var lastPathPoint    = null;
    var pathTangent      = null;
    var pathTangentSlope = 0.0;
    
    for( var i = options.curveSegments; i >= 0; i-- ) {

	var tSegment        = i / options.curveSegments;
	// This is a Vector2 (x,y)
	var pathPoint       = path.getPointAt( tSegment );	
	var shapedPathPoint = shapedPath.getPoint( tSegment );

	var tHeight         = Math.min( 1.0, 
					(shapedPathBounds.getYMax() - shapedPathPoint.y) / shapedPathBounds.getHeight()
				      );
	
	
	if( i == options.curveSegments ) pathTangent = new THREE.Vector2( 0, 0 ); // No slope at first level
	else                             pathTangent = new THREE.Vector2( pathPoint.x-lastPathPoint.x, pathPoint.y-lastPathPoint.y );
	
	/*
	if( i == options.curveSegments ) pathTangent = vectorFactory.createVector2( 0, 0 ); // No slope at first level
	else                             pathTangent = vectorFactory.createVector2( pathPoint.x-lastPathPoint.x, pathPoint.y-lastPathPoint.y );
	*/
	
	// Calculate slope from tangent
	if( pathTangent.x == 0 ) pathTangentSlope = -Math.PI/2.0; // 90 deg
	else                     pathTangentSlope = Math.atan( pathTangent.y/pathTangent.x );
	
	var radiusFactor    = (shapedPathBounds.getXMax() - shapedPathPoint.x) / shapedPathBounds.getWidth();
	var heightFactor    = (shapedPathBounds.getYMax() - shapedPathPoint.y) / shapedPathBounds.getHeight();
 
	var firstShapePointIndex = vertexCount;
	for( var s in shape ) {

	    
	    var shapePoint2 = shapePoints.shape[s];
	    /*
	    var shapePoint3 = new THREE.Vector3( Math.sin(-pathTangentSlope) * shapePoint2.x,
						 shapePoint2.y, 
						 Math.cos(-pathTangentSlope) * shapePoint2.x
					       );
	    */
	    var shapePoint3 = vectorfactory.createVector3( Math.sin(-pathTangentSlope) * shapePoint2.x,
							   shapePoint2.y, 
							   Math.cos(-pathTangentSlope) * shapePoint2.x
							 );
	    
	    shapePoint3.multiplyScalar( radiusFactor );
	    
	    // Translate along path		   
	    var pathHeightPoint = path.getPoint( tHeight );
	    /*
	    shapePoint3.add( new THREE.Vector3( pathHeightPoint.x,  
						0, 
						pathHeightPoint.y 
					      ) 
			   ); // addSelf instead of add?!
	    */
	    shapePoint3.add( vectorFactory.createVector3( pathHeightPoint.x,  
							  0, 
							  pathHeightPoint.y 
							) 
			   ); // addSelf instead of add?!
	    
	    // Add path point?	    	    
	    // ... Vertex was replaced by Vector3 (Vertex is DEPRECATED!)
	    /*
	    this.vertices.push( new THREE.Vector3( shapePoint3.x, 
						   shapePoint3.y, 
						   shapePoint3.z 
						 ) 
			      );
	    */
	    this.vertices.push( vectorFactory.createVector3( shapePoint3.x, 
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