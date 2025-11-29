<template>
	<view class="container">
		<view class="background">
			<view class="top-section">
				<view class="decoration-icon">🚗</view>
			</view>
			<view class="bottom-section">
				<view class="curve-overlay"></view>
			</view>
		</view>

		<view class="content">
			<view class="header">
				<view class="logo-container">
					<image src="/static/巡检查询-巡检工作台.png" class="logo"></image>
				</view>
				<text class="welcome-text">您好！</text>
				<text class="subtitle">欢迎使用违停巡检系统</text>
			</view>

			<view class="form-container">
				<view class="form">
					<view class="input-group">
						<view class="input-icon">
							<text class="icon">👤</text>
						</view>
						<input v-model="form_username" placeholder="请输入手机号/用户名" class="input-field"
							:class="{ 'error': usernameError }" @blur="validateUsername" @input="clearUsernameError" />
						<view v-if="usernameError" class="error-text">请输入用户名</view>
					</view>
					<view class="input-group">
						<view class="input-icon">
							<text class="icon">🔐</text>
						</view>
						<input v-model="form_password" type="text" :password="!showPassword" placeholder="请输入登录密码"
							class="input-field password-input" :class="{ 'error': passwordError }"
							@blur="validatePassword" @input="clearPasswordError" />
						<view class="password-toggle" @click="togglePassword">
							<text class="eye-icon">{{ showPassword ? '👁️' : '🙈' }}</text>
						</view>
						<view v-if="passwordError" class="error-text">请输入密码</view>
					</view>
				</view>

			<view class="login-btn-container">
				<!-- 锁定状态完全由后端判断，前端不阻止登录 -->
				<button class="login-btn" :class="{ 'disabled': isLocked }" @click="login()">
					<text class="btn-text">{{ isLocked ? '账号已锁定' : '立即登录' }}</text>
				</button>
				<view v-if="isLocked" class="lock-tip">
					<text class="lock-tip-text">{{ lockReason }}</text>
				</view>
			</view>

				<!-- 网络提示 -->
				<view class="network-tips">
					<text class="tips-text">💡 首次登录可能需要等待10-15秒，请耐心等待</text>
				</view>

				<view class="privacy-container" :class="{ 'error': agreementError }">
					<checkbox-group @change="privacyChange">
						<checkbox value="privacy" color="#0066cc" style="transform:scale(0.8)" />
					</checkbox-group>
					<text class="privacy-text">
						已阅读并同意<text class="link" @click="showPrivacy">《隐私政策》</text>和<text class="link"
							@click="showTerms">《服务协议》</text>
					</text>
					<view v-if="agreementError" class="agreement-error-text">请勾选同意协议</view>
				</view>
			</view>
		</view>

		<!-- 隐私政策弹窗 -->
		<view v-if="showPrivacyModal" class="modal-overlay" @click="closePrivacy">
			<view class="modal-content" @click.stop="">
				<view class="modal-header">
					<text class="modal-title">隐私政策</text>
					<text class="close-btn" @click="closePrivacy">×</text>
				</view>
				<scroll-view class="modal-body" scroll-y="true">
					<view class="policy-section">
						<text class="section-title">一、我们如何收集和使用个人信息</text>
						<text class="section-content">
							（一）为实现基本服务所必需的信息
							• 登录信息：用户名、密码
							• 设备与日志信息：设备型号、操作系统、IP地址、操作日志等

							（二）为实现违停巡检功能所采集的信息
							• 违停车辆信息：车牌号码、车辆品牌/颜色、违停位置、违停时间、现场照片/视频
							• 位置信息：执行巡检任务时获取地理位置，用于标记违停地点

							用途：仅用于违停行为记录、任务上报及后续管理处置，不用于任何商业目的。
						</text>
					</view>

					<view class="policy-section">
						<text class="section-title">二、我们如何使用所采集的信息</text>
						<text class="section-content">
							• 向您所属的管理单位提交违停数据
							• 进行内部数据分析，优化巡检路线与效率
							• 配合行政机关依法调取数据（如交警部门核查）
							• 不会将违停数据或用户信息出售、出租或共享给无关第三方
						</text>
					</view>

					<view class="policy-section">
						<text class="section-title">三、信息存储与保护</text>
						<text class="section-content">
							• 存储地点：所有数据均存储于中国境内服务器
							• 存储期限：
							- 用户个人信息：在您账号有效期内保存；账号注销后30日内删除
							- 违停记录数据：根据所属单位管理要求及法律法规保存，最长不超过2年
							• 安全措施：采用加密传输（HTTPS）、访问权限控制、操作日志审计等技术手段保护数据安全
						</text>
					</view>

					<view class="policy-section">
						<text class="section-title">四、您的权利</text>
						<text class="section-content">
							您可通过以下方式行使个人信息权利：
							• 查询/更正：联系所属单位管理员
							• 删除/注销：如您离职或不再使用，可申请注销账号，我们将删除您的个人信息（法律法规要求保留的除外）
							• 撤回授权：可在微信"设置-隐私-授权管理"中取消本小程序权限，但可能导致部分功能无法使用
						</text>
					</view>

					<view class="policy-section">
						<text class="section-title">五、关于未成年人信息</text>
						<text class="section-content">
							本小程序仅面向成年人（18周岁以上）授权工作人员使用，不会主动收集未成年人信息。如发现误采，请立即联系我们删除。
						</text>
					</view>

					<view class="policy-section">
						<text class="section-title">六、联系我们</text>
						<text class="section-content">
							如对本协议或数据处理有任何疑问，请联系：
							邮箱：2864988956@qq.com
							生效日期：2025年9月26日
						</text>
					</view>
				</scroll-view>
				<view class="modal-footer">
					<button class="confirm-btn" @click="closePrivacy">我知道了</button>
				</view>
			</view>
		</view>

		<!-- 服务协议弹窗 -->
		<view v-if="showTermsModal" class="modal-overlay" @click="closeTerms">
			<view class="modal-content" @click.stop="">
				<view class="modal-header">
					<text class="modal-title">服务协议</text>
					<text class="close-btn" @click="closeTerms">×</text>
				</view>
				<scroll-view class="modal-body" scroll-y="true">
					<view class="policy-section">
						<text class="section-title">一、服务内容</text>
						<text class="section-content">
							本小程序面向经授权的巡检人员，提供违停车辆信息采集、上传、任务管理及数据上报服务。

							您可通过本小程序拍摄违停车辆照片、录入车牌号码、记录违停位置及时间，并提交至指定管理平台。
						</text>
					</view>

					<view class="policy-section">
						<text class="section-title">二、用户资格与授权</text>
						<text class="section-content">
							• 仅限经相关单位授权的工作人员使用本小程序。个人用户未经授权不得注册或使用
							• 您承诺所提交的违停信息真实、准确、合法，不得虚构、篡改或恶意举报
							• 您理解并同意，使用本小程序即代表您已获得所属单位的授权，并遵守其内部管理规定
						</text>
					</view>

					<view class="policy-section">
						<text class="section-title">三、用户义务</text>
						<text class="section-content">
							• 不得利用本小程序从事任何违法、违规或侵犯他人合法权益的行为
							• 不得将账号转借、出租、出售给他人使用
							• 不得干扰小程序正常运行，包括但不限于攻击服务器、批量刷数据等
							• 确保所采集的违停信息真实、准确，不得恶意举报或虚构违停行为
						</text>
					</view>

					<view class="policy-section">
						<text class="section-title">四、免责声明</text>
						<text class="section-content">
							• 因不可抗力（如自然灾害、网络故障、政策调整等）导致服务中断或数据丢失，我们不承担责任
							• 因用户操作失误、提供虚假信息或越权使用导致的法律后果，由用户及其所属单位自行承担
							• 本小程序仅作为信息采集工具，不参与执法决定。最终处理结果由相关执法或管理单位依法作出
						</text>
					</view>

					<view class="policy-section">
						<text class="section-title">五、协议变更</text>
						<text class="section-content">
							我们有权根据法律法规或业务需要更新本协议。更新后将通过小程序公告或弹窗提示。若您继续使用服务，即视为接受修改后的协议。
						</text>
					</view>

					<view class="policy-section">
						<text class="section-title">六、法律适用与争议解决</text>
						<text class="section-content">
							本协议适用中华人民共和国法律。因本协议引起的争议，双方应友好协商；协商不成的，提交我们所在地有管辖权的人民法院诉讼解决。

							生效日期：2025年9月26日
						</text>
					</view>
				</scroll-view>
				<view class="modal-footer">
					<button class="confirm-btn" @click="closeTerms">我知道了</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import AuthUtils from '@/utils/auth.js'

