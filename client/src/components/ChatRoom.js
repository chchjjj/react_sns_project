 // 전체 채팅방 컴포넌트, 메시지 리스트 + 입력창 포함
 // ChatRoom.js 안에서 socket 연결, 메시지 리스트(ChatList), 입력창(ChatInput) 처리

import ChatInput from "./ChatInput";
import ChatList from "./ChatList";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

function ChatRoom() {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [otherUserId, setOtherUserId] = useState(null);
  const navigate = useNavigate();

  function fnGetUser() {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인 후 이용해주세요.");
      navigate("/Login");
      return;
    }

    const decoded = jwtDecode(token);
    return decoded.userId;   // ★ userId 반환
  }  

  useEffect(() => {
    const myUserId = fnGetUser();
    if (!myUserId) return;

    // 1) 메시지 목록 불러오기
    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://localhost:3010/chat/messages/${roomId}`);
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("메시지 불러오기 실패:", err);
      }
    };

     // 2) 상대방 userId 불러오기
    const fetchRoomInfo = async () => {
      try {
        const res = await fetch(`http://localhost:3010/chat/room/${roomId}`);
        const info = await res.json();

         const other =
        info.A_USER_ID === myUserId ? info.B_USER_ID : info.A_USER_ID;
        setOtherUserId(other);
      } catch (err) {
        console.error("채팅방 정보 불러오기 실패:", err);
      }
    };

    fetchMessages();
    fetchRoomInfo();
  }, [roomId]);

  return (
    <div style={{ marginTop:"62px"}}>
      <h3>
        채팅방 ID: {roomId}
        {otherUserId && (
          <span style={{ marginLeft: "10px", color: "#555" }}>
            ({otherUserId}와의 대화)
          </span>
        )}
      </h3>
      <ChatList messages={messages} />
      <ChatInput roomId={roomId} setMessages={setMessages} />
    </div>
  );
}
export default ChatRoom;