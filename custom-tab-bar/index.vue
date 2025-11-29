<template>
	<view class="custom-tab-bar" :style="{ paddingBottom: safeAreaBottom + 'px' }">
		<view class="tab-bar-container">
			<view v-for="(item, index) in tabList" :key="index" class="tab-item"
				:class="{ 'active': currentIndex === index }" @click="switchTab(index)">
				<view class="tab-icon">
					<image :src="item.icon" class="icon-img" :style="{ opacity: currentIndex === index ? 0 : 1 }" />
					<image :src="item.selectedIcon" class="icon-img icon-img-selected"
						:style="{ opacity: currentIndex === index ? 1 : 0 }" />
				</view>
				<text class="tab-text" :style="{ color: currentIndex === index ? activeColor : defaultColor }">
					{{ item.text }}
				</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'CustomTabBar',
		data() {
			return {
				activeColor: '#0081ff',
				defaultColor: '#7A7E83',
				currentIndex: 0,
				safeAreaBottom: 0, // 底部安全区域高度
				isSwitching: false, // 切换锁，防止重复更新
				tabList: [{
						pagePath: '/pages/violation/add-violation',
						text: '违规登记',
						icon: '/static/icons/add-violation.png',
						selectedIcon: '/static/icons/add-violation-active.png'
					},
					{
						pagePath: '/pages/violation/violation',
						text: '违规车辆',
						icon: '/static/违规记录.png',
						selectedIcon: '/static/icon-violation-nature.png'
					}
				]
			}
		},
		mounted() {
			try {
				this.getSafeAreaHeight();
				this.updateCurrentIndex();

				// 监听页面切换事件
				uni.$on('updateTabBar', this.handleTabBarUpdate);
			} catch (error) {}
		},

		beforeDestroy() {
			// 移除事件监听
			uni.$off('updateTabBar', this.handleTabBarUpdate);
		},

		// 监听页面显示事件
		onShow() {
			try {
				// 如果正在切换中，不要更新索引，避免冲突
				if (!this.isSwitching) {
					this.updateCurrentIndex();
				}
			} catch (error) {}
		},
		methods: {
			// 获取设备安全区域高度
			getSafeAreaHeight() {
				// 使用异步方法获取系统信息
				uni.getSystemInfo({
					success: (res) => {
						try {
							// 优先使用 safeAreaInsets
							if (res.safeAreaInsets && res.safeAreaInsets.bottom !== undefined) {
								this.safeAreaBottom = res.safeAreaInsets.bottom;
							}
							// 使用 safeArea 计算
							else if (res.safeArea) {
								this.safeAreaBottom = res.screenHeight - res.safeArea.bottom;
							}
							// 默认值
							else {
								this.safeAreaBottom = 0;
							}
						} catch (error) {
							this.safeAreaBottom = 0;
						}
					},
					fail: (error) => {
						// 兜底方案：使用同步API
						try {
							const systemInfo = uni.getSystemInfoSync();
							if (systemInfo.safeArea) {
								this.safeAreaBottom = systemInfo.screenHeight - systemInfo.safeArea.bottom;
							} else {
								this.safeAreaBottom = 0;
							}
						} catch (e) {
							this.safeAreaBottom = 0;
						}
					}
				});
			},

			// 切换tab
			switchTab(index) {
				try {
					if (this.currentIndex === index || this.isSwitching) return;

					// 检查索引和数据有效性
					if (!this.tabList || !Array.isArray(this.tabList) || index < 0 || index >= this.tabList.length) {
						return;
					}

					const tabItem = this.tabList[index];
					if (!tabItem || !tabItem.pagePath) {
						return;
					}

					// 设置切换锁
					this.isSwitching = true;
					const url = tabItem.pagePath;

					// 立即更新索引，避免延迟导致的闪烁
					this.currentIndex = index;

					uni.switchTab({
						url: url,
						success: () => {
							// 延迟释放锁，避免 onShow 立即触发更新
							setTimeout(() => {
								this.isSwitching = false;
							}, 300);
						},
						fail: (err) => {
							// 失败时恢复索引并释放锁
							this.updateCurrentIndex();
							this.isSwitching = false;
						}
					});
				} catch (error) {
					this.isSwitching = false;
				}
			},

			// 处理tabBar更新事件
			handleTabBarUpdate() {
				// 如果正在切换中，不要更新索引，避免冲突
				if (!this.isSwitching) {
					this.updateCurrentIndex();
				}
			},

			// 更新当前选中的tab索引
			updateCurrentIndex() {
				try {
					const pages = getCurrentPages();
					if (pages && pages.length > 0) {
						const currentPage = pages[pages.length - 1];
						if (currentPage && currentPage.route) {
							// 确保路由格式统一
							let currentRoute = currentPage.route;
							if (!currentRoute.startsWith('/')) {
								currentRoute = '/' + currentRoute;
							}
							// 查找当前页面对应的tab索引
							if (this.tabList && Array.isArray(this.tabList)) {
								const index = this.tabList.findIndex(item => {
									if (!item || !item.pagePath) return false;
									// 统一格式进行比较
									let itemPath = item.pagePath;
									if (!itemPath.startsWith('/')) {
										itemPath = '/' + itemPath;
									}
									return itemPath === currentRoute;
								});

								if (index !== -1 && index !== this.currentIndex) {
									this.currentIndex = index;
								} else if (index !== -1) {} else {}
							}
						}
					}
				} catch (error) {}
			}
		}
	}
</script>

<style scoped>
	.custom-tab-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: #ffffff;
		border-top: 1px solid #e5e5e5;
		z-index: 9999;
	}

	.tab-bar-container {
		display: flex;
		height: 60px;
		align-items: center;
	}

	.tab-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 6px 0;
	}

	.tab-item.active {
		/* 移除 transform，避免闪烁 */
	}

	.tab-icon {
		width: 28px;
		height: 28px;
		margin-bottom: 2px;
		position: relative;
	}

	.icon-img {
		width: 100%;
		height: 100%;
		display: block;
		/* 禁用图片的过渡效果，避免闪烁 */
		transition: none;
	}

	.icon-img-selected {
		position: absolute;
		top: 0;
		left: 0;
	}

	.tab-text {
		font-size: 10px;
		line-height: 1.1;
		text-align: center;
		font-weight: 400;
		/* 禁用颜色过渡，避免闪烁 */
		transition: none;
	}

	/* 适配不同屏幕密度 */
	@media (-webkit-device-pixel-ratio: 2) {
		.tab-text {
			font-size: 12px;
		}
	}

	@media (-webkit-device-pixel-ratio: 3) {
		.tab-text {
			font-size: 12px;
		}
	}

	/* 深色模式适配 */
	/* @media (prefers-color-scheme: dark) {
	.custom-tab-bar {
		background-color: #1a1a1a;
		border-top-color: #333;
	}
} */
</style>