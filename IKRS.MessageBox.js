/**
 * @author Ikaros Kappler
 * @date 2013-09-30
 * @version 1.0.0
 **/

IKRS.MessageBox = function( baseID ) {

    IKRS.Object.call();

    this.baseID     = baseID;
    this.blanketID  = baseID + "_blanket";
    this.boxID      = baseID + "_box";
    
    this.boxWidth   = 300;  // px
    this.boxHeight  = 180;  // px

    var blanket                     = document.createElement( "div" );
    blanket.id                      = this.blanketID;
    IKRS.MessageBox.getDocumentBody().appendChild( blanket );
    blanket.style.display           = "none";     // Initially invisible
    blanket.style.position          = "absolute";
    blanket.style.left              = "0px";
    blanket.style.top               = "0px";
    blanket.style.width             = "100%";
    blanket.style.height            = "100%";
    blanket.style.backgroundColor   = "#888888";
    blanket.style.filter            = "alpha(opacity=65)";
    blanket.style.opacity           = "0.65";
    blanket.style.zIndex            = "9001";


    var box                         = document.createElement( "div" );
    box.id                          = this.boxID;
    IKRS.MessageBox.getDocumentBody().appendChild( box);
    box.style.display               = "none";     // Initially invisible
    box.style.position              = "absolute";
    box.style.backgroundColor       = "#eeeeee";
    box.style.borderWidth           = "1px";
    box.style.borderStyle           = "solid";
    box.style.borderColor           = "#000000";
    box.style.padding               = "0em";
    box.style.zIndex                = "9002";

    box.style.textAlign             = "center";
    box.innerHTML                   = "Test";
    /*
    box.innerHTML               = 
	"<div id=\"xyz\"></div>\n" +
	"<script laguage=\"Javascript\">\n" +
	"window.alert('Y');\n" +
	"var xyz_step = 0;\n" +
	"var xyz_elements = array( '|', '/', '-', '\' );\n" +
	//"window.setTimeout( \"xyz_next();\", 1000 );\n" +
	"function xyz_next() {\n" +
	"window.alert('X');\n" +
	"         document.getElementById( \"xyz\" ).innerHTML = xyz_elements[ xyz_step ];\n" +
	"         xyz_step = (xyz_step + 1) % xyz_elements.length;\n" +
	"}\n" +
	"</script>";
    window.setTimeout( "xyz_next();", 1000 );
    */

}

IKRS.MessageBox.prototype = new IKRS.Object();
IKRS.MessageBox.prototype.constructor = IKRS.MessageBox;

IKRS.MessageBox.prototype.setSize = function( width, height ) {
    this.boxWidth  = width;  // px
    this.boxHeight = height;
}


IKRS.MessageBox.prototype.mouseEvent = function() {
    alert( "Mouse Event?" );
}

IKRS.MessageBox.prototype.toggleVisibility = function() {

    // window.alert( "IKRS.MessageBox.prototype.toggleVisibility()" );

    IKRS.MessageBox.toggleElementVisibility( this.getBlanket() );
    IKRS.MessageBox.toggleElementVisibility( this.getBox() );

    this.getBlanket().onMouseClick = this.hide;
    
    /*
    if ( blanket.style.display == 'none' ) {
	//if( typeof cssPopup_onOpenHandler == "function" )
	//    cssPopup_onOpenHandler();
	blanket.style.display = 'block';
    }
    else {
	//if( typeof cssPopup_onCloseHandler == "function" )
	//    cssPopup_onCloseHandler();
	blanket.style.display = 'none';
    }
    */

}

/**
 * A static function!
 **/
IKRS.MessageBox.toggleElementVisibility = function( element ) {

    if ( !element.style.display ||
	 element.style.display == 'none' || 
	 typeof element.style == "undefined" ) {
	//if( typeof cssPopup_onOpenHandler == "function" )
	//    cssPopup_onOpenHandler();
	element.style.display = 'block';
    }
    else {
	//if( typeof cssPopup_onCloseHandler == "function" )
	//    cssPopup_onCloseHandler();
	// ...
	element.style.display = 'none';
    }
}

