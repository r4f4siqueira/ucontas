import { Box, Button, Container, Typography } from '@mui/material';
import ResponsiveAppBar from '../components/ResponsiveAppBar';
export default function Teste() {
    return (
        <Box>
            <ResponsiveAppBar avatarUrl={''} />
            <Container maxWidth="xl">
                <Typography variant="h1">Dashboard</Typography>
                <Button
                    variant="outlined"
                    color="success"
                    href="/"
                >
                    Back to Home
                </Button>
            </Container>
        </Box>
    );
}
