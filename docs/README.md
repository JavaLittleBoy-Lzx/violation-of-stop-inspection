# 违停巡检小程序

## 项目说明

这是一个基于 uni-app 开发的违停巡检小程序，配合后端 Spring Boot 服务实现用户认证和违停数据管理。

## 后端接口对接

### 后端服务配置
- **服务地址**: `http://localhost:8543`
- **认证接口基路径**: `/api/auth`

### 登录接口详情
- **接口地址**: `POST /api/auth/login`
- **请求格式**:
```json
{
  "username": "用户名",
  "password": "密码",
  "rememberMe": false
}
```
- **响应格式**:
```json
{
  "code": "0",
  "msg": "成功",
  "data": {
    "token": "JWT令牌",
    "tokenType": "Bearer",
    "expiresIn": 86400,
    "user": {
      "id": 1,
      "username": "admin",
      "realName": "管理员",
      "parkName": "测试停车场",
      "position": "巡检员",
      "phone": "13800138000",
      "email": "admin@example.com",
      "status": 1
    },
    "refreshToken": "刷新令牌"
  }
}
```

### 其他认证接口
- `POST /api/auth/logout` - 登出
- `GET /api/auth/verify` - 验证token
- `POST /api/auth/refresh` - 刷新token
- `GET /api/auth/userinfo` - 获取用户信息
- `GET /api/auth/check-username` - 检查用户名

## 前端实现

### 文件结构
```
pages/
├── simple/
│   └── login.vue          # 登录页面
└── violation/
    ├── add-violation.vue  # 违停举报页面（登录后的主页面）
    ├── list.vue           # 记录查询页面
    ├── map.vue            # 巡检地图页面
    └── statistics.vue     # 数据统计页面

utils/
└── api.js                 # API配置和请求封装
```

### 登录流程
1. 用户在登录页面输入用户名和密码
2. 前端调用 `/api/auth/login` 接口
3. 后端验证用户名和密码
4. 登录成功后返回JWT token和用户信息
5. 前端保存token到本地存储
6. 跳转到违停举报页面

### Token管理
- 登录成功后将token保存到本地存储
- 每次API请求自动在Header中添加Authorization
- 401错误时自动清除本地存储并跳转登录页
- 支持token刷新机制

## 测试说明

### 创建测试用户

在后端数据库中创建测试用户，SQL示例：
```sql
INSERT INTO park_staff (username, password, real_name, park_name, position, phone, email, status, create_time)
VALUES 
('admin', 'password123', '张三', '测试停车场', '巡检员', '13800138000', 'admin@test.com', 1, NOW()),
('inspector1', 'password123', '李四', '测试停车场', '高级巡检员', '13800138001', 'inspector1@test.com', 1, NOW()),
('inspector2', 'password123', '王五', '测试停车场', '巡检员', '13800138002', 'inspector2@test.com', 1, NOW());
```

### 测试步骤
1. 启动后端服务 (端口: 8543)
2. 在小程序开发工具中运行前端项目
3. 使用测试账号登录:
   - 用户名: `admin`
   - 密码: `password123`
4. 验证登录成功后跳转到违停举报页面
5. 测试登出功能

### 环境配置

开发环境下，确保：
- 后端服务正常运行在 `http://localhost:8543`
- 数据库连接正常
- 测试用户已创建

生产环境下，需要修改 `utils/api.js` 中的生产环境配置：
```javascript
production: {
  baseUrl: 'https://your-production-domain.com'
}
```

## 注意事项

1. **密码验证**: 当前后端使用简化的密码验证，生产环境建议使用BCrypt等安全加密方式
2. **HTTPS**: 生产环境建议使用HTTPS传输
3. **错误处理**: 已实现基础的错误处理，可根据实际需求完善
4. **用户体验**: 已添加loading状态和错误提示，提升用户体验

## 开发计划

- [x] 用户认证功能
- [x] 违停举报页面（作为登录后的入口页面）
- [ ] 违停举报功能完善
- [ ] 记录查询功能  
- [ ] 巡检地图功能
- [ ] 数据统计功能 