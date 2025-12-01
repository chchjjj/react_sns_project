import React, { useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';

// 토큰에서 사용자 ID를 안전하게 가져오는 함수 (컴포넌트 외부에 정의)
const getCurrentUserId = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    // 실제 프로젝트에서는 jwt-decode 대신 더 안전한 라이브러리를 고려할 수 있습니다.
    // 또한, 토큰 만료 시간 등도 함께 체크하는 것이 좋습니다.
    return jwtDecode(token).userId;
  } catch (err) {
    console.error("JWT decode error", err);
    return null;
  }
};

function ChatList({ messages }) {
  // 컴포넌트 렌더링 시 한 번만 계산하도록 useMemo 사용
  const myId = useMemo(() => getCurrentUserId(), []);

  // 메시지 전송 시간을 보기 좋은 형태로 변환하는 함수 (예시)
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    // 실제 프로젝트에서는 서버에서 받은 timestamp(Date 객체, ISO 문자열 등)에 맞게 구현해야 합니다.
    // 여기서는 간단한 예시로 시간만 표시한다고 가정합니다.
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div style={{
      marginTop: "40px",
      height: "400px",
      width: "700px",
      border: "1px solid #e0e0e0", // 더 연한 테두리
      borderRadius: "12px", // 둥근 모서리
      padding: "15px",
      backgroundColor: "#f7f7f7", // 배경색 추가
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)", // 은은한 그림자
      overflowY: "auto", // 스크롤 가능
      fontFamily: "'Noto Sans KR', sans-serif" // 깔끔한 글꼴 가정
    }}>
      {messages.length === 0 ? (
        <p style={{ textAlign: "center", color: "#666", marginTop: "150px" }}>
          💬 아직 대화가 없습니다.
        </p>
      ) : (
        messages.map(msg => {
          const isMyMessage = msg.SENDER_ID === myId;
          const time = msg.TIMESTAMP ? formatTime(msg.TIMESTAMP) : '전송 시간'; // TIMESTAMP는 가정
          
          return (
            <div
              key={msg.MSG_ID}
              style={{
                display: "flex",
                justifyContent: isMyMessage ? "flex-end" : "flex-start",
                marginBottom: "12px", // 간격 증가
                alignItems: "flex-end" // 시간과 말풍선 정렬
              }}
            >
              {/* 상대방 메시지일 경우: 시간 -> 말풍선 순서 */}
              {/* {!isMyMessage && (
                <span style={{ fontSize: "0.75rem", color: "#999", marginRight: "8px" }}>
                  {time}
                </span>
              )} */}

              {/* 말풍선 본체 */}
              <div
                style={{
                  maxWidth: "70%", // 최대 폭 증가
                  padding: "10px 14px",
                  borderRadius: isMyMessage ? "18px 18px 4px 18px" : "18px 18px 18px 4px", // 꼬리 부분 디자인
                  backgroundColor: isMyMessage ? "#7C9D96" : "#FFFFFF", // 세련된 색상
                  color: isMyMessage ? "#fff" : "#333",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)", // 말풍선 그림자
                  lineHeight: "1.4" // 가독성 개선
                }}
              >
                {msg.CONTENT}
              </div>

              {/* 내 메시지일 경우: 말풍선 -> 시간 순서 */}
              {/* {isMyMessage && (
                <span style={{ fontSize: "0.75rem", color: "#999", marginLeft: "8px" }}>
                  {time}
                </span>
              )} */}
            </div>
          );
        })
      )}
    </div>
  );
}

export default ChatList;