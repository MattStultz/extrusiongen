/**
 * @author Ikaros Kappler
 * @date 2013-10-29
 * @version 1.0.0
 **/


IKRS.VectorFactory = function( p_signX, p_signY, p_signZ ) {
    
    IKRS.Object.call( this );
    
    if( typeof p_signX == "undefined" )
	signX = 1;
    if( typeof p_signY == "undefined" )
	signY = 1;
    if( typeof p_signZ == "undefined" )
	signZ = 1;


    this.signX = p_signX;
    this.signY = p_signY;
    this.signZ = p_signZ;
}

IKRS.VectorFactory.prototype = new IKRS.Object();
IKRS.VectorFactory.prototype.constructor = IKRS.VectorFactory;


IKRS.VectorFactory.prototype.createVector2 = function( x, y ) {
    return new THREE.Vector2( this.signX * x, this.signY * y );
}

IKRS.VectorFactory.prototype.createVector3 = function( x, y, z ) {
    return new THREE.Vector3( this.signX * x, this.signY * y, this.signZ * z );
}
