// 违规提醒API接口封装
import { request, apiUrls } from '@/config/api.js';

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
        console.log(' [违规提醒API] 开始处理API请求');
        console.log(' [违规提醒API] 原始URL:', url);
        console.log(' [违规提醒API] 请求选项:', options);
        
        let requestUrl = url;
        let requestData = options.body || {};

        if (options.method === 'GET' && requestData && Object.keys(requestData).length > 0) {
            const queryString = serializeParams(requestData);
            requestUrl = `${url}?${queryString}`;
            requestData = {};
        }

        const result = await request({
            url: requestUrl,
            method: options.method || 'GET',
            data: requestData,
            timeout: 30000,
            maxRetries: 2
        });

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
        console.error('违规提醒API请求失败:', error);
        throw error;
    }
};

// 违规提醒相关API
export const violationReminderApi = {
    //  获取违规提醒/短信配置（包含最小发送间隔等）
    getSettings() {
        console.log('⚙️ [获取提醒配置]');
        return apiRequest('/parking/violationReminders/settings', {
            method: 'GET',
            body: {}
        });
    },

    //  判断是否超过最小发送间隔
    checkInterval(plateNumber) {
        console.log('⏱️ [检查发送间隔] 车牌号:', plateNumber);
        return apiRequest('/parking/violationReminders/check-interval', {
            method: 'GET',
            body: { plateNumber }
        });
    },

    // 查询违规提醒记录
    getViolationReminders(params = {}) {
        console.log(' [查询违规提醒] 参数:', params);
        return apiRequest('/parking/violationReminders/page', {
            method: 'GET',
            body: params
        });
    },

    // 创建违规提醒记录
    createViolationReminder(reminderData) {
        console.log(' [创建违规提醒] 数据:', reminderData);
        return apiRequest('/parking/violationReminders/add', {
            method: 'POST',
            body: reminderData
        });
    },

    // 更新违规提醒处理状态
    updateReminderProcessStatus(id, processData) {
        console.log(' [更新提醒状态] ID:', id, '数据:', processData);
        return apiRequest(`/parking/violationReminders/${id}/process`, {
            method: 'PUT',
            body: processData
        });
    },

    // 检查是否需要发送违规提醒
    checkReminderNeeded(plateNumber) {
        console.log(' [检查提醒需求] 车牌号:', plateNumber);
        return apiRequest('/parking/violationReminders/check-reminder', {
            method: 'GET',
            body: { plateNumber }
        });
    },

    // 根据车牌号查询未处理的违规提醒
    getUnprocessedRemindersByPlate(plateNumber) {
        console.log(' [查询未处理提醒] 车牌号:', plateNumber);
        return apiRequest('/parking/violationReminders/unprocessed', {
            method: 'GET',
            body: { 
                plateNumber,
                isProcessed: 0,
                page: 1,
                size: 10
            }
        });
    },

    // 标记所有未处理的提醒为已处理
    markAllRemindersAsProcessed(plateNumber, processedBy) {
        console.log(' [批量标记处理] 车牌号:', plateNumber, '处理人:', processedBy);
        return apiRequest('/parking/violationReminders/mark-all-processed', {
            method: 'PUT',
            body: { 
                plateNumber,
                processedBy,
                processedTime: new Date().toISOString()
            }
        });
    },

    // 发送违规提醒短信
    async sendViolationReminderSms(phoneNumber, templateData) {
        console.log(' [发送提醒短信] 手机号:', phoneNumber, '模板数据:', templateData);
        
        try {
            uni.showLoading({
                title: '发送提醒短信中...'
            });

            //  从本地存储获取动态短信模板配置
            let smsTemplate = null;
            try {
                const smsTemplatesData = uni.getStorageSync('smsTemplates');
                console.log(' [发送提醒短信] 获取到的短信模板列表:', smsTemplatesData);
                
                // 处理可能的数据结构：可能是直接的数组，也可能是包含data字段的对象
                const smsTemplates = Array.isArray(smsTemplatesData) 
                    ? smsTemplatesData 
                    : (smsTemplatesData?.data || []);
                
                // 查找违规类型的短信模板（templateType=1表示违规提醒）
                smsTemplate = smsTemplates.find(t => t.templateName === "违规提醒");
                
                if (!smsTemplate && smsTemplates.length > 0) {
                    // 如果没有找到违规类型的模板，使用第一个作为默认模板
                    smsTemplate = smsTemplates[0];
                    console.log('ℹ️ [发送提醒短信] 未找到违规类型模板，使用默认模板:', smsTemplate);
                }
            } catch (error) {
                console.error('❌ [发送提醒短信] 获取短信模板失败:', error);
            }

            // 短信配置（使用动态模板或后备默认值）
            const smsConfig = {
                baseUrl: 'https://www.xuerparking.cn:8543',
                signName: smsTemplate?.signName || '东北林业大学', //  动态签名
                templateCode: smsTemplate?.templateCode || 'SMS_496865506', //  动态模板代码
                timeout: 10000
            };
            
            console.log(' [发送提醒短信] 使用的短信配置:', {
                signName: smsConfig.signName,
                templateCode: smsConfig.templateCode,
                templateName: smsTemplate?.templateName || '默认模板'
            });

            // 构建短信模板参数
            const templateParam = JSON.stringify({
                license_plate_number: templateData.plateNumber,
                year: templateData.year,
                month: templateData.month,
                day: templateData.day,
                time: templateData.time,
                address: templateData.location || '停车场'
            });

            console.log(' 准备发送违规提醒短信:', {
                phoneNumber: phoneNumber,
                templateParam: templateParam
            });

            // 调用阿里云短信接口
            const response = await uni.request({
                url: `${smsConfig.baseUrl}/parking/sms/sendCustomMessage`,
                method: 'POST',
                header: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: `phoneNumber=${encodeURIComponent(phoneNumber)}&customSignName=${encodeURIComponent(smsConfig.signName)}&customTemplateCode=${encodeURIComponent(smsConfig.templateCode)}&templateParam=${encodeURIComponent(templateParam)}`,
                timeout: smsConfig.timeout
            });

            uni.hideLoading();
            
            if (response.statusCode === 200 && response.data.data && response.data.data.code === '0') {
                uni.showToast({
                    title: '提醒短信发送成功',
                    icon: 'success',
                    duration: 2000
                });
                console.log('✅ 违规提醒短信发送成功:', response.data);
                return { success: true, data: response.data };
            } else {
                throw new Error(response.data?.message || '短信发送失败');
            }

        } catch (error) {
            uni.hideLoading();
            console.error('❌ 发送违规提醒短信失败:', error);

            uni.showModal({
                title: '提醒短信发送失败',
                content: `短信发送失败：${error.message || '网络错误'}`,
                showCancel: false,
                confirmText: '知道了'
            });
            
            return { success: false, error: error.message };
        }
    },

    // 发送违规短信（原有逻辑）
    async sendViolationSms(phoneNumber, templateData) {
        console.log(' [发送违规短信] 手机号:', phoneNumber, '模板数据:', templateData);
        
        try {
            uni.showLoading({
                title: '发送违规短信中...'
            });

            //  从本地存储获取动态短信模板配置
            let smsTemplate = null;
            try {
                const smsTemplatesData = uni.getStorageSync('smsTemplates');
                console.log(' [发送违规短信] 获取到的短信模板列表:', smsTemplatesData);
                
                // 处理可能的数据结构：可能是直接的数组，也可能是包含data字段的对象
                const smsTemplates = Array.isArray(smsTemplatesData) 
                    ? smsTemplatesData 
                    : (smsTemplatesData?.data || []);
                
                // 查找违规类型的短信模板（templateType=1表示违规提醒）
                smsTemplate = smsTemplates.find(t => t.templateName === '违规短信发送');
                
                if (!smsTemplate && smsTemplates.length > 0) {
                    // 如果没有找到违规类型的模板，使用第一个作为默认模板
                    smsTemplate = smsTemplates[0];
                    console.log('ℹ️ [发送违规短信] 未找到违规类型模板，使用默认模板:', smsTemplate);
                }
            } catch (error) {
                console.error('❌ [发送违规短信] 获取短信模板失败:', error);
            }

            // 短信配置（使用动态模板或后备默认值）
            const smsConfig = {
                baseUrl: 'https://www.xuerparking.cn:8543',
                signName: smsTemplate?.signName || '东北林业大学', //  动态签名
                templateCode: smsTemplate?.templateCode || 'SMS_496020098', //  动态模板代码
                timeout: 10000
            };
            
            console.log(' [发送违规短信] 使用的短信配置:', {
                signName: smsConfig.signName,
                templateCode: smsConfig.templateCode,
                templateName: smsTemplate?.templateName || '默认模板'
            });

            // 构建短信模板参数
            const templateParam = JSON.stringify({
                license_plate_number: templateData.plateNumber,
                year: templateData.year,
                month: templateData.month,
                day: templateData.day,
                time: templateData.time,
                code: templateData.location || '停车场'
            });

            console.log(' 准备发送违规短信:', {
                phoneNumber: phoneNumber,
                templateParam: templateParam
            });

            // 调用阿里云短信接口
            const response = await uni.request({
                url: `${smsConfig.baseUrl}/parking/sms/sendCustomMessage`,
                method: 'POST',
                header: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: `phoneNumber=${encodeURIComponent(phoneNumber)}&customSignName=${encodeURIComponent(smsConfig.signName)}&customTemplateCode=${encodeURIComponent(smsConfig.templateCode)}&templateParam=${encodeURIComponent(templateParam)}`,
                timeout: smsConfig.timeout
            });

            uni.hideLoading();
            
            if (response.statusCode === 200 && response.data.data && response.data.data.code === '0') {
                uni.showToast({
                    title: '违规短信发送成功',
                    icon: 'success',
                    duration: 2000
                });
                console.log('✅ 违规短信发送成功:', response.data);
                return { success: true, data: response.data };
            } else {
                throw new Error(response.data?.message || '短信发送失败');
            }

        } catch (error) {
            uni.hideLoading();
            console.error('❌ 发送违规短信失败:', error);

            uni.showModal({
                title: '违规短信发送失败',
                content: `短信发送失败：${error.message || '网络错误'}`,
                showCancel: false,
                confirmText: '知道了'
            });
            
            return { success: false, error: error.message };
        }
    }
};

