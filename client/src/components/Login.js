import React, { useRef } from 'react';
import { TextField, Button, Container, Typography, Box, Paper } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  // 로그인 화면에서 입력한 값을 어떻게 받을 것인가? => Ref 또는 useState
  let idRef = useRef(null);
  let pwdRef = useRef();
  let navigate = useNavigate();

  const handleKeyUp = (e) => {
        if (e.key === "Enter") { // 엔터 키 감지
            signUp(); // 버튼 클릭과 동일한 동작
        }
    };

  function signUp(){
    let param = {
                userId : idRef.current.value,
                pwd : pwdRef.current.value
            };

            fetch("http://localhost:3010/user/login", {
                method : "POST",
                // 헤더랑 바디는 PUT 또는 POST 형태일 때 들어감 (로그인은 민감정보라 POST)
                headers : {
                    "Content-type" : "application/json"
                    // 이건 약속된 정보
                },
                body : JSON.stringify(param) 
                // JSON 형태로 타입을 변환하여 보내주는 것임
            })                    
              .then( res => res.json() )
              .then( data => {
                  alert(data.msg);
                  console.log(data);
                  if(data.result && data.token){ // ★ 이 값은 true고, 토큰이 존재하면
                    localStorage.setItem("token", data.token); 
                    // localStorage에 토큰값 저장 (키, 밸류의 형태로 넣어줘야함)
                    navigate("/feed"); // 페이지 이동                    
                  }
                  // 로그인 실패 시에는 alert 후 아무것도 하지 않고 현재 페이지에 머무름
                  
              } )
  }


  return (
    <Container maxWidth="xs">
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Paper elevation={4} sx={{ p: 4, borderRadius: 3, width: '100%' }}>
        <Typography variant="h5" gutterBottom>
          로그인
        </Typography>
        
        {/* TextField는 inputRef 써야함(?) */}
        <TextField inputRef={idRef} label="ID" variant="outlined" margin="normal" fullWidth />

        <TextField inputRef={pwdRef} label="Password" variant="outlined"
          margin="normal" fullWidth type="password" onKeyUp={handleKeyUp} />

        <Button onClick={signUp} variant="contained" color="primary" style={{ marginTop: '20px', width:'155px' }}>
          로그인
        </Button>

        <Button variant="contained" color="primary" 
        style={{ marginLeft:'20px', marginTop: '20px', width:'155px' }}>
            <Link to="/join" style={{ textDecoration: 'none', color: 'inherit' }}>
            회원가입</Link>
        </Button>

        <Typography variant="body2" style={{ marginTop: '10px', textAlign: 'center' }}>
          비밀번호를 잊으셨다면? <Link to="/searchpwd">비밀번호 리셋</Link>
        </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login;
