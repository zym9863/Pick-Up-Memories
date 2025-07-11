import { useEffect } from 'react';
import { ThemeProvider } from './components/ThemeProvider';
import { HomePage } from './components/HomePage';
import { notificationService } from './services/notification';

function App() {
  // 初始化通知服务
  useEffect(() => {
    console.log('App: Initializing notification service...');
    notificationService.initialize();

    // 清理函数
    return () => {
      notificationService.cleanup();
    };
  }, []);

  return (
    <ThemeProvider>
      <HomePage />
    </ThemeProvider>
  );
}

export default App;
