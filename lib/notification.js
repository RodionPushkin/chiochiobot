const config = require("../config.json");
const db = require("../database")
class notification {
    async send(callback) {
        // x это сколько чатов трогать за раз от 1 до 30
        let x = 20
        const getRows = async (from) => {
            return await db.query(`SELECT * FROM chat WHERE id_telegram IS NOT NULL ORDER BY id LIMIT ${x} OFFSET ${from}`).then(res=>{
                return res.rows
            })
        }
        await db.query(`SELECT * FROM "Chat" WHERE tgid IS NOT NULL ORDER BY id`).then(res=>{
            let n = 0
            let interval = setInterval(async ()=>{
                n++
                if(n >= Math.ceil(res.rowCount / x) - 1){
                    clearInterval(interval)
                }
                const list = await getRows(n-1)
                list.forEach(item=>{callback(item)})
            },1200)
        })
    }
    async sendWithFile(text) {
        console.log(await db.query(`SELECT * FROM "Chat" WHERE tgid IS NOT NULL`))
    }
}
module.exports = new notification()
