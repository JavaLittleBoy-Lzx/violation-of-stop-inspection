// API配置文件 - 违规检查系统专用
// 更新说明：已移除复杂的角色判定体系，改为简单的用户名密码登录
// 系统只提供登录认证功能，车场人员管理在其他系统中完成
const config = {
  // 开发环境
  development: {
    baseURL: 'https://www.xuerparking.cn:8543', // 连接到 parking-demo 后端
    timeout: 30000 // 增加到30秒，适应后端外部API调用
  },
  
  // 花生壳内网穿透环境
  tunnel: {
    baseURL: 'https://csharphrb.picp.vip', // 免费版会显示中间页，建议升级专业版
    timeout: 45000 // 内网穿透可能较慢，增加超时时间
  },
  
  // 生产环境 - 连接到 parking-demo 正式服务器
  production: {
    baseURL: 'https://www.xuerparking.cn:8543', // parking-demo 正式服务器地址
    timeout: 45000 // 生产环境45秒超时
  }
};

// 当前环境（可以根据实际情况动态判断）
const currentEnv = 'production'; // 'development' | 'tunnel' | 'production' - 连接 parking-demo 后端，使用统一认证

// 导出当前环境配置
export const apiConfig = config[currentEnv];

// API接口地址 - 违规检查系统专用
export const apiUrls = {
  // 登录认证相关
  auth: {
    login: '/parking/auth/login',
    logout: '/parking/auth/logout',
    checkToken: '/parking/auth/check-token'
  },
  // 违规记录相关
  violations: {
    list: '/parking/violations',
    create: '/parking/violations',
    updateStatus: '/parking/violations/{id}/status',
    statistics: '/parking/violations/statistics',
    highRiskVehicles: '/parking/violations/high-risk-vehicles',
    byOwner: '/parking/violations/by-owner/{ownerId}',
    byPlate: '/parking/violations', // 使用主查询接口，通过plateNumber参数过滤
    userRecords: '/parking/violations/user-records' // 用户违规记录
  },

  // 车主相关
  owners: {
    byPlate: '/parking/violations/owners/by-plate/{plateNumber}',
    plateSuggestions: '/parking/violations/owners/plate-suggestions',
    vehicles: '/parking/violations/owners/{ownerId}/vehicles',
    creditScore: '/parking/violations/owners/{ownerId}/credit-score',
    search: '/parking/owners/search',
    getInfo: '/parking/owners/{id}'
  },

  // 预约相关
  appointments: {
    list: '/parking/appointments',
    create: '/parking/appointments',
    update: '/parking/appointments/{id}',
    delete: '/parking/appointments/{id}'
  },

  // 车辆查询相关
  monthTicket: {
    smartSearch: '/parking/monthTicket/smartSearch',
    getVehicleDetails: '/parking/monthTicket/getVehicleDetails',
    getVehicleDetailsWithParkStatus: '/parking/monthTicket/getVehicleDetailsWithParkStatus',
    getPlateSuggestions: '/parking/monthTicket/getPlateSuggestions',
    checkVehicleInPark: '/parking/monthTicket/checkVehicleInPark',
    getVehicleStats: '/parking/monthTicket/getVehicleStats',
    // month_tick表相关接口
    searchLocalData: '/parking/monthTicket/searchLocalData',
    checkParkDataExists: '/parking/monthTicket/checkParkDataExists',
    batchImportParkData: '/parking/monthTicket/batchImportParkData',
    getLocalPlateSuggestions: '/parking/monthTicket/getLocalPlateSuggestions',
    // 在场查询接口
    getParkOnSiteCarByCarNo: '/parking/vehicleReservation/getParkOnSiteCarByCarNo'
  },

  // 违规类型相关
  violationTypes: {
    list: '/parking/violation-types',
    create: '/parking/violation-types',
    update: '/parking/violation-types/{id}',
    delete: '/parking/violation-types/{id}'
  },

  // 巡逻员相关（通过统一认证后使用）
  patrol: {
    list: '/parking/patrol',
    create: '/parking/patrol',
    update: '/parking/patrol/{id}',
    delete: '/parking/patrol/{id}',
    getById: '/parking/patrol/{id}',
    getByPhone: '/parking/patrol/getByPhone',
    getTodayStats: '/parking/patrol/{id}/today-stats',
    getWorkSchedule: '/parking/patrol/{id}/work-schedule',
    updateWorkStatus: '/parking/patrol/{id}/work-status',
    getViolationsByPatrol: '/parking/patrol/{id}/violations'
  },

  // 文件上传相关（违规证据上传）
  upload: {
    violationPhotos: '/api/upload/violation-photos',
    evidenceFiles: '/api/upload/evidence-files',
    general: '/api/upload/files'
  },

  // 违规检查专用接口（连接 parking-demo 数据库）
  violationInspection: {
    // 获取待检查车辆列表
    getPendingVehicles: '/parking/inspection/pending-vehicles',
    // 提交违规检查结果
    submitInspectionResult: '/parking/inspection/submit-result',
    // 获取检查历史记录
    getInspectionHistory: '/parking/inspection/history',
    // 获取车辆详细信息
    getVehicleDetails: '/parking/inspection/vehicle-details',
    // 批量处理违规记录
    batchProcessViolations: '/parking/inspection/batch-process',
    // 导出违规报告
    exportViolationReport: '/parking/inspection/export-report',
    // 获取实时停车数据
    getRealTimeParkingData: '/parking/inspection/realtime-data',
    // 同步外部停车系统数据
    syncExternalParkingData: '/parking/inspection/sync-external-data'
  },

  // 数据统计分析接口
  statistics: {
    // 违规统计概览
    getViolationOverview: '/parking/statistics/violation-overview',
    // 按时间段统计
    getTimeBasedStats: '/parking/statistics/time-based',
    // 按区域统计
    getAreaBasedStats: '/parking/statistics/area-based',
    // 趋势分析
    getTrendAnalysis: '/parking/statistics/trend-analysis',
    // 热点分析
    getHotSpotAnalysis: '/parking/statistics/hotspot-analysis'
  },

  // 白名单管理接口
  whitelist: {
    // 检查车辆是否在白名单中
    check: '/parking/whitelist/check',
    // 根据车牌查询白名单记录
    byPlate: '/parking/whitelist/by-plate',
    // 白名单列表
    list: '/parking/whitelist',
    // 创建白名单
    create: '/parking/whitelist',
    // 更新白名单
    update: '/parking/whitelist/{id}',
    // 删除白名单
    delete: '/parking/whitelist/{id}'
  }
};

