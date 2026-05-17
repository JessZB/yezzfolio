import { createTheme } from '@mui/material/styles';

/**
 * MUI Theme configuration that bridges with our custom Vanilla CSS variables.
 * This ensures consistency across the app even when using full MUI components.
 */
export const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#5BD4E8', // Matches var(--accent)
    },
    background: {
      default: '#0a0a0c', // Matches var(--bg-dark)
      paper: 'rgba(20, 20, 25, 0.7)', // Matches var(--bg-card)
    },
    text: {
      primary: '#f0f0f2', // Matches var(--text-primary)
      secondary: '#94a3b8', // Matches var(--text-secondary)
    },
  },
  typography: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  components: {
    // Override Paper to ensure Dialogs and Snackbars have the glassmorphism look
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(20, 20, 25, 0.7)', // var(--bg-card)
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)', // var(--border-glass)
          backgroundImage: 'none', // Removes MUI's default elevation overlay
          borderRadius: '0.5rem', // var(--radius-md)
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '0.25rem', // var(--radius-sm)
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          '&::after': {
             background: 'linear-gradient(90deg, transparent, rgba(91, 212, 232, 0.1), transparent)',
          }
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
           // Ensure the dialog itself follows the glass card pattern
           backgroundImage: 'none',
        }
      }
    }
  },
});
