const {Markup} = require("telegraf");
global.message = []
let currentMessage = null;
let time = 0
setInterval(()=>{
    if(global.message.length > 0 && currentMessage == null && global.message[0]){
        currentMessage = global.message[0]
        try{
            // console.log(currentMessage.callback)
            // console.log(`message: '${currentMessage.text}', arraylenght: ${message.length}, time: ${Math.floor(time/1000)}`)
            currentMessage.callback().then(res=>{
                console.log('отправлено')
                global.message.splice(global.message.indexOf(currentMessage),1)
                currentMessage = null
            })
        }catch (e) {
            console.log(e)
            currentMessage = null
        }
    }
    time+=35
},35)
