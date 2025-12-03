const express = require('express')
const router = express.Router();
const db = require("../db"); // js 확장자는 생략가능(다른 확장자는 안됨)
const authMiddleware = require("../auth"); // auth.js에 있는 토큰 검증 함수 쓰기위해


// 랜덤피드 조회 (좋아요 포함)
router.get('/random-feed', async (req, res) => {
  const { excludeUserId } = req.query;

  try {
    // 1. 랜덤 게시글 2개 선택 (로그인 사용자는 제외)
    const sql = `
      SELECT POST_ID
      FROM PRO_TBL_POST
      WHERE USER_ID != ? AND VISIBILITY = 'P'
      ORDER BY RAND()
      LIMIT 2
    `;
    const [rows] = await db.query(sql, [excludeUserId]);
    const posts = [];

    for (let row of rows) {
      const postId = row.POST_ID;

      // 2. 게시글 기본 정보
      const [postRes] = await db.query(`
        SELECT POST_ID AS id, USER_ID AS userId, CATEGORY AS type, CONTENT AS content, CDATETIME AS cdatetime
        FROM PRO_TBL_POST
        WHERE POST_ID = ?
      `, [postId]);

      if (postRes.length === 0) continue;
      const post = postRes[0];

      // 3. 이미지
      const [imgRows] = await db.query(`
        SELECT IMG_URL AS imgPath
        FROM PRO_TBL_POST_IMAGE
        WHERE POST_ID = ?
      `, [postId]);
      post.images = imgRows.map(img => img.imgPath);

      // 4. 감사일기 섹션
      if (post.type === '감사일기') {
        const [sectionRows] = await db.query(`
          SELECT SECTION_ID AS sectionId, SECTION_TYPE AS sectionType, CONTENT AS content
          FROM PRO_TBL_POST_SECTION
          WHERE POST_ID = ?
          ORDER BY SECTION_ID ASC
        `, [postId]);
        post.sections = sectionRows;
      }

      // 5. 좋아요 정보
      const [likeRows] = await db.query(`
        SELECT USER_ID
        FROM PRO_TBL_POST_LIKE
        WHERE POST_ID = ?
      `, [postId]);

      post.likeCount = likeRows.length;
      post.likes = likeRows.map(like => like.USER_ID); // PostDetailCard용 liked 상태 확인용

      posts.push(post);
    }

    res.json({
      result: 'success',
      list: posts
    });

  } catch (err) {
    console.log(err);
    res.json({ result: 'fail', list: [] });
  }
});



// 포스트 추가 - 인서트면 민감정보 있을 수 있어 post로 약속(웬만하면)
// pk가 있는 상태가 아니므로 "/"
router.post("/", async (req, res) => {
    // 💡 클라이언트에서 보낸 구조화된 데이터를 해체
    const { post, sections } = req.body;    
    // post 객체에서 필요한 값 추출
    const { userId, category, visibility, content } = post;    
    // connection 객체를 트랜잭션용으로 가져옵니다.
    let conn = null;

    try {
        // 💡 1단계: Pool에서 Connection 객체를 빌려옵니다. (트랜잭션 시작의 준비 단계)
        conn = await db.getConnection(); 

        // 💡 2단계: Connection 객체를 통해 트랜잭션을 시작합니다.
        await conn.beginTransaction();

        // 3. PRO_TBL_POST INSERT 쿼리 실행 시, db.query 대신 conn.query 사용
        let sqlPost = "INSERT INTO PRO_TBL_POST(USER_ID, CATEGORY, CONTENT, VISIBILITY, CDATETIME) "
                    + "VALUES(?, ?, ?, ?, NOW())";
        
        // 일상일기는 content를 사용하고, 감사일기는 content가 null입니다.
        const postResult = await conn.query(sqlPost, [userId, category, content, visibility]);
        
        // 💡 방금 삽입된 게시글의 ID (PK)를 가져옵니다.
        const postId = postResult[0].insertId; 

        // 감사일기일 경우 (PRO_TBL_POST_SECTION에 추가 인서트)
        if (category === '감사일기' && sections && sections.length > 0) {
            
            // PRO_TBL_POST_SECTION에 인서트하는 SQL
            let sqlSection = "INSERT INTO PRO_TBL_POST_SECTION(POST_ID, SECTION_TYPE, CONTENT, CDATETIME) "
                           + "VALUES(?, ?, ?, NOW())";

            // sections 배열을 순회하며 각각 인서트
            for (const section of sections) {
                await conn.query(sqlSection, [
                    postId, 
                    section.type,   // '감사', '반성', '소망'
                    section.content
                ]);
            }
        }
        // 모든 쿼리가 성공했으면 트랜잭션 커밋
        await conn.commit();
        res.json({
            result: { insertId: postId }, // 클라이언트가 이미지 업로드 시 사용할 postId 반환
            msg: "저장 완료 (트랜잭션 커밋)"
        });

    } catch (error) {
        // 5. 에러 발생 시 트랜잭션 롤백
        if (conn) {
            await conn.rollback();
        }
        console.error("게시글 저장 중 에러 발생 및 롤백:", error);
        res.status(500).json({
            msg: "게시글 저장 실패",
            error: error.message
        });

    } finally {
        // 💡 Connection 객체를 Pool에 반환 (필수!)
        if (conn) conn.release(); 
    }
});


