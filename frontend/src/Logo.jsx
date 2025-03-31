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
      <circle 
        cx="12" 
        cy="12" 
        r="9" 
        stroke="currentColor" 
        strokeWidth="2" 
        fill="none"
      />
      <path 
        d="M7 12h10" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
    </Box>
  );
};

export default Logo; 