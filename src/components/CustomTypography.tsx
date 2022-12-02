import Typography from "@mui/material/Typography"
type CustomTypographyPropsT = {
    text: string 
}
function CustomTypography({text}: CustomTypographyPropsT) {
    const ind = text.indexOf(":")
    const selector = (ind + 1) ? text.slice(0, ind) : ""
    const txt = text.slice(ind + 1)
    switch (selector) {
        case "B":
            return (
                <Typography component="span" fontWeight="bold">{txt}</Typography>
            )
        default:
            return (
                <Typography component="span" >{txt}</Typography>
            )
    }
}

export default CustomTypography
