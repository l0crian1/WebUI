import { Box } from '@mui/material';

const Logo = (props) => {
  return (
    <Box
      component="svg"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      sx={{ width: 40, height: 40, mr: 1, ...props.sx }}
    >
      <path
        d="M12 2L2 7L12 12L22 7L12 2Z"
        fill="#5bbfea"
        stroke="#5bbfea"
        strokeWidth="1"
      />
      <path
        d="M2 12L12 17L22 12"
        stroke="#5bbfea"
        strokeWidth="1"
      />
      <path
        d="M2 17L12 22L22 17"
        stroke="#5bbfea"
        strokeWidth="1"
        opacity="0.5"
      />
    </Box>
  );
};

export default Logo; 