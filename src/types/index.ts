// 情绪树洞记录类型
export interface EmotionalRecord {
  id: string;
  title: string;
  content: string;
  images: string[]; // 图片文件路径数组
  musicUrl?: string; // 音乐文件路径或URL
  musicTitle?: string; // 音乐标题
  createdAt: string; // ISO 日期字符串
  updatedAt: string; // ISO 日期字符串
  isSealed: boolean; // 是否已尘封
  sealUntil?: string; // 尘封解除时间 ISO 日期字符串
  autoDestroyAt?: string; // 自动销毁时间 ISO 日期字符串
}

// 尘封配置类型
export interface SealConfig {
  sealUntil?: string; // 解封时间
  autoDestroyAt?: string; // 自动销毁时间
}

// 创建记录时的输入类型
export interface CreateRecordInput {
  title: string;
  content: string;
  images?: string[];
  musicUrl?: string;
  musicTitle?: string;
}

// 更新记录时的输入类型
export interface UpdateRecordInput {
  id: string;
  title?: string;
  content?: string;
  images?: string[];
  musicUrl?: string;
  musicTitle?: string;
}

// 记录列表过滤器
export interface RecordFilter {
  searchText?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  showSealed?: boolean;
}

// 记录排序选项
export type SortOption = 'createdAt' | 'updatedAt' | 'title';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortOption;
  direction: SortDirection;
}

// 应用状态类型
export interface AppState {
  records: EmotionalRecord[];
  currentRecord?: EmotionalRecord;
  filter: RecordFilter;
  sort: SortConfig;
  isLoading: boolean;
  error?: string;
}

// 通知类型
export interface NotificationConfig {
  title: string;
  body: string;
  icon?: string;
  scheduledTime?: string; // 定时通知时间
}

// 主题配置
export interface ThemeConfig {
  mode: 'light' | 'dark';
  primaryColor: string;
  backgroundColor: string;
}

// 应用设置
export interface AppSettings {
  theme: ThemeConfig;
  autoBackup: boolean;
  backupInterval: number; // 小时
  enableNotifications: boolean;
  language: 'zh-CN' | 'en-US';
}

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// 文件操作类型
export interface FileInfo {
  name: string;
  path: string;
  size: number;
  type: string;
  lastModified: string;
}

// 导出/导入类型
export interface ExportData {
  version: string;
  exportedAt: string;
  records: EmotionalRecord[];
  settings: AppSettings;
}

// 路由类型
export type RouteParams = {
  id?: string;
};

// 组件 Props 类型
export interface RecordCardProps {
  record: EmotionalRecord;
  onEdit: (record: EmotionalRecord) => void;
  onDelete: (id: string) => void;
  onSeal: (id: string, config: SealConfig) => void;
  onUnseal: (id: string) => void;
}

export interface RecordEditorProps {
  record?: EmotionalRecord;
  onSave: (record: CreateRecordInput | UpdateRecordInput) => void;
  onCancel: () => void;
}

export interface SealDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (config: SealConfig) => void;
}

// 错误类型
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// 常量类型
export const STORAGE_KEYS = {
  RECORDS: 'emotional_records',
  SETTINGS: 'app_settings',
  THEME: 'theme_config',
} as const;

export const DATE_FORMATS = {
  DISPLAY: 'YYYY年MM月DD日 HH:mm',
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  DATE_ONLY: 'YYYY-MM-DD',
} as const;

// 状态枚举
export enum RecordStatus {
  NORMAL = 'normal',
  SEALED = 'sealed',
  EXPIRED = 'expired',
}

export enum NotificationType {
  UNSEAL = 'unseal',
  DESTROY_WARNING = 'destroy_warning',
  BACKUP_REMINDER = 'backup_reminder',
}
