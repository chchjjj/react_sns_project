import React, { useState, useEffect } from 'react';
import { Drawer, List, ListItem, ListItemText, Toolbar, Box, Typography, Badge } from '@mui/material';
import { DynamicFeed, Home, Add, Notifications as NotificationsIcon, AccountCircle, Logout } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// 로그인 시 저장한 token에서 userId 가져오기
const getCurrentUserId = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const decoded = jwtDecode(token); // { userId: "...", iat, exp }
    return decoded.userId;
  } catch (err) {
    console.error("JWT decode error", err);
    return null;
  }
};

function Menu() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const userId = getCurrentUserId();

  // 미읽은 알림 개수 fetch
  useEffect(() => {
    if (!userId) return;

    const fetchUnreadCount = async () => {
      try {
        const resp = await fetch(`http://localhost:3010/comment/notify/unread/${userId}`);
        const data = await resp.json();
        console.log('Unread fetch data:', data);
        setUnreadCount(data.unread || 0);
      } catch (err) {
        console.error('Unread fetch error:', err);
      }
    };

    fetchUnreadCount();

    // 옵션: 일정 간격으로 폴링
    const interval = setInterval(fetchUnreadCount, 5000);
    return () => clearInterval(interval);

  }, [userId]);

  const menuItems = [
    { text: '피드', icon: <DynamicFeed />, path: '/randomfeed' },
    { text: '내 게시글', icon: <Home />, path: '/feed' },
    { text: '등록', icon: <Add />, path: '/register' },
    { 
      text: '알림', 
      icon: (
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      ), 
      path: '/notification' 
    },
    { text: '마이페이지', icon: <AccountCircle />, path: '/mypage' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          backgroundColor: 'rgba(243, 224, 181, 0.5)',
          borderRight: 'none',
          paddingTop: '20px',
          backdropFilter: 'blur(10px)',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#A67B5B' }}>
          MENU
        </Typography>
      </Box>

      <List sx={{ display: 'flex', flexDirection: 'column', gap: 2, px: 2 }}>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            button
            onClick={() => navigate(item.path)}
            sx={{
              borderRadius: '30px',
              backgroundColor: 'rgba(255,255,255,0.7)',
              color: '#4B3B3B',
              py: 1.5,
              px: 3,
              '&:hover': { backgroundColor: 'rgba(255,224,125,0.5)' },
              boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
              justifyContent: 'center',
              backdropFilter: 'blur(5px)',
              cursor: 'pointer',
            }}
          >
            {item.icon && <Box sx={{ mr: 1, color: '#A67B5B' }}>{item.icon}</Box>}
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{ fontWeight: 'medium', textAlign: 'center' }}
            />
          </ListItem>
        ))}

        <ListItem
          button
          onClick={() => {
            if (!window.confirm('로그아웃 하시겠습니까?')) return;
            localStorage.removeItem('token');
            alert('로그아웃 되었습니다.');
            navigate('/');
          }}
          sx={{
            borderRadius: '30px',
            backgroundColor: 'rgba(255,255,255,0.7)',
            color: '#4B3B3B',
            py: 1.5,
            px: 3,
            '&:hover': { backgroundColor: 'rgba(255,224,125,0.5)' },
            boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
            justifyContent: 'center',
            backdropFilter: 'blur(5px)',
            cursor: 'pointer',
          }}
        >
          <Logout sx={{ mr: 1, color: '#A67B5B' }} />
          <ListItemText
            primary="로그아웃"
            primaryTypographyProps={{ fontWeight: 'medium', textAlign: 'center' }}
          />
        </ListItem>
      </List>
    </Drawer>
  );
}

export default Menu;
