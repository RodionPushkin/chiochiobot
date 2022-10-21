const {Scenes, Markup} = require('telegraf')
const md5 = require("md5");
const db = require('../database')
let message = {};
module.exports = new Scenes.WizardScene(
    'generate',
    async (ctx) => {
        try {
            global.message.push({
                callback: async () => {
                    ctx.replyWithHTML(`Введите название организации (как имя файла для отправки)`, Markup.keyboard([[{text: "Отменить"}]]).resize().oneTime()).then(() => {
                        global.message.push({
                            callback: async () => {
                                ctx.replyWithHTML(`Напоминание: По этому имени бот будет искать файлы и отправлять в нужный чат`)
                            }
                        })
                    })
                }
            })
            ctx.wizard.next()
        } catch (err) {
            console.log(err)
        }
    },
    async (ctx) => {
        try {
            if (ctx.message?.text.toLowerCase() == "отменить") {
                global.message.push({
                    callback: async () => {
                        return await ctx.replyWithHTML('Вы отменили действие!', Markup.removeKeyboard())
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
            } else if (ctx.message.text.toLowerCase() == "да") {
                if (message.title) {
                    global.message.push({
                        callback: async () => {
                            ctx.replyWithHTML(`Введите обращение к организации`, Markup.keyboard([[{text: "Пропустить"}], [{text: "Отменить"}]]).resize().oneTime()).then(() => {
                                global.message.push({
                                    callback: async () => {
                                        ctx.replyWithHTML(`Напоминание: Некоторые сообщения будут включать это обращение`)
                                    }
                                })
                            })
                        }
                    })
                    ctx.wizard.next()
                }
            } else if (ctx.message.text.toLowerCase() == "нет") {
                global.message.push({
                    callback: async () => {
                        ctx.replyWithHTML(`Введите название организации (как имя файла для отправки)`, Markup.keyboard([[{text: "Отменить"}]]).resize().oneTime()).then(() => {
                            global.message.push({
                                callback: async () => {
                                    ctx.replyWithHTML(`Напоминание: По этому имени бот будет искать файлы и отправлять в нужный чат`)
                                }
                            })
                        })
                    }
                })
            } else {
                message.title = ctx.message.text
                global.message.push({
                    callback: async () => {
                        ctx.replyWithHTML(`Вы ввели: "${message.title}", проверьте на точность, всё верно?`, Markup.keyboard([['Нет', 'Да'], [{text: "Отменить"}]]).resize().oneTime())
                    }
                })
            }
        } catch (err) {
            console.log(err)
        }
    },
    async (ctx) => {
        try {
            if (ctx.message?.text.toLowerCase() == "отменить") {
                global.message.push({
                    callback: async () => {
                        return await ctx.replyWithHTML('Вы отменили действие!', Markup.removeKeyboard())
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
            } else if (ctx.message.text.toLowerCase() == "да" || ctx.message.text.toLowerCase() == "пропустить") {
                if (message.appeal || message.title) {
                    const code = md5(message.title + new Date())
                    global.message.push({
                        callback: async () => {
                            return await
                                ctx.replyWithHTML(`Скопируйте сообщение ниже и отправьте нужному клиенту`, Markup.removeKeyboard()).then(() => {
                                    db.query(`INSERT INTO chat (title, code,appeal) VALUES ('${message.title}', '${code}',${message?.appeal ? "'"+message.appeal+"'" : "null"})`).then(() => {
                                        ctx.replyWithHTML(`Ваш код: ${code}`)
                                        ctx.scene.leave()
                                    })
                                })
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
            } else if (ctx.message.text.toLowerCase() == "нет") {
                global.message.push({
                    callback: async () => {
                        ctx.replyWithHTML(`Введите обращение к организации`, Markup.keyboard([[{text: "Отменить"}]]).resize().oneTime()).then(() => {
                            global.message.push({
                                callback: async () => {
                                    ctx.replyWithHTML(`Напоминание: Некоторые сообщения будут включать это обращение`)
                                }
                            })
                        })
                    }
                })
            } else {
                message.appeal = ctx.message.text
                global.message.push({
                    callback: async () => {
                        ctx.replyWithHTML(`Вы ввели: "${message.appeal}", проверьте на точность, всё верно?`, Markup.keyboard([['Нет', 'Да'], [{text: "Отменить"}]]).resize().oneTime())
                    }
                })
            }
        } catch (err) {
            console.log(err)
        }
    },
)
