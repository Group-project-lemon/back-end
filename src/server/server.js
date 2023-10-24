const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;
const db = require('./config/db.js');

app.set('views', __dirname + '/views') // view 페이지 주소 자동경로
app.set('view engine', 'ejs') // view 엔진(백엔트 테스트 목적)
app.use(express.urlencoded({extended:false})) // post 방식으로 데이터가 들어올때 json 형태로 데이터를 로드

require('dotenv').config() // 환경변수 dotenv모듈 사용

// express-session 모듈을 로드 
const session = require('express-session')

app.use(
    session({
        secret : process.env.session_key , // secret 키 값들은 외부에 노출이 되면 보안 상 문제가 발생할 수 있다.  
        resave : false, 
        saveUninitialized: false, 
        cookie : {
            maxAge : 600000
        }
    })
)





//////////////////// 라우팅

// localhost:4000/ 홈페이지 첫접속시

app.get('/', function(req, res){
    // session안에 logined에 데이터가 존재하지 않는다면 /user 주소로 요청
    if(!req.session.logined){
        res.redirect('/user')
    }
    // session안에 logined에 데이터가 존재한다면 메인화면 주소로 요청
    else{
        res.redirect('/products/shopall/')
    }
})



// auth 회원가입
// user 로그인
const user = require('./routes/user')()
app.use('/user', user)


// products
// 모든 상품 #all
app.get('/shopall', (req, res) => {
    //res.send(dummyData)
    console.log('root');
    db.query('SELECT * FROM ICT_TEAM.items', (err, data) => {
      if (!err) {
        console.log(data);
        res.send(data); //응답을 클라이언트에 보낸다.
      } else {
        console.log(err);
      }
    });
  });

// 카테고리별 상품
app.get('/products/:productID', (req, res) => {
    console.log('root');
    db.query('SELECT * FROM ICT_TEAM.items.category = ?', (err, data) => {
      if (!err) {
        console.log(data);
        res.send(data); //응답을 클라이언트에 보낸다.
      } else {
        console.log(err);
      }
    });
  });

// goods 제품상세 페이지
app.get('/goods/:productID', (req, res) => {
    console.log('root');
    db.query('SELECT * FROM ICT_TEAM.items.category = ?', (err, data) => {
      if (!err) {
        console.log(data);
        res.send(data); //응답을 클라이언트에 보낸다.
      } else {
        console.log(err);
      }
    });
  });

// 상세페이지에서 장바구니 담기
app.post('/goods/:productID', (req, res) => {
    console.log('root');
    db.query('INSERT INTO ICT_TEAM.cart(id, user_id, quantitiy, items_id) VALUES(?, ?, ?, ?)', (err, data) => {
      if (!err) {
        console.log(data);
        res.send(data); //응답을 클라이언트에 보낸다.
      } else {
        console.log(err);
      }
    });
  });

//cart 장바구니 페이지
//상세페이지에 담았던 정보 가져오기
app.get('/cart', (req, res) => {
    console.log('root');
    db.query('SELECT * FROM ICT_TEAM.items.cart = ?', (err, data) => {
      if (!err) {
        console.log(data);
        res.send(data); //응답을 클라이언트에 보낸다.
      } else {
        console.log(err);
      }
    });
  });

// 결제페이지로 정보 가져가기  
app.post('/cart', (req, res) => {
    console.log('root');
    db.query('INSERT INTO ICT_TEAM.orders_detail(id, orders_id, items_id, quantity, unit_price, total_price) VALUES(?, ?, ?, ?, ?, ?)', (err, data) => {
      if (!err) {
        console.log(data);
        res.send(data); //응답을 클라이언트에 보낸다.
      } else {
        console.log(err);
      }
    });
  });

//delivery 주문페이지
// 주문할 물건 정보 가져오기
app.get('/delivery', (req, res) => {
    console.log('root');
    db.query('SELECT * FROM ICT_TEAM.orders_detail = ?', (err, data) => {
      if (!err) {
        console.log(data);
        res.send(data); //응답을 클라이언트에 보낸다.
      } else {
        console.log(err);
      }
    });
  });
  
// 배송정보입력 후 주문완료
app.post('/delivery', (req, res) => {
    console.log('root');
    db.query('INSERT INTO ICT_TEAM.delivery(id, fullname, address, phone, request) VALUES(?, ?, ?, ?, ?)', (err, data) => {
      if (!err) {
        console.log(data);
        res.send(data); //응답을 클라이언트에 보낸다.
      } else {
        console.log(err);
      }
    });
  }); 
  

//order 주문목록 조회
app.get('/order', (req, res) => {
    console.log('root');
    db.query('SELECT * FROM ICT_TEAM.delivery = ?', (err, data) => {
      if (!err) {
        console.log(data);
        res.send(data); //응답을 클라이언트에 보낸다.
      } else {
        console.log(err);
      }
    });
  });

// 주문취소 쿼리문 조건에 유저 정보 확인이 필요
app.post('/cancel', (req, res) => {
    console.log('root');
    db.query('DELETE * FROM ICT_TEAM.delivery WHERE order_status = Processing', (err, data) => {
      if (!err) {
        console.log(data);
        res.send(data); //응답을 클라이언트에 보낸다.
      } else {
        console.log(err);
      }
    });
  }); 
  
  

// 포트접속
app.listen(PORT, () => {
    console.log(`Server run : Server:${PORT}/ Start`);
})