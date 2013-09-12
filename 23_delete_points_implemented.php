<!DOCTYPE html>
<html> 
<head> 
<title>My first Three.js app</title> 
<meta charset="UTF-8">
<style>
body {
   font-family: Monospace;
   font-size: 10pt;
}

h3 {
  margin-bottom: 0px;
  margin-top: 0px;
}

input {
  font-family: Monospace;
}

canvas#preview_canvas { 
 position: absolute;
 top: 10px;
 left: 10px;
 width: 512px; 
 height: 768px; 
 border: 1px solid #000000;
}

canvas#bezier_canvas {
position: absolute;
top: 10px;
left: 532px;
width: 512px;
height: 768px;
border: 1px solid #000000;
}

div#mesh_controls {
position: absolute;
top: 10px;
left: 1054px;
width: 400px;
height: 330px;
border: 1px solid #000000;
padding: 10px;
}

div#shape_controls {
position: absolute;
top: 370px;
left: 1054px;
width: 400px;
height: 130px;
border: 1px solid #000000;
padding: 10px;
}

div#stl_builder {
position: absolute;
top: 530px;
left: 1054px;
width: 400px;
height: 58px;
border: 1px solid #000000;
padding: 10px;
}

div#zip_builder {
position: absolute;
top: 620px;
left: 1054px;
width: 400px;
height: 138px;
border: 1px solid #000000;
padding: 10px;
}

.tooltip {
    display: inline;
    position: relative;
    font-size: 10pt;
 }

.tooltip:hover:after{
    background: #333;
    background: rgba(0,0,0,.8);
    border-radius: 5px;
    bottom: 26px;
    color: #fff;
    content: attr(title);
    left: 20%;
    padding: 5px 15px;
    position: absolute;
    z-index: 98;
    width: 220px;
    font-size: 10pt;
}

tooltip:hover:before{
    border: solid;
    border-color: #333 transparent;
    border-width: 6px 6px 0 6px;
    bottom: 20px;
    content: "";
    left: 50%;
    position: absolute;
    z-index: 99;
    font-size: 10pt;
}

</style> 

</head> 

<body> 


<canvas 
  title="Click, hold and drag to rotate the view."
  class="tooltip"
  id="preview_canvas">
</canvas>

<div style="position: absolute; left: 10px; top: 788px; width: 256px;">
  <div style="position: absolute; top: 0px; left: 256px; width: 256px; text-align: right;">
  <button onclick="decreaseZoomFactor(true);">-</button>
  <button onclick="increaseZoomFactor(true);">+</button>
  </div>
</div>

<!-- 
  ATTENTION: THE CANVAS SIZE MUST NOT BE SET USING CSS! 
  OTHERWISE LINES WILL BE DRAWN BLURRY AND UNCLEAR!
  -->

<canvas 
  title="Double click onto the curve to add new control points. Press [Delete] to remove selected points."
  class="tooltip"
  id="bezier_canvas" 
  width="512px" 
  height="768px">
</canvas>

