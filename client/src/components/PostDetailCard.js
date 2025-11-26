// PostDetailCard.js
import * as React from 'react';
import { Card, CardHeader, CardMedia, CardContent, CardActions, Box, Typography, IconButton, Avatar, TextField } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { red } from "@mui/material/colors";

export default function PostDetailCard({ post, isEditing, editContent, setEditContent }) {
  if (!post) return null;

  const borderColor = post.type === "감사일기" ? "#90caf9" : "#a5d6a7";

  return (
    <Card sx={{ width: '100%' }}>
      <CardHeader
        avatar={<Avatar sx={{ bgcolor: red[500] }}>{post.userId?.[0] || "U"}</Avatar>}
        title={post.type}
        subheader={new Date(post.cdatetime).toLocaleString()}
      />

      {post.images && post.images.length > 0 && (
        <CardMedia
          component="img"
          height="260"
          image={post.images[0]}
          alt="post image"
          sx={{ objectFit: "cover" }}
        />
      )}

      <CardContent sx={{ border: `2px solid ${borderColor}`, borderRadius: 2, p: 2, mt: 1, textAlign: 'left' }}>
        {isEditing ? (
          post.type === "감사일기" && post.sections ? (
            post.sections.map((sec, index) => (
              <Box key={sec.sectionId} sx={{ mb: 1 }}>
                <Typography variant="subtitle2">{sec.sectionType}</Typography>
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
            />
          )
        ) : (
          post.type === "감사일기" && post.sections ? (
            post.sections.map(sec => (
              <Box key={sec.sectionId} sx={{ mb: 1 }}>
                <Typography variant="subtitle2">{sec.sectionType}</Typography>
                <Typography sx={{ whiteSpace: "pre-line" }}>{sec.content}</Typography>
              </Box>
            ))
          ) : (
            <Typography sx={{ whiteSpace: "pre-line" }}>{post.content}</Typography>
          )
        )}
      </CardContent>

      <CardActions disableSpacing>
        <IconButton aria-label="like">
          <FavoriteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
}
