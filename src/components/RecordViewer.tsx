import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Box,
  Chip,
  ImageList,
  ImageListItem,
  Button,
  Divider,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  MusicNote as MusicIcon,
  Photo as PhotoIcon,
  Schedule as ScheduleIcon,
  AutoDelete as AutoDeleteIcon,
  Fullscreen as FullscreenIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { EmotionalRecord } from '../types';
import { useAppStore } from '../stores/useAppStore';

interface RecordViewerProps {
  open: boolean;
  record: EmotionalRecord | null;
  onClose: () => void;
  onEdit: (record: EmotionalRecord) => void;
}

export const RecordViewer: React.FC<RecordViewerProps> = ({
  open,
  record,
  onClose,
  onEdit
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const getImageUrl = useAppStore(state => state.getImageUrl);

  if (!record) return null;

  // 检查是否可以查看尘封的记录
  const canViewSealed = (): boolean => {
    if (!record.isSealed) return true;
    if (!record.sealUntil) return false;
    return new Date(record.sealUntil) <= new Date();
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy年MM月dd日 HH:mm', { locale: zhCN });
  };

  // 处理编辑
  const handleEdit = () => {
    onEdit(record);
    onClose();
  };

  // 处理图片点击
  const handleImageClick = (imagePath: string) => {
    setSelectedImage(imagePath);
  };

  // 关闭图片查看器
  const handleCloseImageViewer = () => {
    setSelectedImage(null);
  };

  // 如果记录被尘封且不能查看，显示尘封状态
  if (record.isSealed && !canViewSealed()) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">记录已尘封</Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              py: 4,
              textAlign: 'center'
            }}
          >
            <LockIcon sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              这段记忆已被尘封
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              等待时光的解封...
            </Typography>
            
            {record.sealUntil && (
              <Box sx={{ mt: 2 }}>
                <Chip
                  icon={<ScheduleIcon />}
                  label={`解封时间：${formatDate(record.sealUntil)}`}
                  color="warning"
                  variant="outlined"
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose}>关闭</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: { minHeight: '70vh' }
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                {record.title}
              </Typography>
              
              {/* 状态标签 */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {record.isSealed && (
                  <Chip
                    icon={<LockIcon />}
                    label="已尘封"
                    size="small"
                    color="warning"
                  />
                )}
                {record.images.length > 0 && (
                  <Chip
                    icon={<PhotoIcon />}
                    label={`${record.images.length} 张图片`}
                    size="small"
                    variant="outlined"
                  />
                )}
                {record.musicUrl && (
                  <Chip
                    icon={<MusicIcon />}
                    label="背景音乐"
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
            
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* 内容 */}
            <Paper elevation={0} sx={{ p: 3, bgcolor: 'grey.50' }}>
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.8,
                  fontSize: '1.1rem'
                }}
              >
                {record.content}
              </Typography>
            </Paper>

            {/* 图片展示 */}
            {record.images.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  图片 ({record.images.length})
                </Typography>
                <ImageList
                  sx={{ width: '100%' }}
                  cols={3}
                  rowHeight={200}
                  gap={8}
                >
                  {record.images.map((image, index) => (
                    <ImageListItem
                      key={index}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          opacity: 0.8
                        }
                      }}
                      onClick={() => handleImageClick(image)}
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={`图片 ${index + 1}`}
                        loading="lazy"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: 4
                        }}
                        onError={(e) => {
                          console.error('Image load error in viewer:', image);
                          const target = e.target as HTMLImageElement;
                          target.style.backgroundColor = '#f5f5f5';
                          target.alt = '图片加载失败';
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'rgba(0,0,0,0.5)',
                          borderRadius: 1,
                          p: 0.5
                        }}
                      >
                        <FullscreenIcon sx={{ color: 'white', fontSize: 16 }} />
                      </Box>
                    </ImageListItem>
                  ))}
                </ImageList>
              </Box>
            )}

            {/* 音乐播放 */}
            {record.musicUrl && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  背景音乐
                </Typography>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <MusicIcon color="primary" />
                    <Typography variant="subtitle1">
                      {record.musicTitle || '未知音乐'}
                    </Typography>
                  </Box>
                  <audio controls style={{ width: '100%' }}>
                    <source src={record.musicUrl} />
                    您的浏览器不支持音频播放
                  </audio>
                </Paper>
              </Box>
            )}

            <Divider />

            {/* 时间信息 */}
            <Box>
              <Typography variant="h6" gutterBottom>
                时间信息
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2">
                  <strong>创建时间：</strong>{formatDate(record.createdAt)}
                </Typography>
                {record.updatedAt !== record.createdAt && (
                  <Typography variant="body2">
                    <strong>更新时间：</strong>{formatDate(record.updatedAt)}
                  </Typography>
                )}
                {record.sealUntil && (
                  <Typography variant="body2" color="warning.main">
                    <ScheduleIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                    <strong>解封时间：</strong>{formatDate(record.sealUntil)}
                  </Typography>
                )}
                {record.autoDestroyAt && (
                  <Typography variant="body2" color="error.main">
                    <AutoDeleteIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                    <strong>销毁时间：</strong>{formatDate(record.autoDestroyAt)}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose}>关闭</Button>
          <Button
            startIcon={<EditIcon />}
            onClick={handleEdit}
            variant="contained"
          >
            编辑
          </Button>
        </DialogActions>
      </Dialog>

      {/* 图片全屏查看器 */}
      <Dialog
        open={!!selectedImage}
        onClose={handleCloseImageViewer}
        maxWidth={false}
        slotProps={{
          paper: {
            sx: {
              bgcolor: 'transparent',
              boxShadow: 'none',
              maxWidth: '90vw',
              maxHeight: '90vh'
            }
          }
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          {selectedImage && (
            <>
              <img
                src={getImageUrl(selectedImage)}
                alt="全屏查看"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
              <IconButton
                onClick={handleCloseImageViewer}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.7)'
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