IKRS.MessageBox.getDocumentBody = function() {
    return document.getElementsByTagName( "body" )[0];
}

IKRS.MessageBox.prototype.getBlanket = function() {
    return document.getElementById( this.blanketID );
}

IKRS.MessageBox.prototype.getBox = function() {
    return document.getElementById( this.boxID );
}

/**
 * This resizes the blanket to fit the height of the page because there is not height=100% attribute. 
 * This also centers the popUp vertically.
 **/
IKRS.MessageBox.prototype._blanket_resize = function() {

    if (typeof window.innerWidth != 'undefined') {
	viewportheight = window.innerHeight;
    } else {
	viewportheight = document.documentElement.clientHeight;
    }

    if ((viewportheight > document.body.parentNode.scrollHeight) && (viewportheight > document.body.parentNode.clientHeight)) {
	blanket_height = viewportheight;
    } else {
	if (document.body.parentNode.clientHeight > document.body.parentNode.scrollHeight) {
	    blanket_height = document.body.parentNode.clientHeight;
	} else {
	    blanket_height = document.body.parentNode.scrollHeight;
	}
    }

    
    var blanket          = this.getBlanket(); 
    blanket.style.height = blanket_height + 'px';
    blanket.style.width  = "100%";
    var box              = this.getBox();
    //popUpDiv_height      = blanket_height/2 - Math.floor( this.boxHeight/2 ); //150 is half popup's height
    box.style.width      = this.boxWidth + "px";
    box.style.height     = this.boxHeight + "px";
    box.style.top        = blanket_height/2 - this.boxHeight/2 + "px";
    box.style.left       = blanket.style.width/2  - this.boxWidth/2 + "px";
}

/**
 * This centers the popUp vertically.
 **/
IKRS.MessageBox.prototype._box_reposition = function( ) {

    if (typeof window.innerWidth != 'undefined') {
	viewportwidth = window.innerHeight;
    } else {
	viewportwidth = document.documentElement.clientHeight;
    }

    if ((viewportwidth > document.body.parentNode.scrollWidth) && 
	(viewportwidth > document.body.parentNode.clientWidth) 
       ) {

	window_width = viewportwidth;

    } else {

	if (document.body.parentNode.clientWidth > document.body.parentNode.scrollWidth) {
	    window_width = document.body.parentNode.clientWidth;
	} else {
	    window_width = document.body.parentNode.scrollWidth;
	}

    }

    var popUpDiv        = this.getBox(); // document.getElementById(popUpDivVar);
    window_width        = window_width/2-150;//150 is half popup's width
    popUpDiv.style.left = window_width + 'px';
    
    //popUpDiv.style.dispaly = "table-cell";
    //popUpDiv.style.verticalAlign = "middle";
}

/**
 * This function contains the other three to make life simple in the HTML file.
 **/
IKRS.MessageBox.prototype.show = function( content ) {
    this._blanket_resize(); // cssPopup_blanket_size(windowname);
    this._box_reposition(); // cssPopup_window_pos(windowname);
    this.toggleVisibility(); //  cssPopup_toggle('cssPopup_blanket');
    // cssPopup_toggle(windowname);
    
    if( typeof content != "undefined" )
	this.getBox().innerHTML = content;
}


/**
 * This function contains the other three to make life simple in the HTML file.
 **/
IKRS.MessageBox.prototype.hide = function() {
    //this._blanket_resize(); // cssPopup_blanket_size(windowname);
    //this._box_reposition(); // cssPopup_window_pos(windowname);
    this.toggleVisibility(); //  cssPopup_toggle('cssPopup_blanket');
    // cssPopup_toggle(windowname);
}

