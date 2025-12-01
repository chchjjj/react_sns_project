 // 전체 채팅방 컴포넌트, 메시지 리스트 + 입력창 포함
 // ChatRoom.js 안에서 socket 연결, 메시지 리스트(ChatList), 입력창(ChatInput) 처리

import ChatInput from "./ChatInput";
import ChatList from "./ChatList";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function ChatRoom() {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://localhost:3010/chat/messages/${roomId}`);
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("메시지 불러오기 실패:", err);
      }
    };
    fetchMessages();
  }, [roomId]);

  return (
    <div style={{ marginTop:"62px"}}>
      <h3>채팅방 ID: {roomId}</h3>
      <ChatList messages={messages} />
      <ChatInput roomId={roomId} setMessages={setMessages} />
    </div>
  );
}
export default ChatRoom;