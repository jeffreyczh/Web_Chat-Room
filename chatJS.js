"use strict";

var nickname; // the nick name that the user eventually uses
var tile; // the tile that this user is using
var localList = {}; // the local user list
var isEntered = false; // if already enter the chat room
var lastMsg = ""; // the last message that this client has ever received
var needAutoScrolling = true; // enable the auto-scrolling of the msg window or not
var isEmotionWindowOpened = false; // if the emotion window has been opened
var isColorBarOpened = false;

window.onload = function () {
    $("chatView").hide();
    $("memberListView").hide();
    $("chatView").hidden = false;
    $("memberListView").hidden = false;
    var tiles = $("tileList").childElements();
    for (var i = 0; i < tiles.length; i++) {
        tiles[i].observe("click", selectTile);
    }
    tiles[0].addClassName("tileSelected"); // by default, select the first tile
    $("loginBtn").observe("click", enterRoom);
};

// send log out message to the server
window.onbeforeunload = function () {
    if (isEntered == true) {
        new Ajax.Request("chatLeave.php", {
            method: "post",
            asynchronous: false,
            parameters: { nickname: nickname, tile: tile },
            onSuccess: function (response) { }
        });
    }
};


function selectTile(event) {
    // make all tiles unselected
    var tiles = $("tileList").childElements();
    for (var i = 0; i < tiles.length; i++) {
        tiles[i].removeClassName("tileSelected");
    }
    this.addClassName("tileSelected");
}

function enterRoom(event) {
    if ( $("namebox").value.length == 0 ) {
        // the nick name is not set yet
        $("namebox").highlight();
        return;
    }
    // get the tile that the user selects
    var tiles = $("tileList").childElements();
    for (var i = 0; i < tiles.length; i++) {
        if (tiles[i].hasClassName("tileSelected")) {
            tile = tiles[i].childElements()[0].alt;
            // send log in request
            $("loginBtn").disabled = true;
            $("enteringImg").hidden = false;
            new Ajax.Request("chatEnter.php",
            {
                method: "post",
                parameters: { nickname: $("namebox").value, tile: tile},
                onSuccess: enterResult
            });
            break;
        }
    }
    return;
}

function enterResult(ajax) {
    var enterResult = JSON.parse(ajax.responseText);
    if ( enterResult.result == "fail" ) {
        $("inuseWarning").update(enterResult.nickname + " is in use.");
        $("inuseWarning").hidden = false;
        $("loginBtn").disabled = false;
        $("enteringImg").hidden = true;
        return;
    }
    // success
    nickname = enterResult.nickname;
    // register for window closing event to log out
    isEntered = true;
    $("loginView").fade({
        afterFinish: initChatView
    });
}

function initChatView(effect) {
    $("main").removeChild(effect.element);
    $("main").style.width = "650px";
    $("chatView").appear({
        afterFinish: function(effect) {
            $("keytips").hidden = false;
        }
    });
    $("memberListView").blindDown();
    userListLongPooling();
    // set the input frame editable
    $("editwindow").contentDocument.designMode = "On";
    // wraps the lines
    $("editwindow").contentDocument.body.style.wordWrap = "break-word";
    $("msgwindow").contentDocument.body.style.wordWrap = "break-word";
    $("sendBtn").observe("click", sendMsg);
    // also send the message if ctrl + enter is pressed
    $("editwindow").contentWindow.document.onkeydown = function (e) {
        if (e.keyCode == 13 && e.ctrlKey == true) {
            sendMsg(null);
        }
    };
    // stop auto-scrolling feature of the msg window
    // if the mouse enters the window
    // restore the feature if the mouse exits the window
    $("msgwindow").observe("mouseover", function (event) {
        needAutoScrolling = false;
    });
    $("msgwindow").observe("mouseout", function (event) {
        needAutoScrolling = true;
    });
    // initialize the emotion window
    initEmotionWindow();
    // initialize other tool bar buttons
    $("boldBtn").observe("click", function (event) {
        $("editwindow").contentDocument.execCommand("Bold");
    });
    $("italicBtn").observe("click", function (event) {
        $("editwindow").contentDocument.execCommand("Italic");
    });
    $("underlineBtn").observe("click", function (event) {
        $("editwindow").contentDocument.execCommand("Underline");
    });
    initColorWindow();
    outputLongPooling();
}

// initialize the emotion window
function initEmotionWindow() {
    $("emotionArea").hide();
    $("emotionArea").hidden = false;
    $("emotionBtn").observe("click", function (event) {
        if (isEmotionWindowOpened == false) {
            // set the location of the emotion window
            var total = $("emotionBtn").offsetTop - parseInt($("emotionArea").getStyle("height"));
            $("emotionArea").style.top = total + "px";
            // show the emotion window
            $("emotionArea").grow();
            isEmotionWindowOpened = true;
        } else {
            // close the emotion window
            $("emotionArea").shrink();
            isEmotionWindowOpened = false;
        }
    });
    var emotions = $$(".emotion");
    for (var i = 0; i < emotions.length; i++) {
        var emotion = emotions[i];
        emotion.observe("click", function (event) {
            // user selects an emotion
            // the emotion will be inserted in the edit window
            // and close the emotion window
            $("emotionArea").shrink();
            isEmotionWindowOpened = false;
            // insert the emotion to the current cursor position
            $("editwindow").contentDocument.execCommand(
                "InsertHTML", false, this.innerHTML);
            $("editwindow").focus();
        });
    }
}

