/**
 * parking-demo 后端连接示例
 * 此文件演示如何使用 config/api.js 中的接口连接到 parking-demo 后端数据库
 */

// 导入API配置和方法
import { 
  violationInspectionAPI, 
  statisticsAPI, 
  patrolAPI, 
  appointmentAPI,
  ownerAPI,
  apiConfig 
} from '../config/api.js';

/**
 * 违规检查功能示例
 */
export class ViolationInspectionService {
  
  // 初始化检查面板数据
  async initInspectionDashboard() {
    try {
      console.log('🚀 正在初始化违规检查面板...');
      console.log('📡 连接后端:', apiConfig.baseURL);
      
      // 并行获取多个数据
      const [pendingVehicles, overview, realtimeData] = await Promise.all([
        violationInspectionAPI.getPendingVehicles({ limit: 50 }),
        statisticsAPI.getViolationOverview({ 
          startDate: this.getToday(),
          endDate: this.getToday()
        }),
        violationInspectionAPI.getRealTimeParkingData()
      ]);
      
      console.log('✅ 数据加载成功');
      console.log('📊 待检查车辆:', pendingVehicles?.length || 0);
      console.log('📈 今日违规概览:', overview);
      
      return {
        pendingVehicles: pendingVehicles || [],
        overview: overview || {},
        realtimeData: realtimeData || {}
      };
      
    } catch (error) {
      console.error('❌ 初始化面板失败:', error);
      throw error;
    }
  }
  
  // 处理违规检查
  async processViolation(plateNumber, violationType, evidence) {
    try {
      console.log(`🔍 正在处理违规检查: ${plateNumber}`);
      
      // 先获取车辆详细信息
      const vehicleDetails = await violationInspectionAPI.getVehicleDetails(plateNumber);
      
      if (!vehicleDetails) {
        throw new Error('未找到车辆信息');
      }
      
      // 提交违规检查结果
      const result = await violationInspectionAPI.submitInspectionResult({
        plateNumber,
        violationType,
        evidence,
        vehicleDetails,
        inspectionTime: new Date().toISOString(),
        inspector: this.getCurrentUser()
      });
      
      console.log('✅ 违规记录提交成功:', result);
      return result;
      
    } catch (error) {
      console.error('❌ 处理违规失败:', error);
      throw error;
    }
  }
  
  // 批量处理违规记录
  async batchProcessViolations(violationIds, action) {
    try {
      console.log(`📦 批量处理 ${violationIds.length} 条违规记录, 操作: ${action}`);
      
      const result = await violationInspectionAPI.batchProcessViolations(violationIds, action);
      
      console.log('✅ 批量处理完成:', result);
      return result;
      
    } catch (error) {
      console.error('❌ 批量处理失败:', error);
      throw error;
    }
  }
  
  // 生成违规报告
  async generateReport(dateRange, format = 'excel') {
    try {
      console.log('📊 正在生成违规报告...');
      
      const report = await violationInspectionAPI.exportViolationReport({
        ...dateRange,
        format,
        includeDetails: true
      });
      
      console.log('✅ 报告生成成功');
      return report;
      
    } catch (error) {
      console.error('❌ 报告生成失败:', error);
      throw error;
    }
  }
  
  // 工具方法
  getToday() {
    return new Date().toISOString().split('T')[0];
  }
  
  getCurrentUser() {
    // 从本地存储获取当前用户信息
    try {
      const userInfo = uni.getStorageSync('userInfo');
      return userInfo?.patrolData?.username || userInfo?.userInfo?.username || '未知用户';
    } catch (error) {
      return '未知用户';
    }
  }
}

/**
 * 数据统计功能示例
 */
export class StatisticsService {
  
