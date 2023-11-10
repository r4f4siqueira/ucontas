import { Box, Button, Container, Typography } from '@mui/material';
import ResponsiveAppBar from '../components/ResponsiveAppBar';

export default function WelcomePage() {
    return (
        <Box>
            <ResponsiveAppBar links={['Lear More', 'Description', 'Docs']} />
            <Container maxWidth="xl">
                <Typography variant="h1">Home</Typography>
                <Button
                    variant="contained"
                    href="/dashboard"
                >
                    Login
                </Button>
            </Container>
        </Box>
    );
}
