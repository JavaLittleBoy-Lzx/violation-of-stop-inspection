# 违规提醒功能使用说明

## 功能概述

违规提醒功能实现了智能的违规短信发送机制：
- **第一次违规**：发送违规提醒短信（模板：SMS_496865506），存储到违规提醒数据库
- **第二次违规**：标记之前的提醒为已处理，发送违规短信（模板：SMS_496020098）
- **后续违规**：继续发送违规短信

## 数据库设计

### violation_reminders 表

```sql
CREATE TABLE violation_reminders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    plate_number VARCHAR(20) NOT NULL COMMENT '车牌号',
    owner_name VARCHAR(100) COMMENT '车主姓名',
    owner_phone VARCHAR(20) COMMENT '车主电话',
    violation_type VARCHAR(100) NOT NULL COMMENT '违规类型',
    violation_location VARCHAR(200) COMMENT '违规地点',
    violation_time DATETIME NOT NULL COMMENT '违规时间',
    reminder_time DATETIME NOT NULL COMMENT '提醒发送时间',
    reminder_template_code VARCHAR(50) NOT NULL COMMENT '提醒模板代码',
    reminder_content TEXT COMMENT '提醒内容',
    is_processed TINYINT(1) DEFAULT 0 COMMENT '是否已处理(0:未处理,1:已处理)',
    processed_time DATETIME COMMENT '处理时间',
    processed_by VARCHAR(100) COMMENT '处理人',
    park_code VARCHAR(50) COMMENT '车场编码',
    park_name VARCHAR(100) COMMENT '车场名称',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_plate_number (plate_number),
    INDEX idx_is_processed (is_processed),
    INDEX idx_reminder_time (reminder_time),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='违规提醒记录表';
```

## API接口

### 违规提醒API (`/api/violation-reminder-api.js`)

#### 主要方法：

1. **getUnprocessedRemindersByPlate(plateNumber)**
   - 查询指定车牌的未处理违规提醒
   - 用于判断是否为第一次违规

2. **createViolationReminder(reminderData)**
   - 创建违规提醒记录
   - 在第一次违规时调用

3. **markAllRemindersAsProcessed(plateNumber, processedBy)**
   - 标记所有未处理的提醒为已处理
   - 在第二次违规时调用

4. **sendViolationReminderSms(phoneNumber, templateData)**
   - 发送违规提醒短信
   - 使用模板：SMS_496865506

5. **sendViolationSms(phoneNumber, templateData)**
   - 发送违规短信
   - 使用模板：SMS_496020098

## 前端实现

### 1. add-violation.vue（小程序端）

#### 修改内容：
- 导入违规提醒API
- 修改短信发送逻辑，添加违规提醒检查
- 新增 `sendViolationReminderSms` 方法
- 新增 `markRemindersAsProcessed` 方法

#### 工作流程：
1. 违规记录提交成功后
2. 检查是否有车主电话信息
3. 查询是否有未处理的违规提醒
4. 如果没有未处理提醒（第一次违规）：
   - 发送违规提醒短信
   - 创建违规提醒记录
5. 如果有未处理提醒（第二次及以后违规）：
   - 标记之前的提醒为已处理
   - 发送违规短信

### 2. IllegalRegiste.vue（管理端）

#### 修改内容：
- 导入违规提醒API
- 在单条处理确认方法中添加违规提醒逻辑
- 在批量处理确认方法中添加违规提醒逻辑

#### 工作流程：
1. 处理违规记录成功后
2. 获取车主信息
3. 检查是否有未处理的违规提醒
4. 根据检查结果发送相应的短信

## 短信模板

### 违规提醒模板（SMS_496865506）
```
您的车辆${license_plate_number}在${year}年${month}月${day}日${time}于${code}发生违规行为，请及时处理。
```

### 违规短信模板（SMS_496020098）
```
您的车辆${license_plate_number}在${year}年${month}月${day}日${time}于${code}发生违规行为，请及时处理。
```

## 使用说明

### 1. 数据库准备
- 执行上述SQL语句创建 `violation_reminders` 表
- 确保短信模板已在阿里云短信服务中配置

### 2. 后端API实现
需要在后端实现以下接口：
- `GET /parking/violationReminders` - 查询违规提醒记录
- `POST /parking/violationReminders` - 创建违规提醒记录
- `PUT /parking/violationReminders/{id}/process` - 更新处理状态
- `GET /parking/violationReminders/check-reminder` - 检查是否需要发送提醒
- `PUT /parking/violationReminders/mark-all-processed` - 批量标记为已处理

### 3. 前端配置
- 确保 `violation-reminder-api.js` 文件已正确导入
- 检查短信发送接口地址是否正确
- 验证短信模板代码是否匹配

## 测试验证

### 测试步骤：
1. **第一次违规测试**：
   - 使用新车牌号添加违规记录
   - 验证是否发送违规提醒短信
   - 检查数据库中是否创建提醒记录

2. **第二次违规测试**：
   - 使用同一车牌号再次添加违规记录
   - 验证是否发送违规短信
   - 检查之前的提醒记录是否标记为已处理

3. **批量处理测试**：
   - 在管理端批量处理违规记录
   - 验证每个车牌的处理逻辑是否正确

## 注意事项

1. **短信发送失败处理**：
   - 短信发送失败不会影响违规记录的正常提交
   - 会在控制台记录错误信息

2. **数据库事务**：
   - 建议在后端实现中使用数据库事务
   - 确保违规记录和提醒记录的一致性

3. **性能优化**：
   - 批量处理时使用循环处理每个车牌
   - 单个车牌处理失败不会影响其他车牌

4. **日志记录**：
   - 所有操作都有详细的控制台日志
   - 便于问题排查和调试

## 故障排除

### 常见问题：

1. **短信发送失败**：
   - 检查短信模板代码是否正确
   - 验证手机号格式是否正确
   - 确认阿里云短信服务配置

2. **数据库连接失败**：
   - 检查数据库连接配置
   - 确认表结构是否正确创建

3. **API接口调用失败**：
   - 检查接口地址是否正确
   - 验证请求参数格式
   - 查看网络连接状态

## 更新日志

- **v1.0.0** (2024-01-XX)
  - 初始版本发布
  - 实现基本的违规提醒功能
  - 支持小程序端和管理端
