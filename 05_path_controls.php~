<html> 
<head> 
<title>My first Three.js app</title> 
<style>
canvas#my_canvas { 
 width: 100%; 
 height: 100%; 
}

</style> 

</head> 

<body> 

<canvas id="my_canvas">
</canvas>


<script language="Javascript" type="text/javascript" src="three.js"></script>
<script language="Javascript" type="text/javascript" src="ExtrudePathGeometry.js"></script>

<script language="Javascript" type="text/javascript"> 

   // These are MouseEvent locations
var latestMouseDownPosition;
var latestMouseDragPosition;

// This is a THREE.Vector3 rotation (euklid)
var currentRotation;

/*
function init() {

  this.currentRotation = new THREE.Vector3();

}
init();
*/

var scene = new THREE.Scene(); 
var camera = new THREE.PerspectiveCamera( 75, 
					  window.innerWidth / window.innerHeight, 
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
var canvas = document.getElementById("my_canvas");
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

var renderer = new THREE.WebGLRenderer( { "canvas" : canvas } ); 


renderer.setSize( window.innerWidth, 
window.innerHeight ); 

document.body.appendChild( renderer.domElement );



// Begin extrusion
/* http://stackoverflow.com/questions/11397545/extruding-with-three-js

In the LatheGeometry constructor, the first parameter is the path you want to lathe as an array of points, the second is the number of steps (the more steps, the more detail/radial iterations) and the third (which I'm not using in the example) is the angle - by default it goes 360, but you can also control that.

Regarding the points, notice they are offset a bit on the x axis. Positioning your points will affect not only the size of the square being lathed but also the lathe offset (an offset of 0 should get you a full cylinder). Also, the points will affect the lathe axis (notice I've used XZ).

If you're not familiar with the concept of lathes you should probably have a play in a 3D editor as most of them support the feature. (A bit off topic, but this operation is kind of supported in Illustrator under Effects > 3D > Revolve )
*/

var shapePoints = [];
/*
shapePoints.push( new THREE.Vector3(150,50,0) );  // back to top left - close square path
shapePoints.push( new THREE.Vector3(150,-50,0) ); // bottom left
shapePoints.push( new THREE.Vector3(200,-50,0) ); // bottom right
shapePoints.push( new THREE.Vector3(200,50,0) );  // top right
shapePoints.push( new THREE.Vector3(150,50,0) );  // top left   
*/
// Make a circle
var circleSegmentCount = 8;
var circleRadius = 100;
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

// HINT: THREE.path points do not recognize the z component!
var pathPoints = [];
pathPoints.push( new THREE.Vector3(0,0,0) );
pathPoints.push( new THREE.Vector3(0,100,100) );
pathPoints.push( new THREE.Vector3(0,0,200) );
var extrusionPath = new THREE.Path( pathPoints );
/*
var extrusionGeometry = new THREE.ExtrudeGeometry( extrusionShape, 
						   { size: 30,
						       height: 4,
						       curveSegments: 3,
						       bevelThickness: 1,
						       bevelSize: 2,
						       bevelEnabled: false,
						       material: 0,
						       extrudeMaterial: 1
						       }
						   );
*/
//window.alert( "Path point at #0.5: " + extrusionPath.getPointAt(0.5) );
var extrusionGeometry = new THREE.ExtrudePathGeometry( extrusionShape, 
						       extrusionPath,
						       { size: 300,
							   height: 4,
							   curveSegments: 3,
							   bevelThickness: 1,
							   bevelSize: 2,
							   bevelEnabled: false,
							   material: 0,
							   extrudeMaterial: 1
							   }
						       );
var exrusionMaterial = new THREE.MeshLambertMaterial( 
						     { color: 0x2D303D, 
							 wireframe: true, // false, 
							 shading: THREE.FlatShading // THREE.LambertShading // THREE.FlatShading 
							 } 
						      );
// As many as there are extrusion steps
var extrusionMaterialArray = [ exrusionMaterial,
			       exrusionMaterial
			       ];
var mesh = new THREE.Mesh( extrusionGeometry,
			   new THREE.MeshFaceMaterial( extrusionMaterialArray )
			   );

mesh.position.y  = 150;
mesh.overdraw    = true;
mesh.doubleSided = false;  // true

scene.add( mesh );

camera.position.z = 500;


function render() {
  requestAnimationFrame(render); 
  renderer.render(scene, camera); 
}

render();

</script> 

</body> 
</html>