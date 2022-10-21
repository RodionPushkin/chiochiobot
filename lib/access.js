const config = require("../config.json");
const db = require('../database')
class access {
    async check(text) {
        return await db.query(`SELECT * FROM "admin" where id_telegram = '${text}'`).then(result=>result.rowCount > 0)
    }
    async checkChatPrivate(ctx) {
        return ctx.message.chat.type == "private"
    }
}
module.exports = new access()