// 构建完整的API地址
export function buildApiUrl(path) {
  return apiConfig.baseURL + path;
}

// 通用请求方法（带重试机制）
export function request(options) {
  const {
    url,
    method = 'GET',
    data = {},
    header = {},
    timeout = apiConfig.timeout,
    maxRetries = 2,
    retryDelay = 1000
  } = options;
  
  return new Promise((resolve, reject) => {
    let attemptCount = 0;
    
    function makeRequest() {
      attemptCount++;
      
      console.log(` API请求开始 [${method}] ${url} (第${attemptCount}次尝试)`);
      
      // 优化日志显示：区分GET和POST请求的参数显示
      if (method === 'GET') {
        const hasUrlParams = url.includes('?');
        if (hasUrlParams) {
          const [baseUrl, queryString] = url.split('?');
          const paramsObj = {};
          if (queryString) {
            queryString.split('&').forEach(param => {
              const [key, value] = param.split('=');
              if (key) {
                paramsObj[decodeURIComponent(key)] = value ? decodeURIComponent(value) : '';
              }
            });
          }
          console.log(` URL参数:`, paramsObj);
          console.log(` 请求体: 空 (GET请求)`);
        } else {
          console.log(` URL参数: 无`);
          console.log(` 请求体:`, Object.keys(data).length > 0 ? data : '空 (GET请求)');
        }
      } else {
        console.log(` 请求体参数:`, data);
      }
      
      console.log(`⏰ 超时设置: ${timeout}ms`);
      
      const startTime = Date.now();
      
      // 自动添加用户信息到请求头
      const requestHeaders = {
        'Content-Type': 'application/json',
        ...header
      };
      
      // 尝试从本地存储获取用户信息并添加到请求头
      try {
        // 获取用户登录信息
        const userInfo = uni.getStorageSync('userInfo');
        const token = uni.getStorageSync('token');
        
        if (token) {
          requestHeaders['Authorization'] = `Bearer ${token}`;
          console.log(` 添加认证token到请求头`);
        }
        
        if (userInfo && userInfo.id && userInfo.username) {
          requestHeaders['User-Id'] = String(userInfo.id);
          
          // 用户名编码
          try {
            const encodedName = encodeURIComponent(userInfo.username);
            requestHeaders['User-Name-Encoded'] = encodedName;
            console.log(` 添加用户信息到请求头: User-Id=${userInfo.id}, UserName=${userInfo.username}, ParkName=${userInfo.parkName || 'N/A'}`);
          } catch (error) {
            console.warn('⚠️ 用户姓名编码失败，跳过:', error);
          }
          
          // 如果有车场信息，也添加到请求头
          if (userInfo.parkName) {
            try {
              const encodedParkName = encodeURIComponent(userInfo.parkName);
              requestHeaders['Park-Name-Encoded'] = encodedParkName;
            } catch (error) {
              console.warn('⚠️ 车场名称编码失败，跳过:', error);
            }
          }
        }
      } catch (error) {
        console.warn('⚠️ 获取用户信息失败，继续请求:', error);
      }
      
      uni.request({
        url: buildApiUrl(url),
        method,
        data,
        header: requestHeaders,
        timeout,
        success: (res) => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          console.log(`✅ API请求成功 [${method}] ${url} - 耗时: ${duration}ms, 状态码: ${res.statusCode}`);
          console.log(` 响应数据:`, res.data);
          
          if (res.statusCode === 200) {
            // 检查是否是花生壳中间页面
            if (typeof res.data === 'string' && res.data.includes('贝锐花生壳')) {
              console.warn('⚠️ 检测到花生壳中间页面，等待10秒后自动重试...');
              
              if (attemptCount <= maxRetries && !options._isHuashengkeRetry) {
                console.log(` 花生壳10秒等待中，将在12秒后自动重试 (第${attemptCount}次)`);
                options._isHuashengkeRetry = true;
                
                setTimeout(() => {
                  makeRequest();
                }, 12000);
                return;
              } else if (options._isHuashengkeRetry) {
                console.error('❌ 花生壳重试后仍然显示中间页面');
                const error = new Error('花生壳访问异常：重试后仍显示中间页面，请检查网络连接或稍后再试');
                error.statusCode = 'TUNNEL_RETRY_FAILED';
                error.data = res.data;
                error.duration = duration;
                error.isHuashengkeError = true;
                reject(error);
                return;
              } else {
                const error = new Error('花生壳免费版限制：显示中间页面。正在自动处理，请稍候...');
                error.statusCode = 'TUNNEL_LIMITATION';
                error.data = res.data;
                error.duration = duration;
                error.isHuashengkeError = true;
                reject(error);
                return;
              }
            }
            
            resolve(res.data);
          } else {
            const error = new Error(`HTTP ${res.statusCode}: ${res.data?.msg || '请求失败'}`);
            error.statusCode = res.statusCode;
            error.data = res.data;
            error.duration = duration;
            
            console.error(`❌ API响应错误 [${method}] ${url}:`, error);
            reject(error);
          }
        },
        fail: (err) => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          console.error(`❌ API请求失败 [${method}] ${url} - 耗时: ${duration}ms, 第${attemptCount}次尝试:`, err);
          
          // 检查是否需要重试
          if (attemptCount < maxRetries + 1 && shouldRetry(err)) {
            console.log(` 准备重试 [${method}] ${url} - ${retryDelay}ms后进行第${attemptCount + 1}次尝试`);
            setTimeout(() => {
              makeRequest();
            }, retryDelay * attemptCount); // 递增延迟
          } else {
            // 所有重试都失败了
            const error = new Error(getErrorMessage(err));
            error.originalError = err;
            error.duration = duration;
            error.attempts = attemptCount;
            
            console.error(` API请求最终失败 [${method}] ${url} - 总共尝试${attemptCount}次`);
            reject(error);
          }
        }
      });
    }
    
    makeRequest();
  });
}

