import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, CircularProgress, Typography, IconButton, Avatar } from '@mui/material';
import PostDetailCard from './PostDetailCard';
import { jwtDecode } from 'jwt-decode';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import SendIcon from '@mui/icons-material/Send';
import { useNavigate } from 'react-router-dom';

const getCurrentUserId = () => {
  const token = localStorage.getItem('token'); 
  if (!token) return null;
  try {
    return jwtDecode(token).userId;
  } catch (err) {
    console.error("JWT decode error", err);
    return null;
  }
};

const RandomFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followingList, setFollowingList] = useState([]);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  let navigate = useNavigate();

  // 랜덤피드 유저 게시글 모아보기
  const [selectedUserPosts, setSelectedUserPosts] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  const currentUserId = getCurrentUserId();

  const fetchRandomPosts = () => {
    if (!currentUserId) return;
    setLoading(true);
    fetch(`http://localhost:3010/feed/random-feed?excludeUserId=${currentUserId}`)
      .then(res => res.json())
      .then(data => setPosts(Array.isArray(data.list) ? data.list.slice(0, 2) : []))
      .catch(err => console.error('fetch error:', err))
      .finally(() => setLoading(false));
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1500);
  };

  const toggleFollow = (targetUserId) => {
    const isFollowing = followingList.includes(targetUserId);
    const url = `http://localhost:3010/user/${isFollowing ? 'unfollow' : 'follow'}`;
    const method = isFollowing ? 'DELETE' : 'POST';
    const body = { userId: currentUserId, followId: targetUserId };

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
    .then(res => res.json())
    .then(() => {
      setFollowingList(prev =>
        isFollowing ? prev.filter(id => id !== targetUserId) : [...prev, targetUserId]
      );
      showToastMessage(isFollowing ? "팔로우 취소" : "팔로우 완료");
    })
    .catch(err => console.error(`${isFollowing ? '언팔로우' : '팔로우'} 실패:`, err));
  };

  const sendMessage = async (userId) => {
    try {

    // 서버에 채팅방 존재 여부 요청
    const res = await fetch(`http://localhost:3010/chat/check-room`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userA: currentUserId, userB: userId })
    });

    const data = await res.json();

    // data.roomId가 존재하면 기존 채팅방, 없으면 새 채팅방 생성 후 이동
    navigate(`/chat/${data.roomId}`);
    } catch (err) {
      console.error("DM 채팅방 확인 실패:", err);
    }
  };

  // Avatar 클릭 시 해당 유저 게시글 모아서 가져오는 모달창
  const handleUserClick = async (userId) => {
    try {
      const res = await fetch(`http://localhost:3010/feed/user-posts/${userId}`);
      const data = await res.json();
      if (Array.isArray(data.list)) {
        setSelectedUserPosts(data.list);
        setOpenModal(true);
      }
    } catch (err) {
      console.error("유저 게시글 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    if (!currentUserId) return;
    // 팔로잉 목록 가져오기
    fetch(`http://localhost:3010/user/${currentUserId}/following`)
      .then(res => res.json())
      .then(data => setFollowingList(Array.isArray(data.user) ? data.user.map(item => item.FOLLOWING_ID) : []))
      .finally(fetchRandomPosts);
  }, [currentUserId]);

  return (
    <Box sx={{ py: 3, px: 1.5, backgroundColor: '#f5f5f5', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {showToast && (
        <Box sx={{
          position: 'fixed',
          top: '15%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'rgba(0,0,0,0.7)',
          color: 'white',
          px: 3,
          py: 1.5,
          borderRadius: 2,
          zIndex: 9999,
          pointerEvents: 'none'
        }}>
          {toastMessage}
        </Box>
      )}

      {/* 제목 아래 여유 공간 늘림 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, width: '100%', maxWidth: 500 }}>
        <Typography variant="h5" fontWeight="bold">랜덤 피드 모아보기</Typography>
        <Button variant="contained" size="small" onClick={fetchRandomPosts}>새로고침</Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}><CircularProgress size={24} /></Box>
      ) : posts.length === 0 ? (
        <Typography variant="body2" sx={{ mt: 3 }}>랜덤 게시글이 없습니다.</Typography>
      ) : (
        // 피드 간격 spacing 2 → 3으로 늘림
        <Grid container spacing={3} sx={{ maxWidth: 500 }}>
          {posts.map(post => (
            <Grid item xs={12} key={post.id}>
              <Box sx={{
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                borderRadius: 2,
                boxShadow: 2,
                p: 1.5,
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar 
                      sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: 14, cursor: 'pointer' }}
                      onClick={() => handleUserClick(post.userId)}
                    >
                      {post.userId.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="subtitle2">{post.userId}</Typography>
                  </Box>
                  <Box>
                    <IconButton size="small" onClick={() => toggleFollow(post.userId)}>
                      {followingList.includes(post.userId) ? <PersonRemoveIcon color="primary" fontSize="small" /> : <PersonAddIcon color="primary" fontSize="small" />}
                    </IconButton>
                    <IconButton size="small" onClick={() => sendMessage(post.userId)}>
                      <SendIcon color="primary" fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <PostDetailCard post={post} viewMode="random" />
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default RandomFeed;
