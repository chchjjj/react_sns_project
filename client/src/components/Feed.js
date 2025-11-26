import React, { useState, useEffect } from 'react';
import {jwtDecode} from "jwt-decode";
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  Grid2, AppBar,Toolbar,Typography,Container,Box,
  Card,CardMedia,CardContent,CardHeader,CardActions,
  Dialog,DialogTitle,DialogContent,IconButton,DialogActions,Button,TextField,
  List,ListItem,ListItemText,ListItemAvatar,Avatar,
} from '@mui/material';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import CloseIcon from '@mui/icons-material/Close';
import PostDetailCard from "./PostDetailCard";


function Feed() {
  const [open, setOpen] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false); // 모달에서 수정 모드 여부
  const [editContent, setEditContent] = useState([]); // 수정할 텍스트

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
    setOpen(true);
    setSelectedFeed(null); // 초기화

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
          // 수정용 초기값 세팅
          if (data.post.type === "감사일기") {
              setEditContent(data.post.sections.map(sec => sec.content));
          } else {
              setEditContent([data.post.content]);
          }

          setIsEditing(false); // 항상 모달 열 때는 읽기 모드로 시작

        } else {
          alert("게시글을 불러오지 못했습니다.");
        }
      });

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

  // 게시글 수정 버튼
  function fnEdit(){
    const payload = { ...selectedFeed, content: editContent };
    fetch("http://localhost:3010/feed/" + selectedFeed.id, {
        method : "PUT",
        headers : {
            "Authorization" : "Bearer " + localStorage.getItem("token"),
            // 인증값 보내주기(일종의 약속) Bearer 한칸띄우기★
            "Content-type" : "application/json"
        },
        body : JSON.stringify(payload)
     })
        .then( res => res.json() )
        .then( data => {
            alert("수정되었습니다.");
            setSelectedFeed({ ...selectedFeed, content: editContent });
            setIsEditing(false); // 모달 다시 읽기 모드
            fnFeeds(); // 목록 업데이트

        })
  }

  return (
    <Container maxWidth="md">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">내 기록 모아보기</Typography>
        </Toolbar>
      </AppBar>

      <Box mt={4}>
        <Grid2 container spacing={3}>
          {feeds.length > 0 ? 
            feeds.map((feed) => { // 여기 feeds로 이름 바꿈!!! 뒤에 feed는 뭔 의미?
              const date = feed.cdatetime ? new Date(feed.cdatetime) : null;
                const formattedDate = date 
                    ? date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0')
                    : '날짜 알 수 없음';
                
                const diaryType = feed.type === '감사일기' ? '감사일기' : '일상일기';
                const cardTitle = `${formattedDate}의 일기 (${diaryType})`;
                
                return (
                    // xs={12}로 변경하여 가로 전체 너비 사용
                    <Grid2 xs={12} key={feed.id}> 
                       <Card 
                            elevation={4} 
                            onClick={() => handleClickOpen(feed)} 
                            sx={{ 
                                display: 'flex', 
                                alignItems: 'center', // 세로로 중앙 정렬
                                cursor: 'pointer', 
                                width : 850,
                                height: 100, // 카드의 세로 높이 지정 (통통하게)
                                padding: 2, 
                                '&:hover': {
                                    backgroundColor: 'action.hover', // 마우스 오버 효과
                                }
                            }}
                        >
                            {/* 1. 작은 이미지 미리보기 영역 (선택 사항) */}
                            {feed.imgPath ? (
                                <CardMedia
                                    component="img"
                                    sx={{ 
                                        width: 80, 
                                        height: 80, 
                                        borderRadius: 1, 
                                        marginRight: 2,
                                        objectFit: 'cover'
                                    }}
                                    image={feed.imgPath}
                                    alt={feed.imgName || '피드 이미지'}
                                />
                            ) : (
                                // 이미지가 없을 경우 대체 아이콘 또는 박스
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
                            
                            {/* 2. 제목 및 내용 요약 영역 */}
                            <CardContent sx={{ 
                                flexGrow: 1, 
                                p: 0, // 기본 패딩 제거
                                '&:last-child': { paddingBottom: 0 } // CardContent의 마지막 패딩 제거
                            }}>
                                {/* 주 제목: 작성일 */}
                                <Typography 
                                    variant="h6" 
                                    component="div" 
                                    sx={{ fontWeight: 'bold' }}
                                >
                                    {cardTitle} 
                                </Typography>
                                {/* 내용 미리보기 */}
                                <Typography 
                                    variant="body2" 
                                    color="text.secondary" 
                                    noWrap // 내용이 길면 ... 처리
                                >
                                    {feed.content || "상세 내용을 확인하려면 클릭하세요."} 
                                </Typography>
                            </CardContent>
                       </Card>
                    </Grid2>
                );
            }) : "등록된 피드가 없습니다. 기록을 남겨보세요!"}
        </Grid2>
      </Box>
      
      {/* 게시글 눌렀을 때 열리는 모달 */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg"> {/* 모달 크기 조정 */}
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

        <DialogContent sx={{ display: 'flex', gap: 3 }}> {/* flex로 좌우 배치, gap으로 여백 */}
            {/* 왼쪽: 게시글 내용 */}
            <Box sx={{ flex: 1 }}> 
              <PostDetailCard post={selectedFeed} />
            </Box>

            {/* 오른쪽: 댓글 */}
            <Box sx={{ width: '300px' }}>
              <Typography variant="h6">댓글</Typography>
              <List>
                {comments.map((comment, index) => (
                  <ListItem key={index}>
                    <ListItemAvatar>
                      <Avatar>{comment.id.charAt(0).toUpperCase()}</Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={comment.text} secondary={comment.id} />
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

          <Button variant='contained' color="primary" onClick={() => {
              navigate(`/edit/${selectedFeed.id}`);
              handleClose(); // 모달 닫기
            }}>
              수정
          </Button>

          <Button onClick={()=>{
              console.log(selectedFeed);
              // 삭제요청하면서 selectedFeed.id를 보낸다!
              if(!window.confirm("해당 기록을 삭제하겠습니까?")){
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