<?php 

header('Content-type: text/html');

$dir = "../../F2_Protos/Deliverables/";
$handle = opendir($dir);
while($name = readdir($handle)) {
    if(is_dir("$dir/$name")) {
        if($name != '.' && $name != '..') {
            //echo "directory: $name\n";
        }
    }
    else{
    	echo "<li><a href='../../F2_Protos/Deliverables/$name' target='_blank'>$name</a></li>";
    }
}
closedir($handle);

?>