import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Box,
  Chip,
  Menu,
  MenuItem,
  ImageList,
  ImageListItem
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  MusicNote as MusicIcon,
  Photo as PhotoIcon,
  Schedule as ScheduleIcon,
  AutoDelete as AutoDeleteIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { EmotionalRecord, SealConfig } from '../types';
import { useAppStore } from '../stores/useAppStore';

interface RecordCardProps {
  record: EmotionalRecord;
  onEdit: (record: EmotionalRecord) => void;
  onDelete: (id: string) => void;
  onSeal: (id: string, config: SealConfig) => void;
  onUnseal: (id: string) => void;
  onView: (record: EmotionalRecord) => void;
}

export const RecordCard: React.FC<RecordCardProps> = ({
  record,
  onEdit,
  onDelete,
  onSeal,
  onUnseal,
  onView
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const getImageUrl = useAppStore(state => state.getImageUrl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleMenuClose();
    onEdit(record);
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleMenuClose();
    if (window.confirm('确定要删除这条记录吗？此操作不可撤销。')) {
      onDelete(record.id);
    }
  };

  const handleSeal = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleMenuClose();
    // 这里应该打开尘封配置对话框
    // 暂时使用简单的确认对话框
    const sealDays = prompt('请输入尘封天数（留空表示永久尘封）：');
    if (sealDays !== null) {
      const config: SealConfig = {};
      if (sealDays.trim()) {
        const days = parseInt(sealDays.trim());
        if (!isNaN(days) && days > 0) {
          const sealUntil = new Date();
          sealUntil.setDate(sealUntil.getDate() + days);
          config.sealUntil = sealUntil.toISOString();
        }
      }
      onSeal(record.id, config);
    }
  };

  const handleUnseal = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleMenuClose();
    if (window.confirm('确定要解封这条记录吗？')) {
      onUnseal(record.id);
    }
  };

  const handleCardClick = () => {
    if (!record.isSealed || canViewSealed()) {
      onView(record);
    }
  };

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

  // 获取内容预览
  const getContentPreview = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  // 检查记录是否即将过期
  const isExpiringSoon = (): boolean => {
    if (!record.autoDestroyAt) return false;
    const destroyDate = new Date(record.autoDestroyAt);
    const now = new Date();
    const diffDays = Math.ceil((destroyDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  return (
    <Card
      sx={{
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        background: record.isSealed 
          ? 'linear-gradient(135deg, rgba(255,152,0,0.1) 0%, rgba(255,152,0,0.05) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        border: record.isSealed 
          ? '2px solid rgba(255,152,0,0.3)' 
          : '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(20px)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: record.isSealed 
            ? '0 20px 40px rgba(255,152,0,0.2), 0 8px 16px rgba(0,0,0,0.1)'
            : '0 20px 40px rgba(0,0,0,0.15), 0 8px 16px rgba(0,0,0,0.08)',
        },
        opacity: record.isSealed && !canViewSealed() ? 0.7 : 1,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: record.isSealed 
            ? 'linear-gradient(90deg, #ff9800, #ffb74d)' 
            : 'linear-gradient(90deg, #6750a4, #03dac6)',
          zIndex: 1,
        }
      }}
      onClick={handleCardClick}
    >
      {/* 尘封状态指示器 */}
      {record.isSealed && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 2
          }}
        >
          <Chip
            icon={<LockIcon sx={{ fontSize: '1rem' }} />}
            label="已尘封"
            size="small"
            sx={{
              background: 'linear-gradient(135deg, #ff9800, #ffb74d)',
              color: 'white',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(255,152,0,0.3)',
            }}
          />
        </Box>
      )}

      {/* 即将过期警告 */}
      {isExpiringSoon() && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 60,
            zIndex: 2
          }}
        >
          <Chip
            icon={<AutoDeleteIcon sx={{ fontSize: '1rem' }} />}
            label="即将销毁"
            size="small"
            sx={{
              background: 'linear-gradient(135deg, #f44336, #e57373)',
              color: 'white',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(244,67,54,0.3)',
            }}
          />
        </Box>
      )}

      <CardContent sx={{ pb: 2, flex: 1, display: 'flex', flexDirection: 'column', pt: record.isSealed ? 7 : 3 }}>
        {/* 标题 */}
        <Typography 
          variant="h6" 
          component="h3" 
          gutterBottom 
          sx={{ 
            fontWeight: 700,
            fontSize: '1.25rem',
            background: 'linear-gradient(135deg, #6750a4, #03dac6)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            mb: 2,
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {record.title}
        </Typography>

        {/* 内容预览 */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ 
            mb: 3, 
            flex: 1,
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {getContentPreview(record.content, 120)}
        </Typography>
        {/* 媒体信息和时间信息 */}
        <Box sx={{ mt: 'auto' }}>
          {/* 媒体信息 */}
          {(!record.isSealed || canViewSealed()) && (
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              {record.images.length > 0 && (
                <Chip
                  icon={<PhotoIcon sx={{ fontSize: '1rem' }} />}
                  label={`${record.images.length} 张图片`}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: 'rgba(103,80,164,0.1)',
                    }
                  }}
                />
              )}
              {record.musicUrl && (
                <Chip
                  icon={<MusicIcon sx={{ fontSize: '1rem' }} />}
                  label={record.musicTitle || '背景音乐'}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: 'secondary.main',
                    color: 'secondary.main',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: 'rgba(3,218,198,0.1)',
                    }
                  }}
                />
              )}
            </Box>
          )}

          {/* 图片预览 */}
          {record.images.length > 0 && (!record.isSealed || canViewSealed()) && (
            <Box sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
              <ImageList
                sx={{ 
                  width: '100%', 
                  height: 100, 
                  margin: 0,
                  '& .MuiImageListItem-root': {
                    borderRadius: 1,
                    overflow: 'hidden',
                  }
                }}
                cols={Math.min(record.images.length, 4)}
                rowHeight={100}
                gap={4}
              >
                {record.images.slice(0, 4).map((image, index) => (
                  <ImageListItem key={index}>
                    <img
                      src={getImageUrl(image)}
                      alt={`图片 ${index + 1}`}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            </Box>
          )}

          {/* 时间信息 */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            p: 2, 
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: 2,
            border: '1px solid rgba(255,255,255,0.1)',
            mb: 1
          }}>
            <ScheduleIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              {formatDate(record.createdAt)}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      <CardActions sx={{ 
        justifyContent: 'space-between', 
        pt: 0, 
        px: 3, 
        pb: 2,
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        {/* 附加信息显示 */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {record.sealUntil && (
            <Chip
              icon={<ScheduleIcon sx={{ fontSize: '0.875rem' }} />}
              label={`解封: ${format(new Date(record.sealUntil), 'MM/dd', { locale: zhCN })}`}
              size="small"
              variant="outlined"
              sx={{
                fontSize: '0.75rem',
                height: 24,
                borderColor: 'warning.main',
                color: 'warning.main',
              }}
            />
          )}
          {record.autoDestroyAt && (
            <Chip
              icon={<AutoDeleteIcon sx={{ fontSize: '0.875rem' }} />}
              label={`销毁: ${format(new Date(record.autoDestroyAt), 'MM/dd', { locale: zhCN })}`}
              size="small"
              variant="outlined"
              sx={{
                fontSize: '0.75rem',
                height: 24,
                borderColor: 'error.main',
                color: 'error.main',
              }}
            />
          )}
        </Box>

        {/* 操作按钮 */}
        <IconButton
          size="medium"
          onClick={handleMenuOpen}
          aria-label="更多操作"
          sx={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.2)',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <MoreIcon />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          onClick={(e) => e.stopPropagation()}
          PaperProps={{
            sx: {
              borderRadius: 3,
              minWidth: 160,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleEdit} sx={{ gap: 1.5, py: 1.5, fontSize: '0.875rem', fontWeight: 500 }}>
            <EditIcon sx={{ fontSize: '1.125rem', color: 'primary.main' }} />
            编辑记录
          </MenuItem>
          
          {record.isSealed ? (
            <MenuItem onClick={handleUnseal} sx={{ gap: 1.5, py: 1.5, fontSize: '0.875rem', fontWeight: 500 }}>
              <UnlockIcon sx={{ fontSize: '1.125rem', color: 'success.main' }} />
              解封记录
            </MenuItem>
          ) : (
            <MenuItem onClick={handleSeal} sx={{ gap: 1.5, py: 1.5, fontSize: '0.875rem', fontWeight: 500 }}>
              <LockIcon sx={{ fontSize: '1.125rem', color: 'warning.main' }} />
              尘封记录
            </MenuItem>
          )}
          
          <MenuItem onClick={handleDelete} sx={{ gap: 1.5, py: 1.5, fontSize: '0.875rem', fontWeight: 500, color: 'error.main' }}>
            <DeleteIcon sx={{ fontSize: '1.125rem' }} />
            删除记录
          </MenuItem>
        </Menu>
      </CardActions>
    </Card>
  );
};
