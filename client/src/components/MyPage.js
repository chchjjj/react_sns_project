import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Avatar, Paper, List, ListItem, ListItemAvatar, ListItemText, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
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

  // DM 버튼 클릭 시 채팅방 이동
  const handleSendDM = async (targetUserId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인 후 이용해주세요.");
      navigate("/");
      return;
    }

     try {
      const currentUserId = jwtDecode(token).userId;

      // 서버에 DM 방 존재 여부 확인 / 없으면 생성
      const resp = await fetch("http://localhost:3010/chat/check-room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
          userA: currentUserId,
          userB: targetUserId
        })
      });

      const data = await resp.json();

      if (!data.roomId) {
        alert("채팅방 정보를 가져오지 못했습니다.");
        return;
      }

      // 채팅방으로 이동
      navigate(`/chat/${data.roomId}`);

    } catch (err) {
      console.error("채팅방 연결 실패", err);
      alert("채팅방 연결에 실패했습니다.");
    }
  };

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
        // 팔로워 목록이면 FOLLOWER_ID, 팔로잉 목록이면 FOLLOWING_ID 사용
        const userId = type === "follower" ? item.FOLLOWER_ID : item.FOLLOWING_ID;

        // 프로필 이미지가 DB에 없으면 비워두기
        const profileImage = item.PROFILE_IMAGE || "";

        return (
          <ListItem
            key={idx}
            sx={{
              mb: 1,
              bgcolor: 'rgba(0,0,0,0.05)',
              borderRadius: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Box display="flex" alignItems="center">
              <ListItemAvatar>
                <Avatar src={profileImage} />
              </ListItemAvatar>
              <ListItemText primary={userId || "unknown"} sx={{ ml: 1 }} />
            </Box>
            
            
            <Box display="flex" alignItems="center">
              {type === "following" && (
                <Box
                  onClick={() => handleUnfollow(userId)}
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    bgcolor: '#1976d2', // 종이비행기 버튼 색상
                    color: '#fff',
                    borderRadius: 2,
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'center',
                    '&:hover': { bgcolor: '#1565c0' },
                    userSelect: 'none',
                    mr: 2 // 오른쪽 여백: 종이비행기와 간격
                  }}
                >
                  삭제
                </Box>
              )}
              <IconButton onClick={() => handleSendDM(userId)} color="primary" size="small">
                <SendIcon />
              </IconButton>
            </Box>          
            
          </ListItem>
        );
      })}
    </List>
  );
};

  // 팔로우 취소
  const handleUnfollow = async (followId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const confirm = window.confirm("팔로우를 취소하시겠습니까?");
    if (!confirm) return;

    try {
      const currentUserId = jwtDecode(token).userId;
      const resp = await fetch('http://localhost:3010/user/unfollow', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ userId: currentUserId, followId })
      });

      if (resp.ok) {
        setFollowingList(prev => prev.filter(f => f.FOLLOWING_ID !== followId));
      } else {
        const data = await resp.json();
        alert(data.msg || "언팔로우 실패");
      }
    } catch (err) {
      console.error(err);
      alert("서버 통신 오류");
    }
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
