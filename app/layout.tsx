import type { Metadata } from 'next';
import ResponsiveAppBar from './components/ResponsiveAppBar';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME } from './shared/constants/theme';

export const metadata: Metadata = {
    title: 'UContas',
    description: 'UContas insert description app/layout',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <ThemeProvider theme={THEME}>
                <CssBaseline />
                <body>{children}</body>
            </ThemeProvider>
        </html>
    );
}
