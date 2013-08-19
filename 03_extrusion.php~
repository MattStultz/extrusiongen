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

<script language="Javascript" type="text/javascript"> 

var latestMouseDownPosition;
var latestMouseDragPosition;

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
    mesh.rotation.y += (0.01 * (this.latestMouseDragPosition.x - e.pageX)); 
    mesh.rotation.x += (0.01 * (this.latestMouseDragPosition.y - e.pageY));

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

var pts = [ new THREE.Vector3(150,0,50),//back to top left - close square path
	    new THREE.Vector3(150,0,-50),//bottom left
	    new THREE.Vector3(200,0,-50),//bottom right
	    new THREE.Vector3(200,0,50),//top right
            new THREE.Vector3(150,0,50)//top left   
           ];
var mesh = new THREE.Mesh( new THREE.LatheGeometry( pts, 12 ), 
			   new THREE.MeshLambertMaterial( 
							 { color: 0x2D303D, 
							     wireframe: false, 
							     shading: THREE.LambertShading // THREE.FlatShading 
							     } ));
mesh.position.y  = 150;
mesh.overdraw    = true;
mesh.doubleSided = false;  // true

scene.add( mesh );



// "That's all good, but where's that cube you promised?" 
// Let's add it now.
/*var geometry = new THREE.ExtrudeGeometry(); // new THREE.CubeGeometry(1,1,1); 


for ( var i = 0; i < geometry.faces.length; i ++ ) {
    geometry.faces[ i ].color.setHex( Math.random() * 0xffffff );
}

var material = new THREE.MeshBasicMaterial( { color: 0xffffff, vertexColors: THREE.FaceColors } );

var cube = new THREE.Mesh( geometry, 
			   material 
			   ); 


scene.add( cube ); 

*/
camera.position.z = 500;


// If you copied the code from above into the HTML file we created earlier, you wouldn't be able to see anything. 
// This is because we're not actually rendering anything yet. For that, we need what's called a render loop.

/*
var i = 0;
function render() { 
  if( i++ < 100 ) {
    requestAnimationFrame(render); 
    renderer.render(scene, camera); 
    
    // In each loop alter the cube's rotation
    mesh.rotation.x += 0.1; 
    mesh.rotation.y += 0.1;
    
  } else {
    alert( "Stopped after 100 iterations." );
  }
} 
*/

function render() {
  requestAnimationFrame(render); 
  renderer.render(scene, camera); 
}

render();

</script> 

</body> 
</html>