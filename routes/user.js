// express 모듈을 로드 
const express = require('express')
// route부분에서는 express 안에 있는 Route()부분만 가져온다. 
const router = express.Router()

// 외부의 js 파일을 로드 
const sql_list = require("../config/sql_list")
const sql_func = require("../config/sql_function")


// 외부에 파일에서 현재 파일의 기능을 사용 할 수 있도록 설정
module.exports = function(){

    // 기본 경로는 localhost:4000/user

    // api 생성
    // localhost:4000/user/ 요청 시
    router.get('/', function(req, res){
        res.render('login')
    })

    
    // 로그인 api 생성
    // localhost:3000/user/signin [post]
    router.post('/signin', async function(req, res){
        // 유저가 보낸 데이터를 변수에 대입 & 확인
        const id = req.body._id
        const pass = req.body._pass
        console.log(id, pass)
        // sql_list에 있는 login_query 변수를 호출하여 
        // sql_func에 있는 execute()함수에 인자값으로 login_qeury와 [id, pass] 넣어서 호출\
         const [result, field] = await sql_func.execute(
             sql_list.login_query, 
             [id, pass]
         )
        // result의 데이터의 형태는? -> {  }
        // result의 길이는 0아니면 1 인 이유는? -> 
        // user테이블에 id필드가 primary key임으로 데이터는 1개가 출력이 되거나 아니면 출력되지 않는다.
        console.log(result)
        // 로그인이 성공하는 조건? - > result의 길이가 1인 경우, result[0] 존재하는 경우
        // if (result.length == 1)
        if (result[0]){
            // session에 유저의 정보를 등록
            req.session.logined = result[0]
            // localhost:4000/products/shopall 주소에 요청
            res.redirect('/products/shopall/')
        }else{
            res.redirect('/user')
        }
    })


    // localhost:4000/check_id 주소로 요청시
    router.get('/check_id', function(req, res){
        // req.query.msg 데이터가 존재하는가?
        if(req.query.msg){
            msg = req.query.msg
        }else{
            msg = ""
        }
        res.render('check_id', {
            data : msg
        })
    })

    // params : url/:id
    // query : url?key=value
    // body : post 방식으로 데이터를 숨겨서 보내는 경우

    // localhost:3000/check_id2 주소로 요청시
    router.get('/check_id2', async function(req, res){
        // 사용가능한 아이디인지 확인하려면?
        // 유저가 입력한 아이디가 mysql Database에 존재하지 않는다면
        // 해당하는 쿼리문은 sql_list안에 check_id_query 변수에 지정
        // sql쿼리문을 실행하는 함수는 sql_func안에 있는 execute()함수
        // 유저가 보낸 id 값을 쿼리문과 함께 실행
        const id = req.query._id
        // 유저가 입력한 아이디의 길이가 4글자보다 작다면
        if (id.length < 4){
            res.redirect('/user/check_id?msg=아이디는 4글자 이상이어야 합니다')
        }else{
            const result = await sql_func.execute(sql_list.check_id_query, [id])
            console.log(id, result)
            // 사용 가능한 아이디인가? -> result 안에 데이터가 존재하지 않아야 한다. 
            if(!result[0]){
                res.redirect('/user/signup?_id='+id)
            }else{
                res.redirect('/user/check_id?msg=사용불가능한아이디')
            }
        }
    })


    // localhost:4000/user/signup 요청 시
    // 회원 가입 화면 보여준다. 
    router.get('/signup', function(req, res){
        const id = req.query._id
        res.render('signup', {
            id : id
        })
    })


    // localhost:4000/user/signup2 [post] 주소로 요청시
    router.post('/signup2', async function(req, res){
        // 유저가 보낸 데이터를 변수에 대입 & 확인
        const id = req.body._id
        const password = req.body._pass
        const name = req.body._name
        console.log(id, password, name)
        // sql 쿼리문을 이용하여 데이터를 삽입
        // sql_list안에 있는 signup_query를 불러와서 쿼리문을 유저가 보낸 데이터와 함께 실행
        const result = await sql_func.execute(
            sql_list.signup_query, 
            [id, email, password, fullname, address, phone]
        )
        console.log(result)
        // 회원 가입이 완료되면 로그인 페이지로 이동
        res.redirect('/user')
    })



    return router

}