export default {
	data() {
		return {
			form_username: '',
			form_password: '',
			checked: false,
			showPrivacyModal: false,
			showTermsModal: false,
			showPassword: false, // 新增：控制密码显示/隐藏
			usernameError: false, // 用户名错误状态
			passwordError: false, // 密码错误状态
			agreementError: false, // 协议未勾选错误状态
			isLocked: false, // 账户是否被锁定（完全由后端判断）
			lockReason: '', // 锁定原因（从后端获取）
			failedLoginCount: 0, // 失败次数（仅用于记录，不用于判断锁定状态）
			lockTime: null // 锁定时间（不再使用，保留用于兼容）
		}
	},
	onLoad() {
		// 页面加载时，只加载失败次数（不检查锁定状态，锁定状态完全由后端判断）
		this.loadFailedCount();
	},
	onUnload() {
		// 页面卸载时清理（不再需要定时器）
	},
	watch: {
		// 监听用户名变化，加载该用户的失败次数（不检查锁定状态）
		form_username(newVal) {
			if (newVal) {
				this.loadFailedCount();
			} else {
				// 用户名清空时，重置状态
				this.isLocked = false;
				this.lockReason = '';
				this.failedLoginCount = 0;
			}
		}
	},
	methods: {
		/**
		 * 加载失败次数（不检查锁定状态，锁定状态完全由后端判断）
		 */
		loadFailedCount() {
			const username = this.form_username.trim();
			if (!username) {
				this.failedLoginCount = 0;
				return;
			}

			// 从本地存储获取该用户的失败次数（仅用于记录，不用于判断锁定状态）
			const lockKey = `login_lock_${username}`;
			const lockData = uni.getStorageSync(lockKey);

			if (lockData) {
				this.failedLoginCount = lockData.failedCount || 0;
			} else {
				this.failedLoginCount = 0;
			}
			
			// 不设置锁定状态，锁定状态完全由后端判断
			this.isLocked = false;
			this.lockReason = '';
		},

		/**
		 * 清除锁定状态（登录成功时调用）
		 */
		clearLockStatus() {
			const username = this.form_username.trim();
			if (!username) return;

			const lockKey = `login_lock_${username}`;
			uni.removeStorageSync(lockKey);

			this.isLocked = false;
			this.lockReason = '';
			this.failedLoginCount = 0;
			this.lockTime = null;

			console.log('✅ [登录页面] 已清除锁定状态和失败次数');
		},

		/**
		 * 处理登录失败（增加失败次数）
		 */
		handleLoginFailure(errorMessage) {
			const username = this.form_username.trim();
			if (!username) return;

			// 检查错误信息，判断是否为密码错误
			const isPasswordError = errorMessage && (
				errorMessage.includes('密码') ||
				errorMessage.includes('用户名或密码') ||
				errorMessage.includes('密码错误')
			);

			// 如果错误信息包含"账户已被锁定"或"账户已被禁用"，说明后端已经处理
			if (errorMessage && (errorMessage.includes('账户已被锁定') || errorMessage.includes('账户已被禁用'))) {
				// 如果是禁用，清除前端的锁定状态和失败次数
				if (errorMessage.includes('账户已被禁用')) {
					const username = this.form_username.trim();
					if (username) {
						const lockKey = `login_lock_${username}`;
						uni.removeStorageSync(lockKey);
						this.isLocked = false;
						this.lockReason = '';
						this.failedLoginCount = 0;
						this.lockTime = null;
						console.log('✅ [登录页面] 账户已被禁用，已清除前端锁定状态');
					}
				} else {
					// 后端返回锁定错误，说明账户确实被锁定，直接使用后端返回的错误信息
					// 不再保存锁定时间到本地，完全依赖后端判断
					this.isLocked = true;
					this.lockReason = errorMessage;
					console.log('🔒 [登录页面] 后端返回锁定状态:', errorMessage);
				}
				return;
			}

			// 只有密码错误才处理失败次数
			if (!isPasswordError) {
				console.log('ℹ️ [登录页面] 非密码错误，不处理失败次数');
				return;
			}

			// 从后端返回的错误信息中提取剩余尝试次数，然后反推出失败次数
			// 后端返回格式：用户名或密码输入错误，还可尝试X次
			const remainingAttemptsMatch = errorMessage.match(/还可尝试(\d+)次/);
			if (remainingAttemptsMatch) {
				const remainingAttempts = parseInt(remainingAttemptsMatch[1]);
				// 反推失败次数：总尝试次数(5) - 剩余尝试次数 = 已失败次数
				const failedCount = 5 - remainingAttempts;
				
				const lockKey = `login_lock_${username}`;
				const lockData = uni.getStorageSync(lockKey) || {};
				
				// 使用后端返回的失败次数（通过剩余尝试次数反推）
				lockData.failedCount = failedCount;
				this.failedLoginCount = failedCount;
				uni.setStorageSync(lockKey, lockData);
				
				console.log('❌ [登录页面] 登录失败，后端返回剩余尝试次数:', remainingAttempts, '次，反推失败次数:', failedCount, '次');
				
				if (failedCount >= 5) {
					console.log('⚠️ [登录页面] 失败次数达到5次，但锁定状态由后端判断');
				}
			} else {
				// 如果无法从错误信息中提取剩余尝试次数，说明可能是其他类型的错误
				console.log('⚠️ [登录页面] 无法从错误信息中提取剩余尝试次数，跳过失败次数更新');
			}
		},

		async login() {
			// 先验证输入
			this.validateUsername();
			this.validatePassword();

			// 如果有错误，不继续执行
			if (this.usernameError || this.passwordError) {
				return;
			}

			// 注意：不再在这里阻止登录，让后端判断是否真的锁定
			// 如果后端已经解除锁定（时间已过），应该允许登录
			// 如果后端返回锁定错误，会在 handleLoginFailure 中处理

			if (!this.checked) {
				this.agreementError = true;
				// 3秒后自动清除错误状态
				setTimeout(() => {
					this.agreementError = false;
				}, 3000);
				return uni.showToast({
					icon: 'none',
					title: '请先勾选同意隐私政策和服务协议'
				})
			}

			// 显示加载中
			uni.showLoading({
				title: '登录中...'
			});

			try {
				// 构建登录请求数据
				const loginData = {
					username: this.form_username.trim(),
					password: this.form_password.trim()
				};

				console.log('🔐 [登录页面] 开始登录流程...');
				console.log('🔐 [登录页面] 登录数据:', loginData);

				// 使用AuthUtils进行登录
				const result = await AuthUtils.login(loginData);

				console.log('🔍 [登录页面] 登录结果:', JSON.stringify(result));

					// 处理登录结果
					if (result.success) {
						console.log('✅ [登录页面] 登录成功');
						
						// 登录成功，说明后端已经解除锁定（或从未锁定），清除前端锁定状态
						// 这确保了前端显示与后端实际状态一致
						this.clearLockStatus();
						console.log('✅ [登录页面] 后端返回成功，已清除前端锁定状态');
						
						// 获取用户信息
						const userData = result.data;
						const userName = userData.userInfo?.realName || userData.username || '用户';
						
						// 确保loading已隐藏后再显示提示（避免冲突）
						uni.hideLoading();
						
						// 延迟一点显示Toast，确保loading完全消失
						setTimeout(() => {
							// 使用Modal显示欢迎信息（手机端兼容性更好）
							uni.showModal({
								title: '登录成功',
								content: `欢迎回来，${userName}！`,
								showCancel: false,
								confirmText: '开始使用',
								success: (res) => {
									if (res.confirm) {
										// 立即跳转到违停举报页面
										uni.switchTab({
											url: '/pages/violation/add-violation'
										});
									}
								}
							});
						}, 200);
						
					} else {
						console.log('❌ [登录页面] 登录失败:', result.message);
						
						// 处理登录失败（增加失败次数）
						this.handleLoginFailure(result.message);
						
						// AuthUtils已经用modal显示了错误提示
						// 不需要额外处理
					}

			} catch (error) {
				console.error('❌ [登录页面] 登录异常:', error);

				// 处理登录失败（增加失败次数）
				const errorMessage = error.message || error.toString();
				this.handleLoginFailure(errorMessage);

				// 使用 modal 显示异常信息（真机兼容性更好）
				uni.showModal({
					title: '登录异常',
					content: errorMessage || '登录异常，请稍后重试',
					showCancel: false,
					confirmText: '我知道了'
				});
			} finally {
				// 隐藏加载中（AuthUtils已经处理了，这里做个保险）
				uni.hideLoading();
			}
		},

		validateUsername() {
			this.usernameError = !this.form_username || this.form_username.trim() === '';
		},

		validatePassword() {
			this.passwordError = !this.form_password || this.form_password.trim() === '';
		},

		clearUsernameError() {
			if (this.usernameError) {
				this.usernameError = false;
			}
		},

		clearPasswordError() {
			if (this.passwordError) {
				this.passwordError = false;
			}
		},
		forgotPassword() {
			uni.showToast({
				icon: 'none',
				title: '跳转到找回密码页面'
			})
		},

		privacyChange(e) {
			this.checked = e.detail.value.length ? true : false;
			// 勾选时清除错误状态
			if (this.checked && this.agreementError) {
				this.agreementError = false;
			}
		},

		showPrivacy() {
			this.showPrivacyModal = true
		},

		closePrivacy() {
			this.showPrivacyModal = false
		},

		showTerms() {
			this.showTermsModal = true
		},

		closeTerms() {
			this.showTermsModal = false
		},

		togglePassword() {
			this.showPassword = !this.showPassword;
			console.log('密码显示状态:', this.showPassword);
		}
	}
}
</script>

