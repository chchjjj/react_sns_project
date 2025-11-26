import React, { useRef, useState } from 'react';
import { TextField, Button, Container, Typography, Box, Paper } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

function SearchPwd() {
  // 화면에서 입력한 값을 어떻게 받을 것인가? => Ref 또는 useState
  let idRef = useRef(null);
  let emailRef = useRef();  
  let newPwdRef = useRef(null);
  let confirmPwdRef = useRef(null);
  const [accountVerified, setAccountVerified] = useState(false); // 새 비번설정 영역
  const [message, setMessage] = useState('');
  let navigate = useNavigate();

  // 새 비번 변경 (변경하기 버튼 눌렀을 때)
  function handleChangePassword(){
        const newPwd = newPwdRef.current.value;
        const confirmPwd = confirmPwdRef.current.value;

        // 비밀번호 정규식 체크
        const pwdRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        // 최소 8자, 영문+숫자+특수문자 포함
        if (!pwdRegex.test(newPwd)) {
            alert("비밀번호는 최소 8자 이상, 영문/숫자/특수문자를 포함해야 합니다.");
            return;
        }

        if (newPwd !== confirmPwd) {
            alert("새로 설정한 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
            return;
        }

        const param = {
            userId: idRef.current.value,
            pwd: newPwd, // 서버에서 bcrypt 등으로 해시 처리
            token: localStorage.getItem("token"), // 인증용
        };

        fetch("http://localhost:3010/user/updatepwd", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(param),
        })
            .then(res => res.json())
            .then(data => {
                if (data.result) {
                    alert("비밀번호가 변경되었습니다.");
                    navigate("/");
                } else {
                    setMessage(data.msg || "비밀번호 변경에 실패했습니다.");
                }
            });
  }


  return (
    <Container maxWidth="xs">
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Paper elevation={4} sx={{ p: 4, borderRadius: 3, width: '100%' }}>
        <Typography variant="h5" gutterBottom>
          비밀번호 리셋
        </Typography>
        
        {/* TextField는 inputRef 써야함(?) */}
        <TextField inputRef={idRef} label="가입한 아이디" variant="outlined" margin="normal" fullWidth />
        <TextField
          inputRef={emailRef}
          label="이메일"
          variant="outlined"
          margin="normal"
          fullWidth
        />
        <Button onClick={()=>{
            let param = {
                userId : idRef.current.value,
                email : emailRef.current.value
            };

            fetch("http://localhost:3010/user/searchpwd", {
                method : "POST",
                // 검증용 민감정보라 POST
                headers : {"Content-type" : "application/json"},
                body : JSON.stringify(param) 
                // JSON 형태로 타입을 변환하여 보내주는 것임
            })                    
              .then( res => res.json() )
              .then( data => {
                  if (data.exists) {
                    setAccountVerified(true); // 새 비밀번호 영역 노출
                    setMessage(''); // 메시지 초기화
                    //localStorage.setItem("token", data.token); // 토큰 저장
                } else {
                    setAccountVerified(false);
                    setMessage(data.msg || "계정 정보를 확인해주세요.");
                }
              });

        }} variant="contained" fullWidth color="primary" style={{ marginTop: '20px' }}>
          계정 찾기
        </Button>
        
        {/* 메시지 출력 */}
          {message && (
            <Typography variant="body2" color="error" align="center" mt={1}>
              {message}
            </Typography>
          )}

          {/* 새 비밀번호 폼 */}
          {accountVerified && (
            <Box mt={2}>
              <TextField
                inputRef={newPwdRef}
                label="새 비밀번호" type="password"
                variant="outlined" margin="normal" fullWidth
              />
              <Typography variant="caption" color="textSecondary" align="left" style={{ width: '100%' }}>
                        비밀번호는 최소 8자 이상, 영문/숫자/특수문자 포함
              </Typography>

              <TextField
                inputRef={confirmPwdRef}
                label="비밀번호 확인" type="password"
                variant="outlined" margin="normal" fullWidth
              />
              <Typography variant="caption" color="textSecondary" align="left" style={{ width: '100%', marginBottom: '10px' }}>
                        비밀번호를 동일하게 입력해주세요.
              </Typography>

              <Button onClick={handleChangePassword}
                variant="contained" color="primary" fullWidth style={{ marginTop: '20px' }}
              > 변경하기 </Button>

            </Box>
            )}
        </Paper>
      </Box>
    </Container>
  );
}

export default SearchPwd;
