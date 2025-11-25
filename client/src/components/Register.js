import React from 'react';
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  Avatar,
  IconButton,
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { useRef } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import {jwtDecode} from "jwt-decode";

function Register() {
  const [files, setFile] = React.useState([]);

  const handleFileChange = (event) => {
    setFile(event.target.files); // 원래.files[0] 이었는데 이미지 여러개 할거라 [0] 지움
  };

  let contentRef = useRef(null);
  let navigate = useNavigate();

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
          등록
        </Typography>

        <FormControl fullWidth margin="normal">
          <InputLabel>카테고리</InputLabel>
          <Select defaultValue="" label="카테고리">
            <MenuItem value={1}>일상</MenuItem>
            <MenuItem value={2}>여행</MenuItem>
            <MenuItem value={3}>음식</MenuItem>
          </Select>
        </FormControl>

        <TextField label="제목" variant="outlined" margin="normal" fullWidth />
        <TextField
          inputRef={contentRef}
          label="내용"
          variant="outlined"
          margin="normal"
          fullWidth
          multiline
          rows={4}
        />

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
        
        {/* 피드 새로 등록하기 (선생님은 함수 따로 빼심) */}
        <Button onClick={()=>{
            if(files.length == 0){
                alert("이미지를 선택해주세요.");
                return;
            }
            const token = localStorage.getItem("token");
            const decoded = jwtDecode(token);
            let param = {
                content : contentRef.current.value,
                userId : decoded.userId
            }

            // tbl_feed 테이블에 저장하기
            fetch("http://localhost:3010/feed", {
                method : "POST",
                // 헤더랑 바디는 PUT 또는 POST 형태일 때 들어감
                headers : {
                    "Content-type" : "application/json"
                        // 이건 약속된 정보 
                },
                body : JSON.stringify(param) //
                // JSON 형태로 타입을 변환하여 보내주는 것임
            })
                .then(res => res.json())
                .then(data => {
                    console.log(data); 
                    //alert("저장되었습니다.");   
                    fnUploadFile(data.result[0].insertId)     
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
                      //navigate("/feed"); // 원하는 경로
                    })
                    .catch(err => {
                      console.error(err);
                    });
                }
        }} variant="contained" color="primary" fullWidth style={{ marginTop: '20px' }}>
          등록하기
        </Button>
      </Box>
    </Container>
  );
}

export default Register;