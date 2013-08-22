/**
 * @author Ikaros Kappler
 * @date 2013-08-14
 * @version 1.0.0
 **/

var preview_canvas_width  = 512;
var preview_canvas_height = 768;

var preview_canvas   = document.getElementById("preview_canvas");
var preview_renderer = new THREE.WebGLRenderer( { "canvas" : preview_canvas } ); 
if( !preview_renderer.context )
    window.alert( "ERR" );

// These are MouseEvent locations
var latestMouseDownPosition;
var latestMouseDragPosition;

// This is a THREE.Vector3 rotation (euklid)
//var currentRotation;


var preview_mesh; // will be initialized later
var preview_scene = new THREE.Scene(); 
var preview_camera = new THREE.PerspectiveCamera( 75, 
						  preview_canvas_width/preview_canvas_height, // window.innerWidth / window.innerHeight, 
						  0.1, 
						  2000 
						); 

// create a point light
var preview_pointLight =
  new THREE.PointLight(0xFFFFFF);

// set its position
preview_pointLight.position.x = 10;
preview_pointLight.position.y = 50;
preview_pointLight.position.z = 600;

// add to the scene
preview_scene.add(preview_pointLight);


// This is not required as the pass the camera again during rendering
// scene.add( camera ); 
//var canvas = document.getElementById("my_canvas");
// alert( "Canvas=" + canvas );
preview_canvas.onmousedown = preview_mouseDownHandler;
preview_canvas.onmouseup   = preview_mouseUpHandler;
preview_canvas.onmousemove = preview_mouseMoveHandler;


function preview_mouseMoveHandler( e ) {
  // window.alert( "clicked. Event: " + e + ", e.pageX=" + e.pageX + ", e.pageY=" + e.pageY );
  
  if( this.latestMouseDownPosition ) {
    //window.alert( "jo" );
    // In each loop alter the cube's rotation
     
    /*
    if( !this.currentRotation )
      this.currentRotation = new THREE.Vector3();
    this.currentRotation.y += (0.01 * (this.latestMouseDragPosition.x - e.pageX)); 
    this.currentRotation.x += (0.01 * (this.latestMouseDragPosition.y - e.pageY));
    
    preview_mesh.rotation.y = this.currentRotation.y;
    preview_mesh.rotation.x = this.currentRotation.x;
    */
      
    preview_mesh.rotation.y += (0.01 * (this.latestMouseDragPosition.x - e.pageX)); 
    preview_mesh.rotation.x += (0.01 * (this.latestMouseDragPosition.y - e.pageY)); 


    this.latestMouseDragPosition = new THREE.Vector2( e.pageX, e.pageY ); 

    //preview_render();    
  } 
}


function preview_mouseDownHandler( e ) {
  // window.alert( "clicked. Event: " + e + ", e.pageX=" + e.pageX + ", e.pageY=" + e.pageY );
  this.latestMouseDownPosition = new THREE.Vector2( e.pageX, e.pageY ); 
  this.latestMouseDragPosition = new THREE.Vector2( e.pageX, e.pageY ); 
}

function preview_mouseUpHandler( e ) {
  // Clear mouse down position
  this.latestMouseDownPosition = null;
}


//window.alert( "preview_canvas.width=" +  preview_canvas.width + ", preview_canvas.height=" + preview_canvas.height );
preview_renderer.setSize( preview_canvas_width, // preview_canvas.width,  //  canvasWidth, // window.innerWidth, 
			  preview_canvas_height // preview_canvas.height  // canvasHeight   // window.innerHeight 
			); 

document.body.appendChild( preview_renderer.domElement );


