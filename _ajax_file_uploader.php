<?php

/**
 * @author Ikaros Kappler
 * @date 2013-08-22
 * @version 1.0.0
 **/


if( count($_FILES) == 0 ) {

  header( "HTTP/1.1 400 Bad Request", TRUE );
  die( "Uploaded file missing." );

}


$fileKey = "bezier_json_file";

if( $_FILES[$fileKey]["error"] ) {

  header( "HTTP/1.1 500 Internal Server Error", TRUE );
  die( "Error while uploading file (code=" . $_FILES[$fileKey]["error"] . ")." );

}

header( "Content-Type: application/octet-stream" );
header( "Content-Length: " . $_FILES[$fileKey]["size"] );
header( "Content-Disposition: filename=\"" . $_FILES[$fileKey]["name"] . "\"" );

readfile( $_FILES["tmp_name"] );

?>

