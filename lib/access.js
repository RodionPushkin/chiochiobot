const config = require("../config.json");

class access {
    async check(text) {
        return config.Admin.find(item => item == `@${text}`).length > 0
    }
    async checkChatPrivate(ctx) {
        return ctx.message.chat.type == "private"
    }
}
module.exports = new access()