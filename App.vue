<script>
	import Vue from 'vue'
	import store from './store/index.js'
	import AuthUtils from '@/utils/auth.js'

	export default {
		globalData: {
			selectedPlateNumber: null,  // 存储从车牌识别页面返回的车牌号码
		},
		
		onLaunch: function() {
			console.log('App Launch')
			
			// 延迟检查用户授权状态，确保应用完全初始化
			setTimeout(() => {
				this.initializeApp()
			}, 500)

			// 获取设备的状态栏信息和自定义顶栏信息
			this.updateCustomBarInfo().then((res) => {
				store.commit('$tStore', {
					name: 'vuex_status_bar_height',
					value: res.statusBarHeight
				})
				store.commit('$tStore', {
					name: 'vuex_custom_bar_height',
					value: res.customBarHeight
				})
			})
		},
		
		onShow: function() {
			console.log('App Show')
		},
		
		onHide: function() {
			console.log('App Hide')
		},
		
		onUnload: function() {
			console.log('App Unload')
		},

		methods: {
			/**
			 * 获取设备状态栏和自定义导航栏信息
			 */
			updateCustomBarInfo() {
				return new Promise((resolve) => {
					uni.getSystemInfo({
						success: (res) => {
							const statusBarHeight = res.statusBarHeight || 0;
							// 默认导航栏高度
							let customBarHeight = statusBarHeight + 44; // 44是默认导航栏内容高度

							// 针对不同平台调整
							// #ifdef MP-WEIXIN
							customBarHeight = statusBarHeight + 44;
							// #endif
							// #ifdef H5
							customBarHeight = 44;
							// #endif
							// #ifdef APP-PLUS
							customBarHeight = statusBarHeight + 44;
							// #endif
							resolve({
								statusBarHeight,
								customBarHeight
							});
						},
						fail: () => {
							// 失败时使用默认值
							resolve({
								statusBarHeight: 20,
								customBarHeight: 64
							});
						}
					});
				});
			},

			/**
			 * 初始化应用
			 */
			async initializeApp() {
				console.log('🚀 [App] 开始初始化应用');

				try {
					// 检查用户认证状态
					const isAuthenticated = await AuthUtils.initializeAuth();

					// 设置全局数据
					this.setGlobalData('appInitialized', true);
					this.setGlobalData('isAuthenticated', isAuthenticated);

					console.log('✅ [App] 应用初始化完成，用户认证状态:', isAuthenticated);

					// 根据认证状态进行页面跳转
					if (isAuthenticated) {
						// 用户已认证，跳转到主页面
						console.log('🔄 [App] 用户已认证，跳转到违停录入页面');
						uni.reLaunch({
							url: '/pages/violation/add-violation'
						});
					} else {
						// 用户未认证，跳转到登录页面
						console.log('🔄 [App] 用户未认证，跳转到登录页面');
						uni.reLaunch({
							url: '/pages/simple/login'
						});
					}

				} catch (error) {
					console.error('❌ [App] 应用初始化失败:', error);
					// 设置全局数据，跳转到登录页面
					this.setGlobalData('appInitialized', true);
					this.setGlobalData('isAuthenticated', false);
					
					console.log('🔄 [App] 初始化失败，跳转到登录页面');
					uni.reLaunch({
						url: '/pages/simple/login'
					});
				}
			},

			// 检查用户授权状态
			checkUserAuth() {
				try {
					const userInfo = uni.getStorageSync('userInfo')
					console.log('检查用户授权状态:', userInfo)

					if (userInfo && userInfo.isAuthorized && userInfo.phone) {
						// 用户已授权，保存到全局状态
						if (store) {
							store.commit('$tStore', {
								name: 'vuex_user_info',
								value: userInfo
							})
						}
						console.log('用户已授权，角色:', userInfo.role)

						// 设置全局标记，表示用户已授权
						this.setGlobalData('isAuthorized', true)
						this.setGlobalData('userInfo', userInfo)
						this.setGlobalData('currentRole', userInfo.role)

					} else {
						console.log('用户未授权，将显示登录页面')
						// 清除可能存在的无效用户信息
						uni.removeStorageSync('userInfo')

						// 设置全局标记，表示用户未授权
						this.setGlobalData('isAuthorized', false)
						
						// 跳转到登录页面
						uni.reLaunch({
							url: '/pages/simple/login'
						});
					}
				} catch (error) {
					console.error('检查授权状态失败:', error)
					// 发生错误时清除用户信息并跳转到登录页面
					uni.removeStorageSync('userInfo')
					this.setGlobalData('isAuthorized', false)
					uni.reLaunch({
						url: '/pages/simple/login'
					});
				}
			},

			/**
			 * 获取全局数据
			 * @param {string} key - 数据键名
			 */
			getGlobalData(key) {
				try {
					const app = getApp();
					if (app && app.globalData) {
						return app.globalData[key];
					}
				} catch (error) {
					console.warn('获取全局数据失败:', error);
				}
				return null;
			},

			// 安全地设置全局数据
			setGlobalData(key, value, retryCount = 0) {
				try {
					const app = getApp()
					if (app) {
						if (!app.globalData) {
							app.globalData = {}
						}
						app.globalData[key] = value
						console.log(`设置全局数据 ${key}:`, value)
					} else {
						console.warn('getApp() 返回空值，无法设置全局数据')
						// 如果 getApp() 返回空值，尝试重试（最多3次）
						if (retryCount < 3) {
							setTimeout(() => {
								this.setGlobalData(key, value, retryCount + 1)
							}, 200)
						}
					}
				} catch (error) {
					console.error('设置全局数据失败:', error)
					// 发生异常时也尝试重试
					if (retryCount < 3) {
						setTimeout(() => {
							this.setGlobalData(key, value, retryCount + 1)
						}, 200)
					}
				}
			}
		}
	}
