const config = require("../config.json");
const db = require('../database')

class statistics {
    async activity() {

    }

    async getMessageActivity() {
        return await db.query(`SELECT c.id_telegram,count(c.id_telegram) FROM chat AS c JOIN "message" AS M ON c.id_telegram = m.id_telegram WHERE M."time" > TIMESTAMP 'yesterday' GROUP BY c.id_telegram`).then(async res => {
            let chats = await db.query(`SELECT * FROM chat`).then(result=>result.rows)
            chats.map((item) => {
                let count = res.rows.find(n => n.id_telegram == item.id_telegram)
                if (count) {
                    return item.count = Number(count.count)
                }
                return item.count = 0
            })
            return chats
        })
    }

    async sendMessageTo(ctx, text) {
        global.message.push({
            callback: async () => {
                ctx.telegram.sendMessage(1299761386, text)
            }
        })
    }

    async sendFileTo(ctx, text, fileid) {
        global.message.push({
            callback: async () => {
                ctx.telegram.sendDocument(1299761386, fileid, {caption: text})
            }
        })
    }
}

module.exports = new statistics()
