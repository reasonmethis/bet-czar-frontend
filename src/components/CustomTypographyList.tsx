import Typography from "@mui/material/Typography"
import CustomTypography from './CustomTypography'
type CustomTypographyListPropsT = {
    parts: string[],
    isParagraph: boolean
}

export default function CustomTypographyList(props: CustomTypographyListPropsT) {
  return <Typography paragraph={props.isParagraph}>{
    props.parts.map((part, ind) => 
    <CustomTypography key={ind} text={part}></CustomTypography>)
    }</Typography>
}
