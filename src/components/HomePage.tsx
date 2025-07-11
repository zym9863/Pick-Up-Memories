import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Fab,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Backup as BackupIcon,
  Restore as RestoreIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon
} from '@mui/icons-material';
import { useAppStore } from '../stores/useAppStore';
import { useTheme } from './ThemeProvider';
import { RecordCard } from './RecordCard';
import { RecordEditor } from './RecordEditor';
import { RecordViewer } from './RecordViewer';
import { SealDialog } from './SealDialog';
import { EmotionalRecord, SortOption, SortDirection } from '../types';

export const HomePage: React.FC = () => {
  const {
    records,
    currentRecord,
    isLoading,
    error,
    filter,
    sort,
    isInitialized,
    initialize,
    resetInitialization,
    loadRecords,
    createRecord,
    updateRecord,
    deleteRecord,
    setCurrentRecord,
    sealRecord,
    unsealRecord,
    setFilter,
    setSort,
    getFilteredRecords,
    clearError,
    exportData,
    importData
  } = useAppStore();

  const { toggleTheme, isDarkMode } = useTheme();

  const [editorOpen, setEditorOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [sealDialogOpen, setSealDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<EmotionalRecord | undefined>();
  const [sealingRecordId, setSealingRecordId] = useState<string>('');
  const [searchText, setSearchText] = useState(filter.searchText || '');

  // 初始化应用 - 只在组件首次挂载时执行
  useEffect(() => {
    console.log('HomePage: Component mounted, checking initialization status...');
    console.log('HomePage: isInitialized:', isInitialized, 'isLoading:', isLoading);

    if (!isInitialized && !isLoading) {
      console.log('HomePage: Starting app initialization...');
      initialize().catch(error => {
        console.error('HomePage: Failed to initialize app:', error);
      });
    } else {
      console.log('HomePage: App already initialized or initializing, skipping...');
    }

    // 在开发模式下，React.StrictMode 会导致组件卸载后重新挂载
    // 这里添加清理函数来处理这种情况
    return () => {
      console.log('HomePage: Component unmounting...');
      // 在开发模式下重置初始化状态，允许重新初始化
      // 使用 import.meta.env 来检查开发模式
      if (import.meta.env.DEV) {
        resetInitialization();
      }
    };
  }, []); // 空依赖数组，确保只执行一次

  // 获取过滤后的记录
  const filteredRecords = getFilteredRecords();

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchText(value);
    setFilter({ searchText: value });
  };

  // 处理排序
  const handleSortChange = (field: SortOption) => {
    const newDirection: SortDirection = 
      sort.field === field && sort.direction === 'desc' ? 'asc' : 'desc';
    setSort({ field, direction: newDirection });
  };

  // 打开新建记录对话框
  const handleCreateRecord = () => {
    setEditingRecord(undefined);
    setEditorOpen(true);
  };

  // 打开编辑记录对话框
  const handleEditRecord = (record: EmotionalRecord) => {
    setEditingRecord(record);
    setEditorOpen(true);
  };

  // 查看记录
  const handleViewRecord = (record: EmotionalRecord) => {
    setCurrentRecord(record);
    setViewerOpen(true);
  };

  // 尘封记录
  const handleSealRecord = (id: string) => {
    setSealingRecordId(id);
    setSealDialogOpen(true);
  };

  // 处理文件导入
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importData(file);
    }
    // 重置文件输入
    event.target.value = '';
  };

  // 获取统计信息
  const getStats = () => {
    const total = records.length;
    const sealed = records.filter(r => r.isSealed).length;
    const withImages = records.filter(r => r.images.length > 0).length;
    const withMusic = records.filter(r => r.musicUrl).length;
    
    return { total, sealed, withImages, withMusic };
  };

  const stats = getStats();

  return (
    <Container maxWidth="lg" sx={{ py: 4, minHeight: '100vh' }}>
      {/* 页面标题和统计 */}
      <Box sx={{ 
        mb: 6, 
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(103,80,164,0.1) 0%, rgba(3,218,198,0.1) 100%)',
        borderRadius: 4,
        p: 4,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Typography 
          variant="h2" 
          component="h1" 
          gutterBottom 
          sx={{ 
            background: 'linear-gradient(135deg, #6750a4 0%, #03dac6 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            fontWeight: 700,
            mb: 2
          }}
        >
          拾忆
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary" 
          sx={{ 
            mb: 4,
            fontStyle: 'italic',
            opacity: 0.8
          }}
        >
          泪滴在缅怀过去点碎了我的秘密
        </Typography>
        
        {/* 统计卡片 */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
          gap: 3, 
          mt: 4 
        }}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(25,118,210,0.1) 0%, rgba(25,118,210,0.05) 100%)',
            border: '1px solid rgba(25,118,210,0.2)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-8px) scale(1.02)',
              background: 'linear-gradient(135deg, rgba(25,118,210,0.15) 0%, rgba(25,118,210,0.08) 100%)',
            }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="h3" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                总记录
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(255,143,0,0.1) 0%, rgba(255,143,0,0.05) 100%)',
            border: '1px solid rgba(255,143,0,0.2)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-8px) scale(1.02)',
              background: 'linear-gradient(135deg, rgba(255,143,0,0.15) 0%, rgba(255,143,0,0.08) 100%)',
            }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="h3" color="warning.main" sx={{ fontWeight: 700, mb: 1 }}>
                {stats.sealed}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                已尘封
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(33,150,243,0.1) 0%, rgba(33,150,243,0.05) 100%)',
            border: '1px solid rgba(33,150,243,0.2)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-8px) scale(1.02)',
              background: 'linear-gradient(135deg, rgba(33,150,243,0.15) 0%, rgba(33,150,243,0.08) 100%)',
            }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="h3" color="info.main" sx={{ fontWeight: 700, mb: 1 }}>
                {stats.withImages}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                含图片
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(76,175,80,0.1) 0%, rgba(76,175,80,0.05) 100%)',
            border: '1px solid rgba(76,175,80,0.2)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-8px) scale(1.02)',
              background: 'linear-gradient(135deg, rgba(76,175,80,0.15) 0%, rgba(76,175,80,0.08) 100%)',
            }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="h3" color="success.main" sx={{ fontWeight: 700, mb: 1 }}>
                {stats.withMusic}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                含音乐
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* 错误提示 */}
      {error && (
        <Alert severity="error" onClose={clearError} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* 工具栏 */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 4,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 3
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* 第一行：搜索和排序 */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              size="medium"
              placeholder="搜索你的记忆..."
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              sx={{ 
                minWidth: 300, 
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.12)',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'rgba(255,255,255,0.15)',
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'primary.main' }} />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl 
              size="medium" 
              sx={{ 
                minWidth: 140,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(10px)',
                }
              }}
            >
              <InputLabel>排序方式</InputLabel>
              <Select
                value={sort.field}
                label="排序方式"
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
              >
                <MenuItem value="updatedAt">最近更新</MenuItem>
                <MenuItem value="createdAt">创建时间</MenuItem>
                <MenuItem value="title">标题排序</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* 第二行：过滤器和操作按钮 */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Chip
                label={filter.showSealed ? '显示尘封记忆' : '隐藏尘封记忆'}
                onClick={() => setFilter({ showSealed: !filter.showSealed })}
                color={filter.showSealed ? 'primary' : 'default'}
                variant={filter.showSealed ? 'filled' : 'outlined'}
                size="medium"
                sx={{
                  fontWeight: 600,
                  px: 2,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  }
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Tooltip title={isDarkMode ? "切换到浅色模式" : "切换到深色模式"} arrow>
                <IconButton 
                  size="medium" 
                  onClick={toggleTheme}
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      transform: 'rotate(180deg)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>

              <Tooltip title="刷新记录" arrow>
                <IconButton 
                  size="medium" 
                  onClick={loadRecords}
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      transform: 'rotate(180deg)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="导出数据" arrow>
                <IconButton 
                  size="medium" 
                  onClick={exportData}
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                    }
                  }}
                >
                  <BackupIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="导入数据" arrow>
                <IconButton 
                  size="medium" 
                  component="label"
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                    }
                  }}
                >
                  <RestoreIcon />
                  <input
                    type="file"
                    accept=".json"
                    hidden
                    onChange={handleFileImport}
                  />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* 加载状态 */}
      {isLoading && (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          py: 8,
          gap: 3
        }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" color="text.secondary">
            正在加载你的记忆...
          </Typography>
        </Box>
      )}

      {/* 记录列表 */}
      {!isLoading && (
        <>
          {filteredRecords.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 12,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)'
            }}>
              <Typography variant="h4" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
                {records.length === 0 ? '✨ 开始你的记忆之旅' : '🔍 没有找到匹配的记录'}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
                {records.length === 0 
                  ? '在这里记录生活中的点点滴滴，珍藏每一个珍贵的瞬间' 
                  : '尝试调整搜索条件或过滤器，或许能找到你要寻找的记忆'}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', 
              gap: 4,
              mb: 10
            }}>
              {filteredRecords.map((record, index) => (
                <Box
                  key={record.id}
                  sx={{
                    animation: `fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s both`,
                    '@keyframes fadeInUp': {
                      from: {
                        opacity: 0,
                        transform: 'translateY(30px)',
                      },
                      to: {
                        opacity: 1,
                        transform: 'translateY(0)',
                      },
                    },
                  }}
                >
                  <RecordCard
                    record={record}
                    onEdit={handleEditRecord}
                    onDelete={deleteRecord}
                    onSeal={handleSealRecord}
                    onUnseal={unsealRecord}
                    onView={handleViewRecord}
                  />
                </Box>
              ))}
            </Box>
          )}
        </>
      )}

      {/* 新建记录按钮 */}
      <Fab
        color="primary"
        aria-label="新建记录"
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          width: 64,
          height: 64,
          background: 'linear-gradient(135deg, #6750a4 0%, #03dac6 100%)',
          boxShadow: '0 8px 32px rgba(103,80,164,0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5a42a4 0%, #02b8a8 100%)',
            boxShadow: '0 12px 40px rgba(103,80,164,0.4)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
          '& .MuiSvgIcon-root': {
            fontSize: '1.8rem',
          }
        }}
        onClick={handleCreateRecord}
      >
        <AddIcon />
      </Fab>

      {/* 记录编辑器 */}
      <RecordEditor
        open={editorOpen}
        record={editingRecord}
        onClose={() => setEditorOpen(false)}
        onSave={async (data) => {
          if ('id' in data) {
            await updateRecord(data);
          } else {
            await createRecord(data);
          }
          setEditorOpen(false);
        }}
      />

      {/* 记录查看器 */}
      <RecordViewer
        open={viewerOpen}
        record={currentRecord}
        onClose={() => setViewerOpen(false)}
        onEdit={handleEditRecord}
      />

      {/* 尘封对话框 */}
      <SealDialog
        open={sealDialogOpen}
        onClose={() => setSealDialogOpen(false)}
        onConfirm={async (config) => {
          await sealRecord(sealingRecordId, config);
          setSealDialogOpen(false);
        }}
        recordTitle={records.find(r => r.id === sealingRecordId)?.title}
      />
    </Container>
  );
};
