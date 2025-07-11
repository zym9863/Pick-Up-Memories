import { 
  isPermissionGranted, 
  requestPermission, 
  sendNotification 
} from '@tauri-apps/plugin-notification';
import { EmotionalRecord, NotificationConfig } from '../types';
import { storageService } from './storage';

class NotificationService {
  private checkInterval: number | null = null;
  private isInitialized = false;

  // 初始化通知服务
  async initialize(): Promise<void> {
    try {
      // 检查通知权限
      let permissionGranted = await isPermissionGranted();
      
      if (!permissionGranted) {
        const permission = await requestPermission();
        permissionGranted = permission === 'granted';
      }

      if (permissionGranted) {
        this.isInitialized = true;
        this.startPeriodicCheck();
        console.log('Notification service initialized');
      } else {
        console.warn('Notification permission not granted');
      }
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }

  // 开始定期检查
  private startPeriodicCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // 每分钟检查一次
    this.checkInterval = window.setInterval(() => {
      this.checkScheduledNotifications();
    }, 60 * 1000);

    // 立即执行一次检查
    this.checkScheduledNotifications();
  }

  // 停止定期检查
  stopPeriodicCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // 检查计划的通知
  private async checkScheduledNotifications(): Promise<void> {
    if (!this.isInitialized) return;

    try {
      const records = await storageService.getAllRecords();
      const now = new Date();

      for (const record of records) {
        await this.checkRecordNotifications(record, now);
      }
    } catch (error) {
      console.error('Failed to check scheduled notifications:', error);
    }
  }

  // 检查单个记录的通知
  private async checkRecordNotifications(record: EmotionalRecord, now: Date): Promise<void> {
    // 检查解封通知
    if (record.isSealed && record.sealUntil) {
      const sealUntilDate = new Date(record.sealUntil);
      const timeDiff = sealUntilDate.getTime() - now.getTime();
      
      // 如果已经到了解封时间
      if (timeDiff <= 0) {
        await this.sendUnsealNotification(record);
      }
      // 如果还有1小时解封，发送提醒
      else if (timeDiff <= 60 * 60 * 1000 && timeDiff > 59 * 60 * 1000) {
        await this.sendUnsealReminderNotification(record);
      }
    }

    // 检查销毁警告通知
    if (record.autoDestroyAt) {
      const destroyDate = new Date(record.autoDestroyAt);
      const timeDiff = destroyDate.getTime() - now.getTime();
      
      // 如果还有24小时销毁，发送警告
      if (timeDiff <= 24 * 60 * 60 * 1000 && timeDiff > 23 * 60 * 60 * 1000) {
        await this.sendDestroyWarningNotification(record);
      }
      // 如果还有1小时销毁，发送最后警告
      else if (timeDiff <= 60 * 60 * 1000 && timeDiff > 59 * 60 * 1000) {
        await this.sendFinalDestroyWarningNotification(record);
      }
    }
  }

  // 发送解封通知
  private async sendUnsealNotification(record: EmotionalRecord): Promise<void> {
    try {
      await sendNotification({
        title: '🔓 记忆解封',
        body: `"${record.title}" 已经解封，可以重新查看了`,
        icon: 'notification-icon.png'
      });
    } catch (error) {
      console.error('Failed to send unseal notification:', error);
    }
  }

  // 发送解封提醒通知
  private async sendUnsealReminderNotification(record: EmotionalRecord): Promise<void> {
    try {
      await sendNotification({
        title: '⏰ 即将解封',
        body: `"${record.title}" 将在1小时后解封`,
        icon: 'notification-icon.png'
      });
    } catch (error) {
      console.error('Failed to send unseal reminder notification:', error);
    }
  }

  // 发送销毁警告通知
  private async sendDestroyWarningNotification(record: EmotionalRecord): Promise<void> {
    try {
      await sendNotification({
        title: '⚠️ 销毁警告',
        body: `"${record.title}" 将在24小时后被永久销毁`,
        icon: 'notification-icon.png'
      });
    } catch (error) {
      console.error('Failed to send destroy warning notification:', error);
    }
  }