// 判断是否应该重试
function shouldRetry(error) {
  if (error.errMsg) {
    const errMsg = error.errMsg.toLowerCase();
    return errMsg.includes('timeout') || 
           errMsg.includes('network') || 
           errMsg.includes('fail') ||
           errMsg.includes('abort');
  }
  return false;
}

// 获取友好的错误信息
function getErrorMessage(error) {
  if (!error.errMsg) {
    return '网络连接失败，请检查网络连接';
  }
  
  const errMsg = error.errMsg.toLowerCase();
  
  if (errMsg.includes('timeout')) {
    return '请求超时，服务器响应较慢，请稍后重试';
  } else if (errMsg.includes('network')) {
    return '网络连接失败，请检查网络连接';
  } else if (errMsg.includes('abort')) {
    return '请求被中断，请重试';
  } else {
    return `网络错误: ${error.errMsg}`;
  }
}

// 用户登录认证API
export const authAPI = {
  // 用户名密码登录
  login(username, password) {
    return request({
      url: apiUrls.auth.login,
      method: 'POST',
      data: { username, password },
      timeout: 30000,
      maxRetries: 2
    });
  },
  
  // 退出登录
  logout() {
    return request({
      url: apiUrls.auth.logout,
      method: 'POST',
      timeout: 10000
    });
  },
  
  // 检查token有效性
  checkToken() {
    return request({
      url: apiUrls.auth.checkToken,
      method: 'GET',
      timeout: 10000
    });
  }
};



