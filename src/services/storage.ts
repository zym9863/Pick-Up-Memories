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

  // 初始化存储目录
  async initialize(): Promise<void> {
    try {
      this.dataDir = 'pick-up-memories';
      this.imagesDir = 'pick-up-memories/images';
      this.musicDir = 'pick-up-memories/music';

      // 创建必要的目录
      await this.ensureDirectoryExists(this.dataDir);
      await this.ensureDirectoryExists(this.imagesDir);
      await this.ensureDirectoryExists(this.musicDir);

      console.log('Storage service initialized:', {
        dataDir: this.dataDir,
        imagesDir: this.imagesDir,
        musicDir: this.musicDir
      });
    } catch (error) {
      console.error('Failed to initialize storage service:', error);
      throw new Error('存储服务初始化失败');
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
      return [];
    }
  }

  // 保存所有记录
  async saveAllRecords(records: EmotionalRecord[]): Promise<void> {
    try {
      const filePath = this.getRecordsFilePath();
      const content = JSON.stringify(records, null, 2);
      await writeTextFile(filePath, content, { baseDir: BaseDirectory.AppData });
    } catch (error) {
      console.error('Failed to save records:', error);
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

  // 删除记录相关的文件（简化版本）
  private async deleteRecordFiles(record: EmotionalRecord): Promise<void> {
    try {
      // 在简化版本中，我们只是清理 blob URLs
      for (const imagePath of record.images) {
        if (imagePath.startsWith('blob:')) {
          URL.revokeObjectURL(imagePath);
        }
      }

      if (record.musicUrl && record.musicUrl.startsWith('blob:')) {
        URL.revokeObjectURL(record.musicUrl);
      }
    } catch (error) {
      console.error('Failed to delete record files:', error);
    }
  }

  // 保存图片文件（简化版本，暂时返回文件路径）
  async saveImage(file: File): Promise<string> {
    try {
      // 暂时返回一个模拟的文件路径
      // 在实际应用中，这里应该将文件保存到应用数据目录
      return URL.createObjectURL(file);
    } catch (error) {
      console.error('Failed to save image:', error);
      throw new Error('保存图片失败');
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
      const filePath = this.getSettingsFilePath();
      const fileExists = await exists(filePath, { baseDir: BaseDirectory.AppData });

      if (!fileExists) {
        return null;
      }

      const content = await readTextFile(filePath, { baseDir: BaseDirectory.AppData });
      return JSON.parse(content) as AppSettings;
    } catch (error) {
      console.error('Failed to read settings:', error);
      return null;
    }
  }

  // 保存应用设置
  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      const filePath = this.getSettingsFilePath();
      const content = JSON.stringify(settings, null, 2);
      await writeTextFile(filePath, content, { baseDir: BaseDirectory.AppData });
    } catch (error) {
      console.error('Failed to save settings:', error);
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
}

// 创建单例实例
export const storageService = new StorageService();

// 导出类型和服务
export default StorageService;
