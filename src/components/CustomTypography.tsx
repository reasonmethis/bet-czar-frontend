import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles"

const linkSeparatorToken = " ##"

const CustomLink = styled(Link)(({ theme }) => ({
    underline: "hover",
    //textDecoration: "none",
    //color: `${theme.palette.text.primary}`, //`${theme.palette.primary.main}`
    target: "_blank",
    rel: "noopener",    
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
                const [trueTxt, link] = txt.split(linkSeparatorToken)
                return (
                  <CustomLink href={link}>
                    {trueTxt}
                  </CustomLink>
                );
            default:
      return <Typography component="span">{txt}</Typography>;
  }
}

export default CustomTypography;
