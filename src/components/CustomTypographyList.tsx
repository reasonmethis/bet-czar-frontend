import Typography from "@mui/material/Typography"
import CustomTypography from './CustomTypography'
type CustomTypographyListPropsT = {
    parts: string[] 
}

export default function CustomTypographyList({parts}: CustomTypographyListPropsT) {
  return <Typography paragraph>{
    parts.map((part, ind) => 
    <CustomTypography key={ind} text={part}></CustomTypography>)
    }</Typography>
}
