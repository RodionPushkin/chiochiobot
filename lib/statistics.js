const config = require("../config.json");
const db = require('../database')
class statistics {
    async activity () {

    }
    async getMessageActivity() {
        return await db.query(`SELECT c.tgid,count(c.tgid) FROM "Chat" AS C JOIN "Message" as M ON c.tgid = m.idchat WHERE M.time > TIMESTAMP 'yesterday' GROUP BY c.tgid`).then(async res=>{
            let chats = await db.query(`SELECT * FROM "Chat"`)
            chats = chats.rows
            chats.map((item) => {
                let count = res.rows.find(n => n.tgid == item.tgid)
                if(count){
                    return item.count = Number(count.count)
                }
                return item.count = 0
            })
            return chats
        })
    }
    async sendMessageTo(ctx,text){
        ctx.telegram.sendMessage(1299761386,text)
    }
    async sendFileTo(ctx,text,fileid){
        ctx.telegram.sendDocument(1299761386,fileid, {caption: text})
    }
}
module.exports = new statistics()
