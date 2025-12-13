/**
 * 车场人员认证工具类
 * 专门用于违停巡检系统，调用后端认证接口
 */

// 后端API基础URL - 需要根据实际部署调整
let API_BASE_URL = 'https://www.xuerparking.cn:8543/api/auth';

class AuthUtils {
  
  /**
   * 检查响应是否为花生壳等待页面
   * @param {Object} response - 响应对象
   * @returns {boolean} 是否为花生壳页面
   */
  static isHskWaitingPage(response) {
    if (typeof response.data === 'string' && 
        response.data.includes('贝锐花生壳') && 
        response.data.includes('您即将访问')) {
      return true;
    }
    return false;
  }

  /**
   * 带重试的API请求（处理花生壳等待页面）
   * @param {Object} requestConfig - 请求配置
   * @param {number} maxRetries - 最大重试次数
   * @param {number} retryDelay - 重试延迟（毫秒）
   * @returns {Promise<Object>} 请求结果
   */
  static async requestWithRetry(requestConfig, maxRetries = 3, retryDelay = 12000) {
    for (let i = 0; i <= maxRetries; i++) {
      try {
        console.log(` [Auth] 发起请求 (第${i + 1}次/${maxRetries + 1}次):`, requestConfig.url);
        
        const response = await uni.request(requestConfig);
        
        // 检查是否为花生壳等待页面
        if (this.isHskWaitingPage(response)) {
          console.log('⏳ [Auth] 检测到花生壳等待页面，需要等待...');
          
          if (i < maxRetries) {
            console.log(`⏰ [Auth] 等待 ${retryDelay/1000} 秒后重试...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            continue;
          } else {
            throw new Error('花生壳服务响应超时，请稍后重试或联系管理员升级服务');
          }
        }
        
        // 正常响应，返回结果
        console.log('✅ [Auth] 获得有效响应');
        return response;
        
      } catch (error) {
        console.error(`❌ [Auth] 请求失败 (第${i + 1}次):`, error);
        
        if (i === maxRetries) {
          throw error;
        }
        
        // 网络错误也需要重试
        console.log(`⏰ [Auth] 网络错误，等待 ${retryDelay/1000} 秒后重试...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  /**
   * 用户登录
   * @param {Object} loginData - 登录数据
   * @param {string} loginData.username - 用户名
   * @param {string} loginData.password - 密码
   * @returns {Promise<Object>} 登录结果
   */
  static async login(loginData) {
    console.log(' [Auth] 开始用户登录流程');
    
    try {
      const { username, password } = loginData;
      
      if (!username || !password) {
        throw new Error('用户名和密码不能为空');
      }

      // 显示登录中提示
      uni.showLoading({
        title: '登录中，请稍候...',
        mask: true
      });
      
      // 使用重试机制调用后端登录接口
      const response = await this.requestWithRetry({
        url: `${API_BASE_URL}/login`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json'
        },
        data: {
          username: username.trim(),
          password: password.trim()
        },
        timeout: 30000 // 30秒超时
      });
      
      // 隐藏loading
      uni.hideLoading();
      
      console.log(' [Auth] 后端登录响应 - statusCode:', response.statusCode);
      console.log(' [Auth] 后端登录响应 - data:', JSON.stringify(response.data));
      
      // 检查HTTP状态码
      if (response.statusCode !== 200) {
        throw new Error(`网络请求失败，状态码: ${response.statusCode}`);
      }
      
      // 检查响应数据结构
      if (!response.data || !response.data.data) {
        throw new Error('服务器响应格式错误');
      }
      
      const result = response.data.data;
      console.log(' [Auth] 业务响应结果 - code:', result.code, 'msg:', result.msg);
      
      // 检查业务逻辑返回结果（后端使用code字段，"0"表示成功）
      if (result.code !== "0") {
        // 提取更友好的错误信息
        let errorMsg = result.msg || '登录失败';
        console.log('❌ [Auth] 登录失败原因:', errorMsg);
        throw new Error(errorMsg);
      }
      
      const { token, user } = result.data;
      
      if (!token || !user) {
        throw new Error('登录响应数据格式错误');
      }
      
      //  获取用户车场关联的短信模板信息
      let smsTemplates = [];
      try {
        console.log(' [Auth] 开始获取车场关联的短信模板信息...');
        
        // 从user对象中获取车场ID和车场名称
        const yardId = user.yardId;
        const parkName = user.parkName;
        
        let smsResponse = null;
        
        //  优先使用yardId查询，如果没有则使用parkName查询
        if (yardId) {
          console.log(' [Auth] 使用车场ID查询短信模板: yardId =', yardId);
          // 调用接口通过yardId获取短信模板
          smsResponse = await uni.request({
            url: `https://www.xuerparking.cn:8543/parking/yardInfo/${yardId}/sms-templates`,
            method: 'GET',
            header: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          });
        } else if (parkName) {
          console.log(' [Auth] 使用车场名称查询短信模板: parkName =', parkName);
          //  Fallback: 使用车场名称查询
          smsResponse = await uni.request({
            url: `https://www.xuerparking.cn:8543/parking/yardInfo/sms-templates/by-name?parkName=${encodeURIComponent(parkName)}`,
            method: 'GET',
            header: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          });
        } else {
          console.warn('⚠️ [Auth] 用户既没有车场ID也没有车场名称，无法获取短信模板');
        }
        
        // 处理响应
        if (smsResponse && smsResponse.statusCode === 200 && smsResponse.data && smsResponse.data.data) {
          smsTemplates = smsResponse.data.data;
          console.log('✅ [Auth] 获取短信模板成功:', smsTemplates.length, '个模板');
          console.log(' [Auth] 短信模板列表:', JSON.stringify(smsTemplates));
        } else {
          console.warn('⚠️ [Auth] 获取短信模板失败，使用默认配置');
        }
      } catch (error) {
        console.error('❌ [Auth] 获取短信模板异常:', error);
        // 不影响登录流程，继续执行
      }
      
      // 构建完整的用户信息对象
      const userData = {
        isLoggedIn: true,
        username: user.username,
        token: token,
        loginTime: new Date().getTime(),
        smsTemplates: smsTemplates, //  存储短信模板信息
        userInfo: {
          id: user.id,
          username: user.username,
          realName: user.realName,
          parkName: user.parkName,
          yardId: user.yardId, //  确保保存车场ID
          position: user.position,
          phone: user.phone,
          email: user.email,
          status: user.status,
          lastLoginTime: user.lastLoginTime
        }
      };
      
      // 保存用户信息到本地存储
      uni.setStorageSync('userInfo', userData);
      uni.setStorageSync('token', token);
      
      //  单独保存短信模板信息，方便其他页面使用
      uni.setStorageSync('smsTemplates', smsTemplates);
      
      console.log('✅ [Auth] 用户登录成功:', userData.username);
      
      // 不在这里显示Toast，让调用方显示个性化欢迎信息
      
      return {
        success: true,
        data: userData,
        message: '登录成功'
      };
      
    } catch (error) {
      console.error('❌ [Auth] 用户登录失败:', error);
      
      // 隐藏loading
      uni.hideLoading();
      
      // 使用 modal 显示错误信息（真机兼容性更好）
      uni.showModal({
        title: '登录失败',
        content: error.message || '登录失败，请重试',
        showCancel: false,
        confirmText: '我知道了'
      });
      
      return {
        success: false,
        error: error,
        message: error.message || '登录失败，请重试'
      };
    }
  }
  
  /**
   * 验证token有效性
   * @returns {Promise<boolean>} token是否有效
   */
  static async verifyToken() {
    console.log(' [Auth] 验证token有效性');
    
    try {
      const token = this.getToken();
      
      if (!token) {
        console.log('⚠️ [Auth] 本地token不存在');
        return false;
      }
      
      // 调用后端验证接口
      const response = await this.requestWithRetry({
        url: `${API_BASE_URL}/verify`,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }, 2, 8000); // 验证token用较少的重试次数
      
      if (response.statusCode !== 200) {
        console.log('❌ [Auth] token验证请求失败:', response.statusCode);
        return false;
      }
      const result = response.data.data;
      console.log(' [Auth] token验证结果:', result);
      if (result.code === "0" && result.data.valid) {
        console.log('✅ [Auth] token验证成功');
        
        // 更新本地用户信息
        if (result.data.user) {
          this.updateUserInfo({ userInfo: result.data.user });
        }
        
        return true;
      } else {
        console.log('❌ [Auth] token验证失败:', result.msg);
        return false;
      }
      
    } catch (error) {
      console.error('❌ [Auth] token验证异常:', error);
      return false;
    }
  }
  
  /**
   * 获取当前用户信息（从后端）
   * @returns {Promise<Object|null>} 用户信息
   */
  static async getCurrentUserFromServer() {
    console.log(' [Auth] 从服务器获取用户信息');
    
    try {
      const token = this.getToken();
      
      if (!token) {
        return null;
      }
      
      const response = await this.requestWithRetry({
        url: `${API_BASE_URL}/userInfo`,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }, 2, 8000); // 获取用户信息用较少的重试次数
      
      if (response.statusCode === 200 && response.data.code === "0") {
        const userInfo = response.data.data;
        console.log('✅ [Auth] 从服务器获取用户信息成功');
        
        // 更新本地存储
        this.updateUserInfo({ userInfo });
        
        return userInfo;
      } else {
        console.log('❌ [Auth] 从服务器获取用户信息失败');
        return null;
      }
      
    } catch (error) {
      console.error('❌ [Auth] 获取用户信息异常:', error);
      return null;
    }
  }
  
  /**
   * 用户登出
   */
  static async logout() {
    console.log(' [Auth] 用户登出');
    
    try {
      const token = this.getToken();
      
      // 如果有token，调用后端登出接口
      if (token) {
        try {
          await uni.request({
            url: `${API_BASE_URL}/logout`,
            method: 'POST',
            header: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          console.log('✅ [Auth] 后端登出成功');
        } catch (error) {
          console.warn('⚠️ [Auth] 后端登出失败，继续清除本地信息:', error);
        }
      }
      
      // 清除本地用户信息
      uni.removeStorageSync('userInfo');
      uni.removeStorageSync('token');
      
      // 跳转到登录页
      uni.reLaunch({
        url: '/pages/simple/login'
      });
      
      console.log('✅ [Auth] 登出完成');
      
    } catch (error) {
      console.error('❌ [Auth] 登出失败:', error);
    }
  }
  
  /**
   * 刷新token
   * @returns {Promise<boolean>} 刷新是否成功
   */
  static async refreshToken() {
    console.log(' [Auth] 刷新token');
    
    try {
      const token = this.getToken();
      
      if (!token) {
        console.log('⚠️ [Auth] 无token可刷新');
        return false;
      }
      
      const response = await this.requestWithRetry({
        url: `${API_BASE_URL}/refresh`,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }, 2, 8000); // 刷新token用较少的重试次数
      
      if (response.statusCode === 200 && response.data.code === "0") {
        const { token: newToken, user } = response.data.data;
        
        // 更新本地存储
        uni.setStorageSync('token', newToken);
        if (user) {
          this.updateUserInfo({ userInfo: user });
        }
        
        console.log('✅ [Auth] token刷新成功');
        return true;
        
      } else {
        console.log('❌ [Auth] token刷新失败:', response.data.msg);
        return false;
      }
      
    } catch (error) {
      console.error('❌ [Auth] token刷新异常:', error);
      return false;
    }
  }
  
  /**
   * 检查用户是否已登录（本地检查）
   * @returns {boolean} 是否已登录
   */
  static isLoggedIn() {
    const userInfo = uni.getStorageSync('userInfo');
    const token = uni.getStorageSync('token');
    const isLoggedIn = !!(userInfo && userInfo.isLoggedIn && token);
    
    console.log(' [Auth] 检查本地登录状态:', isLoggedIn);
    return isLoggedIn;
  }
  
  /**
   * 获取当前用户信息（本地）
   * @returns {Object|null} 用户信息
   */
  static getCurrentUser() {
    const userInfo = uni.getStorageSync('userInfo');
    return userInfo || null;
  }
  
  /**
   * 获取当前用户token
   * @returns {string|null} 用户token
   */
  static getToken() {
    return uni.getStorageSync('token') || null;
  }
  
  /**
   * 检查登录有效性（包含本地和服务器验证）
   * @returns {Promise<boolean>} 登录是否有效
   */
  static async isLoginValid() {
    const userInfo = this.getCurrentUser();
    const token = this.getToken();
    
    if (!userInfo || !userInfo.isLoggedIn || !token) {
      return false;
    }
    
    // 检查本地登录时间（7天过期）
    const loginTime = userInfo.loginTime;
    const now = new Date().getTime();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    
    if (loginTime && (now - loginTime > sevenDays)) {
      console.warn('⚠️ [Auth] 本地登录已过期');
      return false;
    }
    
    // 验证服务器端token有效性
    return await this.verifyToken();
  }
  
  /**
   * 强制重新登录
   * @param {string} reason - 重新登录原因
   */
  static forceReLogin(reason = '需要重新验证身份') {
    console.log(' [Auth] 强制重新登录:', reason);
    
    uni.showModal({
      title: '重新登录',
      content: reason,
      showCancel: false,
      confirmText: '确定',
      success: () => {
        this.logout();
      }
    });
  }
  
  /**
   * 更新用户信息
   * @param {Object} updateData - 更新的数据
   */
  static updateUserInfo(updateData) {
    const currentUser = this.getCurrentUser();
    
    if (!currentUser) {
      console.warn('⚠️ [Auth] 用户未登录，无法更新信息');
      return false;
    }
    
    const updatedUser = {
      ...currentUser,
      ...updateData,
      userInfo: {
        ...currentUser.userInfo,
        ...updateData.userInfo
      }
    };
    
    uni.setStorageSync('userInfo', updatedUser);
    console.log('✅ [Auth] 用户信息更新成功');
    
    return true;
  }
  
  /**
   * 初始化应用认证状态
   */
  static async initializeAuth() {
    console.log(' [Auth] 初始化认证状态');
    
    try {
      const userInfo = this.getCurrentUser();
      
      if (userInfo && userInfo.isLoggedIn) {
        // 检查登录有效性（包含服务器验证）
        const isValid = await this.isLoginValid();
        
        if (!isValid) {
          console.warn('⚠️ [Auth] 登录已失效，需要重新登录');
          await this.logout();
          return false;
        }
        
        console.log('✅ [Auth] 认证状态初始化成功:', userInfo.username);
        return true;
        
      } else {
        console.log(' [Auth] 用户未登录');
        return false;
      }
      
    } catch (error) {
      console.error('❌ [Auth] 认证状态初始化失败:', error);
      return false;
    }
  }
  
  /**
   * 检查用户名是否存在
   * @param {string} username - 用户名
   * @returns {Promise<Object>} 检查结果
   */
  static async checkUsername(username) {
    console.log(' [Auth] 检查用户名是否存在:', username);
    
    try {
      const response = await uni.request({
        url: `${API_BASE_URL}/check-username`,
        method: 'GET',
        data: { username }
      });
      
      if (response.statusCode === 200 && response.data.code === "0") {
        return response.data.data;
      } else {
        throw new Error(response.data.msg || '检查用户名失败');
      }
      
    } catch (error) {
      console.error('❌ [Auth] 检查用户名异常:', error);
      return { exists: false, available: true };
    }
  }
  
  /**
   * 设置API基础URL（用于不同环境配置）
   * @param {string} baseUrl - API基础URL
   */
  static setApiBaseUrl(baseUrl) {
    API_BASE_URL = baseUrl;
    console.log(' [Auth] API基础URL已更新:', API_BASE_URL);
  }
  
  /**
   * 调试认证状态
   */
  static debugAuthState() {
    const userInfo = this.getCurrentUser();
    const token = this.getToken();
    const isLoggedIn = this.isLoggedIn();
    
    console.log(' [Auth Debug] 认证状态调试:', {
      userInfo,
      token: token ? '已设置' : '未设置',
      isLoggedIn,
      apiBaseUrl: API_BASE_URL
    });
  }
  
  /**
   * 获取短信模板配置
   * @param {string} templateType - 模板类型（如：'blacklist'、'warning'、'violation'）
   * @returns {Object|null} 短信模板信息
   */
  static getSmsTemplate(templateType) {
    try {
      const smsTemplatesData = uni.getStorageSync('smsTemplates');
      
      // 处理可能的数据结构：可能是直接的数组，也可能是包含data字段的对象
      const smsTemplates = Array.isArray(smsTemplatesData) 
        ? smsTemplatesData 
        : (smsTemplatesData?.data || []);
      
      if (!smsTemplates || smsTemplates.length === 0) {
        console.warn('⚠️ [Auth] 未找到短信模板配置');
        return null;
      }
      
      // 如果指定了模板类型，根据类型查找
      if (templateType) {
        // 根据templateType映射到templateUsage字段
        // templateUsage: 1-违规提醒，2-停车超时，3-其他
        let templateUsage = null;
        if (templateType === 'violation' || templateType === 'blacklist' || templateType === 'warning') {
          templateUsage = 1; // 违规提醒类
        } else if (templateType === 'timeout') {
          templateUsage = 2; // 停车超时类
        }
        
        const template = smsTemplates.find(t => t.templateType === templateUsage);
        if (template) {
          console.log('✅ [Auth] 找到匹配的短信模板:', template.templateName);
          return template;
        }
      }
      
      // 如果没有找到匹配的，或者没有指定类型，返回第一个（默认）模板
      console.log('ℹ️ [Auth] 使用默认短信模板:', smsTemplates[0].templateName);
      return smsTemplates[0];
      
    } catch (error) {
      console.error('❌ [Auth] 获取短信模板异常:', error);
      return null;
    }
  }
  
  /**
   * 获取所有短信模板
   * @returns {Array} 短信模板列表
   */
  static getAllSmsTemplates() {
    try {
      const smsTemplatesData = uni.getStorageSync('smsTemplates');
      
      // 处理可能的数据结构：可能是直接的数组，也可能是包含data字段的对象
      const smsTemplates = Array.isArray(smsTemplatesData) 
        ? smsTemplatesData 
        : (smsTemplatesData?.data || []);
      
      return smsTemplates;
    } catch (error) {
      console.error('❌ [Auth] 获取短信模板列表异常:', error);
      return [];
    }
  }
}

export default AuthUtils; 