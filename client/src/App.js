import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Login from './components/Login';
import Join from './components/Join';
import Feed from './components/Feed';
import Register from './components/Register';
import MyPage from './components/MyPage';
import Menu from './components/Menu';
import SearchPwd from './components/SearchPwd';
import PostDetailCard from './components/PostDetailCard';
import Edit from './components/Edit';
import RandomFeed from './components/RandomFeed';
import CommentList from './components/CommentList';
import Notification from './components/Notification';
import Main from './components/Main';
import ChatRoom from './components/ChatRoom';
import UserEdit from './components/UserEdit';
import { AnimatePresence, motion } from 'framer-motion';

// Theme 설정
const theme = createTheme({
  palette: {
    primary: { main: '#4f805f' }, // 그리너리 버튼/주요 색
    secondary: { main: 'rgba(255,255,255,0.3)' }, // 투명 버튼
    background: { default: 'rgba(245,245,245,0.8)' }, // Menu 배경
    text: { primary: '#4f805f', secondary: '#6b8c72' }, // 글자 색상
  },
  typography: {
    fontFamily: 'Pretendard, "Noto Sans KR", sans-serif',
  },
});

function App() {
  const location = useLocation();
  const isAuthPage =
    location.pathname === '/' ||
    location.pathname === '/join' ||
    location.pathname === '/searchpwd' ||
    location.pathname === '/main' ||
    location.pathname === '/login' ||
    location.pathname === '/Login';

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          bgcolor: 'background.default',
          minHeight: '100vh',
          
        }}
      >
        {!isAuthPage && <Menu />}

        
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            // 메뉴보다 밝고 투명도 낮춰 구분 확실히
            bgcolor: 'rgba(255,255,255,0.95)',
            color: 'text.primary',
            minHeight: '100vh',
            // 왼쪽 그림자 강화
            boxShadow: '-5px 0 15px rgba(0,0,0,0.15)',
            borderRadius: '0 12px 12px 0',
            
          }}
        >
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/login" element={<Login />} />
            <Route path="/join" element={<Join />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/register" element={<Register />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/searchpwd" element={<SearchPwd />} />
            <Route path="/postdetailcard" element={<PostDetailCard />} />
            <Route path="/edit/:postId" element={<Edit />} />
            <Route path="/randomfeed" element={<RandomFeed />} />
            <Route path="/commentlist" element={<CommentList />} />
            <Route path="/notification" element={<Notification />} />
            <Route path="/main" element={<Main />} />
            <Route path="/chat/:roomId" element={<ChatRoom />} />
            <Route path="/useredit" element={<UserEdit />} />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
