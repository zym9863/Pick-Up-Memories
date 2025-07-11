import {
  readTextFile,
  writeTextFile,
  exists,
  create
} from '@tauri-apps/plugin-fs';
import { BaseDirectory } from '@tauri-apps/plugin-fs';
import {
  EmotionalRecord,
  AppSettings,
  ExportData
} from '../types';

class StorageService {
  private dataDir: string | null = null;
  private imagesDir: string | null = null;
  private musicDir: string | null = null;
  private useFallback: boolean = false;

  // 初始化存储目录
  async initialize(): Promise<void> {
    try {
      this.dataDir = 'pick-up-memories';
      this.imagesDir = 'pick-up-memories/images';
      this.musicDir = 'pick-up-memories/music';

      // 尝试创建必要的目录
      try {
        await this.ensureDirectoryExists(this.dataDir);
        await this.ensureDirectoryExists(this.imagesDir);
        await this.ensureDirectoryExists(this.musicDir);
        this.useFallback = false;
      } catch (error) {
        console.warn('Tauri file system not available, using localStorage fallback');
        this.useFallback = true;
      }

      console.log('Storage service initialized:', {
        dataDir: this.dataDir,
        imagesDir: this.imagesDir,
        musicDir: this.musicDir,
        useFallback: this.useFallback
      });
    } catch (error) {
      console.error('Failed to initialize storage service:', error);
      // 使用 localStorage 作为后备
      this.useFallback = true;
      console.log('Using localStorage as fallback storage');
    }
  }

  // 确保目录存在
  private async ensureDirectoryExists(path: string): Promise<void> {
    try {
      const dirExists = await exists(path, { baseDir: BaseDirectory.AppData });
      if (!dirExists) {
        await create(path, { baseDir: BaseDirectory.AppData });
      }
    } catch (error) {
      console.error(`Failed to create directory ${path}:`, error);
      // 忽略目录创建错误，继续执行
    }
  }

  // 获取记录文件路径
  private getRecordsFilePath(): string {
    if (!this.dataDir) {
      throw new Error('Storage service not initialized');
    }
    return `${this.dataDir}/records.json`;
  }

  // 获取设置文件路径
  private getSettingsFilePath(): string {
    if (!this.dataDir) {
      throw new Error('Storage service not initialized');
    }
    return `${this.dataDir}/settings.json`;
  }

  // 读取所有记录
  async getAllRecords(): Promise<EmotionalRecord[]> {
    try {
      if (this.useFallback) {
        return this.getAllRecordsFromLocalStorage();
      }

      const filePath = this.getRecordsFilePath();
      const fileExists = await exists(filePath, { baseDir: BaseDirectory.AppData });

      if (!fileExists) {
        return [];
      }

      const content = await readTextFile(filePath, { baseDir: BaseDirectory.AppData });
      const records = JSON.parse(content) as EmotionalRecord[];

      // 检查并处理过期的自动销毁记录
      const now = new Date().toISOString();
      const validRecords = records.filter(record => {
        if (record.autoDestroyAt && record.autoDestroyAt <= now) {
          // 删除过期记录的相关文件
          this.deleteRecordFiles(record).catch(console.error);
          return false;
        }
        return true;
      });

      // 如果有记录被删除，更新文件
      if (validRecords.length !== records.length) {
        await this.saveAllRecords(validRecords);
      }

      return validRecords;
    } catch (error) {
      console.error('Failed to read records:', error);
      // 如果 Tauri 文件系统失败，尝试使用 localStorage
      if (!this.useFallback) {
        this.useFallback = true;
        return this.getAllRecordsFromLocalStorage();
      }
      return [];
    }
  }

