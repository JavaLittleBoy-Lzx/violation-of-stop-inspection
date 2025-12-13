# 车牌号查询月票车主信息API修复说明

## 问题分析

原来的 `/parking/violations/owners/by-plate/{plateNumber}` 接口只查询了 `ownerinfo` 表，但实际上违规记录中有 `month_ticket_id` 字段，可以关联到 `month_tick` 表来获取月票车主信息。

## 修复方案

### 1. 后端修复

修改 `getOwnerByPlateNumber` 方法，使其只查询 `month_tick` 表（月票车主）：

- **month_tick表** (月票车主) - 通过 `car_no` 字段匹配车牌号

### 2. 查询逻辑

直接查询 `month_tick` 表，匹配条件：
- 使用 `FIND_IN_SET` 函数在 `car_no` 字段中查找车牌号
- 只查询 `valid_status = '有效'` 的月票记录
- 按创建时间倒序排列，取最新的记录

### 3. 修改的文件

#### ViolationsMapper.java
```java
/**
 * 🆕 根据车牌号查询月票车主信息
 * @param plateNumber 车牌号
 * @return 月票车主信息
 */
Map<String, Object> selectOwnerByPlateNumber(@Param("plateNumber") String plateNumber);
```

#### ViolationsMapper.xml
简化SQL查询，只查询月票表：
```xml
<select id="selectOwnerByPlateNumber" resultType="map">
    SELECT 
        -- 月票车主基本信息
        mt.user_name as ownerName,
        mt.user_phone as ownerPhone,
        CONCAT(mt.park_name, '停车场月票车主') as ownerAddress,
        mt.id as ownerId,
        'monthly' as ownerType,
        -- 月票详细信息
        mt.ticket_name as monthTicketName,
        mt.park_name as parkName,
        mt.valid_status as monthTicketStatus,
        mt.car_no as registeredPlates,
        mt.created_at as registrationDate,
        #{plateNumber} as plateNumber
    FROM month_tick mt 
    WHERE FIND_IN_SET(#{plateNumber}, REPLACE(mt.car_no, ' ', '')) > 0 
        AND mt.valid_status = '有效'
    ORDER BY mt.created_at DESC
    LIMIT 1
</select>
```

#### ViolationsServiceImpl.java
修改 `getOwnerByPlateNumber` 方法：
```java
@Override
public Map<String, Object> getOwnerByPlateNumber(String plateNumber) {
    log.info("🔍 [查询月票车主信息] 车牌号: {}", plateNumber);
    
    try {
        // 🆕 只查询月票车主信息
        Map<String, Object> result = violationsMapper.selectOwnerByPlateNumber(plateNumber);
        
        if (result != null) {
            log.info("✅ [找到月票车主] 车牌: {}, 车主: {}, 月票: {}", 
                    plateNumber, result.get("ownerName"), result.get("monthTicketName"));
            
            // 处理手机号脱敏、设置兼容性字段等
            // ...
            
            return result;
        }
        
        log.warn("⚠️ [未找到月票车主] 车牌号: {}", plateNumber);
        return null;
        
    } catch (Exception e) {
        log.error("❌ [查询月票车主异常] 车牌号: {}, 错误: {}", plateNumber, e.getMessage(), e);
        return null;
    }
}
```

## 修复后的效果

1. **月票车主**: 能够显示month_tick表中的月票车主信息
2. **月票详情**: 返回月票名称、停车场名称、有效状态等信息
3. **业主类型**: 固定返回 `ownerType = 'monthly'`
4. **注册车牌**: 返回该月票登记的所有车牌号
5. **注册时间**: 返回月票创建时间

## 返回字段说明

- `ownerName`: 月票车主姓名 (来自 `user_name`)
- `ownerPhone`: 月票车主手机号 (来自 `user_phone`，已脱敏)
- `ownerAddress`: 停车场信息 (格式："{停车场名称}停车场月票车主")
- `ownerId`: 月票记录ID
- `ownerType`: 固定为 "monthly"
- `monthTicketName`: 月票名称
- `parkName`: 停车场名称
- `monthTicketStatus`: 月票状态
- `registeredPlates`: 注册的车牌号列表
- `registrationDate`: 注册时间

## 验证方法

1. 输入有效月票车主的车牌号 - 应显示月票车主姓名和月票信息
2. 输入无效或不存在的车牌号 - 应返回空结果
3. 检查返回的 `ownerType` 字段是否为 "monthly"
4. 验证月票详细信息是否正确显示

修复完成后，违规登记页面应该能够正确显示月票车辆的车主信息。 