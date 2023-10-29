const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;
const db = require('./config/db');


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

require('dotenv').config();

const session = require('express-session');

app.use(
  session({
    secret: process.env.session_key,
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 600000,
    },
  })
);

app.use((req, res, next)=>{  
  res.locals.email = "";
  res.locals.password = "";

  if(req.session.member){
    res.locals.user_id=req.session.user.email
    res.locals.name=req.session.user.password
  }
  next()
});


//////////////////// 라우팅

app.get('/', (req, res) => {
  // 세션에서 사용자 정보 가져오기
  const user = req.session.user;

  if (user) {
    // 사용자 정보를 템플릿에 전달
    res.render('index', { email: user.email, fullname: user.fullname, /* other user data */ });
  } else {
    // 로그인되지 않은 경우
    res.render('index', { email: null, fullname: null, /* other user data */ });
  }
});

app.get('/login', (req, res) => {
  res.render('login')
})

app.post('/loginProc', (req, res) => {  // 회원 로그인 하기
  const email = req.body.email;
  const password = req.body.password;
 
  var sql = `select * from user where email=? and password=?`  
  var values = [email,password];   
  db.query(sql, values, function(err, result){
    if(err) throw err;
    if(result.length===0){
      res.send("<script>alert('없는 아이디입니다.');location.href='/login'; </script>")
    }else{
      console.log(result[0])  
      req.session.user = result[0]
      res.send("<script>alert('로그인 되었습니다.');location.href='/'; </script>")
    }   
  })
})

app.get('/logout',(req, res)=>{
  req.session.user = null;
  res.send("<script>alert('로그아웃 되었습니다.');location.href='/'; </script>")
})

app.get('/regist', (req, res) => {
  res.render('regist')
})

app.post('/registProc', (req, res) => {  // 회원 등록 하기
  const email = req.body.email;
  const password = req.body.password;
  const fullname = req.body.fullname;
  const address = req.body.address;
  const phone = req.body.phone;
 
  var sql = `insert into user(email,password,fullname,address,phone)values(?,?,?,?,?)`  
  var values = [email,password,fullname,address,phone];  
  db.query(sql, values, function(err, result){
    if(err) throw err;
    console.log('자료 1개 삽입했습니다.');
    res.send("<script>alert('등록되었습니다.'); location.href='/login';</script>") 
  })
});



// products
// 모든 상품 #all
app.get('/shopall', (req, res) => {
    //res.send(dummyData)
    console.log('root');
    db.query('SELECT * FROM ICT_TEAM.items', (err, data) => {
      if (!err) {
        console.log(data);
        res.json(data); //응답을 클라이언트에 보낸다.
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
      res.json(data1); // 클라이언트에 응답을 보냅니다.
    } else {
      console.log(err1);
      res.status(500).json('데이터베이스에서 정보를 가져오는 동안 오류가 발생했습니다.'); // 에러 응답을 보냅니다.
    }
  });
});


// goods 제품상세 페이지 localhost:4000/goods/1
app.get('/goods/:goodID', (req, res) => {
  const good = req.params.goodID; // 요청 URL에서 goodID를 가져옵니다.
    db.query('SELECT * FROM ICT_TEAM.items WHERE id = ?', [good], (err2, data2) => {
    if (!err2) {
      console.log(data2);
      res.json(data2); // 클라이언트에 응답을 보냅니다.
    } else {
      console.log(err2);
      res.status(500).json('데이터베이스에서 정보를 가져오는 동안 오류가 발생했습니다.'); // 에러 응답을 보냅니다.
    }
  });
});


// 장바구니 담기 (민지) check
// (/goods/:goodID/cart) 로 상품상세정보를 같이 장바구니에 추가할 수 있도록 함
app.post('/goods/:goodID/cart', (req, res) => {
  
  const good = req.params.goodID;
  const quantity = req.body.quantity; // body name값 맞추기 임의로 quantity로 정함
  const user_id = req.session.user.user_id;// 사용자의 session값 가져오기
  console.log('Received goodID:', good);

  // quantitiy -> quantity , id 제거
  db.query('INSERT INTO ICT_TEAM.cart(user_id, quantity, items_id) VALUES(?, ?, ?)', [user_id, quantity, good], (err3, data3) => {
    if (!err3) {
      console.log(data3);
      res.json(data3); //응답을 클라이언트에 보낸다.
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
      const user_id = req.session.user.user_id;

      db.query('SELECT * FROM ICT_TEAM.cart WHERE user_id = ? ', [user_id], (err4, data4) => {
        if (!err4) {
          console.log(data4);
          res.json(data4); //응답을 클라이언트에 보낸다.
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

  // 장바구니에서 목록 삭제하기 (민지) check
app.delete('/cart', (req, res) => {
  const user_id = req.session.user.user_id;

  db.query('DELETE FROM cart WHERE user_id = ?' , [user_id], (err, result) => {
    if (!err) {
      console.log(result);
      res.status(204).json();
    } else {
      console.log(err);
      res.status(500).json({ error: '목록을 삭제할 수 없습니다.'});
    }
  });
});

// 주문페이지에서 상세주문정보 불러오기  (민지) ? 카트테이블과 오더디테일테이블 ?
app.get('/cart/order', (req, res) => {
    // 사용자의 session 값
    const user_id = req.session.user.user_id;

    db.query('SELECT * FROM ICT_TEAM.orders_detail WHERE user_id = ?', [user_id], (err5, data5) => {
      if (!err5) {
        console.log(data5);
        res.json(data5); //응답을 클라이언트에 보낸다.
      } else {
        console.log(err5);
      }
    });
  });

  // 추가로 입력한 정보를 저장 (민지) 
app.post('/cart/order/checkout', (req, res) => {
    const user_id = req.session.user.user_id;
    const fullname = req.body.fullname;
    const address = req.body.address;
    const phone = req.body.phone;
    const request = req.body.request;

    db.query('INSERT INTO ICT_TEAM.delivery(user_id, fullname, address, phone, request) VALUES (?, ?, ?, ?, ?)', 
    [user_id, fullname, address, phone, request], (err, data) => {
      if (!err) {
        console.log(data);
        res.json(data);
      } else {
        console.log(err);
        res.json({ error : '데이터를 저장하는 동안 오류가 발생했습니다.'});
      }
    });
});

//delivery 주문페이지
// 주문할 물건 정보 가져오기 ???? 오더디테일에 언제 post하는지 ?
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
  
  

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });