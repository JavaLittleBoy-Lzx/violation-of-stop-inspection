# 违规提醒数据库设计

## 表结构设计

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

## API接口设计

### 1. 查询违规提醒记录
- **接口**: `GET /parking/violationReminders`
- **参数**: 
  - `plateNumber`: 车牌号
  - `isProcessed`: 是否已处理
  - `page`: 页码
  - `size`: 每页大小

### 2. 创建违规提醒记录
- **接口**: `POST /parking/violationReminders`
- **参数**: 违规提醒数据对象

### 3. 更新违规提醒处理状态
- **接口**: `PUT /parking/violationReminders/{id}/process`
- **参数**: 
  - `isProcessed`: 是否已处理
  - `processedBy`: 处理人

### 4. 检查是否需要发送违规提醒
- **接口**: `GET /parking/violationReminders/check-reminder`
- **参数**: 
  - `plateNumber`: 车牌号
- **返回**: 是否需要发送提醒的判断结果

## 业务逻辑

1. **第一次违规**: 发送违规提醒短信，存储到违规提醒表，标记为未处理
2. **第二次违规**: 标记之前的提醒为已处理，发送违规短信（原有逻辑）
3. **后续违规**: 继续发送违规短信（原有逻辑）

## 短信模板

- **违规提醒模板**: `SMS_496865506`
- **违规短信模板**: `SMS_496020098` (保持原有)