<div style="position: absolute; left: 532px; top: 788px; width: 256px;">
  <div>
  <form name="bezier_form">
  <!--
  <input type="checkbox" id="clear_on_repaint" name="clear_on_repaint" checked="checked" onchange="javascript:bezierCanvasHandler.redraw();" class="tooltip" title="Uncheck this, move some points. See what will happen ... it's kinda fun ;)" />
  <label for="clear_on_repaint">Clear on repaint</label>
  -->

  <br/>
  <input type="checkbox" id="draw_tangents" name="draw_tangents" checked="checked" onchange="javascript:bezierCanvasHandler.redraw();" class="tooltip" title="Disables the control points and tangents." />
  <label for="draw_tangents">Draw tangents</label>

  <br/>
  <input type="checkbox" id="draw_perpendiculars" name="draw_perpendiculars" onchange="javascript:bezierCanvasHandler.redraw();" class="tooltip" title="Draws a perpendicular hull that shows how the material thickness must be calculated." />
  <label for="draw_perpendiculars">Draw perpendiculars</label>

  <br/>
  <input type="checkbox" id="draw_linear_path_segments" name="draw_linear_path_segments" onchange="javascript:bezierCanvasHandler.redraw();" class="tooltip" title="The outer shape is a sequence of cubic bezier curves connected with each other. Enabling this will draw the linear path between the start- and end-points." />
  <label for="draw_linear_path_segments">Draw linear path segments</label>

  <br/>
  <input type="checkbox" id="draw_coordinate_system" name="draw_coordinate_system" onchange="javascript:bezierCanvasHandler.redraw();" class="tooltip" title="Show the origin at (0,0) on the X-Y-plane." />
  <label for="draw_coordinate_system">Draw coordinate system</label>

  <br/>
  <input type="checkbox" id="draw_bounding_box" name="draw_bounding_box" checked="checked" onchange="javascript:bezierCanvasHandler.redraw();" class="tooltip" title="The curve's bounding box is the minimal rectangular area around the bezier path that encloses the path itself." />
  <label for="draw_bounding_box">Draw bounding box</label>
  </form>
  </div>

  <div style="position: absolute; top: 0px; left: 256px; width: 256px; text-align: right;">
  <button onclick="bezierCanvasHandler.decreaseZoomFactor(true);">-</button>
  <button onclick="bezierCanvasHandler.increaseZoomFactor(true);">+</button>
  <br/>
<!--
  <button id="bezier_undo" onclick="bezier_undo();">Undo</button>
  <button id="bezier_redo" onclick="bezier_redo();">Redo</button>
-->
  </div>
</div>



<div id="mesh_controls">
<h3>Mesh controls</h3>
<form name="mesh_form">
<table border="0">

<tr>
  <td><label for="shape_segments">Shape&nbsp;segments: </label></td>
  <td><input type="number" id="shape_segments" name="shape_segments" value="80" class="tooltip" title="The number of vertices on the vertical shape (on the circle). More vertices make the mesh more accurate but it renders slower." /></td>
</tr>

<tr>
  <td><label for="path_segments">Path&nbsp;segments: </label></td>
  <td><input type="number" id="path_segments" name="path_segments" value="80" class="tooltip" title="The number of vertices on the horizontal shape (on the outer path). More vertices make the mesh more accurate but it renders slower."/></td>
</tr>

<tr>
  <td valign="top">Bend (<span id="preview_bend_display">0</span>°):</td>
  <td>
					     <script language="Javascript">
					     preview_bend_mousedown = false;
                                             </script>
					     <br/>
					     0°<input type="range" id="preview_bend" name="preview_bend" min="0" max="180" value="0" 
                                             style="width: 150px; margin-top: -12px;"
					     onmousedown="preview_bend_mousedown=true;"
					     onmouseup="preview_bend_mousedown=false;"
					     onmousemove="if(preview_bend_mousedown) document.getElementById('preview_bend_display').innerHTML=document.getElementById('preview_bend').value;"
					     onchange="document.getElementById('preview_bend_display').innerHTML=document.getElementById('preview_bend').value;preview_rebuild_model();" />180°

  </td>			     
</tr>

<tr>
  <td></td>
  <td>
        <input type="checkbox" id="build_negative_mesh" name="build_negative_mesh" />
          <label for="build_negative_mesh">Build negative mesh</label>
  </td>
</tr>

<tr>
  <td> <label for="mesh_hull_strength">Mesh&nbsp;hull&nbsp;strength</label><br/>
					     (only if hollow)
  </td>
  <td valign="top">
        <input type="number" id="mesh_hull_strength" name="mesh_hull_strength" value="25" class="tooltip" title="..." onchange="javascript:bezierCanvasHandler.redraw();" onkeyup="javascript:bezierCanvasHandler.redraw();" />px
         
  </td>
</tr>

