// 违规配置管理API接口封装
import { request } from '@/config/api.js';

// 自定义参数序列化函数（兼容小程序环境）
const serializeParams = (params) => {
    const pairs = [];
    Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
            pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
        }
    });
    return pairs.join('&');
};

// 通用请求方法
const apiRequest = async (url, options = {}) => {
    try {
        console.log('🔧 [违规配置API] 开始处理API请求');
        console.log('🔧 [违规配置API] 原始URL:', url);
        console.log('🔧 [违规配置API] 请求选项:', options);
        
        // 对于GET请求，将参数添加到URL中
        let requestUrl = url;
        let requestData = options.body || {};

        if (options.method === 'GET' && requestData && Object.keys(requestData).length > 0) {
            const queryString = serializeParams(requestData);
            requestUrl = `${url}?${queryString}`;
            console.log('🔧 [违规配置API] GET请求 - 最终URL:', requestUrl);
            requestData = {}; // GET请求不需要body
        }

        const result = await request({
            url: requestUrl,
            method: options.method || 'GET',
            data: requestData,
            timeout: 30000,
            maxRetries: 2
        });

        // 检查响应格式
        if (result && typeof result === 'object') {
            if (result.code !== undefined) {
                const successCodes = [200, 0, '200', '0'];
                if (!successCodes.includes(result.code)) {
                    throw new Error(result.message || result.msg || '请求失败');
                }
                return result.data || result;
            }
            return result;
        }

        return result;
    } catch (error) {
        console.error('违规配置API请求失败:', error);
        throw error;
    }
};

// 违规位置配置API
export const violationLocationApi = {
    // 获取启用的违规位置列表（供下拉选择）
    getEnabledLocations(parkName) {
        console.log('📍 [获取启用位置] 车场:', parkName);
        return apiRequest('/parking/violation-config/locations/enabled', {
            method: 'GET',
            body: { parkName }
        });
    },

    // 获取所有违规位置列表（管理页面使用）
    getAllLocations(params = {}) {
        return apiRequest('/parking/violation-config/locations/list', {
            method: 'GET',
            body: {
                page: params.page || 1,
                size: params.size || 20,
                parkName: params.parkName || '',
                locationName: params.locationName || '',
                status: params.status
            }
        });
    },

    // 创建违规位置
    createLocation(locationData) {
        return apiRequest('/parking/violation-config/locations/create', {
            method: 'POST',
            body: locationData
        });
    },

    // 更新违规位置
    updateLocation(id, locationData) {
        return apiRequest('/parking/violation-config/locations/update', {
            method: 'PUT',
            body: { id, ...locationData }
        });
    },

    // 删除违规位置
    deleteLocation(id) {
        return apiRequest('/parking/violation-config/locations/delete', {
            method: 'DELETE',
            body: { id }
        });
    },

    // 批量启用/禁用
    batchUpdateStatus(ids, status) {
        return apiRequest('/parking/violation-config/locations/batch-status', {
            method: 'PUT',
            body: { ids, status }
        });
    }
};

// 违规类型配置API
export const violationTypeApi = {
    // 获取启用的违规类型列表（供下拉选择）
    getEnabledTypes(parkName) {
        console.log('🏷️ [获取启用类型] 车场:', parkName);
        return apiRequest('/parking/violation-config/types/enabled', {
            method: 'GET',
            body: { parkName }
        });
    },

    // 获取所有违规类型列表（管理页面使用）
    getAllTypes(params = {}) {
        return apiRequest('/parking/violation-config/types/list', {
            method: 'GET',
            body: {
                page: params.page || 1,
                size: params.size || 20,
                parkName: params.parkName || '',
                typeName: params.typeName || '',
                typeCode: params.typeCode || '',
                status: params.status
            }
        });
    },

    // 创建违规类型
    createType(typeData) {
        return apiRequest('/parking/violation-config/types/create', {
            method: 'POST',
            body: typeData
        });
    },

    // 更新违规类型
    updateType(id, typeData) {
        return apiRequest('/parking/violation-config/types/update', {
            method: 'PUT',
            body: { id, ...typeData }
        });
    },

    // 删除违规类型
    deleteType(id) {
        return apiRequest('/parking/violation-config/types/delete', {
            method: 'DELETE',
            body: { id }
        });
    },

    // 批量启用/禁用
    batchUpdateStatus(ids, status) {
        return apiRequest('/parking/violation-config/types/batch-status', {
            method: 'PUT',
            body: { ids, status }
        });
    }
};