  // 获取完整的统计报告
  async getCompleteStatistics(dateRange) {
    try {
      console.log('📈 正在获取统计数据...');
      
      // 并行获取所有统计数据
      const [overview, timeStats, areaStats, trends, hotspots] = await Promise.all([
        statisticsAPI.getViolationOverview(dateRange),
        statisticsAPI.getTimeBasedStats(dateRange),
        statisticsAPI.getAreaBasedStats(dateRange),
        statisticsAPI.getTrendAnalysis(dateRange),
        statisticsAPI.getHotSpotAnalysis(dateRange)
      ]);
      
      console.log('✅ 统计数据加载完成');
      
      return {
        overview,
        timeStats,
        areaStats,
        trends,
        hotspots
      };
      
    } catch (error) {
      console.error('❌ 获取统计数据失败:', error);
      throw error;
    }
  }
  
  // 获取实时监控数据
  async getRealTimeMonitoring() {
    try {
      const [realtimeData, patrolStats] = await Promise.all([
        violationInspectionAPI.getRealTimeParkingData(),
        this.getCurrentPatrolStats()
      ]);
      
      return {
        parking: realtimeData,
        patrol: patrolStats
      };
      
    } catch (error) {
      console.error('❌ 获取实时数据失败:', error);
      throw error;
    }
  }
  
  // 获取当前巡逻员统计
  async getCurrentPatrolStats() {
    try {
      const userInfo = uni.getStorageSync('userInfo');
      if (userInfo?.patrolData?.id) {
        return await patrolAPI.getTodayStats(userInfo.patrolData.id);
      }
      return null;
    } catch (error) {
      console.warn('⚠️ 获取巡逻员统计失败:', error);
      return null;
    }
  }
}

/**
 * 数据同步功能示例
 */
export class DataSyncService {
  
  // 同步外部停车系统数据
  async syncExternalData(systemType = 'all') {
    try {
      console.log(`🔄 正在同步外部停车系统数据: ${systemType}`);
      
      const result = await violationInspectionAPI.syncExternalParkingData(systemType);
      
      console.log('✅ 数据同步完成:', result);
      return result;
      
    } catch (error) {
      console.error('❌ 数据同步失败:', error);
      throw error;
    }
  }
  
  // 定期数据同步（可用于定时任务）
  async scheduledSync() {
    const syncInterval = 5 * 60 * 1000; // 5分钟
    
    setInterval(async () => {
      try {
        console.log('⏰ 执行定时数据同步...');
        await this.syncExternalData();
      } catch (error) {
        console.error('❌ 定时同步失败:', error);
      }
    }, syncInterval);
  }
}

/**
 * 使用示例
 */
export default {
  ViolationInspectionService,
  StatisticsService,
  DataSyncService,
  
  // 快速使用示例
  async quickExample() {
    try {
      // 初始化服务
      const inspectionService = new ViolationInspectionService();
      const statsService = new StatisticsService();
      
      // 获取面板数据
      const dashboardData = await inspectionService.initInspectionDashboard();
      console.log('📊 面板数据:', dashboardData);
      
      // 获取今日统计
      const todayStats = await statsService.getCompleteStatistics({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      });
      console.log('📈 今日统计:', todayStats);
      
      return { dashboardData, todayStats };
      
    } catch (error) {
      console.error('❌ 示例执行失败:', error);
      throw error;
    }
  }
};

/**
 * 使用说明：
 * 
 * 1. 在页面中导入并使用：
 *    import ParkingDemoAPI from '@/api/parking-demo-connection.js';
 * 
 * 2. 初始化服务：
 *    const inspectionService = new ParkingDemoAPI.ViolationInspectionService();
 * 
 * 3. 调用API：
 *    const result = await inspectionService.initInspectionDashboard();
 * 
 * 4. 环境切换：
 *    修改 config/api.js 中的 currentEnv 变量切换开发/生产环境
 * 
 * 注意事项：
 * - 确保 parking-demo 后端服务正在运行（端口8543）
 * - 检查网络连接和跨域设置
 * - 后端需要实现对应的接口端点
 * - 建议在调用前检查用户登录状态
 */ 