  // 从 localStorage 读取记录
  private getAllRecordsFromLocalStorage(): EmotionalRecord[] {
    try {
      const stored = localStorage.getItem('pick-up-memories-records');
      if (!stored) {
        return [];
      }
      const records = JSON.parse(stored) as EmotionalRecord[];

      // 检查并处理过期的自动销毁记录
      const now = new Date().toISOString();
      const validRecords = records.filter(record => {
        if (record.autoDestroyAt && record.autoDestroyAt <= now) {
          this.deleteRecordFiles(record).catch(console.error);
          return false;
        }
        return true;
      });

      // 如果有记录被删除，更新 localStorage
      if (validRecords.length !== records.length) {
        localStorage.setItem('pick-up-memories-records', JSON.stringify(validRecords));
      }

      return validRecords;
    } catch (error) {
      console.error('Failed to read records from localStorage:', error);
      return [];
    }
  }

  // 保存所有记录
  async saveAllRecords(records: EmotionalRecord[]): Promise<void> {
    try {
      if (this.useFallback) {
        this.saveAllRecordsToLocalStorage(records);
        return;
      }

      const filePath = this.getRecordsFilePath();
      const content = JSON.stringify(records, null, 2);
      await writeTextFile(filePath, content, { baseDir: BaseDirectory.AppData });
    } catch (error) {
      console.error('Failed to save records:', error);
      // 如果 Tauri 文件系统失败，尝试使用 localStorage
      if (!this.useFallback) {
        this.useFallback = true;
        this.saveAllRecordsToLocalStorage(records);
        return;
      }
      throw new Error('保存记录失败');
    }
  }

  // 保存记录到 localStorage
  private saveAllRecordsToLocalStorage(records: EmotionalRecord[]): void {
    try {
      localStorage.setItem('pick-up-memories-records', JSON.stringify(records));
    } catch (error) {
      console.error('Failed to save records to localStorage:', error);
      throw new Error('保存记录失败');
    }
  }

  // 保存单个记录
  async saveRecord(record: EmotionalRecord): Promise<void> {
    try {
      const records = await this.getAllRecords();
      const existingIndex = records.findIndex(r => r.id === record.id);
      
      if (existingIndex >= 0) {
        records[existingIndex] = record;
      } else {
        records.push(record);
      }
      
      await this.saveAllRecords(records);
    } catch (error) {
      console.error('Failed to save record:', error);
      throw new Error('保存记录失败');
    }
  }

  // 删除记录
  async deleteRecord(id: string): Promise<void> {
    try {
      const records = await this.getAllRecords();
      const record = records.find(r => r.id === id);
      
      if (record) {
        // 删除相关文件
        await this.deleteRecordFiles(record);
        
        // 从记录列表中移除
        const updatedRecords = records.filter(r => r.id !== id);
        await this.saveAllRecords(updatedRecords);
      }
    } catch (error) {
      console.error('Failed to delete record:', error);
      throw new Error('删除记录失败');
    }
  }

  // 删除记录相关的文件
  private async deleteRecordFiles(record: EmotionalRecord): Promise<void> {
    try {
      // 清理 blob URLs（如果有的话）
      for (const imagePath of record.images) {
        if (imagePath.startsWith('blob:')) {
          URL.revokeObjectURL(imagePath);
        }
        // data URLs 不需要清理
      }

      if (record.musicUrl && record.musicUrl.startsWith('blob:')) {
        URL.revokeObjectURL(record.musicUrl);
      }
      // data URLs 不需要清理
    } catch (error) {
      console.error('Failed to delete record files:', error);
    }
  }

  // 保存图片文件
  async saveImage(file: File): Promise<string> {
    try {
      // 统一使用 base64 编码保存图片
      // 这样可以避免 Tauri 中的文件路径访问问题
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      const mimeType = file.type || 'image/jpeg';
      
      return `data:${mimeType};base64,${base64}`;
    } catch (error) {
      console.error('Failed to save image:', error);
      // 如果转换失败，使用 blob URL 作为后备
      return URL.createObjectURL(file);
    }
  }

  // 保存音乐文件（简化版本，暂时返回文件路径）
  async saveMusic(file: File): Promise<string> {
    try {
      // 暂时返回一个模拟的文件路径
      // 在实际应用中，这里应该将文件保存到应用数据目录
      return URL.createObjectURL(file);
    } catch (error) {
      console.error('Failed to save music:', error);
      throw new Error('保存音乐文件失败');
    }
  }

