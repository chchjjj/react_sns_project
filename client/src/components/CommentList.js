import { useEffect, useState, useRef } from "react";
import { Box, TextField, Button, List, ListItem, 
          ListItemAvatar, Avatar, ListItemText, Typography, IconButton, Paper, Popper, Grow, ClickAwayListener, MenuList, MenuItem } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { jwtDecode } from "jwt-decode";

// 로그인 시 저장한 token
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

export default function CommentList({ postId, onCommentCountChange }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [followingList, setFollowingList] = useState([]); // 현재 내가 팔로우 중인 사람들
  const anchorRefs = useRef({});
  const currentUserId = getCurrentUserId();

  // 1) 댓글 불러오기
  const fetchComments = () => {
    fetch(`http://localhost:3010/comment/${postId}`)
      .then((res) => res.json())
      .then((data) => {
        const list = data.user ? [data.user] : [];
        setComments(list);
        if (onCommentCountChange) onCommentCountChange(list.length); // 댓글수 갱신
      })
      .catch((err) => console.error("댓글 불러오기 실패:", err));
  };

  // 2) 새 댓글 작성
  const handleAddComment = () => {
    if (!newComment.trim()) return;

    let param = {
      postId,
      userId: currentUserId,
      content: newComment,
    };

    fetch("http://localhost:3010/comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(param),
    })
      .then((res) => res.json())
      .then(() => {
        setNewComment("");
        fetchComments(); // 새 댓글 추가 후 목록 갱신
      })
      .catch((err) => console.error("댓글 등록 실패:", err));
  };

  // 3) 댓글 삭제
  const handleDeleteComment = (commId) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;

    fetch(`http://localhost:3010/comment/${commId}`, {
      method: "DELETE",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token")
      },
    })
      .then((res) => res.json())
      .then(() => fetchComments())
      .catch((err) => console.error("댓글 삭제 실패:", err));
  };

  // 4) 내 팔로우 목록 불러오기
  const fetchFollowingList = () => {
    if (!currentUserId) return;
    fetch(`http://localhost:3010/user/${currentUserId}/following`)
      .then((res) => res.json())
      .then((data) => {
        const list = data.user?.map((item) => item.FOLLOWING_ID) || [];
        setFollowingList(list);
      })
      .catch((err) => console.error("팔로잉 목록 불러오기 실패:", err));
  };

  // 5) 팔로우/언팔로우 토글 (서버 순서 맞춤: targetUserId 먼저)
  const toggleFollow = async (targetUserId) => {
    if (!currentUserId) return;

    if (followingList.includes(targetUserId)) {
      // 언팔로우: 서버가 현재 [followId, userId] 순서로 받도록 되어 있음
      await fetch(`http://localhost:3010/user/unfollow`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUserId, followId: currentUserId }),
      });
    } else {
      // 팔로우: 서버 순서 맞춰 targetUserId 먼저
      await fetch(`http://localhost:3010/user/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUserId, followId: currentUserId }),
      });
    }

    fetchFollowingList(); // 상태 갱신
    setOpenMenuId(null);
  };

  // 6) 메뉴 토글 & 닫기
  const handleToggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleCloseMenu = (event, id) => {
    if (anchorRefs.current[id] && anchorRefs.current[id].contains(event.target)) return;
    setOpenMenuId(null);
  };

  const handleListKeyDown = (event) => {
    if (event.key === "Tab" || event.key === "Escape") setOpenMenuId(null);
  };

  // 7) 초기 불러오기
  useEffect(() => {
    if (postId) fetchComments();
    fetchFollowingList();
  }, [postId]);

  return (
    <Box sx={{ p: 2 }}>
      {/* 상단: 새 댓글 작성 */}
      <Typography variant="h6" sx={{ mb: 1 }}>댓글</Typography>

      <TextField
        label="댓글을 입력하세요"
        variant="outlined"
        fullWidth
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={handleAddComment} sx={{ mt: 1 }}>
        댓글 추가
      </Button>

      {/* 하단: 댓글 목록 */}
      <List sx={{ mt: 2 }}>
        {comments.map((comment) => (
          <ListItem key={comment.COMM_ID} 
                    secondaryAction={comment.USER_ID === currentUserId && (
                      <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteComment(comment.COMM_ID)}>
                        <DeleteIcon />
                      </IconButton>
                    )}>
            {/* 아바타 클릭 시 메뉴 팝업 */}
            <ListItemAvatar>
              <Box
                ref={(el) => (anchorRefs.current[comment.COMM_ID] = el)}
                onClick={() => handleToggleMenu(comment.COMM_ID)}
                sx={{ cursor: "pointer", display: "inline-block" }}
              >
                <Avatar>{comment.USER_ID?.charAt(0).toUpperCase()}</Avatar>
              </Box>

              <Popper
                open={openMenuId === comment.COMM_ID}
                anchorEl={anchorRefs.current[comment.COMM_ID]}
                placement="bottom-start"
                transition
                disablePortal
              >
                {({ TransitionProps, placement }) => (
                  <Grow
                    {...TransitionProps}
                    style={{
                      transformOrigin: placement === "bottom-start" ? "left top" : "left bottom",
                    }}
                  >
                    <Paper>
                      <ClickAwayListener onClickAway={(e) => handleCloseMenu(e, comment.COMM_ID)}>
                        <MenuList autoFocusItem={openMenuId === comment.COMM_ID} onKeyDown={handleListKeyDown}>
                          <MenuItem onClick={() => toggleFollow(comment.USER_ID)}>
                            {followingList.includes(comment.USER_ID) ? "팔로우 취소" : "팔로우"}
                          </MenuItem>
                          <MenuItem onClick={() => { console.log("메세지 보내기 클릭"); setOpenMenuId(null); }}>
                            메세지 보내기
                          </MenuItem>
                        </MenuList>
                      </ClickAwayListener>
                    </Paper>
                  </Grow>
                )}
              </Popper>
            </ListItemAvatar>

            <ListItemText
              primary={comment.CONTENT}
              secondary={comment.USER_ID}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
