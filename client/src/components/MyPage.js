import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Avatar, Paper, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function MyPage() {  
  const [user, setUser] = useState();
  const [followingList, setFollowingList] = useState([]);
  const [followerList, setFollowerList] = useState([]);
  const navigate = useNavigate();

  function fnGetUser() {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인 후 이용해주세요.");
      navigate("/");
      return;
    }

    const decoded = jwtDecode(token);

    // 유저 정보 가져오기
    fetch("http://localhost:3010/user/" + decoded.userId)
      .then(res => res.json())
      .then(data => setUser(data.user))
      .catch(err => console.log(err));

    // 팔로잉 목록 가져오기
    fetch(`http://localhost:3010/user/${decoded.userId}/following`)
      .then(res => res.json())
      .then(data => setFollowingList(data.user || []))
      .catch(err => console.log(err));

    // 팔로워 목록 가져오기
    fetch(`http://localhost:3010/user/${decoded.userId}/follower`)
      .then(res => res.json())
      .then(data => setFollowerList(data.user || []))
      .catch(err => console.log(err));
  }

  useEffect(() => {
    fnGetUser();
  }, []);

  // type: "follower" 또는 "following"
  const renderUserList = (list, type) => {
    if (!list || list.length === 0) {
      return (
        <Typography sx={{ textAlign: 'center', color: 'gray', py: 2 }}>
          해당 유저가 존재하지 않습니다.
        </Typography>
      );
    }

    return (
      <List sx={{ maxHeight: 300, overflowY: 'auto' }}>
        {list.map((item, idx) => {
          const userId = type === "follower" ? item.FOLLOWER_ID : item.FOLLOWING_ID;
          return (
            <ListItem key={idx} sx={{ mb: 1, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 2 }}>
              <ListItemAvatar>
                <Avatar src={item.PROFILE_IMAGE || ""} />
              </ListItemAvatar>
              <ListItemText primary={userId || "unknown"} />
            </ListItem>
          )
        })}
      </List>
    );
  };

  return (
    <Container maxWidth="sm">
      {/* 프로필 박스 */}
      <Paper elevation={3} sx={{ padding: '20px', borderRadius: '15px', marginTop: 3, textAlign: 'center' }}>
        <Avatar
          alt="프로필 이미지"
          src={user?.PROFILE_IMAGE || ""}
          sx={{ width: 100, height: 100, marginBottom: 2, marginX: 'auto' }}
        />
        <Typography variant="body1">@{user?.USER_ID || "unknown"}</Typography>
        <Box display="flex" justifyContent="space-around" mt={2}>
          <Box>
            <Typography variant="subtitle1">팔로워</Typography>
            <Typography variant="h6">{user?.follower || 0}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1">팔로잉</Typography>
            <Typography variant="h6">{user?.following || 0}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1">게시물</Typography>
            <Typography variant="h6">{user?.cnt || 0}</Typography>
          </Box>
        </Box>
      </Paper>

      {/* 팔로워 목록 */}
      <Box mt={4}>
        <Typography variant="h6" sx={{ mb: 1 }}>팔로워 목록</Typography>
        <Paper sx={{ padding: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.8)' }}>
          {renderUserList(followerList, "follower")}
        </Paper>
      </Box>

      {/* 팔로잉 목록 */}
      <Box mt={4} mb={4}>
        <Typography variant="h6" sx={{ mb: 1 }}>팔로잉 목록</Typography>
        <Paper sx={{ padding: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.8)' }}>
          {renderUserList(followingList, "following")}
        </Paper>
      </Box>
    </Container>
  );
}

export default MyPage;
