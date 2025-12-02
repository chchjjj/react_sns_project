const express = require('express')
const router = express.Router();
const db = require("../db"); // js 확장자는 생략가능(다른 확장자는 안됨)
const authMiddleware = require("../auth"); // auth.js에 있는 토큰 검증 함수 쓰기위해


// 댓글 불러오기
router.get('/:postId', async (req, res) => {
    const postId = req.params.postId; 
    try {
        let sql = 
                "SELECT * FROM PRO_TBL_COMMENT WHERE POST_ID = ?";
        let [list] = await db.query(sql, [postId]);        
        res.json({
            //user : list[0],
            user : list,
            result : "success"
        })
    } catch (error) {
        console.log(error);
    } 
})

// 댓글 개수 조회
router.get('/count/:postId', async (req, res) => {
  const postId = req.params.postId;
  try {
    const sql = "SELECT COUNT(*) AS cnt FROM PRO_TBL_COMMENT WHERE POST_ID = ?";
    const [rows] = await db.query(sql, [postId]);
    res.json({ count: rows[0].cnt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "댓글 수 조회 실패" });
  }
});


// 댓글 등록 + 알림 등록
router.post("/", async (req, res) => {
    let { postId, userId, content } = req.body;
    const conn = await db.getConnection(); 
    try {
        await conn.beginTransaction();

        // 1) 댓글 등록
        let commentSql = `INSERT INTO PRO_TBL_COMMENT VALUES(NULL, ?, ?, ?, NOW())`;
        let [commentResult] = await conn.query(commentSql, [postId, userId, content]);
        let commId = commentResult.insertId;

        // 2) 게시글 작성자 조회 (알림 수신자)
        let [postRows] = await conn.query(
            "SELECT USER_ID FROM PRO_TBL_POST WHERE POST_ID = ?",
            [postId]
        );

        let receiver = postRows[0]?.USER_ID;

        // 3) 본인 글에 본인이 댓글 단 경우 알림 제외
        if (receiver && receiver !== userId) {
            let notiSql = `
                INSERT INTO PRO_TBL_NOTIFY
                (NOTI_TYPE, USER_ID, POST_ID, COMM_ID, IS_READ, CDATETIME)
                VALUES('COMMENT', ?, ?, ?, 'N', NOW())
            `;
            await conn.query(notiSql, [receiver, postId, commId]);
        }

        await conn.commit();

        res.json({
            msg: "댓글 및 알림 등록 완료",
            commId: commId,
        });

    } catch (error) {
        await conn.rollback();
        console.log("댓글/알림 등록 에러:", error);
        res.status(500).json({ msg: "댓글 등록 실패" });
    } finally {
        conn.release();
    }
});

// 댓글 삭제
router.delete("/:commId", authMiddleware, async (req, res) => {
    // /:commId는 꺼낼 이름을 약속한 것 (다른 단어여도됨 - 밑에 let {} 안 단어와 일치)
    // authMiddleware 함수를 두번째 인자값에 넣어서, 이거 먼저 실행되도록함 (토큰 검증)
    // 이거 없으면 썬더 클라이언트 통해서 리스트 삭제되기도 함 (그래서 매우 중요함)
    let {commId} = req.params; // params은 넘어오는 모든 정보 담김
    try {
        let sql = "DELETE FROM PRO_TBL_COMMENT WHERE COMM_ID = ?";
        // select가 아니니 list로 받을 필요 없음
        let result = await db.query(sql, [commId]); // []안에 담긴 값이 위 쿼리 ? 에 들어감
        res.json({
            result : result,
            msg : "댓글 삭제완료"
        });
    } catch (error) {
        console.log("댓글 삭제 에러 발생!");
    }
})



// 알림 목록 조회 (수신자 기준) + 댓글 & DM 둘다 가져오게하기
router.get("/notify/:userId", async (req, res) => {
    let { userId } = req.params;

    try {
        let sql = `
            SELECT 
                NOTI_ID, NOTI_TYPE, USER_ID, POST_ID, COMM_ID, MSG_ID, IS_READ, CDATETIME
            FROM PRO_TBL_NOTIFY
            WHERE USER_ID = ?
            ORDER BY CDATETIME DESC
        `;

        let [list] = await db.query(sql, [userId]);

        res.json(list);
    } catch (error) {
        console.log("알림 목록 조회 실패:", error);
        res.status(500).json({ msg: "알림 조회 실패" });
    }
});

// 알림 읽음 처리 (업데이트)
router.put("/read/:notiId", async (req, res) => {
    let { notiId } = req.params;

    try {
        let sql = `
            UPDATE PRO_TBL_NOTIFY
            SET IS_READ = 'Y'
            WHERE NOTI_ID = ?
        `;
        await db.query(sql, [notiId]);

        res.json({ msg: "알림 읽음 처리 완료" });
    } catch (error) {
        console.log("알림 읽음 처리 실패:", error);
        res.status(500).json({ msg: "읽음 처리 실패" });
    }
});


// 읽지 않은 알림 개수 조회 (메뉴 빨간점)
router.get("/notify/unread/:userId", async (req, res) => {
    let { userId } = req.params;

    try {
        let sql = `
            SELECT COUNT(*) AS unread
            FROM PRO_TBL_NOTIFY
            WHERE USER_ID = ? AND IS_READ = 'N'`;

        let [rows] = await db.query(sql, [userId]);

        res.json({ unread: rows[0].unread });
    } catch (error) {
        console.log("읽지 않은 알림 수 조회 실패:", error);
        res.status(500).json({ msg: "조회 실패" });
    }
});







module.exports = router; // 외부에서 쓸 수 있게 exports