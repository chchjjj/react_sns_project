import React, { useState, useEffect } from 'react';
import { Drawer, List, ListItem, ListItemText, Box, Typography, Badge } from '@mui/material';
import { DynamicFeed, Home, Add, Notifications as NotificationsIcon, AccountCircle, Logout } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// 로그인 시 저장한 token에서 userId 가져오기
const getCurrentUserId = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const decoded = jwtDecode(token); 
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

  useEffect(() => {
    if (!userId) return;

    const fetchUnreadCount = async () => {
      try {
        const resp = await fetch(`http://localhost:3010/comment/notify/unread/${userId}`);
        const data = await resp.json();
        setUnreadCount(data.unread || 0);
      } catch (err) {
        console.error('Unread fetch error:', err);
      }
    };

    fetchUnreadCount();
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

  const buttonStyle = {
    borderRadius: '30px',
    backgroundColor: 'rgba(255,255,255,0.3)',
    color: '#4f805f',
    py: 1.5,
    px: 3,
    '&:hover': { backgroundColor: 'rgba(79,128,95,0.2)' },
    boxShadow: '0 3px 6px rgba(0,0,0,0.05)',
    justifyContent: 'center',
    backdropFilter: 'blur(5px)',
    cursor: 'pointer',
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          backgroundColor: 'rgba(245,245,245,0.8)',
          borderRight: 'none',
          paddingTop: 0,
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        },
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 4, mt: 1 }}>
        <Box
          component="img"
          src="/image/menu_logo.png"
          alt="Logo"
          sx={{ width: 250, height: 'auto'}}
        />
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#4f805f' }}>
          MENU
        </Typography>
      </Box>

      <List sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, px: 2, flexGrow: 1 }}>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            button
            onClick={() => navigate(item.path)}
            sx={buttonStyle}
          >
            {item.icon && <Box sx={{ mr: 1, color: '#4f805f' }}>{item.icon}</Box>}
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
            navigate('/main');
          }}
          sx={{ ...buttonStyle, mt: 'auto', mb: 2 }}
        >
          <Logout sx={{ mr: 1, color: '#4f805f' }} />
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
