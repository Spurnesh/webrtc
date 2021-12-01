const socket = io("/");
const main__chat__window = document.getElementById("main__chat_window");
const videoGrids = document.getElementById("video-grids");
const videoGridsStudents = document.getElementById("video-grids-students");
const myVideo = document.createElement("video");
const chat = document.getElementById("chat");
OtherUsername = "";
chat.hidden = true;
myVideo.muted = true;



window.onload = () => {       
    if(document.location.href.includes('exam_subject_student')){
        document.getElementById("video-grids").remove();
        document.getElementById("video").remove();
        document.getElementById("invite-button").remove();
        document.getElementById("leave-button-teacher").remove();        
        setTimeout(function(){ 
            addVideoStreamForStudent(myVideo,myVideoStream,myname) 
        }, 5000);
    }
    else {
        document.getElementById("video-grids-students").remove();
        $("#getCodeModal").modal("show");      
    }
};

var peer = new Peer(undefined, {
    path: "/peerjs",
    host: " webrtcexam.herokuapp.com ",
    port: "443",
});

let myVideoStream;
const peers = {};
var getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;

sendmessage = (text) => {
    if (event.key === "Enter" && text.value != "") {
        socket.emit("messagesend", myname + ' : ' + text.value);
        text.value = "";
        main__chat_window.scrollTop = main__chat_window.scrollHeight;
    }
};


navigator.mediaDevices
    .getUserMedia({
        video: true,
        audio: true,
    })
    .then((stream) => {
        myVideoStream = stream;
        addVideoStream(myVideo, stream, myname);

        socket.on("user-connected", (id, username) => {
            console.log("userid:" + id);
            connectToNewUser(id, stream, username);
            socket.emit("tellName", myname);
        });

        socket.on("user-disconnected", (id) => {
            if (peers[id]) peers[id].close();
        });
    });

peer.on("call", (call) => {
    getUserMedia({ video: true, audio: true },
        function(stream) {
            call.answer(stream); // Answer the call with an A/V stream.
            const video = document.createElement("video");
            call.on("stream", function(remoteStream) {
                addVideoStream(video, remoteStream, OtherUsername);
            });
        },
        function(err) {
            console.log("Failed to get local stream", err);
        }
    );
});

peer.on("open", (id) => {
    socket.emit("join-room", roomId, id, myname);
});

socket.on("createMessage", (message) => {
    var ul = document.getElementById("messageadd");
    var li = document.createElement("li");
    li.className = "message";
    li.appendChild(document.createTextNode(message));
    ul.appendChild(li);
});

socket.on("AddName", (username) => {
    OtherUsername = username;
});

const RemoveUnusedDivs = () => {
    alldivs = videoGrids.getElementsByTagName("div");
    for (var i = 0; i < alldivs.length; i++) {
        e = alldivs[i].getElementsByTagName("video").length;
        if (e == 0) {
            alldivs[i].remove();
        }        
    }
};


// code of call will be crucial in this app
const connectToNewUser = (userId, streams, myname) => {
    const call = peer.call(userId, streams);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream, myname);
    });
    call.on("close", () => {
        video.remove();
        RemoveUnusedDivs();
    });
    peers[userId] = call;
};
// code of call will be crucial in this app

const cancel = () => {    
    $("#getCodeModal").modal("hide");
};

const copy = async() => {
    const roomid = document.getElementById("roomid").innerText;
    await navigator.clipboard.writeText("http://localhost:3030/join/" + roomid);
};

const invitebox = () => {
    document.getElementById("url_span").style.visibility = "hidden";
    $("#getCodeModal").modal("show");
};

const copyExamUrlHandler = () => {
    var copyText = document.getElementById("modal_url_input");
    copyText.select();
    copyText.setSelectionRange(0, 99999); /* For mobile devices */
    navigator.clipboard.writeText(copyText.value);
    document.getElementById("url_span").style.margin = "10px 0px 0px 5px";
    document.getElementById("url_span").style.color = "#c74a4a";  
    document.getElementById("url_span").style.visibility = "visible";
};

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        document.getElementById("mic").style.color = "red";
    } else {
        document.getElementById("mic").style.color = "white";
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
};

const VideomuteUnmute = () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        document.getElementById("video").style.color = "red";
    } else {
        document.getElementById("video").style.color = "white";
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
};

const showchat = () => {
    if (chat.hidden == false) {
        chat.hidden = true;
    } else {
        chat.hidden = false;
    }
};

const addVideoStreamForStudent = (videoEl, stream, name) => {
    videoEl.srcObject = stream;
    videoEl.addEventListener("loadedmetadata", () => {
        videoEl.play();
    });
    const h3 = document.createElement("h3");
    const h3name = document.createTextNode(name);
    h3.setAttribute("class", "video-grid-header");
    h3.appendChild(h3name);
    const videoGrid = document.createElement("div");
    videoGrid.id = videoGridsStudents.length + 1
    videoGrid.classList.add("video-grid");
    videoGrid.appendChild(h3);
    videoGridsStudents.appendChild(videoGrid);
    videoGrid.append(videoEl);
    RemoveUnusedDivs();
    let totalUsers = document.getElementsByTagName("video").length;
    if (totalUsers > 1) {
        for (let index = 0; index < totalUsers; index++) {
            document.getElementsByTagName("video")[index].style.width =
                100 / totalUsers + "%";
        }
    }
};



const addVideoStream = (videoEl, stream, name) => {
    videoEl.srcObject = stream;
    videoEl.addEventListener("loadedmetadata", () => {
        videoEl.play();
    });
    const h3 = document.createElement("h3");
    const h3name = document.createTextNode(name);
    h3.setAttribute("class", "video-grid-header");
    h3.appendChild(h3name);
    const videoGrid = document.createElement("div");
    videoGrid.id = videoGrids.length + 1
    videoGrid.classList.add("video-grid");
    videoGrid.appendChild(h3);
    videoGrids.appendChild(videoGrid);
    videoGrid.append(videoEl);
    RemoveUnusedDivs();
    let totalUsers = document.getElementsByTagName("video").length;
    if (totalUsers > 1) {
        for (let index = 0; index < totalUsers; index++) {
            document.getElementsByTagName("video")[index].style.width =
                100 / totalUsers + "%";
        }
    }
};