  // 读取应用设置
  async getSettings(): Promise<AppSettings | null> {
    try {
      if (this.useFallback) {
        return this.getSettingsFromLocalStorage();
      }

      const filePath = this.getSettingsFilePath();
      const fileExists = await exists(filePath, { baseDir: BaseDirectory.AppData });

      if (!fileExists) {
        return null;
      }

      const content = await readTextFile(filePath, { baseDir: BaseDirectory.AppData });
      return JSON.parse(content) as AppSettings;
    } catch (error) {
      console.error('Failed to read settings:', error);
      // 如果 Tauri 文件系统失败，尝试使用 localStorage
      if (!this.useFallback) {
        this.useFallback = true;
        return this.getSettingsFromLocalStorage();
      }
      return null;
    }
  }

  // 从 localStorage 读取设置
  private getSettingsFromLocalStorage(): AppSettings | null {
    try {
      const stored = localStorage.getItem('pick-up-memories-settings');
      return stored ? JSON.parse(stored) as AppSettings : null;
    } catch (error) {
      console.error('Failed to read settings from localStorage:', error);
      return null;
    }
  }

  // 保存应用设置
  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      if (this.useFallback) {
        this.saveSettingsToLocalStorage(settings);
        return;
      }

      const filePath = this.getSettingsFilePath();
      const content = JSON.stringify(settings, null, 2);
      await writeTextFile(filePath, content, { baseDir: BaseDirectory.AppData });
    } catch (error) {
      console.error('Failed to save settings:', error);
      // 如果 Tauri 文件系统失败，尝试使用 localStorage
      if (!this.useFallback) {
        this.useFallback = true;
        this.saveSettingsToLocalStorage(settings);
        return;
      }
      throw new Error('保存设置失败');
    }
  }

  // 保存设置到 localStorage
  private saveSettingsToLocalStorage(settings: AppSettings): void {
    try {
      localStorage.setItem('pick-up-memories-settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
      throw new Error('保存设置失败');
    }
  }

  // 导出数据
  async exportData(): Promise<ExportData> {
    try {
      const records = await this.getAllRecords();
      const settings = await this.getSettings();
      
      return {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        records,
        settings: settings || {} as AppSettings
      };
    } catch (error) {
      console.error('Failed to export data:', error);
      throw new Error('导出数据失败');
    }
  }

  // 导入数据
  async importData(data: ExportData): Promise<void> {
    try {
      // 备份当前数据
      const currentRecords = await this.getAllRecords();
      const currentSettings = await this.getSettings();
      
      try {
        // 导入新数据
        await this.saveAllRecords(data.records);
        if (data.settings) {
          await this.saveSettings(data.settings);
        }
      } catch (error) {
        // 如果导入失败，恢复备份
        await this.saveAllRecords(currentRecords);
        if (currentSettings) {
          await this.saveSettings(currentSettings);
        }
        throw error;
      }
    } catch (error) {
      console.error('Failed to import data:', error);
      throw new Error('导入数据失败');
    }
  }

  // 获取存储统计信息
  async getStorageStats(): Promise<{
    totalRecords: number;
    sealedRecords: number;
    totalImages: number;
    totalMusicFiles: number;
  }> {
    try {
      const records = await this.getAllRecords();
      const sealedRecords = records.filter(r => r.isSealed).length;
      const totalImages = records.reduce((sum, r) => sum + r.images.length, 0);
      const totalMusicFiles = records.filter(r => r.musicUrl).length;

      return {
        totalRecords: records.length,
        sealedRecords,
        totalImages,
        totalMusicFiles
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return {
        totalRecords: 0,
        sealedRecords: 0,
        totalImages: 0,
        totalMusicFiles: 0
      };
    }
  }

  // 获取图片的显示URL
  getImageUrl(imagePath: string): string {
    // 直接返回路径，因为现在我们使用 data URLs 或 blob URLs
    return imagePath;
  }
}

// 创建单例实例
export const storageService = new StorageService();

// 导出类型和服务
export default StorageService;