// 工具函数
export const reminderUtils = {
    // 格式化时间信息
    formatTimeInfo(date = new Date()) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        // 手动格式化时间为 hh:mm:ss 格式，避免时区信息
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const time = `${hours}:${minutes}:${seconds}`;
        
        return { year: year.toString(), month: month.toString(), day: day.toString(), time };
    },

    // 构建违规提醒数据
    buildReminderData(violationData, ownerInfo) {
        const timeInfo = this.formatTimeInfo();
        return {
            plateNumber: violationData.plateNumber,
            ownerName: ownerInfo?.name || '',
            ownerPhone: ownerInfo?.phone || '',
            violationType: violationData.violationType || violationData.customType || '',
            violationLocation: violationData.location || '',
            violationTime: violationData.violationTime || new Date().toISOString(),
            reminderTime: new Date().toISOString(),
            reminderTemplateCode: 'SMS_496865506',
            reminderContent: `您的车辆${violationData.plateNumber}在${timeInfo.year}年${timeInfo.month}月${timeInfo.day}日${timeInfo.time}于${violationData.location || '停车场'}发生${violationData.violationType || violationData.customType || '违规'}行为，请及时处理。`,
            isProcessed: 0,
            parkCode: violationData.parkCode || '',
            parkName: violationData.parkName || ''
        };
    },

    // 构建短信模板数据
    buildSmsTemplateData(violationData) {
        const timeInfo = this.formatTimeInfo();
        
        return {
            plateNumber: violationData.plateNumber,
            year: timeInfo.year,
            month: timeInfo.month,
            day: timeInfo.day,
            time: timeInfo.time,
            location: violationData.location || '停车场'
        };
    }
};
