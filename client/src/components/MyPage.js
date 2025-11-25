import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Avatar, Grid, Paper } from '@mui/material';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import {jwtDecode} from "jwt-decode";

function MyPage() {  

  let [user, setUser] = useState();
  let navigate = useNavigate();

  function fnGetUser(){
    // jwt 통해서 토큰에서 아이디 꺼내야 함
    const token = localStorage.getItem("token"); // 토큰은 절대 변하면 안되니까 const

    if(token){ // 토큰에 값이 있을 때
      const decoded = jwtDecode(token); // jwtDecode에 토큰값 넣기 (?)
      console.log("decoded : ", decoded);
      fetch("http://localhost:3010/user/" + decoded.userId)
        .then(res => res.json())
        .then(data => {
          setUser(data.user);
        })
    } else { // 토큰에 값이 없을 땐 로그인 페이지로 이동시키기
        alert("로그인 후 이용해주세요.");
        navigate("/"); // 로그인 페이지로 이동
    }

    
  }

  useEffect(()=>{
    fnGetUser();
  }, []) // 최초 1회만 실행

  return (
    <Container maxWidth="md">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="flex-start"
        minHeight="100vh"
        sx={{ padding: '20px' }}
      >
        <Paper elevation={3} sx={{ padding: '20px', borderRadius: '15px', width: '100%' }}>
          {/* 프로필 정보 상단 배치 */}
          <Box display="flex" flexDirection="column" alignItems="center" sx={{ marginBottom: 3 }}>
            <Avatar
              alt="프로필 이미지"
              src="https://images.unsplash.com/photo-1551963831-b3b1ca40c98e" // 프로필 이미지 경로
              sx={{ width: 100, height: 100, marginBottom: 2 }}
            />
            <Typography variant="h5">
                {user?.userName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                @{user?.userId}
            </Typography>
          </Box>
          <Grid container spacing={2} sx={{ marginTop: 2 }}>
            <Grid item xs={4} textAlign="center">
              <Typography variant="h6">팔로워</Typography>
              <Typography variant="body1">{user?.follower}</Typography>
            </Grid>
            <Grid item xs={4} textAlign="center">
              <Typography variant="h6">팔로잉</Typography>
              <Typography variant="body1">{user?.following}</Typography>
            </Grid>
            <Grid item xs={4} textAlign="center">
              <Typography variant="h6">게시물</Typography>
              <Typography variant="body1">{user?.cnt}</Typography>
            </Grid>
          </Grid>
          <Box sx={{ marginTop: 3 }}>
            <Typography variant="h6">내 소개</Typography>
            <Typography variant="body1">
              {user?.intro}
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default MyPage;