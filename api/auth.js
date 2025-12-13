/**
 * 认证相关API接口
 */
import { http } from '@/util/request/index.js'

/**
 * 账号密码登录
 * @param {Object} params - 登录参数
 * @param {string} params.username - 用户名/手机号
 * @param {string} params.password - 密码
 * @returns {Promise} 接口响应
 */
export const login = (params) => {
  return http({
    url: '/parking/auth/login',
    method: 'POST',
    data: params
  })
}

/**
 * 获取用户信息
 * @param {string} token - 用户token
 * @returns {Promise} 接口响应
 */
export const getUserInfo = (token) => {
  return http({
    url: '/parking/auth/userInfo',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
}

/**
 * 登出
 * @returns {Promise} 接口响应
 */
export const logout = () => {
  return http({
    url: '/parking/auth/logout',
    method: 'POST'
  })
} 