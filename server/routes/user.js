const express = require('express')
const router = express.Router();
const db = require("../db"); // js 확장자는 생략가능(다른 확장자는 안됨)
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken'); // jwt 토큰
const JWT_KEY = "server_secret_key"; 
// 해시 함수 실행 위해 사용할 키로 아주 긴 랜덤한 문자를 사용하길 권장하며, 노출되면 안됨.
// 수업 때는 편의를 위해 간단하게 썼지만, 원래는 랜덤하게 긴 값들이 들어가야 함

// 아이디 중복체크
router.get('/checkId', async (req, res) => {
    const { userId } = req.query;  // GET 방식에서는 req.query 사용

    try {
        let sql = "SELECT COUNT(*) AS cnt FROM PRO_TBL_USER WHERE USER_ID = ?";
        let [result] = await db.query(sql, [userId]);
        // cnt가 0이면 사용 가능, 1 이상이면 이미 존재
        if (result[0].cnt > 0) {
            res.json({ exists: true });
        } else {
            res.json({ exists: false });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ exists: false, error: "서버 오류" });
    }
});


// 회원가입
router.post('/join', async (req, res) => {
    let{userId, pwd, email} = req.body
    try {
        let hashPwd = await bcrypt.hash(pwd, 10)
        let sql = "INSERT INTO PRO_TBL_USER(USER_ID, PASSWORD, EMAIL) "
                + "VALUES(?, ?, ?)";
        let result = await db.query(sql, [userId, hashPwd, email]);
        res.json({
            result : result,
            msg : "가입되었습니다."
        });
    } catch (error) {
        console.log(error);
    } 
})

// 로그인 (jwt 생성까지)
router.post('/login', async (req, res) => { // 요청하는건 req 안에있음
    let{userId, pwd} = req.body
    try {
        // 1) 먼저 유저 아이디 조회, 그후 해시값 조회 
        // 셀렉트니까 결과 list에 담김-개수 명확하지 않으므로!
        let sql = "SELECT * FROM PRO_TBL_USER WHERE USER_ID = ?";
        let [list] = await db.query(sql, [userId]); // [] 안 내용들이 VALUES뒤 물음표에 순차적 들어감
        let msg = "";
        let result = "false";  // success/fail이든 true/false든 상관x
        // const 특징 : 자바로 얘기하자면 상수(수정불가능값) 개념 > 그래서 const 말고 let으로 함

        let token = null; // 토큰 변수 if문 밖에 생성

        if(list.length > 0){ // 1개이상 = 일치값이 있다(아이디 존재)
            // 비번 비교하기 (작업이 오래걸릴 수 있으니 await로 비동기 시켜줘야함)
            let match = await bcrypt.compare(pwd, list[0].PASSWORD) 
            // 입력한 pwd의 해시값과 list에 있는 해시화된 pwd와 비교
            // ↓ 결과는 true/false로 리턴됨
            if(match){ 
                msg = list[0].USER_ID + "님 환영합니다.";
                result = true;   
                
                let user = {
                    // 로그인 성공 시 토큰에 넣을 값들 
                    // (추가로 권한 등 필요한 정보 있으면 추가하면됨)
                    userId : list[0].USER_ID,
                    //status : "A" // 권한 하드코딩 (db없어서 일단 하드코딩)
                };
                token = jwt.sign(user, JWT_KEY, {expiresIn : '1h'}); 
                // 파라미터 :  맵정보, 위에서 입력한 키값, 만료 시간
                console.log(token); 

            } else {
                msg = "비밀번호를 확인해주세요."
            }
        } else { // 일치값 없음 (아이디 없음)
            msg = "해당 아이디가 존재하지 않습니다.";
        }

        // ★ 이 부분 수정: result가 true일 때만 token을 포함하도록 조건 추가 ★
        let response = {
            msg,
            result,
        };
        if (result === true) {
            response.token = token; // 로그인 성공 시에만 토큰을 응답 객체에 추가
        }

        res.json(response); // 수정된 응답 객체를 전송
    } catch (error) {
        console.log(error);
    } 
})


// 로그인 하는 순간 정보 받아서 피드화면에 표시(db에서 가져오기)
router.get('/:userId', async (req, res) => {
    let{userId} = req.params;
    try {
        // 방법1) 2개 쿼리 써서 리턴
        // let [list] = await db.query("SELECT * FROM TBL_USER WHERE USERID = ?", [userId]);
        // let [cnt] = await db.query("SELECT COUNT(*) FROM TBL_FEED WHERE USERID = ?", [userId]);
        // res.json({
        //     user : list[0],
        //     cnt : cnt[0]
        // })

        // 방법2) 조인 쿼리 만들어서 하나로 리턴
        let sql = 
                "SELECT U.*, IFNULL(U.follower, 0) AS follower, IFNULL(U.following, 0) AS following, IFNULL(T.CNT, 0) cnt " +
                "FROM PRO_TBL_USER U " +
                "LEFT JOIN ( " +
                "    SELECT USER_ID, COUNT(*) CNT " +
                "    FROM PRO_TBL_POST " +
                // "    WHERE USERID = ? " +
                "    GROUP BY USER_ID " +
                ") T ON U.USER_ID = T.USER_ID " +
                "WHERE U.USER_ID = ?";
        let [list] = await db.query(sql, [userId]);        
        res.json({
            user : list[0],
            result : "success"
        })
    } catch (error) {
        console.log(error);
    } 
})


// 비밀번호 리셋에서 '계정찾기'
router.post('/searchpwd', async (req, res) => {
    const { userId, email } = req.body;  

    try {
        let sql = "SELECT COUNT(*) AS cnt FROM PRO_TBL_USER WHERE USER_ID = ? AND EMAIL = ?";
        let [result] = await db.query(sql, [userId, email]);
        // cnt가 0이면 사용 가능, 1 이상이면 이미 존재
        if (result[0].cnt > 0) {
            res.json({ exists: true,  msg: "계정 확인 완료" });
        } else {
            // 아이디가 없거나 이메일이 틀린 경우 메시지 구분 
            let sqlIdOnly = "SELECT COUNT(*) AS cnt FROM PRO_TBL_USER WHERE USER_ID = ?";
            let [idResult] = await db.query(sqlIdOnly, [userId]);

            if (idResult[0].cnt === 0) {
                res.json({ result: false, msg: "해당 아이디가 존재하지 않습니다." });
            } else {
                res.json({ result: false, msg: "이메일이 일치하지 않습니다." });
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ exists: false, error: "서버 오류" });
    }
});

// 비밀번호 변경
router.put('/updatepwd', async (req, res) => {
    const { userId, pwd } = req.body; 
    try {
        let hashPwd = await bcrypt.hash(pwd.trim(), 10)
        let sql = "UPDATE PRO_TBL_USER SET PASSWORD = ? WHERE USER_ID = ?";
        // select가 아니니 list로 받을 필요 없음
        let result = await db.query(sql, [hashPwd, userId ]); 
        res.json({
            result : result,
            msg : "비밀번호가 변경되었습니다."
        });
    } catch (error) {
        console.log("에러 발생!");
    }
})



module.exports = router; // 외부에서 쓸 수 있게 exports