// 인증 내용

const jwt = require('jsonwebtoken');
const JWT_SECRET = 'server_secret_key'; // .env 없이 하드코딩

// 바로 내보내주기 (토큰 검증 내용)
module.exports = (req, res, next) => { // 여기서 next는 라우터 js에 있는 async(req, res) 함수내용을 말함(삭제, 수정 등)
    const authHeader = req.headers['authorization']; // authorization 이 이름으로 보내는거고 꺼낼 때도 이 이름으로
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ message: '인증 토큰 없음', isLogin: false });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // 이후 라우터에서 req.user로 사용자 정보 사용 가능
        next(); // next를 실행한다는건, 7번째 줄에 쓴대로 async(req, res) 함수를 실행한다는 말
    } catch (err) {
        return res.status(403).json({ message: '유효하지 않은 토큰', isLogin: false });
    }
};
