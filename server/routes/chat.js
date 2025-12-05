const express = require("express");
const router = express.Router();
const db = require("../db");

// =======================================================
// 1) 로그인한 사용자 A와 B 간 존재하는 DM방 확인/생성
// =======================================================
router.post("/check-room", async (req, res) => {
  console.log("req.body:", req.body);
  const { userA, userB } = req.body;

  try {
    // 기존 DM 방 조회 (A-B 또는 B-A 모두 매칭)
    const [rows] = await db.execute(
      `SELECT ROOM_ID 
       FROM PRO_TBL_DM_ROOM 
       WHERE (A_USER_ID = ? AND B_USER_ID = ?)
          OR (A_USER_ID = ? AND B_USER_ID = ?)`,
      [userA, userB, userB, userA]
    );

    // 기존 방 존재
    if (rows.length > 0) {
      return res.json({ roomId: rows[0].ROOM_ID });
    }

    // 없으면 새 방 생성
    const [insert] = await db.execute(
      `INSERT INTO PRO_TBL_DM_ROOM (A_USER_ID, B_USER_ID)
       VALUES (?, ?)`,
      [userA, userB]
    );

    res.json({ roomId: insert.insertId });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "채팅방 생성/조회 실패" });
  }
});

// =======================================================
// 2) 특정 채팅방 메시지 불러오기
// =======================================================
router.get("/messages/:roomId", async (req, res) => {
  const { roomId } = req.params;

  if (!roomId) {
    return res.status(400).json({ error: "roomId 필요" });
  }

  try {
    const [rows] = await db.execute(
      `SELECT MSG_ID, ROOM_ID, SENDER_ID, CONTENT, CDATETIME 
       FROM PRO_TBL_DM_MSG
       WHERE ROOM_ID = ?
       ORDER BY CDATETIME ASC`,
      [roomId]
    );

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "메시지 조회 실패" });
  }
});

// =======================================================
// 3) 메시지 보내기 + DM 알림 생성
// =======================================================
router.post("/messages", async (req, res) => {
  const { roomId, senderId, content } = req.body;

  if (!roomId || !senderId || !content) {
    return res.status(400).json({ error: "roomId, senderId, content 필요" });
  }

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // 1) 메시지 저장
    const [msgResult] = await conn.execute(
      `INSERT INTO PRO_TBL_DM_MSG (ROOM_ID, SENDER_ID, CONTENT)
       VALUES (?, ?, ?)`,
      [roomId, senderId, content]
    );

    const msgId = msgResult.insertId;

    // 2) 방 정보에서 A/B 사용자 확인
    const [roomRows] = await conn.execute(
      `SELECT A_USER_ID, B_USER_ID
       FROM PRO_TBL_DM_ROOM
       WHERE ROOM_ID = ?`,
      [roomId]
    );

    if (roomRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "해당 채팅방 없음" });
    }

    const { A_USER_ID, B_USER_ID } = roomRows[0];

    // sender가 아닌 사람을 receiver로 판별
    const receiverId = senderId === A_USER_ID ? B_USER_ID : A_USER_ID;

    // 3) 본인에게 DM 알림이 가지 않도록 체크
    if (receiverId !== senderId) {
      await conn.execute(
        `INSERT INTO PRO_TBL_NOTIFY
        (NOTI_TYPE, USER_ID, POST_ID, COMM_ID, MSG_ID, IS_READ, CDATETIME)
        VALUES('DM', ?, NULL, NULL, ?, 'N', NOW())`,
        [receiverId, msgId]
      );
    }

    // 4) 저장한 메시지 재조회 후 응답
    const [rows] = await conn.execute(
      `SELECT MSG_ID, ROOM_ID, SENDER_ID, CONTENT, CDATETIME
       FROM PRO_TBL_DM_MSG
       WHERE MSG_ID = ?`,
      [msgId]
    );

    await conn.commit();
    res.json(rows[0]);

  } catch (err) {
    await conn.rollback();
    console.error("메시지 DB 저장 실패:", err);
    res.status(500).json({ error: "메시지 저장 실패" });
  } finally {
    conn.release();
  }
});

// DM 알림 클릭 → MSG_ID로 ROOM_ID 조회
router.get("/room-by-msg/:msgId", async (req, res) => {
  const { msgId } = req.params;

  try {
    const [rows] = await db.execute(
      `SELECT ROOM_ID 
       FROM PRO_TBL_DM_MSG
       WHERE MSG_ID = ?`,
      [msgId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "해당 메시지를 찾을 수 없습니다." });
    }

    res.json({ roomId: rows[0].ROOM_ID });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "메시지 기반 방 조회 실패" });
  }
});


// 특정 채팅방 정보 조회 (A/B 사용자ID 반환)
// =======================================================
router.get("/room/:roomId", async (req, res) => {
  const { roomId } = req.params;

  try {
    const [rows] = await db.execute(
      `SELECT A_USER_ID, B_USER_ID
       FROM PRO_TBL_DM_ROOM
       WHERE ROOM_ID = ?`,
      [roomId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "해당 채팅방을 찾을 수 없습니다." });
    }

    res.json(rows[0]); // { A_USER_ID: 3, B_USER_ID: 7 } 이런 형태로 반환

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "채팅방 정보 조회 실패" });
  }
});



module.exports = router;
