const mysql = require('mysql2'); // mysql2라는 패키지를 연결하겠단 소리

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'test1234',
    database: 'mysqldb' // MySql에서 설정한 db 이름
});

// promise 기반으로 사용할 수 있게 변환
const promisePool = pool.promise();
module.exports = promisePool;

