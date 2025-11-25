import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import Login from './components/Login';
import Join from './components/Join';
import Feed from './components/Feed';
import Register from './components/Register';
import MyPage from './components/MyPage';
import Menu from './components/Menu';
import Mui from './components/Mui';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SearchPwd from './components/SearchPwd';

const theme = createTheme({
  palette: {
    primary: { main: '#9bd1d8ff' },
    secondary: { main: '#F8D374' },
    text: { primary: '#636363' },
    background: { default: '#FFE697' }
  },
  typography: {
    fontFamily: 'Pretendard, sans-serif',
  }
});

function App() {
  const location = useLocation(); // return 밖에서 JS 코드 먼저 실행
  const isAuthPage = location.pathname === '/' || location.pathname === '/join' || location.pathname === '/searchpwd';

  return (
    <ThemeProvider theme={theme}> {/* JSX는 return 안에서 사용 */}
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />

        {!isAuthPage && <Menu />} 
        {/* 로그인/회원가입이 아닐 때만 메뉴 표시 */}

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/join" element={<Join />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/register" element={<Register />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/mui" element={<Mui />} />
            <Route path="/searchpwd" element={<SearchPwd />} />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;