function preview_rebuild_model() {
    
    // Fetch bezier path from bezier canvas handler
    var shapedPath       = this.bezierCanvasHandler.getBezierPath();
    var shapedPathBounds = shapedPath.getBoundingBox();

    var shapePoints = [];
    // Make a circle
    var circleSegmentCount = document.forms["mesh_form"].elements["shape_segments"].value; // 8;
    //var circleRadius       = document.forms["mesh_form"].elements["shape_size"].value;     // 100;
    var wireFrame          = document.forms["mesh_form"].elements["wireframe"].checked; 
    var triangulate        = document.forms["mesh_form"].elements["triangulate"].checked; 
    
    // Use the x value (=radius) of the first path point as circle radius
    var circleRadius       = shapedPathBounds.getWidth(); //shapedPath.getPoint( 0.0 ).x;

    for( i = 0; i <= circleSegmentCount; i++ ) {
	var pct = i * (1.0/circleSegmentCount);
	shapePoints.push( new THREE.Vector3( Math.sin( Math.PI*2*pct ) * circleRadius,
					     Math.cos( Math.PI*2*pct ) * circleRadius,
					     0
					   )
			);
    }

    var extrusionShape = new THREE.Shape( shapePoints );

    //var pathLength   = document.forms["mesh_form"].elements["path_length"].value;
    var pathLength     = shapedPath.getBoundingBox().getHeight();

    var pathSegments = document.forms["mesh_form"].elements["path_segments"].value;
    // HINT: THREE.path points do not recognize the z component!
    var pathPoints = [];  
    // Make a nice curve (for testing with sin/cos here)
    /*
    for( var i = 0; i < pathSegments; i++ ) {
	var t     = i/pathSegments;
	var sin   = Math.sin( Math.PI * 0.5 * t );
	var cos   = Math.cos( Math.PI * 0.5 * t );
	pathPoints.push( new THREE.Vector3( cos*100,
					    sin*100,
					    0 
					  ) 
		       );
	// window.alert( "t=" + t + ", sin=" + sin + ", cos=" + cos );
    }
    */
    // Make a liear path (for testing)
    for( var i = 0; i < pathSegments; i++ ) {
	var t     = i/pathSegments;
	//var sin   = Math.sin( Math.PI * 0.5 * t );
	//var cos   = Math.cos( Math.PI * 0.5 * t );
	pathPoints.push( new THREE.Vector3( t, //t*100,
					    0, //t*100,
					    0
					  ) 
		       );
	// window.alert( "t=" + t + ", sin=" + sin + ", cos=" + cos );
    }
    
    var extrusionPath = new THREE.Path( pathPoints );
    
    
    var extrusionGeometry;
    if( !shapedPath ) {
	extrusionGeometry = new IKRS.ExtrudePathGeometry( extrusionShape, 
							  extrusionPath,
							  { size: pathLength, // 300,
							    // height: 4,      // height segments
							    curveSegments: 100, // pathSegments, // 3,
							    triangulate: triangulate
							    //bevelThickness: 1,
							    //bevelSize: 2,
							    //bevelEnabled: false,
							    //material: 0,
							    //extrudeMaterial: 1
							  }
							);
    } else {
	
	extrusionGeometry = new IKRS.ShapedPathGeometry( extrusionShape, 
							 extrusionPath,
							 shapedPath,
							 { size: pathLength, // 300,
							    height: 10,
							    curveSegments: pathSegments, // 3,
							    triangulate: triangulate
							  }
							);	

    }
    /*
    var exrusionMaterial = new THREE.MeshLambertMaterial( 
	{ color: 0x2D303D, 
	  wireframe: wireFrame, // false, 
	  shading: THREE.FlatShading // THREE.LambertShading // THREE.FlatShading 
	} 
	);
	*/

    var exrusionMaterial = new THREE.MeshPhongMaterial( 
	{ color: 0x151D28, //0x2D303D, 
	  ambient: 0x996633, // 0xffffff, // 0x996633, // should generally match color
	  specular: 0x888888, // 0x050505,
	  shininess: 50, //100,
	  //emissive: 0x101010, // 0x000000, 
	  wireframe: wireFrame, 
	  shading: THREE.LambertShading // THREE.FlatShading 
	} 
	);

    // As many as there are extrusion steps
    var extrusionMaterialArray = [ exrusionMaterial,
				   exrusionMaterial
				 ];

    
    var new_mesh = new THREE.Mesh( extrusionGeometry,
				   new THREE.MeshFaceMaterial( extrusionMaterialArray )
				 );
    new_mesh.position.y  = 150;
    new_mesh.position.z  = -250;
    new_mesh.overdraw    = true;
    new_mesh.doubleSided = false;  // true

    // Keep old rotation ?
    //preview_mesh.rotation.y = currentRotation.y;
    //preview_mesh.rotation.x = currentRotation.x;
    
    // Remove old mesh?
    if( preview_mesh ) {
	preview_scene.remove( preview_mesh );

	// Keep old rotation
	new_mesh.rotation.x = preview_mesh.rotation.x;
	new_mesh.rotation.y = preview_mesh.rotation.y;
	
	// window.alert( "mesh.rotation=(" + new_mesh.rotation.x + ", " + new_mesh.rotation.y + ", " + new_mesh.rotation.z + ", " + new_mesh.rotation.w + ")" );
	
	new_mesh.scale.x    = preview_mesh.scale.x;
	new_mesh.scale.y    = preview_mesh.scale.y;
	new_mesh.scale.z    = preview_mesh.scale.z;
    } else {

	// Scale a bit bigger than 1.0 (looks better with the bezier view)
	new_mesh.scale.multiplyScalar( 1.5 );
	
	new_mesh.rotation.x = -1.38;

    }

    preview_scene.add( new_mesh );
    preview_mesh = new_mesh;
}
preview_rebuild_model();




preview_camera.position.z = 500;


function preview_render() {
  requestAnimationFrame(preview_render); 
  preview_renderer.render(preview_scene, preview_camera); 
}

function decreaseZoomFactor( redraw ) {
    preview_mesh.scale.multiplyScalar( 0.5 );
    if( redraw )
	preview_render();
}

function increaseZoomFactor( redraw ) {
    preview_mesh.scale.multiplyScalar( 2.0 );
    if( redraw )
	preview_render();
}

// Render first time only if the DOM is fully loaded!
window.onload = preview_render;
