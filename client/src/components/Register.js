import React, { useRef, useEffect } from 'react';
import {
  TextField, Button, Container, Typography, Box, FormControl, FormLabel, 
  Radio, RadioGroup, FormControlLabel, Avatar, IconButton
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function Register() {
  const [files, setFiles] = React.useState([]);
  const [diaryType, setDiaryType] = React.useState('감사'); // '감사' 또는 '일상'
  const [openType, setOpenType] = React.useState('H'); // 공개여부
  const [previewUrl, setPreviewUrl] = React.useState(null);

  const contentRef = useRef(null);
  const gratitudeRef = useRef(null);
  const reflectionRef = useRef(null);
  const hopeRef = useRef(null);

  const navigate = useNavigate();

  // 파일 선택 핸들러
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files); // FileList → Array
    setFiles(selectedFiles);

    // 미리보기 URL
    if (selectedFiles.length > 0 && selectedFiles[0] instanceof File) {
      setPreviewUrl(URL.createObjectURL(selectedFiles[0]));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDiaryTypeChange = (e) => setDiaryType(e.target.value);
  const handleOpenTypeChange = (e) => setOpenType(e.target.value);

  // 게시글 등록
  const onRegister = () => {

    if(files.length == 0){
        alert("사진을 등록해주세요.");
        return;
      }
      
    if (diaryType === '일상' && (!contentRef.current?.value.trim())) {
      alert("일상일기 내용을 입력해주세요.");
      return;
    }

    if (diaryType === '감사') {
      const sections = [
        { type: '감사', content: gratitudeRef.current?.value || '' },
        { type: '반성', content: reflectionRef.current?.value || '' },
        { type: '소망', content: hopeRef.current?.value || '' },
      ].filter(s => s.content.trim() !== '');
      if (sections.length === 0) {
        alert("감사일기는 최소한 하나의 내용을 작성해야 합니다.");
        return;
      }
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인 후 이용해주세요.");
      navigate("/");
      return;
    }

    const decoded = jwtDecode(token);

    // 서버 전송용 데이터 구성
    const postData = {
      userId: decoded.userId,
      visibility: openType,
      category: diaryType === '감사' ? '감사일기' : '일상일기',
      content: diaryType === '일상' ? contentRef.current.value : null
    };

    let param = {
      post: postData,
      sections: diaryType === '감사' ? [
        { type: '감사', content: gratitudeRef.current.value },
        { type: '반성', content: reflectionRef.current.value },
        { type: '소망', content: hopeRef.current.value },
      ].filter(s => s.content.trim() !== '') : []
    };

    fetch("http://localhost:3010/feed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(param)
    })
    .then(res => res.json())
    .then(data => {
      if (data.result?.insertId) {
        const feedId = data.result.insertId;

        if (files.length > 0) {
          const formData = new FormData();
          files.forEach(file => formData.append("file", file));
          formData.append("feedId", feedId);

          fetch("http://localhost:3010/feed/upload", {
            method: "POST",
            body: formData
          })
          .then(res => res.json())
          .then(() => {
            alert("게시글이 등록되었습니다.");
            navigate("/feed");
          })
          .catch(err => console.error(err));
        } else {
          alert("게시글이 등록되었습니다.");
          navigate("/feed");
        }
      } else {
        alert("게시글 저장에 실패했습니다.");
      }
    })
    .catch(err => console.error(err));
  };

  return (
    <Container maxWidth="sm">
      <Box display="flex" flexDirection="column" alignItems="center" minHeight="100vh" sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>기록하기</Typography>

        <FormControl fullWidth margin="normal">
          <FormLabel>어떤 내용을 기록할까요?</FormLabel>
          <RadioGroup row value={diaryType} onChange={handleDiaryTypeChange}>
            <FormControlLabel value="감사" control={<Radio />} label="감사일기" />
            <FormControlLabel value="일상" control={<Radio />} label="일상일기" />
          </RadioGroup>
        </FormControl>

        {diaryType === '감사' && (
          <>
            <TextField inputRef={gratitudeRef} label="오늘 감사했던 일" fullWidth multiline rows={4} margin="normal" />
            <TextField inputRef={reflectionRef} label="오늘 반성했던 일" fullWidth multiline rows={4} margin="normal" />
            <TextField inputRef={hopeRef} label="이루고 싶은 소망 또는 목표" fullWidth multiline rows={4} margin="normal" />
          </>
        )}

        {diaryType === '일상' && (
          <TextField inputRef={contentRef} label="오늘 있었던 일이나 생각" fullWidth multiline rows={10} margin="normal" />
        )}

        <Box display="flex" alignItems="center" margin="normal">
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="file-upload"
            type="file"
            onChange={handleFileChange}
            multiple
          />
          <label htmlFor="file-upload">
            <IconButton color="primary" component="span">
              <PhotoCamera />
            </IconButton>
          </label>
          {previewUrl && <Avatar alt="첨부된 이미지" src={previewUrl} sx={{ width: 56, height: 56, ml: 2 }} />}
          <Typography variant="body1" sx={{ ml: 2 }}>
            {files.length > 0 ? files[0].name : '첨부할 파일 선택'}
          </Typography>
        </Box>

        <FormControl fullWidth margin="normal">
          <FormLabel>공개여부</FormLabel>
          <RadioGroup row value={openType} onChange={handleOpenTypeChange}>
            <FormControlLabel value="P" control={<Radio />} label="공개" />
            <FormControlLabel value="H" control={<Radio />} label="비공개" />
          </RadioGroup>
        </FormControl>

        <Button onClick={onRegister} variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          등록하기
        </Button>
      </Box>
    </Container>
  );
}

export default Register;
