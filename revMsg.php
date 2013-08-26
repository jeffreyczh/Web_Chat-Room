<?php
    include_once "common.php";
    $tile = $_POST["tile"];
    $tileImg = get_img($tile);
    $nickname = $_POST["nickname"];
    $msg = $_POST["msg"];
    $combine = "<p style=\"margin-bottom:5px;\">" . $tileImg . "&nbsp;" 
                . $nickname . "&nbsp;&nbsp;&nbsp;" . 
                date(' H:i:s ') . "</p>";
    $msg_section = "<div style=\"padding-left: 1em;\">" . 
                    $msg . "</div>";
    $fullmsg = $combine . $msg_section . "\n";
    put_msg($fullmsg, $msgfile); // store the message to the msg file
?>