<tr>
  <td></td>
  <td>
        <input type="checkbox" id="mesh_close_path_begin" name="mesh_close_path_begin" disabled="disabled" />
          <label for="mesh_close_path_begin">Close path begin</label>
  </td>
</tr>

<tr>
  <td></td>
  <td>
        <input type="checkbox" id="mesh_close_path_end" name="mesh_close_path_end" checked="checked" />
          <label for="mesh_close_path_end">Close path end</label>
  </td>
</tr>

<tr>
  <td></td>
  <td>
        <input type="checkbox" id="wireframe" name="wireframe" />
          <label for="wireframe">Wireframe</label>
  </td>
</tr>

<tr>
  <td></td>
  <td>
	<div style="position: relative; top: -12px;">
        <input type="checkbox" id="triangulate" name="triangulate" checked="checked" />
	<label for="triangulate">Triangulate</label> 
	<span class="tooltip" title="Note: quad faces render faster but only triangulated meshes are STL compatible!" style="font-size: 22pt;">&#x26a0;</a><br/>
	</div>
							     <!--
        <div style="margin-left: 35px;">*quad faces render faster but only triangulated meshes are STL compatible</div>
-->
      
  </td>
</tr>


<tr>
  <td></label></td>
  <td><input type="button" value="Rebuild" onclick="preview_rebuild_model();"></td>
</tr>

</table>
</form>
</div>

<div id="shape_controls">
  <h3>Save shape to JSON file</h3>
  <button onclick="saveTextFile( bezierCanvasHandler.bezierPath.toJSON(), 'bezier_shape.json', 'application/json' );">Export JSON ...</button>
  <br/>
  <br/>							     
  <h3>Load shape from JSON file</h3>
  <form name="bezier_file_upload_form">
  <input type="file" name="bezier_json_file" /><br/>
  <input type="button" value="Upload JSON file" onclick="upload_bezier_json_file( document.forms['bezier_file_upload_form'].elements['bezier_json_file'] );">
  </form>
</div>

<div id="stl_builder">
<h3>Export STL file</h3>
<form name="stl_form">
  <label for="stl_filename">Filename</label>
  <input type="text" id="stl_filename" name="stl_filename" value="my_exxxtrusion.stl" />
  <input type="button" value="Save STL ..." onclick="STLBuilder.saveSTL( getPreviewMesh().geometry, document.forms['stl_form'].elements['stl_filename'].value );" /> 
</form>
</div>


<div id="zip_builder">
<h3>Export ZIP file</h3>
<form name="zip_form">
  <label for="zip_filename">Filename</label>
  <input type="text" id="zip_filename" name="zip_filename" value="full_backup.zip" />
  <input type="button" value="Save ZIP ..." onclick="ZipFileExporter.exportZipFile( document.forms['zip_form'].elements['zip_filename'].value );" /> <br/>
  <div style="text-align: right"><input type="checkbox" id="compress_zip" name="compress_zip" /><label for="compress_zip">Compress (slower!)</label></div>
</form>

<h3>Import ZIP file</h3>
<form name="zip_import_form">
  <input type="file" name="zip_upload_file" /><br/>
  <input type="button" value="Upload ZIP file" onclick="ZipFileImporter.importZipFile( document.forms['zip_import_form'].elements['zip_upload_file'] );">	
</form>

</div>


<!-- <script language="Javascript" type="text/javascript" src="prototype-1.6.0.3.js"></script> -->
<script language="Javascript" type="text/javascript" src="three.js"></script>

<script language="Javascript" type="text/javascript" src="Blob.js"></script>
<script language="Javascript" type="text/javascript" src="FileSaver.js"></script>
<script language="Javascript" type="text/javascript" src="jszip.js"></script>
<script language="Javascript" type="text/javascript" src="jszip-deflate.js"></script>
<script language="Javascript" type="text/javascript" src="jszip-load.js"></script>
<script language="Javascript" type="text/javascript" src="STLBuilder.js"></script>