// 车辆查询API
export const vehicleAPI = {
  // 智能搜索车辆
  smartSearch(query) {
    return request({
      url: apiUrls.monthTicket.smartSearch,
      method: 'GET',
      data: { query },
      timeout: 30000
    });
  },
  
  // 获取车辆详细信息
  getVehicleDetails(plateNumber) {
    return request({
      url: apiUrls.monthTicket.getVehicleDetails,
      method: 'GET',
      data: { plateNumber },
      timeout: 30000
    });
  },
  
  // 获取车辆详细信息（包含停车状态）
  getVehicleDetailsWithParkStatus(plateNumber) {
    return request({
      url: apiUrls.monthTicket.getVehicleDetailsWithParkStatus,
      method: 'GET',
      data: { plateNumber },
      timeout: 30000
    });
  },
  
  // 获取车牌号建议
  getPlateSuggestions(query) {
    return request({
      url: apiUrls.monthTicket.getPlateSuggestions,
      method: 'GET',
      data: { query },
      timeout: 15000
    });
  },
  
  // 检查车辆是否在场
  checkVehicleInPark(plateNumber) {
    return request({
      url: apiUrls.monthTicket.checkVehicleInPark,
      method: 'GET',
      data: { plateNumber },
      timeout: 30000
    });
  },
  
  // 根据车牌号查询在场车辆
  getParkOnSiteCarByCarNo(plateNumber) {
    return request({
      url: apiUrls.monthTicket.getParkOnSiteCarByCarNo,
      method: 'GET',
      data: { plateNumber },
      timeout: 30000
    });
  }
};

// 违规记录API
export const violationAPI = {
  // 获取违规记录列表
  getList(params = {}) {
    return request({
      url: apiUrls.violations.list,
      method: 'GET',
      data: params,
      timeout: 30000
    });
  },
  
  // 创建违规记录
  create(data) {
    return request({
      url: apiUrls.violations.create,
      method: 'POST',
      data,
      timeout: 30000
    });
  },
  
  // 更新违规状态
  updateStatus(id, status) {
    return request({
      url: apiUrls.violations.updateStatus.replace('{id}', id),
      method: 'PUT',
      data: { status },
      timeout: 30000
    });
  },
  
  // 根据车牌号获取违规记录
  getByPlate(plateNumber) {
    return request({
      url: apiUrls.violations.byPlate,
      method: 'GET',
      data: { plateNumber },
      timeout: 30000
    });
  },
  
  // 获取用户违规记录
  getUserRecords(params = {}) {
    return request({
      url: apiUrls.violations.userRecords,
      method: 'GET',
      data: params,
      timeout: 30000
    });
  }
};

// 巡逻员API（已整合到统一认证体系，这些接口用于获取巡逻员的工作数据）
export const patrolAPI = {
  // 获取巡逻员信息 - 通过手机号（向后兼容）
  getByPhone(phone) {
    return request({
      url: apiUrls.patrol.getByPhone,
      method: 'GET',
      data: { phone }
    });
  },

  // 获取巡逻员今日统计
  getTodayStats(patrolId) {
    return request({
      url: apiUrls.patrol.getTodayStats.replace('{id}', patrolId),
      method: 'GET'
    });
  },

  // 更新工作状态
  updateWorkStatus(patrolId, status) {
    return request({
      url: apiUrls.patrol.updateWorkStatus.replace('{id}', patrolId),
      method: 'PUT',
      data: { status }
    });
  },

  // 获取巡逻员的违规记录
  getViolationsByPatrol(patrolId, params = {}) {
    return request({
      url: apiUrls.patrol.getViolationsByPatrol.replace('{id}', patrolId),
      method: 'GET',
      data: params
    });
  }
};

