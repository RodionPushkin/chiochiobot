const {Composer, Markup} = require('telegraf')
const composer = new Composer()
const db = require('../database')
const access = require('../lib/access')
const fs = require('fs')
const path = require('path')
let pathForFiles = path.join(__dirname, '../files')

composer.on('callback_query',(ctx)=>{
    if(ctx.update.callback_query.data == "menu-info"){
        global.message.push({
            callback: async () => {
                return await ctx.replyWithHTML(await db.query(`SELECT text FROM bot_message where reason = 'help_moderator'`).then(result => result.rows[0].text), Markup.removeKeyboard())
            }
        })
        global.message.push({
            callback: async () => {
                return await ctx.replyWithHTML('Меню', Markup.inlineKeyboard([
                    [{text: 'Инфо', callback_data: 'menu-info'}],
                    [{text: 'Сгенерировать код', callback_data: 'menu-generate'}],
                    [{text: 'Рассылка', callback_data: 'menu-send'}]
                ]).resize())
            }
        })
    }else if(ctx.update.callback_query.data == "menu-send"){
        ctx.scene.enter('sendMessage')
    }else if(ctx.update.callback_query.data == "menu-generate"){
        ctx.scene.enter('generate')
    }else{
        try {
            console.log("files",pathForFiles)
            fs.readdir(pathForFiles, (err, files) => {
                if(err) console.log(err)
                let filesArray = files.filter(item=> item != 'DEFAULT')
                for (let i = 0; i < filesArray.length; i++) {
                    if(ctx.update.callback_query.data == filesArray[i]){
                        ctx.state.folder = filesArray[i]
                        ctx.scene.enter('sendFiles')
                    }
                }
            })
        }catch (e) {
            console.log(e)
            global.message.push({
                callback: async () => {
                    return await ctx.replyWithHTML("У меня не получилось прочитать папки!", Markup.removeKeyboard())
                }
            })
        }
    }
    ctx.deleteMessage(ctx.update.callback_query.message.message_id)
})
composer.start(async (ctx) => {
    if (!await access.checkChatPrivate(ctx)) {
        if (await db.query(`SELECT * FROM chat WHERE "id_telegram" = '${ctx.message.chat.id}'`).then(res => res.rowCount == 0)) {
            global.message.push({
                callback: async () => {
                    return await ctx.replyWithHTML(await db.query(`SELECT text FROM bot_message where reason = 'start_not_reg'`).then(result => result.rows[0].text), Markup.keyboard(['/reg']))
                }
            })
        }else{
            global.message.push({
                callback: async () => {
                    return await ctx.replyWithHTML(await db.query(`SELECT text FROM bot_message where reason = 'start_all'`).then(result => result.rows[0].text), Markup.removeKeyboard())
                }
            })
        }
    } else {
        global.message.push({
            callback: async () => {
                return await ctx.replyWithHTML(await db.query(`SELECT text FROM bot_message where reason = 'start_moderator'`).then(result => result.rows[0].text), Markup.removeKeyboard())
            }
        })
        global.message.push({
            callback: async () => {
                return await ctx.replyWithHTML('Меню', Markup.inlineKeyboard([
                    [{text: 'Инфо', callback_data: 'menu-info'}],
                    [{text: 'Сгенерировать код', callback_data: 'menu-generate'}],
                    [{text: 'Рассылка', callback_data: 'menu-send'}]
                ]).resize())
            }
        })
    }
})
composer.command('help', async (ctx) => {
    try {
        if (ctx.message.chat?.username && await access.check(ctx.message.chat.id) && await access.checkChatPrivate(ctx)) {
            global.message.push({
                callback: async () => {
                    return await ctx.replyWithHTML(await db.query(`SELECT text FROM bot_message where reason = 'help_moderator'`).then(result => result.rows[0].text), Markup.removeKeyboard())
                }
            })
        } else {
            global.message.push({
                callback: async () => {
                    return await ctx.replyWithHTML(await db.query(`SELECT text FROM bot_message where reason = 'help_аll'`).then(result => result.rows[0].text), Markup.removeKeyboard())
                }
            })
        }
    } catch (err) {
        console.log(err)
    }
})
composer.command('reg', async (ctx) => {
    try {
        if (!await access.checkChatPrivate(ctx)) {
            ctx.scene.enter('signup')
        } else {
            global.message.push({callback: async ()=>{return await ctx.replyWithHTML(await db.query(`SELECT text FROM bot_message where reason = 'chat_not_public'`).then(result=>result.rows[0].text),Markup.removeKeyboard())}})
        }
    } catch (err) {
        console.log(err)
    }
})
module.exports = composer
