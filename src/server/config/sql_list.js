// sql 쿼리문들을 작성 

//로그인
const login_query = `SELECT * FROM user WHERE email = ? AND password = ?`

// 회원가입
const signup_query = `INSERT INTO user (id, email, password, fullname, address, phone) VALUE (?, ?, ?, ?, ?, ?)`

// 아이디체크
const check_id_query = `SELECT * FROM user WHERE email = ?`


module.exports = {
    login_query, 
    signup_query, 
    check_id_query
}