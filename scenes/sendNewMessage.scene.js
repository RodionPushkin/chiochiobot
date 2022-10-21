const {Scenes, Markup} = require('telegraf')
const config = require('../config.json')
const notification = require("../lib/notification");
const db = require("../database");
let message = null;
module.exports = new Scenes.WizardScene(
    'sendNewMessage',
    async (ctx) => {
        try {
            global.message.push({
                callback: async () => {
                    return await ctx.replyWithHTML(`Введите сообщение`, Markup.keyboard([['Отменить']]).resize().oneTime())
                }
            })
            ctx.state.message = null
            ctx.wizard.next()
        } catch (err) {
            console.log(err)
        }
    },
    async (ctx) => {
        try {
            if(ctx.message?.text.toLowerCase() == "отменить"){
                global.message.push({
                    callback: async () => {
                        return await ctx.replyWithHTML('Вы отменили действие!',Markup.removeKeyboard())
                    }
                })
                ctx.scene.leave()
                global.message.push({
                    callback: async () => {
                        return await ctx.replyWithHTML('Меню', Markup.inlineKeyboard([
                            [{text: 'Инфо', callback_data: 'menu-info'}],
                            [{text: 'Сгенерировать код', callback_data: 'menu-generate'}],
                            [{text: 'Рассылка', callback_data: 'menu-send'}]
                        ]).resize())
                    }
                })
            }else if (ctx.message?.text?.toLowerCase() == "да") {
                global.message.push({
                    callback: async () => {
                        return await ctx.replyWithHTML(`Сообщение отправлено!`, Markup.removeKeyboard())
                    }
                })
                if (message.photo && message.photo[0]?.file_id) {
                    db.query(`SELECT * FROM chat WHERE id_telegram IS NOT null and deleted = false`).then(res=>res.rows).then(res=>{
                        // res.forEach(chat=>{
                        //     if (message.text) {
                        //         global.message.push({
                        //             callback: async () => {
                        //                 return await ctx.telegram.sendPhoto(Number(chat.id_telegram), message.photo[0].file_id, {caption: message.text.replace('%%user%%', chat.appeal ? chat.appeal : chat.title)})
                        //             }
                        //         })
                        //     } else {
                        //         global.message.push({
                        //             callback: async () => {
                        //                 return await ctx.telegram.sendPhoto(Number(chat.id_telegram), message.photo[0].file_id)
                        //             }
                        //         })
                        //     }
                        // })
                    })
                } else if (message.document && message.document.file_id) {
                    db.query(`SELECT * FROM chat WHERE id_telegram IS NOT null and deleted = false`).then(res=>res.rows).then(res=>{
                        res.forEach(chat=>{
                            if (message.text) {
                                global.message.push({
                                    callback: async () => {
                                        return await ctx.telegram.sendDocument(Number(chat.id_telegram), message.document.file_id, {caption: message.text.replace('%%user%%', chat.appeal ? chat.appeal : chat.title)})
                                    }
                                })
                            } else {
                                global.message.push({
                                    callback: async () => {
                                        return await ctx.telegram.sendDocument(Number(chat.id_telegram), message.document.file_id)
                                    }
                                })
                            }
                        })
                    })
                } else {
                    db.query(`SELECT * FROM chat WHERE id_telegram IS NOT null and deleted = false`).then(res=>res.rows).then(res=>{
                        res.forEach(chat=>{
                            global.message.push({
                                callback: async () => {
                                    return await ctx.telegram.sendMessage(Number(chat.id_telegram), message.text.replace('%%user%%', chat.appeal ? chat.appeal : chat.title))
                                }
                            })
                        })
                    })
                }
                ctx.scene.leave()
            } else if (ctx.message?.text?.toLowerCase() == "нет") {
                global.message.push({
                    callback: async () => {
                        return await ctx.replyWithHTML(`Введите сообщение`, Markup.removeKeyboard())
                    }
                })
            } else {
                message = {
                    text: ctx.message.text ? ctx.message.text : ctx.message.caption ? ctx.message.caption : undefined,
                    document: ctx.message.document,
                    photo: ctx.message.photo
                }
                if (message.photo && message.photo[0]?.file_id) {
                    global.message.push({
                        callback: async () => {
                            return await ctx.replyWithHTML(`Проверьте ваше сообщение на точность, всё ли верно?`, Markup.keyboard([['Нет', 'Да'],['Отменить']]).resize().oneTime()).then(async () => {
                                await ctx.replyWithPhoto(message.photo[0].file_id, {caption: message.text})
                            })
                        }
                    })
                } else if (message.document && message.document.file_id) {
                    global.message.push({
                        callback: async () => {
                            return await ctx.replyWithHTML(`Проверьте ваше сообщение на точность, всё ли верно?`, Markup.keyboard([['Нет', 'Да'],['Отменить']]).resize().oneTime()).then(async () => {
                                await ctx.replyWithDocument(message.document.file_id, {caption: message.text})
                            })
                        }
                    })

                } else {
                    global.message.push({
                        callback: async () => {
                            return await ctx.replyWithHTML(`Вы ввели: "${message.text}", проверьте на точность, всё ли верно?`, Markup.keyboard([['Нет', 'Да'],['Отменить']]).resize().oneTime())
                        }
                    })
                }
            }
        } catch (err) {
            console.log(err)
        }
    },
)
