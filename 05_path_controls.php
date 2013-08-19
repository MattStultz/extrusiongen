<!DOCTYPE html>
<html> 
<head> 
<title>My first Three.js app</title> 
<meta charset="UTF-8">
<style>
canvas#my_canvas { 
 position: absolute;
 top: 10px;
 left: 10px;
 width: 1024px; 
 height: 768px; 
 border: 1px solid #000000;
}

div#controls {
position: absolute;
top: 10px;
left: 1044px;
width: 400px;
height: 768px;
border: 1px solid #000000;
}
</style> 

</head> 

<body> 

<canvas id="my_canvas">
</canvas>

<div id="controls">
<form name="mesh_form">
<table border="0">

<tr>
  <td><label for="shape_size">Shape size (radius): </label></td>
  <td><input type="number" id="shape_size" name="shape_size" value="100">px</td>
</tr>

<tr>
  <td><label for="shape_segments">Shape segments: </label></td>
  <td><input type="number" id="shape_segments" name="shape_segments" value="24"></td>
</tr>

<tr>
  <td><label for="path_length">Path length: </label></td>
  <td><input type="number" id="path_length" name="path_length" value="200">px</td>
</tr>

<tr>
  <td><label for="path_segments">Path segments: </label></td>
  <td><input type="number" id="path_segments" name="path_segments" value="4"></td>
</tr>


<tr>
  <td></td>
  <td>
        <input type="checkbox" id="wireframe" name="wireframe">
          <label for="wireframe">Wireframe</label>
  </td>
</tr>


<tr>
  <td></label></td>
  <td><input type="button" value="Rebuild" onclick="rebuild_model();"></td>
</tr>

</table>
</form>
</div>


<script language="Javascript" type="text/javascript" src="three.js"></script>
<script language="Javascript" type="text/javascript" src="ExtrudePathGeometry.js"></script>

<script language="Javascript" type="text/javascript"> 


var canvas = document.getElementById("my_canvas");
var renderer = new THREE.WebGLRenderer( { "canvas" : canvas } ); 
						 if( !renderer.context )
						   window.alert( "ERR" );

// These are MouseEvent locations
var latestMouseDownPosition;
var latestMouseDragPosition;

// This is a THREE.Vector3 rotation (euklid)
var currentRotation;


var mesh; // will be initialized later
var scene = new THREE.Scene(); 
var camera = new THREE.PerspectiveCamera( 75, 
					  1024.0/768.0, // window.innerWidth / window.innerHeight, 
					  0.1, 
					  1000 
					  ); 

// create a point light
var pointLight =
  new THREE.PointLight(0xFFFFFF);

// set its position
pointLight.position.x = 10;
pointLight.position.y = 50;
pointLight.position.z = 130;

// add to the scene
scene.add(pointLight);


// This is not required as the pass the camera again during rendering
// scene.add( camera ); 
//var canvas = document.getElementById("my_canvas");
// alert( "Canvas=" + canvas );
canvas.onmousedown = mouseDownHandler;
canvas.onmouseup   = mouseUpHandler;
canvas.onmousemove = mouseMoveHandler;


function mouseMoveHandler( e ) {
  // window.alert( "clicked. Event: " + e + ", e.pageX=" + e.pageX + ", e.pageY=" + e.pageY );
  
  if( this.latestMouseDownPosition ) {
    //window.alert( "jo" );
    // In each loop alter the cube's rotation
     
    if( !this.currentRotation )
      this.currentRotation = new THREE.Vector3();
    this.currentRotation.y += (0.01 * (this.latestMouseDragPosition.x - e.pageX)); 
    this.currentRotation.x += (0.01 * (this.latestMouseDragPosition.y - e.pageY));
    
    mesh.rotation.y = this.currentRotation.y;
    mesh.rotation.x = this.currentRotation.x;


    this.latestMouseDragPosition = new THREE.Vector2( e.pageX, e.pageY ); 

    render();    
  } 
}


