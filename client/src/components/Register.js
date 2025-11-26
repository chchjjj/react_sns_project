import React from 'react';
import {
  TextField, Button, Container, Typography, Box, InputLabel, 
  Radio, RadioGroup, FormControl, FormControlLabel, FormLabel, 
  Select, MenuItem, Avatar, IconButton,} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { useRef } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import {jwtDecode} from "jwt-decode";

function Register() {
  const [files, setFile] = React.useState([]);
  const [diaryType, setDiaryType] = React.useState('감사'); // '감사' 또는 '일상'
  const [openType, setOpenType] = React.useState('H'); // 공개여부 (H: Hidden, P: Public)

  const handleFileChange = (event) => {
    setFile(event.target.files); // 원래.files[0] 이었는데 이미지 여러개 할거라 [0] 지움
  };

  // 추가: 라디오 버튼 변경 핸들러 (감사일기 or 일상일기)
  const handleDiaryTypeChange = (event) => {
    setDiaryType(event.target.value);
  };

  // 새로운 핸들러 함수 추가: 공개 여부 
  const handleOpenTypeChange = (event) => {
    setOpenType(event.target.value);
  };

  let contentRef = useRef(null); // 공통내용
  let gratitudeRef = useRef(null); // 감사 내용 Ref
  let reflectionRef = useRef(null); // 반성 내용 Ref
  let hopeRef = useRef(null);       // 소망 내용 Ref
  let navigate = useNavigate();


  // '등록하기' 버튼 눌렀을 때
  function onRegister(){
      if(files.length == 0){
        alert("사진을 등록해주세요.");
        return;
      }

      const token = localStorage.getItem("token");
      const decoded = jwtDecode(token);
      let param = {};
      let postData = {          
          userId : decoded.userId,
          visibility: openType, // 공개여부
          category: diaryType === '감사' ? '감사일기' : '일상일기'
      }

      if (diaryType === '감사') {
        // 1) '감사일기'인 경우 (PRO_TBL_POST_SECTION 사용)
        postData.content = null; // PRO_TBL_POST에는 null 또는 빈 값 저장
        
        // 섹션 데이터를 배열로 구성
        const sections = [
            { type: '감사', content: gratitudeRef.current?.value || '' },
            { type: '반성', content: reflectionRef.current?.value || '' },
            { type: '소망', content: hopeRef.current?.value || '' },
        ].filter(s => s.content.trim() !== ''); // 내용이 비어있지 않은 섹션만 전송

        param = {
            post: postData,
            sections: sections, // 💡 PRO_TBL_POST_SECTION에 들어갈 데이터
        };
        
        if (sections.length === 0) {
            alert("감사일기는 최소한 하나의 내용을 작성해야 합니다.");
            return;
        }

    } else {
        // 2) '일상일기'인 경우 (PRO_TBL_POST의 CONTENT 사용)
        const content = contentRef.current?.value;

        if (!content || content.trim() === '') {
            alert("일상일기 내용을 입력해주세요.");
            return;
        }

        postData.content = content; // PRO_TBL_POST의 CONTENT에 내용 저장
        
        param = {
            post: postData,
            sections: [], // 💡 PRO_TBL_POST_SECTION을 사용하지 않음을 명시 (서버 로직에 따라 생략 가능)
        };
    }

      // --- 서버 통신 시작 --- 
      // 💡 참고: 서버의 POST 엔드포인트가 'feed' 하나로 
      // PRO_TBL_POST와 PRO_TBL_POST_SECTION 모두 처리해야 함!
      fetch("http://localhost:3010/feed", {
          method : "POST",
          // 헤더랑 바디는 PUT 또는 POST 형태일 때 들어감
          headers : {"Content-type" : "application/json"},
          body : JSON.stringify(param) // JSON 형태로 타입을 변환하여 보내주는 것임
      })
        .then(res => res.json())
        .then(data => {
             if (data.result && data.result.insertId) {
                  console.log(data.msg);
                  const feedId = data.result.insertId;
                  // 💡 새로운 if 문: 이미지 첨부 여부 확인
                   if (files.length > 0) {
                      // 케이스 1: 이미지가 있는 경우 (fnUploadFile 실행)
                      fnUploadFile(feedId); 
                   } else {
                      // 케이스 2: 이미지가 없는 경우 (즉시 완료 처리)
                      alert("게시글이 등록되었습니다.");
                      navigate("/feed"); // 💡 메인 화면으로 이동
                   } 
              } else {
                  alert("게시글 저장에 실패했습니다.");
              }    
        }) 

        const fnUploadFile = (feedId)=>{
            const formData = new FormData();
            for(let i=0; i<files.length; i++){
                formData.append("file", files[i]); 
            } 
            formData.append("feedId", feedId);
            fetch("http://localhost:3010/feed/upload", {
                method: "POST",
                body: formData
             })
              .then(res => res.json())
              .then(data => {
                  console.log(data);
                  alert("게시글이 등록되었습니다.");
                  //navigate("/feed"); // 원하는 경로
              })
              .catch(err => {
                  console.error(err);
               });
         }
  }

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="flex-start" // 상단 정렬
        minHeight="100vh"
        sx={{ padding: '20px' }} // 배경색 없음
      >
        <Typography variant="h4" gutterBottom>
          기록하기
        </Typography>

        <FormControl fullWidth margin="normal">
             <FormLabel id="demo-row-radio-buttons-group-label">어떤 내용을 기록할까요?</FormLabel>
            <RadioGroup
              row
              aria-labelledby="demo-row-radio-buttons-group-label"
              name="row-radio-buttons-group"
              value={diaryType} // 💡 현재 상태를 연결
              onChange={handleDiaryTypeChange} // 💡 변경 핸들러를 연결
            >
              <FormControlLabel value="감사" control={<Radio />} label="감사일기" />
              <FormControlLabel value="일상" control={<Radio />} label="일상일기" />
            </RadioGroup>
        </FormControl>

        <TextField label="제목" variant="outlined" margin="normal" fullWidth />

        {/* 💡 조건부 렌더링 적용 시작 */}
        {diaryType === '감사' && ( // 감사일기 전용 내용 입력 필드
          <>
            <TextField
              inputRef={gratitudeRef}
              label="오늘 감사했던 일"
              variant="outlined" margin="normal" fullWidth multiline rows={4}
            />

            <TextField
              inputRef={reflectionRef}
              label="오늘 반성했던 일"
              variant="outlined" margin="normal" fullWidth multiline rows={4}
            />

            <TextField
              inputRef={hopeRef}
              label="이루고 싶은 소망 또는 목표"
              variant="outlined" margin="normal" fullWidth multiline rows={4}
            />
          </>
        )}

        {diaryType === '일상' && (
          <> 
            <TextField // 일상일기 전용 내용 입력 필드
              inputRef={contentRef}
              label="오늘 있었던 일이나 생각"
              variant="outlined" margin="normal"
              fullWidth multiline rows={10}              
            />
          </>
        )}
        {/* 💡 조건부 렌더링 적용 끝 */}
        

        <Box display="flex" alignItems="center" margin="normal" fullWidth>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="file-upload"
            type="file"
            onChange={handleFileChange}
            multiple // 이미지 여러개 선택 가능 (이거 없으면 1개만 선택가능)
          />
          <label htmlFor="file-upload">
            <IconButton color="primary" component="span">
              <PhotoCamera />
            </IconButton>
          </label>
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


        {/* 공개여부 묻기 */}
        <FormControl fullWidth margin="normal">
             <FormLabel id="demo-row-radio-buttons-group-label">공개여부</FormLabel>
            <RadioGroup
              row
              aria-labelledby="demo-row-radio-buttons-group-label"
              name="row-radio-buttons-group"
              value={openType} // 💡 현재 상태를 연결
              onChange={handleOpenTypeChange} // 💡 변경 핸들러를 연결
            >
              <FormControlLabel value="P" control={<Radio />} label="공개" />
              <FormControlLabel value="H" control={<Radio />} label="비공개" />
            </RadioGroup>
        </FormControl>

        <Button onClick={onRegister} variant="contained" color="primary" fullWidth style={{ marginTop: '20px' }}>
          등록하기
        </Button>
      </Box>
    </Container>
  );
}

export default Register;