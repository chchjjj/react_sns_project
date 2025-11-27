// RandomFeed.js
import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, CircularProgress, Typography,IconButton, Avatar  } from '@mui/material';
import PostDetailCard from './PostDetailCard';
import { jwtDecode } from 'jwt-decode';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import SendIcon from '@mui/icons-material/Send';


const getCurrentUserId = () => {
  const token = localStorage.getItem('token'); // 로그인 시 저장한 token
  if (!token) return null;
  try {
    const decoded = jwtDecode(token); // { userId: "...", iat, exp }
    return decoded.userId;
  } catch (err) {
    console.error("JWT decode error", err);
    return null;
  }
};

const RandomFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
   const [followingList, setFollowingList] = useState([]); // 팔로잉 중인 사용자 아이디 목록

  const currentUserId = getCurrentUserId();

  const fetchRandomPosts = () => {
    if (!currentUserId) {
      console.error("No currentUserId, cannot fetch random feed");
      setPosts([]);
      return;
    }

    setLoading(true);

    fetch(`http://localhost:3010/feed/random-feed?excludeUserId=${currentUserId}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log('Random feed data from server:', data); // 디버깅
        if (data.result === 'success' && Array.isArray(data.list)) {
          setPosts(data.list.slice(0, 2)); // 화면에 2개만 표시
        } else {
          setPosts([]);
        }
      })
      .catch(err => {
        console.error('fetch error:', err);
        setPosts([]);
      })
      .finally(() => setLoading(false));
  };


   // 팔로잉/언팔로잉 토글 (샘플 상태)
  const toggleFollow = (userId) => {
    setFollowingList((prev) =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // 메시지 버튼 클릭
  const sendMessage = (userId) => {
    alert(`${userId}에게 메시지를 보내는 기능은 아직 미구현입니다.`);
  };


  useEffect(() => {
    fetchRandomPosts();
  }, []);

  return (
    
    <Box
      sx={{
        py: 3,
        px: 2,
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >

    
      {/* 새로고침 버튼 */}
      <Box sx={{ 
        display: 'flex',
          justifyContent: 'space-between', // ⭐ 이 속성으로 왼쪽 정렬(제목)과 오른쪽 정렬(버튼)이 됩니다.
          alignItems: 'center', 
          mb: 3, 
          width: '100%',
          maxWidth: 900, 
        }}>

        <Typography variant="h5" component="h1" fontWeight="bold" sx={{ mr: 2 }}>
          랜덤 피드 모아보기
        </Typography>
        <Button variant="contained" onClick={fetchRandomPosts}>
          새로고침
        </Button>
      </Box>

      {loading ? (
        <Box sx=
            {{ display: 'flex', 
                justifyContent: 'center', 
                mt: 5 
            }}>
          <CircularProgress />
        </Box>
      ) : posts.length === 0 ? (
        <Typography variant="body1" sx={{ mt: 5 }}>
          랜덤 게시글이 없습니다.
        </Typography>
      ) : (
        <Grid container spacing={2} sx={{ maxWidth: 900 }}>
          {Array.isArray(posts) &&
            posts.map((post) => (
              <Grid item xs={12} md={12} key={post.id}>
                <Box
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.75)', // 반투명
                    borderRadius: 2,
                    boxShadow: 3,
                    p: 1.5,
                  }}
                >

                {/* 상단: 작성자 + 팔로잉/메시지 */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {post.userId.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="subtitle1">
                      {/* {post.type} · {post.userId} */}
                      {post.userId}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton onClick={() => toggleFollow(post.userId)}>
                      {followingList.includes(post.userId) ? (
                        <PersonRemoveIcon color="primary" />
                      ) : (
                        <PersonAddIcon color="primary" />
                      )}
                    </IconButton>
                    <IconButton onClick={() => sendMessage(post.userId)}>
                      <SendIcon color="primary" />
                    </IconButton>
                  </Box>
                </Box>

                  {/* 게시글 내용 */}
                  <PostDetailCard post={post} />
                </Box>
              </Grid>
            ))}
        </Grid>
      )}
    </Box>
  );
};

export default RandomFeed;