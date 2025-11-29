# add-violation.vue 修改指南

## 修改目标

1. **违规位置**：支持下拉选择、手动输入、定位填充三种方式
2. **违规类型**：从后台配置动态加载（已有违规类型表）
3. **违规描述**：从后台配置动态加载
4. **拉黑原因**：从后台配置动态加载

## 具体修改步骤

### 第1步：在 `<script>` 中添加API导入

在文件开头的 `import` 部分添加：

```javascript
// 在已有的import后面添加
import { getEnabledLocations, getEnabledTypes, getEnabledDescriptions, getEnabledReasons } from '@/api/violationConfig'
```

### 第2步：在 `data()` 中添加下拉选项数据

找到 `data()` 函数，在其中添加：

```javascript
data() {
    return {
        // ... 现有的 data 属性 ...
        
        // 🆕 违规配置选项
        locationOptions: [],        // 违规位置选项列表
        typeOptions: [],           // 违规类型选项列表
        descriptionOptions: [],    // 违规描述选项列表
        reasonOptions: [],         // 拉黑原因选项列表
        
        // 🆕 输入方式控制
        locationInputMode: 'select', // 位置输入方式：'select'-下拉选择, 'manual'-手动输入, 'location'-定位填充
        
        // ... 其余 data 属性 ...
    }
}
```

### 第3步：添加初始化方法

在 `methods` 中添加配置加载方法：

```javascript
methods: {
    // ... 现有的 methods ...
    
    // 🆕 加载违规位置选项
    async loadLocationOptions() {
        try {
            const res = await getEnabledLocations(this.selectedParkingLot);
            if (res.code === '0' && res.data) {
                this.locationOptions = res.data.map(item => ({
                    value: item.locationName,
                    label: item.locationName,
                    longitude: item.longitude,
                    latitude: item.latitude,
                    addressDetail: item.addressDetail
                }));
            }
        } catch (error) {
            console.error('加载违规位置失败:', error);
        }
    },
    
    // 🆕 加载违规类型选项
    async loadTypeOptions() {
        try {
            const res = await getEnabledTypes(this.selectedParkingLot);
            if (res.code === '0' && res.data) {
                this.typeOptions = res.data.map(item => ({
                    value: item.typeCode,
                    label: item.typeName,
                    description: item.description,
                    severityLevel: item.severityLevel
                }));
            }
        } catch (error) {
            console.error('加载违规类型失败:', error);
        }
    },
    
    // 🆕 加载违规描述选项
    async loadDescriptionOptions(violationTypeCode) {
        try {
            const res = await getEnabledDescriptions(violationTypeCode, this.selectedParkingLot);
            if (res.code === '0' && res.data) {
                this.descriptionOptions = res.data.map(item => ({
                    value: item.descriptionText,
                    label: item.descriptionText
                }));
            }
        } catch (error) {
            console.error('加载违规描述失败:', error);
        }
    },
    
    // 🆕 加载拉黑原因选项
    async loadReasonOptions() {
        try {
            const res = await getEnabledReasons('violation', this.selectedParkingLot);
            if (res.code === '0' && res.data) {
                this.reasonOptions = res.data.map(item => ({
                    value: item.reasonText,
                    label: item.reasonText
                }));
            }
        } catch (error) {
            console.error('加载拉黑原因失败:', error);
        }
    },
    
    // 🆕 切换位置输入方式
    switchLocationInputMode(mode) {
        this.locationInputMode = mode;
        if (mode === 'location') {
            // 如果切换到定位模式，立即执行定位
            this.getCurrentLocation();
        }
    },
    
    // ... 其余 methods ...
}
```

### 第4步：在 `onLoad` 或 `mounted` 中调用初始化

```javascript
onLoad(options) {
    // ... 现有的 onLoad 代码 ...
    
    // 🆕 加载配置选项
    this.loadLocationOptions();
    this.loadTypeOptions();
    this.loadReasonOptions();
}
```

### 第5步：修改模板 - 违规位置区域

将现有的违规位置区域（460-484行）替换为：

```vue
<!-- 违规位置区域 -->
<view class="section-card">
    <view class="section-header">
        <view class="header-icon">
            <text class="icon-emoji">📍</text>
        </view>
        <text class="section-title">违规位置</text>
    </view>
    
    <!-- 🆕 输入方式切换 -->
    <view class="input-mode-tabs">
        <view 
            class="mode-tab" 
            :class="{ active: locationInputMode === 'select' }"
            @click="switchLocationInputMode('select')">
            <text>下拉选择</text>
        </view>
        <view 
            class="mode-tab" 
            :class="{ active: locationInputMode === 'manual' }"
            @click="switchLocationInputMode('manual')">
            <text>手动输入</text>
        </view>
        <view 
            class="mode-tab" 
            :class="{ active: locationInputMode === 'location' }"
            @click="switchLocationInputMode('location')">
            <text>定位填充</text>
        </view>
    </view>
    
    <!-- 🆕 根据输入方式显示不同的输入控件 -->
    <view class="location-input-group">
        <!-- 下拉选择模式 -->
        <view v-if="locationInputMode === 'select'" class="location-select-wrapper">
            <picker 
                mode="selector" 
                :range="locationOptions" 
                range-key="label"
                @change="onLocationChange">
                <view class="uni-input">
                    {{ formData.location || '请选择违规位置' }}
                </view>
            </picker>
        </view>
        
        <!-- 手动输入模式 -->
        <view v-else-if="locationInputMode === 'manual'" class="location-row">
            <view class="location-wrapper">
                <input 
                    class="location-input" 
                    v-model="formData.location" 
                    placeholder="请输入具体违规位置"
                    @focus="locationFocused = true" 
                    @blur="locationFocused = false" />
                <view class="clear-location-btn" v-if="formData.location" @click="clearLocation">
                    <u-icon name="close-circle-fill" size="22" color="#c8c9cc"></u-icon>
                </view>
            </view>
        </view>
        
        <!-- 定位填充模式 -->
        <view v-else class="location-row">
            <view class="location-wrapper">
                <input 
                    class="location-input" 
                    v-model="formData.location" 
                    placeholder="点击右侧按钮进行定位"
                    disabled />
                <view class="clear-location-btn" v-if="formData.location" @click="clearLocation">
                    <u-icon name="close-circle-fill" size="22" color="#c8c9cc"></u-icon>
                </view>
            </view>
            <view class="location-btn" @click="getCurrentLocation">
                <u-icon name="map-fill" size="18" color="#ffffff"></u-icon>
                <text class="location-btn-text">定位</text>
            </view>
        </view>
    </view>
</view>
```

