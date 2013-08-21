/**
 * @author Ikaros Kappler
 * @date 2013-08-21
 * @version 1.0.0
 **/ 

//window.alert( "X" );


IKRS.Utils = {};


IKRS.Utils.inArray = function( arr, x ) {

    for( var i = 0; i < arr.length; i++ ) {
	if( arr[i] == x )
	    return true;
    }
	
    return false;
}


// window.alert( "IKRS.Utils=" + IKRS.Utils );