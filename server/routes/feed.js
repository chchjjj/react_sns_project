const express = require('express')
const router = express.Router();
const db = require("../db"); // js 확장자는 생략가능(다른 확장자는 안됨)
const authMiddleware = require("../auth"); // auth.js에 있는 토큰 검증 함수 쓰기위해

//---------- 업로드 관련 ---------------------
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.post('/upload', upload.array('file'), async (req, res) => {
    let {feedId} = req.body;
    const files = req.files;
    // const filename = req.file.filename; 
    // const destination = req.file.destination; 
    try{
        let results = [];
        let host = `${req.protocol}://${req.get("host")}/`;
        for(let file of files){
            let filename = file.filename;
            let destination = file.destination;
            let query = "INSERT INTO TBL_FEED_IMG VALUES(NULL, ?, ?, ?)";
            let result = await db.query(query, [feedId, filename, host+destination+filename]);
            results.push(result);
        }
        res.json({
            message : "result",
            result : results
        });
    } catch(err){
        console.log("에러 발생!");
        res.status(500).send("Server Error");
    }
});
//---------- 업로드 관련 (끝) ---------------------

// 로그인 정보 받아서 어쩌구(db에서 가져오기)
router.get('/:userId', async (req, res) => {
    let{userId} = req.params; // 파라미터에 있는 userId 꺼내오기(리퀘스트의 파람에서 꺼내기)
    try {
        let sql = "SELECT * FROM TBL_FEED F "
                + "INNER JOIN TBL_FEED_IMG I ON F.ID = I.FEEDID "
                + "WHERE F.USERID = ?";
        // DB 호출        
        let [list] = await db.query(sql, [userId]);  // DB에서 쿼리호출
        // 최종적으로 JSON 형태로 보내주기
        res.json({
            list : list, // 피드니까 2개이상 나올 수 있으니 LIST 그 자체로 보내주기
            result : "success"
        })
    } catch (error) {
        console.log(error);
    } 
})


// 피드 삭제
router.delete("/:feedId", authMiddleware, async (req, res) => {
    // /:feedId는 꺼낼 이름을 약속한 것 (다른 단어여도됨 - 밑에 let {} 안 단어와 일치)
    // authMiddleware 함수를 두번째 인자값에 넣어서, 이거 먼저 실행되도록함 (토큰 검증)
    // 이거 없으면 썬더 클라이언트 통해서 리스트 삭제되기도 함 (그래서 매우 중요함)
    let {feedId} = req.params; // params은 넘어오는 모든 정보 담김
    try {
        let sql = "DELETE FROM TBL_FEED WHERE ID = ?";
        // select가 아니니 list로 받을 필요 없음
        let result = await db.query(sql, [feedId]); // []안에 담긴 값이 위 쿼리 ? 에 들어감
        res.json({
            result : result,
            msg : "삭제완료"
        });
    } catch (error) {
        console.log("에러 발생!");
    }
})


// 추가 - 인서트면 민감정보 있을 수 있어 post로 약속(웬만하면)
// pk가 있는 상태가 아니므로 "/"
router.post("/", async (req, res) => {
    let{userId, content} = req.body
    try {
        let sql = "INSERT INTO TBL_FEED VALUES(NULL, ?, ?, NOW())";
        // PK인데 AI로 자동으로 증가되는거는 NULL로 해도 알아서 순차적 들어감 (리액트에서만?)
        let result = await db.query(sql, [userId, content])
        res.json({
            result : result,
            msg : "저장 완료"
        });
    } catch (error) {
        console.log("에러 발생!");
    }
})



module.exports = router; // 외부에서 쓸 수 있게 exports