<style lang="scss" scoped>
.container {
	position: relative;
	min-height: 100vh;
	overflow: hidden;
}

.background {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;

	.top-section {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 45vh;
		background: linear-gradient(135deg, #0066cc 0%, #004499 100%);

		.decoration-icon {
			position: absolute;
			top: 40%;
			right: 60rpx;
			font-size: 120rpx;
			opacity: 0.2;
			transform: rotate(15deg);
		}
	}

	.bottom-section {
		position: absolute;
		top: 35vh;
		left: 0;
		right: 0;
		bottom: 0;
		background: #f8f9fa;

		.curve-overlay {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			height: 100rpx;
			background: linear-gradient(135deg, #0066cc 0%, #004499 100%);
			border-radius: 0 0 50% 50%;
			transform: translateY(-50rpx);
		}
	}
}

.content {
	position: relative;
	z-index: 1;
	padding: 40rpx 60rpx 40rpx;
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	padding-top: 80rpx;
}

.header {
	text-align: center;
	margin-bottom: 80rpx;

	.logo-container {
		margin-bottom: 40rpx;

		.logo {
			width: 140rpx;
			height: 140rpx;
			border-radius: 50%;
			box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
		}
	}

	.welcome-text {
		display: block;
		font-size: 44rpx;
		font-weight: 700;
		color: #fff;
		margin-bottom: 16rpx;
		text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
	}

	.subtitle {
		display: block;
		font-size: 28rpx;
		color: rgba(255, 255, 255, 0.9);
		font-weight: 400;
	}
}

.form-container {
	width: 110%;
	background: #fff;
	border-radius: 30rpx;
	padding: 60rpx 60rpx 60rpx;
	box-shadow: 0 25px 80px rgba(0, 0, 0, 0.08);
	margin: 42rpx 0 0;
	margin-left: -35rpx;
	margin-top: -10px;
	border: 1rpx solid rgba(0, 102, 204, 0.1);
}

.form {
	margin-bottom: 50rpx;
}

.input-group {
	position: relative;
	margin-bottom: 50rpx;

	&:last-child {
		margin-bottom: 0;
	}

	.input-icon {
		position: absolute;
		left: 30rpx;
		top: 50%;
		transform: translateY(-50%);
		z-index: 2;

		.icon {
			font-size: 30rpx;
			opacity: 0.7;
		}
	}



	.input-field {
		width: 100%;
		height: 70rpx;
		background: #f8f9fa;
		border: 2rpx solid #e9ecef;
		border-radius: 20rpx;
		padding: 0 40rpx 0 80rpx;
		font-size: 25rpx;
		color: #333;
		transition: all 0.3s ease;

		&:focus {
			background: #fff;
			border-color: #0066cc;
			box-shadow: 0 0 0 8rpx rgba(0, 102, 204, 0.08);
		}
	}

	.password-input {
		padding-right: 110rpx !important;
		/* 为眼睛图标腾出空间 */
	}

	.input-field.error {
		border-color: #ff4757 !important;
		background: #fff5f5 !important;
	}

	.error-text {
		position: absolute;
		bottom: -35rpx;
		left: 30rpx;
		font-size: 22rpx;
		color: #ff4757;
		line-height: 1;
	}

	.forgot-link {
		position: absolute;
		right: 30rpx;
		top: 50%;
		transform: translateY(-50%);

		text {
			font-size: 24rpx;
			color: #0066cc;
			font-weight: 500;
		}
	}
}

.login-btn-container {
	margin-bottom: 60rpx;

	.login-btn {
		width: 100%;
		height: 80rpx;
		background: linear-gradient(135deg, #0066cc 0%, #004499 100%);
		border: none;
		border-radius: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 15px 35px rgba(0, 102, 204, 0.25);
		transition: all 0.3s ease;

		&:active:not(.disabled) {
			transform: translateY(2rpx);
			box-shadow: 0 8px 20px rgba(0, 102, 204, 0.25);
		}

		&.disabled {
			background: linear-gradient(135deg, #cccccc 0%, #999999 100%);
			box-shadow: none;
			opacity: 0.6;
			cursor: not-allowed;
		}

		.btn-text {
			color: #fff;
			font-size: 30rpx;
			font-weight: 600;
		}
	}

	.lock-tip {
		margin-top: 20rpx;
		padding: 20rpx;
		background: #fff5f5;
		border-radius: 12rpx;
		border: 2rpx solid #ff4757;

		.lock-tip-text {
			font-size: 24rpx;
			color: #ff4757;
			text-align: center;
			line-height: 1.5;
			display: block;
		}
	}
}

.privacy-container {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 16rpx;
	padding: 20rpx;
	border-radius: 12rpx;
	transition: all 0.3s ease;

	&.error {
		background: #fff5f5;
		border: 2rpx solid #ff4757;
		animation: shake 0.5s ease-in-out;
	}

	.privacy-text {
		font-size: 24rpx;
		color: #666;
		line-height: 1.5;

		.link {
			color: #0066cc;
			font-weight: 500;
		}
	}

	.agreement-error-text {
		position: absolute;
		bottom: -35rpx;
		left: 50%;
		transform: translateX(-50%);
		font-size: 22rpx;
		color: #ff4757;
		white-space: nowrap;
		background: #fff;
		padding: 0 10rpx;
		animation: fadeIn 0.3s ease-in-out;
	}
}

// 弹窗样式
.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 9999;
}

.modal-content {
	width: 90%;
	max-width: 600rpx;
	max-height: 80vh;
	background: #fff;
	border-radius: 20rpx;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.modal-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx 40rpx;
	border-bottom: 1rpx solid #eee;
	background: #f8f9fa;
}

.modal-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
}

.close-btn {
	font-size: 48rpx;
	color: #999;
	width: 60rpx;
	height: 60rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	border-radius: 50%;
	background: #f0f0f0;
}

.modal-body {
	flex: 1;
	padding: 0 40rpx;
	max-height: 60vh;
}

.policy-section {
	margin: 30rpx 0;
}

.section-title {
	display: block;
	font-size: 28rpx;
	font-weight: 600;
	color: #333;
	margin-bottom: 20rpx;
}

.section-content {
	display: block;
	font-size: 26rpx;
	line-height: 1.6;
	color: #666;
	white-space: pre-line;
}

.modal-footer {
	padding: 30rpx 40rpx;
	border-top: 1rpx solid #eee;
	background: #f8f9fa;
}

.confirm-btn {
	width: 100%;
	height: 80rpx;
	background: #0066cc;
	color: #fff;
	border: none;
	border-radius: 40rpx;
	font-size: 30rpx;
	font-weight: 600;
}

.password-toggle {
	position: absolute;
	right: 30rpx;
	top: 50%;
	transform: translateY(-50%);
	z-index: 2;
	padding: 10rpx;
	border-radius: 50%;
	background-color: rgba(240, 240, 240, 0.8);
	display: flex;
	align-items: center;
	justify-content: center;
	width: 60rpx;
	height: 60rpx;
	cursor: pointer;
	transition: all 0.3s ease;

	&:hover {
		background-color: rgba(220, 220, 220, 0.9);
	}

	&:active {
		transform: translateY(-50%) scale(0.95);
	}
}

.eye-icon {
	font-size: 30rpx;
	color: #666;
}

// 网络提示样式
.network-tips {
	margin: 20rpx 0;
	padding: 0 40rpx;

	.tips-text {
		font-size: 24rpx;
		color: #ff6600;
		text-align: center;
		line-height: 1.4;
		display: block;
	}
}

// 动画效果
@keyframes shake {

	0%,
	100% {
		transform: translateX(0);
	}

	25% {
		transform: translateX(-5rpx);
	}

	75% {
		transform: translateX(5rpx);
	}
}

@keyframes fadeIn {
	0% {
		opacity: 0;
		transform: translateX(-50%) translateY(-10rpx);
	}

	100% {
		opacity: 1;
		transform: translateX(-50%) translateY(0);
	}
}
</style>