<script language="Javascript" type="text/javascript" src="StringFileExporter.js"></script>
<script language="Javascript" type="text/javascript" src="upload_bezier_json_file.js"></script>
<script language="Javascript" type="text/javascript" src="base64-binary.js"></script>
<script language="Javascript" type="text/javascript" src="ZipFileExporter.js"></script>
<script language="Javascript" type="text/javascript" src="ZipFileImporter.js"></script>

<script language="Javascript" type="text/javascript" src="IKRS.js"></script>

<!-- This class will be obsolete soon ... -->
<!-- <script language="Javascript" type="text/javascript" src="IKRS.ExtrudePathGeometry.js"></script> -->

<script language="Javascript" type="text/javascript" src="IKRS.Object.js"></script>

<script language="Javascript" type="text/javascript" src="IKRS.ShapedPathGeometry.js"></script>
<script language="Javascript" type="text/javascript" src="IKRS.PathDirectedExtrudeGeometry.js"></script>

<script language="Javascript" type="text/javascript" src="IKRS.Utils.js"></script>

<script language="Javascript" type="text/javascript" src="IKRS.BoundingBox2.js"></script>
<script language="Javascript" type="text/javascript" src="IKRS.CubicBezierCurve.js"></script>
<script language="Javascript" type="text/javascript" src="IKRS.BezierCanvasHandler.js"></script>
<script language="Javascript" type="text/javascript" src="IKRS.BezierPath.js"></script>
<script language="Javascript" type="text/javascript" src="IKRS.UndoHistory.js"></script>



<script language="Javascript">

  /**
   * ...
   **/
  function getPreviewMesh() {
	//return preview_mesh;
	return previewCanvasHandler.preview_mesh;
  }

  function bezier_undo() {
    var hasMoreUndoSteps = this.bezierCanvasHandler.undo();
    
    window.alert( this.bezierCanvasHandler.undoHistory._toString() );
    
    //document.getElementById( "bezier_undo" ).disabled = !hasMoreUndoSteps;
  }

  function bezier_redo() {
    var hasMoreRedoteps = this.bezierCanvasHandler.redo();
    //document.getElementById( "bezier_redo" ).disabled = !hasMoreRedoSteps;
  }

  function setBezierPath( bezierPath ) {
    //this.bezierCanvasHandler.bezierPath = bezierPath;
    
    this.bezierCanvasHandler.setBezierPath( bezierPath );
    //addToBezierUndoHistory( bezierPath );
    //this.bezierCanvasHandler.redraw();

    
			
    preview_rebuild_model();
  }

  function getBezierPath() {
    return this.bezierCanvasHandler.bezierPath;
  }

  //window.alert( JSON.stringify(IKRS) );
  //window.alert( "AA" );
  this.bezierCanvasHandler = new IKRS.BezierCanvasHandler();

  

</script>

<script language="Javascript" type="text/javascript" src="IKRS.PreviewCanvasHandler.js"></script>

<script>

var previewCanvasHandler = new IKRS.PreviewCanvasHandler( this.bezierCanvasHandler,
							  512, 
							  768 
							  );

previewCanvasHandler.preview_rebuild_model();
previewCanvasHandler.preview_camera.position.z = 500;



function preview_render() {
  
  // Recursive call
  requestAnimationFrame( this.preview_render ); 
  previewCanvasHandler.render( this.preview_scene, 
			       this.preview_camera 
			       ); 
}

function decreaseZoomFactor( redraw ) {
    this.previewCanvasHandler.preview_mesh.scale.multiplyScalar( 1/1.2 );
    if( redraw )
	preview_render();
}

function increaseZoomFactor( redraw ) {
    this.previewCanvasHandler.preview_mesh.scale.multiplyScalar( 1.2 );
    if( redraw )
	preview_render();
}

function preview_rebuild_model() {
  this.previewCanvasHandler.preview_rebuild_model();
}


window.onload = preview_render;


</script>

</body> 
</html>