function mouseDownHandler( e ) {
  // window.alert( "clicked. Event: " + e + ", e.pageX=" + e.pageX + ", e.pageY=" + e.pageY );
  this.latestMouseDownPosition = new THREE.Vector2( e.pageX, e.pageY ); 
  this.latestMouseDragPosition = new THREE.Vector2( e.pageX, e.pageY ); 
}

function mouseUpHandler( e ) {
  // Clear mouse down position
  this.latestMouseDownPosition = null;
}


renderer.setSize( 1024, // window.innerWidth, 
		  768   // window.innerHeight 
		  ); 

document.body.appendChild( renderer.domElement );


function rebuild_model() {
  var shapePoints = [];
  // Make a circle
  var circleSegmentCount = document.forms["mesh_form"].elements["shape_segments"].value; // 8;
  var circleRadius       = document.forms["mesh_form"].elements["shape_size"].value;     // 100;
  var wireFrame          = document.forms["mesh_form"].elements["wireframe"].checked; 
  for( i = 0; i <= circleSegmentCount; i++ ) {
    var pct = i * (1.0/circleSegmentCount);
    shapePoints.push( new THREE.Vector3( Math.sin( Math.PI*2*pct ) * circleRadius,
					 Math.cos( Math.PI*2*pct ) * circleRadius,
					 0
					 )
		      );
  }
           
  /*
    var mesh = new THREE.Mesh( new THREE.LatheGeometry( shapePoints, 12 ), 
    new THREE.MeshLambertMaterial( 
    { color: 0x2D303D, 
    wireframe: false, 
    shading: THREE.LambertShading // THREE.FlatShading 
    } ));
  */

  var extrusionShape = new THREE.Shape( shapePoints );

  var pathLength   = document.forms["mesh_form"].elements["path_length"].value;
  var pathSegments = document.forms["mesh_form"].elements["path_segments"].value;
  // HINT: THREE.path points do not recognize the z component!
  var pathPoints = [];
  /*
  pathPoints.push( new THREE.Vector3(0,0,0) );
  pathPoints.push( new THREE.Vector3(0,100,0) );
  pathPoints.push( new THREE.Vector3(0,0,0) );
  */
  
  // Make a nice curve (for testing with sin/cos here)
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
  
  var extrusionPath = new THREE.Path( pathPoints );
 
  var extrusionGeometry = new THREE.ExtrudePathGeometry( extrusionShape, 
							 extrusionPath,
							 { size: pathLength, // 300,
							     height: 4,
							     curveSegments: pathSegments, // 3,
							     bevelThickness: 1,
							     bevelSize: 2,
							     bevelEnabled: false,
							     material: 0,
							     extrudeMaterial: 1
							     }
							 );
  var exrusionMaterial = new THREE.MeshLambertMaterial( 
						       { color: 0x2D303D, 
							   wireframe: wireFrame, // false, 
							   shading: THREE.FlatShading // THREE.LambertShading // THREE.FlatShading 
							   } 
							);
  // As many as there are extrusion steps
  var extrusionMaterialArray = [ exrusionMaterial,
				 exrusionMaterial
				 ];
  /*
    var mesh = new THREE.Mesh( extrusionGeometry,
    new THREE.MeshFaceMaterial( extrusionMaterialArray )
    );
  */
  
  // Remove old mesh?
  if( mesh )
    scene.remove( mesh );
  
  mesh = mesh = new THREE.Mesh( extrusionGeometry,
				new THREE.MeshFaceMaterial( extrusionMaterialArray )
				);
  mesh.position.y  = 150;
  mesh.overdraw    = true;
  mesh.doubleSided = false;  // true
  
  scene.add( mesh );
}
rebuild_model();




camera.position.z = 500;


function render() {
  
  requestAnimationFrame(render); 
  renderer.render(scene, camera); 


  // Draw a nice frame border
  //renderer.context.strokeRect( 0, 0, canvas.width-1, canvas.height-1 );
  //window.alert( JSON.stringify( renderer.context ) );
}

// Render first time only if the DOM is fully loaded!
window.onload = render;

</script> 

</body> 
</html>