// 文件上传API
export const uploadAPI = {
  // 上传违规照片
  uploadViolationPhotos(files) {
    return request({
      url: apiUrls.upload.violationPhotos,
      method: 'POST',
      data: files,
      timeout: 60000 // 文件上传需要较长时间
    });
  },
  
  // 上传证据文件
  uploadEvidenceFiles(files) {
    return request({
      url: apiUrls.upload.evidenceFiles,
      method: 'POST',
      data: files,
      timeout: 60000
    });
  }
};

// 违规检查专用API（连接 parking-demo 后端）
export const violationInspectionAPI = {
  // 获取待检查车辆列表
  getPendingVehicles(params = {}) {
    return request({
      url: apiUrls.violationInspection.getPendingVehicles,
      method: 'GET',
      data: params,
      timeout: 30000
    });
  },

  // 提交违规检查结果
  submitInspectionResult(data) {
    return request({
      url: apiUrls.violationInspection.submitInspectionResult,
      method: 'POST',
      data,
      timeout: 30000
    });
  },

  // 获取检查历史记录
  getInspectionHistory(params = {}) {
    return request({
      url: apiUrls.violationInspection.getInspectionHistory,
      method: 'GET',
      data: params,
      timeout: 30000
    });
  },

  // 获取车辆详细信息
  getVehicleDetails(plateNumber) {
    return request({
      url: apiUrls.violationInspection.getVehicleDetails,
      method: 'GET',
      data: { plateNumber },
      timeout: 30000
    });
  },

  // 批量处理违规记录
  batchProcessViolations(violationIds, action) {
    return request({
      url: apiUrls.violationInspection.batchProcessViolations,
      method: 'POST',
      data: { violationIds, action },
      timeout: 60000 // 批量操作可能需要更长时间
    });
  },

  // 导出违规报告
  exportViolationReport(params = {}) {
    return request({
      url: apiUrls.violationInspection.exportViolationReport,
      method: 'GET',
      data: params,
      timeout: 60000 // 报告生成可能需要较长时间
    });
  },

  // 获取实时停车数据
  getRealTimeParkingData(areaId = null) {
    return request({
      url: apiUrls.violationInspection.getRealTimeParkingData,
      method: 'GET',
      data: areaId ? { areaId } : {},
      timeout: 30000
    });
  },

  // 同步外部停车系统数据
  syncExternalParkingData(systemType = 'all') {
    return request({
      url: apiUrls.violationInspection.syncExternalParkingData,
      method: 'POST',
      data: { systemType },
      timeout: 120000, // 同步可能需要较长时间
      maxRetries: 1
    });
  }
};

// 车主API
export const ownerAPI = {
  // 根据车牌号查询车主信息
  getByPlate(plateNumber) {
    return request({
      url: apiUrls.owners.byPlate.replace('{plateNumber}', plateNumber),
      method: 'GET',
      timeout: 30000
    });
  },

  //  融合查询VIP月票和车主信息（东北林业大学专用）
  getMergedVipAndOwnerInfo(plateNumber, parkName = '东北林业大学') {
    return request({
      url: '/parking/acms/vip/merged-info',
      method: 'POST',
      data: {
        plateNumber,
        parkName
      },
      timeout: 30000
    });
  },

  //  查询车辆黑名单信息（ACMS系统）
  getBlacklistInfo(plateNumber, parkName = '东北林业大学') {
    return request({
      url: '/parking/acms/vip/blacklist-info',
      method: 'POST',
      data: {
        plateNumber,
        parkName
      },
      timeout: 30000
    });
  },

  // 车牌号搜索建议
  getPlateSuggestions(keyword, options = {}) {
    const params = {
      keyword,
      usercode: options.usercode || '',
      page: options.page || 1,
      size: options.size || 50,
      ...options
    };
    
    return request({
      url: apiUrls.owners.plateSuggestions,
      method: 'GET',
      data: params,
      timeout: 30000
    });
  },

  // 获取车主的车辆列表
  getOwnerVehicles(ownerId) {
    return request({
      url: apiUrls.owners.vehicles.replace('{ownerId}', ownerId),
      method: 'GET',
      timeout: 30000
    });
  },

  // 更新车主信用分
  updateCreditScore(ownerId, creditScore, reason) {
    return request({
      url: apiUrls.owners.creditScore.replace('{ownerId}', ownerId),
      method: 'PUT',
      data: { creditScore, reason },
      timeout: 30000
    });
  },

  // 获取车主信用分
  getCreditScore(ownerId) {
    return request({
      url: apiUrls.owners.creditScore.replace('{ownerId}', ownerId),
      method: 'GET',
      timeout: 30000
    });
  },

  // 搜索车主
  search(keyword) {
    return request({
      url: apiUrls.owners.search,
      method: 'GET',
      data: { keyword },
      timeout: 30000
    });
  },

  // 获取车主信息
  getInfo(id) {
    return request({
      url: apiUrls.owners.getInfo.replace('{id}', id),
      method: 'GET',
      timeout: 30000
    });
  }
};

