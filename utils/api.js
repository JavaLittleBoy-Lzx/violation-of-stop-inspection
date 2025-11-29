// API配置文件
const config = {
	// 开发环境
	development: {
		baseUrl: 'http://localhost:8543'
	},
	// 生产环境  
	production: {
		baseUrl: 'https://your-production-domain.com'
	}
};

// 当前环境配置
const env = 'development'; // 可以根据实际情况动态设置
const currentConfig = config[env];

// API接口地址
export const API = {
	// 基础地址
	BASE_URL: currentConfig.baseUrl,
	
	// 认证相关接口
	AUTH: {
		LOGIN: '/api/auth/login',                    // 登录
		LOGOUT: '/api/auth/logout',                  // 登出
		VERIFY: '/api/auth/verify',                  // 验证token
		REFRESH: '/api/auth/refresh',                // 刷新token
		USER_INFO: '/api/auth/userinfo',             // 获取用户信息
		CHECK_USERNAME: '/api/auth/check-username'   // 检查用户名
	}
};

// 请求封装函数
export const request = (options) => {
	return new Promise((resolve, reject) => {
		// 获取token
		const token = uni.getStorageSync('token');
		const tokenType = uni.getStorageSync('tokenType') || 'Bearer';
		
		// 默认headers
		const headers = {
			'Content-Type': 'application/json'
		};
		
		// 如果有token，添加Authorization header
		if (token) {
			headers['Authorization'] = `${tokenType} ${token}`;
		}
		
		// 完整的请求配置
		const requestConfig = {
			url: API.BASE_URL + options.url,
			method: options.method || 'GET',
			header: { ...headers, ...options.header },
			data: options.data,
			timeout: options.timeout || 30000,
			success: (res) => {
				console.log('API响应:', res);
				
				// 处理401未授权
				if (res.statusCode === 401) {
					// 清除本地存储的认证信息
					uni.removeStorageSync('token');
					uni.removeStorageSync('tokenType');
					uni.removeStorageSync('userInfo');
					uni.removeStorageSync('refreshToken');
					
					// 跳转到登录页
					uni.redirectTo({
						url: '/pages/simple/login'
					});
					
					reject(new Error('未授权，请重新登录'));
					return;
				}
				
				// 处理其他HTTP错误
				if (res.statusCode >= 400) {
					reject(new Error(`请求失败: ${res.statusCode}`));
					return;
				}
				
				resolve(res);
			},
			fail: (err) => {
				console.error('API请求失败:', err);
				reject(err);
			}
		};
		
		uni.request(requestConfig);
	});
};

// 具体的API方法
export const authApi = {
	// 登录
	login: (data) => {
		return request({
			url: API.AUTH.LOGIN,
			method: 'POST',
			data
		});
	},
	
	// 登出
	logout: () => {
		return request({
			url: API.AUTH.LOGOUT,
			method: 'POST'
		});
	},
	
	// 验证token
	verify: () => {
		return request({
			url: API.AUTH.VERIFY,
			method: 'GET'
		});
	},
	
	// 刷新token
	refresh: () => {
		return request({
			url: API.AUTH.REFRESH,
			method: 'POST'
		});
	},
	
	// 获取用户信息
	getUserInfo: () => {
		return request({
			url: API.AUTH.USER_INFO,
			method: 'GET'
		});
	},
	
	// 检查用户名是否存在
	checkUsername: (username) => {
		return request({
			url: API.AUTH.CHECK_USERNAME,
			method: 'GET',
			data: { username }
		});
	}
};

export default {
	API,
	request,
	authApi
}; 