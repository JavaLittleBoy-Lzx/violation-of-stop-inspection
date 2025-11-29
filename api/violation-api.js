// 违规管理API接口封装
import { request, apiUrls, appointmentAPI, ownerAPI } from '@/config/api.js';

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

// 通用请求方法（使用统一的API配置）
const apiRequest = async (url, options = {}) => {
    try {
        console.log('🔧 [apiRequest] 开始处理API请求');
        console.log('🔧 [apiRequest] 原始URL:', url);
        console.log('🔧 [apiRequest] 请求选项:', options);
        
        // 对于GET请求，将参数添加到URL中
        let requestUrl = url;
        let requestData = options.body || {};

        console.log('🔧 [apiRequest] 请求方法:', options.method || 'GET');
        console.log('🔧 [apiRequest] 原始请求数据:', requestData);

        if (options.method === 'GET' && requestData && Object.keys(requestData).length > 0) {
            const queryString = serializeParams(requestData);
            requestUrl = `${url}?${queryString}`;
            console.log('🔧 [apiRequest] GET请求 - 序列化后的查询字符串:', queryString);
            console.log('🔧 [apiRequest] GET请求 - 最终URL:', requestUrl);
            requestData = {}; // GET请求不需要body
            console.log('🔧 [apiRequest] GET请求 - 清空请求体，参数已移至URL');
        } else if (options.method !== 'GET') {
            console.log('🔧 [apiRequest] 非GET请求 - 保持请求体数据:', requestData);
        }

        console.log('🔧 [apiRequest] 最终请求URL:', requestUrl);
        console.log('🔧 [apiRequest] 最终请求数据:', requestData);

        const result = await request({
            url: requestUrl,
            method: options.method || 'GET',
            data: requestData,
            timeout: 30000,
            maxRetries: 2
        });

        // 检查响应格式
        if (result && typeof result === 'object') {
            // 如果有code字段，检查是否成功
            if (result.code !== undefined) {
                // 检查成功状态码：200, 0, 或者字符串 "200"
                const successCodes = [200, 0, '200', '0'];
                if (!successCodes.includes(result.code)) {
                    throw new Error(result.message || result.msg || '请求失败');
                }
                return result.data || result;
            }
            // 如果没有code字段，直接返回数据
            return result;
        }

        return result;
    } catch (error) {
        console.error('违规API请求失败:', error);
        throw error;
    }
};

// 车主相关API
export const ownerApi = {
    // 根据车牌号查询车主信息
    getOwnerByPlate(plateNumber) {
        return ownerAPI.getByPlate(plateNumber);
    },

    // 车牌号搜索建议
    getPlateSuggestions(keyword, options = {}) {
        const params = {
            keyword,
            page: options.page || 1,
            size: options.size || 50, // 增加每页记录数到50条
            ...options
        };
        
        return apiRequest(apiUrls.owners.plateSuggestions, {
            method: 'GET',
            body: params
        });
    },

    // 获取车主的车辆列表
    getOwnerVehicles(ownerId) {
        return apiRequest(apiUrls.owners.vehicles.replace('{ownerId}', ownerId));
    },

    // 更新车主信用分
    updateCreditScore(ownerId, creditScore, reason) {
        return apiRequest(apiUrls.owners.creditScore.replace('{ownerId}', ownerId), {
            method: 'PUT',
            body: { creditScore, reason }
        });
    },

    // 获取车主信用分
    getCreditScore(ownerId) {
        return apiRequest(apiUrls.owners.creditScore.replace('{ownerId}', ownerId));
    }
};

