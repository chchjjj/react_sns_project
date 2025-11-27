import * as React from 'react';
import {
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  CardActions,
  Box,
  Typography,
  IconButton,
  Avatar,
  TextField
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";

export default function PostDetailCard({ post, isEditing, editContent, setEditContent }) {
  if (!post) return null;

  // 자연스럽고 투명한 테두리 색상
  const borderColor = post.type === "감사일기"
    ? "rgba(157, 195, 130, 0.5)" // 연두 투명
    : "rgba(166, 123, 91, 0.5)"; // 브라운 투명

  // 카드 배경
  const cardBg = "rgba(255, 255, 255, 0.4)";

  return (
    <Card
      sx={{
        width: '100%',
        borderRadius: 3,
        boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
        backdropFilter: 'blur(8px)',
        backgroundColor: cardBg,
        mb: 3
      }}
    >
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: "rgba(166, 123, 91, 0.7)" }}>
            {post.userId?.[0] || "U"}
          </Avatar>
        }
        title={
          <Typography sx={{ fontWeight: 600, color: "#4B3B3B" }}>
            {post.type}
          </Typography>
        }
        subheader={
          <Typography sx={{ fontSize: 12, color: "#6B5E53" }}>
            {new Date(post.cdatetime).toLocaleString()}
          </Typography>
        }
      />

      {post.images && post.images.length > 0 && (
        <CardMedia
          component="img"
          image={post.images[0]}
          alt="post image"
          sx={{
            width: '100%',
            aspectRatio: '4/3',
            objectFit: "cover",
            borderRadius: 2,
            mt: 1
          }}
        />
      )}

      <CardContent
        sx={{
          border: `2px solid ${borderColor}`,
          borderRadius: 2,
          p: 2,
          mt: 1,
          textAlign: 'left',
          backdropFilter: 'blur(5px)',
          backgroundColor: "rgba(255,255,255,0.3)"
        }}
      >
        {isEditing ? (
          post.type === "감사일기" && post.sections ? (
            post.sections.map((sec, index) => (
              <Box key={sec.sectionId} sx={{ mb: 1 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 500, color: "#A67B5B" }}
                >
                  {sec.sectionType}
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  value={editContent[index] || ""}
                  onChange={(e) => {
                    const newContent = [...editContent];
                    newContent[index] = e.target.value;
                    setEditContent(newContent);
                  }}
                  sx={{
                    mt: 0.5,
                    backgroundColor: "rgba(255,255,255,0.6)",
                    borderRadius: 1
                  }}
                />
              </Box>
            ))
          ) : (
            <TextField
              fullWidth
              multiline
              minRows={4}
              value={editContent[0] || ""}
              onChange={(e) => setEditContent([e.target.value])}
              sx={{
                backgroundColor: "rgba(255,255,255,0.6)",
                borderRadius: 1
              }}
            />
          )
        ) : (
          post.type === "감사일기" && post.sections ? (
            post.sections.map(sec => (
              <Box key={sec.sectionId} sx={{ mb: 1 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 500, color: "#A67B5B" }}
                >
                  {sec.sectionType}
                </Typography>
                <Typography sx={{ whiteSpace: "pre-line", color: "#4B3B3B" }}>
                  {sec.content}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography sx={{ whiteSpace: "pre-line", color: "#4B3B3B" }}>
              {post.content}
            </Typography>
          )
        )}
      </CardContent>

      <CardActions disableSpacing>
        <IconButton aria-label="like" sx={{ color: "#A67B5B" }}>
          <FavoriteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
}
