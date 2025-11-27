import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import Login from './components/Login';
import Join from './components/Join';
import Feed from './components/Feed';
import Register from './components/Register';
import MyPage from './components/MyPage';
import Menu from './components/Menu';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SearchPwd from './components/SearchPwd';
import PostDetailCard from './components/PostDetailCard';
import Edit from './components/Edit';
import RandomFeed from './components/RandomFeed';

const theme = createTheme({
  palette: {
    primary: { main: '#A67B5B' },          // 브라운 계열
    secondary: { main: '#F3E0B5' },        // 베이지톤
    info: { main: '#DDE3A3' },             // 연두 느낌
    warning: { main: '#FFE07D' },          // 따뜻한 노랑
    background: { default: 'rgba(243, 224, 181, 0.3)' }, // 투명 베이지
    text: { primary: '#4B3B3B', secondary: '#6B5E53' }, // 부드러운 브라운
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
    location.pathname === '/searchpwd';

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        {!isAuthPage && <Menu />}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            bgcolor: 'rgba(243, 224, 181, 0.3)',
            minHeight: '100vh',
          }}
        >
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/join" element={<Join />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/register" element={<Register />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/searchpwd" element={<SearchPwd />} />
            <Route path="/postdetailcard" element={<PostDetailCard />} />
            <Route path="/edit/:postId" element={<Edit />} />
            <Route path="/randomfeed" element={<RandomFeed />} />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
