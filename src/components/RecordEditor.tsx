import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Chip,
  Card,
  CardMedia,
  CardActions,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  PhotoCamera as PhotoIcon,
  MusicNote as MusicIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { EmotionalRecord, CreateRecordInput, UpdateRecordInput } from '../types';
import { storageService } from '../services/storage';

interface RecordEditorProps {
  open: boolean;
  record?: EmotionalRecord;
  onClose: () => void;
  onSave: (data: CreateRecordInput | UpdateRecordInput) => Promise<void>;
}

// 图片数据接口
interface ImageData {
  url: string; // 显示用的URL（可能是blob URL或base64）
  file?: File; // 原始文件（如果是新上传的）
  isPersisted: boolean; // 是否已经持久化
}

export const RecordEditor: React.FC<RecordEditorProps> = ({
  open,
  record,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<ImageData[]>([]);
  const [musicUrl, setMusicUrl] = useState<string>('');
  const [musicTitle, setMusicTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const isEditing = !!record;

  // 初始化表单数据
  useEffect(() => {
    if (record) {
      setTitle(record.title);
      setContent(record.content);
      // 将已保存的图片路径转换为ImageData格式
      setImages(record.images.map(imagePath => ({
        url: imagePath,
        isPersisted: true
      })));
      setMusicUrl(record.musicUrl || '');
      setMusicTitle(record.musicTitle || '');
    } else {
      // 重置表单
      setTitle('');
      setContent('');
      setImages([]);
      setMusicUrl('');
      setMusicTitle('');
    }
    setError('');
  }, [record, open]);

  // 处理图片上传
  const handleImageUpload = async () => {
    try {
      // 创建文件输入元素
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = 'image/*';

      input.onchange = async (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (files) {
          setIsLoading(true);
          setError('');
          const newImageData: ImageData[] = [];
          const errors: string[] = [];

          for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // 验证文件类型
            if (!file.type.startsWith('image/')) {
              errors.push(`${file.name}: 不是有效的图片文件`);
              continue;
            }

            // 验证文件大小（10MB限制）
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
              errors.push(`${file.name}: 文件过大（超过10MB）`);
              continue;
            }

            try {
              const url = URL.createObjectURL(file);
              newImageData.push({
                url,
                file,
                isPersisted: false
              });
            } catch (fileError) {
              console.error('Failed to create object URL for file:', file.name, fileError);
              errors.push(`${file.name}: 处理失败`);
            }
          }

          if (newImageData.length > 0) {
            setImages(prev => [...prev, ...newImageData]);
          }

          if (errors.length > 0) {
            setError(`部分图片添加失败：\n${errors.join('\n')}`);
          }

          setIsLoading(false);
        }
      };

      input.click();
    } catch (error) {
      console.error('Failed to select images:', error);
      setError('选择图片失败');
      setIsLoading(false);
    }
  };

  // 处理音乐上传
  const handleMusicUpload = async () => {
    try {
      // 创建文件输入元素
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'audio/*';

      input.onchange = (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (files && files[0]) {
          setIsLoading(true);
          const file = files[0];
          const url = URL.createObjectURL(file);
          const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');

          setMusicUrl(url);
          setMusicTitle(nameWithoutExt);
          setIsLoading(false);
        }
      };

      input.click();
    } catch (error) {
      console.error('Failed to select music:', error);
      setError('选择音乐失败');
      setIsLoading(false);
    }
  };

  // 删除图片
  const handleDeleteImage = (index: number) => {
    setImages(prev => {
      const imageToDelete = prev[index];
      // 如果是临时的blob URL，需要释放内存
      if (!imageToDelete.isPersisted && imageToDelete.url.startsWith('blob:')) {
        URL.revokeObjectURL(imageToDelete.url);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  // 删除音乐
  const handleDeleteMusic = () => {
    setMusicUrl('');
    setMusicTitle('');
  };

  // 保存记录
  const handleSave = async () => {
    if (!title.trim()) {
      setError('请输入标题');
      return;
    }

    if (!content.trim()) {
      setError('请输入内容');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 处理图片：将未持久化的图片转换为base64格式
      const processedImages: string[] = [];
      const imageErrors: string[] = [];

      for (let i = 0; i < images.length; i++) {
        const imageData = images[i];

        if (imageData.isPersisted) {
          // 已经持久化的图片直接使用
          processedImages.push(imageData.url);
        } else if (imageData.file) {
          // 新上传的图片需要转换为base64
          try {
            const base64Url = await storageService.saveImage(imageData.file);
            processedImages.push(base64Url);
          } catch (error) {
            console.error('Failed to convert image to base64:', error);
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            imageErrors.push(`图片 ${i + 1}: ${errorMessage}`);
          }
        }
      }

      // 如果有图片处理失败，询问用户是否继续
      if (imageErrors.length > 0) {
        const shouldContinue = window.confirm(
          `以下图片处理失败：\n${imageErrors.join('\n')}\n\n是否继续保存记录（不包含失败的图片）？`
        );

        if (!shouldContinue) {
          setError('保存已取消');
          return;
        }
      }

      const data = {
        title: title.trim(),
        content: content.trim(),
        images: processedImages,
        musicUrl: musicUrl || undefined,
        musicTitle: musicTitle || undefined
      };

      if (isEditing) {
        await onSave({
          id: record!.id,
          ...data
        } as UpdateRecordInput);
      } else {
        await onSave(data as CreateRecordInput);
      }

      onClose();
    } catch (error) {
      console.error('Failed to save record:', error);
      setError('保存失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
          <Typography variant="h6">
            {isEditing ? '编辑记录' : '新建记录'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* 标题输入 */}
          <TextField
            label="标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            placeholder="给这段回忆起个标题..."
          />

          {/* 内容输入 */}
          <TextField
            label="内容"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            fullWidth
            multiline
            rows={8}
            required
            placeholder="在这里倾诉你的情感，记录你的回忆..."
          />

          {/* 图片区域 */}
          <Box>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Typography variant="subtitle1">图片</Typography>
              <Button
                startIcon={<PhotoIcon />}
                onClick={handleImageUpload}
                disabled={isLoading}
                size="small"
              >
                添加图片
              </Button>
            </Box>

            {images.length > 0 && (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 2 }}>
                {images.map((imageData, index) => (
                  <Card key={index}>
                    <CardMedia
                      component="img"
                      height="120"
                      image={imageData.url}
                      alt={`图片 ${index + 1}`}
                      sx={{ objectFit: 'cover' }}
                      onError={(e) => {
                        console.error('Image load error:', imageData.url);
                        // 可以在这里添加错误图片的占位符
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    <CardActions sx={{ justifyContent: 'center', p: 1 }}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteImage(index)}
                        title="删除图片"
                      >
                        <DeleteIcon />
                      </IconButton>
                      {!imageData.isPersisted && (
                        <Chip
                          label="新"
                          size="small"
                          color="primary"
                          sx={{ ml: 1, fontSize: '0.7rem' }}
                        />
                      )}
                    </CardActions>
                  </Card>
                ))}
              </Box>
            )}
          </Box>

          {/* 音乐区域 */}
          <Box>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Typography variant="subtitle1">背景音乐</Typography>
              <Button
                startIcon={<MusicIcon />}
                onClick={handleMusicUpload}
                disabled={isLoading}
                size="small"
              >
                添加音乐
              </Button>
            </Box>

            {musicUrl && (
              <Box>
                <Chip
                  icon={<MusicIcon />}
                  label={musicTitle || '未知音乐'}
                  onDelete={handleDeleteMusic}
                  color="primary"
                  variant="outlined"
                />
                <Box mt={1}>
                  <audio controls style={{ width: '100%' }}>
                    <source src={musicUrl} />
                    您的浏览器不支持音频播放
                  </audio>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={isLoading}>
          取消
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={isLoading || !title.trim() || !content.trim()}
        >
          {isLoading ? '保存中...' : '保存'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
