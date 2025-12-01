import { useState } from "react";
import { jwtDecode } from 'jwt-decode';

function ChatInput({ roomId, setMessages }) {
  const [text, setText] = useState("");

  const currentUserId = () => {
    const token = localStorage.getItem('token'); 
    if (!token) return null;
    try {
      return jwtDecode(token).userId;
    } catch (err) {
      console.error("JWT decode error", err);
      return null;
    }
  };

  const sendMessage = () => {
    if (!text.trim()) return;
    const myId = currentUserId(); // () 반드시 붙이기
    if (!myId) return;

    // 서버에 POST
    fetch("http://localhost:3010/chat/messages", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token") // 토큰 인증
      },
      body: JSON.stringify({
        roomId,
        senderId: myId,
        content: text
      })
    })
    .then(res => res.json())
    .then(data => {
      // 화면에 바로 반영
      setMessages(prev => [...prev, data]);
      setText("");
    })
    .catch(err => console.error("메시지 전송 실패:", err));
  };

  return (
    <div
      style={{
        display: "flex", marginTop: "15px",
        gap: "10px", justifyContent: "left", alignItems: "center",
      }}
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="메시지를 입력하세요..."
        style={{
          width: "620px",          // 최대 길이 지정
          minWidth: "200px",       // 최소 길이
          padding: "10px 15px",
          borderRadius: "20px",
          border: "1px solid #D3C2A3",
          outline: "none",
          fontSize: "14px",
          backgroundColor: "#FDF6EC",
        }}
      />
      <button
        onClick={sendMessage}
        style={{
          padding: "10px 20px",
          borderRadius: "20px",
          border: "none",
          backgroundColor: "#A67B5B",
          color: "#fff",
          fontWeight: "bold",
          cursor: "pointer",
          transition: "0.2s",
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#8C6249")}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#A67B5B")}
      >
        전송
      </button>
    </div>
  );
}

export default ChatInput;
