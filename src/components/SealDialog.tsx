import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Alert,
  Divider,
  Paper,
  Chip
} from '@mui/material';
import {
  Lock as LockIcon,
  Schedule as ScheduleIcon,
  AutoDelete as AutoDeleteIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-cn';
import { SealConfig } from '../types';

dayjs.locale('zh-cn');

interface SealDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (config: SealConfig) => void;
  recordTitle?: string;
}

type SealType = 'permanent' | 'timed' | 'quick';
type DestroyType = 'none' | 'timed' | 'quick';

export const SealDialog: React.FC<SealDialogProps> = ({
  open,
  onClose,
  onConfirm,
  recordTitle = '这条记录'
}) => {
  const [sealType, setSealType] = useState<SealType>('timed');
  const [destroyType, setDestroyType] = useState<DestroyType>('none');
  const [sealDateTime, setSealDateTime] = useState<Dayjs | null>(
    dayjs().add(1, 'month')
  );
  const [destroyDateTime, setDestroyDateTime] = useState<Dayjs | null>(
    dayjs().add(1, 'year')
  );
  const [quickSealDays, setQuickSealDays] = useState<string>('30');
  const [quickDestroyDays, setQuickDestroyDays] = useState<string>('365');
  const [error, setError] = useState<string>('');

  // 重置表单
  const resetForm = () => {
    setSealType('timed');
    setDestroyType('none');
    setSealDateTime(dayjs().add(1, 'month'));
    setDestroyDateTime(dayjs().add(1, 'year'));
    setQuickSealDays('30');
    setQuickDestroyDays('365');
    setError('');
  };

  // 处理对话框关闭
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // 验证配置
  const validateConfig = (): string | null => {
    const now = dayjs();
    
    // 验证尘封时间
    if (sealType === 'timed') {
      if (!sealDateTime || sealDateTime.isBefore(now)) {
        return '解封时间必须在当前时间之后';
      }
    } else if (sealType === 'quick') {
      const days = parseInt(quickSealDays);
      if (isNaN(days) || days <= 0) {
        return '尘封天数必须是正整数';
      }
    }

    // 验证销毁时间
    if (destroyType === 'timed') {
      if (!destroyDateTime || destroyDateTime.isBefore(now)) {
        return '销毁时间必须在当前时间之后';
      }
      
      // 销毁时间必须在解封时间之后
      const unsealTime = getSealUntilTime();
      if (unsealTime && destroyDateTime.isBefore(unsealTime)) {
        return '销毁时间必须在解封时间之后';
      }
    } else if (destroyType === 'quick') {
      const days = parseInt(quickDestroyDays);
      if (isNaN(days) || days <= 0) {
        return '销毁天数必须是正整数';
      }
      
      // 检查销毁时间是否在解封时间之后
      const unsealTime = getSealUntilTime();
      const destroyTime = now.add(days, 'day');
      if (unsealTime && destroyTime.isBefore(unsealTime)) {
        return '销毁时间必须在解封时间之后';
      }
    }

    return null;
  };

  // 获取解封时间
  const getSealUntilTime = (): Dayjs | null => {
    if (sealType === 'permanent') return null;
    if (sealType === 'timed') return sealDateTime;
    if (sealType === 'quick') {
      const days = parseInt(quickSealDays);
      return isNaN(days) ? null : dayjs().add(days, 'day');
    }
    return null;
  };

  // 获取销毁时间
  const getDestroyTime = (): Dayjs | null => {
    if (destroyType === 'none') return null;
    if (destroyType === 'timed') return destroyDateTime;
    if (destroyType === 'quick') {
      const days = parseInt(quickDestroyDays);
      return isNaN(days) ? null : dayjs().add(days, 'day');
    }
    return null;
  };

  // 处理确认
  const handleConfirm = () => {
    const validationError = validateConfig();
    if (validationError) {
      setError(validationError);
      return;
    }

    const config: SealConfig = {};
    
    const sealUntil = getSealUntilTime();
    if (sealUntil) {
      config.sealUntil = sealUntil.toISOString();
    }

    const destroyTime = getDestroyTime();
    if (destroyTime) {
      config.autoDestroyAt = destroyTime.toISOString();
    }

    onConfirm(config);
    handleClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-cn">
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '60vh' }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <LockIcon color="warning" />
            <Typography variant="h6">时光尘封</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            将"{recordTitle}"封存在时光中，等待未来的自己重新开启
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {error && (
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {/* 尘封设置 */}
            <Paper elevation={1} sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <ScheduleIcon color="primary" />
                <Typography variant="h6">解封设置</Typography>
              </Box>

              <FormControl component="fieldset">
                <RadioGroup
                  value={sealType}
                  onChange={(e) => setSealType(e.target.value as SealType)}
                >
                  <FormControlLabel
                    value="permanent"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body1">永久尘封</Typography>
                        <Typography variant="caption" color="text.secondary">
                          只能手动解封，适合那些需要彻底忘却的记忆
                        </Typography>
                      </Box>
                    }
                  />
                  
                  <FormControlLabel
                    value="timed"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body1">定时解封</Typography>
                        <Typography variant="caption" color="text.secondary">
                          在指定时间自动解封
                        </Typography>
                      </Box>
                    }
                  />
                  
                  {sealType === 'timed' && (
                    <Box sx={{ ml: 4, mt: 1 }}>
                      <DateTimePicker
                        label="解封时间"
                        value={sealDateTime}
                        onChange={setSealDateTime}
                        minDateTime={dayjs().add(1, 'minute')}
                        slotProps={{
                          textField: {
                            size: 'small',
                            fullWidth: true
                          }
                        }}
                      />
                    </Box>
                  )}

                  <FormControlLabel
                    value="quick"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body1">快速设置</Typography>
                        <Typography variant="caption" color="text.secondary">
                          设置天数后自动解封
                        </Typography>
                      </Box>
                    }
                  />
                  
                  {sealType === 'quick' && (
                    <Box sx={{ ml: 4, mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField
                        size="small"
                        type="number"
                        value={quickSealDays}
                        onChange={(e) => setQuickSealDays(e.target.value)}
                        inputProps={{ min: 1 }}
                        sx={{ width: 100 }}
                      />
                      <Typography variant="body2">天后解封</Typography>
                    </Box>
                  )}
                </RadioGroup>
              </FormControl>
            </Paper>

            <Divider />

            {/* 销毁设置 */}
            <Paper elevation={1} sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <AutoDeleteIcon color="error" />
                <Typography variant="h6">自动销毁设置</Typography>
                <Chip
                  label="可选"
                  size="small"
                  variant="outlined"
                  color="default"
                />
              </Box>

              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <WarningIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                  启用自动销毁后，记录将在指定时间被永久删除，无法恢复！
                </Typography>
              </Alert>

              <FormControl component="fieldset">
                <RadioGroup
                  value={destroyType}
                  onChange={(e) => setDestroyType(e.target.value as DestroyType)}
                >
                  <FormControlLabel
                    value="none"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body1">不自动销毁</Typography>
                        <Typography variant="caption" color="text.secondary">
                          记录将永久保存
                        </Typography>
                      </Box>
                    }
                  />
                  
                  <FormControlLabel
                    value="timed"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body1">定时销毁</Typography>
                        <Typography variant="caption" color="text.secondary">
                          在指定时间自动销毁
                        </Typography>
                      </Box>
                    }
                  />
                  
                  {destroyType === 'timed' && (
                    <Box sx={{ ml: 4, mt: 1 }}>
                      <DateTimePicker
                        label="销毁时间"
                        value={destroyDateTime}
                        onChange={setDestroyDateTime}
                        minDateTime={dayjs().add(1, 'hour')}
                        slotProps={{
                          textField: {
                            size: 'small',
                            fullWidth: true
                          }
                        }}
                      />
                    </Box>
                  )}

                  <FormControlLabel
                    value="quick"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body1">快速设置</Typography>
                        <Typography variant="caption" color="text.secondary">
                          设置天数后自动销毁
                        </Typography>
                      </Box>
                    }
                  />
                  
                  {destroyType === 'quick' && (
                    <Box sx={{ ml: 4, mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField
                        size="small"
                        type="number"
                        value={quickDestroyDays}
                        onChange={(e) => setQuickDestroyDays(e.target.value)}
                        inputProps={{ min: 1 }}
                        sx={{ width: 100 }}
                      />
                      <Typography variant="body2">天后销毁</Typography>
                    </Box>
                  )}
                </RadioGroup>
              </FormControl>
            </Paper>

            {/* 配置预览 */}
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" gutterBottom>
                配置预览：
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {sealType === 'permanent' ? (
                  <Typography variant="body2">
                    • 记录将被永久尘封，只能手动解封
                  </Typography>
                ) : (
                  <Typography variant="body2">
                    • 记录将在 {getSealUntilTime()?.format('YYYY年MM月DD日 HH:mm')} 自动解封
                  </Typography>
                )}
                
                {destroyType !== 'none' && (
                  <Typography variant="body2" color="error.main">
                    • 记录将在 {getDestroyTime()?.format('YYYY年MM月DD日 HH:mm')} 自动销毁
                  </Typography>
                )}
              </Box>
            </Paper>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose}>
            取消
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            color="warning"
            startIcon={<LockIcon />}
          >
            确认尘封
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};