  // 发送最后销毁警告通知
  private async sendFinalDestroyWarningNotification(record: EmotionalRecord): Promise<void> {
    try {
      await sendNotification({
        title: '🚨 最后警告',
        body: `"${record.title}" 将在1小时后被永久销毁！`,
        icon: 'notification-icon.png'
      });
    } catch (error) {
      console.error('Failed to send final destroy warning notification:', error);
    }
  }

  // 发送自定义通知
  async sendCustomNotification(config: NotificationConfig): Promise<void> {
    if (!this.isInitialized) {
      console.warn('Notification service not initialized');
      return;
    }

    try {
      await sendNotification({
        title: config.title,
        body: config.body,
        icon: config.icon || 'notification-icon.png'
      });
    } catch (error) {
      console.error('Failed to send custom notification:', error);
    }
  }

  // 发送备份提醒
  async sendBackupReminder(): Promise<void> {
    try {
      const stats = await storageService.getStorageStats();
      await sendNotification({
        title: '💾 备份提醒',
        body: `您有 ${stats.totalRecords} 条记录，建议定期备份数据`,
        icon: 'notification-icon.png'
      });
    } catch (error) {
      console.error('Failed to send backup reminder:', error);
    }
  }

  // 检查权限状态
  async checkPermission(): Promise<boolean> {
    try {
      return await isPermissionGranted();
    } catch (error) {
      console.error('Failed to check notification permission:', error);
      return false;
    }
  }

  // 请求权限
  async requestPermission(): Promise<boolean> {
    try {
      const permission = await requestPermission();
      const granted = permission === 'granted';
      
      if (granted && !this.isInitialized) {
        this.isInitialized = true;
        this.startPeriodicCheck();
      }
      
      return granted;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  // 获取下一个通知时间
  async getNextNotificationTime(): Promise<Date | null> {
    try {
      const records = await storageService.getAllRecords();
      const now = new Date();
      let nextTime: Date | null = null;

      for (const record of records) {
        // 检查解封时间
        if (record.isSealed && record.sealUntil) {
          const sealDate = new Date(record.sealUntil);
          if (sealDate > now && (!nextTime || sealDate < nextTime)) {
            nextTime = sealDate;
          }
        }

        // 检查销毁时间
        if (record.autoDestroyAt) {
          const destroyDate = new Date(record.autoDestroyAt);
          // 24小时前的警告时间
          const warningDate = new Date(destroyDate.getTime() - 24 * 60 * 60 * 1000);
          if (warningDate > now && (!nextTime || warningDate < nextTime)) {
            nextTime = warningDate;
          }
        }
      }

      return nextTime;
    } catch (error) {
      console.error('Failed to get next notification time:', error);
      return null;
    }
  }

  // 获取通知统计
  async getNotificationStats(): Promise<{
    pendingUnseals: number;
    pendingDestroys: number;
    nextNotification: Date | null;
  }> {
    try {
      const records = await storageService.getAllRecords();
      const now = new Date();
      
      let pendingUnseals = 0;
      let pendingDestroys = 0;

      for (const record of records) {
        if (record.isSealed && record.sealUntil && new Date(record.sealUntil) > now) {
          pendingUnseals++;
        }
        if (record.autoDestroyAt && new Date(record.autoDestroyAt) > now) {
          pendingDestroys++;
        }
      }

      const nextNotification = await this.getNextNotificationTime();

      return {
        pendingUnseals,
        pendingDestroys,
        nextNotification
      };
    } catch (error) {
      console.error('Failed to get notification stats:', error);
      return {
        pendingUnseals: 0,
        pendingDestroys: 0,
        nextNotification: null
      };
    }
  }

  // 清理服务
  cleanup(): void {
    this.stopPeriodicCheck();
    this.isInitialized = false;
  }
}

// 创建单例实例
export const notificationService = new NotificationService();

// 导出类型和服务
export default NotificationService;
