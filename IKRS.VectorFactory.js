/**
 * @author Ikaros Kappler
 * @date 2013-10-29
 * @version 1.0.0
 **/


IKRS.VectorFactory = function() {
    
    IKRS.Object.call( this );

}

IKRS.VectorFactory.prototype = new IKRS.Object();
IKRS.VectorFactory.prototype.constructor = IKRS.VectorFactory;


IKRS.VectorFactory.prototype.createVector2 = function( x, y ) {
    return new THREE.Vector2( x, y );
}

IKRS.VectorFactory.prototype.createVector3 = function( x, y, z ) {
    return new THREE.Vector3( x, y, z );
}