//---------- 사진 업로드 관련 ---------------------
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
            let query = "INSERT INTO PRO_TBL_POST_IMAGE VALUES(NULL, ?, ?, ?)";
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
//---------- 사진 업로드 관련 (끝) ---------------------


// 로그인 정보 기준 포스팅 목록(db에서 가져오기)
router.get('/:userId', authMiddleware, async (req, res) => {
    let{userId} = req.params; 

    // ⭐⭐ 1. authMiddleware를 통해 로그인된 사용자 ID를 가져옵니다.
    const loggedInUserId = req.user.userId;

    try {

        // ⭐⭐ 2. 요청된 userId와 로그인된 userId가 같은지 비교합니다.
         const isOwner = String(userId) === String(loggedInUserId);
        
    // 3. 쿼리 생성: isOwner가 true면 VISIBILITY 조건이 없고, false면 'P'만 조회합니다.
    let sql = `
        SELECT 
            P.POST_ID AS id, P.USER_ID AS userId, 
            P.CATEGORY AS type, P.CONTENT AS content, P.CDATETIME AS cdatetime,       
            
            CASE
                WHEN P.CATEGORY = '감사일기' THEN '기록된 감사일기'
                WHEN P.CATEGORY = '일상일기' THEN '기록된 일상일기'
                ELSE NULL
            END AS title, 
            
            I.IMG_URL AS imgPath, I.IMG_NAME AS imgName   
        FROM PRO_TBL_POST P
        LEFT JOIN PRO_TBL_POST_IMAGE I 
            ON P.POST_ID = I.POST_ID
        WHERE P.USER_ID = ?
        ${isOwner ? '' : "AND P.VISIBILITY = 'P'"} 
        ORDER BY P.CDATETIME DESC 
    `;
        // DB 호출        
        let [list] = await db.query(sql, [userId]);
        
        // 최종적으로 JSON 형태로 보내주기
        res.json({
            list : list, 
            result : "success"
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ result: "error", message: "서버 에러 발생" });
    } 
})


// 포스팅 상세보기
router.get('/post/:postId', async (req, res) => {
    let { postId } = req.params;

    try {
        // 1. 기본 게시글 조회
        let sqlPost = `
            SELECT 
                POST_ID AS id,
                USER_ID AS userId,
                CATEGORY AS type,
                CONTENT AS content,
                VISIBILITY AS visibility,
                CDATETIME AS cdatetime
            FROM PRO_TBL_POST
            WHERE POST_ID = ?
        `;
        let [postRows] = await db.query(sqlPost, [postId]);

        if (postRows.length === 0) {
            return res.json({ result: "not_found" });
        }

        let post = postRows[0];

        // 2. 이미지 조회
        let sqlImg = `
            SELECT IMG_URL AS imgPath, IMG_NAME AS imgName
            FROM PRO_TBL_POST_IMAGE
            WHERE POST_ID = ?
        `;
        let [imgRows] = await db.query(sqlImg, [postId]);
        post.images = imgRows.map(img => img.imgPath);

        // 3. 감사일기 섹션 조회
        if (post.type === '감사일기') {
            let sqlSection = `
                SELECT 
                    SECTION_ID AS sectionId,
                    SECTION_TYPE AS sectionType,
                    CONTENT AS content
                FROM PRO_TBL_POST_SECTION
                WHERE POST_ID = ?
                ORDER BY SECTION_ID ASC
            `;
            let [sectionRows] = await db.query(sqlSection, [postId]);
            post.sections = sectionRows;
        }

        // 4. 좋아요 정보 추가
        let sqlLikes = `
            SELECT USER_ID
            FROM PRO_TBL_POST_LIKE
            WHERE POST_ID = ?
        `;
        let [likeRows] = await db.query(sqlLikes, [postId]);
        post.likes = likeRows.map(like => like.USER_ID); // 좋아요 누른 userId 배열
        post.likeCount = likeRows.length; // 좋아요 개수

        res.json({
            post: post,
            result: "success"
        });

    } catch (err) {
        console.log(err);
        res.json({ result: "fail" });
    }
});




