import * as React from 'react';
import {
  Card, CardHeader, CardMedia, CardContent, CardActions, Box, Typography,
  IconButton, Avatar, TextField, Dialog
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite"; // 좋아요 관련
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder"; // 좋아요 관련
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline"; // 댓글창
import ChatBubbleIcon from "@mui/icons-material/ChatBubble"; // 댓글창
import CloseIcon from "@mui/icons-material/Close"; // 이미지 모달 닫기
import { useState, useEffect } from "react";
import { jwtDecode } from 'jwt-decode';
import CommentList from "./CommentList";

// JWT에서 현재 로그인한 userId 가져오기
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

export default function PostDetailCard({ post, isEditing, editContent, setEditContent, viewMode }) {
  const currentUserId = getCurrentUserId();

  // 좋아요 상태, 좋아요 수
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post?.likes?.length || 0);
  // 댓글 수 
  const [commentCount, setCommentCount] = useState(post?.commentCount || 0);

  // 댓글창 버튼
  const [openComments, setOpenComments] = useState(false);
  const toggleComments = () => setOpenComments(prev => !prev);

  // 이미지 원본 보기용 모달 상태
  const [openImageModal, setOpenImageModal] = useState(false);
  const [imageSrc, setImageSrc] = useState("");

  // 초기 좋아요 상태 설정 및 댓글 수 fetch
  useEffect(() => {
    if (post?.likes && currentUserId) {
      setLiked(post.likes.includes(currentUserId));
      setLikeCount(post.likes.length);
    }

    // 댓글 수 fetch
    fetch(`http://localhost:3010/comment/count/${post.id}`)
      .then(res => res.json())
      .then(data => {
        setCommentCount(data.count || 0);
      })
      .catch(err => console.error(err));

  }, [post, currentUserId]);

  if (!post) return null;

  // 좋아요(하트) 클릭 했을 때
  const handleLike = () => {
    if(liked){ 
      // 이미 좋아요 눌린 상태면 => 클릭 시 취소!
      fetch(`http://localhost:3010/feed/like/${post.id}/${currentUserId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      })
        .then(res => res.json())
        .then(data => {
          console.log("좋아요 취소 결과:", data);
          setLiked(false);
          setLikeCount(prev => prev - 1);
      });

    } else { // 좋아요 추가
      const param = { postId: post.id, userId: currentUserId };
      fetch("http://localhost:3010/feed/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(param)
      })
        .then(res => res.json())
        .then(data => {
          console.log("좋아요 추가 결과:", data);
          // 좋아요 토글
          setLiked(prev => !prev);
          setLikeCount(prev => liked ? prev - 1 : prev + 1);
        });
    }
  };

  //----------------------------------------------------------------

  const borderColor = post.type === "감사일기"
    ? "rgba(157, 195, 130, 0.5)"
    : "rgba(166, 123, 91, 0.5)";
  const cardBg = "rgba(255, 255, 255, 0.4)";

  return (
    <>
      <Card sx={{ width: '100%', borderRadius: 3, boxShadow: '0 8px 20px rgba(0,0,0,0.08)', backdropFilter: 'blur(8px)', backgroundColor: cardBg, mb: 3 }}>
        <CardHeader
          avatar={<Avatar sx={{ bgcolor: "rgba(166, 123, 91, 0.7)" }}>{post.userId?.[0] || "U"}</Avatar>}
          title={<Typography sx={{ fontWeight: 600, color: "#4B3B3B" }}>{post.type}</Typography>}
          subheader={<Typography sx={{ fontSize: 12, color: "#6B5E53" }}>{new Date(post.cdatetime).toLocaleString()}</Typography>}
        />

        {/* 게시글 이미지 */}
        {post.images && post.images.length > 0 && (
          <CardMedia
            component="img"
            image={post.images[0]}
            alt="post image"
            sx={{
              width: '100%',
              height: 'auto',          // 높이는 자동으로
              maxHeight: 300,          // 모달 내 적당한 최대 높이
              borderRadius: 2,
              mt: 1,
              objectFit: 'contain',    // 이미지 비율 유지, 잘리지 않음
              backgroundColor: '#f0f0f0', // 주변 여백 자연스럽게
              cursor: 'pointer'        // 클릭 가능 표시
            }}
            onClick={() => { setImageSrc(post.images[0]); setOpenImageModal(true); }}
          />
        )}

        {/* 게시글 내용 */}
        <CardContent sx={{ border: `2px solid ${borderColor}`, borderRadius: 2, p: 2, mt: 1, textAlign: 'left', backdropFilter: 'blur(5px)', backgroundColor: "rgba(255,255,255,0.3)" }}>
          {isEditing ? (
            post.type === "감사일기" && post.sections ? (
              post.sections.map((sec, index) => (
                <Box key={sec.sectionId} sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 500, color: "#A67B5B" }}>{sec.sectionType}</Typography>
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    value={editContent[index] || ""}
                    onChange={(e) => { const newContent = [...editContent]; newContent[index] = e.target.value; setEditContent(newContent); }}
                    sx={{ mt: 0.5, backgroundColor: "rgba(255,255,255,0.6)", borderRadius: 1 }}
                  />
                </Box>
              ))
            ) : (
              <TextField fullWidth multiline minRows={4} value={editContent[0] || ""} onChange={(e) => setEditContent([e.target.value])} sx={{ backgroundColor: "rgba(255,255,255,0.6)", borderRadius: 1 }} />
            )
          ) : (
            post.type === "감사일기" && post.sections ? (
              post.sections.map(sec => (
                <Box key={sec.sectionId} sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 500, color: "#A67B5B" }}>{sec.sectionType}</Typography>
                  <Typography sx={{ whiteSpace: "pre-line", color: "#4B3B3B" }}>{sec.content}</Typography>
                </Box>
              ))
            ) : (
              <Typography sx={{ whiteSpace: "pre-line", color: "#4B3B3B" }}>{post.content}</Typography>
            )
          )}
        </CardContent>     

        {/* 좋아요(하트), 댓글창 버튼 */}  
        <CardActions disableSpacing>
          <IconButton onClick={handleLike} aria-label="like" sx={{ color: liked ? "red" : "#A67B5B" }}>
            {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
          {/* 좋아요 수 표시 */}
          <Typography sx={{ ml: 1, color: "#4B3B3B" }}>{likeCount}</Typography>

          {viewMode !== "mine" && (
            <>
              <IconButton onClick={toggleComments} aria-label="comments" sx={{ color: "#A67B5B", ml: 1 }}>
                {openComments ? <ChatBubbleIcon /> : <ChatBubbleOutlineIcon />}
              </IconButton>
              <Typography sx={{ ml: 1, color: "#4B3B3B" }}>{commentCount}</Typography>
            </>
          )}
        </CardActions>

        {/* 댓글창 열리는 공간 */}
        {openComments && (
          <CardContent sx={{ p: 0, pt: 1 }}>
            <Box sx={{ p: 2 }}>
              {/* commentCount 갱신 콜백 전달 */}
              <CommentList postId={post.id} onCommentCountChange={setCommentCount} />
            </Box>
          </CardContent>
        )} 
      </Card>

      {/* 이미지 원본 보기 모달 */}
      <Dialog open={openImageModal} onClose={() => setOpenImageModal(false)} maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
          <img 
            src={imageSrc} 
            alt="원본 이미지" 
            style={{
              maxWidth: '95vw',  // 화면 비율에 맞춰 최대 너비
              maxHeight: '95vh', // 화면 비율에 맞춰 최대 높이
              width: 'auto',
              height: 'auto',
            }}
          />
        </Box>
      </Dialog>
    </>
  );
}
