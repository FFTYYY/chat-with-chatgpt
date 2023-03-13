import axios from "axios"

export {
    get_chat
}
export type {
    Message
}
interface Message{
    role: "user" | "assistant" | "system" | string
    content: string
}

async function get_chat(prompt: Message [], openai_key: string){

    let responce = (await axios.post("https://api.openai.com/v1/chat/completions" , {
        "model": "gpt-3.5-turbo",
        "messages": prompt ,       
    }, {
        headers: {
            "Content-Type": "application/json" , 
            "Authorization": `Bearer ${openai_key}`
        }
    })).data
    if(responce.choices && responce.choices.length > 0){
        return responce.choices[0].message?.content
    }
    return undefined
}