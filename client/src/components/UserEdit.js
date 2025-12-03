import React, { useEffect, useState } from "react";
import { Box, TextField, Button, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function UserEdit() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwdChk, setPwdChk] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인 후 이용해주세요.");
      navigate("/login");
      return;
    }

    const decode = jwtDecode(token);
    const uId = decode.userId;

    fetch(`http://localhost:3010/user/${uId}`)
      .then((res) => res.json())
      .then((data) => {
        setUserId(data.user.USER_ID);
        setEmail(data.user.EMAIL);
      });
  }, [navigate]);

  const onSubmit = () => {
    // 비밀번호 정규식
    const pwdRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

    if (pwd.length > 0) {
      if (!pwdRegex.test(pwd)) {
        alert("비밀번호는 최소 8자 이상, 영문/숫자/특수문자를 포함해야 합니다.");
        return;
      }

      if (pwd !== pwdChk) {
        alert("비밀번호 확인이 일치하지 않습니다.");
        return;
      }
    }

    const body = {
      userId,
      email,
      pwd: pwd || "",
    };

    fetch("http://localhost:3010/user/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.msg);
        navigate("/mypage");
      });
  };

  return (
    <Box display="flex" justifyContent="center" mt={5}>
      <Paper elevation={4} sx={{ width: 380, padding: 4, borderRadius: 4 }}>
        <Typography variant="h6" mb={3} textAlign="center">
          회원 정보 수정
        </Typography>

        <TextField
          label="아이디"
          value={userId}
          fullWidth
          margin="normal"
          disabled
        />

        <TextField
          label="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
        />

        <TextField
          label="변경할 비밀번호 (선택)"
          type="password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          fullWidth
          margin="normal"
        />

        <TextField
          label="비밀번호 확인"
          type="password"
          value={pwdChk}
          onChange={(e) => setPwdChk(e.target.value)}
          fullWidth
          margin="normal"
        />

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 3, paddingY: 1 }}
          onClick={onSubmit}
        >
          변경하기
        </Button>
      </Paper>
    </Box>
  );
}