### 第6步：添加位置选择事件处理

在 `methods` 中添加：

```javascript
// 🆕 位置选择变化
onLocationChange(e) {
    const index = e.detail.value;
    const selected = this.locationOptions[index];
    if (selected) {
        this.formData.location = selected.label;
        // 如果有经纬度信息，也可以保存
        if (selected.longitude && selected.latitude) {
            console.log('选中位置经纬度:', selected.longitude, selected.latitude);
        }
    }
},
```

### 第7步：添加样式

在 `<style>` 中添加：

```scss
/* 🆕 输入方式切换标签页 */
.input-mode-tabs {
    display: flex;
    margin-bottom: 20rpx;
    background: #f8f9fa;
    border-radius: 10rpx;
    padding: 8rpx;
}

.mode-tab {
    flex: 1;
    text-align: center;
    padding: 16rpx 0;
    border-radius: 6rpx;
    font-size: 28rpx;
    color: #666;
    transition: all 0.3s;
}

.mode-tab.active {
    background: #2979ff;
    color: #ffffff;
    font-weight: 600;
}

.location-select-wrapper {
    padding: 20rpx 0;
}

.location-select-wrapper .uni-input {
    padding: 24rpx 32rpx;
    background: #f8f9fa;
    border-radius: 12rpx;
    border: 2rpx solid #e8eaed;
    font-size: 30rpx;
    color: #333;
}
```

### 第8步：违规类型、描述、拉黑原因的修改

**找到违规类型输入的位置**，添加下拉选择功能（类似违规位置的修改方式）。

**注意事项：**
- 违规类型和描述通常在表单的其他区域
- 拉黑原因在拉黑配置区域
- 需要在用户选择违规类型后，动态加载对应的违规描述选项
- 在用户切换车场时，需要重新加载所有选项

### 第9步：联动逻辑

```javascript
// 监听违规类型变化，加载对应的违规描述
watch: {
    'formData.violationType': function(newVal) {
        if (newVal) {
            this.loadDescriptionOptions(newVal);
        }
    },
    'selectedParkingLot': function(newVal) {
        // 车场切换时重新加载所有选项
        this.loadLocationOptions();
        this.loadTypeOptions();
        this.loadReasonOptions();
    }
}
```

## API接口文件路径

确保创建 API 文件：`violation-of-stop-inspection/api/violationConfig.js`

```javascript
import request from '@/utils/request'

const BASE_URL = '/violation-config'

export function getEnabledLocations(parkName) {
    return request({
        url: `${BASE_URL}/locations/enabled`,
        method: 'get',
        params: { parkName }
    })
}

export function getEnabledTypes(parkName) {
    return request({
        url: `${BASE_URL}/types/enabled`,
        method: 'get',
        params: { parkName }
    })
}

export function getEnabledDescriptions(violationTypeCode, parkName) {
    return request({
        url: `${BASE_URL}/descriptions/enabled`,
        method: 'get',
        params: { violationTypeCode, parkName }
    })
}

export function getEnabledReasons(reasonCategory, parkName) {
    return request({
        url: `${BASE_URL}/reasons/enabled`,
        method: 'get',
        params: { reasonCategory, parkName }
    })
}
```

## 测试检查清单

- [ ] 违规位置支持下拉选择
- [ ] 违规位置支持手动输入
- [ ] 违规位置支持定位填充
- [ ] 三种输入方式可以自由切换
- [ ] 违规类型从后台配置加载
- [ ] 违规描述根据类型动态加载
- [ ] 拉黑原因从后台配置加载
- [ ] 车场切换时重新加载选项
- [ ] 所有下拉选项正常显示

## 注意事项

1. **兼容性**：保留现有的手动输入和定位功能，不影响已有的使用方式
2. **默认值**：建议默认使用下拉选择模式，提高输入效率
3. **权限**：定位功能需要用户授权位置权限
4. **网络**：下拉选项依赖网络请求，需要处理加载失败的情况
5. **缓存**：可以考虑缓存配置选项，减少重复请求

## 扩展建议

1. 添加位置搜索功能（模糊匹配）
2. 记录用户常用位置（使用频率排序）
3. 支持添加自定义位置（临时使用）
4. 违规描述支持自定义编辑
5. 拉黑原因支持模板快速填充

