import React, { useState, useEffect } from 'react';
import {jwtDecode} from "jwt-decode";
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  Grid2,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Card,
  CardMedia,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';


function Feed() {
  const [open, setOpen] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  let [feeds, setFeeds] = useState([]); // 이렇게 []라도 넣어두면 밑에서 ? 안붙여도 됨
  // 화면에 feeds 이거 뿌릴거임

  let navigate = useNavigate();

  function fnFeeds(){
    // jwt 통해서 토큰에서 아이디 꺼내야 함
    const token = localStorage.getItem("token"); // 토큰은 절대 변하면 안되니까 const
    if(token){
      const decoded = jwtDecode(token); // jwtDecode에 토큰값 넣기 (?)
      fetch("http://localhost:3010/feed/" + decoded.userId)
            .then(res => res.json())
            .then(data => {
              setFeeds(data.list); // 서버쪽에서 list란 이름으로 보냈으니깐
              console.log(data);
            })

    } else { // 토큰에 값이 없을 땐 로그인 페이지로 이동시키기
        alert("로그인 후 이용해주세요.");
        navigate("/"); // 로그인 페이지로 이동
    }
    
  }

    useEffect(()=>{
      fnFeeds();
    }, []) // 최초 1회만 실행

  const handleClickOpen = (feed) => {
    setSelectedFeed(feed);
    setOpen(true);
    setComments([
      { id: 'user1', text: '멋진 사진이에요!' },
      { id: 'user2', text: '이 장소에 가보고 싶네요!' },
      { id: 'user3', text: '아름다운 풍경이네요!' },
    ]); // 샘플 댓글 추가
    setNewComment(''); // 댓글 입력 초기화
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedFeed(null);
    setComments([]); // 모달 닫을 때 댓글 초기화
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([...comments, { id: 'currentUser', text: newComment }]); // 댓글 작성자 아이디 추가
      setNewComment('');
    }
  };

  return (
    <Container maxWidth="md">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">SNS</Typography>
        </Toolbar>
      </AppBar>

      <Box mt={4}>
        <Grid2 container spacing={3}>
          {feeds.length > 0 ? feeds.map((feed) => ( // 여기 feeds로 이름 바꿈!!! 뒤에 feed는 뭔 의미?
            <Grid2 xs={12} sm={6} md={4} key={feed.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={feed.imgPath} // db에 있는 이미지로 가져와서 넣음
                  alt={feed.imgName}
                  onClick={() => handleClickOpen(feed)}
                  style={{ cursor: 'pointer' }}
                />
                <CardContent>
                  <Typography variant="body2" color="textSecondary">
                    {feed.content} {/* db에 있는 내용 가져오기*/}
                  </Typography>
                </CardContent>
              </Card>
            </Grid2>
          )) : "등록된 피드가 없습니다. 피드를 등록해보세요!"}
        </Grid2>
      </Box>
      
      {/* 게시글 눌렀을 때 열리는 모달 */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg"> {/* 모달 크기 조정 */}
        <DialogTitle>
          {selectedFeed?.title}
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
        <DialogContent sx={{ display: 'flex' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body1">{selectedFeed?.content}</Typography>
            {selectedFeed?.imgPath && (
              <img
                src={selectedFeed.imgPath}
                alt={selectedFeed.imgName}
                style={{ width: '100%', marginTop: '10px' }}
              />
            )}
          </Box>

          <Box sx={{ width: '300px', marginLeft: '20px' }}>
            <Typography variant="h6">댓글</Typography>
            <List>
              {comments.map((comment, index) => (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar>{comment.id.charAt(0).toUpperCase()}</Avatar> {/* 아이디의 첫 글자를 아바타로 표시 */}
                  </ListItemAvatar>
                  <ListItemText primary={comment.text} secondary={comment.id} /> {/* 아이디 표시 */}
                </ListItem>
              ))}
            </List>
            <TextField
              label="댓글을 입력하세요"
              variant="outlined"
              fullWidth
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}           
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddComment}
              sx={{ marginTop: 1 }}
            >
              댓글 추가
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>{
              console.log(selectedFeed);
              // 삭제요청하면서 selectedFeed.id를 보낸다!
              if(!window.confirm("삭제하겠습니까?")){
                  return;
                }
                  fetch("http://localhost:3010/feed/" + selectedFeed.id, {
                      method : "DELETE",
                      headers : {
                        "Authorization" : "Bearer " + localStorage.getItem("token") 
                        // 인증값 보내주기(일종의 약속) Bearer 한칸띄우기★
                    }
                  })
                      .then( res => res.json() )
                      .then( data => {
                        alert("삭제되었습니다.");
                        setOpen(false); // 다이얼로그창 닫으면서
                        fnFeeds(); // 목록 다시 불러오기
                      })
          }} variant='contained' color="primary">
            삭제
          </Button>

          <Button onClick={handleClose} color="primary">
            닫기
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Feed;