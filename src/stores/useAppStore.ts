import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  EmotionalRecord,
  AppSettings,
  RecordFilter,
  SortConfig,
  CreateRecordInput,
  UpdateRecordInput,
  SealConfig
} from '../types';
import { storageService } from '../services/storage';

interface AppState {
  // 数据状态
  records: EmotionalRecord[];
  currentRecord: EmotionalRecord | null;
  settings: AppSettings | null;
  
  // UI 状态
  isLoading: boolean;
  error: string | null;
  filter: RecordFilter;
  sort: SortConfig;
  
  // 初始化
  initialize: () => Promise<void>;
  
  // 记录操作
  loadRecords: () => Promise<void>;
  createRecord: (input: CreateRecordInput) => Promise<void>;
  updateRecord: (input: UpdateRecordInput) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  setCurrentRecord: (record: EmotionalRecord | null) => void;
  
  // 尘封操作
  sealRecord: (id: string, config: SealConfig) => Promise<void>;
  unsealRecord: (id: string) => Promise<void>;
  
  // 过滤和排序
  setFilter: (filter: Partial<RecordFilter>) => void;
  setSort: (sort: SortConfig) => void;
  getFilteredRecords: () => EmotionalRecord[];
  
  // 设置操作
  loadSettings: () => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  
  // 错误处理
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // 工具方法
  getImageUrl: (imagePath: string) => string;
  
  // 导入导出
  exportData: () => Promise<void>;
  importData: (file: File) => Promise<void>;
}

const defaultSettings: AppSettings = {
  theme: {
    mode: 'light',
    primaryColor: '#1976d2',
    backgroundColor: '#ffffff'
  },
  autoBackup: true,
  backupInterval: 24,
  enableNotifications: true,
  language: 'zh-CN'
};

const defaultFilter: RecordFilter = {
  searchText: '',
  showSealed: true
};

