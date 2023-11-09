import { Box, Button, Typography } from '@mui/material';

export default function Home() {
    return (
        <Box>
            <Typography variant="h1">Home</Typography>
            <Button
                variant="contained"
                href="/dashboard"
            >
                Dashboard
            </Button>
        </Box>
    );
}
