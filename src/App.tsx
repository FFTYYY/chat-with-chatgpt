import React from "react"
import { Box , Button } from "@mui/material"

class App extends React.Component<{} , {
    text: string
}>{
    constructor(props: any){
        super(props)

        this.state = {
            text: "hello!"
        }
    }

    componentDidMount(): void {
        let me = this
        let W = window as any
        console.log(W.electronAPI)
        W.electronAPI.onUpdateCounter((event, text)=>{
            me.setState({text: me.state.text + "!"})
            console.log(text)
            console.log(me.state.text)
        })
    }

    render(){
        let me = this
        return <Button>
            {me.state.text}
        </Button>
    }
}

export default App