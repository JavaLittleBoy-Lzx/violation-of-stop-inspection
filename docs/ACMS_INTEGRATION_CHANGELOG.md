# ACMS融合接口集成变更日志

## 📅 更新时间
2025年10月1日

## 🎯 更新目标
将违规记录页面的车主信息查询接口改为调用 ACMS 融合接口 `/parking/acms/vip/merged-info`

---

## 📝 修改内容

### 1. API 配置修改 (`config/api.js`)

在 `ownerAPI` 中新增融合查询方法：

```javascript
// 🆕 融合查询VIP月票和车主信息（东北林业大学专用）
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
}
```

**位置**: `violation-of-stop-inspection/config/api.js` 第 668-677 行

---

### 2. 页面导入修改 (`add-violation.vue`)

新增导入 `ownerAPI`：

```javascript
// 🆕 导入 ownerAPI 用于调用融合接口
import { ownerAPI } from '@/config/api.js';
```

**位置**: `violation-of-stop-inspection/pages/violation/add-violation.vue` 第 885 行

---

### 3. 车主信息查询逻辑修改 (`add-violation.vue`)

修改 `getOwnerInfo` 方法，优先使用融合接口：

**核心逻辑**：
1. **优先查询**：如果当前车场是"东北林业大学"，调用融合接口
2. **备用方案**：如果融合接口失败或非东北林业大学，使用原有接口

**返回数据映射**：
- `ownerName` → `name` (车主姓名)
- `ownerPhone` → `phone` (手机号)
- `ownerAddress` (customer_department) → `address` (车主地址/部门)
- `vipTypeName` → `ticketName` / `monthTicketName` (月票名称)
- `ownerCategory` (customer_address) → `ownerCategory` (车主类别)
- `customerCompany` → `customerCompany` (单位)
- `customerRoomNumber` → `customerRoomNumber` (房间号)

**位置**: `violation-of-stop-inspection/pages/violation/add-violation.vue` 第 2856-2931 行

---

## 🔍 功能说明

### 融合接口调用条件
只有满足以下条件时才会调用融合接口：
- 当前选择的车场为 **"东北林业大学"**
- 输入了完整的车牌号（7位或8位）

### 查询流程

```
用户输入车牌号
    ↓
检查车场是否为"东北林业大学"
    ↓ 是
调用融合接口 /parking/acms/vip/merged-info
    ↓ 成功
返回融合数据（VIP票 + 车主信息）
    ↓
显示在页面上

    ↓ 失败或非东北林业大学
调用备用接口（原有车主查询）
    ↓
返回原有数据
    ↓
显示在页面上
```

---

## 📊 返回数据示例

### 融合接口返回（东北林业大学）

```json
{
  "code": "0",
  "msg": "成功",
  "data": {
    "plateNumber": "黑A85SC1",
    "parkName": "东北林业大学",
    "vipTypeName": "创业车临时月票",
    "ownerName": "焦东旭",
    "ownerPhone": "18846165675",
    "ownerAddress": "化学化工与资源利用学院",
    "ownerCategory": "教职工",
    "customerCompany": "",
    "customerRoomNumber": "4020250042"
  }
}
```

### 页面显示信息

- **车主姓名**: 焦东旭
- **手机号**: 18846165675
- **地址**: 化学化工与资源利用学院
- **月票类型**: 创业车临时月票 🎫
- **车主类别**: 教职工
- **房间号**: 4020250042

---

## ✅ 测试要点

### 1. 东北林业大学车场测试
- ✅ 输入车牌 `黑A85SC1`
- ✅ 应该调用融合接口
- ✅ 显示完整的车主信息和月票信息

### 2. 其他车场测试
- ✅ 切换到非东北林业大学车场
- ✅ 应该调用备用接口（原有查询）
- ✅ 正常显示车主信息

### 3. 错误处理测试
- ✅ 融合接口失败时，自动降级到备用接口
- ✅ 无数据时显示 "未找到车主信息"
- ✅ 网络错误时显示友好提示

---

## 🔧 调试日志

在控制台可以看到以下日志：

```
🔍 [融合查询] 正在查询车主信息: 黑A85SC1
🏢 [融合查询] 当前车场: 东北林业大学
✅ [融合查询] 融合接口查询成功: {code: "0", msg: "成功", data: {...}}
```

如果融合接口失败：

```
⚠️ [融合查询] 融合接口调用失败，尝试备用接口: Error...
🔄 [备用查询] 使用原有接口查询
✅ [备用查询] 车主信息查询成功: {...}
```

---

## 📞 相关文档

- **融合接口API文档**: `parking-demo/ACMS_VIP_API_README.md`
- **融合接口使用示例**: `parking-demo/ACMS_MERGED_API_EXAMPLE.md`
- **后端控制器**: `parking-demo/src/main/java/com/parkingmanage/controller/AcmsVipController.java`

---

## 🚀 后续优化建议

1. **缓存机制**: 对查询结果进行短时间缓存，减少重复请求
2. **离线支持**: 在网络不可用时使用本地缓存数据
3. **数据同步**: 定期同步ACMS数据到本地数据库
4. **错误重试**: 失败时自动重试2-3次
5. **性能监控**: 记录融合接口的响应时间和成功率

---

## ⚠️ 注意事项

1. 融合接口**仅适用于东北林业大学车场**
2. 需要确保后端 `AcmsVipController` 已部署
3. 需要配置正确的 ACMS 系统连接参数
4. 建议在正式环境部署前进行充分测试

---

## 📌 版本信息

- **前端版本**: v1.2.0
- **后端版本**: v1.0.0
- **ACMS接口版本**: v1.0.0 