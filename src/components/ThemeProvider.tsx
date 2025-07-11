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
          main: settings?.theme?.primaryColor || (isDarkMode ? '#bb86fc' : '#6750a4'),
          light: isDarkMode ? '#d7aefb' : '#9575cd',
          dark: isDarkMode ? '#985eff' : '#4527a0',
          contrastText: '#ffffff',
        },
        secondary: {
          main: isDarkMode ? '#03dac6' : '#006a6b',
          light: isDarkMode ? '#5dfdeb' : '#52a29d',
          dark: isDarkMode ? '#00a896' : '#004d40',
        },
        background: {
          default: isDarkMode ? '#0f0f0f' : '#fefbff',
          paper: isDarkMode ? '#1c1b1f' : '#ffffff',
        },
        text: {
          primary: isDarkMode ? '#e6e1e5' : '#1c1b1f',
          secondary: isDarkMode ? '#cac4d0' : '#49454f',
        },
        warning: {
          main: '#ff8f00',
          light: '#ffb300',
          dark: '#ff6f00',
        },
        error: {
          main: '#ba1a1a',
          light: '#de3730',
          dark: '#93000a',
        },
        success: {
          main: '#006e1c',
          light: '#4caf50',
          dark: '#004d40',
        },
        info: {
          main: '#0061a4',
          light: '#5a95f5',
          dark: '#003c75',
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
          '"Noto Sans SC"',
          '"SimSun"',
        ].join(','),
        h1: {
          fontSize: '2.5rem',
          fontWeight: 700,
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
        },
        h2: {
          fontSize: '2rem',
          fontWeight: 700,
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
        },
        h3: {
          fontSize: '1.75rem',
          fontWeight: 600,
          lineHeight: 1.3,
          letterSpacing: '-0.01em',
        },
        h4: {
          fontSize: '1.5rem',
          fontWeight: 600,
          lineHeight: 1.3,
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
          letterSpacing: '0.01em',
        },
        body2: {
          fontSize: '0.875rem',
          lineHeight: 1.6,
          letterSpacing: '0.01em',
        },
        caption: {
          fontSize: '0.75rem',
          lineHeight: 1.4,
        },
      },
      shape: {
        borderRadius: 16,
      },
      components: {
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 20,
              border: isDarkMode 
                ? '1px solid rgba(255,255,255,0.1)' 
                : '1px solid rgba(0,0,0,0.05)',
              boxShadow: isDarkMode 
                ? '0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)' 
                : '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: isDarkMode 
                  ? '0 12px 40px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3)' 
                  : '0 12px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08)',
              },
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 12,
              textTransform: 'none',
              fontWeight: 600,
              padding: '10px 20px',
              fontSize: '0.875rem',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            },
            contained: {
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
            },
            outlined: {
              border: '2px solid',
              '&:hover': {
                border: '2px solid',
                transform: 'translateY(-1px)',
              },
            },
          },
        },
        MuiFab: {
          styleOverrides: {
            root: {
              borderRadius: 20,
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'scale(1.05) translateY(-2px)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
              },
              '&:active': {
                transform: 'scale(0.98)',
              },
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                borderRadius: 12,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderWidth: '2px',
                  },
                },
                '&.Mui-focused': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderWidth: '2px',
                  },
                },
              },
            },
          },
        },
        MuiDialog: {
          styleOverrides: {
            paper: {
              borderRadius: 24,
              backdropFilter: 'blur(10px)',
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              borderRadius: 20,
              fontWeight: 500,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              },
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              borderRadius: 16,
            },
            elevation1: {
              boxShadow: isDarkMode 
                ? '0 4px 16px rgba(0,0,0,0.3)' 
                : '0 4px 16px rgba(0,0,0,0.08)',
            },
          },
        },
        MuiIconButton: {
          styleOverrides: {
            root: {
              borderRadius: 12,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'scale(1.05)',
                backgroundColor: isDarkMode 
                  ? 'rgba(255,255,255,0.1)' 
                  : 'rgba(0,0,0,0.04)',
              },
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              boxShadow: 'none',
              borderBottom: isDarkMode 
                ? '1px solid rgba(255,255,255,0.1)' 
                : '1px solid rgba(0,0,0,0.08)',
              backdropFilter: 'blur(10px)',
              backgroundColor: isDarkMode 
                ? 'rgba(28,27,31,0.8)' 
                : 'rgba(255,255,255,0.8)',
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
