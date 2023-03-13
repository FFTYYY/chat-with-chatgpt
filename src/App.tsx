import React from "react"
import {app} from "electron"
import fs from "fs"
import { 
    Box , Button , Icon, IconButton , TextField ,
    List , ListItem, Typography , Menu , MenuItem , 
    ThemeProvider, 
    createTheme,
    Paper, 
} from "@mui/material"
import {
    AcUnit as AcUnitIcon  , 
    Close as CloseIcon , 
    Settings as SettingsIcon , 
} from "@mui/icons-material"
import {
    get_chat , 

    Message , 
} from "./openai"
import * as default_config from "../default_config.json"
import {
    AutoStack, AutoTooltip
} from "./autodirection"
import { my_theme } from "./theme"

import "overlayscrollbars/overlayscrollbars.css"
import { OverlayScrollbars } from "overlayscrollbars"
import { produce } from "immer"

interface Config{
    now_char: string 
    key: string 
    characters: {
        [name: string]:Message []
    }
    prefixes: {
        [name: string]: (Message []) | {
            [name: string]: (Message [])
        }
    }
}

function SelectPrefix(props: {
    options: string[] 
    onSelect: (s: string)=>any 
}){
    let [but_ele , set_but_ele] = React.useState(undefined)
    return <React.Fragment>
        <AutoTooltip title = "预设">
            <IconButton onClick={(e)=>{
                set_but_ele(e.currentTarget)
            }}>
                <AcUnitIcon fontSize="small"/>
            </IconButton>
        </AutoTooltip>
        <Menu
            anchorEl = {but_ele}
            open     = {Boolean(but_ele)}
            onClose  = {()=>{set_but_ele(undefined)}}
        >{
            props.options.map((str)=>{
                return <MenuItem onClick={()=>{
                    set_but_ele(undefined)
                    props.onSelect(str)
                }}>{str}</MenuItem>
            })
        }</Menu>
    </React.Fragment>
}

