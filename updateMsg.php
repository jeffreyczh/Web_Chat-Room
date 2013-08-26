<?php
    include_once "common.php";
    $msg = "";
    if ( file_exists($msgfile) ) {
       $msg = get_msg($msgfile);
    }
     $return_msg = array("msg" => $msg);
     echo json_encode($return_msg);
?>

