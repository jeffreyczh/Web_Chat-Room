<?php
    $userfile = "data/user_list";
    $msgfile = "chatcontent/chatcontent"; // a file stores the latest N messages
    $max_msg = 3; // maximum messages that the msg file will store
    // get all users from a file
   function get_all_users($userfile) {
       return $allusers = json_decode(file_get_contents($userfile), TRUE);
   }
   // put a user's information into a file
   function put_user($nickname, $tile, $userfile) {
       $allusers = get_all_users($userfile);
       $allusers[$nickname] = $tile;
       file_put_contents($userfile, json_encode($allusers));
   }

   // remove an user from the file
   function remove_user($nickname, $userfile) {
       $allusers = get_all_users($userfile);
       if (array_key_exists($nickname, $allusers)) {
           unset($allusers[$nickname]);
       }
       file_put_contents($userfile, json_encode($allusers));
   }

   // put a message into the msg file
   function put_msg($msg, $msgfile) {
       global $max_msg;
       $msglines = array();
       if ( file_exists($msgfile) ) {
           $msglines = file($msgfile);
           // check if the length reaches to the maximum count
           if (count($msglines) >= $max_msg) {
               // pop one message
               array_shift($msglines);
           }
       }
       // push this message
       array_push($msglines, $msg);
       // store the array
       file_put_contents($msgfile, $msglines);
   }

   function get_msg($msgfile) {
      return file($msgfile, FILE_IGNORE_NEW_LINES);
   }

   // get an tile image html string based on the tile name
   function get_img($tile) {
       $imgstr = "<img src=\"icon/tile/" . 
                 $tile . ".jpg\" alt=\"" . $tile . "\">";
       return $imgstr;
   }
?>

