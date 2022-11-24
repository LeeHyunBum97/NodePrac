// DB연결 TEST
const mariadb = require('mysql')

let connection = mariadb.createConnection({
    host : "127.0.0.1",
    port : '3306',
    user : 'root',
    password : '8236',
    database : 'adam'
});

connection.connect(function(error){
    if(error){
        console.log(error);
    } else {
        // console.log(connection);
        // 테이블 생성 구문
        /* connection.query('create Table family(id int auto_increment primary key, name varchar(20))'); */

        // 데이터 삽입 구문
        /* connection.query('insert into family(name) values(?)', '강감찬');
        connection.query('insert into family(name) values(?)', '을지문덕');
        connection.query('insert into family(name) values(?)', '이순신'); */

        // SELECT 구문
        connection.query('select * from family', (err, results, fields) => {
            if(err){
                // 실패 했을 때.
                console.log(err);
                console.log("{result : false}")
            }else{
                let result = JSON.stringify(results);
                console.log(result);
            }
        })
    }
});
