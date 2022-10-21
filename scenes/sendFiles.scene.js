const {Scenes, Markup} = require('telegraf')
const config = require('../config.json')
const notification = require("../lib/notification");
const db = require('../database')
const fs = require('fs')
let path = String(__dirname).split(`\\`)
path.pop()
path = path.join('\\') + "\\files"
let folder = null;
module.exports = new Scenes.WizardScene('sendFiles', async (ctx) => {
    try {
        folder = ctx.state.folder
        global.message.push({
            callback: async () => {
                return await ctx.replyWithHTML(`Вы выбрали папку: "${ctx.state.folder}" всё верно?`,Markup.keyboard([[{text:"Да"},{text:"Нет"}],[{text:"Отменить"}]]).resize().oneTime())
            }
        })
        ctx.wizard.next()
    } catch (err) {
        console.log(err)
    }
},async (ctx) => {
    try {
        if(ctx.message?.text?.toLowerCase() == "да"){
            console.log(folder)
            global.message.push({
                callback: async () => {
                    return await ctx.replyWithHTML(`Отправка начата!`)
                }
            })
            global.message.push({
                callback: async () => {
                    return await ctx.replyWithHTML(`Напоминание: во время отправки файлов, бот ответит на ваши сообщения после отправки`)
                }
            })
            db.query(`SELECT * FROM chat WHERE id_telegram IS NOT null and deleted = false`).then(res=>res.rows).then(res=>{
                fs.readdir(path+"\\"+folder, (err, files) => {
                    for (let i = 0; i < files.length; i++) {
                        res.forEach(chat=>{
                            if(String(files[i]).split('.')[0] == chat.title){
                                let message = {
                                    file: `${path}\\${folder}\\${files[i]}`
                                }
                                if(files.indexOf('message_pic.jpg')) {
                                    message.photo =`${path}\\${folder}\\message_pic.jpg`
                                }else{
                                    message.default_photo = `${path}\\DEFAULT\\message_pic.jpg`
                                }
                                if(files.indexOf('message_text.txt')){
                                    fs.readFile(`${path}\\${folder}\\message_text.txt`, 'utf8',(err,data)=>{
                                        message.text = data
                                    })
                                }else{
                                    fs.readFile(`${path}\\DEFAULT\\message_text.txt`, 'utf8',(err,data)=>{
                                        message.default_text = data
                                    })
                                }
                                let interval = setInterval(()=>{
                                    if((message.text || message.default_text) && (message.photo || message.default_photo)){
                                        clearInterval(interval)
                                        global.message.push({
                                            callback: async () => {
                                                ctx.telegram.sendPhoto(chat.id_telegram, {source: message?.photo ? message.photo : message.default_photo},{caption: message?.text ? message.text : message.default_text})
                                                return await ctx.telegram.sendDocument(chat.id_telegram, {source: message.file})
                                            }
                                        })
                                    }
                                },10)
                            }
                        })
                    }
                })
                ctx.scene.leave()
            })
        }else if(ctx.message?.text?.toLowerCase() == "нет"){
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
        }else if(ctx.message?.text?.toLowerCase() == "отменить"){
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
        }
    } catch (err) {
        console.log(err)
    }
})
