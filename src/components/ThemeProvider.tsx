import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
  CssBaseline,
  GlobalStyles
} from '@mui/material';
import { zhCN } from '@mui/material/locale';
import { useAppStore } from '../stores/useAppStore';

// 创建主题上下文
const ThemeContext = createContext<{
  toggleTheme: () => void;
  isDarkMode: boolean;
}>({
  toggleTheme: () => {},
  isDarkMode: false
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { settings, updateSettings } = useAppStore();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 从设置中获取主题模式
  useEffect(() => {
    if (settings?.theme) {
      setIsDarkMode(settings.theme.mode === 'dark');
    }
  }, [settings]);

  // 切换主题
  const toggleTheme = async () => {
    const newMode = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    
    if (settings) {
      await updateSettings({
        theme: {
          ...settings.theme,
          mode: newMode
        }
      });
    }
  };

  // 创建主题
  const theme = createTheme(
    {
      palette: {
        mode: isDarkMode ? 'dark' : 'light',
        primary: {
          main: settings?.theme?.primaryColor || '#1976d2',
          light: isDarkMode ? '#64b5f6' : '#42a5f5',
          dark: isDarkMode ? '#1565c0' : '#1565c0',
        },
        secondary: {
          main: '#ff9800',
          light: '#ffb74d',
          dark: '#f57c00',
        },
        background: {
          default: isDarkMode ? '#121212' : '#fafafa',
          paper: isDarkMode ? '#1e1e1e' : '#ffffff',
        },
        text: {
          primary: isDarkMode ? '#ffffff' : '#333333',
          secondary: isDarkMode ? '#b0b0b0' : '#666666',
        },
        warning: {
          main: '#ff9800',
          light: '#ffb74d',
          dark: '#f57c00',
        },
        error: {
          main: '#f44336',
          light: '#e57373',
          dark: '#d32f2f',
        },
        success: {
          main: '#4caf50',
          light: '#81c784',
          dark: '#388e3c',
        },
        info: {
          main: '#2196f3',
          light: '#64b5f6',
          dark: '#1976d2',
        },
      },
      typography: {
        fontFamily: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Microsoft YaHei"',
          '"SimSun"',
        ].join(','),
        h1: {
          fontSize: '2.5rem',
          fontWeight: 600,
          lineHeight: 1.2,
        },
        h2: {
          fontSize: '2rem',
          fontWeight: 600,
          lineHeight: 1.3,
        },
        h3: {
          fontSize: '1.75rem',
          fontWeight: 600,
          lineHeight: 1.3,
        },
        h4: {
          fontSize: '1.5rem',
          fontWeight: 600,
          lineHeight: 1.4,
        },
        h5: {
          fontSize: '1.25rem',
          fontWeight: 600,
          lineHeight: 1.4,
        },
        h6: {
          fontSize: '1.125rem',
          fontWeight: 600,
          lineHeight: 1.4,
        },
        body1: {
          fontSize: '1rem',
          lineHeight: 1.6,
        },
        body2: {
          fontSize: '0.875rem',
          lineHeight: 1.6,
        },
        caption: {
          fontSize: '0.75rem',
          lineHeight: 1.4,
        },
      },
      shape: {
        borderRadius: 12,
      },
      components: {
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 16,
              boxShadow: isDarkMode 
                ? '0 4px 20px rgba(0,0,0,0.3)' 
                : '0 4px 20px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease-in-out',
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              textTransform: 'none',
              fontWeight: 600,
              padding: '8px 16px',
            },
            contained: {
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              },
            },
          },
        },
        MuiFab: {
          styleOverrides: {
            root: {
              boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
              '&:hover': {
                boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
              },
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                borderRadius: 8,
              },
            },
          },
        },
        MuiDialog: {
          styleOverrides: {
            paper: {
              borderRadius: 16,
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              borderRadius: 16,
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
            },
          },
        },
      },
    },
    zhCN
  );

  // 全局样式
  const globalStyles = (
    <GlobalStyles
      styles={{
        '*': {
          boxSizing: 'border-box',
        },
        html: {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        body: {
          margin: 0,
          padding: 0,
          fontFamily: theme.typography.fontFamily,
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
          transition: 'background-color 0.3s ease, color 0.3s ease',
        },
        '#root': {
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        },
        // 自定义滚动条
        '::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '::-webkit-scrollbar-track': {
          background: isDarkMode ? '#2e2e2e' : '#f1f1f1',
          borderRadius: '4px',
        },
        '::-webkit-scrollbar-thumb': {
          background: isDarkMode ? '#555' : '#c1c1c1',
          borderRadius: '4px',
          '&:hover': {
            background: isDarkMode ? '#777' : '#a8a8a8',
          },
        },
        // 选中文本样式
        '::selection': {
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
        },
        // 音频控件样式
        'audio': {
          width: '100%',
          height: '40px',
          outline: 'none',
          '&::-webkit-media-controls-panel': {
            backgroundColor: isDarkMode ? '#2e2e2e' : '#f5f5f5',
          },
        },
        // 图片样式
        'img': {
          maxWidth: '100%',
          height: 'auto',
        },
        // 链接样式
        'a': {
          color: theme.palette.primary.main,
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          },
        },
        // 代码样式
        'code': {
          fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
          backgroundColor: isDarkMode ? '#2e2e2e' : '#f5f5f5',
          padding: '2px 4px',
          borderRadius: '4px',
          fontSize: '0.875em',
        },
        'pre': {
          fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
          backgroundColor: isDarkMode ? '#2e2e2e' : '#f5f5f5',
          padding: '16px',
          borderRadius: '8px',
          overflow: 'auto',
          '& code': {
            backgroundColor: 'transparent',
            padding: 0,
          },
        },
      }}
    />
  );

  return (
    <ThemeContext.Provider value={{ toggleTheme, isDarkMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {globalStyles}
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
