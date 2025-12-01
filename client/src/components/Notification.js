import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Divider, Dialog, DialogTitle, DialogContent, IconButton, DialogActions, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import CloseIcon from '@mui/icons-material/Close';
import PostDetailCard from './PostDetailCard';
import CommentList from './CommentList';

// JWT에서 현재 로그인한 userId 가져오기
const getCurrentUserId = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded.userId;
  } catch (err) {
    console.error("JWT decode error", err);
    return null;
  }
};

export default function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const navigate = useNavigate();
  const userId = getCurrentUserId();

  // 알림 목록 불러오기
  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      try {
        const resp = await fetch(`http://localhost:3010/comment/notify/${userId}`);
        const data = await resp.json();
        setNotifications(data);
        console.log('Notification data:', data);
      } catch (err) {
        console.error("Fetch notification error:", err);
      }
    };

    fetchNotifications();
  }, [userId]);

  // 클릭 시 알림 읽음 처리 + 게시글 상세 모달 열기
  const handleClick = async (noti) => {
    try {
      // 1) 읽지 않은 알림이면 읽음 처리
      if (noti.IS_READ === 'N') {
        await fetch(`http://localhost:3010/comment/read/${noti.NOTI_ID}`, { method: 'PUT' });
        setNotifications(prev => prev.map(n => n.NOTI_ID === noti.NOTI_ID ? { ...n, IS_READ: 'Y' } : n));
      }

      // 2) 댓글 알림일 경우 : 게시글 상세 조회
      if (noti.NOTI_TYPE === 'COMMENT') {
        const resp = await fetch(`http://localhost:3010/feed/post/${noti.POST_ID}`, {
          headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
        });
        const data = await resp.json();
        if (data.result === "success") {
          setSelectedPost(data.post);
          setOpen(true);
        } else {
          alert("게시글을 불러오지 못했습니다.");
        }
      // 3) DM 알림일 경우 : 클릭 시 채팅방 이동  
      } else if (noti.NOTI_TYPE === 'DM') {        
          // 1) MSG_ID → ROOM_ID 조회
          const resp = await fetch(`http://localhost:3010/chat/room-by-msg/${noti.MSG_ID}`);
          const data = await resp.json();

          if (!data.roomId) {
            alert("DM 방 정보를 찾을 수 없습니다.");
            return;
          }

          // 2) 채팅방 이동
          navigate(`/chat/${data.roomId}`);
      }

    } catch (err) {
      console.error("Notification click error:", err);
    }
};

  const handleClose = () => {
    setOpen(false);
    setSelectedPost(null);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>알림</Typography>
      <List>
        {notifications.length === 0 ? (
          <Typography sx={{ textAlign: 'center', mt: 4 }}>알림이 없습니다.</Typography>
        ) : (
          notifications.map((noti) => (
            <React.Fragment key={noti.NOTI_ID}>
              <ListItem
                button
                onClick={() => handleClick(noti)}
                sx={{
                  cursor: 'pointer',
                  bgcolor: noti.IS_READ === 'N' ? 'rgba(255,224,125,0.5)' : 'transparent'
                }}
              >
                <ListItemText
                  primary={
                    noti.NOTI_TYPE === 'COMMENT'
                      ? `새 댓글 알림 - 게시글 ${noti.POST_ID}`
                      : `새 메세지 도착`
                  }
                  secondary={new Date(noti.CDATETIME).toLocaleString()}
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))
        )}
      </List>

      {/* 게시글 + 댓글 모달 */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
        <DialogTitle>
          {selectedPost ? `${selectedPost.type} 상세보기` : "불러오는 중…"}
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ display: 'flex', gap: 3 }}>
          {/* 왼쪽: 게시글 */}
          <Box sx={{ flex: 1 }}>
            {selectedPost && <PostDetailCard post={selectedPost} viewMode="mine" />}
          </Box>

          {/* 오른쪽: 댓글 */}
          <Box sx={{ width: '300px' }}>
            {selectedPost && <CommentList postId={selectedPost.id} />}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="primary">닫기</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