// 预约API
export const appointmentAPI = {
  // 根据车牌号查询预约记录
  getAppointmentPlateNumber(plateNumber) {
    return request({
      url: apiUrls.appointments.getByPlateNumber.replace('{plateNumber}', plateNumber),
      method: 'GET',
      timeout: 30000
    });
  },

  // 获取预约列表
  getList(params = {}) {
    return request({
      url: apiUrls.appointments.list,
      method: 'GET',
      data: params,
      timeout: 30000
    });
  },

  // 创建预约
  create(data) {
    return request({
      url: apiUrls.appointments.create,
      method: 'POST',
      data,
      timeout: 30000
    });
  },

  // 更新预约
  update(id, data) {
    return request({
      url: apiUrls.appointments.update.replace('{id}', id),
      method: 'PUT',
      data,
      timeout: 30000
    });
  },

  // 删除预约
  delete(id) {
    return request({
      url: apiUrls.appointments.delete.replace('{id}', id),
      method: 'DELETE',
      timeout: 30000
    });
  }
};

// 数据统计分析API
export const statisticsAPI = {
  // 获取违规统计概览
  getViolationOverview(dateRange = {}) {
    return request({
      url: apiUrls.statistics.getViolationOverview,
      method: 'GET',
      data: dateRange,
      timeout: 30000
    });
  },

  // 按时间段统计
  getTimeBasedStats(params = {}) {
    return request({
      url: apiUrls.statistics.getTimeBasedStats,
      method: 'GET',
      data: params,
      timeout: 45000
    });
  },

  // 按区域统计
  getAreaBasedStats(params = {}) {
    return request({
      url: apiUrls.statistics.getAreaBasedStats,
      method: 'GET',
      data: params,
      timeout: 45000
    });
  },

  // 趋势分析
  getTrendAnalysis(params = {}) {
    return request({
      url: apiUrls.statistics.getTrendAnalysis,
      method: 'GET',
      data: params,
      timeout: 60000 // 趋势分析可能需要较长时间
    });
  },

  // 热点分析
  getHotSpotAnalysis(params = {}) {
    return request({
      url: apiUrls.statistics.getHotSpotAnalysis,
      method: 'GET',
      data: params,
      timeout: 60000
    });
  }
};

// 白名单管理API
export const whitelistAPI = {
  // 检查车牌是否在白名单中
  checkWhitelist(plateNumber, parkName) {
    return request({
      url: apiUrls.whitelist.check,
      method: 'GET',
      data: { plateNumber, parkName },
      timeout: 15000
    });
  },

  // 根据车牌查询白名单记录
  getByPlate(plateNumber, parkName) {
    return request({
      url: apiUrls.whitelist.byPlate,
      method: 'GET',
      data: { plateNumber, parkName },
      timeout: 15000
    });
  },

  // 获取白名单列表
  getList(params = {}) {
    return request({
      url: apiUrls.whitelist.list,
      method: 'GET',
      data: params,
      timeout: 30000
    });
  },

  // 创建白名单记录
  create(data) {
    return request({
      url: apiUrls.whitelist.create,
      method: 'POST',
      data,
      timeout: 30000
    });
  },

  // 更新白名单记录
  update(id, data) {
    return request({
      url: apiUrls.whitelist.update.replace('{id}', id),
      method: 'PUT',
      data,
      timeout: 30000
    });
  },

  // 删除白名单记录
  delete(id) {
    return request({
      url: apiUrls.whitelist.delete.replace('{id}', id),
      method: 'DELETE',
      timeout: 30000
    });
  }
};