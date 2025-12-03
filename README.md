# 🌼 Momentiary (모멘티어리) 
> 혼자서도, 함께해도 좋은 일상의 소소한 감사 기록
***
![대표사진](https://github.com/chchjjj/react_sns_project/blob/main/images/main.JPG)


## 🍀 프로젝트 소개
모멘티어리는 순간(moment) + 다이어리(diary)의 합성어로,


사진 한 장과 함께 **일상의 순간을 기록하고 감사하며, 또 다른 사람들과 나눌 수 있는** 사이트입니다.


- 피드 종류를 나누어 1) 감사/반성/소망을 말하거나, 2) 일상 기록용으로 사용 가능
- 공개 여부에 따라 자신만의 프라이빗한 다이어리로 활용하거나 다른 사람과의 SNS로 사용
- 랜덤피드를 통해 다른 사용자들의 기록을 보며 응원(댓글)하고, 팔로우하며, 개별 메세지 발송 가능
***
## 📆 개발 기간
- 25.11.25 ~ 25.12.02 (1주일)
***
## ✨ 개발 목적
- 감사 일기의 효과가 여러 매체를 통해 알려지면서, 간단하게 긍정적 하루를 기록할 수 있는 공간을 만들고자 함
- 바쁜 현대인을 위해 불필요한 요소를 제거하고 핵심 기능만 남긴 조용한 SNS로 설계
- 일상 기록과 감사 표현을 모두 수용하는 가벼운 형태의 개인 기록 공간
- 복잡한 사회 속에서 현대인들의 긍정적 루틴 형성과 서로에게 작은 위로가 되었으면 함
***
## 🛠 사용 기술
- 프론트앤드 : React, MUI
- 백엔드 : Node.js, Express
- 데이터베이스 : MySQL
- 기타 : JWT, Bcrypt
***
## 📌 주요 기능
### **1.  피드 기록**
![등록](https://github.com/chchjjj/react_sns_project/blob/main/images/register.JPG)
 - 사용자는 하루의 감사/반성/소망을 얘기하거나, 일상 기록용으로 선택 가능
 - 사진 한 장을 항상 첨부하여 그 날의 하루를 시각적으로도 기록할 수 있도록 함
 - 공개/비공개를 통해 혼자만의 일기장으로도, 다른 사람과 공유할 수 있는 SNS로도 활용 가능
   

***
### **2.  내 기록 모아보기**
![피드](https://github.com/chchjjj/react_sns_project/blob/main/images/feed.JPG)


![피드상세](https://github.com/chchjjj/react_sns_project/blob/main/images/feedDetail.JPG)


![사진클릭](https://github.com/chchjjj/react_sns_project/blob/main/images/feedImage.JPG)
 - 로그인 시 기본으로 사용자의 피드 목록 화면으로 이동
 - 클릭 시 모달창으로 사진, 내용, 댓글, 좋아요 기록 표시
 - 댓글 단 사용자 아이콘 클릭 시 팔로우/메시지 발송 가능하며 사진 클릭 시 원본 크기로 확인 가능


***
### **3.  랜덤 피드**
![랜덤](https://github.com/chchjjj/react_sns_project/blob/main/images/randomFeed.JPG)
- 메뉴 중 '피드' 클릭 시, 로그인 사용자를 제외한 다른 사용자들의 '공개' 상태 피드가 랜덤으로 2개씩 게시
- 우측 상단 '새로고침' 버튼 통해 새로운 피드 확인 가능 (무한 스크롤 버전으로 보완 고려중)
- 게시글마다 우측 상단의 팔로우/언팔로우 & DM(다이렉트 메세지) 버튼 통해 작업 가능

 ![랜덤2](https://github.com/chchjjj/react_sns_project/blob/main/images/randomFeed2.JPG)
 ![랜덤3](https://github.com/chchjjj/react_sns_project/blob/main/images/randomFeed3.JPG)
- 게시글 작성자 아이콘 클릭 시 해당 사용자의 피드 모아보기 & 상세보기 모달창 생성
- 해당 사용자의 비공개 게시글은 포함되어 있지 않음
