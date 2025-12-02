import React, { useState, useEffect } from 'react';
import {
  TextField, Button, Container, Typography, Box, FormControl,
  FormLabel, RadioGroup, FormControlLabel, Radio, Avatar, IconButton
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function Edit() {
  const [files, setFiles] = useState([]);
  const [diaryType, setDiaryType] = useState('감사');
  const [openType, setOpenType] = useState('H');
  const [existingImages, setExistingImages] = useState([]);

  const [gratitude, setGratitude] = useState('');
  const [reflection, setReflection] = useState('');
  const [hope, setHope] = useState('');
  const [content, setContent] = useState('');

  // 💡 [추가] Section ID를 저장할 상태
  const [sectionIds, setSectionIds] = useState({});

  const { postId } = useParams();
  const navigate = useNavigate();

  const handleFileChange = (e) => setFiles(e.target.files);
  const handleDiaryTypeChange = (e) => setDiaryType(e.target.value);
  const handleOpenTypeChange = (e) => setOpenType(e.target.value);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인 후 이용해주세요.");
      navigate("/Login");
      return;
    }

    fetch(`http://localhost:3010/feed/post/${postId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.result === "success" && data.post) {
          const post = data.post;
          setDiaryType(post.type.includes('감사') ? '감사' : '일상');
          setOpenType(post.visibility || 'H');
          setExistingImages(post.images || []);

          if (post.type.includes('감사') && post.sections) {
            // 💡 [수정] ID를 저장할 임시 맵 생성
            const idsMap = {};
            post.sections.forEach(s => {
                if (s.sectionType === '감사') {
                    setGratitude(s.content || '');
                    idsMap['감사'] = s.sectionId;
                } else if (s.sectionType === '반성') {
                    setReflection(s.content || '');
                    idsMap['반성'] = s.sectionId;
                } else if (s.sectionType === '소망') {
                    setHope(s.content || '');
                    idsMap['소망'] = s.sectionId;
                }
            });
            // 💡 [추가] 상태 업데이트
            setSectionIds(idsMap);
          } else {
            setContent(post.content || '');
          }

          //   setGratitude(post.sections.find(s => s.sectionType === '감사')?.content || '');
          //   setReflection(post.sections.find(s => s.sectionType === '반성')?.content || '');
          //   setHope(post.sections.find(s => s.sectionType === '소망')?.content || '');
          // } else {
          //   setContent(post.content || '');
          // }
        } else {
          alert("게시글을 불러오지 못했습니다.");
        }
      })
      .catch(err => {
        console.error(err);
        alert("게시글 로딩 중 오류가 발생했습니다.");
      });
  }, [postId, navigate]);

  const handleUpdate = () => {
    const token = localStorage.getItem("token");
    const decoded = jwtDecode(token);

    let postData = {
      userId: decoded.userId,
      visibility: openType,
      category: diaryType === '감사' ? '감사일기' : '일상일기'
    };

    let sections = [];
    if (diaryType === '감사') { // 감사일기라면
      postData.content = null;
      sections = [
        // 💡 [수정] sectionId 추가
        { type: '감사', content: gratitude, sectionId: sectionIds['감사'] },
        { type: '반성', content: reflection, sectionId: sectionIds['반성'] },
        { type: '소망', content: hope, sectionId: sectionIds['소망'] },
      ].filter(s => s.content.trim() !== '' && s.sectionId); 
      // ID가 있는 섹션만 필터링 (안전장치)

      if (sections.length === 0) {
        alert("감사일기는 최소한 하나의 내용을 작성해야 합니다.");
        return;
      }
    } else { // 일상일기라면
      postData.content = content;
      if (!postData.content || postData.content.trim() === '') {
        alert("일상일기 내용을 입력해주세요.");
        return;
      }
    }

    // 수정 반영
    fetch(`http://localhost:3010/feed/${postId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ post: postData, sections })
    })
      .then(res => res.json())
      .then(data => {
        if (data.result) {
          if (files.length > 0) {
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) formData.append("file", files[i]);
            formData.append("feedId", postId);
            // 사진 업로드
            fetch("http://localhost:3010/feed/upload", { method: "POST", body: formData })
              .then(res => res.json())
              .then(_ => {
                alert("게시글이 수정되었습니다.");
                navigate("/feed");
              })
              .catch(err => console.error(err));
          } else {
            alert("게시글이 수정되었습니다.");
            navigate("/feed");
          }
        } else {
          alert("수정 실패: " + data.msg);
        }
      })
      .catch(err => {
        console.error(err);
        alert("서버 통신 중 오류가 발생했습니다.");
      });
  };

  return (
    <Container maxWidth="sm">
      <Box display="flex" flexDirection="column" alignItems="center" minHeight="100vh" sx={{ padding: '20px' }}>
        <Typography variant="h4" gutterBottom>게시글 수정</Typography>

        <FormControl fullWidth margin="normal">
          <FormLabel>어떤 내용을 기록할까요?</FormLabel>
          <RadioGroup row value={diaryType} onChange={handleDiaryTypeChange}>
            <FormControlLabel value="감사" control={<Radio />} label="감사일기" />
            <FormControlLabel value="일상" control={<Radio />} label="일상일기" />
          </RadioGroup>
        </FormControl>

        {diaryType === '감사' && (
          <>
            <TextField value={gratitude} onChange={e => setGratitude(e.target.value)}
              label="오늘 감사했던 일" variant="outlined" margin="normal" fullWidth multiline rows={4} />
            <TextField value={reflection} onChange={e => setReflection(e.target.value)}
              label="오늘 반성했던 일" variant="outlined" margin="normal" fullWidth multiline rows={4} />
            <TextField value={hope} onChange={e => setHope(e.target.value)}
              label="이루고 싶은 소망 또는 목표" variant="outlined" margin="normal" fullWidth multiline rows={4} />
          </>
        )}

        {diaryType === '일상' && (
          <TextField value={content} onChange={e => setContent(e.target.value)}
            label="오늘 있었던 일이나 생각" variant="outlined" margin="normal" fullWidth multiline rows={10} />
        )}

        <Box display="flex" alignItems="center" margin="normal" fullWidth>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="file-upload"
            type="file"
            onChange={handleFileChange}
            multiple
          />
          <label htmlFor="file-upload">
            <IconButton color="primary" component="span"><PhotoCamera /></IconButton>
          </label>

          {existingImages.length > 0 && (
            <Avatar
              alt="기존 이미지"
              src={existingImages[0].imgPath}
              sx={{ width: 56, height: 56, marginLeft: 2 }}
            />
          )}

          {files.length > 0 && (
            <Avatar
              alt="첨부된 이미지"
              src={URL.createObjectURL(files[0])}
              sx={{ width: 56, height: 56, marginLeft: 2 }}
            />
          )}

          <Typography variant="body1" sx={{ marginLeft: 2 }}>
            {files.length > 0 ? files[0].name : '첨부할 파일 선택'}
          </Typography>
        </Box>

        {/* {diaryType === '감사' && (
          <FormControl fullWidth margin="normal">
            <FormLabel>공개여부</FormLabel>
            <RadioGroup row value={openType} onChange={handleOpenTypeChange}>
              <FormControlLabel value="P" control={<Radio />} label="공개" />
              <FormControlLabel value="H" control={<Radio />} label="비공개" />
            </RadioGroup>
          </FormControl>
        )} */}

        
          <FormControl fullWidth margin="normal">
            <FormLabel>공개여부</FormLabel>
            <RadioGroup row value={openType} onChange={handleOpenTypeChange}>
              <FormControlLabel value="P" control={<Radio />} label="공개" />
              <FormControlLabel value="H" control={<Radio />} label="비공개" />
            </RadioGroup>
          </FormControl>
        

        <Button onClick={handleUpdate} variant="contained" color="primary" fullWidth sx={{ marginTop: '20px' }}>
          수정하기
        </Button>
      </Box>
    </Container>
  );
}

export default Edit;
