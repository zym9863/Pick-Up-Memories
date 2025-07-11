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
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4
        },
        opacity: record.isSealed && !canViewSealed() ? 0.6 : 1,
        border: record.isSealed ? '2px solid #ff9800' : 'none',
        position: 'relative'
      }}
      onClick={handleCardClick}
    >
      {/* 尘封状态指示器 */}
      {record.isSealed && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 1
          }}
        >
          <Chip
            icon={<LockIcon />}
            label="已尘封"
            size="small"
            color="warning"
            variant="filled"
          />
        </Box>
      )}

      {/* 即将过期警告 */}
      {isExpiringSoon() && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 48,
            zIndex: 1
          }}
        >
          <Chip
            icon={<AutoDeleteIcon />}
            label="即将销毁"
            size="small"
            color="error"
            variant="filled"
          />
        </Box>
      )}

      <CardContent sx={{ pb: 1 }}>
        {/* 标题 */}
        <Typography variant="h6" component="h3" gutterBottom noWrap>
          {record.title}
        </Typography>

        {/* 内容预览 */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {record.isSealed && !canViewSealed() 
            ? '这段记忆已被尘封，等待时光的解封...' 
            : getContentPreview(record.content)
          }
        </Typography>

        {/* 媒体信息 */}
        {!record.isSealed || canViewSealed() ? (
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
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
                label={record.musicTitle || '背景音乐'}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        ) : null}

        {/* 图片预览 */}
        {record.images.length > 0 && (!record.isSealed || canViewSealed()) && (
          <ImageList
            sx={{ width: '100%', height: 120, mb: 2 }}
            cols={Math.min(record.images.length, 4)}
            rowHeight={120}
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
                    objectFit: 'cover'
                  }}
                />
              </ImageListItem>
            ))}
          </ImageList>
        )}

        {/* 时间信息 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            创建时间：{formatDate(record.createdAt)}
          </Typography>
          {record.updatedAt !== record.createdAt && (
            <Typography variant="caption" color="text.secondary">
              更新时间：{formatDate(record.updatedAt)}
            </Typography>
          )}
          {record.sealUntil && (
            <Typography variant="caption" color="warning.main">
              <ScheduleIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
              解封时间：{formatDate(record.sealUntil)}
            </Typography>
          )}
          {record.autoDestroyAt && (
            <Typography variant="caption" color="error.main">
              <AutoDeleteIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
              销毁时间：{formatDate(record.autoDestroyAt)}
            </Typography>
          )}
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
        <IconButton
          size="small"
          onClick={handleMenuOpen}
          aria-label="更多操作"
        >
          <MoreIcon />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          onClick={(e) => e.stopPropagation()}
        >
          <MenuItem onClick={handleEdit}>
            <EditIcon sx={{ mr: 1 }} />
            编辑
          </MenuItem>
          
          {record.isSealed ? (
            <MenuItem onClick={handleUnseal}>
              <UnlockIcon sx={{ mr: 1 }} />
              解封
            </MenuItem>
          ) : (
            <MenuItem onClick={handleSeal}>
              <LockIcon sx={{ mr: 1 }} />
              尘封
            </MenuItem>
          )}
          
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1 }} />
            删除
          </MenuItem>
        </Menu>
      </CardActions>
    </Card>
  );
};
