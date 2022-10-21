global.message = []
let currentMessage = null;
setInterval(()=>{
    if(global.message.length > 0 && currentMessage == null && global.message[0]){
        currentMessage = global.message[0]
        try{
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
},35)
