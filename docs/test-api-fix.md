# API接口修复说明

## 修复内容

### 1. 车主信息查询接口路径修复

**问题**: 
- 原接口路径: `/parking/owners/by-plate/{plateNumber}`
- 实际后端接口: `/parking/violations/owners/by-plate/{plateNumber}`

**修复**:
- 修改 `config/api.js` 中 `owners.byPlate` 路径
- 从 `/parking/owners/by-plate/{plateNumber}` 
- 改为 `/parking/violations/owners/by-plate/{plateNumber}`

### 2. 添加缺失的车牌搜索建议接口

**问题**: 
- API配置中缺少 `owners.plateSuggestions` 接口

**修复**:
- 添加 `plateSuggestions: '/parking/violations/owners/plate-suggestions'`
- 在 `ownerAPI` 中添加 `getPlateSuggestions` 方法

### 3. 违规记录查询接口修复

**问题**: 
- 原接口路径: `/parking/violations/by-plate/{plateNumber}`
- 实际后端接口: `/parking/violations` (通过plateNumber参数过滤)

**修复**:
- 修改 `violations.byPlate` 路径为 `/parking/violations`
- 修改调用方式，将plateNumber作为查询参数传递

### 4. 添加其他车主相关接口

**新增接口**:
- `owners.vehicles`: 获取车主车辆列表
- `owners.creditScore`: 车主信用分管理

## 修复后的接口配置

```javascript
// 车主相关
owners: {
  byPlate: '/parking/violations/owners/by-plate/{plateNumber}',
  plateSuggestions: '/parking/violations/owners/plate-suggestions',
  vehicles: '/parking/violations/owners/{ownerId}/vehicles',
  creditScore: '/parking/violations/owners/{ownerId}/credit-score',
  search: '/parking/owners/search',
  getInfo: '/parking/owners/{id}'
},

// 违规记录相关
violations: {
  list: '/parking/violations',
  create: '/parking/violations',
  updateStatus: '/parking/violations/{id}/status',
  statistics: '/parking/violations/statistics',
  highRiskVehicles: '/parking/violations/high-risk-vehicles',
  byOwner: '/parking/violations/by-owner/{ownerId}',
  byPlate: '/parking/violations', // 通过plateNumber参数过滤
  userRecords: '/parking/violations/user-records'
}
```

## 验证方法

1. 在add-violation.vue页面输入车牌号
2. 检查车主信息是否正确显示
3. 检查车牌搜索建议是否正常工作
4. 检查违规记录查询是否正常

## 对应的后端接口

根据 `ViolationsController.java`:

1. **车主信息查询**: `@GetMapping("/owners/by-plate/{plateNumber}")`
2. **车牌搜索建议**: `@GetMapping("/owners/plate-suggestions")`
3. **违规记录查询**: `@GetMapping` (主查询接口，支持plateNumber参数)

修复完成后，前端应该能够正确调用后端接口获取车主信息和违规记录。 