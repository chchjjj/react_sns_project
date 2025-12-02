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

        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >

      {/* 버튼을 가로로 정렬하는 컨테이너 */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 4, // 버튼 간 간격
        }}
      >
        <Button
          onClick={() => navigate("/Login")}
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
    </Box>
  );
}

export default Main;
