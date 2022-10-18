const { Composer, Markup} = require('telegraf')
const composer = new Composer()
const db = require('../database')
const access = require('../lib/access')
const config = require('../config.json')
composer.start(async (ctx) => {
    if(!await access.checkChatPrivate(ctx)){
        ctx.replyWithHTML(config.text.startAll,Markup.removeKeyboard())
        if(await db.query(`SELECT * FROM "Chat" WHERE "tgid" = '${ctx.message.chat.id}'`).then(res => {return res.rowCount == 0})){
            ctx.replyWithHTML(config.text.startNotReg,Markup.keyboard(['/reg']))
        }
    }else{
        ctx.replyWithHTML(config.text.startModerator,Markup.removeKeyboard())
    }
})
composer.command('help', async (ctx) => {
    try {
        if(ctx.message.chat?.username && await access.check(ctx.message.chat.username) && await access.checkChatPrivate(ctx)){
            ctx.replyWithHTML(config.text.helpModerator)
        }else{
            ctx.replyWithHTML(config.text.helpAll)
        }
    } catch (err) {
        console.log(err)
    }
})
composer.command('reg',async (ctx)=>{
    try {
        if(!await access.checkChatPrivate(ctx)){
            ctx.scene.enter('signup')
        }else{
            ctx.replyWithHTML(config.text.chatNotPublic)
        }
    } catch (err) {
        console.log(err)
    }
})
module.exports = composer