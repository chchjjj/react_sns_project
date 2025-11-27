import React from 'react';
import { Drawer, List, ListItem, ListItemText, Toolbar, Box, Typography } from '@mui/material';
import { DynamicFeed, Home, Add, AccountCircle, Logout } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function Menu() {
  const navigate = useNavigate();

  const menuItems = [
    { text: '피드', icon: <DynamicFeed />, path: '/feed' },
    { text: '내 게시글', icon: <Home />, path: '/feed' },
    { text: '등록', icon: <Add />, path: '/register' },
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
          backgroundColor: 'rgba(243, 224, 181, 0.5)', // 투명 베이지
          borderRight: 'none',
          paddingTop: '20px',
          backdropFilter: 'blur(10px)', // 유리같은 투명 느낌
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
              '&:hover': { backgroundColor: 'rgba(255,224,125,0.5)' }, // 노랑 계열 hover
              boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
              justifyContent: 'center',
              backdropFilter: 'blur(5px)',
              cursor: 'pointer',
            }}
          >
            {item.icon && <Box sx={{ mr: 1, color: '#A67B5B' }}>{item.icon}</Box>}
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontWeight: 'medium',
                textAlign: 'center',
              }}
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
            primaryTypographyProps={{
              fontWeight: 'medium',
              textAlign: 'center',
            }}
          />
        </ListItem>
      </List>
    </Drawer>
  );
}

export default Menu;
