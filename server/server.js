// 전체 서버 관리
const express = require('express')
const cors = require('cors') // 보안과 관련(외부접근 허용부분)
const db = require("./db"); // js 확장자는 생략가능(다른 확장자는 안됨)
const path = require('path');

const userRouter = require("./routes/user");
const feedRouter = require("./routes/feed");
const commentRouter = require("./routes/comment");
const chatRouter = require("./routes/chat");


const app = express()
app.use(cors({
    origin : "*", // 모두 허용하겠다
    credentials : true
}))
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // 일종의 문법
// 자바 상기 : static 변수/메소드 등에서의 static은? => 

// router 영역
app.use("/user", userRouter);
app.use("/feed", feedRouter);
app.use("/comment", commentRouter);
app.use("/chat", chatRouter);


app.listen(3010, ()=>{ // 3010번 주소(host)
    console.log("server start!");
})