// 违规记录相关API
export const violationApi = {
    // 🆕 智能搜索月票车辆
    searchMonthTicketVehicles(params = {}) {
        console.log('🔍 [智能搜索] 开始调用searchMonthTicketVehicles');
        console.log('🔍 [智能搜索] 输入参数:', params);
        
        const requestParams = {
            keyword: params.keyword || '',
            parkName: params.parkName || '',
            onlyInPark: params.onlyInPark !== undefined ? params.onlyInPark : false,
            page: params.page || 1,
            size: params.size || 20,
            ...params
        };
        
        console.log('🔍 [智能搜索] 处理后的请求参数:', requestParams);
        console.log('🔍 [智能搜索] 目标API接口:', apiUrls.monthTicket.smartSearch);
        console.log('🔍 [智能搜索] 重点检查 - size参数:', requestParams.size);
        
        return apiRequest(apiUrls.monthTicket.smartSearch, {
            method: 'GET',
            body: requestParams
        });
    },

    // 🆕 获取车辆详细信息
    getVehicleDetails(plateNumber) {
        return apiRequest(apiUrls.monthTicket.getVehicleDetails, {
            method: 'GET',
            body: { plateNumber }
        });
    },

    // 🆕 获取车牌号建议列表（月票车辆）
    getMonthTicketPlateSuggestions(keyword, parkName = '', limit = 10) {
        return apiRequest(apiUrls.monthTicket.getPlateSuggestions, {
            method: 'GET',
            body: { keyword, parkName, limit }
        });
    },

    // 🆕 检查车辆是否在场
    checkVehicleInPark(plateNumber, parkCode = '') {
        return apiRequest(apiUrls.monthTicket.checkVehicleInPark, {
            method: 'GET',
            body: { plateNumber, parkCode }
        });
    },

    // 🆕 获取车辆统计信息
    getVehicleStats(plateNumber) {
        return apiRequest(apiUrls.monthTicket.getVehicleStats, {
            method: 'GET',
            body: { plateNumber }
        });
    },

    // 🆕 直接查询month_tick表数据（替代外部API）
    searchLocalData(params = {}) {
        console.log('🔍 [本地数据搜索] 开始调用searchLocalData');
        console.log('🔍 [本地数据搜索] 输入参数:', JSON.stringify(params, null, 2));
        
        const requestParams = {
            keyword: params.keyword || '',
            parkName: params.parkName || '',
            page: params.page || 1,
            size: params.size || 20,  // 🔧 注意：这里会优先使用传入的size参数
            ...params
        };
        
        console.log('🔍 [本地数据搜索] 处理后的请求参数:', JSON.stringify(requestParams, null, 2));
        console.log('🔍 [本地数据搜索] 目标API接口:', apiUrls.monthTicket.searchLocalData);
        console.log('🔍 [本地数据搜索] 特别关注 - size参数值:', requestParams.size);
        console.log('🔍 [本地数据搜索] 特别关注 - keyword参数值:', requestParams.keyword);
        console.log('🔍 [本地数据搜索] 特别关注 - parkName参数值:', requestParams.parkName);
        
        const apiCall = apiRequest(apiUrls.monthTicket.searchLocalData, {
            method: 'GET',
            body: requestParams
        });
        
        // 🔧 增强调试：监听API响应
        apiCall.then(response => {
            console.log('✅ [本地数据搜索] API响应成功');
            console.log('✅ [本地数据搜索] 响应数据结构:', JSON.stringify(response, null, 2));
            if (response && response.data && response.data.records) {
                console.log(`✅ [本地数据搜索] 返回记录数: ${response.data.records.length}`);
                console.log('✅ [本地数据搜索] 第一条记录:', JSON.stringify(response.data.records[0], null, 2));
                if (response.data.total !== undefined) {
                    console.log(`✅ [本地数据搜索] 总记录数: ${response.data.total}`);
                }
            } else {
                console.log('⚠️ [本地数据搜索] 响应数据格式异常');
            }
        }).catch(error => {
            console.error('❌ [本地数据搜索] API调用失败:', error);
        });
        
        return apiCall;
    },

    // 🆕 检查车场数据是否已存在于month_tick表
    checkParkDataExists(parkName) {
        console.log('🔍 [检查车场数据] 检查车场:', parkName);
        
        return apiRequest(apiUrls.monthTicket.checkParkDataExists, {
            method: 'GET',
            body: { parkName }
        });
    },

    // 🆕 批量导入车场的月票车数据到month_tick表
    batchImportParkData(parkName) {
        console.log('📥 [批量导入] 开始导入车场数据:', parkName);
        
        return apiRequest(apiUrls.monthTicket.batchImportParkData, {
            method: 'POST',
            body: { parkName }
        });
    },

    // 🆕 获取本地车牌号建议列表（从month_tick表）
    getLocalPlateSuggestions(keyword, parkName = '', limit = 10) {
        console.log('🔍 [本地车牌建议] 搜索关键词:', keyword, '车场:', parkName);
        
        return apiRequest(apiUrls.monthTicket.getLocalPlateSuggestions, {
            method: 'GET',
            body: { keyword, parkName, limit }
        });
    },

    // 🆕 查询车辆是否在场（外部接口）
    getParkOnSiteCarByCarNo(plateNumber, startTime, endTime, parkCodeList = '') {
        console.log('🔍 [在场查询] 车牌号:', plateNumber, '开始时间:', startTime, '结束时间:', endTime);
        console.log('🔍 [在场查询] 车场编码列表:', parkCodeList);
        
        return apiRequest(apiUrls.monthTicket.getParkOnSiteCarByCarNo, {
            method: 'GET',
            body: { 
                carNo: plateNumber,  // 后端接口参数名是carNo
                enterTimeFrom: startTime, 
                enterTimeTo: endTime,
                parkCodeList: parkCodeList || '', // 使用传入的车场编码列表
                pageNum: '1',     // 页码，默认第1页
                pageSize: '100'   // 每页大小，默认100条
            }
        });
    },

    // 创建违规记录
    async createViolation(violationData) {
        console.log('🚗 [创建违规记录] 开始处理:', violationData);
        
        try {
            // 🔧 Step 1: 获取当前用户信息，确定所在小区
            const userInfo = uni.getStorageSync('userInfo');
            let communityName = '';
            let parkCode = '';
            
            console.log('👤 [用户信息] 完整数据:', userInfo);
            
            // 🔧 多种方式尝试获取小区名称
            if (violationData.parkName) {
                // 方式1: 从提交数据中直接获取（优先级最高）
                communityName = violationData.parkName;
                console.log('🏘️ [小区信息] 来源：提交数据，小区:', communityName);
            } else if (userInfo && userInfo.patrolData) {
                // 方式2: 巡逻员身份 - 尝试多个可能的字段
                communityName = userInfo.patrolData.community || 
                              userInfo.patrolData.parkName || 
                              userInfo.patrolData.communityName ||
                              userInfo.patrolData.yardName || 
                              userInfo.patrolData.managerInfo?.community || '';
                console.log('👤 [巡逻员] 所在小区:', communityName);
                console.log('👤 [巡逻员] 完整数据:', userInfo.patrolData);
            } else if (userInfo && userInfo.userInfo) {
                // 方式3: 管家身份 - 尝试多个可能的字段
                communityName = userInfo.userInfo.community || 
                              userInfo.userInfo.parkName || 
                              userInfo.userInfo.communityName ||
                              userInfo.userInfo.yardName || '';
                console.log('👤 [管家] 所在小区:', communityName);
                console.log('👤 [管家] 完整数据:', userInfo.userInfo);
            } else if (userInfo) {
                // 方式4: 直接从用户信息根级别获取
                communityName = userInfo.community || 
                              userInfo.parkName || 
                              userInfo.communityName ||
                              userInfo.yardName || '';
                console.log('👤 [根级别] 所在小区:', communityName);
            }
            
            // 🔧 特殊处理：如果还是没有找到，尝试从根级别的yardName获取
            if (!communityName && userInfo && userInfo.yardName) {
                communityName = userInfo.yardName;
                console.log('👤 [根级别yardName] 所在小区:', communityName);
            }
            
            // 🔧 Step 2: 如果有小区名称，获取对应的车场编码
            if (communityName) {
                console.log('🏘️ [获取车场编码] 查询小区:', communityName);
                
                try {
                    const yardCodeResponse = await apiRequest('/parking/yardInfo/yardCode', {
                        method: 'GET',
                        body: { yardName: communityName }
                    });
                    
                    console.log('🏘️ [获取车场编码] API响应:', yardCodeResponse);
                    
                    if (yardCodeResponse && Array.isArray(yardCodeResponse) && yardCodeResponse.length > 0) {
                        parkCode = yardCodeResponse[0];
                        console.log('✅ [获取车场编码] 成功获取:', parkCode);
                    } else if (yardCodeResponse && yardCodeResponse.data && Array.isArray(yardCodeResponse.data)) {
                        parkCode = yardCodeResponse.data[0];
                        console.log('✅ [获取车场编码] 从data字段获取:', parkCode);
                    } else {
                        console.warn('⚠️ [获取车场编码] 响应格式异常，小区:', communityName, '响应:', yardCodeResponse);
                        // 🔧 使用小区名称作为备用车场编码
                        parkCode = communityName;
                        console.log('🔧 [备用方案] 使用小区名称作为车场编码:', parkCode);
                    }
                } catch (codeError) {
                    console.error('❌ [获取车场编码] API调用失败:', codeError);
                    // 🔧 使用小区名称作为备用车场编码
                    parkCode = communityName;
                    console.log('🔧 [备用方案] API失败，使用小区名称作为车场编码:', parkCode);
                }
            } else {
                console.warn('⚠️ [获取车场编码] 未找到用户小区信息');
                console.warn('💡 [提示] 可以在提交数据中添加 parkName 字段手动指定小区');
                console.warn('🔍 [调试] 用户信息结构:', JSON.stringify(userInfo, null, 2));
                
                // 🔧 最后的备用方案：使用默认车场编码
                parkCode = 'DEFAULT_PARK_001';
                console.log('🔧 [最终备用方案] 使用默认车场编码:', parkCode);
            }
            
            // 🔧 Step 3: 构建完整的违规记录数据
            const completeViolationData = {
                ...violationData,
                parkCode: parkCode || '', // 添加车场编码
                parkName: communityName || '', // 添加小区名称
                // 确保必要字段存在
                plateNumber: violationData.plateNumber || '',
                violationType: violationData.violationType || violationData.customType || '',
                location: violationData.location || '',
                description: violationData.description || '',
                reporterId: violationData.reporterId || userInfo?.patrolData?.id || userInfo?.userInfo?.id || userInfo?.id || ''
            };
            
            console.log('📝 [完整数据] 准备提交:', completeViolationData);
            console.log('🔍 [关键参数] parkCode:', completeViolationData.parkCode);
            console.log('🔍 [关键参数] parkName:', completeViolationData.parkName);
            
            // 🔧 Step 4: 提交违规记录
            const result = await apiRequest(apiUrls.violations.create, {
            method: 'POST',
                body: completeViolationData
            });
            
            console.log('✅ [创建违规记录] 提交成功:', result);
            return result;
            
        } catch (error) {
            console.error('❌ [创建违规记录] 失败:', error);
            console.error('💡 [错误详情] 消息:', error.message);
            console.error('💡 [错误详情] 完整错误:', error);
            throw error;
        }
    },

    // 获取违规记录列表
    getViolations(params = {}) {
        return apiRequest(apiUrls.violations.list, {
            method: 'GET',
            body: params
        });
    },

    // 🆕 根据车牌号查询violations表中的违规记录和业主信息
    getViolationsByPlateNumber(plateNumber) {
        console.log('🔍 [violations查询] 查询车牌:', plateNumber);
        return apiRequest(apiUrls.violations.byPlate, {
            method: 'GET',
            body: {
                plateNumber: plateNumber,
                page: 1,
                size: 50,  // 获取最近50条违规记录
                orderBy: 'createTime',
                orderDirection: 'desc',  // 按创建时间倒序
                processStatus: 'pending'    // 🆕 仅查询process_status为pending的记录
            }
        });
    },

    // 更新违规记录状态
    updateViolationStatus(id, status, remark, handlerId) {
        return apiRequest(apiUrls.violations.updateStatus.replace('{id}', id), {
            method: 'PUT',
            body: { status, remark, handlerId }
        });
    },

    // 获取违规统计数据
    getStatistics(params = {}) {
        return apiRequest(apiUrls.violations.statistics, {
            method: 'GET',
            body: params
        });
    },

    // 获取高风险车辆列表
    getHighRiskVehicles(params = {}) {
        return apiRequest(apiUrls.violations.highRiskVehicles, {
            method: 'GET',
            body: params
        });
    },

    // 获取用户违规记录
    getViolationRecords(params = {}) {
        // 如果是默认用户，直接返回空数组
        if (!params.userId || params.userId === 'default_user') {
            return Promise.resolve([]);
        }

        // 优先使用byOwner接口
        const url = apiUrls.violations.byOwner.replace('{ownerId}', params.userId);
        return apiRequest(url, {
            method: 'GET',
            body: params
        });
    },

    // 获取用户车辆列表
    getVehicleList(params = {}) {
        // 如果是默认用户，直接返回空数组
        if (!params.userId || params.userId === 'default_user') {
            return Promise.resolve([]);
        }

        // 优先使用owners.vehicles接口
        if (apiUrls.owners?.vehicles) {
            const url = apiUrls.owners.vehicles.replace('{ownerId}', params.userId);
            return apiRequest(url, {
                method: 'GET',
                body: params
            });
        }
        // 其次使用vehicles.byOwner接口
        else if (apiUrls.vehicles?.byOwner) {
            const url = apiUrls.vehicles.byOwner.replace('{ownerId}', params.userId);
            return apiRequest(url, {
                method: 'GET',
                body: params
            });
        }
        // 否则使用通用的list接口
        return apiRequest(apiUrls.vehicles?.list || '/api/vehicles', {
            method: 'GET',
            body: params
        });
    },

    // 获取用户信用分
    getUserCreditScore(params = {}) {
        // 如果是默认用户，直接返回默认信用分
        if (!params.userId || params.userId === 'default_user') {
            return Promise.resolve({ creditScore: 100 });
        }

        // 使用业主信用分接口
        if (apiUrls.owners?.creditScore) {
            const url = apiUrls.owners.creditScore.replace('{ownerId}', params.userId);
            return apiRequest(url, {
                method: 'GET',
                body: params
            });
        }
        // 否则使用默认接口
        return apiRequest('/api/credit-score', {
            method: 'GET',
            body: params
        });
    },

    // 🆕 查询业主信息（独立方法）
    async queryOwnerInfo(plateNumber) {
        console.log('👤 [查询业主信息] 开始查询车牌:', plateNumber);
        
        try {
            // 方法1：从violations表查询业主信息
            console.log('🔍 [方法1] 从violations表查询业主信息...');
            const violationsResult = await this.getViolationsByPlateNumber(plateNumber);
            console.log('🔍 [方法1] 从violations表查询业主信息结果:', violationsResult);
            if (violationsResult.data && violationsResult.data.records && violationsResult.data.records.length > 0) {
                console.log('✅ [方法1] 在violations表中找到业主信息');
                console.log('🔍 [方法1] 从violations表查询业主信息结果:', violationsResult.data.records[0]);
                // 从第一条记录中提取业主信息
                const firstRecord = violationsResult.data.records[0];
                const ownerInfo = {
                    monthTicketName: firstRecord.monthTicketName,
                    ownerId: firstRecord.ownerId,
                    name: firstRecord.ownerName || firstRecord.visitorname,
                    phone: firstRecord.ownerPhone || firstRecord.visitorphone,
                    address: firstRecord.ownerAddress || '未登记',
                    creditScore: firstRecord.creditScore || 100
                };
                
                return {
                    found: true,
                    source: 'violations',
                    ownerInfo: ownerInfo,
                    message: `从违规记录中找到业主 ${ownerInfo.name}`
                };
            }
            
            
            // 未找到业主信息
            console.log('❌ [查询业主信息] 未找到业主信息');
            return {
                found: false,
                source: null,
                ownerInfo: null,
                message: `车牌 ${plateNumber} 未找到业主信息`
            };
            
        } catch (error) {
            console.error('❌ [查询业主信息] 查询失败:', error);
            throw new Error(`查询业主信息失败: ${error.message}`);
        }
    },

    // 🆕 查询违规记录（独立方法）
    async queryViolationRecords(plateNumber) {
        console.log('⚠️ [查询违规记录] 开始查询车牌:', plateNumber);
        
        try {
            const violationsResult = await this.getViolationsByPlateNumber(plateNumber);
            
            if (violationsResult.data && violationsResult.data.records && violationsResult.data.records.length > 0) {
                console.log('✅ [查询违规记录] 找到违规记录，数量:', violationsResult.data.records.length);
                
                return {
                    found: true,
                    violationCount: violationsResult.total || violationsResult.data.records.length,
                    violationRecords: violationsResult.data.records,
                    message: `找到 ${violationsResult.data.records.length} 条违规记录`
                };
            } else {
                console.log('✅ [查询违规记录] 未找到违规记录');
                
                return {
                    found: false,
                    violationCount: 0,
                    violationRecords: [],
                    message: '该车牌无违规记录'
                };
            }
            
        } catch (error) {
            console.error('❌ [查询违规记录] 查询失败:', error);
            throw new Error(`查询违规记录失败: ${error.message}`);
        }
    },

    // 🆕 车牌点击处理方法（调用两个独立查询）
    async handlePlateSelection(plateNumber) {
        console.log('🎯 [车牌点击处理] 开始处理车牌:', plateNumber);
        
        try {
            // 并行查询业主信息和违规记录
            const [ownerResult, violationResult] = await Promise.all([
                this.queryOwnerInfo(plateNumber),
                this.queryViolationRecords(plateNumber)
            ]);
            
            console.log('👤 [业主信息查询结果]:', ownerResult);
            console.log('⚠️ [违规记录查询结果]:', violationResult);
            
            // 情况1：有业主信息 + 有违规记录
            if (ownerResult.found && violationResult.found) {
                return {
                    hasViolationHistory: true,
                    ownerInfo: ownerResult.ownerInfo,
                    violationRecords: violationResult.violationRecords,
                    violationCount: violationResult.violationCount,
                    suggestedAction: 'show_owner_and_violations',
                    message: `找到业主 ${ownerResult.ownerInfo.name} 的 ${violationResult.violationCount} 条违规记录`
                };
            }
            // 情况2：有业主信息 + 无违规记录
            else if (ownerResult.found && !violationResult.found) {
                return {
                    hasViolationHistory: false,
                    ownerInfo: ownerResult.ownerInfo,
                    violationRecords: [],
                    violationCount: 0,
                    suggestedAction: 'show_owner_no_violations',
                    message: `找到业主 ${ownerResult.ownerInfo.name}，无违规记录`
                };
            }
            // 情况3：无业主信息（无论是否有违规记录都需要手动填写）
            else {
                return {
                    hasViolationHistory: false,
                    ownerInfo: null,
                    violationRecords: violationResult.violationRecords || [],
                    violationCount: violationResult.violationCount || 0,
                    suggestedAction: 'show_no_records',
                    message: `车牌 ${plateNumber} 未找到业主信息，请手动填写`
                };
            }
            
        } catch (error) {
            console.error('❌ [车牌点击处理] 处理失败:', error);
            
            return {
                hasError: true,
                error: error,
                suggestedAction: 'show_error',
                message: `查询失败：${error.message || '网络错误'}`
            };
        }
    },

    // 🆕 简化版本的预约记录查询方法
    getAppointmentRecords(plateNumber) {
        return appointmentAPI.getAppointmentPlateNumber(plateNumber);
    },

    // 🆕 简化版本的违规分析方法
    analyzeViolationByPlate(plateNumber) {
        return apiRequest(apiUrls.appointmentAnalysis.analysis.replace('{plateNumber}', plateNumber));
    }
};

