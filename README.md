
Path Extrusion Generator
========================

@author   Ikaros Kappler
@date     2013-09-11
@version  0.1.0



Plan
----
- Namen finden
    + Domain anlegen
- Propaganda
- 




TODO
----
[2013-09-16]
 - Add an enhanced polygon triangulation algorithm for the case
   the mesh is split; the cut is not yet properly filled. Vertically
   non-convex bezier curves cause errors in the mesh.
 - Bug: the second last bezier point cannot be deleted.

[2013-09-13]
 - Fix Safari incompatibility
 - Add CSS message box for errors and warnings
 - Add process bar
 - Add a compatibility check with error message

[2013-09-12]
 - Add dummy console for older browsers

[2013-09-11]
 - [DONE 2013-09-11] 
   Zip file import
 - Add ruler/measurements
 - Implement split mesh
 - Implement second inner perpendicular hull (for wax)
 - [DONE 2013-09-12] 
   Implement a better bezier curve splitting
 - Add an undo-function to the bezier editor
 - Shape scaling by moving bounding box nodes


Changelog
---------
[2013-09-16]
 - The second last bezier curve was not deletable. This is fixed now.



Used libraries
--------------

 - three.js
 - jszip.js (v1.0.1-23)
 - jszip-deflate.js
 - jszip-load.js
 - base64-binary.js
 - FileSaver.js
 - Blob.js





Thanks to
---------
 
 [three.js]
   mrdoob / http://mrdoob.com/ 
   Larry Battle / http://bateru.com/news

 [baseg64-binary.js]
   Daniel Guerrero

 [jszip.js]
   Stuart Knightley <stuart [at] stuartk.com>

 [FileSaver.js]
  Eli Grey

 [STLBuilder inspirations]
   Paul Kaplan
 



