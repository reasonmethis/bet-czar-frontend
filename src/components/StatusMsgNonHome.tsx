import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import BarChartIcon from "@mui/icons-material/BarChart";

export const StatusMsgNonHome = ({ txt }: {txt: string}) => {
  return(
  <Stack direction="row" flexWrap="wrap" justifyContent="center">
    <BarChartIcon sx={{ mr: 1 }} />
    <Typography variant="body2" sx={{ pt: "0.2rem" }}>
      {txt}
    </Typography>
  </Stack>)
};
