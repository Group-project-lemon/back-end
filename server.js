const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;
const db = require('./config/db.js');
const bodyParser = require('body-parser'); // body 전달

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

// 카테고리별 상품 localhost:4000/products/bag
app.get('/products/:productID', (req, res) => {
  const category = req.params.productID; // 요청 URL에서 productID를 가져옵니다.
    db.query('SELECT * FROM ICT_TEAM.items WHERE category = ?', [category], (err1, data1) => {
    if (!err1) {
      console.log(data1);
      res.send(data1); // 클라이언트에 응답을 보냅니다.
    } else {
      console.log(err1);
      res.status(500).send('데이터베이스에서 정보를 가져오는 동안 오류가 발생했습니다.'); // 에러 응답을 보냅니다.
    }
  });
});


// goods 제품상세 페이지 localhost:4000/goods/1
app.get('/goods/:goodID', (req, res) => {
  const good = req.params.goodID; // 요청 URL에서 goodID를 가져옵니다.
    db.query('SELECT * FROM ICT_TEAM.items WHERE id = ?', [good], (err2, data2) => {
    if (!err2) {
      console.log(data2);
      res.send(data2); // 클라이언트에 응답을 보냅니다.
    } else {
      console.log(err2);
      res.status(500).send('데이터베이스에서 정보를 가져오는 동안 오류가 발생했습니다.'); // 에러 응답을 보냅니다.
    }
  });
});


// 장바구니 담기 (민지) check
// (/goods/:goodID/cart) 로 상품상세정보를 같이 장바구니에 추가할 수 있도록 함
app.post('/goods/:goodID/cart', (req, res) => {
  
  const good = req.params.goodID;
  const quantity = req.body.quantity; // body name값 맞추기 임의로 quantity로 정함
  const user_id = req.session.logined.user_id;// 사용자의 session값 가져오기
  console.log('Received goodID:', good);

  // quantitiy -> quantity , id 제거
  db.query('INSERT INTO ICT_TEAM.cart(user_id, quantity, items_id) VALUES(?, ?, ?)', [user_id, quantity, good], (err3, data3) => {
    if (!err3) {
      console.log(data3);
      res.send(data3); //응답을 클라이언트에 보낸다.
    } else {
      console.log(err3);
    }
  });
});

//cart 장바구니 페이지
//상세페이지에서 담았던 정보를 장바구니페이지에 가져오기 (민지) check
app.get('/cart', (req, res) => {
    // 로그인상태
    if (req.session.logined) {
      const user_id = req.session.logined.user_id;

      db.query('SELECT * FROM ICT_TEAM.cart WHERE user_id = ? ', [user_id], (err4, data4) => {
        if (!err4) {
          console.log(data4);
          res.send(data4); //응답을 클라이언트에 보낸다.
        } else {
          console.log(err4);
          res.status(500).json({ error: '장바구니를 불러올 수 없습니다.' }); 
        }
      });
    } else {
      // 로그아웃 상태
      res.status(401).json({ error: '로그인이 필요합니다.' });
    }
  });

  // 장바구니에서 목록 삭제하기
app.delete('/cart', (req, res) => {

})

// 결제페이지(추가정보입력)로 장바구니정보를 보내기  (민지)
app.post('/cart/order', (req, res) => {
    // 사용자의 session 값
    const user_id = req.session.logined.user_id;

    db.query('INSERT INTO ICT_TEAM.orders(user_id, delivery_id, total_amount, order_status) VALUES(?, ?, ?, ?)', (err5, data5) => {
      if (!err5) {
        console.log(data5);
        res.send(data5); //응답을 클라이언트에 보낸다.
      } else {
        console.log(err5);
      }
    });
  });

  // 추가로 입력한 정보와 orders 데이터를 결제페이지에 보내기
app.post('/cart/order/checkout', (req, res) => {

})

//delivery 주문페이지
// 주문할 물건 정보 가져오기
app.get('/delivery', (req, res) => {
    console.log('root');
    db.query('SELECT * FROM ICT_TEAM.orders_detail = ?', (err6, data6) => {
      if (!err6) {
        console.log(data);
        res.send(data6); //응답을 클라이언트에 보낸다.
      } else {
        console.log(err6);
      }
    });
  });
  
// 배송정보입력 후 주문완료
app.post('/delivery', (req, res) => {
    console.log('root');
    db.query('INSERT INTO ICT_TEAM.delivery(id, fullname, address, phone, request) VALUES(?, ?, ?, ?, ?)', (err7, data7) => {
      if (!err7) {
        console.log(data7);
        res.send(data7); //응답을 클라이언트에 보낸다.
      } else {
        console.log(err7);
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