const defaultSort: SortConfig = {
  field: 'updatedAt',
  direction: 'desc'
};

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // 初始状态
      records: [],
      currentRecord: null,
      settings: null,
      isLoading: false,
      error: null,
      filter: defaultFilter,
      sort: defaultSort,

      // 初始化应用
      initialize: async () => {
        set({ isLoading: true, error: null });
        try {
          await storageService.initialize();
          await Promise.all([
            get().loadRecords(),
            get().loadSettings()
          ]);
        } catch (error) {
          console.error('Failed to initialize app:', error);
          set({ error: '应用初始化失败' });
        } finally {
          set({ isLoading: false });
        }
      },

      // 加载记录
      loadRecords: async () => {
        set({ isLoading: true, error: null });
        try {
          const records = await storageService.getAllRecords();
          set({ records });
        } catch (error) {
          console.error('Failed to load records:', error);
          set({ error: '加载记录失败' });
        } finally {
          set({ isLoading: false });
        }
      },

      // 创建记录
      createRecord: async (input: CreateRecordInput) => {
        set({ isLoading: true, error: null });
        try {
          const now = new Date().toISOString();
          const newRecord: EmotionalRecord = {
            id: `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: input.title,
            content: input.content,
            images: input.images || [],
            musicUrl: input.musicUrl,
            musicTitle: input.musicTitle,
            createdAt: now,
            updatedAt: now,
            isSealed: false
          };

          await storageService.saveRecord(newRecord);
          
          const { records } = get();
          set({ records: [...records, newRecord] });
        } catch (error) {
          console.error('Failed to create record:', error);
          set({ error: '创建记录失败' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // 更新记录
      updateRecord: async (input: UpdateRecordInput) => {
        set({ isLoading: true, error: null });
        try {
          const { records } = get();
          const existingRecord = records.find(r => r.id === input.id);
          
          if (!existingRecord) {
            throw new Error('记录不存在');
          }

          const updatedRecord: EmotionalRecord = {
            ...existingRecord,
            ...input,
            updatedAt: new Date().toISOString()
          };

          await storageService.saveRecord(updatedRecord);
          
          const updatedRecords = records.map(r => 
            r.id === input.id ? updatedRecord : r
          );
          
          set({ 
            records: updatedRecords,
            currentRecord: get().currentRecord?.id === input.id ? updatedRecord : get().currentRecord
          });
        } catch (error) {
          console.error('Failed to update record:', error);
          set({ error: '更新记录失败' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // 删除记录
      deleteRecord: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await storageService.deleteRecord(id);
          
          const { records, currentRecord } = get();
          const updatedRecords = records.filter(r => r.id !== id);
          
          set({ 
            records: updatedRecords,
            currentRecord: currentRecord?.id === id ? null : currentRecord
          });
        } catch (error) {
          console.error('Failed to delete record:', error);
          set({ error: '删除记录失败' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // 设置当前记录
      setCurrentRecord: (record: EmotionalRecord | null) => {
        set({ currentRecord: record });
      },

      // 尘封记录
      sealRecord: async (id: string, config: SealConfig) => {
        set({ isLoading: true, error: null });
        try {
          const { records } = get();
          const record = records.find(r => r.id === id);
          
          if (!record) {
            throw new Error('记录不存在');
          }

          const sealedRecord: EmotionalRecord = {
            ...record,
            isSealed: true,
            sealUntil: config.sealUntil,
            autoDestroyAt: config.autoDestroyAt,
            updatedAt: new Date().toISOString()
          };

          await storageService.saveRecord(sealedRecord);
          
          const updatedRecords = records.map(r => 
            r.id === id ? sealedRecord : r
          );
          
          set({ records: updatedRecords });
        } catch (error) {
          console.error('Failed to seal record:', error);
          set({ error: '尘封记录失败' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // 解封记录
      unsealRecord: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const { records } = get();
          const record = records.find(r => r.id === id);
          
          if (!record) {
            throw new Error('记录不存在');
          }

          const unsealedRecord: EmotionalRecord = {
            ...record,
            isSealed: false,
            sealUntil: undefined,
            autoDestroyAt: undefined,
            updatedAt: new Date().toISOString()
          };

          await storageService.saveRecord(unsealedRecord);
          
          const updatedRecords = records.map(r => 
            r.id === id ? unsealedRecord : r
          );
          
          set({ records: updatedRecords });
        } catch (error) {
          console.error('Failed to unseal record:', error);
          set({ error: '解封记录失败' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // 设置过滤器
      setFilter: (newFilter: Partial<RecordFilter>) => {
        const { filter } = get();
        set({ filter: { ...filter, ...newFilter } });
      },

      // 设置排序
      setSort: (sort: SortConfig) => {
        set({ sort });
      },

      // 获取过滤后的记录
      getFilteredRecords: () => {
        const { records, filter, sort } = get();
        let filteredRecords = [...records];

        // 应用搜索过滤
        if (filter.searchText) {
          const searchText = filter.searchText.toLowerCase();
          filteredRecords = filteredRecords.filter(record =>
            record.title.toLowerCase().includes(searchText) ||
            record.content.toLowerCase().includes(searchText)
          );
        }

        // 应用日期范围过滤
        if (filter.dateRange) {
          filteredRecords = filteredRecords.filter(record => {
            const recordDate = new Date(record.createdAt);
            const startDate = new Date(filter.dateRange!.start);
            const endDate = new Date(filter.dateRange!.end);
            return recordDate >= startDate && recordDate <= endDate;
          });
        }

        // 应用尘封状态过滤
        if (filter.showSealed === false) {
          filteredRecords = filteredRecords.filter(record => !record.isSealed);
        }

        // 检查尘封解除时间
        const now = new Date().toISOString();
        filteredRecords = filteredRecords.map(record => {
          if (record.isSealed && record.sealUntil && record.sealUntil <= now) {
            // 自动解封
            get().unsealRecord(record.id).catch(console.error);
            return { ...record, isSealed: false, sealUntil: undefined };
          }
          return record;
        });

        // 应用排序
        filteredRecords.sort((a, b) => {
          const aValue = a[sort.field];
          const bValue = b[sort.field];
          
          if (sort.direction === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
          }
        });

        return filteredRecords;
      },

      // 加载设置
      loadSettings: async () => {
        try {
          const settings = await storageService.getSettings();
          set({ settings: settings || defaultSettings });
        } catch (error) {
          console.error('Failed to load settings:', error);
          set({ settings: defaultSettings });
        }
      },

      // 更新设置
      updateSettings: async (newSettings: Partial<AppSettings>) => {
        set({ isLoading: true, error: null });
        try {
          const { settings } = get();
          const updatedSettings = { ...settings, ...newSettings } as AppSettings;
          
          await storageService.saveSettings(updatedSettings);
          set({ settings: updatedSettings });
        } catch (error) {
          console.error('Failed to update settings:', error);
          set({ error: '更新设置失败' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // 设置错误
      setError: (error: string | null) => {
        set({ error });
      },

      // 清除错误
      clearError: () => {
        set({ error: null });
      },

      // 获取图片 URL
      getImageUrl: (imagePath: string) => {
        return storageService.getImageUrl(imagePath);
      },

      // 导出数据
      exportData: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await storageService.exportData();
          
          // 创建下载链接
          const blob = new Blob([JSON.stringify(data, null, 2)], { 
            type: 'application/json' 
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `拾忆数据备份_${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Failed to export data:', error);
          set({ error: '导出数据失败' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // 导入数据
      importData: async (file: File) => {
        set({ isLoading: true, error: null });
        try {
          const text = await file.text();
          const data = JSON.parse(text);
          
          await storageService.importData(data);
          
          // 重新加载数据
          await Promise.all([
            get().loadRecords(),
            get().loadSettings()
          ]);
        } catch (error) {
          console.error('Failed to import data:', error);
          set({ error: '导入数据失败' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'app-store'
    }
  )
);
