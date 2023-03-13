import { ThemeOptions  } from "@mui/material"

export { my_theme }

const my_theme: ThemeOptions = {
    palette: {
        mode: "dark",
        primary: {
            main: "#ababab",
        },
        secondary: {
            main: "#ab99aa",
        },
        background: {
            default: "rgba(32,32,32,0.96)",
            paper: "rgba(32,48,48,1)",
        },
        text: {
            primary     : "#eeeeee",
            secondary   : "rgba(230,240,240,0.80)" , 
            disabled    : "rgba(210,210,210,0.5)",
        },
    },
} 