// initialize the color window
function initColorWindow() {
    $("colorArea").hide();
    $("colorArea").hidden = false;
    $("colorBtn").observe("click", function (event) {
        if (isColorBarOpened == false) {
            // set the location of the emotion window
            var total = $("colorBtn").offsetTop - parseInt($("colorArea").getStyle("height"));
            $("colorArea").style.top = total + "px";
            $("colorArea").style.left = $("colorBtn").offsetLeft + "px";
            // show the emotion window
            $("colorArea").slideDown({
                duration: 0.4
            });
            isColorBarOpened = true;
        } else {
            // press again to close the emotion window
            // and set the color of the text
            $("colorArea").slideUp({
                duration: 0.4
            });
            isColorBarOpened = false;
            $("editwindow").contentDocument.execCommand(
                "ForeColor", false, $$("#colorArea .color")[0].value);
            $("editwindow").focus();
        }
    });
}

// send the message to the server
function sendMsg(event) {
    //$("editwindow").contentDocument.body.innerHTML += "<img src=\"icon/loginloading.gif\" alt=\"loading\"/>"
    var msg = $("editwindow").contentDocument.body.innerHTML;
    if (msg.length < 1) {
        // show warning if the edit box is empty
        // and don't send the empty message
        $("editwindow").highlight();
        return;
    }
    new Ajax.Request("revMsg.php", {
        method: "post",
        parameters: { tile: tile, nickname: nickname, msg: msg },
        onSuccess: function(response){},
        onFailure: function (response) {
            alert("Fail to send the message");
        }
    });
    // clean the input box
    $("editwindow").contentDocument.body.innerHTML = "";
}

// ask for user list periodically
function userListLongPooling() {
    new Ajax.Request("checkUserList.php",
    {
        method: "post",
        onSuccess: updateUserList
    });
}



// update the user list
function updateUserList(ajax) {
    var remoteList = JSON.parse(ajax.responseText);
    removeFromLocalList(remoteList);
    addToLocalList(remoteList);
    setTimeout(userListLongPooling, 1500);  
}

// ask for update of the output window
function outputLongPooling() {
    new Ajax.Request("updateMsg.php", {
        method: "post",
        onSuccess: function (response) {
            var msgArray = JSON.parse(response.responseText).msg;
            var msgs = chooseMsg(msgArray);
            // for each messages that need to be added
            // append it to the output frame
            for (var i = 0; i < msgs.length; i++) {
                var p = new Element("p");
                p.update(msgs[i]);
                $("msgwindow").contentDocument.body.appendChild(p);
            }
            if (needAutoScrolling == true) {
                // auto-scroll the msg window to the location of the latest message
                $("msgwindow").contentDocument.body.scrollTop = 
                $("msgwindow").contentDocument.body.scrollHeight;
            }
            setTimeout(outputLongPooling, 500);
        }
    });
}

// choose which messages to output based on the last-received message
// return an array of the messages that are later than the last-received message
function chooseMsg(msgArray) {
    var newMsgs = [];
    for (var i = msgArray.length - 1; i >= 0; i--) {
        var msg = msgArray[i];
        if (msg == lastMsg) {
            break;
        }
        newMsgs.unshift(msg);
    }
    if (newMsgs.length > 0) {
        // update the lastest received message
        lastMsg = newMsgs[newMsgs.length - 1];
    }
    return newMsgs;
}

// compare the local user list with the remote user list
// remove an user from the local list if this user doesn't
// exist in the remote list
function removeFromLocalList(remoteList) {
    if ( isArrayEmpty(localList) ) {
        // the local list is empty. Do nothing
        return;
    }
    for (var nickname in localList) {
        if ( remoteList[nickname] == null ) {
            // an user in local list doesn't exist in remote list
            // get the node with this nick name
            var nodes = $("userList").childNodes;
            for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i].lastChild; // should be the text node
                if (node.nodeValue == nickname) {
                    // remove this node
                    nodes[i].shrink({
                        afterFinish: removeDt
                    });
                    delete localList[nickname];
                    break;
                }
            }
        }
    }
}

function removeDt(effect) {
    $("userList").removeChild(effect.element);
}

// compare the local user list with the remote user list
// add an new user to the local list if this user only exists
// in the remote list
function addToLocalList(remoteList) {

    for (var nickname in remoteList) {
        if ( !localList.hasOwnProperty(nickname) ) {
            var dt = new Element("dt");
            var img = new Element("img");
            var tile = remoteList[nickname];
            img.src = "icon/tile/" + tile + ".jpg";
            img.alt = tile;
            dt.appendChild(img);
            dt.appendChild(document.createTextNode('\u00A0\u00A0\u00A0'));
            dt.appendChild(document.createTextNode(nickname));
            dt.hide();
            $("userList").appendChild(dt);
            dt.grow();
            localList[nickname] = tile;
        }
    }
}

// check if the associative array is empty
function isArrayEmpty(array) {
    for (var key in array) {
        return false;
    }
    return true;
}