// 포스팅 삭제
router.delete("/:feedId", authMiddleware, async (req, res) => {
    // /:feedId는 꺼낼 이름을 약속한 것 (다른 단어여도됨 - 밑에 let {} 안 단어와 일치)
    // authMiddleware 함수를 두번째 인자값에 넣어서, 이거 먼저 실행되도록함 (토큰 검증)
    // 이거 없으면 썬더 클라이언트 통해서 리스트 삭제되기도 함 (그래서 매우 중요함)
    let {feedId} = req.params; // params은 넘어오는 모든 정보 담김
    let conn;
    try {
        // 1. 커넥션 확보 (트랜잭션 시작 전 준비)
        conn = await db.getConnection(); 
        
        // 2. 트랜잭션 시작
        await conn.beginTransaction();

        let sql = "DELETE FROM PRO_TBL_POST WHERE POST_ID = ?";
        let sql2 = "DELETE FROM PRO_TBL_POST_SECTION WHERE POST_ID = ?";

        // 3. 커넥션 객체를 사용하여 첫 번째 쿼리 실행
        await conn.query(sql, [feedId]); 

        // 4. 커넥션 객체를 사용하여 두 번째 쿼리 실행
        await conn.query(sql2, [feedId]);

        // 5. 두 쿼리 모두 성공 시, 최종 반영
        await conn.commit();

        res.json({
            result: true, 
            msg: "삭제 완료!"
        });
    } catch (error) {
        console.error("에러 발생! 롤백 처리", error);      
        if (conn) { // 6. 에러 발생 시, 모든 변경사항 취소
            await conn.rollback(); 
        }
        res.status(500).json({
            result: false,
            msg: "삭제 중 오류가 발생했습니다."
        });
    } finally {        
        if (conn) { // 7. 커넥션이 존재하면 (성공/실패 여부와 관계없이) 반드시 반납
            conn.release(); 
        }
    }
})

// 포스팅 수정
router.put("/:feedId", authMiddleware, async (req, res) => { 
    let { feedId } = req.params;
    // 💡 수정된 부분: req.body에서 'post' 객체와 'sections' 배열을 추출합니다.
    let { post, sections } = req.body;
    // post 객체에서 필요한 content, visibility, category를 추출합니다.
    const { content, visibility, category } = post || {};
    let conn;

    try {
        conn = await db.getConnection();
        await conn.query('START TRANSACTION');
        
        // PRO_TBL_POST 기본 수정 
        // 일기 유형 상관없이 공통필드 및 UDATETIME
        let sqlEditUdate = "UPDATE PRO_TBL_POST SET "
                        + "VISIBILITY = ?, CATEGORY = ?, UDATETIME = NOW() WHERE POST_ID = ?";
        await conn.query(sqlEditUdate, [visibility, category, feedId]);

        if (category && category.includes('감사')) {
            // 감사일기: sections 수정
            if (sections && sections.length > 0) {
                for (const section of sections) {
                    let updateSectionSql = "UPDATE PRO_TBL_POST_SECTION SET CONTENT = ?, UDATETIME = NOW() WHERE POST_ID = ? AND SECTION_ID = ?";
                    await conn.query(updateSectionSql, [section.content, feedId, section.sectionId]);
                    // SECTION_ID를 클라이언트에서 넘겨줘야 함
                }
            }
        } else {
            // 일상일기: content 수정 
            let updatePostContentSql = "UPDATE PRO_TBL_POST SET CONTENT = ? WHERE POST_ID = ?";
            await conn.query(updatePostContentSql, [content, feedId]);
        }

        await conn.query('COMMIT');

        res.json({ result: true, msg: "수정 완료!" });
    } catch (error) {
        console.error("에러 발생! 롤백 처리", error);
        if (conn) await conn.query('ROLLBACK');
        res.status(500).json({ result: false, msg: "수정 중 오류가 발생했습니다." });
    } finally {
        if (conn) conn.release();
    }
});



// 좋아요(하트) 버튼
router.post("/like", async (req, res) => {
    let{postId, userId} = req.body
    try {
        let sql = "INSERT INTO PRO_TBL_POST_LIKE VALUES(NULL, ?, ?, NOW())";
        // PK인데 AI로 자동으로 증가되는거는 NULL로 해도 알아서 순차적 들어감 (리액트에서만?)
        let result = await db.query(sql, [postId, userId])
        res.json({
            result : result,
            msg : "좋아요 완료"
        });
    } catch (error) {
        console.log("좋아요 에러 발생!");
    }
})

// 좋아요(하트) 취소(삭제)
router.delete("/like/:postId/:userId", async (req, res) => {
    let {postId, userId} = req.params; // params은 넘어오는 모든 정보 담김
    try {
        let sql = "DELETE FROM PRO_TBL_POST_LIKE WHERE POST_ID = ? AND USER_ID = ?";
        // select가 아니니 list로 받을 필요 없음
        let result = await db.query(sql, [postId, userId]);
        res.json({
            result : result,
            msg : "좋아요 취소 완료"
        });
    } catch (error) {
        console.log("좋아요 취소 에러 발생!");
        res.status(500).json({ msg: "좋아요 취소 실패", error });
    }
})






module.exports = router; // 외부에서 쓸 수 있게 exports