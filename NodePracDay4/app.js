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
        console.log(connection);
    }
});
