import React from "react";
import { Button, Box } from "@mui/material";
import { useNavigate } from 'react-router-dom';

function Main() {
  const navigate = useNavigate();

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

        // 중앙 정렬
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column", // 버튼을 세로로 쌓고 싶으면 column
        gap: 5, // 버튼 사이 간격
      }}
    >
      <Button
        onClick={() => navigate("/")}
        variant="contained"
        sx={{
          backgroundColor: "rgba(255,255,255,0.8)",
          color: "#333",
          borderRadius: 3,
          textTransform: "none",
          fontSize: "1rem", // 버튼 글자 크게
          padding: "20px 60px", // 버튼 영역 크게
          boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
          "&:hover": {
            backgroundColor: "rgba(255,255,255,0.9)",
          },
        }}
      >
        로그인
      </Button>

      <Button
        onClick={() => navigate("/join")}
        variant="contained"
        sx={{
          backgroundColor: "rgba(255,255,255,0.8)",
          color: "#333",
          borderRadius: 3,
          textTransform: "none",
          fontSize: "1rem",
          padding: "20px 60px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
          "&:hover": {
            backgroundColor: "rgba(255,255,255,0.9)",
          },
        }}
      >
        회원가입
      </Button>
    </Box>
  );
}

export default Main;
