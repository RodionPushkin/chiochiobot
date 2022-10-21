const {Scenes, Markup} = require('telegraf')
const config = require('../config.json')
const notification = require("../lib/notification");
const db = require('../database')
const fs = require('fs')
let path = String(__dirname).split(`\\`)
path.pop()
path = path.join('\\')+"\\files"
let message = null;
module.exports = new Scenes.WizardScene('sendMessage', async (ctx) => {
    try {
        global.message.push({
            callback: async () => {
                ctx.replyWithHTML(`Вы желаете сделать рассылку по папкам или новое общее сообщение?`, Markup.keyboard([['Рассылка по папкам','Общее сообщение'],['Отменить']]).oneTime().resize())
            }
        })
        ctx.state.message = null
        ctx.wizard.next()
    } catch (err) {
        console.log(err)
    }
}, async (ctx) => {
    try {
        if (ctx.message?.text?.toLowerCase() == "рассылка по папкам") {
            let buttons = []
            fs.readdir(path, (err, files) => {
                let filesArray = files.filter(item=> item != 'DEFAULT')
                for (let i = 0; i < filesArray.length; i++) {
                    let file = filesArray[i]
                    buttons.push([{text: file, callback_data: file}])
                    if (i == filesArray.length - 1) {
                        global.message.push({
                            callback: async () => {
                                ctx.replyWithHTML(`Пожалуйста выберите папку:`, Markup.inlineKeyboard(buttons))
                                ctx.scene.leave()
                            }
                        })
                    }
                }
            })
        }
        else if(ctx.message?.text?.toLowerCase() == "общее сообщение"){
            ctx.scene.leave()
            ctx.scene.enter('sendNewMessage')
        }
        else if(ctx.message?.text?.toLowerCase() == "отменить"){
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
        }
    } catch (err) {
        console.log(err)
    }
})
