import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, CircularProgress, Typography, IconButton, Avatar, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import PostDetailCard from './PostDetailCard';
import { jwtDecode } from 'jwt-decode';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close'; // 모달 닫기 아이콘 추가
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

  // 랜덤피드 유저 게시글 모아보기 모달 관련 상태
  const [selectedUserPosts, setSelectedUserPosts] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  // 게시글 상세 보기 모달 관련 상태 (새로 추가)
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedPostDetail, setSelectedPostDetail] = useState(null);

  const currentUserId = getCurrentUserId();

  // ... (fetchRandomPosts, showToastMessage, toggleFollow, sendMessage 함수는 기존과 동일) ...
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
      const res = await fetch(`http://localhost:3010/feed/${userId}`);
      const data = await res.json();
      if (Array.isArray(data.list)) {
        setSelectedUserPosts(data.list);
        setOpenModal(true);
      }
    } catch (err) {
      console.error("유저 게시글 불러오기 실패:", err);
    }
  };

  // 모달 내 이미지 클릭 시 상세 보기 모달 띄우기 (새로 추가)
  const handleImageClick = async (postId) => {
    try {
      // Feed.js의 handleClickOpen 로직 참고
      const res = await fetch("http://localhost:3010/feed/post/" + postId, {
        headers: {
          "Authorization": "Bearer " + localStorage.getItem("token")
        }
      });
      const data = await res.json();

      if (data.result === "success") {
        setSelectedPostDetail(data.post);
        setOpenDetailModal(true); // 상세 보기 모달 열기
      } else {
        alert("게시글을 불러오지 못했습니다.");
      }
    } catch (err) {
      console.error("게시글 상세 정보 불러오기 실패:", err);
    }
  };

  // 상세 보기 모달 닫기 함수
  const handleDetailClose = () => {
    setOpenDetailModal(false);
    setSelectedPostDetail(null);
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
    <Box
      sx={{
        py: 3,
        px: 1.5,
        minHeight: '100vh',

        // 기존 회색 배경 제거
        backgroundColor: 'rgba(255,255,255,0.3)',

        // 살짝 투명한 흰톤만
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',

        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      
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


      {/* 유저 게시글 모아보기 모달 */}
<Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
  <DialogTitle>
    {selectedUserPosts[0]?.userId}님의 게시글
    <IconButton
      edge="end"
      onClick={() => setOpenModal(false)}
      sx={{ position: 'absolute', right: 8, top: 8 }}
    >
      <CloseIcon />
    </IconButton>
  </DialogTitle>
  <DialogContent>
    <Grid container spacing={1}>
      {selectedUserPosts.map((post) => (
        <Grid item xs={4} key={post.id}>
          <img 
            src={post.imgPath} 
            alt={post.title || "post"} 
            onClick={() => handleImageClick(post.id)}
            style={{ 
              width: '100%', 
              aspectRatio: '1 / 1', // 1:1 정사각형
              objectFit: 'cover', 
              borderRadius: 4,
              cursor: 'pointer'
            }}
          />
        </Grid>
      ))}
    </Grid>
  </DialogContent>
</Dialog>

{/* 상세 보기 모달 */}
<Dialog open={openDetailModal} onClose={handleDetailClose} fullWidth maxWidth="sm">
  <DialogTitle>
    {selectedPostDetail ? selectedPostDetail.type + " 상세보기" : "불러오는 중…"}
    <IconButton
      edge="end"
      onClick={handleDetailClose}
      sx={{ position: 'absolute', right: 8, top: 8 }}
    >
      <CloseIcon />
    </IconButton>
  </DialogTitle>
  <DialogContent>
    {selectedPostDetail ? (
      <PostDetailCard 
        post={selectedPostDetail} 
        viewMode="random"
        style={{ 
          width: '100%',         // 모달 폭에 맞게 카드 전체를 늘림
        }}
        imgStyle={{              // 이미지 스타일만 따로 지정
          width: '100%', 
          maxHeight: '200px',    // 이미지만 적당히 줄이기
          objectFit: 'cover', 
          borderRadius: 4
        }}
      />
    ) : (
      <Typography>게시글을 불러오는 중입니다...</Typography>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={handleDetailClose}>닫기</Button>
  </DialogActions>
</Dialog>


    </Box>
  );
};

export default RandomFeed;