// 违规类型相关API
export const violationTypeApi = {
    // 获取违规类型列表
    getViolationTypes() {
        return apiRequest(apiUrls.violationTypes.list);
    },

    // 创建违规类型
    createViolationType(typeData) {
        return apiRequest(apiUrls.violationTypes.create, {
            method: 'POST',
            body: typeData
        });
    },

    // 更新违规类型
    updateViolationType(id, typeData) {
        return apiRequest(apiUrls.violationTypes.update.replace('{id}', id), {
            method: 'PUT',
            body: typeData
        });
    },

    // 删除违规类型
    deleteViolationType(id) {
        return apiRequest(apiUrls.violationTypes.delete.replace('{id}', id), {
            method: 'DELETE'
        });
    }
};

// 🆕 预约记录分析相关API
export const appointmentAnalysisApi = {
    // 根据车牌号查询预约记录（调用真正的appointment接口）
    getAppointmentRecords(plateNumber) {
        return appointmentAPI.getAppointmentPlateNumber(plateNumber);
    },

    // 根据车牌号分析违规情况
    analyzeViolation(plateNumber) {
        return apiRequest(apiUrls.appointmentAnalysis.analysis.replace('{plateNumber}', plateNumber));
    },

    // 🆕 根据车牌号查询违规相关的预约记录（原来的接口）
    getViolationAppointmentRecords(plateNumber) {
        return apiRequest(apiUrls.appointmentAnalysis.records.replace('{plateNumber}', plateNumber));
    },

    // 🆕 通过业主信息关联查询预约记录
    getAppointmentRecordsByOwner(params = {}) {
        const requestParams = {
            keyword: params.keyword || '',
            page: params.page || 1,
            size: params.size || 50,
            ...params
        };
        
        return apiRequest('/api/violations/appointment-records-by-owner', {
            method: 'GET',
            body: requestParams
        });
    }
};

