const { Client } = require('pg');
const { database }  =  require( "./config.json");
const client = new Client({
    user: database.user,
    host: database.host,
    database: database.database,
    password: database.password,
    port: database.port,
});
class DB {
    async query(text, params, callback) {
        return client.query(text, params, callback)
    }
    async checkConnection() {
        client.connect();
        await client.query('SELECT NOW()', (err, res) => {
            if(!err){
                console.log("database connected at",new Date(res.rows[0].now).toLocaleString())
                return res.rows
            }
            console.log(err)
            client.end()
        })
    }
}
module.exports = new DB()