class App extends React.Component<{} , {
    text: string
    focus: boolean
    history: Message[]
    config: Config
}>{
    divref: React.RefObject<HTMLDivElement>
    os: OverlayScrollbars
    constructor(props: any){
        super(props)

        this.state = {
            text: "hello!" , 
            focus: false , 
            history: [] , 
            config: default_config , 
        }

        this.divref = React.createRef()
        this.os = undefined
    }

    get_config_char(config?: Config): Message[]{
        if(!config){
            config = this.state.config
        }
        if((!config.now_char) || (!config.characters[config.now_char]))
            return []
        return config.characters[config.now_char]
    }

    get_config_prompt(now_prox: string): Message[]{
    
        let conf = this.state.config
        let now_char = conf.now_char

        if((!now_prox) || (!conf.prefixes[now_prox]))
            return []
        let prefix = conf.prefixes[now_prox]
        if(Array.isArray(prefix)){
            return prefix
        }
        if(now_char && prefix[now_char]){
            prefix = prefix[now_char]
        }
        else{
            prefix = prefix?.default
        }
        if((!prefix) || (!Array.isArray(prefix))){
            return []
        }
        return prefix
    }

    make_prompt(prompt: Message[]){
        return produce(prompt, oldprompt => {
            let me = this
            for(let x of oldprompt){
                x.content = x.content.replace("${text}", me.state.text)
            }
            return oldprompt
        })
    }

    // TODO 更新历史，不要太长。
    on_get_text(text: string){
        let me = this
        this.setState({
            text: text,
        })
    }
    on_get_config(config_str: string){
        let me = this
        let config = JSON.parse(config_str)
        this.setState({
            config: config, 
        })
    }

    componentDidMount(): void {
        let me = this
        let W = window as any

        if(W.electronAPI){
            W.electronAPI.onUpdateCounter((event, text: string)=>{
                if(text.length > 2000){
                    text = text.slice(0,2000)
                }
                me.on_get_text(text)
            })

            W.electronAPI.onLoadedConfig((event, config_str: string)=>{
                me.on_get_config(config_str)
            })

            W.electronAPI.ImOpen() // 通知主进程自己已经初始化完毕
        }
        else{ // debug
            me.on_get_text(
                "其实所谓的社交恐惧症，那帮人有着奇怪的优越感，是相当自负的。" + 
                "他们不愿意去认识他人，也不愿意被别人认识，自以为自己高人一等，" + 
                "自以为自己的这一片天地就已经足够了，其实他们只是井底之蛙"
            )
            me.on_get_config(JSON.stringify(default_config))
        }

        // 创建滚动条
        while(!(this.divref && this.divref.current)); // 等待ref创建
        this.os = OverlayScrollbars(this.divref.current, {
            scrollbars:{
                autoHide: "leave", 
                autoHideDelay: 700 , 
            }
        });

    }

    async post_message(pre_prompt: Message[]) {
        let me = this

        let post_prompt  = me.make_prompt(pre_prompt)
        let post_history = me.make_prompt(me.state.history)

        
        this.setState({history:[
            ...me.state.history ,   // 对话历史 
            ...post_prompt ,        // XXX 应该是pre还是post呢
        ]})


        let responce = await get_chat([
            ...me.get_config_char() ,   // 初始设定
            ...post_history.slice(0,10),  // 对话历史
            ...post_prompt ,            // 本次发言
        ] , me.state.config.key)

        let responce_msg = [{role: "assistant" , content: responce , }]
        if(!responce){
            responce_msg = [{role: "system", content: "出错了..."}]
        }

        this.setState({history:[
            ...me.state.history ,   // 对话历史 
            ...responce_msg ,       // 把回复放进历史
        ]})

        
    }

    render(){
        let me = this

        let mouseenter = ()=>{
            let W = window as any
            if(W.electronAPI) 
                W.electronAPI.MouseEnter()
            else 
                console.log("mouse enter!") 
        }
        let mouseleave = ()=>{
            let W = window as any
            if(W.electronAPI) 
                W.electronAPI.MouseLeave()
            else 
                console.log("mouse out!") 
        }

        return <ThemeProvider theme={createTheme(my_theme)}><div
            onMouseOver  = {mouseenter}
            onMouseLeave = {mouseleave}
            onMouseEnter = {mouseenter}
            // onMouseOut   = {mouseleave}
        ><Paper
            style = {{
                width: "550px" , 
                height: "350px" , 
                paddingLeft: "0.5rem" , 
                paddingTop: "1rem" , 
                paddingRight: "1rem" , 
                paddingBottom: "0.5rem" , 
                overflow: "auto" , 
            }}
            ref = {me.divref}
            data-overlayscrollbars = ""
        ><AutoStack force_direction="column">
            <Box sx={{width: "100%"}}><AutoStack>
                <SelectPrefix 
                    options  = {Object.keys(me.state.config.prefixes)} 
                    onSelect = {(selection:string)=>{
                        let prompt = me.get_config_prompt(selection)
                        me.post_message(prompt)
                    }} 
                />
                <TextField 
                    label = "说点啥（ctrl+回车发送）" 
                    variant = "outlined" 
                    onKeyDown={(e)=>{
                        if(e.ctrlKey && e.key == "Enter"){
                            let tar = e.target as any
                            let text = tar.value as string
                            tar.value = ""
                            me.post_message([{role: "user" , content: text}])
                        }
                    }}
                    sx = {{width: "100%"}}
                    size = "small"
                />
                <AutoTooltip title="打开设置文件"><IconButton onClick = {()=>{
                    let W = window as any
                    if(W.electronAPI){
                        W.electronAPI.OpenConfig()
                    }
                    else{
                        console.log("setting!")
                    }
                }}>
                    <SettingsIcon fontSize = "small"/>
                </IconButton></AutoTooltip>
                <AutoTooltip title="关闭"><IconButton onClick = {()=>{
                    let W = window as any
                    if(W.electronAPI){
                        W.electronAPI.IWantToClose()
                    }
                    else{
                        console.log("close!")
                    }
                }}>
                    <CloseIcon fontSize = "small"/>
                </IconButton></AutoTooltip>

            </AutoStack></Box>
            <List>{[...me.state.history].reverse().map((element, key)=>{
                return <ListItem key = {key}>
                    <Typography>{element.role}: {element.content}</Typography>
                </ListItem>
            })}</List>
        </AutoStack></Paper></div></ThemeProvider>
    }
}

export default App