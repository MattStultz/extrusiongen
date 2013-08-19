<html> 
<head> 
<title>My first Three.js app</title> 
<style>
canvas { 
 width: 100%; 
 height: 100% 
}

</style> 

</head> 

<body> 
<!-- <script src="https://rawgithub.com/mrdoob/three.js/master/build/three.js"></script> -->
<script language="Javascript" type="text/javascript" src="three.js"></script>

<script> 
// Our Javascript will go here. 
var scene = new THREE.Scene(); 
var camera = new THREE.PerspectiveCamera( 75, 
					  window.innerWidth / window.innerHeight, 
					  0.1, 
					  1000 
					  ); 
var renderer = new THREE.WebGLRenderer(); 
renderer.setSize( window.innerWidth, 
window.innerHeight ); 

document.body.appendChild( renderer.domElement );


// "That's all good, but where's that cube you promised?" 
// Let's add it now.
var geometry = new THREE.CubeGeometry(1,1,1); 
/*var material = new THREE.MeshBasicMaterial( { 
  color: 0x00ff00 
      //shading: THREE.FlatShading, 
      //vertexColors: THREE.VertexColors ,
      //overdraw: true
      } ); */

/*
var material_1 = new THREE.MeshLambertMaterial(
    {color : 0xff0000, shading: THREE.FlatShading, overdraw : true}
);
var material_2 = new THREE.MeshLambertMaterial(
    {color : 0x00ff00, shading: THREE.FlatShading, overdraw : true}
);
geometry.materials.push( material_1 );
geometry.materials.push( material_2 );

for( var i in geometry.faces ) {
    var face = geometry.faces[i];
    // face.materialIndex = i%geometry.materials.length;
}
*/

for ( var i = 0; i < geometry.faces.length; i ++ ) {
    geometry.faces[ i ].color.setHex( Math.random() * 0xffffff );
}

var material = new THREE.MeshBasicMaterial( { color: 0xffffff, vertexColors: THREE.FaceColors } );

var cube = new THREE.Mesh( geometry, 
			   material 
			   ); 

/*
var faceIndices = ['a', 'b', 'c', 'd'];  
for( faceIndex = 0; faceIndex < faceIndices; faceIndex++ ) {
  var face = geometry.faces[ faceIndex ];   
  // determine if face is a tri or a quad
  var numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
  // assign color to each vertex of current face
  for( var j = 0; j < numberOfSides; j++ )  
    {
      var vertexIndex = face[ faceIndices[ j ] ];
      // initialize color variable
      var color = new THREE.Color( 0xffffff );
      color.setRGB( Math.random(), 0, 0 );
      face.vertexColors[ j ] = color;
    }
}
*/

scene.add( cube ); 
camera.position.z = 5;

// If you copied the code from above into the HTML file we created earlier, you wouldn't be able to see anything. 
// This is because we're not actually rendering anything yet. For that, we need what's called a render loop.
var i = 0;
function render() { 
  if( i++ < 100 ) {
    requestAnimationFrame(render); 
    renderer.render(scene, camera); 
    
    // In each loop alter the cube's rotation
    cube.rotation.x += 0.1; 
    cube.rotation.y += 0.1;
  } else {
    alert( "Stopped after 100 iterations." );
  }
} 
render();

</script> 

</body> 
</html>