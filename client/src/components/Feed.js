import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import {
  Grid2, AppBar, Toolbar, Typography, Container, Box,
  Card, CardMedia, CardContent, Dialog, DialogTitle, DialogContent,
  IconButton, DialogActions, Button
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
  const [page, setPage] = useState(1); // 페이징
  const itemsPerPage = 5; // 페이지당 글 수

  const navigate = useNavigate();

  const fnFeeds = () => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      fetch("http://localhost:3010/feed/" + decoded.userId,

        {
    headers: {
      "Authorization": "Bearer " + token
    }
  }
      )
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

  // 페이지 계산
  const totalPages = Math.ceil(feeds.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const currentFeeds = feeds.slice(startIndex, startIndex + itemsPerPage);

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
    setComments([]);
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
<AppBar position="static" color="transparent" elevation={0}>
  <Toolbar sx={{ justifyContent: 'flex-start', py: 3, px: 2 }}>
    <Box
      sx={{
        px: 4,
        py: 1.5,
        borderRadius: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.15)', // 부드럽게 연한 배경
        boxShadow: '0 8px 20px rgba(0,0,0,0.08)',      // 부드러운 그림자
        backdropFilter: 'blur(8px)',                   // 살짝 블러
      }}
    >
      <Typography
        variant="h5"
        component="div"
        sx={{
          fontWeight: 700,
          letterSpacing: 0.5,
          color: 'rgba(56, 142, 60, 0.9)',            // 초록 계열
          textAlign: 'left',
        }}
      >
        내 기록 모아보기
      </Typography>
    </Box>
  </Toolbar>
</AppBar>


        <Box mt={4}>
          <Grid2 container spacing={3}>
            {currentFeeds.length > 0 ? currentFeeds.map(feed => {
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
                        sx={{
                          width: 80,
                          height: 'auto',
                          maxHeight: 80,
                          borderRadius: 1,
                          marginRight: 2,
                          objectFit: 'contain',
                          backgroundColor: '#f0f0f0'
                        }}
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

          {/* 페이지 이동 버튼 추가 (Grid 아래에 배치) */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 1,
              mt: 4,
              flexWrap: 'wrap',
              animation: 'fadeIn 0.4s ease',
              '@keyframes fadeIn': {
                from: { opacity: 0, transform: 'translateY(5px)' },
                to: { opacity: 1, transform: 'translateY(0)' }
              }
            }}
          >
            {/* 이전 페이지 */}
            {page > 1 && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setPage(page - 1)}
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 3,
                  fontWeight: 'bold',
                  boxShadow: 3,
                  transition: '0.2s',
                  '&:hover': { transform: 'scale(1.05)' }
                }}
              >
                이전
              </Button>
            )}

            {/* 숫자 페이지 버튼 */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
              <Button
                key={num}
                variant={num === page ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => setPage(num)}
                sx={{
                  minWidth: 40,
                  px: 1.5,
                  py: 1,
                  borderRadius: 3,
                  fontWeight: 'bold',
                  boxShadow: num === page ? 3 : 1,
                  transition: '0.2s',
                  '&:hover': { transform: 'scale(1.05)' }
                }}
              >
                {num}
              </Button>
            ))}

            {/* 다음 페이지 */}
            {page < totalPages && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setPage(page + 1)}
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 3,
                  fontWeight: 'bold',
                  boxShadow: 3,
                  transition: '0.2s',
                  '&:hover': { transform: 'scale(1.05)' }
                }}
              >
                다음
              </Button>
            )}
          </Box>
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
                  .then(() => {
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
