import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

const linkSeparatorToken = " ##";

const CustomLink = styled(Link)(({ theme }) => ({
  underline: "hover",
  //target: "_blank",
  //rel: "noopener", //this and target don't work here, must specify when invoked
}));

type CustomTypographyPropsT = {
  text: string;
};
function CustomTypography({ text }: CustomTypographyPropsT) {
  const ind = text.indexOf(":");
  const selector = ind + 1 ? text.slice(0, ind) : "";
  const txt = text.slice(ind + 1);
  switch (selector) {
    case "B":
      return (
        <Typography component="span" fontWeight="bold">
          {txt}
        </Typography>
      );
    case "P":
      return (
        <Typography component="span" color="primary">
          {txt}
        </Typography>
      );
    case "S":
      return (
        <Typography component="span" color="secondary">
          {txt}
        </Typography>
      );
    case "L":
      const [trueTxt, link] = txt.split(linkSeparatorToken);
      return (
        // https://mui.com/material-ui/react-link/
        <CustomLink href={link} target="_blank" rel="noopener">
          {trueTxt}
        </CustomLink>
      );
    default:
      return <Typography component="span">{txt}</Typography>;
  }
}

export default CustomTypography;
