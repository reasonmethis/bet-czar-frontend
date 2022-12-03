import Typography from "@mui/material/Typography";

export const PageHeading = ({ text }: { text: string }) => {
  return (
    <Typography variant="h5" textAlign="center" gutterBottom paragraph color="secondary.main">
      {text}
    </Typography>
  );
};
