<?php
   include_once "common.php";

   $nickname = $_POST["nickname"];
   $tile = $_POST["tile"];
   

   /* check if the nickname is in use */
   if ( !file_exists($userfile) ) {
       $userArray[$nickname] = $tile;
       file_put_contents($userfile, json_encode($userArray));
   } else {
       $allusers = get_all_users($userfile);
       if ( array_key_exists($nickname, $allusers) ) {
           // in use. enter denied
           $fail = array("nickname" => $nickname, "result" => "fail");
           echo json_encode($fail);
           exit;
       }
       put_user($nickname, $tile, $userfile);
   }
   $success = array("nickname" => $nickname, "result" => "success");
   echo json_encode($success);
   // shows "enter" message
   $enterimg = "<img src=\"icon/enter.jpg\" alt=\"enter\">";
   $tileimg = get_img($tile);
   $entermsg = $enterimg . "&nbsp;&nbsp;&nbsp;"
                . $tileimg . "&nbsp;"
                . $nickname . "&nbsp;&nbsp;has entered the chat room&nbsp;&nbsp;&nbsp;"
                . date(' H:i:s ') . "\n";
    put_msg($entermsg, $msgfile);
?>