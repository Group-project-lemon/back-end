const db = require('./db.js');
const connection = db.promise() 


async function execute(sql, values = []){
    // 인자값들을 받아와서 mysql에 sql쿼리문을 실행하고 결과 값을 받아오는 부분
    const [result, field] = await connection.execute(sql, values)

    // sql 쿼리문이 select문이라면 
    if (sql.trim().toLowerCase().startsWith('select')){
        console.log("execute result console : ",  result)
        return result
    }else{
        return 'Query Ok'
    }
}


module.exports = {execute}