// 违规描述配置API
export const violationDescriptionApi = {
    // 获取启用的违规描述列表（供下拉选择，支持按类型过滤）
    getEnabledDescriptions(violationTypeCode, parkName) {
        console.log('📝 [获取启用描述] 类型:', violationTypeCode, '车场:', parkName);
        return apiRequest('/parking/violation-config/descriptions/enabled', {
            method: 'GET',
            body: { violationTypeCode, parkName }
        });
    },

    // 获取所有违规描述列表（管理页面使用）
    getAllDescriptions(params = {}) {
        return apiRequest('/parking/violation-config/descriptions/list', {
            method: 'GET',
            body: {
                page: params.page || 1,
                size: params.size || 20,
                parkName: params.parkName || '',
                violationTypeCode: params.violationTypeCode || '',
                descriptionText: params.descriptionText || '',
                status: params.status
            }
        });
    },

    // 创建违规描述
    createDescription(descriptionData) {
        return apiRequest('/parking/violation-config/descriptions/create', {
            method: 'POST',
            body: descriptionData
        });
    },

    // 更新违规描述
    updateDescription(id, descriptionData) {
        return apiRequest('/parking/violation-config/descriptions/update', {
            method: 'PUT',
            body: { id, ...descriptionData }
        });
    },

    // 删除违规描述
    deleteDescription(id) {
        return apiRequest('/parking/violation-config/descriptions/delete', {
            method: 'DELETE',
            body: { id }
        });
    },

    // 批量启用/禁用
    batchUpdateStatus(ids, status) {
        return apiRequest('/parking/violation-config/descriptions/batch-status', {
            method: 'PUT',
            body: { ids, status }
        });
    }
};

// 拉黑原因配置API
export const blacklistReasonApi = {
    // 获取启用的拉黑原因列表（供下拉选择）
    getEnabledReasons(reasonCategory, parkName) {
        console.log('🚫 [获取启用原因] 分类:', reasonCategory, '车场:', parkName);
        return apiRequest('/parking/violation-config/reasons/enabled', {
            method: 'GET',
            body: { reasonCategory, parkName }
        });
    },

    // 获取所有拉黑原因列表（管理页面使用）
    getAllReasons(params = {}) {
        return apiRequest('/parking/violation-config/reasons/list', {
            method: 'GET',
            body: {
                page: params.page || 1,
                size: params.size || 20,
                parkName: params.parkName || '',
                reasonCategory: params.reasonCategory || '',
                reasonText: params.reasonText || '',
                status: params.status
            }
        });
    },

    // 创建拉黑原因
    createReason(reasonData) {
        return apiRequest('/parking/violation-config/reasons/create', {
            method: 'POST',
            body: reasonData
        });
    },

    // 更新拉黑原因
    updateReason(id, reasonData) {
        return apiRequest('/parking/violation-config/reasons/update', {
            method: 'PUT',
            body: { id, ...reasonData }
        });
    },

    // 删除拉黑原因
    deleteReason(id) {
        return apiRequest('/parking/violation-config/reasons/delete', {
            method: 'DELETE',
            body: { id }
        });
    },

    // 批量启用/禁用
    batchUpdateStatus(ids, status) {
        return apiRequest('/parking/violation-config/reasons/batch-status', {
            method: 'PUT',
            body: { ids, status }
        });
    }
};

// 工具函数
export const violationConfigUtils = {
    // 格式化位置选项（供picker使用）
    formatLocationOptions(locations) {
        if (!Array.isArray(locations)) return [];
        return locations.map(item => ({
            value: item.locationName,
            label: item.locationName,
            longitude: item.longitude,
            latitude: item.latitude,
            addressDetail: item.addressDetail,
            id: item.id
        }));
    },

    // 格式化类型选项（供picker使用）
    formatTypeOptions(types) {
        if (!Array.isArray(types)) return [];
        return types.map(item => ({
            value: item.typeCode,
            label: item.typeName,
            name: item.typeName, // 兼容旧版本
            icon: item.icon || '⚠️', // 使用后端图标或默认图标
            description: item.description,
            severityLevel: item.severityLevel,
            id: item.id
        }));
    },

    // 格式化描述选项（供picker使用）
    formatDescriptionOptions(descriptions) {
        if (!Array.isArray(descriptions)) return [];
        return descriptions.map(item => ({
            value: item.descriptionText,
            label: item.descriptionText,
            id: item.id
        }));
    },

    // 格式化原因选项（供picker使用）
    formatReasonOptions(reasons) {
        if (!Array.isArray(reasons)) return [];
        return reasons.map(item => ({
            value: item.reasonText,
            label: item.reasonText,
            id: item.id
        }));
    },

    // 处理API错误
    handleApiError(error, defaultMessage = '操作失败') {
        console.error('违规配置API错误:', error);
        
        if (typeof uni !== 'undefined') {
            uni.showToast({
                title: error.message || defaultMessage,
                icon: 'none',
                duration: 2000
            });
        }
        
        return error;
    }
};

