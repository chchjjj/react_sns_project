import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import {
  Grid2, AppBar, Toolbar, Typography, Container, Box,
  Card, CardMedia, CardContent, CardActions, Dialog, DialogTitle, DialogContent,
  IconButton, DialogActions, Button, TextField, List, ListItem, ListItemText, ListItemAvatar, Avatar
} from '@mui/material';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import CloseIcon from '@mui/icons-material/Close';
import PostDetailCard from "./PostDetailCard";
import CommentList from './CommentList';

function Feed() {
  const [open, setOpen] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState([]);
  const [feeds, setFeeds] = useState([]);

  const navigate = useNavigate();

  const fnFeeds = () => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      fetch("http://localhost:3010/feed/" + decoded.userId)
        .then(res => res.json())
        .then(data => {
          setFeeds(data.list || []);
          console.log(data);
        });
    } else {
      alert("로그인 후 이용해주세요.");
      navigate("/");
    }
  };

  useEffect(() => {
    fnFeeds();
  }, []);

  const handleClickOpen = (feed) => {
    setOpen(true);

    fetch("http://localhost:3010/feed/post/" + feed.id, {
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("token")
      }
    })
      .then(res => res.json())
      .then(data => {
        console.log("상세조회:", data);

        if (data.result === "success") {
          setSelectedFeed(data.post);

          if (data.post.type === "감사일기") {
            setEditContent(data.post.sections.map(sec => sec.content));
          } else {
            setEditContent([data.post.content]);
          }

          setIsEditing(false);

        } else {
          alert("게시글을 불러오지 못했습니다.");
        }
      });

    // 샘플 댓글 초기화
    setComments([
    ]);
    setNewComment('');
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedFeed(null);
    setComments([]);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([...comments, { id: 'currentUser', text: newComment }]);
      setNewComment('');
    }
  };

  // const fnEdit = () => {
  //   if (!selectedFeed?.id) return;

  //   const payload = { ...selectedFeed, content: editContent };
  //   fetch("http://localhost:3010/feed/" + selectedFeed.id, {
  //     method: "PUT",
  //     headers: {
  //       "Authorization": "Bearer " + localStorage.getItem("token"),
  //       "Content-type": "application/json"
  //     },
  //     body: JSON.stringify(payload)
  //   })
  //     .then(res => res.json())
  //     .then(data => {
  //       alert("수정되었습니다.");
  //       setSelectedFeed({ ...selectedFeed, content: editContent });
  //       setIsEditing(false);
  //       fnFeeds();
  //     });
  // };

  return (
    <Container maxWidth="md">
    <div style={{ transform: 'scale(0.85)', transformOrigin: 'top left', width: '100%', height: '100%' }}>
    {/* 기존 페이지 내용 */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">내 기록 모아보기</Typography>
        </Toolbar>
      </AppBar>

      <Box mt={4}>
        <Grid2 container spacing={3}>
          {feeds.length > 0 ? feeds.map((feed) => {
            const date = feed.cdatetime ? new Date(feed.cdatetime) : null;
            const formattedDate = date
              ? date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0')
              : '날짜 알 수 없음';
            const diaryType = feed.type === '감사일기' ? '감사일기' : '일상일기';
            const cardTitle = `${formattedDate}의 일기 (${diaryType})`;

            return (
              <Grid2 xs={12} key={feed.id}>
                <Card
                  elevation={4}
                  onClick={() => handleClickOpen(feed)}
                  sx={{
                    display: 'flex',
                    borderRadius: 10,
                    alignItems: 'center',
                    cursor: 'pointer',
                    width: 850,
                    height: 150,
                    padding: 2,
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                >
                  {feed.imgPath ? (
                    <CardMedia
                      component="img"
                      sx={{ width: 80, height: 80, borderRadius: 1, marginRight: 2, objectFit: 'cover' }}
                      image={feed.imgPath}
                      alt={feed.imgName || '피드 이미지'}
                    />
                  ) : (
                    <Box sx={{
                      width: 80,
                      height: 80,
                      backgroundColor: 'grey.100',
                      borderRadius: 1,
                      marginRight: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <LocalFloristIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                    </Box>
                  )}

                  <CardContent sx={{ flexGrow: 1, p: 0, '&:last-child': { paddingBottom: 0 } }}>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                      {cardTitle}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {feed.content || "상세 내용을 확인하려면 클릭하세요."}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid2>
            );
          }) : "등록된 피드가 없습니다. 기록을 남겨보세요!"}
        </Grid2>
      </Box>

      {/* 게시글 모달 */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
        <DialogTitle>
          {selectedFeed ? selectedFeed.type + " 상세보기" : "불러오는 중…"}
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ display: 'flex', gap: 3 }}>
          {/* 왼쪽: 게시글 */}
          <Box sx={{ flex: 1 }}>
            {selectedFeed ? (
              <PostDetailCard post={selectedFeed} viewMode="mine" />
            ) : (
              <Typography>게시글을 불러오는 중입니다...</Typography>
            )}
          </Box>

          {/* 오른쪽: 댓글 */}
          <Box sx={{ width: '300px' }}>
            <CommentList postId={selectedFeed?.id} />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button
            variant='contained'
            color="primary"
            onClick={() => {
              if (selectedFeed?.id) {
                navigate(`/edit/${selectedFeed.id}`);
                handleClose();
              } else {
                alert("선택된 게시글이 없습니다.");
              }
            }}
          >
            수정
          </Button>

          <Button
            onClick={() => {
              if (!selectedFeed?.id) return alert("선택된 게시글이 없습니다.");

              if (!window.confirm("해당 기록을 삭제하겠습니까?")) return;

              fetch("http://localhost:3010/feed/" + selectedFeed.id, {
                method: "DELETE",
                headers: {
                  "Authorization": "Bearer " + localStorage.getItem("token")
                }
              })
                .then(res => res.json())
                .then(data => {
                  alert("삭제되었습니다.");
                  setOpen(false);
                  fnFeeds();
                });
            }}
            variant='contained'
            color="primary"
          >
            삭제
          </Button>

          <Button onClick={handleClose} color="primary">
            닫기
          </Button>
        </DialogActions>
      </Dialog>
    </div>
    </Container>
  );
}

export default Feed;