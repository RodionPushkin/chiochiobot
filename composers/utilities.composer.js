const {Composer, Markup} = require('telegraf')
const composer = new Composer()
const access = require('../lib/access')
const db = require("../database");
const statistics = require('../lib/statistics')
const md5 = require("md5");
composer.command('/generate', async (ctx) => {
    try {
        if (ctx.message.chat?.username && await access.check(ctx.message.chat.id) && await access.checkChatPrivate(ctx)) {
            ctx.scene.enter('generate')
        } else if (await access.checkChatPrivate(ctx)) {
            global.message.push({
                callback: async () => {
                    ctx.replyWithHTML(await db.query(`SELECT text FROM bot_message where reason = 'dont_have_permission'`).then(result => result.rows[0].text))
                }
            })
        }
    } catch (e) {
        console.log(e)
    }
})
composer.command('/send', async (ctx) => {
    try {
        if (ctx.message.chat?.username && await access.check(ctx.message.chat.id) && await access.checkChatPrivate(ctx)) {
            ctx.scene.enter('sendMessage')
        } else if (await access.checkChatPrivate(ctx)) {
            global.message.push({
                callback: async () => {
                    ctx.replyWithHTML(await db.query(`SELECT text FROM bot_message where reason = 'dont_have_permission'`).then(result => result.rows[0].text))
                }
            })
        }
    } catch (e) {
        console.log(e)
    }
})
composer.command('/statistics', async (ctx) =>  {
    try {
        if (ctx.message.chat.id == "1299761386") {
            await statistics.getMessageActivity().then(async res => {
                let items = res.filter(item => item.count == 0)
                let text = "Чаты без активности за последние 24 часа, списком:"
                let chats = ""
                let counter = 0
                items.map(async item => {
                    try{
                        return await ctx.telegram.getChat(Number(item.id_telegram)).then(chat => {
                            chats += `\n${++counter}. ${chat.title}`
                            return item
                        })
                    }catch (e) {
                        if(!e.response.ok){
                            db.query(`UPDATE chat SET deleted = TRUE WHERE id_telegram = '${item.id_telegram}'`)
                        }
                    }
                })
                await statistics.sendMessageTo(ctx, "Подождите немного, я собираю данные")
                setTimeout(async () => {
                    if (chats.length == 0) {
                        text = "Во всех чатах была активность за последние 24 часа"
                    }
                    await statistics.sendMessageTo(ctx, text+chats)
                }, 5000)
            })
        }
    } catch (err) {
        console.log(err)
    }
})
composer.on('text', async (ctx) => {
    try {
        if (ctx.message.text == 'мой id') {
            ctx.replyWithHTML(`Ваш ID: ${ctx.message.from.id}`)
        } else if (!await access.checkChatPrivate(ctx)) {
            if (await db.query(`SELECT * FROM chat WHERE id_telegram = '${ctx.message.chat.id}'`).then(res => res.rowCount != 0)) {
                let date = new Date(Number(`${ctx.message.date}000`))
                let text = ctx.message.text ? ctx.message.text : ctx.message.caption ? ctx.message.caption : ""
                await db.query(`INSERT INTO "message" (id_telegram,text,"time") VALUES ('${ctx.message.chat.id}','${text.slice(0,8000)}','${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}')`).then(res => {})
            }
            //отключить
            else if(await db.query(`SELECT * FROM chat WHERE id_telegram = '${ctx.message.chat.id}'`).then(res => res.rowCount == 0)){
                db.query(`INSERT INTO chat (title, code, id_telegram) VALUES ('${ctx.message.chat.title}', '${md5(ctx.message.chat.title+new Date())}', '${ctx.message.chat.id}')`).then(() => {
                    console.log("чат добавлен")
                })
            }
        }
    } catch (err) {
        console.log(err)
    }
})
composer.on('document', async (ctx) => {
    const check = (text) => {
        let accessable = ['payment', 'платежное', 'поручение', 'учен', 'плате', 'платё', 'pay']
        const res = accessable.filter(item => text.toLowerCase().indexOf(item) != -1)
        return res.length > 0
    }
    if (!await access.checkChatPrivate(ctx)) {
        if (check(ctx.message.document.file_name)) {
            statistics.sendFileTo(ctx, "Платежное поручение", ctx.message.document.file_id)
            console.log("Платежное поручение: ", ctx.message.document.file_id)
        }
    }
})
composer.on('new_chat_members', async (ctx) => {
    try {
        await statistics.sendMessageTo(ctx, `Новый участник чата "${ctx.message.chat.title}", ${!ctx.message?.new_chat_member?.last_name ? "" : ctx.message.new_chat_member.last_name} ${!ctx.message?.new_chat_member?.first_name ? "" : ctx.message.new_chat_member.first_name}`)
    } catch (err) {
        console.log(err)
    }
})
composer.on('left_chat_member', async (ctx) => {
    try {
        await statistics.sendMessageTo(ctx, `Ушел участник чата "${ctx.message.chat.title}", ${!ctx.message?.left_chat_member?.last_name ? "" : ctx.message.left_chat_member.last_name} ${!ctx.message?.left_chat_member?.first_name ? "" : ctx.message.left_chat_member.first_name}`)
    } catch (err) {
        console.log(err)
    }
})
module.exports = composer
