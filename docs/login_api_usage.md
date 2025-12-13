# 登录API使用说明

## 概述

系统已从复杂的角色判定体系改为简单的用户名密码登录，车场人员数据由后端统一管理，前端只需要处理登录认证。

## 数据库结构

### 车场人员表（park_staff）
- `id`: 主键ID
- `username`: 用户名（登录用）
- `password`: 密码（加密存储）
- `park_name`: 车场名称
- `real_name`: 真实姓名
- `position`: 职位（管理员、巡逻员、收费员等）
- `status`: 状态（1=正常，0=禁用）

## API使用示例

### 1. 用户登录

```javascript
import { authAPI } from '@/config/api.js';

// 登录
async function login(username, password) {
  try {
    const response = await authAPI.login(username, password);
    
    // 登录成功，保存用户信息和token
    uni.setStorageSync('token', response.token);
    uni.setStorageSync('userInfo', {
      id: response.user.id,
      username: response.user.username,
      realName: response.user.real_name,
      parkName: response.user.park_name,
      position: response.user.position
    });
    
    console.log('登录成功:', response.user);
    return response;
  } catch (error) {
    console.error('登录失败:', error);
    throw error;
  }
}
```

### 2. 检查登录状态

```javascript
// 检查token有效性
async function checkLoginStatus() {
  try {
    const response = await authAPI.checkToken();
    return response.valid;
  } catch (error) {
    console.error('Token验证失败:', error);
    return false;
  }
}
```

### 3. 退出登录

```javascript
// 退出登录
async function logout() {
  try {
    await authAPI.logout();
    
    // 清除本地存储
    uni.removeStorageSync('token');
    uni.removeStorageSync('userInfo');
    
    console.log('退出登录成功');
  } catch (error) {
    console.error('退出登录失败:', error);
  }
}
```



## 登录页面示例

```vue
<template>
  <view class="login-container">
    <view class="login-form">
      <input 
        v-model="username" 
        placeholder="请输入用户名" 
        class="input-field"
      />
      <input 
        v-model="password" 
        placeholder="请输入密码" 
        password 
        class="input-field"
      />
      <button @click="handleLogin" class="login-btn">登录</button>
    </view>
  </view>
</template>

<script>
import { authAPI } from '@/config/api.js';

export default {
  data() {
    return {
      username: '',
      password: ''
    };
  },
  methods: {
    async handleLogin() {
      if (!this.username || !this.password) {
        uni.showToast({
          title: '请输入用户名和密码',
          icon: 'none'
        });
        return;
      }
      
      try {
        uni.showLoading({ title: '登录中...' });
        
        const response = await authAPI.login(this.username, this.password);
        
        // 保存登录信息
        uni.setStorageSync('token', response.token);
        uni.setStorageSync('userInfo', {
          id: response.user.id,
          username: response.user.username,
          realName: response.user.real_name,
          parkName: response.user.park_name,
          position: response.user.position
        });
        
        uni.hideLoading();
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        });
        
        // 跳转到主页
        uni.switchTab({
          url: '/pages/index/index'
        });
        
      } catch (error) {
        uni.hideLoading();
        uni.showToast({
          title: error.message || '登录失败',
          icon: 'none'
        });
      }
    }
  }
};
</script>
```

## 权限控制

系统会自动在请求头中添加以下信息：
- `Authorization`: Bearer token
- `User-Id`: 用户ID
- `User-Name-Encoded`: 编码后的用户名
- `Park-Name-Encoded`: 编码后的车场名称

后端可以通过这些请求头信息进行权限验证和数据过滤。

## 注意事项

1. 密码在数据库中使用bcrypt加密存储
2. 默认账户：用户名 `admin`，密码 `password123`
3. 登录成功后会获得JWT token，token会自动添加到后续请求中
4. 系统支持多车场管理，可以根据车场名称过滤数据
5. 车场人员管理功能在后端或其他管理系统中完成，此系统只负责认证
6. 保留了原有的巡逻员相关接口，用于向后兼容 