</script>

<style lang="scss">
	/*每个页面公共css */
	/*colorui css */
	@import "static/css/common.css";
	@import "static/colorui/main.css";
	@import "static/colorui/icon.css";

	/* 只保留uView UI样式，移除TuniaoUI样式 */
	@import "@/uni_modules/uview-ui/index.scss";

	*,
	view,
	navigator {
		box-sizing: border-box;
	}

	.warp {
		background: #f5f5f5;
	}

	.car_park {
		width: 690rpx;
		border: 2rpx solid #ededed;
		border-radius: 10rpx;
		@include flex;
		justify-content: space-between;
		font-size: 28rpx;
		padding: 10rpx 24rpx;
	}

	.all_title_box {
		width: 100%;
		@include flex;
		justify-content: space-between;
		align-items: center;
		padding: 24rpx 0;

		.title {
			font-size: 32rpx;
			position: relative;
			padding-left: 34rpx;

			&::after {
				width: 24rpx;
				height: 6rpx;
				border-radius: 34rpx;
				background: #527bff;
				content: '';
				position: absolute;
				left: 0rpx;
				top: 10rpx;
			}
		}

		.time {
			@include flex;
			justify-content: space-between;
			align-items: center;

			.t {
				font-size: 28rpx;
				padding-right: 10rpx;
			}
		}
	}

	.lattice_box {
		width: 690rpx;
		@include flex;
		justify-content: space-between;
		flex-wrap: wrap;

		.item {
			width: 330rpx;
			height: 128rpx;
			border-radius: 10rpx;
			margin-top: 30rpx;
			padding: 20rpx 30rpx;
			position: relative;

			&.item_1 {
				background-color: rgba(253, 230, 231, 1);
				color: #CE413E;

				.lines {
					width: 100%;
					@include flex;
					justify-content: space-between;
					align-items: center;

					&:nth-child(1) {
						padding-bottom: 10rpx;
					}

					.title {
						font-size: 28rpx;
					}

					.price {
						font-size: 28rpx;
					}

					.titles {
						font-size: 24rpx;
					}

					.nums {
						font-size: 24rpx;
					}
				}
			}

			&.item_2 {
				background-color: rgba(209, 255, 233, 1);
				color: #33BF73;

				.lines {
					width: 100%;
					@include flex;
					justify-content: space-between;
					align-items: center;

					&:nth-child(1) {
						padding-bottom: 10rpx;
					}

					.title {
						font-size: 28rpx;
					}

					.price {
						font-size: 28rpx;
					}

					.titles {
						font-size: 24rpx;
					}

					.nums {
						font-size: 24rpx;
					}
				}
			}

			&.item_3 {
				background-color: rgba(190, 214, 249, 1);
				color: #3E7ACE;

				.title {
					display: block;
					font-size: 28rpx;
					padding-bottom: 10rpx;
				}

				.label {
					display: block;
					font-size: 24rpx;
				}

				.icon_box {
					width: 86rpx;
					height: 86rpx;
					line-height: 86rpx;
					border-radius: 86rpx;
					background: #3E7ACE;
					@include flex;
					justify-content: center;
					align-items: center;
					position: absolute;
					right: 24rpx;
					top: 50%;
					margin-top: -43rpx;
				}
			}

			&.item_4 {
				background-color: rgba(251, 223, 149, 1);
				color: #A17811;

				.title {
					display: block;
					font-size: 28rpx;
					padding-bottom: 10rpx;
				}

				.label {
					display: block;
					font-size: 24rpx;
				}

				.icon_box {
					width: 86rpx;
					height: 86rpx;
					line-height: 86rpx;
					border-radius: 86rpx;
					background: #A17811;
					@include flex;
					justify-content: center;
					align-items: center;
					position: absolute;
					right: 24rpx;
					top: 50%;
					margin-top: -43rpx;
				}
			}
		}
	}

	//表格
	$div-table-border-color: #ededed;
	$div-table-border-width: 1rpx;

	.div-table {
		display: table;
		width: 100%;
		height: 100%;
		border: $div-table-border-width solid $div-table-border-color;
		box-sizing: border-box;
		table-layout: fixed;
		position: relative;

		.celspan {
			display: table;
			width: 100%;
			height: 100%;

			.td {
				display: table-cell;
				border: none !important;
			}

			.td+.td {
				border-left: $div-table-border-width solid $div-table-border-color !important;
			}
		}

		.rowspan {
			display: table;
			width: 100%;
			height: 100%;

			.tr {
				display: table-row;
				border: none !important;
			}
		}

		&.fixed-thead {

			.tbody,
			.thead,
			.tr,
			.th,
			.td {
				display: block;
			}

			.tr,
			.th {
				&:after {
					content: '';
					display: block;
					visibility: hidden;
					clear: both;
					height: 0;
				}
			}

			.td {
				float: left;
				color: #333;
				font-size: 26rpx;
			}
		}

		.tr,
		.th {
			display: table-row;

			&+.tr,
			&+.th {

				.td,
				.th {
					border-top: $div-table-border-width solid $div-table-border-color;
					word-break: break-word;
				}
			}
		}

		.rowspan {

			.tr,
			.th {
				display: table-row;

				.td,
				.th {
					border: none;
				}

				&+.tr,
				&+.th {

					.td,
					.th {
						border-top: $div-table-border-width solid $div-table-border-color;
					}
				}
			}
		}
		.td {
			display: table-cell;
			vertical-align: middle;
			text-align: center;
			box-sizing: border-box;
			padding: 18rpx 20rpx;

			&.noPadding {
				padding: 0;
			}

			&+.td {
				border-left: $div-table-border-width solid $div-table-border-color;
			}
		}

		.tbody {
			display: table-row-group;
		}

		.thead {
			display: table-header-group;

			.tr,
			.th {

				.td,
				.th {
					border-bottom: $div-table-border-width solid $div-table-border-color;
				}
			}
		}

		.tfoot {
			display: table-footer-group;

			.tr,
			.th {

				.td,
				.th {
					border-top: $div-table-border-width solid $div-table-border-color;
				}
			}
		}

		.colgroup {
			display: table-column-group;
		}

		.col {
			display: table-column;
		}

		.caption {
			display: table-caption;
		}
	}
</style>