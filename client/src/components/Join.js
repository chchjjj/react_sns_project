import React, { useRef, useState } from 'react';
import { TextField, Button, Container, Typography, Box, InputAdornment, IconButton } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

function Join() {
  let navigate = useNavigate();
  let userId = useRef();
  let pwd = useRef();
  let pwdChk = useRef();
  let email = useRef();
  const [idChecked, setIdChecked] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false); // 모달용 상태

  // 중복확인
  const checkDuplicate = () => {
    const id = userId.current.value;

    // 1. 입력 여부 체크
    if (!id) { 
      alert("아이디를 입력해주세요.");
      return;
    }

    // 2. 아이디 정규식 체크
    const idRegex = /^[a-zA-Z0-9]{6,12}$/; // 영문+숫자 6~12자
    if (!idRegex.test(id)) {
      alert("아이디는 4~12자의 영문과 숫자만 가능합니다.");
      return;
    }

    // 3. 서버로 아이디 중복 체크
    fetch(`http://localhost:3010/user/checkId?userId=${id}`)    
      .then(res => res.json())
      .then(data => {
        if (data.exists) {
          alert("이미 사용중인 아이디입니다.");
          setIdChecked(false);
        } else {
          alert("사용 가능한 아이디입니다.");
          setIdChecked(true);
        }
      });
  };

  return (
    <Container maxWidth="xs">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="70vh"
        bgcolor="#ffffff"  // 박스 배경색 흰색
        padding={4}
        boxShadow={3}      // 살짝 그림자
        borderRadius={2}   // 모서리 둥글게
        marginTop="100px"
      >
        <Typography variant="h5" gutterBottom>
          환영합니다!
        </Typography>  

        <TextField inputRef={userId} label="아이디" 
            variant="outlined" margin="normal" fullWidth 
            disabled={idChecked}
            InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Button onClick={checkDuplicate} size="small" variant="contained">중복확인</Button>
              </InputAdornment>
            ),
          }}    
        />
        <Typography variant="caption" color="textSecondary" align="left" style={{ width: '100%' }}>
          아이디는 6~12자의 영문, 숫자만 가능합니다.
        </Typography>

        <TextField
          inputRef={pwd}
          label="비밀번호"
          variant="outlined"
          margin="normal"
          fullWidth
          type="password"
        />
        <Typography variant="caption" color="textSecondary" align="left" style={{ width: '100%' }}>
          비밀번호는 최소 8자 이상, 영문/숫자/특수문자 포함
        </Typography>

        <TextField
          inputRef={pwdChk}
          label="비밀번호 확인"
          variant="outlined"
          margin="normal"
          fullWidth
          type="password"
        />
        <Typography variant="caption" color="textSecondary" align="left" style={{ width: '100%', marginBottom: '10px' }}>
          비밀번호를 동일하게 입력해주세요.
        </Typography>

          <TextField
          inputRef={email}
          label="이메일"
          variant="outlined"
          margin="normal"
          fullWidth
        />
        <Typography variant="caption" color="textSecondary" align="left" style={{ width: '100%', marginBottom: '10px' }}>
          정확한 메일주소를 입력해주세요. (비밀번호 찾기에 활용)
        </Typography>
        
        
        {/* '회원가입' 버튼 눌렀을 때 */}
        <Button onClick={()=>{
            const idValue = userId.current.value;
            const pwdValue = pwd.current.value;
            const pwdChkValue = pwdChk.current.value;
            const emailValue = email.current.value;

            // 1. 아이디 중복 확인 여부 체크
            if (!idChecked) {
              alert("아이디 중복 확인을 해주세요.");
              return;
            }

            // 2. 빈칸 체크
            if (!idValue || !pwdValue || !pwdChkValue || !emailValue) {
              alert("모든 항목을 입력해주세요.");
              return;
            }

            // 3. 비밀번호 정규식 체크
            const pwdRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
            // 최소 8자, 영문+숫자+특수문자 포함
            if (!pwdRegex.test(pwdValue)) {
              alert("비밀번호는 최소 8자 이상, 영문/숫자/특수문자를 포함해야 합니다.");
              return;
            }

            // 4. 비밀번호 확인 일치 체크
            if (pwdValue !== pwdChkValue) {
              alert("비밀번호 확인이 일치하지 않습니다.");
              return;
            }

            // 5. 가입 모달창 띄우기 (window.confirm 사용 예시)
            const confirm = window.confirm("가입하시겠습니까?");
            if (!confirm) return;

            let param = {
              userId: idValue,
              pwd: pwdValue,
              email: emailValue,
            };

            fetch("http://localhost:3010/user/join", {
                method : "POST",
                // 헤더랑 바디는 PUT 또는 POST 형태일 때 들어감
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
                  navigate("/");
              } )

        }} variant="contained" color="primary" fullWidth style={{ marginTop: '20px' }}>
            회원가입
        </Button>

        <Typography variant="body2" style={{ marginTop: '10px' }}>
          이미 회원이라면? <Link to="/">로그인</Link>
        </Typography>
      </Box>
    </Container>
  );
}

export default Join;