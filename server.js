const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const url = require("url");
const peerServer = ExpressPeerServer(server, {
    debug: true,
});
const path = require("path");
const { query } = require("express");
app.locals.first_user = true;
app.locals.meeting_id='';
app.locals.examUrl= ''
app.locals.baseURL = ''
app.set("view engine", "ejs");
app.use("/public", express.static(path.join(__dirname, "static")));
app.use("/peerjs", peerServer);


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "static", "index.html"));
});


const setUrl = (req) => {
    var hostname=req.headers.host; 
    // var pathname=url.parse(req.url).pathname;    //join is the pathname not required for now
    app.locals.meeting_id=req.query.exam_subject
    app.locals.baseURL ='http://'+hostname
    app.locals.examUrl = app.locals.baseURL+"?exam_subject="+app.locals.meeting_id
}

app.get("/join", (req, res) => {
    if(req.query.exam_subject){
        setUrl(req)
        res.redirect(
            url.format({
                pathname: `/join/${req.query.exam_subject}`,
                query: req.query,
            })
        );
    }
    else {
        res.sendFile(path.join(__dirname, "static", "index.html",{forStudent: "true"}));
    }

});

app.get("/joinold", (req, res) => {
    res.redirect(
        url.format({
            pathname: `/join/${req.query.exam_subject_student}`,
            query: req.query,
        })
    );
});

app.get("/join/:rooms", (req, res) => {
    res.render("room", { roomid: req.params.rooms, Myname: req.query.name });
});

io.on("connection", (socket) => {
    socket.on("join-room", (roomId, id, myname) => {

        socket.join(roomId);
        
        socket.to(roomId).broadcast.emit("user-connected", id, myname);

        socket.on("messagesend", (message) => {
            console.log(message);
            io.to(roomId).emit("createMessage", message);
        });

        socket.on("tellName", (myname) => {
            socket.to(roomId).broadcast.emit("AddName", myname);
        });

        socket.on("disconnect", () => {
            socket.to(roomId).broadcast.emit("user-disconnected", id);
        });
    });
});

server.listen(process.env.PORT || 3030);

console.log("GO TO http://localhost:3030/")
