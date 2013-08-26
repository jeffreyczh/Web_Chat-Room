<?php
    include_once "common.php";
    $nickname = $_POST["nickname"];
    $tile = $_POST["tile"];
    remove_user($nickname, $userfile);
    // show leaving message
    $leaveimg = "<img src=\"icon/leave.jpg\" alt=\"leave\">";
    $tileimg = get_img($tile);
    $leavemsg = $leaveimg . "&nbsp;&nbsp;&nbsp;"
                . $tileimg . "&nbsp;"
                . $nickname . "&nbsp;&nbsp;has left the chat room&nbsp;&nbsp;&nbsp;"
                . date(' H:i:s ') . "\n";
    put_msg($leavemsg, $msgfile);
?>

