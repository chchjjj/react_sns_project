import React, { useRef } from 'react';
import { TextField, Button, Container, Typography, Box, Paper } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  // 로그인 화면에서 입력한 값을 어떻게 받을 것인가? => Ref 또는 useState
  let idRef = useRef(null);
  let pwdRef = useRef();
  let navigate = useNavigate();

  // 엔터 키로 로그인 처리
  const handleKeyUp = (e) => {
    if (e.key === "Enter") { // 엔터 키 감지
      signUp(); // 버튼 클릭과 동일한 동작
    }
  };

  // 로그인 함수
  function signUp() {
    let param = {
      userId: idRef.current.value,
      pwd: pwdRef.current.value
    };

    fetch("http://localhost:3010/user/login", {
      method: "POST",
      headers: {
        "Content-type": "application/json" // 이건 약속된 정보
      },
      body: JSON.stringify(param) // JSON 형태로 타입을 변환하여 보내줌
    })
      .then(res => res.json())
      .then(data => {
        alert(data.msg);
        console.log(data);
        if (data.result && data.token) { // ★ 이 값은 true고, 토큰이 존재하면
          localStorage.setItem("token", data.token); // localStorage에 토큰 저장
          navigate("/feed"); // 페이지 이동
        }
        // 로그인 실패 시에는 alert 후 현재 페이지에 머무름
      });
  }

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        margin: 0,
        padding: 0,
        backgroundImage: `url(${process.env.PUBLIC_URL}/image/main.png)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* 배경 흐리게 처리 */}
      <Box sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(255,255,255,0.3)"
      }} />

      <Container maxWidth="xs" sx={{ position: "relative", zIndex: 1 }}>
        <Paper elevation={4} sx={{ p: 4, borderRadius: 3, width: '100%' }}>
          <Typography variant="h5" gutterBottom>
            로그인
          </Typography>

          {/* TextField는 inputRef 사용 */}
          <TextField inputRef={idRef} label="ID" variant="outlined" margin="normal" fullWidth />
          <TextField inputRef={pwdRef} label="Password" variant="outlined"
            margin="normal" fullWidth type="password" onKeyUp={handleKeyUp} />

          {/* 로그인 버튼 */}
          <Button onClick={signUp} variant="contained" color="primary" sx={{ mt: 2, width: '155px' }}>
            로그인
          </Button>

          {/* 회원가입 버튼 */}
          <Button variant="contained" color="primary" sx={{ ml: 2, mt: 2, width: '155px' }}>
            <Link to="/join" style={{ textDecoration: 'none', color: 'inherit' }}>회원가입</Link>
          </Button>

          {/* 비밀번호 리셋 안내 */}
          <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
            비밀번호를 잊으셨다면? <Link to="/searchpwd">비밀번호 리셋</Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}

export default Login;