// 黑名单相关API
export const blacklistApi = {
    // 获取黑名单类型列表
    getSpecialCarTypeList(parkCode) {
        return apiRequest('/parking/blackList/getSpecialCarTypeList', {
            method: 'GET',
            body: {
                parkCodeList: parkCode
            }
        });
    },

    // 查询单个车辆黑名单状态
    getParkBlack(plateNumber, parkCode) {
        return apiRequest('/parking/blackList/getParkBlack', {
            method: 'GET',
            body: {
                carNumber: plateNumber,
                parkCode: parkCode
            }
        });
    },

    // 批量获取黑名单车辆
    getParkBlackList(parkCode, page = 1, size = 50) {
        // 🔧 增加参数校验和调试信息
        console.log('🚨 [getParkBlackList] 开始处理黑名单查询');
        console.log('🚨 [getParkBlackList] 输入参数 - parkCode:', parkCode, '类型:', typeof parkCode);
        console.log('🚨 [getParkBlackList] 输入参数 - page:', page, '类型:', typeof page);
        console.log('🚨 [getParkBlackList] 输入参数 - size:', size, '类型:', typeof size);
        
        // 校验车场编码
        if (!parkCode || parkCode === '' || parkCode === null || parkCode === undefined) {
            console.error('❌ [getParkBlackList] 车场编码为空或无效:', parkCode);
            // 返回一个包含错误信息的Promise
            return Promise.resolve({
                resultCode: 400,
                message: '前端校验：车场编码不能为空',
                status: 2,
                data: {}
            });
        }
        
        // 确保车场编码是字符串类型
        const validParkCode = String(parkCode).trim();
        console.log('🔧 [getParkBlackList] 处理后的车场编码:', validParkCode);
        
        // 🔧 尝试两种不同的参数格式
        const requestBody1 = {
            parkCode: validParkCode,
            pageNum: parseInt(page),
            pageSize: parseInt(size)
        };
        
        const requestBody2 = {
            parkCodeList: validParkCode,  // 🔧 尝试使用 parkCodeList 参数
            pageNum: parseInt(page),
            pageSize: parseInt(size)
        };
        
        console.log('🚨 [getParkBlackList] 请求体方案1 (parkCode):', JSON.stringify(requestBody1, null, 2));
        console.log('🚨 [getParkBlackList] 请求体方案2 (parkCodeList):', JSON.stringify(requestBody2, null, 2));
        
        // 🔧 先尝试使用 parkCodeList 参数格式（参考getSpecialCarTypeList的成功案例）
        console.log('🔧 [getParkBlackList] 使用 parkCodeList 参数格式');
        
        // 🔧 尝试 GET 方法（参考其他黑名单接口都使用GET）
        console.log('🔧 [getParkBlackList] 尝试使用 GET 方法');
        
        return apiRequest('/parking/blackList/getParkBlackList', {
            method: 'GET',  // 🔧 改为 GET 方法
            body: requestBody2  // 使用 parkCodeList 格式
        });
    },

    // 添加车辆到黑名单
    addBlackListCar(plateNumber, parkCode, specialCarType = 1) {
        return apiRequest('/parking/blackList/addBlackListCar', {
            method: 'GET',
            body: {
                carNumber: plateNumber,
                parkCode: parkCode,
                specialCarType: specialCarType
            }
        });
    },

    // 从黑名单移除车辆
    removeBlackListCar(plateNumber, parkCode) {
        return apiRequest('/parking/blackList/removeBlackListCar', {
            method: 'GET',
            body: {
                carNumber: plateNumber,
                parkCode: parkCode
            }
        });
    }
};

// 工具函数
export const apiUtils = {
    // 格式化日期范围参数
    formatDateRange(startDate, endDate) {
        const params = {};
        if (startDate) {
            params.startDate = startDate;
        }
        if (endDate) {
            params.endDate = endDate;
        }
        return params;
    },

    // 格式化分页参数
    formatPagination(page = 1, size = 20) {
        return {
            page: parseInt(page),
            size: parseInt(size)
        };
    },

    // 处理API错误
    handleApiError(error, defaultMessage = '操作失败') {
        console.error('API错误:', error);
        
        // 在uni-app中显示错误提示
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
