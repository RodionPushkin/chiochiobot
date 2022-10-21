const {Scenes, Markup} = require('telegraf')
const config = require('../config.json')
const token = require('../config.json').bot.token
const db = require('../database')
module.exports = new Scenes.WizardScene(
    'signup',
    async (ctx) => {
        try {
            if (await db.query(`SELECT * FROM chat WHERE id_telegram = '${ctx.message.chat.id}'`).then(res => res.rowCount != 0)) {
                global.message.push({
                    callback: async () => {
                        ctx.replyWithHTML(`Чат уже зарегистрирован!`, Markup.removeKeyboard())
                    }
                })
                ctx.scene.leave()
            } else {
                global.message.push({
                    callback: async () => {
                        ctx.replyWithHTML(`Введите код для регистрации, получить его можно тут @communication_chio`, Markup.keyboard(['отменить']))
                    }
                })
                ctx.wizard.next()
            }
        } catch (err) {
            console.log(err)
        }
    },
    async (ctx) => {
        try {
            if (ctx.message.text.trim() == 'отменить') {
                global.message.push({
                    callback: async () => {
                        ctx.replyWithHTML(`Вы отменили регистрацию!\nЗарегистрировать чат можно в любой момент`, Markup.removeKeyboard())
                    }
                })
                ctx.scene.leave()
            } else {
                if (await db.query(`SELECT * FROM chat WHERE code = '${ctx.message.text.trim()}'`).then(res => {
                    return res.rowCount != 0
                })) {
                    await db.query(`UPDATE chat set id_telegram = '${ctx.message.chat.id}' WHERE code = '${ctx.message.text.trim()}'`).then(res => {
                        global.message.push({
                            callback: async () => {
                                ctx.replyWithHTML(`Чат успешно зарегистрирован!`, Markup.removeKeyboard())
                            }
                        })
                        ctx.scene.leave()
                    })
                } else {
                    global.message.push({
                        callback: async () => {
                            ctx.replyWithHTML(`Не действительный код для регистрации!\nВведите код для регистрации еще раз`, Markup.keyboard(['отмена']))
                        }
                    })
                }
            }
        } catch (err) {
            console.log(err)
        }
    },
)
