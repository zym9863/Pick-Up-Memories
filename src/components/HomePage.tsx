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
  Restore as RestoreIcon
} from '@mui/icons-material';
import { useAppStore } from '../stores/useAppStore';
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
    initialize,
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

  const [editorOpen, setEditorOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [sealDialogOpen, setSealDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<EmotionalRecord | undefined>();
  const [sealingRecordId, setSealingRecordId] = useState<string>('');
  const [searchText, setSearchText] = useState(filter.searchText || '');

  // 初始化应用
  useEffect(() => {
    initialize();
  }, [initialize]);

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
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* 页面标题和统计 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          拾忆
        </Typography>
        <Typography variant="h6" color="text.secondary" align="center" gutterBottom>
          泪滴在缅怀过去点碎了我的秘密
        </Typography>
        
        {/* 统计卡片 */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mt: 2 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="primary">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                总记录
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="warning.main">
                {stats.sealed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                已尘封
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="info.main">
                {stats.withImages}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                含图片
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="success.main">
                {stats.withMusic}
              </Typography>
              <Typography variant="body2" color="text.secondary">
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
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* 第一行：搜索和排序 */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="搜索记录..."
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              sx={{ minWidth: 200, flex: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>排序</InputLabel>
              <Select
                value={sort.field}
                label="排序"
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
              >
                <MenuItem value="updatedAt">更新时间</MenuItem>
                <MenuItem value="createdAt">创建时间</MenuItem>
                <MenuItem value="title">标题</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* 第二行：过滤器和操作按钮 */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label={filter.showSealed ? '显示尘封' : '隐藏尘封'}
                onClick={() => setFilter({ showSealed: !filter.showSealed })}
                color={filter.showSealed ? 'primary' : 'default'}
                variant={filter.showSealed ? 'filled' : 'outlined'}
                size="small"
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="刷新">
                <IconButton size="small" onClick={loadRecords}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="导出数据">
                <IconButton size="small" onClick={exportData}>
                  <BackupIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="导入数据">
                <IconButton size="small" component="label">
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
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* 记录列表 */}
      {!isLoading && (
        <>
          {filteredRecords.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {records.length === 0 ? '还没有任何记录' : '没有找到匹配的记录'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {records.length === 0 ? '点击右下角的按钮开始记录你的情感' : '尝试调整搜索条件或过滤器'}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 3 }}>
              {filteredRecords.map((record) => (
                <RecordCard
                  key={record.id}
                  record={record}
                  onEdit={handleEditRecord}
                  onDelete={deleteRecord}
                  onSeal={handleSealRecord}
                  onUnseal={unsealRecord}
                  onView={handleViewRecord}
                />
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
          bottom: 24,
          right: 24,
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
