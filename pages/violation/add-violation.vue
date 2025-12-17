<template>
	<view class="container" @click="handlePageClick">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="navbar-content">
				<view class="navbar-center">
					<text class="navbar-title">违规登记</text>
				</view>
			</view>
		</view>

		<!-- 车场选择区域 -->
		<view class="parking-selector" :style="{ top: (statusBarHeight + 44) + 'px' }">
			<view class="parking-content" @click="showParkingSelector">
				<view class="parking-icon-container">
					<text class="parking-icon">🅿️</text>
				</view>
				<view class="parking-details">
					<text class="parking-name">{{ selectedParkingLot || '东北林业大学' }}</text>
					<text class="parking-desc">点击切换车场</text>
				</view>
				<view class="dropdown-container" @click.stop="showParkingSelector">
					<text class="dropdown-icon">▼</text>
				</view>
			</view>
			<view class="user-section">
				<view class="user-info-btn" @click.stop="toggleUserInfoDropdown">
					<view class="user-avatar">
						<text class="user-avatar-text">‍</text>
					</view>
					<view class="user-details">
						<text class="user-name">{{ currentUserName || '用户' }}</text>
						<text class="user-desc">点击查看详情</text>
					</view>
				</view>

				<!-- 用户信息下拉窗口 -->
				<view class="user-info-dropdown" v-show="showUserInfoDropdown">
					<view class="dropdown-content">
						<view class="user-info-header">
							<view class="user-avatar-large">
								<text class="user-avatar-text-large">{{ currentUserName.charAt(0) }}</text>
							</view>
							<view class="user-details-large">
								<text class="user-name-large">{{ currentUserName }}</text>
								<text class="user-role">{{ currentUserRole || '巡逻员' }}</text>
								<text class="user-workplace">{{ selectedParkingLot }}</text>
							</view>
						</view>
						<view class="dropdown-divider"></view>
						<view class="dropdown-actions">
							<view class="dropdown-action-item" @click="viewProfile">
								<text class="action-icon">👤</text>
								<text class="action-text">个人信息</text>
								<text class="action-arrow">></text>
							</view>

							<view class="dropdown-action-item logout-item" @click="logout">
								<text class="action-icon">🚪</text>
								<text class="action-text">退出登录</text>
								<text class="action-arrow">></text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		<!-- 页面内容 -->
		<view class="page-content" :style="{
			paddingTop: (statusBarHeight + 58 + (shouldShowBlacklistSection && formData.shouldBlacklist ? 28 : 48)) + 'px',
			paddingBottom: (shouldShowBlacklistSection && formData.shouldBlacklist && showTemplates) ? '180rpx' : '200rpx'
		}">
			<!-- 车牌信息区域 -->
			<view class="section-card">
				<view class="section-header">
					<view class="header-icon">
						<text class="icon-emoji">🚗</text>
					</view>
					<text class="section-title">车牌信息</text>
				</view>
				<view class="input-group">
					<!-- 车牌号输入区域 -->
					<view class="plate-input-section">
						<view class="color-car-button">
							<view class="blue-car"
								:class="{ selected: selectedColor === 'linear-gradient(to bottom, #216fef, #0c4fc5)' }">
								<view class="blue-car-text"
									@click="changeColor('linear-gradient(to bottom, #216fef, #0c4fc5)')">蓝牌
								</view>
							</view>
							<view class="yellow-car"
								:class="{ selected: selectedColor === 'linear-gradient(to bottom, #f8c401, #dba700)' }">
								<view class="yellow-car-text"
									@click="changeColor('linear-gradient(to bottom, #f8c401, #dba700)')">
									黄牌</view>
							</view>
							<view class="white-car"
								:class="{ selected: selectedColor === 'linear-gradient(to bottom, #f5f5f5, #e0e0e0)' }">
								<view class="white-car-text"
									@click="changeColor('linear-gradient(to bottom, #f5f5f5, #e0e0e0)')">白牌
								</view>
							</view>
							<view class="black-car"
								:class="{ selected: selectedColor === 'linear-gradient(to bottom, #525252, #1e1e1e)' }">
								<view class="black-car-text"
									@click="changeColor('linear-gradient(to bottom, #525252, #1e1e1e)')">黑牌
								</view>
							</view>
							<view class="green-car"
								:class="{ selected: selectedColor === 'linear-gradient(to bottom, #d0f1e4, #6ad390)' }">
								<view class="green-car-text"
									@click="changeColor('linear-gradient(to bottom, #d0f1e4, #6ad390)')">
									新能源</view>
							</view>
						</view>
						<u-gap height="1" bgColor="#bbb" marginBottom="10" marginTop="20"></u-gap>
						<!-- 车牌号码显示区域 - 点击显示键盘 -->
						<view class="plate-display-input" @click="showKeyboard">
							<view class="plate-display" :style="{ background: selectedColor, borderColor: 'white' }">
								<view class="plate-chars" :style="{ color: textColor }">
									<view v-for="(char, index) in plateChars" :key="index" class="plate-char-box">
										<text class="plate-char-text" :style="{ color: textColor }">
											{{ char || ' ' }}
										</text>
									</view>
								</view>
							</view>
						</view>

						<!-- 原有的搜索框和识别按钮的容器 - 保留作为备用 -->
						<view class="input-actions-container" style="margin-top: 20px;">
							<!-- 车牌识别按钮 -->
							<view class="recognition-btn-container">
								<view class="plate-recognition-btn" :class="{ 'disabled': isRecognitionDisabled }"
									@click="openPlateRecognition">
									<u-icon name="camera" size="24"
										:color="isRecognitionDisabled ? '#c0c4cc' : '#2979ff'"></u-icon>
									<text class="btn-label">{{ recognitionButtonText }}</text>
								</view>
							</view>
						</view>
					</view>

					<!--  白名单提示卡片 -->
					<view class="whitelist-warning-card" v-if="isWhitelistVehicle && whitelistInfo">
						<view class="warning-header">
							<text class="warning-icon">⚠️</text>
							<text class="warning-title">白名单车辆</text>
						</view>
						<view class="warning-content">
							<view class="warning-row">
								<text class="warning-label">车牌号：</text>
								<text class="warning-value">{{ whitelistInfo.plateNumber || formData.plateNumber
								}}</text>
							</view>
							<view class="warning-row" v-if="whitelistInfo.ownerName">
								<text class="warning-label">车主：</text>
								<text class="warning-value">{{ whitelistInfo.ownerName }}</text>
							</view>
							<view class="warning-row" v-if="whitelistInfo.ownerPhone">
								<text class="warning-label">电话：</text>
								<text class="warning-value">{{ whitelistInfo.ownerPhone }}</text>
							</view>
							<view class="warning-row" v-if="whitelistInfo.remark">
								<text class="warning-label">备注：</text>
								<text class="warning-value">{{ whitelistInfo.remark }}</text>
							</view>
						</view>
						<view class="warning-message">
							<text class="message-text">此车辆已加入白名单，请谨慎处理违规记录</text>
						</view>
						<!--  违规记录列表展示 -->
						<view v-if="ownerInfo.violationRecords && ownerInfo.violationRecords.length > 0"
							class="violation-records-section">
							<view class="violation-records-header">
								<text class="records-title">历史违规记录</text>
								<text class="records-count">{{ ownerInfo.violationRecords.length }}条</text>
								<view class="expand-toggle" @click="toggleViolationRecords">
									<text class="toggle-text">{{ showViolationRecords ? '收起' : '展开' }}</text>
									<u-icon :name="showViolationRecords ? 'arrow-up' : 'arrow-down'" size="16"
										color="#666"></u-icon>
								</view>
							</view>

							<view v-if="showViolationRecords" class="violation-records-list">
								<view v-for="(record, index) in ownerInfo.violationRecords" :key="index"
									class="violation-record-item"
									@click="navigateToSearch(record.violationType, 'violation')">
									<view class="record-header" v-if="getViolationStatusText(record.status)">
										<view class="record-status"
											:class="['record-status', getViolationStatusClass(record.status)]">
											<text class="status-text">{{ getViolationStatusText(record.status) }}</text>
										</view>
									</view>

									<view class="record-content">
										<!-- 违规类型 - 特殊样式 -->
										<view class="record-info-row violation-type-row">
											<text class="info-icon violation-type-icon">⚠️</text>
											<view class="info-content">
												<text class="info-label">违规类型：</text>
												<view class="violation-type-tag"
													:class="[getViolationTypeClass(record.violationType)]">
													<text class="violation-type-text">{{ record.violationType || '未知类型'
													}}</text>
												</view>
											</view>
										</view>

										<!-- 违规位置 -->
										<view class="record-info-row" v-if="record.location">
											<text class="info-icon">📍</text>
											<view class="info-content">
												<text class="info-label">违规位置：</text>
												<view class="location-tag">
													<text class="location-text">{{ record.location }}</text>
												</view>
											</view>
										</view>

										<!-- 违规描述 - 特殊样式 -->
										<view class="record-info-row description-row" v-if="record.description">
											<text class="info-icon">📝</text>
											<view class="info-content">
												<text class="info-label">违规描述：</text>
												<view class="description-content">
													<text class="description-text">{{ record.description }}</text>
												</view>
											</view>
										</view>

										<!-- 违规时间 -->
										<view class="record-info-row time-row">
											<text class="info-icon">🕐</text>
											<view class="info-content">
												<text class="info-label">违规时间：</text>
												<view class="time-badge">
													<text class="time-text">{{ formatViolationDate(record.createdAt)
													}}</text>
												</view>
											</view>
										</view>
									</view>
								</view>
							</view>
						</view>

						<!--  优化：无违规记录提示 - 只要有业主信息且无违规记录就显示 -->
						<view v-else class="no-violation-tip">
							<text class="tip-icon">✅</text>
							<text class="tip-text">该车主暂无违规记录</text>
						</view>
					</view>

					<!-- 车主信息显示 -->
					<view class="owner-info-card" v-if="ownerInfo && !isWhitelistVehicle">
						<view class="owner-header">
							<view class="owner-avatar">
								<text class="avatar-text">{{ ownerInfo.name ? ownerInfo.name.charAt(0) : '车' }}</text>
							</view>
							<view class="owner-basic">
								<view class="owner-name">
									<text class="name-text" @click="navigateToSearch(ownerInfo.name, 'name')">{{
										ownerInfo.name || '未知车主' }}</text>
									<!-- 车辆类型标记 -->
									<view class="owner-vehicle-tag monthly-tag" v-if="ownerInfo.isMonthlyTicket && !ownerInfo.hasVisitorReservation">
										<text class="tag-text">月票车</text>
									</view>
									<view class="owner-vehicle-tag visitor-tag" v-else-if="ownerInfo.hasVisitorReservation">
										<text class="tag-text">访客</text>
									</view>
								</view>
								<view class="owner-phone" @click="makePhoneCall(ownerInfo.phone)"
									v-if="ownerInfo.phone">
									<text class="phone-icon">📞</text>
									<text class="phone-text" @click="navigateToSearch(ownerInfo.phone, 'phone')">{{
										ownerInfo.phone }}</text>
									<text class="call-hint">点击拨打</text>
								</view>
							</view>
						</view>

						<view class="owner-details">
							<!-- 车位信息 -->
							<view class="detail-row" v-if="ownerInfo.customerRoomNumber">
								<text class="detail-icon">📝</text>
								<text class="detail-label">备注：</text>
								<text class="detail-value">{{ ownerInfo.customerRoomNumber }}</text>
							</view>

							<!-- 学院/部门信息 - 只在非访客时显示 -->
							<view class="detail-row" v-if="ownerInfo.address && !ownerInfo.hasVisitorReservation">
								<text class="detail-icon">🏢</text>
								<text class="detail-label">{{ departmentLabel }}：</text>
								<text class="detail-value">{{ ownerInfo.address }}</text>
							</view>

							<!-- 人员类别 - 只在非访客时显示 -->
							<view class="detail-row" v-if="ownerInfo.ownerCategory && !ownerInfo.hasVisitorReservation">
								<text class="detail-icon">👥</text>
								<text class="detail-label">人员类别：</text>
								<text class="detail-value">{{ ownerInfo.ownerCategory }}</text>
							</view>

							<!-- 月票类型 -->
							<view class="detail-row" v-if="ownerInfo.ticketName && !ownerInfo.hasVisitorReservation">
								<text class="detail-icon">🎫</text>
								<text class="detail-label">月票类型：</text>
								<text class="detail-value monthly-ticket">{{ ownerInfo.ticketName }}</text>
							</view>
						</view>

						<!-- 访客预约信息 -->
						<view v-if="ownerInfo.hasVisitorReservation && ownerInfo.visitorReservations && ownerInfo.visitorReservations.length > 0"
							class="visitor-reservation-section">
							<view class="section-title">
								<text class="title-icon">🚗</text>
								<text class="title-text">访客车辆信息</text>
							</view>

							<view v-for="(reservation, index) in ownerInfo.visitorReservations" :key="index" 
								class="visitor-reservation-card">
								<!-- 访客姓名 -->
								<view class="visitor-detail-row" v-if="reservation.visitorName">
									<text class="visitor-icon">👤</text>
									<text class="visitor-label">访客姓名：</text>
									<text class="visitor-value">{{ reservation.visitorName }}</text>
								</view>

								<!-- 访客手机 -->
								<view class="visitor-detail-row" v-if="reservation.visitorPhone">
									<text class="visitor-icon">📱</text>
									<text class="visitor-label">手机号码：</text>
									<text class="visitor-value">{{ reservation.visitorPhone }}</text>
								</view>

								<!-- 访客类型 -->
								<view class="visitor-detail-row" v-if="reservation.vipTypeName">
									<text class="visitor-icon">🎫</text>
									<text class="visitor-label">访客类型：</text>
									<text class="visitor-value visitor-type">{{ reservation.vipTypeName }}</text>
								</view>

								<!-- 预约开始时间 -->
								<view class="visitor-detail-row" v-if="reservation.gatewayTransitBeginTime">
									<text class="visitor-icon">⏰</text>
									<text class="visitor-label">开始时间：</text>
									<text class="visitor-value visitor-time">{{ formatVisitorTime(reservation.gatewayTransitBeginTime) }}</text>
								</view>

								<!-- 预约结束时间 -->
								<view class="visitor-detail-row" v-if="reservation.gatewayTransitEndTime">
									<text class="visitor-icon">⏰</text>
									<text class="visitor-label">结束时间：</text>
									<text class="visitor-value visitor-time">{{ formatVisitorTime(reservation.gatewayTransitEndTime) }}</text>
								</view>

								<!-- 被访人 -->
								<view class="visitor-detail-row" v-if="reservation.passName">
									<text class="visitor-icon">👨‍💼</text>
									<text class="visitor-label">被访人：</text>
									<text class="visitor-value">{{ reservation.passName }}</text>
								</view>

								<!-- 被访部门 -->
								<view class="visitor-detail-row" v-if="reservation.passDep">
									<text class="visitor-icon">🏢</text>
									<text class="visitor-label">被访部门：</text>
									<text class="visitor-value">{{ reservation.passDep }}</text>
								</view>
							</view>
						</view>

						<!--  违规记录列表展示 -->
						<view v-if="ownerInfo.violationRecords && ownerInfo.violationRecords.length > 0"
							class="violation-records-section">
							<view class="violation-records-header">
								<text class="records-title">历史违规记录</text>
								<text class="records-count">{{ ownerInfo.violationRecords.length }}条</text>
								<view class="expand-toggle" @click="toggleViolationRecords">
									<text class="toggle-text">{{ showViolationRecords ? '收起' : '展开' }}</text>
									<u-icon :name="showViolationRecords ? 'arrow-up' : 'arrow-down'" size="16"
										color="#666"></u-icon>
								</view>
							</view>

							<view v-if="showViolationRecords" class="violation-records-list">
								<view v-for="(record, index) in ownerInfo.violationRecords" :key="index"
									class="violation-record-item"
									@click="navigateToSearch(record.violationType, 'violation')">
									<view class="record-header" v-if="getViolationStatusText(record.status)">
										<view class="record-status"
											:class="['record-status', getViolationStatusClass(record.status)]">
											<text class="status-text">{{ getViolationStatusText(record.status) }}</text>
										</view>
									</view>

									<view class="record-content">
										<!-- 违规类型 - 特殊样式 -->
										<view class="record-info-row violation-type-row">
											<text class="info-icon violation-type-icon">⚠️</text>
											<view class="info-content">
												<text class="info-label">违规类型：</text>
												<view class="violation-type-tag"
													:class="[getViolationTypeClass(record.violationType)]">
													<text class="violation-type-text">{{ record.violationType || '未知类型'
													}}</text>
												</view>
											</view>
										</view>

										<!-- 违规位置 -->
										<view class="record-info-row" v-if="record.location">
											<text class="info-icon">📍</text>
											<view class="info-content">
												<text class="info-label">违规位置：</text>
												<view class="location-tag">
													<text class="location-text">{{ record.location }}</text>
												</view>
											</view>
										</view>

										<!-- 违规描述 - 特殊样式 -->
										<view class="record-info-row description-row" v-if="record.description">
											<text class="info-icon">📝</text>
											<view class="info-content">
												<text class="info-label">违规描述：</text>
												<view class="description-content">
													<text class="description-text">{{ record.description }}</text>
												</view>
											</view>
										</view>

										<!-- 违规时间 -->
										<view class="record-info-row time-row">
											<text class="info-icon">🕐</text>
											<view class="info-content">
												<text class="info-label">违规时间：</text>
												<view class="time-badge">
													<text class="time-text">{{ formatViolationDate(record.createdAt)
													}}</text>
												</view>
											</view>
										</view>
									</view>
								</view>
							</view>
						</view>

						<!--  优化：无违规记录提示 - 只要有业主信息且无违规记录就显示 -->
						<view v-else class="no-violation-tip">
							<text class="tip-icon">✅</text>
							<text class="tip-text">该车主暂无违规记录</text>
						</view>
					</view>
				</view>
			</view>



			<!-- 违规类型区域 -->
			<view class="section-card violation-type-section">
				<view class="section-header">
					<view class="header-icon">
						<text class="icon-emoji">⚠️</text>
					</view>
					<text class="section-title">违规类型</text>
				</view>
				<view class="violation-types">
					<!-- 已选择的类型显示 -->
					<view class="selected-type" v-if="selectedTypeInfo">
						<view class="selected-display">
							<text class="selected-icon">{{ parseIconToEmoji(selectedTypeInfo.icon) }}</text>
							<text class="selected-name">{{ selectedTypeInfo.label || selectedTypeInfo.name }}</text>
							<text class="selected-check">✓</text>
						</view>
						<view class="divider"></view>
					</view>

					<!-- 搜索框 -->
					<view class="search-section" v-if="uiState.isSearching">
						<view class="search-container">
							<view class="search-box">
								<text class="search-icon">🔍</text>
								<input class="search-input" v-model="uiState.searchKeyword" placeholder="搜索违规类型..."
									@input="onSearchInput" focus />
								<text class="search-clear" v-if="uiState.searchKeyword" @click="clearSearch">×</text>
							</view>
							<view class="search-cancel" @click="cancelSearch">
								<text class="cancel-text">取消</text>
							</view>
						</view>
					</view>

					<!-- 搜索结果 -->
					<view class="search-results" v-if="uiState.isSearching && uiState.searchKeyword">
						<view class="section-label">搜索结果</view>
						<view class="type-tags" v-if="searchResults.length > 0">
							<view class="type-tag" v-for="(type, index) in searchResults" :key="index"
								@click="selectType(type)">
								<text class="tag-icon">{{ parseIconToEmoji(type.icon) }}</text>
								<text class="tag-text">{{ type.label || type.name }}</text>
							</view>
						</view>
						<!-- 无搜索结果提示 -->
						<view class="no-results" v-if="searchResults.length === 0">
							<text class="no-results-icon">🔍</text>
							<text class="no-results-text">未找到匹配的违规类型</text>
							<text class="no-results-tip">试试其他关键词或选择下方常用类型</text>
						</view>
						<view class="divider" v-if="searchResults.length > 0"></view>
					</view>

					<!-- 常用类型 -->
					<view class="common-section">
						<view class="section-label">{{ selectedTypeInfo ? '其他常用类型' : '常用类型' }}</view>
						<view class="type-tags">
							<view class="type-tag" v-for="(type, index) in displayCommonTypes" :key="index"
								@click="selectType(type)">
								<text class="tag-icon">{{ parseIconToEmoji(type.icon) }}</text>
								<text class="tag-text">{{ type.label || type.name }}</text>
							</view>
						</view>
					</view>
					<!-- 自定义违规类型输入 -->
					<view class="custom-type-input" v-if="formData.violationType === 'other'">
						<input class="custom-input" v-model="formData.customType" placeholder="请输入自定义违规类型"
							maxlength="50" />
					</view>
				</view>
			</view>

			<!-- 违规位置区域 -->
			<view class="section-card">
				<view class="section-header">
					<view class="header-icon">
						<text class="icon-emoji">📍</text>
					</view>
					<text class="section-title">违规位置</text>
				</view>

				<!-- 位置输入区域 -->
				<view class="location-input-group">
					<view class="location-row">
						<!-- 输入框容器 -->
						<view class="location-wrapper">
							<input class="location-input" v-model="formData.location" placeholder="请输入或选择违规位置"
								@focus="showLocationDropdown = true" @blur="handleLocationBlur"
								@input="handleLocationInput" />
							<view class="clear-location-btn" v-if="formData.location" @click="clearLocation">
								<u-icon name="close-circle-fill" size="22" color="#c8c9cc"></u-icon>
							</view>
							<view class="dropdown-icon" @click="toggleLocationDropdown">
								<u-icon name="arrow-down" size="20" color="#909399"></u-icon>
							</view>
						</view>

						<!-- 定位按钮 -->
						<view class="location-btn" @click="getCurrentLocation">
							<u-icon name="map-fill" size="18" color="#ffffff"></u-icon>
							<text class="location-btn-text">定位</text>
						</view>
					</view>

					<!-- 下拉选项列表 -->
					<view class="location-dropdown" v-if="showLocationDropdown && filteredLocationOptions.length > 0">
						<view class="dropdown-item" v-for="(item, index) in filteredLocationOptions" :key="index"
							@click="selectLocation(item)">
							{{ item.label }}
						</view>
					</view>
				</view>
			</view>

			<!-- 现场取证区域 -->
			<view class="section-card">
				<view class="section-header">
					<view class="header-icon">
						<text class="icon-emoji">📷</text>
					</view>
					<text class="section-title">现场取证</text>
					<view class="required-badge">必填</view>
				</view>
				<view class="evidence-section">
					<!-- 照片上传 -->
					<view class="photo-upload">
						<view class="upload-header">
							<text class="upload-title">拍照取证</text>
							<text class="photo-count">{{ formData.photos.length }}/6</text>
						</view>
						<view class="photo-grid">
							<view class="photo-item" v-for="(photo, index) in formData.photos" :key="index"
								@click="previewPhoto(index)">
								<image :src="photo" mode="aspectFill" class="photo-image"></image>
								<view class="photo-delete" @click.stop="deletePhoto(index)">
									<text class="icon-emoji">×</text>
								</view>
							</view>
							<view class="photo-add" v-if="formData.photos.length < 6" @click="takePhoto">
								<text class="icon-emoji add-icon">➕</text>
								<text class="add-text">拍照</text>
							</view>
						</view>
					</view>


				</view>
			</view>

			<!-- 违规描述区域 -->
			<view class="section-card">
				<view class="section-header">
					<view class="header-icon">
						<text class="icon-emoji">📝</text>
					</view>
					<text class="section-title">违规描述</text>
					<text class="section-subtitle">（自动从违规类型获取）</text>
				</view>
				<view class="description-input">
					<textarea class="description-textarea" v-model="formData.description"
						placeholder="请先选择违规类型，描述将自动填充..." maxlength="200" :show-word-limit="true"
						:auto-height="true"></textarea>
				</view>
			</view>
			<!-- 提交按钮 -->
			<view class="submit-section">
				<view class="submit-btn" :class="{ disabled: !canSubmit }" @click="submitViolation">
					<text>{{ submitting ? '提交中...' : '提交违规记录' }}</text>
				</view>
				<!-- 已存在提醒记录：使用 uView Popup 居中弹出 -->
				<u-popup :show="showReminderConfirmPanel" mode="center" :round="12" @close="cancelReminderConfirm">
					<view class="popup-container">
						<view class="popup-title"><text class="title-icon">⚠️</text>已存在提醒记录</view>
						<view class="reminder-confirm-content">
							<text class="confirm-desc">该车辆已有提醒记录：</text>
							<view class="records-panel">
								<view class="record-item" v-for="(item, idx) in paginatedReminderList" :key="idx"
									@click="toggleReminderExpand(idx)">
									<view class="record-content">
										<view class="record-row top-row">
											<text class="plate-number"
												:class="isNewEnergyPlate(item.plateNumber) ? 'green-plate' : 'blue-plate'">{{
													item.plateNumber }}</text>
											<text class="time-text">{{ formatViolationDate(item.time) }}</text>
											<u-icon :name="item._expanded ? 'arrow-up' : 'arrow-down'" size="16"
												color="#909399"></u-icon>
										</view>
										<view v-if="item._expanded">
											<view class="record-row" style="margin-top: 10rpx;">
												<text class="type-icon"> 违规类型：</text>
												<text class="type-badge">{{ item.type || '未知类型' }}</text>
											</view>
											<view class="record-row" style="margin-top: 10rpx;">
												<text class="location-icon"> 违规位置：</text>
												<text class="location-text">{{ item.location || '未填写位置' }}</text>
											</view>
										</view>
									</view>
								</view>
								<view class="pagination-bar">
									<u-button
										:customStyle="{ width: '30%', height: '64rpx', borderRadius: '999rpx', background: '#fff', border: '2rpx solid #dcdfe6', color: '#606266' }"
										@click.stop="prevReminderPage" :disabled="reminderPage === 1">上一页</u-button>
									<text class="page-text">{{ reminderPage }} / {{ reminderTotalPages }}</text>
									<u-button
										:customStyle="{ width: '30%', height: '64rpx', borderRadius: '999rpx', background: '#fff', border: '2rpx solid #dcdfe6', color: '#606266' }"
										@click.stop="nextReminderPage"
										:disabled="reminderPage === reminderTotalPages">下一页</u-button>
								</view>
							</view>
							<text class="confirm-question">是否继续发送新的违规提醒？</text>
						</view>
						<view class="inline-confirm-actions">
							<u-button
								:customStyle="{ width: '48%', background: '#ffffff', border: '2rpx solid #dcdfe6', color: '#606266', borderRadius: '999rpx', height: '84rpx', fontSize: '28rpx' }"
								@click="cancelReminderConfirm">否</u-button>
							<u-button
								:customStyle="{ width: '48%', background: 'linear-gradient(135deg, #ff7a59 0%, #ff4d4f 100%)', border: 'none', color: '#ffffff', borderRadius: '999rpx', height: '84rpx', fontSize: '30rpx', boxShadow: '0 8rpx 20rpx rgba(255,77,79,0.3)' }"
								@click="confirmSendReminder">是</u-button>
						</view>
					</view>
				</u-popup>
			</view>
		</view>

		<!-- 弹出式车牌键盘 -->
		<view v-if="showCustomKeyboard" class="keyboard-overlay" @click="hideKeyboard">
			<view class="custom-plate-keyboard" @click.stop>
				<!-- 车牌号码显示区域 -->
				<view class="plate-display" :style="{ background: selectedColor, borderColor: borderBgColor }">
					<view class="plate-chars" :style="{ color: textColor }">
						<view v-for="(char, index) in plateChars" :key="index" class="plate-char-box"
							:class="{ active: currentIndex === index }" @click="selectCharPosition(index)">
							<text class="plate-char-text" :style="{ color: textColor }">
								{{ char || ' ' }}
							</text>
						</view>
					</view>
				</view>

				<!-- 键盘部分 -->
				<view class="keyboard-section">

					<!-- 省份键盘 -->
					<view v-if="showProvinceKeyboard" class="province-grid">
						<view v-for="(province, index) in provinces" :key="province" class="province-key"
							@click="inputChar(province)">
							<text class="key-text">{{ province }}</text>
						</view>
						<!-- ABC按钮 -->
						<view class="province-key abc-key" @click="switchToLetters">
							<text class="key-text">ABC</text>
						</view>
					</view>

					<!-- 字母数字混合键盘 -->
					<view v-else class="keyboard-rows">
						<!-- 数字行 -->
						<view class="keyboard-row number-row">
							<view v-for="num in numbers" :key="num" class="keyboard-key number-key"
								@click="inputChar(num)">
								<text class="key-text">{{ num }}</text>
							</view>
						</view>

						<!-- 字母行1 -->
						<view class="keyboard-row letter-row">
							<view v-for="letter in letters.slice(0, 10)" :key="letter" class="keyboard-key letter-key"
								:class="{ disabled: isLetterDisabled(letter) }" @click="inputChar(letter)">
								<text class="key-text">{{ letter }}</text>
							</view>
						</view>

						<!-- 字母行2 -->
						<view class="keyboard-row letter-row">
							<view class="keyboard-key special-key province-switch" @click="switchToProvince">
								<text class="key-text">省份</text>
							</view>
							<view v-for="letter in letters.slice(10, 19)" :key="letter" class="keyboard-key letter-key"
								:class="{ disabled: isLetterDisabled(letter) }" @click="inputChar(letter)">
								<text class="key-text">{{ letter }}</text>
							</view>
						</view>

						<!-- 字母行3 -->
						<view class="keyboard-row letter-row">
							<view v-for="letter in letters.slice(19)" :key="letter" class="keyboard-key letter-key"
								:class="{ disabled: isLetterDisabled(letter) }" @click="inputChar(letter)">
								<text class="key-text">{{ letter }}</text>
							</view>
							<!-- 退格按钮 -->
							<view class="keyboard-key backspace-key"
								:class="{ disabled: formData.plateNumber.length === 0 }" @click="deleteChar">
								<text class="key-text">⌫</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 车牌识别弹窗 -->
		<view class="scan-modal" v-if="showScanModal" @click="closeScanModal">
			<view class="scan-content" @click.stop>
				<view class="scan-header">
					<text class="scan-title">车牌识别</text>
					<view class="scan-close" @click="closeScanModal">
						<text class="icon-emoji">×</text>
					</view>
				</view>

				<!-- 摄像头识别界面 -->
				<view class="camera-container" v-if="showCamera">
					<camera device-position="back" flash="off" @error="handleCameraError" class="camera-preview"
						ref="camera">
						<!-- 车牌框选区域 -->
						<view class="plate-frame">
							<view class="frame-corner tl"></view>
							<view class="frame-corner tr"></view>
							<view class="frame-corner bl"></view>
							<view class="frame-corner br"></view>
							<text class="frame-text">自动识别中，请保持稳定</text>
						</view>

						<!-- 自动识别状态指示器 -->
						<view class="auto-status">
							<view class="status-dot"></view>
							<text class="status-text">自动识别: {{ autoRecognizeCount }}次</text>
						</view>
					</camera>

					<!-- 摄像头控制按钮 -->
					<view class="camera-controls">
						<!-- 手动拍照按钮 -->
						<button @tap="capturePhoto" :disabled="isRecognizing" class="capture-btn">
							<text class="camera-icon">📷</text>
							{{ isRecognizing ? '识别中...' : '手动拍照' }}
						</button>

						<button @tap="closeCamera" class="close-btn">
							<text class="close-icon">❌</text>
							关闭摄像头
						</button>
					</view>

					<!-- 加载提示 -->
					<view class="loading-overlay" v-if="isRecognizing">
						<view class="loading-content">
							<text class="loading-text">正在识别车牌...</text>
						</view>
					</view>
				</view>

				<!-- 功能选择界面 -->
				<view class="function-buttons" v-if="!showCamera">
					<view class="scan-area">
						<view class="scan-frame">
							<view class="scan-line"></view>
						</view>
						<text class="scan-tip">选择识别方式</text>
					</view>

					<view class="scan-result" v-if="scanResult">
						<text class="result-label">识别结果：</text>
						<text class="result-text">{{ scanResult }}</text>
					</view>

					<view class="scan-actions">
						<view class="scan-action-btn primary" @click="startCamera">
							<text> 摄像头识别</text>
						</view>
						<view class="scan-action-btn" @click="chooseFromAlbum">
							<text>️ 相册识别</text>
						</view>
						<view class="scan-action-btn primary" @click="useScanResult" v-if="scanResult">
							<text>使用结果</text>
						</view>
					</view>
				</view>
			</view>
		</view>


		<!-- 车牌识别弹窗 - 全屏显示 -->
		<view class="plate-recognition-fullscreen" v-if="showPlateRecognitionModal" @click="closePlateRecognition">
			<!-- 摄像头识别界面 -->
			<view class="camera-container-fullscreen" v-if="showCamera" @click.stop>
				<camera device-position="back" flash="off" @error="handleCameraError" class="camera-preview"
					ref="camera">
					<!-- 车牌框选区域 -->
					<view class="plate-frame">
						<view class="frame-corner tl"></view>
						<view class="frame-corner tr"></view>
						<view class="frame-corner bl"></view>
						<view class="frame-corner br"></view>
						<text class="frame-text">请将车牌对准框内</text>
					</view>

					<!-- 自动识别状态指示器 -->
					<view class="auto-status" v-if="autoRecognize">
						<view class="status-dot"></view>
						<text class="status-text">自动识别: {{ autoRecognizeCount }}次</text>
					</view>

					<!-- 关闭摄像头按钮 -->
					<view class="control-btn close-btn" @click="closeCamera">
						<u-icon name="close" size="32" color="#fff"></u-icon>
					</view>
				</camera>

				<!-- 摄像头控制按钮 -->
				<view class="camera-controls">
					<!-- 手动拍照按钮 -->
					<view class="control-btn capture-btn" @click="capturePhoto" :class="{ disabled: isRecognizing }">
						<u-icon name="camera" size="24" color="#fff"></u-icon>
						<text>{{ isRecognizing ? '识别中...' : '拍照识别' }}</text>
					</view>

					<!-- 自动识别开关 -->
					<view class="control-btn auto-btn" @click="toggleAutoRecognize" :class="{ active: autoRecognize }">
						<u-icon name="play-circle" size="24" color="#fff" v-if="!autoRecognize"></u-icon>
						<u-icon name="pause-circle" size="24" color="#fff" v-if="autoRecognize"></u-icon>
						<text>{{ autoRecognize ? '停止自动' : '自动识别' }}</text>
					</view>
				</view>
			</view>

			<!-- 识别选择界面 -->
			<view class="recognition-options" v-if="!showCamera && !recognitionResult" @click.stop>
				<view class="option-item" @click="openCamera">
					<view class="option-icon">
						<u-icon name="camera" size="40" color="#2979ff"></u-icon>
					</view>
					<view class="option-content">
						<text class="option-title">摄像头识别</text>
						<text class="option-desc">实时扫描车牌号码</text>
					</view>
				</view>

				<view class="option-item" @click="chooseFromAlbum">
					<view class="option-icon">
						<u-icon name="photo" size="40" color="#19be6b"></u-icon>
					</view>
					<view class="option-content">
						<text class="option-title">相册选择</text>
						<text class="option-desc">从相册选择车牌图片</text>
					</view>
				</view>
			</view>

			<!-- 识别结果显示 -->
			<view class="recognition-result" v-if="recognitionResult" @click.stop>
				<view class="result-header">
					<u-icon name="checkmark-circle" size="40" color="#19be6b"></u-icon>
					<text class="result-title">识别成功</text>
				</view>
				<view class="result-plate">
					<text class="plate-text">{{ recognitionResult.plateNumber }}</text>
					<text class="plate-color" v-if="recognitionResult.color">{{ recognitionResult.color }}</text>
					<text class="plate-confidence" v-if="recognitionResult.confidence">置信度: {{
						recognitionResult.confidence }}%</text>
				</view>
				<view class="result-actions">
					<view class="action-btn use-btn" @click="useRecognitionResult">
						<text>使用此结果</text>
					</view>
					<view class="action-btn retry-btn" @click="retryRecognition">
						<text>重新识别</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 车牌搜索结果列表 -->
		<view class="search-results-section" v-if="showPlateSearchResults">
			<view class="search-section-header">
				<view class="search-title-row">
					<text class="search-section-title"> 车牌搜索结果</text>
					<view class="search-close-btn" @click="closePlateSearchResults">
						<u-icon name="close" size="16" color="#666"></u-icon>
					</view>
				</view>
				<view class="search-input-container">
					<input class="search-input" v-model="plateSearchKeyword" placeholder="请输入车牌号码"
						@input="onPlateSearchInput" @confirm="searchPlates" :focus="plateFocused" />
					<view class="search-btn" @click="searchPlates">
						<u-icon name="search" size="18" color="#2979ff"></u-icon>
					</view>
				</view>
			</view>

			<view class="search-results-content" v-if="groupedSuggestions.length > 0">
				<view class="result-summary">
					<text class="result-count">找到 {{ totalPlateCount }} 个车牌，{{ groupedSuggestions.length }} 个车主</text>
				</view>

				<!-- 车主分组列表 -->
				<view class="owner-groups-list">
					<view class="owner-group-item" v-for="(group, groupIndex) in groupedSuggestions" :key="groupIndex">
						<!-- 车主信息卡片 -->
						<view class="owner-info-card">
							<view class="owner-basic-info">
								<view class="owner-avatar">
									<text class="avatar-text"></text>
								</view>
								<view class="owner-details-info">
									<view class="owner-name-section">
										<text class="owner-name-text">{{ group.ownerName || '未知车主' }}</text>
										<view class="vehicle-type-tag" v-if="group.dataSource === '月票车'">
											<text class="tag-label">月票车</text>
										</view>
									</view>
									<!-- 车位信息 -->
									<view class="parking-info" v-if="getParkingSpots(group).length > 0">
										<text class="parking-label">️ 车位：</text>
										<text class="parking-spots-text">
											{{ getParkingSpots(group).join('、') }}
										</text>
									</view>
								</view>
							</view>

							<!-- 车牌折叠区域 -->
							<view class="plates-section">
								<view class="plates-header" @click="togglePlatesExpanded(groupIndex)">
									<text class="plates-count">车牌数量：{{ group.plates.length }}</text>
									<view class="expand-icon"
										:class="{ 'expanded': expandedGroups.includes(groupIndex) }">
										<u-icon name="arrow-down" size="14" color="#666"></u-icon>
									</view>
								</view>

								<!-- 车牌列表 - 可折叠 -->
								<view class="plates-list"
									v-if="expandedGroups.includes(groupIndex) || group.plates.length <= 3">
									<view class="plate-item" v-for="(plate, plateIndex) in group.plates"
										:key="plateIndex" @click="selectPlateFromGroup(plate, group)">
										<view class="plate-number-display"
											:class="isNewEnergyPlate(plate.plateNumber) ? 'green-plate' : 'blue-plate'">
											{{ plate.plateNumber }}
										</view>
									</view>
								</view>

								<!-- 预览模式 - 只显示前3个 -->
								<view class="plates-preview" v-else>
									<view class="plate-item" v-for="(plate, plateIndex) in group.plates.slice(0, 3)"
										:key="plateIndex" @click="selectPlateFromGroup(plate, group)">
										<view class="plate-number-display"
											:class="isNewEnergyPlate(plate.plateNumber) ? 'green-plate' : 'blue-plate'">
											{{ plate.plateNumber }}
										</view>
									</view>
									<view class="more-plates-hint" @click="togglePlatesExpanded(groupIndex)">
										<text class="hint-text">还有 {{ group.plates.length - 3 }} 个车牌...</text>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>

				<!-- 加载更多按钮 -->
				<view class="load-more-section" v-if="showLoadMoreBtn">
					<view class="load-more-btn" @click="loadMoreResults">
						<text class="load-more-text">加载更多结果</text>
					</view>
				</view>
			</view>

			<view class="search-empty-state" v-else-if="plateSearchKeyword && !isSearching">
				<view class="empty-icon"></view>
				<text class="empty-message">未找到匹配的车牌号</text>
				<text class="empty-hint">请尝试输入完整的车牌号码</text>
			</view>
		</view>

		<!-- 自定义底部导航栏 -->
		<custom-tab-bar></custom-tab-bar>

		<!-- 隐藏的Canvas用于添加水印 -->
		<canvas canvas-id="watermarkCanvas" id="watermarkCanvas"
			:style="{ position: 'fixed', left: '-9999px', top: '-9999px', width: canvasWidth + 'px', height: canvasHeight + 'px' }"></canvas>

	</view>
</template>

<script>
// 导入违规API
import {
	violationApi,
	ownerApi
} from '@/api/violation-api.js';

//  导入 ownerAPI 用于调用融合接口
import {
	ownerAPI,
	whitelistAPI
} from '@/config/api.js';

//  导入违规配置API（用于动态加载下拉选项）
import {
	violationLocationApi,
	violationTypeApi,
	violationDescriptionApi,
	blacklistReasonApi,
	violationConfigUtils
} from '@/api/violation-config-api.js';

// 导入违规提醒API
import {
	violationReminderApi,
	reminderUtils
} from '@/api/violation-reminder-api.js';

// 导入认证工具
import AuthUtils from '@/utils/auth.js';

export default {
	data() {
		return {
			statusBarHeight: 0, // 状态栏高度

			currentPark: '', // 当前车场名称
			selectedParkingLot: '东北林业大学', // 当前选择的车场
			parkingLots: [
				'东北林业大学'
			], // 可选车场列表
			userInfo: null, // 用户信息
			showUserInfoDropdown: false, // 用户信息下拉窗口显示状态
			currentUserRole: '', // 当前用户角色
			formData: {
				plateNumber: '',
				violationType: '',
				customType: '',
				location: '',
				photos: [],
				description: '',
				shouldBlacklist: false,
				blacklistReason: '',
				blacklistDecisionMade: true, // ✅ 默认已决定不拉黑（无需用户点击）
				enterTime: null, //  进场时间（用于在场车辆的违规记录）
				leaveTime: null, //  新增：离场时间（从预约表的leavedate获取）
				appointmentTime: null //  新增：预约时间（从预约表的visitdate获取）
			},
			ownerInfo: null,
			whitelistInfo: null, //  白名单信息
			isWhitelistVehicle: false, //  是否为白名单车辆

			// ❌ 已废弃：违规类型配置 - 现在使用动态加载的 typeOptions
			// violationConfig: {
			// 	common: [],
			// 	others: []
			// },

			//  违规配置选项（从后端加载）
			locationOptions: [], // 违规位置选项列表
			typeOptions: [], // 违规类型选项列表
			reasonOptions: [], // 拉黑原因选项列表

			// 位置下拉选择器相关
			showLocationDropdown: false, // 是否显示位置下拉列表
			filteredLocationOptions: [], // 过滤后的位置选项

			//  图标名称到 Emoji 的映射表（参考 ViolationTypeConfig.vue）
			iconEmojiMap: {
				// 警告类图标
				'Warning': '⚠️',
				'WarningFilled': '⚠️',
				'CircleClose': '❌',
				'InfoFilled': 'ℹ️',
				'WarnTriangleFilled': '⚠️',

				// 禁止/限制类图标
				'Lock': '',
				'CircleCloseFilled': '❌',
				'RemoveFilled': '',
				'CloseBold': '✖️',
				'Delete': '️',

				// 时间相关（超时停车、限时停车）
				'Clock': '',
				'Timer': '⏱️',
				'AlarmClock': '⏰',

				// 位置相关（违规停车位置）
				'Location': '',
				'Position': '',
				'MapLocation': '️',
				'Coordinate': '',

				// 车辆相关
				'Van': '',
				'Bicycle': '',

				// 监控相关（违规抓拍）
				'Camera': '',
				'VideoCamera': '',
				'View': '️',

				// 标记/标识类
				'Flag': '',
				'Stamp': '',
				'Tickets': '',

				// 其他常用
				'Bell': '',
				'Message': '',
				'Document': '',
				'Files': ''
			},

			//  输入方式控制

			// 界面状态
			uiState: {
				showMoreTypes: false, // 是否展开更多类型
				searchKeyword: '', // 搜索关键词
				isSearching: false // 是否在搜索状态
			},
			// 搜索相关
			searchTimer: null, // 搜索防抖定时器
			showScanModal: false,
			scanResult: '',
			scanning: false,
			showConfirmModal: false,
			submitting: false,
			// 非模态提醒确认面板状态（uView 卡片）
			showReminderConfirmPanel: false,
			reminderConfirmListText: '',
			// 结构化的提醒记录列表，用于列表展示
			reminderConfirmList: [],
			// 提醒记录弹窗分页与展开状态
			reminderPage: 1,
			reminderPageSize: 5,
			_pendingReminderProceed: null,
			// 车牌识别相关
			showCamera: false,
			isRecognizing: false,
			debugMode: false,
			// 自动识别相关变量
			autoRecognize: false, // 自动识别开关
			autoRecognizeTimer: null, // 自动识别定时器
			autoRecognizeCount: 0, // 自动识别次数计数
			autoRecognizeInterval: 2000, // 自动识别间隔（2秒）
			lastRecognizeTime: 0, // 上次识别时间（防抖用）
			lastResult: null, // 最新识别结果

			// 车牌搜索相关
			showPlateSuggestions: false, // 是否显示车牌搜索建议
			plateSuggestions: [], // 车牌搜索建议列表
			plateSearchTimer: null, // 车牌搜索防抖定时器
			plateFocused: false, // 车牌输入框是否聚焦
			showLoadMoreBtn: false, // 是否显示加载更多按钮
			usingSmartSearch: false, //  当前是否使用智能搜索
			currentSearchPage: 1, // 当前搜索页码
			totalSearchResults: 0, // 搜索结果总数

			// 搜索结果相关
			showPlateSearchResults: false, // 是否显示车牌搜索结果列表
			expandedGroups: [], // 展开的车主分组索引数组
			plateSearchKeyword: '', // 车牌搜索关键词
			isSearching: false, // 是否正在搜索
			locationFocused: false, // 位置输入框是否聚焦

			// 车牌识别相关
			showPlateRecognitionModal: false, // 是否显示车牌识别弹窗
			showCamera: false, // 是否显示摄像头
			isRecognizing: false, // 是否正在识别
			recognitionResult: null, // 识别结果对象
			autoRecognize: false, // 自动识别开关
			autoRecognizeTimer: null, // 自动识别定时器
			autoRecognizeCount: 0, // 自动识别次数
			lastRecognizeTime: 0, // 上次识别时间
			failedRecognizeCount: 0, // 失败识别次数
			isRecognitionDisabled: false, // 是否禁用识别功能
			disabledUntilTime: 0, // 禁用到什么时间（时间戳）
			disabledCheckTimer: null, // 禁用状态检查定时器
			currentTime: Date.now(), // 当前时间（用于倒计时显示）

			//  图片上传状态标志（防止上传时重置表单）
			isUploadingPhoto: false, // 是否正在上传照片

			//  黑名单类型相关
			blacklistTypeOptions: [], // 黑名单类型选项列表
			selectedBlacklistTypeIndex: 0, // 当前选中的黑名单类型索引
			blacklistTypeLoading: false, // 黑名单类型加载状态
			isDefaultBlacklistTypes: false, // 是否使用默认黑名单类型

			//  黑名单时长相关
			blacklistDurationType: 'permanent', // 拉黑时长类型：permanent(永久), temporary(临时)
			blacklistStartTime: '', // 拉黑开始时间
			blacklistEndTime: '', // 拉黑结束时间

			//  预约记录相关
			selectedAppointmentId: null, // 当前选中的预约记录ID
			appointmentRecords: [], // 预约记录列表  
			violationSuggestions: [], // 违规建议列表
			showAppointmentModal: false, // 是否显示预约记录选择弹窗

			// 拉黑模板展开状态
			showTemplates: false,

			// 自定义车牌键盘相关数据
			carColor: 'linear-gradient(to bottom, #216fef, #0c4fc5)', // 车牌背景色
			selectedColor: 'linear-gradient(to bottom, #216fef, #0c4fc5)', // 选中的车牌颜色
			borderBgColor: '#fff', // 车牌边框颜色
			textColor: '#fff', // 车牌文字颜色
			plateType: 'blue', // 车牌类型

			// 新的车牌键盘数据
			plateChars: ['', '', '', '', '', '', ''], // 车牌字符数组，默认7位
			currentIndex: 0, // 当前选中的字符位置
			isNewEnergyMode: false, // 是否为新能源车牌（布尔开关，避免与方法同名）
			showProvinceKeyboard: true, // 显示省份键盘
			showNumberKeyboard: false, // 显示数字字母键盘
			showNumbers: false, // 当前是否显示数字键盘

			// 省份数据
			provinces: [
				'京', '沪', '粤', '津', '浙', '苏', '湘',
				'渝', '云', '豫', '皖', '陕', '桂', '新',
				'青', '琼', '闽', '蒙', '辽', '宁', '鲁',
				'晋', '吉', '冀', '黑', '甘', '鄂', '赣',
				'贵', '川', '藏', '民', '使'
			],

			// 数字
			numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],

			// 字母行
			letterRows: [
				['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
				['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
				['Z', 'X', 'C', 'V', 'B', 'N', 'M']
			],

			// 混合键盘（数字+字母）
			mixedRows: [
				['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
				['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
				['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
				['Z', 'X', 'C', 'V', 'B', 'N', 'M']
			],

			// 禁用的字母（车牌中不允许使用）
			disabledLetters: ['I', 'O'],

			// 自定义键盘显示状态
			showCustomKeyboard: false,

			//  违规记录列表相关
			showViolationRecords: false, // 是否展开违规记录列表

			//  水印Canvas相关
			canvasWidth: 750, // Canvas宽度（会动态调整）
			canvasHeight: 1000, // Canvas高度（会动态调整）

			//  提醒/短信发送间隔（分钟），从后端配置加载，默认30
			reminderIntervalMinutes: 30
		}
	},

	// 添加组件销毁时的清理
	beforeDestroy() {
		this.stopAutoRecognize();
		// 清理搜索定时器
		if (this.searchTimer) {
			clearTimeout(this.searchTimer);
			this.searchTimer = null;
		}
		// 清理车牌搜索定时器
		if (this.plateSearchTimer) {
			clearTimeout(this.plateSearchTimer);
			this.plateSearchTimer = null;
		}

		// 清理自动识别定时器
		if (this.autoRecognizeTimer) {
			clearTimeout(this.autoRecognizeTimer);
			this.autoRecognizeTimer = null;
		}

		// 清理禁用状态检查定时器
		if (this.disabledCheckTimer) {
			clearInterval(this.disabledCheckTimer);
			this.disabledCheckTimer = null;
		}
	},

	//  微信通知发送功能已移到后端，由后端在创建违规记录时自动发送给对应的 visitorname

	computed: {
		// 判断是否显示拉黑设置（管理员显示，巡逻员不显示）
		shouldShowBlacklistSection() {
			return this.currentUserRole === '管理员';
		},

		// 获取车牌识别按钮的状态文本
		recognitionButtonText() {
			if (!this.isRecognitionDisabled) {
				return '车牌识别';
			}

			// 使用响应式的 currentTime 而不是 Date.now()
			const remainingTime = this.disabledUntilTime - this.currentTime;

			if (remainingTime > 0) {
				const minutes = Math.floor(remainingTime / 60000);
				const seconds = Math.floor((remainingTime % 60000) / 1000);
				if (minutes > 0) {
					return `禁用中 ${minutes}:${seconds.toString().padStart(2, '0')}`;
				} else {
					return `禁用中 ${seconds}秒`;
				}
			}

			return '车牌识别';
		},


		// 提醒记录弹窗分页/列表
		paginatedReminderList() {
			const startIndex = (this.reminderPage - 1) * this.reminderPageSize;
			const endIndex = startIndex + this.reminderPageSize;
			return (this.reminderConfirmList || []).slice(startIndex, endIndex);
		},

		reminderTotalPages() {
			const total = this.reminderConfirmList ? this.reminderConfirmList.length : 0;
			return total === 0 ? 1 : Math.ceil(total / this.reminderPageSize);
		},

		canSubmit() {
			const basicFieldsValid = this.formData.plateNumber &&
				this.formData.violationType &&
				this.formData.location &&
				(this.formData.violationType !== 'other' || this.formData.customType);

			// 如果不显示拉黑设置，则不需要验证拉黑相关字段
			if (!this.shouldShowBlacklistSection) {
				return basicFieldsValid;
			}

			//  拉黑相关验证 - 强制用户明确选择（仅管理员需要）
			if (this.formData.shouldBlacklist) {
				return basicFieldsValid &&
					this.formData.blacklistReason &&
					this.formData.blacklistReason.trim().length >= 5;
			}

			// ⚠️ 必须明确表态是否拉黑（添加确认状态字段）
			return basicFieldsValid && this.formData.blacklistDecisionMade;
		},

		// 完整的车牌号码
		currentPlateNumber() {
			return this.plateChars.filter(char => char).join('');
		},

		// 字母数组（扁平化）
		letters() {
			return this.letterRows.flat();
		},




		// 计算信用分样式类
		creditScoreClass() {
			if (!this.ownerInfo || !this.ownerInfo.creditScore) {
				return '';
			}
			const score = this.ownerInfo.creditScore;
			if (score >= 80) return 'credit-excellent';
			if (score >= 60) return 'credit-warning';
			return 'credit-danger';
		},

		//  判断部门信息的标签显示（学院 or 部门）
		departmentLabel() {
			if (!this.ownerInfo || !this.ownerInfo.address) {
				return '部门';
			}
			// 如果地址中包含"学院"，则显示"学院"，否则显示"部门"
			return this.ownerInfo.address.includes('学院') ? '学院' : '部门';
		},

		// 当前显示的常用类型（排除已选择的）
		displayCommonTypes() {
			//  使用动态加载的 typeOptions
			return this.typeOptions.filter(type =>
				type.value !== this.formData.violationType
			);
		},

		// 搜索结果
		searchResults() {
			if (!this.uiState.searchKeyword) return [];

			const keyword = this.uiState.searchKeyword.toLowerCase();
			//  使用动态加载的 typeOptions
			const allTypes = this.typeOptions;

			return allTypes.filter(type =>
				(type.label && type.label.toLowerCase().includes(keyword)) ||
				(type.value && type.value.toLowerCase().includes(keyword))
			);
		},

		// 已选择的类型信息
		selectedTypeInfo() {
			if (!this.formData.violationType) return null;

			//  使用动态加载的 typeOptions
			return this.typeOptions.find(type => type.value === this.formData.violationType);
		},

		//  拉黑原因快速模板（动态从 reasonOptions 获取）
		blacklistReasonTemplates() {
			// 从 reasonOptions 中提取原因文本作为模板
			return this.reasonOptions.map(option => option.label || option.value);
		},

		//  按车主分组的搜索建议 - 修改为只显示搜索的车牌
		groupedSuggestions() {
			if (!this.plateSuggestions || this.plateSuggestions.length === 0) {
				return [];
			}

			// 按车主分组
			const groups = {};

			this.plateSuggestions.forEach(suggestion => {
				// 检查车牌号是否包含多个车牌（逗号分隔）
				const plateNumbers = suggestion.plateNumber ? suggestion.plateNumber.split(',').map(p => p
					.trim()) : [suggestion.plateNumber];

				const ownerKey = suggestion.ownerName || 'unknown';

				if (!groups[ownerKey]) {
					groups[ownerKey] = {
						ownerName: suggestion.ownerName,
						ownerPhone: suggestion.ownerPhone,
						ownerId: suggestion.ownerId,
						ticketName: suggestion.ticketName,
						creditScore: suggestion.creditScore,
						appointmentCount: suggestion.appointmentCount,
						//  添加车位信息
						remark: suggestion.remark,
						remark1: suggestion.remark1,
						remark2: suggestion.remark2,
						remark3: suggestion.remark3,
						//  添加地址信息
						address: suggestion.address,
						//  添加数据源字段
						dataSource: suggestion.dataSource,
						plates: []
					};
				}

				//  只添加匹配搜索关键词的车牌，并去重
				plateNumbers.forEach(plateNumber => {
					if (plateNumber && plateNumber.trim()) {
						// 检查车牌是否匹配搜索关键词
						const searchKeyword = (this.plateSearchKeyword || '').toUpperCase().trim();
						const currentPlate = plateNumber.trim().toUpperCase();

						// 只有当车牌包含搜索关键词时才添加
						if (!searchKeyword || currentPlate.includes(searchKeyword)) {
							//  检查是否已存在相同车牌，避免重复
							const plateExists = groups[ownerKey].plates.some(plate =>
								plate.plateNumber.toUpperCase() === currentPlate
							);

							if (!plateExists) {
								groups[ownerKey].plates.push({
									plateNumber: plateNumber.trim(),
									ownerName: suggestion.ownerName,
									ownerPhone: suggestion.ownerPhone,
									ownerId: suggestion.ownerId,
									ticketName: suggestion.ticketName,
									parkingSpot: suggestion.parkingSpot,
									validStatus: suggestion.validStatus,
									isFrozen: suggestion.isFrozen,
									isInPark: suggestion.isInPark,
									appointmentCount: suggestion.appointmentCount,
									violationCount: suggestion.violationCount,
									creditScore: suggestion.creditScore,
									//  添加车位信息
									remark: suggestion.remark,
									remark1: suggestion.remark1,
									remark2: suggestion.remark2,
									remark3: suggestion.remark3,
									address: suggestion.address,
									//  添加数据源字段
									dataSource: suggestion.dataSource
								});
							}
						}
					}
				});
			});

			// 过滤掉没有车牌的车主组，并对车牌进行全局去重
			const filteredGroups = Object.values(groups).filter(group => group.plates.length > 0);

			//  全局去重：确保整个结果中没有重复车牌
			const seenPlates = new Set();
			const deduplicatedGroups = [];

			filteredGroups.forEach(group => {
				const uniquePlates = group.plates.filter(plate => {
					const plateKey = plate.plateNumber.toUpperCase();
					if (seenPlates.has(plateKey)) {
						return false; // 已存在，跳过
					}
					seenPlates.add(plateKey);
					return true; // 不存在，保留
				});

				if (uniquePlates.length > 0) {
					deduplicatedGroups.push({
						...group,
						plates: uniquePlates
					});
				}
			});

			return deduplicatedGroups;
		},

		//  总车牌数量
		totalPlateCount() {
			return this.groupedSuggestions.reduce((total, group) => {
				return total + group.plates.length;
			}, 0);
		},

		// 当前用户名
		currentUserName() {
			let userInfo = uni.getStorageSync('userInfo');

			// 如果userInfo为空，尝试从其他来源获取
			if (!userInfo) {
				userInfo = this.getUserInfoFromAllSources();
			}

			// 优先检查巡逻员身份
			if (userInfo?.patrolData?.username) {
				return userInfo.patrolData.username;
			}
			// 检查管家身份 
			else if (userInfo?.userInfo?.username) {
				return userInfo.userInfo.username;
			}
			// 检查业主身份
			else if (userInfo?.userInfo?.ownername || userInfo?.ownername) {
				return userInfo.userInfo?.ownername || userInfo.ownername;
			}
			// 通用用户信息字段
			else if (userInfo?.realName || userInfo?.userName || userInfo?.loginName || userInfo?.nickname || userInfo
				?.name) {
				return userInfo.realName || userInfo.userName || userInfo.loginName || userInfo.nickname || userInfo
					.name;
			}

			// 从localStorage获取
			try {
				const storedUsername = (typeof localStorage !== 'undefined') ?
					(localStorage.getItem('ms_username') || localStorage.getItem('login_name')) : null;
				if (storedUsername) {
					return storedUsername;
				}
			} catch (e) {
				// ignore
			}

			return '用户';
		}

	},

	//  监听器
	watch: {
		//  关键功能：监听违规类型变化，动态加载对应的违规描述
		//  实现违规类型与描述的一一对应关系
		'formData.violationType': function (newVal, oldVal) {
			console.log('️ [监听] 违规类型变化:', oldVal, '->', newVal);
			if (newVal && newVal !== oldVal) {
				//  从 violation_types 表的 description 字段加载违规描述
				this.loadDescriptionFromType(newVal);
			}
		},

		// 监听车场切换，重新加载所有配置选项
		'selectedParkingLot': function (newVal, oldVal) {
			console.log('️ [监听] 车场切换:', oldVal, '->', newVal);
			if (newVal && newVal !== oldVal) {
				console.log(' [监听] 重新加载所有配置选项');
				// 重新加载所有配置选项
				this.loadLocationOptions();
				this.loadTypeOptions();
				this.loadReasonOptions();
				// 如果当前有选中的违规类型，也重新加载描述
				if (this.formData.violationType) {
					this.loadDescriptionFromType(this.formData.violationType);
				}
			}
		}
	},

	// 页面生命周期
	async onLoad() {
		this.initializePage();
		// 初始化自定义键盘
		this.initCustomKeyboard();

		// 初始化状态栏高度
		const systemInfo = uni.getSystemInfoSync();
		this.statusBarHeight = systemInfo.statusBarHeight || 0;

		// 启动禁用状态检查定时器
		this.startDisabledCheckTimer();

		// 获取用户角色
		try {
			let userInfo = uni.getStorageSync('userInfo');

			//  如果userInfo为空，尝试从其他来源获取
			if (!userInfo) {
				console.log('⚠️ [页面加载] userInfo为空，尝试从其他来源获取');
				userInfo = this.getUserInfoFromAllSources();
			}

			// 设置用户角色
			this.setUserRole(userInfo);

			//  加载黑名单类型列表（仅管理员需要）
			this.loadBlacklistTypes();

		} catch (error) {
			console.error('获取用户角色失败:', error);
		}

		//  加载违规配置选项
		console.log(' [页面加载] 开始加载违规配置选项');
		this.loadLocationOptions(); // 加载违规位置选项
		this.loadTypeOptions(); // 加载违规类型选项
		this.loadReasonOptions(); // 加载拉黑原因选项
		console.log('✅ [页面加载] 违规配置选项加载完成');

		//  加载提醒/短信发送间隔设置（等待完成以确保使用最新配置）
		await this.loadReminderSettings();
	},

	// 页面显示时触发
	onShow() {
		// 页面显示时通知TabBar检查当前页面
		console.log(' [违规登记页面] 页面显示');

		//  检查是否正在上传照片（如果是，则不重置表单）
		if (this.isUploadingPhoto) {
			console.log(' [页面显示] 正在上传照片，跳过重置表单');
			return;
		}

		//  检查是否应该重置表单（从查询页面返回时）
		const shouldReset = uni.getStorageSync('shouldResetAddViolationForm');
		if (shouldReset) {
			console.log(' 检测到需要重置表单，执行重置...');
			// 清除重置标记
			uni.removeStorageSync('shouldResetAddViolationForm');
			// 重置表单（不显示提示）
			this.resetForm(false);
		}

		// 通知tabBar更新当前选中状态（使用 setTimeout 确保在真机上也能正常触发）
		setTimeout(() => {
			try {
				uni.$emit('updateTabBar');
				console.log('✅ [违规登记页面] 已发送 updateTabBar 事件');
			} catch (error) {
				console.error('❌ [违规登记页面] 通知tabBar更新失败:', error);
			}
		}, 50);
	},

	methods: {
		//  加载提醒设置（最小间隔）
		async loadReminderSettings() {
			try {
				const settings = await violationReminderApi.getSettings();
				console.log("setting:", settings);
				const minutes = settings?.data?.reminderIntervalMinutes ?? settings?.reminderIntervalMinutes;
				if (minutes !== null && minutes !== undefined) {
					this.reminderIntervalMinutes = Number(minutes);
				}
				console.log('⚙️ [提醒设置] 最小间隔(分钟):', this.reminderIntervalMinutes);
			} catch (e) {
				console.warn('⚠️ [提醒设置] 加载失败，使用默认30分钟');
				this.reminderIntervalMinutes = 30;
			}
		},

		//  计算时间差（分钟）
		_diffMinutes(fromTimeIso, toTimeIso) {
			if (!fromTimeIso) return Number.POSITIVE_INFINITY;
			const from = new Date(fromTimeIso).getTime();
			const to = toTimeIso ? new Date(toTimeIso).getTime() : Date.now();
			if (!isFinite(from) || !isFinite(to)) return Number.POSITIVE_INFINITY;
			return Math.floor((to - from) / 60000);
		},

		//  将分钟格式化为“X小时Y分”
		_formatElapsed(mins) {
			if (!isFinite(mins) || mins < 0) return '0分';
			const h = Math.floor(mins / 60);
			const m = mins % 60;
			return h > 0 ? `${h}小时${m}分` : `${m}分`;
		},
		// ==========  图标解析方法 ==========

		/**
		 *  解析图标名称为 Emoji
		 * @description 将后端返回的图标名称（如 'Clock', 'Warning' 等）转换为对应的 emoji
		 * @param {String} iconName - 图标名称（与 ViolationTypeConfig.vue 中的 iconComponents 对应）
		 * @returns {String} - 对应的 emoji 字符
		 * 
		 *  为什么需要这个方法：
		 * - 后端配置中使用的是 Element Plus 图标名称（如 'Clock', 'Warning'）
		 * - Web 端（ViolationTypeConfig.vue）可以直接导入并使用这些图标组件
		 * - 小程序无法使用 Vue 动态组件，所以需要将图标名称映射为 emoji
		 * - 这样前后端数据格式保持一致，只在展示层做适配
		 */
		parseIconToEmoji(iconName) {
			if (!iconName) {
				return '⚠️'; // 默认警告图标
			}
			// 如果已经是 emoji（包含特殊字符），直接返回
			if (iconName.length <= 2) {
				return iconName;
			}
			// 从映射表中查找对应的 emoji
			return this.iconEmojiMap[iconName] || '⚠️';
		},

		/**
		 * 判断是否为新能源车牌
		 * 示例：粤AD12345、京A12345D、沪AD12345、浙A1D2345 等
		 */
		isNewEnergyPlate(plate) {
			if (!plate || typeof plate !== 'string') return false;
			const p = plate.trim().toUpperCase();
			// 新能源小型车：最后一位为 D 或 F（8 位）
			const newEnergySmall = /^[\u4e00-\u9fa5][A-Z][A-Z0-9]{5}[DF]$/;
			// 新能源大型车：第3位为 D 或 F（总 8 位，格式如 沪AD12345）
			const newEnergyLarge = /^[\u4e00-\u9fa5][A-Z][DF][A-Z0-9][0-9]{4}$/;
			return newEnergySmall.test(p) || newEnergyLarge.test(p);
		},

		// ===== 提醒记录弹窗：折叠与分页 =====
		toggleReminderExpand(localIndex) {
			const globalIndex = (this.reminderPage - 1) * this.reminderPageSize + localIndex;
			if (!this.reminderConfirmList || !this.reminderConfirmList[globalIndex]) return;
			this.$set(this.reminderConfirmList[globalIndex], '_expanded', !this.reminderConfirmList[globalIndex]
				._expanded);
		},

		// 内联确认面板：取消
		cancelReminderConfirm() {
			this.showReminderConfirmPanel = false;
			this.reminderConfirmListText = '';
			this.reminderConfirmList = [];
			this._pendingReminderProceed = null;
		},

		// 内联确认面板：继续发送
		async confirmSendReminder() {
			try {
				const fn = this._pendingReminderProceed;
				this.showReminderConfirmPanel = false;
				this.reminderConfirmListText = '';
				this.reminderConfirmList = [];
				this._pendingReminderProceed = null;
				if (typeof fn === 'function') {
					await fn();
				}
			} catch (e) {
				uni.showToast({
					title: '发送失败',
					icon: 'none'
				});
			}
		},

		prevReminderPage() {
			if (this.reminderPage > 1) {
				this.reminderPage -= 1;
			}
		},

		nextReminderPage() {
			const total = this.reminderTotalPages;
			if (this.reminderPage < total) {
				this.reminderPage += 1;
			}
		},

		// ==========  违规配置加载方法 ==========

		//  加载违规位置选项
		async loadLocationOptions() {
			try {
				console.log(' [加载位置选项] 开始加载，车场:', this.selectedParkingLot);
				const result = await violationLocationApi.getEnabledLocations(this.selectedParkingLot);
				console.log(' [加载位置选项] API返回:', result);

				if (result && Array.isArray(result)) {
					this.locationOptions = violationConfigUtils.formatLocationOptions(result);
					console.log('✅ [加载位置选项] 成功，数量:', this.locationOptions.length);
				} else if (result && result.data && Array.isArray(result.data)) {
					this.locationOptions = violationConfigUtils.formatLocationOptions(result.data);
					console.log('✅ [加载位置选项] 从data字段成功，数量:', this.locationOptions.length);
				} else {
					console.warn('⚠️ [加载位置选项] 响应格式异常:', result);
					this.locationOptions = [];
				}

				// 初始化过滤后的选项列表
				this.filteredLocationOptions = [...this.locationOptions];
			} catch (error) {
				console.error('❌ [加载位置选项] 失败:', error);
				this.locationOptions = [];
				this.filteredLocationOptions = [];
				uni.showToast({
					title: '加载违规位置失败',
					icon: 'none',
					duration: 2000
				});
			}
		},

		//  加载违规类型选项
		async loadTypeOptions() {
			try {
				console.log('️ [加载类型选项] 开始加载，车场:', this.selectedParkingLot);
				const result = await violationTypeApi.getEnabledTypes(this.selectedParkingLot);
				console.log('️ [加载类型选项] API返回:', result);

				if (result && Array.isArray(result)) {
					this.typeOptions = violationConfigUtils.formatTypeOptions(result);
					console.log('✅ [加载类型选项] 成功，数量:', this.typeOptions.length);
				} else if (result && result.data && Array.isArray(result.data)) {
					this.typeOptions = violationConfigUtils.formatTypeOptions(result.data);
					console.log('✅ [加载类型选项] 从data字段成功，数量:', this.typeOptions.length);
				} else {
					console.warn('⚠️ [加载类型选项] 响应格式异常:', result);
					this.typeOptions = [];
				}
			} catch (error) {
				console.error('❌ [加载类型选项] 失败:', error);
				this.typeOptions = [];
				uni.showToast({
					title: '加载违规类型失败',
					icon: 'none',
					duration: 2000
				});
			}
		},

		//  加载违规描述（从violation_types表的description字段获取）
		loadDescriptionFromType(violationTypeCode) {
			try {
				console.log(' [加载描述] 开始加载，类型:', violationTypeCode);

				if (!violationTypeCode) {
					console.log('⚠️ [加载描述] 违规类型为空，清空描述');
					this.formData.description = '';
					return;
				}

				// 从 typeOptions 中查找对应的类型
				const selectedType = this.typeOptions.find(type => type.value === violationTypeCode);

				if (selectedType && selectedType.description) {
					// 直接使用 violation_types 表的 description 字段
					this.formData.description = selectedType.description;
					console.log('✅ [加载描述] 成功，描述:', selectedType.description);
				} else {
					console.warn('⚠️ [加载描述] 未找到对应类型的描述');
					this.formData.description = '';
				}
			} catch (error) {
				console.error('❌ [加载描述] 失败:', error);
				this.formData.description = '';
			}
		},

		//  加载拉黑原因选项
		async loadReasonOptions() {
			try {
				console.log(' [加载原因选项] 开始加载，车场:', this.selectedParkingLot);
				const result = await blacklistReasonApi.getEnabledReasons(
					'violation', // 原因分类：违规拉黑
					this.selectedParkingLot
				);
				console.log(' [加载原因选项] API返回:', result);

				if (result && Array.isArray(result)) {
					this.reasonOptions = violationConfigUtils.formatReasonOptions(result);
					console.log('✅ [加载原因选项] 成功，数量:', this.reasonOptions.length);
				} else if (result && result.data && Array.isArray(result.data)) {
					this.reasonOptions = violationConfigUtils.formatReasonOptions(result.data);
					console.log('✅ [加载原因选项] 从data字段成功，数量:', this.reasonOptions.length);
				} else {
					console.warn('⚠️ [加载原因选项] 响应格式异常:', result);
					this.reasonOptions = [];
				}
			} catch (error) {
				console.error('❌ [加载原因选项] 失败:', error);
				this.reasonOptions = [];
				uni.showToast({
					title: '加载拉黑原因失败',
					icon: 'none',
					duration: 2000
				});
			}
		},

		//  切换位置输入方式
		// 切换下拉列表显示
		toggleLocationDropdown() {
			this.showLocationDropdown = !this.showLocationDropdown;
			if (this.showLocationDropdown) {
				this.filteredLocationOptions = [...this.locationOptions];
			}
		},

		// 处理位置输入
		handleLocationInput(e) {
			const value = e.detail.value;
			if (value) {
				// 根据输入过滤选项
				this.filteredLocationOptions = this.locationOptions.filter(item =>
					item.label.includes(value)
				);
			} else {
				this.filteredLocationOptions = [...this.locationOptions];
			}
		},

		// 处理输入框失焦
		handleLocationBlur() {
			// 延迟隐藏，以便点击下拉选项能够生效
			setTimeout(() => {
				this.showLocationDropdown = false;
			}, 200);
		},

		// 选择位置
		selectLocation(item) {
			this.formData.location = item.label;
			this.showLocationDropdown = false;
		},

		//  位置选择变化（保留兼容）
		onLocationChange(e) {
			const index = e.detail.value;
			const selected = this.locationOptions[index];
			if (selected) {
				this.formData.location = selected.label;
				console.log(' [位置选择] 选中:', selected.label);
				// 如果有经纬度信息，也可以保存
				if (selected.longitude && selected.latitude) {
					console.log(' [位置选择] 经纬度:', selected.longitude, selected.latitude);
				}
			}
		},

		//  违规类型选择变化
		onViolationTypeChange(e) {
			const index = e.detail.value;
			const selected = this.typeOptions[index];
			if (selected) {
				this.formData.violationType = selected.value;
				console.log('️ [类型选择] 选中:', selected.label, '代码:', selected.value);
				// 从 violation_types 表的 description 字段加载违规描述
				this.loadDescriptionFromType(selected.value);
			}
		},


		//  拉黑原因选择变化
		onBlacklistReasonChange(e) {
			const index = e.detail.value;
			const selected = this.reasonOptions[index];
			if (selected) {
				this.formData.blacklistReason = selected.value;
				console.log(' [原因选择] 选中:', selected.label);
			}
		},

		// ========== 用户角色相关方法 ==========

		// 设置用户角色
		setUserRole(userInfo) {
			try {
				// 默认角色为巡逻员
				let role = '';
				this.currentUserRole = userInfo.userInfo.position;
				console.log('✅ [用户角色] 设置用户角色为:', role);

			} catch (error) {
				console.error('❌ [用户角色] 设置用户角色失败:', error);
				this.currentUserRole = '巡逻员'; // 默认为巡逻员
			}
		},



		// ========== 自定义车牌键盘相关方法 ==========

		// 选择字符位置
		selectCharPosition(index) {
			this.currentIndex = index;
			if (index === 0) {
				// 第一位显示省份键盘
				this.showProvinceKeyboard = true;
				this.showNumberKeyboard = false;
			} else if (index === 1) {
				// 第二位显示字母键盘
				this.showProvinceKeyboard = false;
				this.showNumberKeyboard = true;
				this.showNumbers = false; // 显示字母
			} else {
				// 其他位置显示数字字母混合键盘
				this.showProvinceKeyboard = false;
				this.showNumberKeyboard = true;
				this.showNumbers = true; // 显示数字
			}
		},

		// 输入字符
		inputChar(char) {
			if (char === 'ABC') {
				// 切换到新能源车牌
				this.isNewEnergyMode = true;
				this.plateChars = ['', '', '', '', '', '', '', ''];
				this.currentIndex = 0;
				this.selectCharPosition(0);
				// 同时更新车牌类型选择器
				this.changeColor('linear-gradient(to bottom, #d0f1e4, #6ad390)');
				return;
			}

			// 检查是否为禁用字母
			if (this.isLetterDisabled(char)) {
				uni.showToast({
					title: `车牌号码中不能使用字母"${char}"`,
					icon: 'none',
					duration: 1500
				});
				return;
			}

			// 根据当前车牌模式确定最大长度
			const maxLength = this.isNewEnergyMode ? 8 : 7;

			// 检查是否超出长度限制
			if (this.currentIndex >= maxLength) {
				uni.showToast({
					title: `车牌号码最多${maxLength}位`,
					icon: 'none',
					duration: 1500
				});
				return;
			}

			// 输入字符到当前位置
			if (this.currentIndex < this.plateChars.length) {
				this.$set(this.plateChars, this.currentIndex, char);

				// 自动移动到下一位
				if (this.currentIndex < this.plateChars.length - 1) {
					this.currentIndex++;
					this.selectCharPosition(this.currentIndex);
				}

				// 更新表单数据
				this.updatePlateNumber();
			}
		},

		// 删除字符
		deleteChar() {
			// 如果车牌为空，不执行删除操作
			if (this.formData.plateNumber.length === 0) {
				return;
			}

			if (this.currentIndex >= 0) {
				// 如果当前位置有字符，直接删除
				if (this.plateChars[this.currentIndex]) {
					this.$set(this.plateChars, this.currentIndex, '');
				} else if (this.currentIndex > 0) {
					// 如果当前位置为空，向前移动并删除前一个位置的字符
					this.currentIndex--;
					this.$set(this.plateChars, this.currentIndex, '');
				}

				// 删除操作后，检查当前位置并切换相应的键盘
				// 如果当前在第0位（省份位），切换到省份键盘
				if (this.currentIndex === 0) {
					this.selectCharPosition(0); // 这会触发键盘切换到省份键盘
				} else {
					// 其他位置，正常选择位置（会自动切换到对应的键盘）
					this.selectCharPosition(this.currentIndex);
				}

				// 更新表单数据
				this.updatePlateNumber();
			}
		},

		// 清空所有字符
		clearAll() {
			// 根据当前车牌类型设置正确的数组长度
			if (this.selectedColor === 'linear-gradient(to bottom, #d0f1e4, #6ad390)' || this.isNewEnergyMode) {
				this.plateChars = ['', '', '', '', '', '', '', ''];
				this.isNewEnergyMode = true;
			} else {
				this.plateChars = ['', '', '', '', '', '', ''];
				this.isNewEnergyMode = false;
			}
			this.currentIndex = 0;
			this.selectCharPosition(0);
			this.updatePlateNumber();
		},

		// 切换键盘类型
		toggleKeyboardType() {
			this.showNumbers = !this.showNumbers;
		},

		// 切换到省份键盘
		switchToProvince() {
			this.currentIndex = 0;
			this.selectCharPosition(0);
		},

		// 切换到数字键盘
		switchToNumber() {
			if (this.currentIndex === 0) {
				this.currentIndex = 1;
			}
			this.selectCharPosition(this.currentIndex);
		},

		// 切换到字母数字键盘
		switchToLetters() {
			// 切换到字母数字混合键盘
			this.showProvinceKeyboard = false;
			this.showNumberKeyboard = true;
			// 如果当前在第一位（省份位），自动跳到第二位（字母位）
			if (this.currentIndex === 0) {
				this.currentIndex = 1;
			}
			this.selectCharPosition(this.currentIndex);
		},

		// 判断字母是否被禁用
		isLetterDisabled(letter) {
			return this.disabledLetters.includes(letter);
		},

		// 确认输入
		confirmInput() {
			const plateNumber = this.currentPlateNumber;
			const minLength = this.isNewEnergyMode ? 8 : 7;
			const plateTypeText = this.isNewEnergyMode ? '新能源车牌' : '普通车牌';

			if (plateNumber.length < minLength) {
				uni.showToast({
					title: `请输入完整的${plateTypeText}(${minLength}位)`,
					icon: 'none',
					duration: 1500
				});
				return;
			}

			this.formData.plateNumber = plateNumber;
			this.hideKeyboard();
			this.updatePlateNumber();

			// 显示成功提示
			uni.showToast({
				title: '车牌号码输入完成',
				icon: 'success',
				duration: 1000
			});
		},

		// 更新车牌号码到表单
		updatePlateNumber() {
			const plateNumber = this.currentPlateNumber;
			this.formData.plateNumber = plateNumber;

			// 如果车牌号码完整，自动查询车主信息
			const minLength = this.isNewEnergyMode ? 8 : 7;
			if (plateNumber.length >= minLength) {
				this.onPlateNumberChange();
			}
		},

		// 初始化自定义键盘
		initCustomKeyboard() {
			// 找到第一个空位置或设置为0
			let firstEmptyIndex = this.plateChars.findIndex(char => char === '');
			if (firstEmptyIndex === -1) {
				firstEmptyIndex = this.plateChars.length - 1;
			}
			this.currentIndex = firstEmptyIndex;

			// 根据当前位置设置键盘类型
			if (this.currentIndex === 0) {
				this.showProvinceKeyboard = true;
				this.showNumberKeyboard = false;
				this.showNumbers = false;
			} else if (this.currentIndex === 1) {
				this.showProvinceKeyboard = false;
				this.showNumberKeyboard = true;
				this.showNumbers = false;
			} else {
				this.showProvinceKeyboard = false;
				this.showNumberKeyboard = true;
				this.showNumbers = true;
			}
		},

		// 显示自定义键盘
		openCustomKeyboard() {
			this.showCustomKeyboard = true;
			this.initCustomKeyboard();
		},

		// 隐藏键盘
		hideKeyboard() {
			this.showCustomKeyboard = false;
		},

		// 切换新能源车牌
		toggleNewEnergyPlate() {
			this.isNewEnergyMode = !this.isNewEnergyMode;
			// 根据车牌类型调整字符数组长度和同步车牌类型选择器
			if (this.isNewEnergyMode) {
				this.plateChars = ['', '', '', '', '', '', '', ''];
				this.changeColor('linear-gradient(to bottom, #d0f1e4, #6ad390)'); // 使用统一的新能源颜色
			} else {
				this.plateChars = ['', '', '', '', '', '', ''];
				this.changeColor('linear-gradient(to bottom, #216fef, #0c4fc5)'); // 蓝牌
			}
			// 重置当前选择位置
			this.currentIndex = 0;
			this.selectCharPosition(0);
		},

		//  跳转到查询页面并填充搜索框
		navigateToSearch(searchText, searchType) {
			if (!searchText) return;

			console.log(' 跳转到查询页面:', {
				searchText,
				searchType
			});

			// 由于violation页面是tabBar页面，不能使用navigateTo传参
			// 使用本地存储来传递搜索参数
			const searchParams = {
				search: searchText,
				type: searchType,
				timestamp: Date.now() // 添加时间戳确保数据新鲜
			};

			try {
				// 将搜索参数存储到本地
				uni.setStorageSync('autoSearchParams', searchParams);
				console.log(' 已保存搜索参数:', searchParams);

				// 跳转到violation页面（tabBar页面使用switchTab）
				uni.switchTab({
					url: '/pages/violation/violation',
					success: () => {
						console.log('✅ 成功跳转到查询页面');
					},
					fail: (error) => {
						console.error('❌ 跳转失败:', error);
						uni.showToast({
							title: '页面跳转失败',
							icon: 'none'
						});
					}
				});
			} catch (error) {
				console.error('❌ 保存搜索参数失败:', error);
				uni.showToast({
					title: '操作失败',
					icon: 'none'
				});
			}
		},

		// 显示键盘（点击车牌显示区域触发）
		showKeyboard() {
			this.openCustomKeyboard();
		},

		// ========== 车场选择相关 ==========
		showParkingSelector() {
			uni.showActionSheet({
				itemList: this.parkingLots,
				success: (res) => {
					this.selectedParkingLot = this.parkingLots[res.tapIndex];
					// 可以在这里添加切换车场后的逻辑，比如刷新数据
					this.onParkingLotChanged();
				}
			});
		},

		onParkingLotChanged() {
			// 车场切换后的处理逻辑
			console.log('切换到车场：', this.selectedParkingLot);
			// 这里可以添加重新加载数据的逻辑
		},

		// ========== 用户信息下拉窗口相关 ==========
		toggleUserInfoDropdown() {
			console.log('toggleUserInfoDropdown');
			this.showUserInfoDropdown = !this.showUserInfoDropdown;
			console.log("测试：", this.showUserInfoDropdown);
		},

		changeParking() {
			this.showUserInfoDropdown = false;
			this.showParkingSelector();
		},

		viewProfile() {
			this.showUserInfoDropdown = false;

			const userInfo = uni.getStorageSync('userInfo') || {
				username: 'admin',
				realName: '管理员',
				role: '巡查员'
			};

			uni.showModal({
				title: '个人信息',
				content: `用户名: ${userInfo.username || userInfo.realName || '未知'}\n角色: ${userInfo.role || '巡查员'}\n车场: ${this.selectedParkingLot}`,
				confirmText: '确定',
				showCancel: false
			});
		},

		// 处理页面点击事件，关闭下拉窗口
		handlePageClick() {
			if (this.showUserInfoDropdown) {
				this.showUserInfoDropdown = false;
			}
		},



		// ========== 用户信息相关 ==========
		showUserInfoModal() {
			this.showUserInfoDropdown = !this.showUserInfoDropdown;
		},

		hideUserInfoDropdown() {
			this.showUserInfoDropdown = false;
		},

		showMoreOptions() {
			uni.showActionSheet({
				itemList: ['切换车场', '用户信息', '退出登录'],
				success: (res) => {
					switch (res.tapIndex) {
						case 0:
							this.showParkingSelector();
							break;
						case 1:
							this.showUserInfoModal();
							break;
						case 2:
							this.logout();
							break;
					}
				}
			});
		},

		logout() {
			this.showUserInfoDropdown = false;

			uni.showModal({
				title: '退出登录',
				content: '确定要退出登录吗？',
				success: (res) => {
					if (res.confirm) {
						// 清除用户信息
						uni.removeStorageSync('userInfo');
						uni.removeStorageSync('token');

						// 跳转到登录页面
						uni.redirectTo({
							url: '/pages/simple/login'
						});
					}
				}
			});
		},

		// ========== 页面初始化 ==========
		async initializePage() {
			//  调试：检查认证状态
			console.log(' [页面初始化] 开始检查用户信息存储...');
			console.log(' [页面初始化] 调试AuthUtils状态...');

			// 调试AuthUtils状态
			if (typeof AuthUtils !== 'undefined') {
				AuthUtils.debugAuthState();
			} else {
				console.error('❌ [页面初始化] AuthUtils未定义');
			}

			// 检查主要的存储键（只检查实际可能存在的键）
			const possibleKeys = ['userInfo', 'token'];
			const allStorageData = {};

			possibleKeys.forEach(key => {
				try {
					const value = uni.getStorageSync(key);
					if (value) {
						allStorageData[key] = value;
					} else {
						console.log(`ℹ️ [页面初始化] 存储键 "${key}" 为空`);
					}
				} catch (e) {
					console.log(`❌ [页面初始化] 读取存储键 "${key}" 失败:`, e.message);
				}
			});

			// 额外检查其他可能的键（但不报错）
			const optionalKeys = ['user', 'loginInfo', 'patrolInfo', 'ms_username', 'login_name'];
			optionalKeys.forEach(key => {
				try {
					const value = uni.getStorageSync(key);
					if (value) {
						allStorageData[key] = value;
						console.log(` [页面初始化] 发现额外存储键 "${key}":`, typeof value === 'object' ? JSON
							.stringify(value) : value);
					}
				} catch (e) {
					// 静默处理，不输出错误信息
				}
			});

			console.log(' [页面初始化] 所有存储数据:', allStorageData);

			// 获取用户信息和车场名称，如果为空则使用默认值
			const userInfo = uni.getStorageSync('userInfo');
			this.currentPark = userInfo?.parkName || // 优先使用parkName字段
				userInfo?.yardName ||
				userInfo?.patrolData?.yardName ||
				userInfo?.patrolData?.community || // 巡查员负责的小区
				userInfo?.userInfo?.yardName ||
				userInfo?.userInfo?.community || // 巡查员负责的小区
				userInfo?.userInfo?.parkName || // 嵌套结构中的parkName
				userInfo?.ownername ||
				userInfo?.realName ||
				userInfo?.community || // 直接的community字段
				'主车场';
			console.log(' [页面初始化] 当前车场名称:', this.currentPark);
			console.log(' [页面初始化] 用户信息结构:', userInfo);

			//  如果userInfo为空，尝试从其他存储键获取
			if (!userInfo) {
				console.log('⚠️ [页面初始化] userInfo为空，尝试从其他存储键获取用户信息');
				this.tryGetUserInfoFromOtherSources();
			}
		},

		//  尝试从其他来源获取用户信息
		tryGetUserInfoFromOtherSources() {
			console.log(' [页面初始化] 尝试从其他来源获取用户信息...');

			// 尝试从localStorage获取（兼容web端）
			try {
				if (typeof localStorage !== 'undefined') {
					const localUserInfo = localStorage.getItem('userInfo') ||
						localStorage.getItem('user') ||
						localStorage.getItem('loginInfo');
					if (localUserInfo) {
						console.log('✅ [页面初始化] 从localStorage获取到用户信息:', localUserInfo);
						try {
							const parsedUserInfo = JSON.parse(localUserInfo);
							// 存储到uni.storage中
							uni.setStorageSync('userInfo', parsedUserInfo);
							console.log('✅ [页面初始化] 已将localStorage中的用户信息同步到uni.storage');
						} catch (e) {
							console.log('❌ [页面初始化] 解析localStorage用户信息失败:', e.message);
						}
					}
				}
			} catch (e) {
				console.log('❌ [页面初始化] 访问localStorage失败:', e.message);
			}
		},

		//  从所有可能的来源获取用户信息（增强版）
		getUserInfoFromAllSources() {
			console.log(' [获取用户信息] 从所有可能的来源获取用户信息...');

			//  扩展的存储键列表，包含我们新添加的键
			const allStorageKeys = [
				'userInfo', 'user', 'loginInfo', 'patrolInfo', 'managerInfo',
				'communityInfo', 'yardInfo', 'parkInfo', 'scannedAddressInfo'
			];

			// 1. 尝试从uni.storage获取所有可能的键
			for (const key of allStorageKeys) {
				try {
					const userInfo = uni.getStorageSync(key);
					if (userInfo && typeof userInfo === 'object') {
						console.log(`✅ [获取用户信息] 从uni.storage获取到${key}:`, userInfo);

						//  如果是管家信息，获取额外的小区信息
						if (key === 'managerInfo' || key === 'communityInfo' || key === 'yardInfo') {
							const mainUserInfo = uni.getStorageSync('userInfo') || {};
							const enhancedUserInfo = {
								...mainUserInfo,
								...userInfo,
								yardName: userInfo.parkName || userInfo.community || userInfo.yardName || userInfo
									.communityName ||
									mainUserInfo.yardName || '主车场',
								userName: userInfo.username || userInfo.realName || userInfo.butlerName ||
									mainUserInfo.userName ||
									'用户',
								userInfo: {
									...mainUserInfo.userInfo,
									...userInfo,
									managerInfo: userInfo,
									community: userInfo.parkName || userInfo.community || userInfo.yardName ||
										userInfo.communityName ||
										'主车场',
									yardName: userInfo.parkName || userInfo.community || userInfo.yardName ||
										userInfo.communityName ||
										'主车场',
									parkName: userInfo.parkName || userInfo.community || userInfo.yardName || '主车场'
								}
							};
							console.log(` [获取用户信息] 增强的用户信息（包含${key}）:`, enhancedUserInfo);
							return enhancedUserInfo;
						}

						// 确保返回的用户信息包含必要的字段
						if (!userInfo.yardName && !userInfo.userName) {
							userInfo.yardName = userInfo.parkName || userInfo.yardName || userInfo.community ||
								userInfo.userInfo
									?.community || userInfo.userInfo?.yardName || userInfo.userInfo?.parkName || '主车场';
							userInfo.userName = userInfo.userName || userInfo.username || userInfo.realName || userInfo
								.userInfo
								?.username || userInfo.userInfo?.realName || userInfo.roleText || '用户';
						}

						return userInfo;
					}
				} catch (e) {
					console.log(`❌ [获取用户信息] 读取${key}失败:`, e.message);
				}
			}

			// 2. 尝试从localStorage获取（兼容web端）
			try {
				if (typeof localStorage !== 'undefined') {
					for (const key of allStorageKeys) {
						const localUserInfo = localStorage.getItem(key);
						if (localUserInfo) {
							console.log(`✅ [获取用户信息] 从localStorage获取到${key}:`, localUserInfo);
							try {
								const parsedUserInfo = JSON.parse(localUserInfo);
								// 存储到uni.storage中
								uni.setStorageSync('userInfo', parsedUserInfo);
								console.log('✅ [获取用户信息] 已将localStorage中的用户信息同步到uni.storage');
								return parsedUserInfo;
							} catch (e) {
								console.log('❌ [获取用户信息] 解析localStorage用户信息失败:', e.message);
							}
						}
					}
				}
			} catch (e) {
				console.log('❌ [获取用户信息] 访问localStorage失败:', e.message);
			}

			// 3.  尝试组合多个存储键的信息
			try {
				const userInfo = uni.getStorageSync('userInfo') || {};
				const managerInfo = uni.getStorageSync('managerInfo') || {};
				const communityInfo = uni.getStorageSync('communityInfo') || {};
				const scannedInfo = uni.getStorageSync('scannedAddressInfo') || {};

				if (Object.keys(userInfo).length > 0 || Object.keys(managerInfo).length > 0 ||
					Object.keys(communityInfo).length > 0 || Object.keys(scannedInfo).length > 0) {

					const combinedUserInfo = {
						...userInfo,
						yardName: userInfo.yardName || managerInfo.community || communityInfo.yardName ||
							scannedInfo.community || communityInfo.name || '主车场',
						userName: userInfo.userName || managerInfo.username || managerInfo.butlerName ||
							scannedInfo.butlerName || userInfo.username || '用户',
						userInfo: {
							...userInfo.userInfo,
							managerInfo: managerInfo,
							community: managerInfo.community || communityInfo.yardName || scannedInfo.community ||
								'主车场',
							yardName: managerInfo.community || communityInfo.yardName || scannedInfo.community ||
								'主车场'
						}
					};

					console.log(' [获取用户信息] 组合多个存储键的信息:', combinedUserInfo);
					return combinedUserInfo;
				}
			} catch (e) {
				console.log('❌ [获取用户信息] 组合存储信息失败:', e.message);
			}

			console.log('❌ [获取用户信息] 未找到任何用户信息');
			return null;
		},




		// 测试原有搜索接口
		async testOriginalSearchAPI() {
			this.addTestResult('开始测试原有搜索接口...', 'originalSearch', true);

			try {
				const startTime = Date.now();
				const response = await ownerApi.getPlateSuggestions(this.testParams.keyword, {
					page: 1,
					size: 20
				});
				const endTime = Date.now();

				this.addTestResult(
					`原有搜索成功！耗时: ${endTime - startTime}ms，找到 ${response.data ? response.data.length : 0} 条记录`,
					'originalSearch',
					true,
					response
				);

			} catch (error) {
				this.addTestResult(
					`原有搜索失败：${error.message || error}`,
					'originalSearch',
					false,
					error
				);
			}
		},

		// 测试车辆详情接口
		async testVehicleDetailsAPI() {
			if (!this.testParams.keyword) {
				this.addTestResult('请输入车牌号', 'vehicleDetails', false);
				return;
			}

			this.addTestResult('开始测试车辆详情接口...', 'vehicleDetails', true);

			try {
				const startTime = Date.now();
				const response = await violationApi.getVehicleDetails(this.testParams.keyword);
				const endTime = Date.now();

				this.addTestResult(
					`车辆详情获取成功！耗时: ${endTime - startTime}ms`,
					'vehicleDetails',
					true,
					response
				);

			} catch (error) {
				this.addTestResult(
					`车辆详情获取失败：${error.message || error}`,
					'vehicleDetails',
					false,
					error
				);
			}
		},

		// 添加测试结果
		addTestResult(message, apiName, success, data = null) {
			const result = {
				timestamp: new Date().toLocaleTimeString(),
				apiName: apiName,
				message: message,
				success: success,
				data: data
			};

			this.apiTestResults.unshift(result);

			// 限制结果数量
			if (this.apiTestResults.length > 10) {
				this.apiTestResults = this.apiTestResults.slice(0, 10);
			}
		},

		// 检查数据库状态
		async checkDatabaseStatus() {
			this.addTestResult('开始检查数据库状态...', 'databaseCheck', true);

			try {
				// 测试一些常见的车牌号前缀
				const testKeywords = ['京', '沪', '粤', '川', '鲁', '苏', '浙', '豫', '冀', '晋'];
				let totalRecords = 0;
				let successfulQueries = 0;

				for (const keyword of testKeywords) {
					try {
						const response = await violationApi.searchMonthTicketVehicles({
							keyword: keyword,
							parkName: '',
							onlyInPark: false,
							page: 1,
							size: 1
						});

						if (response && response.total > 0) {
							totalRecords += response.total;
							successfulQueries++;
						}
					} catch (error) {
						// 忽略单个查询错误
					}
				}

				this.addTestResult(
					`数据库检查完成！\n` +
					`- 测试了 ${testKeywords.length} 个常见车牌前缀\n` +
					`- 有数据的前缀: ${successfulQueries} 个\n` +
					`- 总记录数约: ${totalRecords} 条\n` +
					`${totalRecords === 0 ? '⚠️ 数据库中可能没有车辆数据，建议联系管理员添加测试数据' : '✅ 数据库中有车辆数据'}`,
					'databaseCheck',
					true, {
					totalRecords,
					successfulQueries,
					testKeywords: testKeywords.length
				}
				);

			} catch (error) {
				this.addTestResult(
					`数据库检查失败：${error.message || error}`,
					'databaseCheck',
					false,
					error
				);
			}
		},

		// 清空测试结果
		clearTestResults() {
			this.apiTestResults = [];
			this.addTestResult('测试结果已清空', 'system', true);
		},

		// 格式化测试数据
		formatTestData(data) {
			if (!data) return '';
			try {
				// 只显示关键信息，避免过长
				if (data.records && Array.isArray(data.records)) {
					return `找到 ${data.records.length} 条记录，总计 ${data.total || 0} 条`;
				} else if (data.data && Array.isArray(data.data)) {
					return `找到 ${data.data.length} 条记录`;
				} else if (typeof data === 'object') {
					return `数据类型: ${Object.keys(data).join(', ')}`;
				}
				return JSON.stringify(data).substring(0, 100) + '...';
			} catch (e) {
				return String(data).substring(0, 100);
			}
		},

		// ========== 原有方法 ==========

		// 返回上一页
		goBack() {
			// 检查是否有未保存的数据
			if (this.hasUnsavedData()) {
				uni.showModal({
					title: '提示',
					content: '您有未保存的数据，确定要离开吗？',
					success: (res) => {
						if (res.confirm) {
							this.navigateBack();
						}
					}
				});
			} else {
				this.navigateBack();
			}
		},

		// 安全的返回导航
		navigateBack() {
			const pages = getCurrentPages();
			if (pages.length > 1) {
				// 如果有上一页，正常返回
				uni.navigateBack();
			} else {
				// 如果是第一个页面，跳转到首页
				uni.reLaunch({
					url: '/pages/violation/violation'
				});
			}
		},

		// 检查是否有未保存的数据
		hasUnsavedData() {
			return this.formData.plateNumber ||
				this.formData.violationType ||
				this.formData.location ||
				this.formData.description ||
				this.formData.photos.length > 0 ||
				this.formData.shouldBlacklist ||
				this.formData.blacklistReason;
		},

		// ============ 搜索结果相关方法 ============
		// 打开车牌搜索结果列表
		openPlateSearchModal() {
			this.showPlateSearchResults = true;
			this.plateSearchKeyword = this.formData.plateNumber;
			this.plateFocused = true;
			this.expandedGroups = [];
			// 如果已有关键词，立即搜索
			if (this.plateSearchKeyword) {
				this.searchPlates();
			}
		},

		// 关闭车牌搜索结果列表
		closePlateSearchResults() {
			this.showPlateSearchResults = false;
			this.plateSearchKeyword = '';
			this.plateSuggestions = [];
			this.groupedSuggestions = [];
			this.plateFocused = false;
			this.showLoadMoreBtn = false;
			this.currentSearchPage = 1;
			this.totalSearchResults = 0;
			this.expandedGroups = [];
		},

		// 兼容旧方法名
		closePlateSearchModal() {
			this.closePlateSearchResults();
		},

		// 切换车牌分组的展开/折叠状态
		togglePlatesExpanded(groupIndex) {
			const index = this.expandedGroups.indexOf(groupIndex);
			if (index > -1) {
				// 已展开，收起
				this.expandedGroups.splice(index, 1);
			} else {
				// 未展开，展开
				this.expandedGroups.push(groupIndex);
			}
		},



		// 车牌搜索输入（优化版本）
		onPlateSearchInput() {
			// 清除之前的定时器
			if (this.plateSearchTimer) {
				clearTimeout(this.plateSearchTimer);
			}

			// 设置新的搜索定时器（优化防抖延迟）
			this.plateSearchTimer = setTimeout(() => {
				this.searchPlates();
			}, 200);
		},



		//  执行车牌搜索 - 使用本地数据库接口（替代外部API）
		async searchPlates() {
			console.log(' [本地数据搜索] 开始搜索车牌信息，关键词:', this.plateSearchKeyword);

			if (!this.plateSearchKeyword || this.plateSearchKeyword.trim().length === 0) {
				console.log('⚠️ [本地数据搜索] 搜索关键词为空，不执行搜索');
				this.showPlateSuggestions = false;
				this.plateSuggestions = [];
				return;
			}

			//  调试：检查用户信息和车场名称
			let userInfo = uni.getStorageSync('userInfo');

			//  如果userInfo为空，尝试从其他来源获取
			if (!userInfo) {
				console.log('⚠️ [本地数据搜索] userInfo为空，尝试从其他来源获取');
				userInfo = this.getUserInfoFromAllSources();
			}

			//  尝试多个可能的字段获取车场名称，优先使用巡查员相关信息
			const parkName = userInfo?.yardName ||
				userInfo?.patrolData?.yardName ||
				userInfo?.patrolData?.community || // 巡查员负责的小区
				userInfo?.userInfo?.yardName ||
				userInfo?.userInfo?.community || // 巡查员负责的小区
				userInfo?.parkName ||
				userInfo?.parkingLotName ||
				userInfo?.ownername ||
				userInfo?.realName ||
				userInfo?.community || // 直接的community字段
				this.currentPark; //  默认停车场，确保搜索功能正常工作
			this.performActualSearch(parkName);
		},

		//  实际执行搜索的方法
		async performActualSearch(parkName) {
			console.log(' [智能搜索] 最终使用的车场名称:', parkName);
			await this.executeSearch(parkName);
		},

		//  提取搜索执行逻辑 - 改为使用本地数据库 + 预约数据
		async executeSearch(parkName) {
			this.isSearching = true;
			this.usingSmartSearch = false; //  重置搜索类型标识
			try {
				// 重置分页信息
				this.currentSearchPage = 1;
				this.showLoadMoreBtn = false;

				console.log(' [月票车搜索] 查询月票车数据...');

				//  临时测试：对比所有可用的搜索接口
				console.log(' [测试对比] 开始对比所有搜索接口...');
				const testResults = {};

				try {
					// 1. 测试车主搜索接口 (owners.plateSuggestions)
					const ownerSearchTest = await ownerApi.getPlateSuggestions(this.plateSearchKeyword, {
						page: 1,
						size: 200
					}).catch(err => {
						console.warn(' [测试1] 车主搜索接口失败:', err);
						return null;
					});

					testResults.ownerSearch = ownerSearchTest;
					console.log(' [测试1] 车主搜索接口 (/parking/violations/owners/plate-suggestions)');
					console.log(' [测试1] 结果:', JSON.stringify(ownerSearchTest, null, 2));
					if (ownerSearchTest && ownerSearchTest.data) {
						console.log(
							` [测试1] 返回 ${Array.isArray(ownerSearchTest.data) ? ownerSearchTest.data.length : '非数组'} 条记录`
						);
					}

					// 2. 测试月票车获取车牌建议接口
					const monthTicketSuggestionsTest = await violationApi.getMonthTicketPlateSuggestions(this
						.plateSearchKeyword, parkName, 200).catch(err => {
							console.warn(' [测试2] 月票车建议接口失败:', err);
							return null;
						});

					testResults.monthTicketSuggestions = monthTicketSuggestionsTest;
					console.log(' [测试2] 月票车建议接口 (/parking/monthTicket/getPlateSuggestions)');
					console.log(' [测试2] 结果:', JSON.stringify(monthTicketSuggestionsTest, null, 2));
					if (monthTicketSuggestionsTest && monthTicketSuggestionsTest.data) {
						console.log(
							` [测试2] 返回 ${Array.isArray(monthTicketSuggestionsTest.data) ? monthTicketSuggestionsTest.data.length : '非数组'} 条记录`
						);
					}

					// 3. 测试本地车牌建议接口
					const localSuggestionsTest = await violationApi.getLocalPlateSuggestions(this
						.plateSearchKeyword, parkName, 200).catch(err => {
							console.warn(' [测试3] 本地建议接口失败:', err);
							return null;
						});

					testResults.localSuggestions = localSuggestionsTest;
					console.log(' [测试3] 本地建议接口 (/parking/monthTicket/getLocalPlateSuggestions)');
					console.log(' [测试3] 结果:', JSON.stringify(localSuggestionsTest, null, 2));
					if (localSuggestionsTest && localSuggestionsTest.data) {
						console.log(
							` [测试3] 返回 ${Array.isArray(localSuggestionsTest.data) ? localSuggestionsTest.data.length : '非数组'} 条记录`
						);
					}

					// 汇总测试结果
					console.log(' [测试汇总] 所有接口测试完成');
					console.log(' [测试汇总] 结果统计:');
					Object.keys(testResults).forEach(key => {
						const result = testResults[key];
						if (result && result.data) {
							const count = Array.isArray(result.data) ? result.data.length :
								(result.data.records ? result.data.records.length : '未知格式');
							console.log(`   - ${key}: ${count} 条记录`);
						} else {
							console.log(`   - ${key}: 无数据或失败`);
						}
					});

				} catch (error) {
					console.error(' [测试对比] 测试过程出错:', error);
				}

				//  查询月票车数据
				const monthTicketResponse = await violationApi.searchLocalData({
					keyword: this.plateSearchKeyword,
					parkName: parkName,
					page: 1,
					size: 200
				}).catch(error => {
					console.warn('⚠️ [月票车搜索] 失败:', error);
					return null;
				});

				console.log(' [月票车搜索] 响应:', JSON.stringify(monthTicketResponse, null, 2));

				//  详细分析月票车搜索响应
				if (monthTicketResponse) {
					console.log(' [月票车搜索] 响应分析开始...');
					console.log(' [月票车搜索] 响应类型:', typeof monthTicketResponse);
					console.log(' [月票车搜索] 是否有data字段:', !!monthTicketResponse.data);
					if (monthTicketResponse.data) {
						console.log(' [月票车搜索] data字段类型:', typeof monthTicketResponse.data);
						console.log(' [月票车搜索] 是否有records字段:', !!monthTicketResponse.data.records);
						if (monthTicketResponse.data.records) {
							console.log(' [月票车搜索] records类型:', typeof monthTicketResponse.data.records);
							console.log(' [月票车搜索] 是否为数组:', Array.isArray(monthTicketResponse.data.records));
							console.log(' [月票车搜索] records长度:', monthTicketResponse.data.records.length);
							if (monthTicketResponse.data.total !== undefined) {
								console.log(' [月票车搜索] 总记录数(total):', monthTicketResponse.data.total);
							}
							if (monthTicketResponse.data.records.length > 0) {
								console.log(' [月票车搜索] 第一条记录车牌:', monthTicketResponse.data.records[0]
									.plateNumber);
							}
						}
					}
					console.log(' [月票车搜索] 响应分析结束');
				} else {
					console.log('⚠️ [月票车搜索] 响应为空或null');
				}

				// 合并搜索结果
				let allResults = [];

				// 处理月票车数据
				if (monthTicketResponse && monthTicketResponse.data && monthTicketResponse.data.records && Array
					.isArray(monthTicketResponse.data.records)) {
					const monthTicketResults = monthTicketResponse.data.records.map(item => ({
						plateNumber: item.plateNumber,
						ownerName: item.ownerName,
						ownerPhone: item.ownerPhone,
						ownerId: item.ownerId || item.monthTicketId || null,
						ticketName: item.ticketName,
						parkingSpot: item.parkingSpot,
						validStatus: item.validStatus,
						isFrozen: item.isFrozen,
						isInPark: item.isInPark,
						appointmentCount: item.appointmentCount || 0,
						violationCount: item.violationCount || 0,
						creditScore: item.creditScore || 100,
						remark: item.remark,
						remark1: item.remark1,
						remark2: item.remark2,
						remark3: item.remark3,
						address: item.address,
						dataSource: '月票车' // 标记数据来源
					}));
					allResults = [...allResults, ...monthTicketResults];
					console.log(`✅ [月票车搜索] 找到 ${monthTicketResults.length} 条记录`);
				}



				// 设置合并后的搜索结果
				if (allResults.length > 0) {
					//  为每个车牌获取违规记录
					console.log(' [获取违规记录] 开始获取违规记录...');
					const resultsWithViolations = await Promise.all(allResults.map(async (plate) => {
						try {
							const violationsResponse = await violationApi
								.getViolationsByPlateNumber(plate.plateNumber);
							const violations = violationsResponse && violationsResponse.data ?
								violationsResponse.data : [];

							console.log(
								` [违规记录] ${plate.plateNumber}: 找到 ${violations.length} 条违规记录`
							);

							return {
								...plate,
								violations: violations,
								violationCount: violations.length
							};
						} catch (error) {
							console.warn(`⚠️ [违规记录] 获取 ${plate.plateNumber} 违规记录失败:`, error);
							return {
								...plate,
								violations: [],
								violationCount: plate.violationCount || 0 // 保持原有的违规数量
							};
						}
					}));

					this.plateSuggestions = resultsWithViolations;
					this.totalSearchResults = resultsWithViolations.length;
					this.showLoadMoreBtn = false;
					this.showPlateSuggestions = true;
					this.usingSmartSearch = true;

					console.log(`✅ [月票车搜索] 总共找到 ${resultsWithViolations.length} 条记录`);

					// 如果结果较少，补充使用原有搜索接口
					if (resultsWithViolations.length < 5) {
						console.log(' [月票车搜索] 结果较少，补充原有搜索');
						await this.supplementWithOwnerSearch();
					}
				} else {
					console.log(' [月票车搜索] 无结果，使用备用搜索');
					this.usingSmartSearch = false;
					await this.fallbackSearchInModal();
				}

			} catch (error) {
				console.error('❌ [月票车搜索] 搜索失败，错误详情:', error);
				console.error('❌ [月票车搜索] 错误类型:', error.name);
				console.error('❌ [月票车搜索] 错误消息:', error.message);
				console.error('❌ [月票车搜索] 错误状态:', error.status || error.statusCode);
				console.log(' [月票车搜索] 自动切换到备用搜索');
				this.usingSmartSearch = false;
				await this.fallbackSearchInModal();
			} finally {
				this.isSearching = false;
			}
		},

		//  补充使用原有搜索接口（当智能搜索结果较少时）
		async supplementWithOwnerSearch() {
			try {
				console.log(' [补充搜索] 使用原有接口补充搜索结果');
				const response = await ownerApi.getPlateSuggestions(this.plateSearchKeyword, {
					page: 1,
					size: 20
				});

				if (response && response.data && Array.isArray(response.data)) {
					// 合并搜索结果，去重
					const existingPlates = this.plateSuggestions.map(item => item.plateNumber);
					const additionalSuggestions = response.data
						.filter(item => {
							const plateNumber = item.plateNumber || item.plate_number || item.plate;
							return !existingPlates.includes(plateNumber);
						})
						.map(item => ({
							plateNumber: item.plateNumber || item.plate_number || item.plate,
							ownerName: item.ownerName || item.owner_name || item.name,
							ownerId: item.ownerId || item.owner_id || item.id,
							appointmentCount: 0
						}));

					//  为补充的车牌获取违规记录
					console.log(' [补充搜索] 获取违规记录...');
					const additionalWithViolations = await Promise.all(additionalSuggestions.map(async (plate) => {
						try {
							const violationsResponse = await violationApi
								.getViolationsByPlateNumber(plate.plateNumber);
							const violations = violationsResponse && violationsResponse.data ?
								violationsResponse.data : [];

							return {
								...plate,
								violations: violations,
								violationCount: violations.length
							};
						} catch (error) {
							console.warn(`⚠️ [补充搜索] 获取 ${plate.plateNumber} 违规记录失败:`, error);
							return {
								...plate,
								violations: [],
								violationCount: 0
							};
						}
					}));

					this.plateSuggestions = [...this.plateSuggestions, ...additionalWithViolations];
					console.log(`✅ [补充搜索] 补充了 ${additionalWithViolations.length} 个结果`);
				}
			} catch (error) {
				console.error('❌ [补充搜索] 失败:', error);
			}
		},

		//  备用搜索方法（当智能搜索无结果时）
		async fallbackSearchInModal() {
			try {
				console.log(' [备用搜索] 使用原有搜索接口 ownerApi.getPlateSuggestions');
				console.log(' [备用搜索] 搜索关键词:', this.plateSearchKeyword);
				const response = await ownerApi.getPlateSuggestions(this.plateSearchKeyword, {
					page: 1,
					size: 200
				});

				console.log(' [备用搜索] 原有接口响应:', response);

				if (response && response.data && Array.isArray(response.data)) {
					const basicResults = response.data.map(item => {
						const plateNumber = item.plateNumber || item.plate_number || item.plate;
						return {
							plateNumber: plateNumber,
							ownerName: item.ownerName || item.owner_name || item.name,
							ownerId: item.ownerId || item.owner_id || item.id,
							appointmentCount: 0
						};
					});

					//  为备用搜索结果获取违规记录
					console.log(' [备用搜索] 获取违规记录...');
					const resultsWithViolations = await Promise.all(basicResults.map(async (plate) => {
						try {
							const violationsResponse = await violationApi
								.getViolationsByPlateNumber(plate.plateNumber);
							const violations = violationsResponse && violationsResponse.data ?
								violationsResponse.data : [];

							return {
								...plate,
								violations: violations,
								violationCount: violations.length
							};
						} catch (error) {
							console.warn(`⚠️ [备用搜索] 获取 ${plate.plateNumber} 违规记录失败:`, error);
							return {
								...plate,
								violations: [],
								violationCount: 0
							};
						}
					}));

					this.plateSuggestions = resultsWithViolations;

					const totalCount = response.total || response.count || response.data.length;
					this.totalSearchResults = totalCount;
					this.showLoadMoreBtn = totalCount > response.data.length || response.data.length === 200;

					console.log(`✅ [备用搜索] 使用原有接口找到 ${this.plateSuggestions.length} 个结果，总计 ${totalCount} 条`);
					console.log(`⚠️ [备用搜索] 注意：这是备用搜索结果，不是智能搜索！`);

					// 异步获取预约记录条数
					this.loadAppointmentCountsAsync();
				} else {
					this.plateSuggestions = [];
					this.showLoadMoreBtn = false;
					console.log('⚠️ [备用搜索] 无结果');
				}
			} catch (error) {
				console.error('❌ [备用搜索] 失败:', error);
				this.plateSuggestions = [];
				this.showLoadMoreBtn = false;

				uni.showToast({
					title: '搜索失败，请重试',
					icon: 'none',
					duration: 2000
				});
			}
		},

		// 异步加载预约记录条数（已移除预约记录查询功能）
		async loadAppointmentCountsAsync() {
			// 已移除预约记录查询功能
			console.log('预约记录查询功能已移除');
		},



		// 选择车牌建议
		async selectPlateSuggestion(suggestion) {
			this.formData.plateNumber = suggestion.plateNumber;
			this.closePlateSearchModal();

			try {
				//  只调用 getOwnerInfo 查询业主信息（包括违规记录）
				const owner = await this.getOwnerInfo(this.formData.plateNumber);
				console.log('owner', owner);
				this.ownerInfo = owner || null;

				//  如果查询到业主信息，显示成功提示
				if (this.ownerInfo) {
					uni.showToast({
						title: '已加载车主信息',
						icon: 'success',
						duration: 1500
					});
				}
			} catch (e) {
				console.error('查询业主信息失败:', e);
				this.ownerInfo = null;
			}

			//  车牌选择完成后自动关闭虚拟键盘
			this.hideKeyboard();
		},

		//  从分组中选择车牌
		async selectPlateFromGroup(plate, group) {
			this.formData.plateNumber = plate.plateNumber;
			this.closePlateSearchModal();

			try {
				//  只调用 getOwnerInfo 查询业主信息（包括违规记录）
				const owner = await this.getOwnerInfo(this.formData.plateNumber);

				if (owner) {
					this.ownerInfo = owner;

					//  如果查询到业主信息，显示成功提示
					uni.showToast({
						title: '已加载车主信息',
						icon: 'success',
						duration: 1500
					});
				} else {
					// 当API返回null时，使用分组中的车主信息（兜底）
					//  特别处理月票车的车位信息
					let addressInfo = group.address || '未登记';
					if (group.ticketName) {
						// 月票车使用车位信息作为地址
						const parkingSpots = this.getParkingSpots(group);
						if (parkingSpots.length > 0) {
							addressInfo = `车位：${parkingSpots.join('、')}`;
						}
					}

					this.ownerInfo = {
						//  修复：正确设置车主ID，优先使用plate中的ownerId（来自预约数据），如果没有则使用group中的
						ownerId: plate.ownerId || group.ownerId || null,
						monthTicketId: group.ticketName ? (group.ownerId || plate.ownerId) : null, // 月票ID

						name: group.ownerName || '未知车主',
						phone: group.ownerPhone || '未登记',
						address: addressInfo,
						creditScore: group.creditScore || 100,

						//  月票相关信息
						isMonthlyTicket: !!group.ticketName, // 标记是否为月票车
						ticketName: group.ticketName || null,
						parkingSpots: group.ticketName ? this.getParkingSpots(group) : [],

						//  添加违规记录（从plate中获取）
						violationRecords: plate.violations || [],
						violationCount: plate.violationCount || 0
					};

					// 显示使用兜底数据的提示
					const vehicleType = group.ticketName ? '月票车' : '车辆';
					uni.showToast({
						title: `已选择 ${vehicleType} ${plate.plateNumber}`,
						icon: 'success',
						duration: 1500
					});
				}
			} catch (e) {
				console.log(' API查询失败，使用分组中的车主信息:', e);
				// 兜底：使用分组中的车主信息
				let addressInfo = group.address || '未登记';
				if (group.ticketName) {
					// 月票车使用车位信息作为地址
					const parkingSpots = this.getParkingSpots(group);
					if (parkingSpots.length > 0) {
						addressInfo = `车位：${parkingSpots.join('、')}`;
					}
				}

				this.ownerInfo = {
					//  修复：正确设置车主ID，优先使用plate中的ownerId（来自预约数据），如果没有则使用group中的
					ownerId: plate.ownerId || group.ownerId || null,
					monthTicketId: group.ticketName ? (group.ownerId || plate.ownerId) : null, // 月票ID

					name: group.ownerName || '未知车主',
					phone: group.ownerPhone || '未登记',
					address: addressInfo,
					creditScore: group.creditScore || 100,

					//  月票相关信息
					isMonthlyTicket: !!group.ticketName, // 标记是否为月票车
					ticketName: group.ticketName || null,
					parkingSpots: group.ticketName ? this.getParkingSpots(group) : [],

					//  添加违规记录（从plate中获取）
					violationRecords: plate.violations || [],
					violationCount: plate.violationCount || 0
				};
			}

			//  车牌选择完成后自动关闭虚拟键盘
			this.hideKeyboard();
		},

		//  判断是否为新能源车牌
		isNewEnergyPlate(plateNumber) {
			if (!plateNumber) return false;
			// 新能源车牌通常为8位，普通车牌为7位
			// 或者以特定字母开头（如D、F等）
			return plateNumber.length === 8 ||
				plateNumber.includes('D') ||
				plateNumber.includes('F');
		},

		//  获取车位信息（从remark字段解析）
		getParkingSpots(group) {
			const spots = [];

			// 检查各种可能的remark字段
			const remarkFields = ['remark', 'remark1', 'remark2', 'remark3'];

			remarkFields.forEach(field => {
				const remarkValue = group[field];
				if (remarkValue && typeof remarkValue === 'string' && remarkValue.trim()) {
					// 去除空白字符并添加到车位列表
					const spot = remarkValue.trim();
					if (spot && !spots.includes(spot)) {
						spots.push(spot);
					}
				}
			});

			return spots;
		},


		// 车牌号输入变化
		async onPlateNumberChange() {
			const minLength = this.isNewEnergyMode ? 8 : 7;
			if (this.formData.plateNumber && this.formData.plateNumber.length >= minLength) {
				try {
					//  步骤1：先检查是否在白名单中
					console.log(' [白名单检查] 开始检查车牌:', this.formData.plateNumber);
					const whitelistCheckResult = await this.checkWhitelistStatus(this.formData.plateNumber);

					//  步骤2：如果是白名单车辆，弹窗确认
					if (whitelistCheckResult.inWhitelist) {
						console.log('⚠️ [白名单检查] 车辆在白名单中，需要用户确认');
						this.whitelistInfo = whitelistCheckResult.whitelistData;
						this.isWhitelistVehicle = true;

						//  车牌查询完成后自动关闭虚拟键盘
						this.hideKeyboard();

						// 弹窗提示用户确认是否继续添加违规记录
						const shouldContinue = await this.showWhitelistConfirmDialog();

						if (shouldContinue) {
							// 用户确认继续，查询车主信息
							console.log('✅ [白名单检查] 用户确认继续添加违规记录');
							this.ownerInfo = await this.getOwnerInfo(this.formData.plateNumber);

							if (this.ownerInfo) {
								uni.showToast({
									title: '已加载车主信息',
									icon: 'success',
									duration: 1500
								});
							} else {
								// 未查询到业主信息，显示提示
								uni.showToast({
									title: '暂未查询到该车辆的车主信息',
									icon: 'none',
									duration: 2000
								});
							}
						} else {
							// 用户取消，清空车牌号
							console.log('❌ [白名单检查] 用户取消操作，清空车牌号');
							this.clearPlateNumber();
							this.whitelistInfo = null;
							this.isWhitelistVehicle = false;
							return;
						}
					} else {
						//  步骤3：不是白名单车辆，正常查询车主信息
						console.log('✅ [白名单检查] 车辆不在白名单中，正常查询车主信息');
						this.whitelistInfo = null;
						this.isWhitelistVehicle = false;

						//  只调用 getOwnerInfo 查询业主信息（包括违规记录）
						this.ownerInfo = await this.getOwnerInfo(this.formData.plateNumber);

						//  车牌查询完成后自动关闭虚拟键盘
						this.hideKeyboard();

						//  如果查询到业主信息，显示成功提示
						if (this.ownerInfo) {
							uni.showToast({
								title: '已加载车主信息',
								icon: 'success',
								duration: 1500
							});
						} else {
							// 未查询到业主信息，显示提示
							uni.showToast({
								title: '暂未查询到该车辆的车主信息',
								icon: 'none',
								duration: 2000
							});
						}
					}
				} catch (error) {
					console.error('❌ [车牌号处理] 处理失败:', error);
					this.ownerInfo = null;
					this.whitelistInfo = null;
					this.isWhitelistVehicle = false;
					// 显示查询失败提示
					uni.showToast({
						title: '暂未查询到该车辆的车主信息',
						icon: 'none',
						duration: 2000
					});
					// 即使查询失败也关闭键盘
					this.hideKeyboard();
				}
			} else {
				this.ownerInfo = null;
				this.whitelistInfo = null;
				this.isWhitelistVehicle = false;
			}
		},

		//  检查车辆是否在白名单中
		async checkWhitelistStatus(plateNumber) {
			try {
				const response = await whitelistAPI.getByPlate(plateNumber, this.selectedParkingLot);

				console.log(' [白名单查询] API响应:', response);

				if (response.data && response.data.code === '0' && response.data.data) {
					// 找到白名单记录
					return {
						inWhitelist: true,
						whitelistData: response.data.data
					};
				} else {
					// 未找到白名单记录
					return {
						inWhitelist: false,
						whitelistData: null
					};
				}
			} catch (error) {
				console.error('❌ [白名单查询] 查询失败:', error);
				// 查询失败时，认为不在白名单中，继续正常流程
				return {
					inWhitelist: false,
					whitelistData: null
				};
			}
		},

		//  显示白名单确认对话框
		showWhitelistConfirmDialog() {
			return new Promise((resolve) => {
				const whitelistData = this.whitelistInfo;

				// 构建提示内容
				let content = `车牌：${whitelistData.plateNumber || this.formData.plateNumber}\n`;
				content += `车主：${whitelistData.ownerName || '未知'}\n`;
				if (whitelistData.ownerPhone) {
					content += `电话：${whitelistData.ownerPhone}\n`;
				}
				content += `\n此车辆在白名单中，是否要添加违规记录？`;

				uni.showModal({
					title: '⚠️ 白名单车辆提醒',
					content: content,
					confirmText: '继续添加',
					cancelText: '取消',
					confirmColor: '#ff6b6b',
					success: (res) => {
						if (res.confirm) {
							// 用户点击"继续添加"
							resolve(true);
						} else if (res.cancel) {
							// 用户点击"取消"
							resolve(false);
						}
					},
					fail: () => {
						// 弹窗失败，默认取消
						resolve(false);
					}
				});
			});
		},

		// 获取车主信息 - 调用融合接口（ACMS）+ 查询违规记录
		async getOwnerInfo(plateNumber) {
			try {
				console.log(' [融合查询] 正在查询车主信息:', plateNumber);
				console.log(' [融合查询] 当前车场:', this.selectedParkingLot);

				let ownerInfo = null;

				//  优先使用融合接口（针对东北林业大学）
				if (this.selectedParkingLot === '东北林业大学') {
					try {
						const mergedResponse = await ownerAPI.getMergedVipAndOwnerInfo(
							plateNumber,
							this.selectedParkingLot
						);

						console.log('✅ [融合查询] 融合接口查询成功:', mergedResponse);

						if (mergedResponse && mergedResponse.data.code === '0' && mergedResponse.data.data) {
							const data = mergedResponse.data.data;
							ownerInfo = {
								// 基本信息
								name: data.ownerName || '未知车主',
								phone: data.ownerPhone || '未登记',
								address: data.ownerAddress || '未登记', // customer_department

								// 月票信息 - 只有在不是访客预约时才标记为月票车
								ticketName: data.vipTypeName || null,
								isMonthlyTicket: !!data.vipTypeName && !data.hasVisitorReservation,
								monthTicketName: data.vipTypeName,

								// 扩展信息
								ownerCategory: data.ownerCategory || null, // customer_address
								customerCompany: data.customerCompany || null,
								customerRoomNumber: data.customerRoomNumber || null,

								// 访客预约信息
								visitorReservations: data.visitorReservations || [],
								hasVisitorReservation: data.hasVisitorReservation || false,
								dataSource: data.dataSource || null,

								// 其他
								creditScore: 100, // 默认信用分
								ownerId: null,
								monthTicketId: null
							};
						}
					} catch (error) {
						console.warn('⚠️ [融合查询] 融合接口调用失败，尝试备用接口:', error);
					}
				}

				// 备用：调用原有的API接口
				if (!ownerInfo) {
					console.log(' [备用查询] 使用原有接口查询');
					const response = await ownerApi.getOwnerByPlate(plateNumber);

					console.log('✅ [备用查询] 车主信息查询成功:', response);

					// 确保返回的数据格式符合预期
					if (response && response.data) {
						const ownerData = response.data;
						ownerInfo = {
							ownerId: ownerData.ownerId || ownerData.id,
							name: ownerData.name || ownerData.ownerName,
							phone: ownerData.phone || ownerData.phoneNumber,
							address: ownerData.address || ownerData.homeAddress,
							creditScore: ownerData.creditScore || 0,
							//  添加月票相关信息
							ticketName: ownerData.ticketName || ownerData.monthTicketName,
							isMonthlyTicket: !!(ownerData.ticketName || ownerData.monthTicketName),
							monthTicketId: ownerData.monthTicketId || ownerData.ticketId
						};
					}
				}

				//  如果查询到业主信息，自动查询违规记录
				if (ownerInfo) {
					try {
						console.log(' [违规记录查询] 开始查询违规记录...');
						const violationsResponse = await violationApi.getViolationsByPlateNumber(plateNumber);
						const violations = violationsResponse && violationsResponse.data ? violationsResponse.data
							.records : [];
						console.log('violations', violationsResponse);
						console.log(`✅ [违规记录查询] 找到 ${violations.length} 条违规记录`);

						// 添加违规记录到业主信息
						ownerInfo.violationRecords = violations;
						ownerInfo.violationCount = violations.length;

						//  如果违规记录为0，查询黑名单信息
						if (violations.length === 0) {
							console.log(' [黑名单查询] 违规记录为0，开始查询黑名单信息...');
							try {
								const blacklistResponse = await ownerAPI.getBlacklistInfo(plateNumber, this.selectedParkingLot);

								if (blacklistResponse && blacklistResponse.data && blacklistResponse.data.code === '0') {
									const blacklistData = blacklistResponse.data.data;
									const blacklistInfos = blacklistData.blacklistInfos;

									if (blacklistInfos && blacklistInfos.length > 0) {
										console.log(' [黑名单查询] 找到黑名单记录:', blacklistInfos);

										// 构建弹窗内容
										const firstBlacklist = blacklistInfos[0];
										let content = `车牌：${firstBlacklist.carCode || plateNumber}\n`;
										content += `车主：${firstBlacklist.carOwner || '未知'}\n`;
										content += `黑名单类型：${firstBlacklist.vipTypeName || '未知'}\n`;
										content += `拉黑原因：${firstBlacklist.reason || '未填写'}\n`;

										if (firstBlacklist.isPermanent === 1) {
											content += `拉黑期限：永久\n`;
										} else if (firstBlacklist.startTime && firstBlacklist.endTime) {
											content += `拉黑期限：${firstBlacklist.startTime} 至 ${firstBlacklist.endTime}\n`;
										}

										if (blacklistInfos.length > 1) {
											content += `\n共有 ${blacklistInfos.length} 条黑名单记录`;
										}

										// 弹窗提示
										uni.showModal({
											title: '⚠️ 该车辆已在黑名单中',
											content: content,
											showCancel: true,
											cancelText: '知道了',
											confirmText: '查看详情',
											success: (res) => {
												if (res.confirm) {
													console.log(' [黑名单查询] 用户选择查看详情');
													// 可以在这里添加跳转到黑名单详情页的逻辑
												}
											}
										});
									} else {
										console.log('✅ [黑名单查询] 该车辆不在黑名单中');
									}
								} else {
									console.log('✅ [黑名单查询] 该车辆不在黑名单中');
								}
							} catch (blacklistError) {
								console.warn('⚠️ [黑名单查询] 查询失败:', blacklistError);
								// 黑名单查询失败不影响主流程
							}
						}
					} catch (error) {
						console.warn('⚠️ [违规记录查询] 查询失败:', error);
						// 查询失败不影响业主信息，设置为空数组
						ownerInfo.violationRecords = [];
						ownerInfo.violationCount = 0;
					}
				}

				return ownerInfo;
			} catch (error) {
				console.error('❌ [车主查询] 所有查询方式均失败:', error);

				// 如果是网络错误或后端服务不可用，返回null而不是模拟数据
				// 这样可以让调用方知道查询失败了
				return null;
			}
		},

		//  拨打电话功能
		makePhoneCall(phoneNumber) {
			if (!phoneNumber) {
				uni.showToast({
					title: '电话号码为空',
					icon: 'none'
				});
				return;
			}

			uni.showModal({
				title: '拨打电话',
				content: `确定要拨打 ${phoneNumber} 吗？`,
				success: (res) => {
					if (res.confirm) {
						uni.makePhoneCall({
							phoneNumber: phoneNumber,
							success: () => {
								console.log(' 拨打电话成功');
							},
							fail: (err) => {
								console.error(' 拨打电话失败:', err);
								uni.showToast({
									title: '拨打失败',
									icon: 'none'
								});
							}
						});
					}
				}
			});
		},

		// ================ 车牌搜索框相关方法 ================

		// 车牌号输入事件
		onPlateNumberInput(e) {
			const value = e.detail.value || e.target.value || '';
			this.formData.plateNumber = value.toUpperCase(); // 转换为大写

			// 清除之前的定时器
			if (this.plateSearchTimer) {
				clearTimeout(this.plateSearchTimer);
			}

			// 防抖搜索（优化延迟时间）
			this.plateSearchTimer = setTimeout(() => {
				this.generatePlateSuggestions(value);
				this.onPlateNumberChange(); // 查询车主信息
			}, 200);
		},

		// 车牌搜索框获得焦点
		onPlateSearchFocus() {
			this.plateFocused = true;
			if (this.formData.plateNumber) {
				this.generatePlateSuggestions(this.formData.plateNumber);
			}
		},

		// 车牌搜索框失去焦点
		onPlateSearchBlur() {
			this.plateFocused = false;
			// 延迟隐藏建议，以便用户可以点击建议项
			setTimeout(() => {
				this.showPlateSuggestions = false;
			}, 200);
		},

		// 清空车牌号
		clearPlateNumber() {
			console.log('清空车牌号被调用');
			this.formData.plateNumber = '';
			this.showPlateSuggestions = false;
			this.ownerInfo = null;

			//  清空展示区域的车牌字符数组
			this.plateChars = ['', '', '', '', '', '', ''];
			this.currentIndex = 0;

			// 重置键盘状态
			this.showProvinceKeyboard = true;
			this.showNumberKeyboard = false;

			// 显示清空成功提示
			uni.showToast({
				title: '已清空车牌',
				icon: 'success',
				duration: 1000
			});

			// 强制更新视图
			this.$forceUpdate();
		},

		// 清空位置
		clearLocation() {
			console.log('清空位置被调用');
			this.formData.location = '';

			// 显示清空成功提示
			uni.showToast({
				title: '已清空位置',
				icon: 'success',
				duration: 1000
			});

			// 强制更新视图
			this.$forceUpdate();
		},

		//  生成车牌搜索建议 - 使用本地数据库接口
		async generatePlateSuggestions(keyword) {
			if (!keyword || keyword.length < 1) {
				this.showPlateSuggestions = false;
				this.plateSuggestions = [];
				return;
			}

			try {
				console.log(' [本地车牌搜索] 搜索关键词:', keyword);

				//  优先使用本地数据库搜索接口
				const response = await violationApi.getLocalPlateSuggestions(
					keyword,
					this.currentPark || '', // 传入当前车场
					10 // 限制返回数量
				);

				console.log('✅ [本地车牌搜索] 搜索结果:', response);

				//  修复数据格式处理：检查 response.data 而不是直接检查 response
				if (response && response.data && Array.isArray(response.data)) {
					// 处理本地数据库搜索结果
					const suggestions = response.data.map(item => ({
						plateNumber: item.plateNumber,
						ownerName: item.ownerName,
						ownerId: item.ownerId,
						ticketName: item.ticketName,
						parkingSpot: item.parkingSpot,
						validStatus: item.validStatus,
						isFrozen: item.isFrozen,
						appointmentCount: item.appointmentCount || 0,
						violationCount: item.violationCount || 0
					}));

					this.plateSuggestions = suggestions;
					this.showPlateSuggestions = suggestions.length > 0;

					console.log(`✅ [本地车牌搜索] 找到 ${suggestions.length} 个月票车建议`);
				} else {
					// 如果本地搜索没有结果，尝试使用原有的车主搜索接口
					console.log(' [本地车牌搜索] 无结果，尝试车主搜索');
					await this.fallbackToOwnerSearch(keyword);
				}

			} catch (error) {
				console.error('❌ [本地车牌搜索] 搜索失败，尝试备用搜索:', error);
				// 发生错误时，尝试使用原有的搜索接口
				await this.fallbackToOwnerSearch(keyword);
			}
		},

		// 备用搜索方法（使用原有的车主搜索接口）
		async fallbackToOwnerSearch(keyword) {
			try {
				const response = await ownerApi.getPlateSuggestions(keyword, {
					page: 1,
					size: 200
				});

				if (response && response.data && Array.isArray(response.data)) {
					const suggestions = response.data.slice(0, 20).map(item => ({
						plateNumber: item.plateNumber || item.plate_number || item.plate,
						ownerName: item.ownerName || item.owner_name || item.name,
						ownerId: item.ownerId || item.owner_id || item.id
					}));

					this.plateSuggestions = suggestions;
					this.showPlateSuggestions = suggestions.length > 0;

					console.log(`✅ [备用搜索] 找到 ${suggestions.length} 个建议`);
				} else {
					this.plateSuggestions = [];
					this.showPlateSuggestions = false;
				}
			} catch (error) {
				console.error('❌ [备用搜索] 也失败了:', error);
				this.plateSuggestions = [];
				this.showPlateSuggestions = false;
			}
		},

		// 选择车牌建议
		selectPlateSuggestion(suggestion) {
			this.formData.plateNumber = suggestion.plateNumber;
			this.showPlateSuggestions = false;
			this.onPlateNumberChange(); // 查询车主信息
		},

		// ================ 车牌识别相关方法 ================

		// 启动禁用状态检查定时器
		startDisabledCheckTimer() {
			// 每秒检查一次禁用状态，用于更新按钮文本倒计时
			this.disabledCheckTimer = setInterval(() => {
				if (this.isRecognitionDisabled && this.disabledUntilTime > 0) {
					const now = Date.now();
					// 更新当前时间，触发计算属性重新计算
					this.currentTime = now;

					if (now >= this.disabledUntilTime) {
						// 冷却时间已过，自动解除禁用
						console.log('✅ 冷却时间已过，自动解除识别功能禁用');
						this.isRecognitionDisabled = false;
						this.disabledUntilTime = 0;
						this.failedRecognizeCount = 0;
					}
				}
			}, 1000);
		},

		// 打开车牌识别
		openPlateRecognition() {
			console.log(' [车牌识别] 打开车牌识别弹窗');

			// 检查是否已被禁用以及是否过了冷却时间
			if (this.isRecognitionDisabled) {
				const now = Date.now();
				const remainingTime = this.disabledUntilTime - now;

				if (remainingTime > 0) {
					// 还在冷却时间内
					const minutes = Math.ceil(remainingTime / 60000);
					const seconds = Math.ceil((remainingTime % 60000) / 1000);
					const timeStr = minutes > 0 ? `${minutes}分钟` : `${seconds}秒`;

					uni.showToast({
						title: `识别功能已禁用，请等待${timeStr}后再试`,
						icon: 'none',
						duration: 2500
					});
					return;
				} else {
					// 冷却时间已过，解除禁用
					console.log('✅ 冷却时间已过，解除识别功能禁用');
					this.isRecognitionDisabled = false;
					this.disabledUntilTime = 0;
					this.failedRecognizeCount = 0;
				}
			}

			this.showPlateRecognitionModal = true;
			this.showCamera = false;
			this.recognitionResult = null;
			this.isRecognizing = false;
			this.stopAutoRecognize();
			// 重置失败次数（仅在未禁用时）
			if (!this.isRecognitionDisabled) {
				this.failedRecognizeCount = 0;
			}
		},

		// 关闭车牌识别
		closePlateRecognition() {
			this.showPlateRecognitionModal = false;
			this.showCamera = false;
			this.recognitionResult = null;
			this.isRecognizing = false;
			this.stopAutoRecognize();
			// 只有在未被禁用时才重置失败次数
			if (!this.isRecognitionDisabled) {
				this.failedRecognizeCount = 0;
			}
		},

		// 打开摄像头
		openCamera() {
			this.showCamera = true;
			// 延迟启动自动识别，等待摄像头初始化
			setTimeout(() => {
				this.startAutoRecognize();
			}, 1000);
		},

		// 关闭摄像头
		closeCamera() {
			this.stopAutoRecognize();
			this.showCamera = false;
		},

		// 开启自动识别
		startAutoRecognize() {
			if (this.autoRecognize) return;

			this.autoRecognize = true;
			this.autoRecognizeCount = 0;
			console.log(' 开启自动识别模式');

			// 立即开始第一次识别
			this.performAutoRecognize();
		},

		// 停止自动识别
		stopAutoRecognize() {
			if (!this.autoRecognize) return;

			this.autoRecognize = false;
			if (this.autoRecognizeTimer) {
				clearTimeout(this.autoRecognizeTimer);
				this.autoRecognizeTimer = null;
			}
			console.log('⏹️ 停止自动识别模式');
		},

		// 切换自动识别
		toggleAutoRecognize() {
			if (this.autoRecognize) {
				this.stopAutoRecognize();
			} else {
				this.startAutoRecognize();
			}
		},

		// 自动填充识别到的车牌号码到虚拟键盘
		autoFillPlateNumber(plateNumber) {
			console.log(' 自动填充车牌号码:', plateNumber);

			//  修复：先清空之前的业主信息和表单数据
			this.ownerInfo = null;
			this.formData.enterTime = null;
			this.formData.leaveTime = null;
			this.formData.appointmentTime = null;
			this.selectedAppointmentId = null;
			this.showViolationRecords = false;

			// 只有8位车牌才切换到新能源模式，7位切换到普通模式
			if (plateNumber && plateNumber.length === 8) {
				// 8位车牌，切换到新能源模式
				this.isNewEnergyMode = true;
				this.plateColor = 'green';
				// 直接设置车牌颜色相关属性（不调用changeColor避免清空内容）
				this.carColor = 'linear-gradient(to bottom, #d0f1e4, #6ad390)';
				this.selectedColor = 'linear-gradient(to bottom, #d0f1e4, #6ad390)';
				this.carMax = false;
				this.maxCarLenght = 8;
				this.plateType = "newEnergy";
				this.borderBgColor = "#000";
				this.dynamicWidth = 22;
				this.textColor = '#000';
				// 初始化为8位数组
				this.plateChars = ['', '', '', '', '', '', '', ''];
				console.log(' 检测到8位车牌，切换到新能源模式');
			} else {
				//  修复：7位车牌，强制切换到蓝牌模式（默认油车）
				this.isNewEnergyMode = false;
				this.plateColor = 'blue';
				this.carColor = 'linear-gradient(to bottom, #216fef, #0c4fc5)';
				this.selectedColor = 'linear-gradient(to bottom, #216fef, #0c4fc5)';
				this.carMax = true;
				this.maxCarLenght = 7;
				this.plateType = "blue";
				this.borderBgColor = "#fff";
				this.dynamicWidth = 25;
				this.textColor = '#fff';
				// 初始化为7位数组
				this.plateChars = ['', '', '', '', '', '', ''];
				console.log(' 检测到7位车牌，切换到蓝牌模式');
			}

			this.currentIndex = 0;

			// 逐个填充字符
			if (plateNumber) {
				for (let i = 0; i < plateNumber.length && i < 8; i++) {
					this.$set(this.plateChars, i, plateNumber.charAt(i));
				}

				// 设置当前位置为最后一个字符的位置（如果车牌已填满）或下一个空位
				const maxLength = this.isNewEnergyMode ? 8 : 7;
				if (plateNumber.length >= maxLength) {
					// 车牌已填满，设置光标到最后一个字符位置
					this.currentIndex = maxLength - 1;
				} else {
					// 车牌未填满，设置光标到下一个空位
					this.currentIndex = plateNumber.length;
				}
			}

			// 更新表单数据
			this.updatePlateNumber();

			// 根据当前位置选择合适的键盘
			this.selectCharPosition(this.currentIndex);

			// 关闭车牌识别弹窗
			this.showRecognizeDialog = false;

			console.log('✅ 车牌号码填充完成:', this.formData.plateNumber);
		},

		// 执行自动识别
		async performAutoRecognize() {
			if (!this.autoRecognize || !this.showCamera) return;

			// 防抖：如果正在识别中，跳过此次
			if (this.isRecognizing) {
				console.log('⏭️ 跳过自动识别（正在识别中）');
				this.scheduleNextAutoRecognize();
				return;
			}

			// 防抖：检查距离上次识别的时间间隔
			const now = Date.now();
			if (now - this.lastRecognizeTime < 2000) {
				console.log('⏭️ 跳过自动识别（间隔太短）');
				this.scheduleNextAutoRecognize();
				return;
			}

			this.autoRecognizeCount++;
			console.log(` 执行第${this.autoRecognizeCount}次自动识别`);

			try {
				await this.takePhotoAndRecognize(true); // true表示自动识别
			} catch (error) {
				console.error('自动识别失败:', error);
			}

			// 安排下次自动识别
			this.scheduleNextAutoRecognize();
		},

		// 安排下次自动识别
		scheduleNextAutoRecognize() {
			if (!this.autoRecognize) return;

			this.autoRecognizeTimer = setTimeout(() => {
				this.performAutoRecognize();
			}, 3000); // 3秒间隔
		},

		// 拍照并识别（自动）
		async takePhotoAndRecognize(isAutoRecognition = false) {
			if (this.isRecognizing) return;

			this.isRecognizing = true;
			this.lastRecognizeTime = Date.now();

			return new Promise((resolve, reject) => {
				try {
					// 从camera组件获取照片
					const ctx = uni.createCameraContext('camera', this);
					ctx.takePhoto({
						quality: 'high',
						success: async (res) => {
							try {
								await this.recognizeFromImage(res.tempImagePath,
									isAutoRecognition);
								resolve();
							} catch (error) {
								reject(error);
							}
						},
						fail: (err) => {
							console.error('自动拍照失败:', err);
							this.isRecognizing = false;
							reject(err);
						}
					});
				} catch (error) {
					console.error('自动拍照异常:', error);
					this.isRecognizing = false;
					reject(error);
				}
			});
		},

		// 手动拍照识别
		async capturePhoto() {
			if (this.isRecognizing || this.autoRecognize) return;

			this.isRecognizing = true;
			try {
				// 从camera组件获取照片
				const ctx = uni.createCameraContext('camera', this);
				ctx.takePhoto({
					quality: 'high',
					success: (res) => {
						this.recognizeFromImage(res.tempImagePath, false); // false表示手动识别
					},
					fail: (err) => {
						console.error('拍照失败:', err);
						uni.showToast({
							title: '拍照失败',
							icon: 'none'
						});
						this.isRecognizing = false;
					}
				});
			} catch (error) {
				console.error('拍照异常:', error);
				this.isRecognizing = false;
				uni.showToast({
					title: '拍照失败',
					icon: 'none'
				});
			}
		},

		// 摄像头错误处理
		handleCameraError(error) {
			console.error('摄像头错误:', error);
			uni.showToast({
				title: '摄像头启动失败',
				icon: 'none'
			});
			this.showCamera = false;
		},

		// 从相册选择图片
		chooseFromAlbum() {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album'],
				success: (res) => {
					this.recognizeFromImage(res.tempFilePaths[0]);
				}
			});
		},

		// 从图片识别车牌
		async recognizeFromImage(imagePath, isAutoRecognition = false) {
			if (!isAutoRecognition) {
				uni.showLoading({
					title: '识别中...'
				});
			}

			try {
				const base64 = await this.imageToBase64(imagePath);
				const result = await this.callRecognitionAPI(base64, isAutoRecognition);

				if (result && result.success) {
					// 识别成功，重置失败计数
					this.failedRecognizeCount = 0;

					this.recognitionResult = {
						plateNumber: result.plateNumber || 'Unknown',
						color: result.color || '未知',
						confidence: result.confidence || 0,
						recognizeTime: new Date().toISOString()
					};

					if (isAutoRecognition) {
						// 自动识别成功，暂停自动识别并显示确认对话框
						console.log(`✅ 自动识别成功: ${result.plateNumber}`);
						console.log(' 暂停自动识别，等待用户选择');

						// 先暂停自动识别
						this.stopAutoRecognize();

						uni.showModal({
							title: '车牌识别成功',
							content: `识别到车牌号码：${result.plateNumber}\n车牌颜色：${result.color}\n置信度：${result.confidence}%`,
							confirmText: '继续识别',
							cancelText: '使用',
							success: (res) => {
								console.log(' 用户选择:', res);
								if (res.cancel) {
									// 用户选择使用此车牌，关闭摄像头和弹窗并自动填充车牌号码
									this.showCamera = false;
									// 自动填充识别到的车牌号码到虚拟键盘
									this.autoFillPlateNumber(result.plateNumber);
									// 显示虚拟键盘
									this.showPlateKeyboard = true;
									// 关闭车牌识别弹窗
									this.closePlateRecognition();
									console.log(' [车牌识别] 使用识别结果，已关闭弹窗');
								} else if (res.confirm) {
									// 用户选择继续识别，重新启动自动识别
									console.log(' 用户选择继续识别，重新启动自动识别');
									this.startAutoRecognize();
								}
							},
							fail: (err) => {
								console.error('❌ showModal 失败:', err);
							}
						});
					} else {
						// 手动识别成功，关闭摄像头、弹窗并自动填充结果
						this.showCamera = false;
						this.stopAutoRecognize();
						// 自动填充识别到的车牌号码到虚拟键盘
						this.autoFillPlateNumber(result.plateNumber);
						// 显示虚拟键盘
						this.showPlateKeyboard = true;
						// 关闭车牌识别弹窗
						this.closePlateRecognition();
						console.log(`✅ 手动识别成功: ${result.plateNumber}，已关闭弹窗`);
					}
				} else {
					// 识别失败
					this.failedRecognizeCount++;
					console.log('❌ 识别失败:', result?.message || '未知错误', `失败次数: ${this.failedRecognizeCount}/7`);

					// 检查是否达到失败次数上限
					if (this.failedRecognizeCount >= 7) {
						this.isRecognitionDisabled = true;
						// 设置5分钟后解除禁用
						this.disabledUntilTime = Date.now() + 5 * 60 * 1000;
						this.stopAutoRecognize();
						this.closePlateRecognition();

						console.log(' 识别失败7次，禁用识别功能5分钟');
						uni.showModal({
							title: '识别失败次数过多',
							content: '车牌识别已失败7次，功能将禁用5分钟。\n\n请手动输入车牌号码或等待5分钟后重试。',
							showCancel: false,
							confirmText: '知道了'
						});
						return;
					}

					if (!isAutoRecognition) {
						uni.showToast({
							title: result?.message || `识别失败，请重试 (${this.failedRecognizeCount}/7)`,
							icon: 'none',
							duration: 2000
						});
					}
				}
			} catch (error) {
				console.error('识别异常:', error);
				this.failedRecognizeCount++;
				console.log(`识别异常，失败次数: ${this.failedRecognizeCount}/7`);

				// 检查是否达到失败次数上限
				if (this.failedRecognizeCount >= 7) {
					this.isRecognitionDisabled = true;
					// 设置5分钟后解除禁用
					this.disabledUntilTime = Date.now() + 5 * 60 * 1000;
					this.stopAutoRecognize();
					this.closePlateRecognition();

					console.log(' 识别失败7次，禁用识别功能5分钟');
					uni.showModal({
						title: '识别失败次数过多',
						content: '车牌识别已失败7次，功能将禁用5分钟。\n\n请手动输入车牌号码或等待5分钟后重试。',
						showCancel: false,
						confirmText: '知道了'
					});
					return;
				}

				if (!isAutoRecognition) {
					uni.showToast({
						title: `识别失败，请重试 (${this.failedRecognizeCount}/7)`,
						icon: 'none',
						duration: 2000
					});
				}
			} finally {
				if (!isAutoRecognition) {
					uni.hideLoading();
				}
				this.isRecognizing = false;
			}
		},

		// 调用识别API
		async callRecognitionAPI(base64Image, isAutoRecognition = false) {
			console.log(isAutoRecognition ? ' 自动识别API调用' : ' 手动识别API调用');

			try {
				// 移除base64中的空白字符
				const cleanBase64 = base64Image.replace(/\s/g, '');

				const response = await uni.request({
					url: 'https://www.xuerparking.cn:8543/api/plate/recognize',
					method: 'POST',
					header: {
						'Content-Type': 'application/json'
					},
					data: {
						image: cleanBase64,
						multiDetect: false
					},
					timeout: isAutoRecognition ? 15000 : 30000 // 自动识别使用较短超时
				});

				console.log('API响应状态:', response.statusCode);

				if (response.statusCode === 200 && response.data) {
					const data = response.data;
					console.log('API响应数据:', data);

					if (data.success && data.data && data.data.length > 0) {
						const plateData = data.data[0];
						return {
							success: true,
							plateNumber: plateData.number || plateData.plateNumber,
							color: plateData.color,
							confidence: Math.round(plateData.probability * 100)
						};
					} else {
						return {
							success: false,
							message: data.message || '未识别到车牌'
						};
					}
				} else {
					return {
						success: false,
						message: `API调用失败: ${response.statusCode}`
					};
				}
			} catch (error) {
				console.error('API调用异常:', error);
				return {
					success: false,
					message: '网络请求失败'
				};
			}
		},

		// 图片转base64
		imageToBase64(imagePath) {
			return new Promise((resolve, reject) => {
				uni.getFileSystemManager().readFile({
					filePath: imagePath,
					encoding: 'base64',
					success: (res) => {
						// 确保base64数据格式正确，移除可能的换行符和空格
						let base64Data = res.data;
						if (base64Data) {
							base64Data = base64Data.replace(/\s/g, ''); // 移除所有空白字符
							console.log('Base64 图片大小:', base64Data.length);
						}
						resolve(base64Data);
					},
					fail: (error) => {
						console.error('图片转base64失败:', error);
						reject(error);
					}
				});
			});
		},

		// 使用识别结果
		useRecognitionResult() {
			if (this.recognitionResult && this.recognitionResult.plateNumber) {
				//  修复：先清空之前的业主信息和表单数据
				this.ownerInfo = null;
				this.formData.enterTime = null;
				this.formData.leaveTime = null;
				this.formData.appointmentTime = null;
				this.selectedAppointmentId = null;
				this.showViolationRecords = false;

				this.formData.plateNumber = this.recognitionResult.plateNumber;
				this.closePlateRecognition();
				this.onPlateNumberChange(); // 查询车主信息

				uni.showToast({
					title: '已使用识别结果',
					icon: 'success'
				});
			}
		},

		// 重新识别
		retryRecognition() {
			this.recognitionResult = null;
			this.showCamera = false;
		},

		// 选择违规类型（新的统一方法）
		selectType(type) {
			this.formData.violationType = type.value;
			if (type.value !== 'other') {
				this.formData.customType = '';
			}

			// 选择后收起展开状态和搜索状态
			this.uiState.showMoreTypes = false;
			this.uiState.isSearching = false;
			this.uiState.searchKeyword = '';

			// 自动填充建议描述（如果当前描述为空）
			if (!this.formData.description) {
				this.autoFillDescription(type.value);
			}
		},

		// 自动填充描述
		autoFillDescription(violationType) {
			const autoDescriptions = {
				'overtime': '车辆停车时间超过规定时长',
				'wrong_position': '车辆未按规定位置停放',
				'occupy_space': '车辆占用他人车位',
				'block_plate': '车牌被遮挡，无法正常识别',
				'block_passage': '车辆阻挡消防通道或行车道',
				'unauthorized': '车辆未经授权在此区域停车',
				'disabled_space': '车辆占用残疾人专用车位',
				'cross_line': '车辆停放时压线或超出车位范围',
				'cross_parking': '车辆跨越多个车位停放',
				'vip_space': '车辆占用VIP专用车位',
				'engine_on': '车辆停车时未熄火',
				'loading_zone': '车辆占用货物装卸区域',
				'oversized': '车辆超出标准车位尺寸',
				'green_belt': '车辆占用绿化带区域',
				'charging_space': '车辆占用电动车充电专用车位',
				'vehicle_damage': '车辆存在损坏影响停车秩序'
			};

			if (autoDescriptions[violationType]) {
				this.formData.description = autoDescriptions[violationType];
			}
		},

		// 切换更多类型显示
		toggleMoreTypes() {
			this.uiState.showMoreTypes = !this.uiState.showMoreTypes;
			if (!this.uiState.showMoreTypes) {
				this.uiState.isSearching = false;
				this.uiState.searchKeyword = '';
			}
		},

		// 开始搜索
		startSearch() {
			this.uiState.isSearching = true;
			this.uiState.showMoreTypes = true;
		},

		// 搜索输入处理（带防抖）
		onSearchInput() {
			// 清除之前的定时器
			if (this.searchTimer) {
				clearTimeout(this.searchTimer);
			}

			// 设置新的防抖定时器
			this.searchTimer = setTimeout(() => {
				// 如果搜索关键词为空，显示提示
				if (!this.uiState.searchKeyword.trim()) {
					console.log(' 搜索关键词为空');
					return;
				}

				// 执行搜索逻辑
				console.log(' 搜索关键词:', this.uiState.searchKeyword);

				// 如果没有搜索结果，可以显示提示
				if (this.searchResults.length === 0) {
					console.log(' 没有找到匹配的违规类型');
				}
			}, 300); // 300ms 防抖延迟
		},

		// 清空搜索
		clearSearch() {
			this.uiState.searchKeyword = '';
			if (this.searchTimer) {
				clearTimeout(this.searchTimer);
				this.searchTimer = null;
			}
		},

		// 取消搜索
		cancelSearch() {
			this.clearSearch();
			this.uiState.isSearching = false;
		},

		// 拨打电话
		makePhoneCall(phone) {
			if (!phone) {
				uni.showToast({
					title: '暂无联系方式',
					icon: 'none'
				});
				return;
			}
			uni.makePhoneCall({
				phoneNumber: phone,
				fail: (err) => {
					console.error('拨打电话失败:', err);
					uni.showToast({
						title: '拨打失败',
						icon: 'none'
					});
				}
			});
		},

		// ================ 位置输入相关方法 ================




		// 获取违规类型名称
		getViolationTypeName() {
			if (!this.formData.violationType) {
				return '未选择';
			}
			if (this.formData.violationType === 'other') {
				return this.formData.customType || '其他';
			}

			// 使用已有的selectedTypeInfo计算属性
			const selectedType = this.selectedTypeInfo;
			// console.log("违规类型：",selectedType)
			return selectedType ? selectedType.name : '未知类型';
		},

		// 获取当前位置
		async getCurrentLocation() {
			try {
				// 显示加载提示
				uni.showLoading({
					title: '正在定位...',
					mask: true
				});

				// 获取当前位置（使用 Promise 方式）
				const res = await uni.getLocation({
					type: 'gcj02', // 返回国测局坐标，适用于国内地图
					geocode: true, // 解析地址信息（部分平台支持）
					isHighAccuracy: true, // 高精度定位
					altitude: false // 不需要高度信息
				});

				console.log('定位结果:', res);

				// 检查是否获取到经纬度
				if (!res || !res.latitude || !res.longitude) {
					throw new Error('无法获取位置信息');
				}

				// 调用腾讯地图逆地址解析获取详细地址
				await this.reverseGeocoding(res.latitude, res.longitude);

				uni.hideLoading();

				// 显示成功提示
				uni.showToast({
					title: '定位成功',
					icon: 'success',
					duration: 1500
				});

			} catch (error) {
				console.error('获取位置失败:', error);
				uni.hideLoading();

				// 显示错误提示
				uni.showModal({
					title: '定位失败',
					content: error.errMsg || error.message || '无法获取当前位置，请检查定位权限或手动输入位置',
					showCancel: false,
					confirmText: '确定'
				});
			}
		},

		// 腾讯地图逆地址解析（将经纬度转换为地址）
		async reverseGeocoding(latitude, longitude) {
			try {
				// 使用腾讯地图WebService API进行逆地址解析
				const key = 'H4OBZ-NQW6Q-NST5N-24MNR-CMKIV-RXFPT'; // 腾讯地图API Key
				const url =
					`https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=${key}&get_poi=1`;

				const res = await uni.request({
					url: url,
					method: 'GET',
					timeout: 10000
				});
				// 检查响应状态
				if (res.statusCode === 200 && res.data && res.data.status === 0) {
					const result = res.data.result;

					// 优先使用formatted_addresses中的recommend（推荐地址）
					if (result.formatted_addresses && result.formatted_addresses.recommend) {
						this.formData.location = result.formatted_addresses.recommend;
					}
					// 其次使用address（标准地址）
					else if (result.address) {
						this.formData.location = result.address;
					}
					// 最后拼接详细地址
					else if (result.address_component) {
						const addr = result.address_component;
						let locationStr = '';
						if (addr.province) locationStr += addr.province;
						if (addr.city) locationStr += addr.city;
						if (addr.district) locationStr += addr.district;
						if (addr.street) locationStr += addr.street;
						if (addr.street_number) locationStr += addr.street_number;

						this.formData.location = locationStr ||
							`经度:${longitude.toFixed(6)}, 纬度:${latitude.toFixed(6)}`;
					} else {
						// 如果都没有，使用经纬度
						this.formData.location = `经度:${longitude.toFixed(6)}, 纬度:${latitude.toFixed(6)}`;
					}
				} else {
					// API调用失败，使用经纬度
					console.warn('逆地址解析API返回错误:', res.data);
					this.formData.location = `经度:${longitude.toFixed(6)}, 纬度:${latitude.toFixed(6)}`;
				}
			} catch (error) {
				console.error('逆地址解析失败:', error);
				// 发生异常时，使用经纬度作为备选
				this.formData.location = `经度:${longitude.toFixed(6)}, 纬度:${latitude.toFixed(6)}`;
			}
		},

		//  添加水印到图片
		async addWatermarkToImage(imagePath) {
			return new Promise((resolve, reject) => {
				try {
					// 获取图片信息
					uni.getImageInfo({
						src: imagePath,
						success: (imageInfo) => {
							// 使用原始图片尺寸（不缩放）
							const imgWidth = imageInfo.width;
							const imgHeight = imageInfo.height;
							// 先设置Canvas尺寸为图片尺寸
							this.canvasWidth = imgWidth;
							this.canvasHeight = imgHeight;

							// 等待Canvas尺寸更新后再绘制
							this.$nextTick(() => {
								const canvasId = 'watermarkCanvas';
								const ctx = uni.createCanvasContext(canvasId, this);

								// 绘制原图（1:1比例，不缩放）
								ctx.drawImage(imagePath, 0, 0, imgWidth, imgHeight);

								// 准备水印信息
								const now = new Date();
								const timeStr =
									`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
								const locationStr = this.formData.location || '位置未知';
								const userStr = this.currentUserName || '未知用户';
								// 水印配置（固定大小，确保可见）
								const watermarkHeight = 180; // 固定高度120px（增加高度）
								const bottomMargin = 0; // 距离底部50px（让水印往上）
								const watermarkY = imgHeight - watermarkHeight -
									bottomMargin; // 水印区域起始Y坐标
								const padding = 20; // 固定内边距20px
								const fontSize = 42; // 固定字体大小26px（加大字体）
								const lineHeight = 52; // 固定行高36px（对应更大字体）
								// 绘制半透明黑色背景
								ctx.setFillStyle('rgba(0, 0, 0, 0.65)');
								ctx.fillRect(0, watermarkY, imgWidth, watermarkHeight);

								// 设置文字样式
								ctx.setFillStyle('#FFFFFF');
								ctx.setFontSize(fontSize);
								ctx.setTextAlign('left');

								// 绘制时间
								const timeY = watermarkY + padding + fontSize;
								ctx.fillText(`时间：${timeStr}`, padding, timeY);

								// 绘制地址（截断过长的文字）
								const locationY = timeY + lineHeight;
								let displayLocation = locationStr;
								if (displayLocation.length > 30) {
									displayLocation = displayLocation.substring(0,
										30) + '...';
								}
								ctx.fillText(`地址：${displayLocation}`, padding,
									locationY);

								// 绘制拍照人
								const userY = locationY + lineHeight;
								ctx.fillText(`拍照人：${userStr}`, padding, userY);

								// 绘制完成，导出图片
								ctx.draw(false, () => {
									setTimeout(() => {
										uni.canvasToTempFilePath({
											canvasId: canvasId,
											x: 0,
											y: 0,
											width: imgWidth,
											height: imgHeight,
											destWidth: imgWidth, // 输出宽度 = 原始宽度
											destHeight: imgHeight, // 输出高度 = 原始高度
											fileType: 'jpg',
											quality: 0.95, // 高质量（避免过大文件）
											success: (res) => {
												console
													.log(
														'✅ 水印添加成功:',
														res
															.tempFilePath
													);
												resolve(res
													.tempFilePath
												);
											},
											fail: (err) => {
												console
													.error(
														'❌ Canvas导出失败:',
														err
													);
												// 如果失败，返回原图
												resolve(
													imagePath
												);
											}
										}, this);
									}, 800); // 增加等待时间确保绘制完成
								});
							});
						},
						fail: (err) => {
							console.error('❌ 获取图片信息失败:', err);
							// 如果失败，返回原图
							resolve(imagePath);
						}
					});
				} catch (error) {
					console.error('❌ 添加水印异常:', error);
					// 发生异常时返回原图
					resolve(imagePath);
				}
			});
		},

		// 拍照
		async takePhoto() {
			// 检查是否已获取位置信息
			if (!this.formData.location || this.formData.location.trim() === '') {
				uni.showModal({
					title: '提示',
					content: '请先获取违规位置后再拍照',
					showCancel: false,
					confirmText: '知道了'
				});
				return;
			}

			try {
				//  设置上传标志，防止上传时重置表单
				this.isUploadingPhoto = true;

				const res = await uni.chooseImage({
					count: 6 - this.formData.photos.length,
					sizeType: ['compressed'],
					sourceType: ['camera']
				});

				// 显示处理进度
				uni.showLoading({
					title: '正在添加水印...',
					mask: true
				});

				// 上传每张照片到服务器
				for (let i = 0; i < res.tempFilePaths.length; i++) {
					const originalPath = res.tempFilePaths[i];
					try {
						//  添加水印
						const watermarkedPath = await this.addWatermarkToImage(originalPath);

						// 更新进度提示
						uni.showLoading({
							title: `上传中 ${i + 1}/${res.tempFilePaths.length}...`,
							mask: true
						});

						const uploadUrl = this.buildUploadUrl(); // 构建上传URL
						console.log(`开始上传第${i + 1}张照片`, {
							uploadUrl,
							originalPath,
							watermarkedPath
						});

						const uploadRes = await uni.uploadFile({
							url: uploadUrl,
							filePath: watermarkedPath, // 使用带水印的图片
							name: 'file',
							formData: {
								'type': 'violation',
								'userId': this.getCurrentUserId(),
								'timestamp': Date.now()
							}
						});

						console.log('上传响应:', uploadRes);

						// 解析上传结果
						const result = JSON.parse(uploadRes.data);
						// 修正成功判断逻辑 - 后端返回code为"0"表示成功
						if (result.code === "0" || result.code === 0 || result.success) {
							// 获取服务器返回的图片URL - 尝试多种可能的路径
							let imageUrl = result.data?.data?.url || // 双层嵌套
								result.data?.url || // 单层嵌套
								result.url; // 直接在根层

							if (imageUrl && imageUrl.startsWith('http://')) {
								imageUrl = imageUrl.replace('http://', 'https://');
							}

							if (imageUrl) {
								this.formData.photos.push(imageUrl);
							} else {
								throw new Error('服务器返回的数据中缺少图片URL');
							}
						} else {
							throw new Error(result.message || result.msg || '上传失败');
						}
					} catch (uploadError) {
						console.error('照片上传失败:', uploadError);
						console.error('错误详情:', {
							message: uploadError.message,
							statusCode: uploadError.statusCode,
							errMsg: uploadError.errMsg
						});

						uni.showToast({
							title: `第${i + 1}张照片上传失败: ${uploadError.message || '网络错误'}`,
							icon: 'error',
							duration: 3000
						});

						// 不要将临时路径添加到照片列表，避免HTTP协议错误
						// this.formData.photos.push(tempFilePath);
					}
				}

				uni.hideLoading();

				//  清除上传标志
				this.isUploadingPhoto = false;

			} catch (error) {
				uni.hideLoading();

				//  清除上传标志
				this.isUploadingPhoto = false;

				console.error('选择照片失败:', error);
				uni.showToast({
					title: '选择照片失败',
					icon: 'error'
				});
			}
		},

		// 构建照片上传URL
		buildUploadUrl() {
			// 使用配置文件中的API地址
			const {
				apiConfig,
				apiUrls
			} = require('@/config/api.js');
			return apiConfig.baseURL + apiUrls.upload.violationPhotos;
		},

		// 获取当前用户ID
		getCurrentUserId() {
			try {
				const userInfo = uni.getStorageSync('userInfo');
				return userInfo?.userId || userInfo?.id || 'anonymous';
			} catch (error) {
				return 'anonymous';
			}
		},

		// 预览照片
		previewPhoto(index) {
			uni.previewImage({
				urls: this.formData.photos,
				current: index
			});
		},

		// 删除照片
		deletePhoto(index) {
			this.formData.photos.splice(index, 1);
		},



		// 播放语音
		playVoice() {
			uni.showToast({
				title: '播放语音',
				icon: 'none'
			});
		},

		// 删除语音
		deleteVoice() {
			this.formData.voiceMemo = null;
			this.voiceDuration = 0;
		},

		// 打开车牌扫描
		openPlateScanner() {
			this.showScanModal = true;
			this.scanResult = '';
			this.showCamera = false;
		},

		// 关闭车牌扫描
		closeScanModal() {
			this.stopAutoRecognize();
			this.showScanModal = false;
			this.showCamera = false;
			this.scanning = false;
			this.scanResult = '';
		},

		// 启动摄像头
		startCamera() {
			this.showCamera = true;
			// 自动开始识别
			setTimeout(() => {
				this.startAutoRecognize();
			}, 1000);
		},

		// 关闭摄像头
		closeCamera() {
			this.stopAutoRecognize();
			this.showCamera = false;
		},

		// 开启自动识别
		startAutoRecognize() {
			if (this.autoRecognize) return;

			this.autoRecognize = true;
			this.autoRecognizeCount = 0;
			console.log(' 开启自动识别模式');

			// 立即开始第一次识别
			this.performAutoRecognize();
		},

		// 停止自动识别
		stopAutoRecognize() {
			if (!this.autoRecognize) return;

			this.autoRecognize = false;
			if (this.autoRecognizeTimer) {
				clearTimeout(this.autoRecognizeTimer);
				this.autoRecognizeTimer = null;
			}
			console.log('⏹️ 停止自动识别模式');
		},

		// 使用扫描结果
		useScanResult() {
			this.formData.plateNumber = this.scanResult;

			// 根据车牌长度判断是否为新能源车牌
			if (this.scanResult.length === 8) {
				this.isNewEnergyMode = true;
				this.plateChars = ['', '', '', '', '', '', '', ''];
			} else {
				this.isNewEnergyMode = false;
				this.plateChars = ['', '', '', '', '', '', ''];
			}

			// 填充车牌字符到虚拟键盘
			for (let i = 0; i < this.scanResult.length; i++) {
				this.plateChars[i] = this.scanResult[i];
			}

			this.onPlateNumberChange();
			this.closeScanModal();
		},

		// 提交违规记录
		submitViolation() {
			// 额外验证违规类型
			if (!this.formData.violationType) {
				uni.showToast({
					title: '请选择违规类型',
					icon: 'none'
				});
				return;
			}

			// 验证违规照片（必填）
			if (!this.formData.photos || this.formData.photos.length === 0) {
				uni.showToast({
					title: '请至少上传一张违规照片',
					icon: 'none',
					duration: 2000
				});
				return;
			}

			//  验证拉黑设置（仅管理员角色需要验证）
			if (this.shouldShowBlacklistSection) {
				// 验证是否已明确做出拉黑决定
				if (!this.formData.blacklistDecisionMade) {
					uni.showToast({
						title: '请明确选择是否拉黑该车辆',
						icon: 'none',
						duration: 3000
					});
					return;
				}

				// 验证拉黑原因（如果选择了拉黑）
				if (this.formData.shouldBlacklist && (!this.formData.blacklistReason || this.formData.blacklistReason
					.trim().length < 5)) {
					uni.showToast({
						title: '请填写拉黑原因（至少5个字符）',
						icon: 'none'
					});
					return;
				}
			}

			if (!this.canSubmit) {
				uni.showToast({
					title: '请完善必填信息',
					icon: 'none'
				});
				return;
			}

			// 显示操作选择：发送违规提醒 或 记录违规
			uni.showActionSheet({
				itemList: ['发送违规提醒', '记录违规'],
				success: async (res) => {
					if (res.tapIndex === 0) {
						await this.handleSendReminderFlow();
					} else if (res.tapIndex === 1) {
						await this.confirmRecordViolation();
					}
				},
				fail: () => { }
			});
		},

		// 关闭确认弹窗
		closeConfirmModal() {
			this.showConfirmModal = false;
		},


		// 新增：记录违规简化流程（保持原有提交后短信提示逻辑）
		async confirmRecordViolation() {
			this.submitting = true;
			try {
				// ⏱️ 先检查后端的最小时间间隔，未达到则仅提示不落库
				try {
					const intervalRes = await violationReminderApi.checkInterval(this.formData.plateNumber);
					const intervalData = intervalRes?.data || intervalRes;
					const minsSince = intervalData.minutesSinceLast || 0;
					const remain = this.reminderIntervalMinutes - minsSince;
					console.log('remain', remain);
					// 当剩余等待时间大于0时显示未达最小时间间隔
					if (remain > 0) {
						uni.showModal({
							title: '未达最小时间间隔',
							content: `还需等待 ${this._formatElapsed(remain)} 后才能新增违规记录`,
							showCancel: false
						});
						return; // 中止保存
					} else {
						// remain <= 0，显示距上次已过的时间
						uni.showToast({
							title: `距上次已过 ${this._formatElapsed(minsSince)}`,
							icon: 'none',
							duration: 1500
						});
					}
				} catch (e) {
					// 检查失败不阻塞提交流程
					console.warn('⚠️ 间隔检查失败，继续提交', e);
				}

				//  在提交之前检查是否即将达到阈值
				let willReachThreshold = false;
				let thresholdInfo = null;
				try {
					const threshold = await this.checkBlacklistThreshold(this.formData.plateNumber);
					console.log(' [提交前阈值检查] 当前违规次数:', threshold?.currentViolationCount, '阈值:', threshold?.maxViolationCount);

					if (threshold && threshold.maxViolationCount) {
						thresholdInfo = threshold;
						// 检查添加这次违规后是否会达到或超过阈值
						// currentViolationCount 是当前已有的违规次数，加上即将添加的这次
						if (threshold.currentViolationCount + 1 > threshold.maxViolationCount) {
							willReachThreshold = true;
							console.log('⚠️ [即将拉黑] 添加本次违规后将达到或超过阈值');

							// 显示即将拉黑的确认弹窗
							const confirmResult = await new Promise((resolve) => {
								uni.showModal({
									title: '⚠️ 即将触发拉黑',
									content: `该车辆当前已有 ${threshold.currentViolationCount} 次违规记录，\n添加本次违规后将达到 ${threshold.currentViolationCount + 1} 次。\n\n 系统阈值为 ${threshold.maxViolationCount} 次，\n提交后该车辆将被自动拉黑！\n\n是否继续提交违规记录？`,
									showCancel: true,
									cancelText: '取消',
									confirmText: '确认提交',
									confirmColor: '#ff4757',
									success: (res) => {
										resolve(res.confirm);
									}
								});
							});

							if (!confirmResult) {
								console.log('ℹ️ 用户取消了提交');
								this.submitting = false;
								return;
							}
						}
					}
				} catch (e) {
					console.warn('⚠️ 提交前阈值检查失败，继续提交', e);
				}

				const result = await this.submitToServer();

				//  如果提交前已检测到将达到阈值，提交后不显示发送短信弹窗，直接显示拉黑提示
				if (willReachThreshold) {
					console.log(' [已触发拉黑] 该车辆已被自动拉黑，不显示发送短信弹窗');

					// 显示拉黑成功提示
					this.showSubmitSuccessModal(result, {
						isBlacklisted: true,
						threshold: thresholdInfo,
						message: `违规记录已成功提交！\n\n 该车辆累计违规已达到 ${thresholdInfo.currentViolationCount + 1} 次！\n\n✅ 系统已自动拉黑该车辆\n 拉黑通知短信已发送给车主`
					});
					this.submitting = false;
					this.closeConfirmModal();
					return;
				}

				//  提交后立即检查阈值，并根据情况提示/拉黑
				try {
					const threshold = await this.checkBlacklistThreshold(this.formData.plateNumber);
					console.log(' [阈值检查-记录违规] 当前违规次数:', threshold?.currentViolationCount, '阈值:', threshold?.maxViolationCount);

					if (threshold && threshold.maxViolationCount) {
						// 情况1：达到阈值（例如：第4次违规），发送警告短信提示
						if (threshold.currentViolationCount === threshold.maxViolationCount) {
							console.log('⚠️ [违规警告] 已达到阈值，后端将发送警告短信（SMS_498220005）');

							// 显示提交成功信息（包含警告提示）
							this.showSubmitSuccessModal(result, {
								isWarning: true,
								threshold: threshold,
								message: `违规记录已成功提交！\n\n⚠️ 该车辆已累计违规 ${threshold.currentViolationCount} 次，已达到警告阈值！\n\n 违规警告短信已发送给车主\n 提醒：再有一次违规将被拉黑`
							});
							this.submitting = false;
							this.closeConfirmModal();
							return;
						}

						// 情况2：超过阈值（例如：第5次及以上违规），自动拉黑
						if (threshold.currentViolationCount > threshold.maxViolationCount) {
							console.log(' [触发自动拉黑] 违规次数已超过阈值，执行自动拉黑');

							// 显示拉黑提示
							this.showSubmitSuccessModal(result, {
								isBlacklisted: true,
								threshold: threshold,
								message: `违规记录已成功提交！\n\n 该车辆累计违规 ${threshold.currentViolationCount} 次，已超过阈值！\n\n✅ 系统已自动拉黑该车辆\n 拉黑通知短信已发送给车主`
							});
							this.submitting = false;
							this.closeConfirmModal();
							return;
						}
					}
				} catch (e) {
					console.warn('⚠️ 阈值检查失败，跳过阈值处理', e);
				}

				// 正常情况：未达到阈值，保持提交后短信提示逻辑不变
				if (this.ownerInfo && this.ownerInfo.phone && this.ownerInfo.phone !== '未登记' && this.ownerInfo
					.phone.match(/^1[3-9]\d{9}$/)) {
					try {
						const unprocessedReminders = await violationReminderApi.getUnprocessedRemindersByPlate(this
							.formData.plateNumber);
						const records = unprocessedReminders?.data?.records || unprocessedReminders?.records || [];
						//  最小间隔判断
						if (records.length > 0) {
							const lastTime = records
								.map(r => r.reminderTime || r.createTime || r.createdAt || r.violationTime)
								.filter(Boolean)
								.sort((a, b) => new Date(b) - new Date(a))[0];
							const diff = this._diffMinutes(lastTime);
							if (diff < this.reminderIntervalMinutes) {
								uni.showToast({
									title: '暂未超过规定间隔，请稍后添加',
									icon: 'none'
								});
								this.showSubmitSuccessModal(result);
								return;
							}
						}

						// 只发送违规记录短信，不发送违规提醒短信
						let smsType = 'violation';
						let smsTitle = '发送违规短信';
						let smsContent = `是否向车主 ${this.ownerInfo.name} (${this.ownerInfo.phone}) 发送违规短信？`;

						//  附加已过去时间提示
						if (records.length > 0) {
							const lastTime = records
								.map(r => r.reminderTime || r.createTime || r.createdAt || r.violationTime)
								.filter(Boolean)
								.sort((a, b) => new Date(b) - new Date(a))[0];
							const diff = this._diffMinutes(lastTime);
							smsContent = `上次发送已过去 ${this._formatElapsed(diff)}。${smsContent}`;
						}

						uni.showModal({
							title: smsTitle,
							content: smsContent,
							showCancel: true,
							cancelText: '不发送',
							confirmText: '发送短信',
							success: async (smsRes) => {
								if (smsRes.confirm) {
									// 只发送违规记录短信
									await this.markRemindersAsProcessed(this.formData.plateNumber);
									await this.sendViolationSms(this.ownerInfo.phone, this
										.ownerInfo.name, result.violationId);
								}
								this.showSubmitSuccessModal(result);
							}
						});
					} catch (error) {
						uni.showModal({
							title: '发送短信通知',
							content: `是否向车主 ${this.ownerInfo.name} (${this.ownerInfo.phone}) 发送违规通知短信？`,
							showCancel: true,
							cancelText: '不发送',
							confirmText: '发送短信',
							success: async (smsRes) => {
								if (smsRes.confirm) {
									await this.sendViolationSms(this.ownerInfo.phone, this.ownerInfo
										.name, result.violationId);
								}
								this.showSubmitSuccessModal(result);
							}
						});
					}
				} else {
					this.showSubmitSuccessModal(result);
				}
			} catch (error) {
				uni.showModal({
					title: '提交失败',
					content: error.message || '网络错误，请检查网络连接后重试',
					showCancel: true,
					cancelText: '取消',
					confirmText: '重试',
					success: (res) => {
						if (res.confirm) {
							setTimeout(() => {
								this.confirmRecordViolation();
							}, 500);
						}
					}
				});
			} finally {
				this.submitting = false;
			}
		},

		// 新增：发送违规提醒流程（查重并确认继续）
		async handleSendReminderFlow() {
			try {
				// 校验手机号
				if (!this.ownerInfo || !/^1[3-9]\d{9}$/.test(this.ownerInfo.phone || '')) {
					uni.showModal({
						title: '无法发送短信',
						content: '未找到有效手机号，无法发送违规提醒短信。',
						showCancel: false
					});
					return;
				}

				//  最小间隔判断：先查未处理提醒并检查时间间隔
				try {
					const unprocessed = await violationReminderApi.getUnprocessedRemindersByPlate(this.formData
						.plateNumber);
					const recs = unprocessed?.data?.records || unprocessed?.records || [];
					if (recs.length > 0) {
						const lastTime = recs
							.map(r => r.reminderTime || r.createTime || r.createdAt || r.violationTime)
							.filter(Boolean)
							.sort((a, b) => new Date(b) - new Date(a))[0];
						const diff = this._diffMinutes(lastTime);
						if (diff < this.reminderIntervalMinutes) {
							uni.showToast({
								title: '暂未超过规定间隔，请稍后添加',
								icon: 'none'
							});
							return;
						}
					}
				} catch (e) {
					// 忽略，走后续流程
				}

				// 查询该车辆是否已有违规提醒记录（不限处理状态）
				let existing = [];
				try {
					const resp = await violationReminderApi.getViolationReminders({
						plateNumber: this.formData.plateNumber,
						page: 1,
						size: 10,
						orderBy: 'createTime',
						orderDirection: 'desc'
					});
					existing = resp?.data?.records || resp?.records || [];
				} catch (e) {
					existing = [];
				}

				const proceed = async () => {
					await this.sendViolationReminderSms(this.ownerInfo.phone, this.ownerInfo.name, null);
				};

				if (existing.length > 0) {
					const mapped = existing.map((r) => {
						const time = r.reminderTime || r.createTime || r.violationTime || '';
						const type = r.violationTypeName || r.violationType || r.reminderTemplateCode ||
							'';
						const location = r.location || r.place || r.violationLocation || r.address || '';
						const plateNumber = r.plateNumber || this.formData.plateNumber || '';
						return {
							time,
							type,
							location,
							plateNumber,
							_expanded: false
						};
					});
					// 文本仍保留（兼容旧逻辑），但展示改用结构化列表
					this.reminderConfirmListText = mapped
						.map((o, i) => `${i + 1}. ${o.time} ${o.type}${o.location ? ' ' + o.location : ''}`)
						.join('\n');
					this.reminderConfirmList = mapped;
					this.reminderPage = 1;
					this._pendingReminderProceed = proceed;
					this.showReminderConfirmPanel = true;
				} else {
					await proceed();
				}
			} catch (e) {
				uni.showToast({
					title: '发送失败',
					icon: 'none'
				});
			}
		},

		// 显示提交成功模态框
		async showSubmitSuccessModal(result, options = {}) {
			//  保存提交结果信息，因为重置表单后无法获取
			//  优先使用 result 中的车牌号，如果没有则使用表单中的车牌号
			const savedPlateNumber = result.plateNumber || this.formData.plateNumber;

			const violationInfo = {
				violationId: result.violationId,
				creditImpact: this.calculateCreditImpact(),
				currentUser: result.currentUser,
				plateNumber: savedPlateNumber, // 保存车牌号用于查询
				isManualBlacklist: this.formData.shouldBlacklist //  保存用户是否手动选择了拉黑
			};

			console.log(' [提交成功] 保存的车牌号:', savedPlateNumber);

			// ✅ 立即重置表单数据，确保无论用户选择什么操作，数据都已清空
			this.resetForm(false);

			//  设置刷新标记，通知查询页面需要重新加载数据
			uni.setStorageSync('shouldRefreshViolationData', true);

			//  设置重置标记，确保从查询页面返回时表单是空的
			uni.setStorageSync('shouldResetAddViolationForm', true);

			//  优先使用传入的自定义消息（用于警告和拉黑提示）
			let content = '';
			let modalTitle = '提交成功';
			let wasAutoBlacklisted = false;

			if (options.message) {
				// 使用自定义消息（警告或拉黑）
				content = options.message;

				if (options.isWarning) {
					modalTitle = '⚠️ 违规警告';
				} else if (options.isBlacklisted) {
					modalTitle = ' 自动拉黑';
					wasAutoBlacklisted = true;
				}
			} else {
				// 默认逻辑：查询阈值并构建提示
				let thresholdInfo = null;
				try {
					const thresholdResult = await this.checkBlacklistThreshold(violationInfo.plateNumber);
					console.log("thresholdResult:", thresholdResult);
					if (thresholdResult) {
						thresholdInfo = thresholdResult;
					}
				} catch (error) {
					console.warn('⚠️ 查询拉黑阈值失败:', error);
				}

				// 构建提示内容
				content = `违规记录已成功提交！`;

				// 添加拉黑阈值提醒
				if (thresholdInfo) {
					// 如果当前违规次数为0，说明已被拉黑
					if (thresholdInfo.currentViolationCount === 0) {
						//  区分手动拉黑和自动拉黑
						if (violationInfo.isManualBlacklist) {
							content += `\n\n 该车辆已拉黑！`;
						} else {
							content += `\n\n 该车辆已自动拉黑！`;
						}
					} else {
						content += `\n\n 当前违规统计：`;
						content += `\n车牌号：${thresholdInfo.plateNumber}`;
						content += `\n当前违规次数：${thresholdInfo.currentViolationCount}`;
						content += `\n拉黑阈值：${thresholdInfo.maxViolationCount}`;

						if (thresholdInfo.willBeBlacklisted) {
							content += `\n⚠️ 该车辆已达到拉黑阈值，将被自动拉黑！`;
						} else {
							content += `\n⚠️ 还有 ${thresholdInfo.remainingCount} 次违规将被拉黑`;
						}
					}
				}

				// 如果该车辆已被自动拉黑，则不显示"继续添加"，仅保留"查看记录"
				wasAutoBlacklisted = !!(thresholdInfo && thresholdInfo.currentViolationCount === 0 && !
					violationInfo.isManualBlacklist);
			}

			uni.showModal({
				title: modalTitle,
				content: content,
				showCancel: wasAutoBlacklisted ? false : true,
				cancelText: wasAutoBlacklisted ? '' : '查看记录',
				confirmText: wasAutoBlacklisted ? '查看记录' : '继续添加',
				success: (res) => {
					if (wasAutoBlacklisted) {
						// 仅提供"查看记录"
						uni.switchTab({
							url: '/pages/violation/violation'
						});
						return;
					}

					if (res.confirm) {
						// 用户选择继续添加，表单已重置，直接提示即可
						uni.showToast({
							title: '可继续添加',
							icon: 'success',
							duration: 1500
						});
					} else {
						// 用户选择查看记录
						uni.switchTab({
							url: '/pages/violation/violation'
						});
					}
				}
			});
		},

		//  发送违规提醒短信（发送短信 + 创建违规提醒记录）
		async sendViolationReminderSms(phoneNumber, ownerName, violationId) {
			try {
				console.log(' [发送违规提醒] 开始发送提醒短信:', {
					phoneNumber,
					ownerName,
					violationId
				});

				//  先保存车牌号和表单数据，因为后面需要用到
				const savedPlateNumber = this.formData.plateNumber;
				const savedViolationType = this.getViolationTypeName();
				const savedFormData = { ...this.formData };
				const savedOwnerInfo = { ...this.ownerInfo };

				// 构建短信模板数据
				const templateData = reminderUtils.buildSmsTemplateData(this.formData);

				// 发送提醒短信
				const smsResult = await violationReminderApi.sendViolationReminderSms(phoneNumber, templateData);

				if (smsResult.success) {
					console.log('✅ [违规提醒] 短信发送成功');

					//  创建违规提醒记录（与违规记录分开，但提醒功能需要记录到数据库）
					try {
						savedFormData.violationType = savedViolationType;
						savedFormData.parkName = "东北林业大学";
						const reminderData = reminderUtils.buildReminderData(savedFormData, savedOwnerInfo);
						await violationReminderApi.createViolationReminder(reminderData);
						console.log('✅ [违规提醒] 提醒记录已创建到数据库');
					} catch (reminderError) {
						console.error('❌ [违规提醒] 创建提醒记录失败:', reminderError);
						// 即使创建记录失败，短信已发送成功，不抛出错误
					}

					uni.showToast({
						title: '提醒短信发送成功',
						icon: 'success',
						duration: 1500
					});
					// 调用重置表单
					this.resetForm(false);
				}

				return smsResult;
			} catch (error) {
				console.error('❌ [发送违规提醒] 失败:', error);
				throw error;
			}
		},

		//  标记所有未处理的提醒为已处理
		async markRemindersAsProcessed(plateNumber) {
			try {
				console.log(' [标记提醒处理] 车牌号:', plateNumber);

				// 获取当前用户信息作为处理人
				const userInfo = uni.getStorageSync('userInfo');
				const processedBy = userInfo?.patrolData?.name || userInfo?.userInfo?.name || userInfo?.name ||
					'系统';

				// 标记所有未处理的提醒为已处理
				await violationReminderApi.markAllRemindersAsProcessed(plateNumber, processedBy);
				console.log('✅ [标记提醒处理] 完成');
			} catch (error) {
				console.error('❌ [标记提醒处理] 失败:', error);
				// 不抛出错误，避免影响主流程
			}
		},

		// 发送违规通知短信
		async sendViolationSms(phoneNumber, ownerName, violationId) {
			try {
				uni.showLoading({
					title: '发送短信中...'
				});

				//  从本地存储获取动态短信模板配置
				let smsTemplate = null;
				try {
					const smsTemplatesData = uni.getStorageSync('smsTemplates');
					console.log(' [发送短信] 获取到的短信模板列表:', smsTemplatesData);

					// 处理可能的数据结构：可能是直接的数组，也可能是包含data字段的对象
					const smsTemplates = Array.isArray(smsTemplatesData)
						? smsTemplatesData
						: (smsTemplatesData?.data || []);

					// 查找违规类型的短信模板（templateType=1表示违规提醒）
					smsTemplate = smsTemplates.find(t => t.templateType === 1);

					if (!smsTemplate && smsTemplates.length > 0) {
						// 如果没有找到违规类型的模板，使用第一个作为默认模板
						smsTemplate = smsTemplates[0];
						console.log('ℹ️ [发送短信] 未找到违规类型模板，使用默认模板:', smsTemplate);
					}
				} catch (error) {
					console.error('❌ [发送短信] 获取短信模板失败:', error);
				}

				// 短信配置（使用动态模板或后备默认值）
				const smsConfig = {
					baseUrl: 'https://www.xuerparking.cn:8543', // 使用正确的后端服务地址
					signName: smsTemplate?.signName || '东北林业大学', //  动态签名
					templateCode: smsTemplate?.templateCode || 'SMS_496020098', //  动态模板代码
					timeout: 10000
				};

				console.log(' [发送短信] 使用的短信配置:', {
					signName: smsConfig.signName,
					templateCode: smsConfig.templateCode,
					templateName: smsTemplate?.templateName || '默认模板'
				});

				// 获取当前时间信息
				const now = new Date();
				const year = now.getFullYear();
				const month = now.getMonth() + 1;
				const day = now.getDate();
				// 手动格式化时间为 hh:mm:ss 格式，避免时区信息
				const hours = String(now.getHours()).padStart(2, '0');
				const minutes = String(now.getMinutes()).padStart(2, '0');
				const seconds = String(now.getSeconds()).padStart(2, '0');
				const time = `${hours}:${minutes}:${seconds}`;

				// 构建短信模板参数（违规通知短信保留原有模板）
				const templateParam = JSON.stringify({
					license_plate_number: this.formData.plateNumber,
					year: year.toString(),
					month: month.toString(),
					day: day.toString(),
					time: time,
					code: this.formData.location || '停车场'
				});

				console.log(' 准备发送违规通知短信:', {
					phoneNumber: phoneNumber,
					ownerName: ownerName,
					templateParam: templateParam
				});

				// 调用阿里云短信接口 - 使用GET方式传参
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
				console.log("响应response：", response)
				if (response.statusCode === 200 && response.data.data && response.data.data.code === '0') {
					uni.showToast({
						title: '短信发送成功',
						icon: 'success',
						duration: 2000
					});
					console.log('✅ 违规通知短信发送成功:', response.data);
					// 调用重置表单
					this.resetForm(false);
				} else {
					throw new Error(response.data?.message || '短信发送失败');
				}

			} catch (error) {
				uni.hideLoading();
				console.error('❌ 发送违规通知短信失败:', error);

				uni.showModal({
					title: '短信发送失败',
					content: `短信发送失败：${error.message || '网络错误'}\n违规记录已成功提交，但通知短信未能发送。`,
					showCancel: false,
					confirmText: '知道了'
				});
			}
		},

		//  查询距离拉黑阈值还有几次
		async checkBlacklistThreshold(plateNumber) {
			try {
				//  验证车牌号不为空
				if (!plateNumber || plateNumber.trim() === '') {
					console.warn('⚠️ 查询拉黑阈值失败: 车牌号为空');
					return null;
				}

				console.log(' 查询拉黑阈值 - 车牌:', plateNumber);

				const response = await uni.request({
					url: `https://www.xuerparking.cn:8543/parking/violations/threshold-remaining/${plateNumber}`,
					method: 'GET',
					data: {
						parkName: this.selectedParkingLot || '东北林业大学'
					},
					timeout: 10000
				});

				console.log(' 查询拉黑阈值响应:', response.data.data.data);

				if (response.statusCode === 200 && response.data.code === '0') {
					const thresholdData = response.data.data.data;
					console.log('✅ 拉黑阈值查询成功:', thresholdData);
					return thresholdData;
				} else {
					console.warn('⚠️ 拉黑阈值查询失败:', response.data);
					return null;
				}
			} catch (error) {
				console.error('❌ 查询拉黑阈值异常:', error);
				return null;
			}
		},

		// ❌ 已废弃：自动拉黑现在由后端完全处理
		// 前端不再需要展开拉黑按钮，避免干扰用户操作
		async autoBlacklistAndNotify() {
			console.log('ℹ️ [自动拉黑] 已由后端自动处理，前端无需操作');
			// 不再修改 formData.shouldBlacklist，避免展开拉黑按钮
		},

		// 获取违规类型名称
		// getViolationTypeName() {
		// 	if (!this.formData.violationType) return '';
		// 	if (this.formData.violationType === 'other') {
		// 		return this.formData.customType || '其他';
		// 	}

		// 	//  使用 typeOptions 查找对应的中文名称
		// 	const typeInfo = this.typeOptions.find(type => type.value === this.formData.violationType);
		// 	return typeInfo ? (typeInfo.label || typeInfo.name) : this.formData.violationType;
		// },

		// 提交到服务器
		async submitToServer() {
			try {
				// 获取当前用户信息
				let userInfo = uni.getStorageSync('userInfo');

				//  如果userInfo为空，尝试从其他来源获取
				if (!userInfo) {
					console.log('⚠️ [提交违规] userInfo为空，尝试从其他来源获取');
					userInfo = this.getUserInfoFromAllSources();
				}
				const currentUserId = userInfo?.userId || userInfo?.id || 'patrol_' + Date.now();
				const userRole = this.currentUserRole === '管理员' ? 'admin' : 'patrol';
				const storedUsername = (() => {
					try {
						return (typeof localStorage !== 'undefined') ? (localStorage.getItem(
							'ms_username') || localStorage.getItem('login_name') || localStorage
								.getItem('ms_username')) : null;
					} catch (e) {
						return null;
					}
				})();
				// 根据不同角色获取用户姓名
				let currentUserName = 'anonymous';

				// 优先检查巡逻员身份
				if (userInfo?.patrolData?.username) {
					currentUserName = userInfo.patrolData.username;
					console.log(' 检测到巡逻员身份，姓名:', currentUserName);
				}
				// 检查管家身份 
				else if (userInfo?.userInfo?.username) {
					currentUserName = userInfo.userInfo.username;
					console.log(' 检测到管家身份，姓名:', currentUserName);
				}
				// 检查业主身份
				else if (userInfo?.userInfo?.ownername || userInfo?.ownername) {
					currentUserName = userInfo.userInfo?.ownername || userInfo.ownername;
					console.log('‍‍‍ 检测到业主身份，姓名:', currentUserName);
				}
				// 通用用户信息字段
				else if (userInfo?.realName || userInfo?.userName || userInfo?.loginName || userInfo?.nickname ||
					userInfo?.name) {
					currentUserName = userInfo.realName || userInfo.userName || userInfo.loginName || userInfo
						.nickname || userInfo.name;
					console.log(' 使用通用用户字段，姓名:', currentUserName);
				}
				// 从localStorage获取
				else if (storedUsername) {
					currentUserName = storedUsername;
					console.log(' 从localStorage获取，姓名:', currentUserName);
				}

				console.log('✅ 最终确定的用户姓名:', currentUserName);

				// 处理ID类型转换：后端需要int类型的ID（范围：-2147483648 到 2147483647）
				const getNumericId = (id) => {
					const MAX_INT = 2147483647; // Java int 最大值
					const MIN_SAFE_ID = 1; // 最小安全ID
					const MAX_SAFE_ID = 999999999; // 最大安全ID（在int范围内）

					if (typeof id === 'number') {
						// 确保数字在安全范围内
						return Math.min(Math.max(id, MIN_SAFE_ID), MAX_SAFE_ID);
					}

					if (typeof id === 'string') {
						// 如果是数字字符串，直接转换
						const numId = parseInt(id);
						if (!isNaN(numId)) {
							// 如果数字太大，取后面几位或者生成新的安全ID
							if (numId > MAX_SAFE_ID) {
								// 取时间戳的后6位 + 随机3位，确保在安全范围内
								const timestamp = Date.now();
								const shortId = parseInt(timestamp.toString().slice(-6)) * 1000 + Math.floor(
									Math.random() * 1000);
								return Math.min(shortId, MAX_SAFE_ID);
							}
							return Math.max(numId, MIN_SAFE_ID);
						}

						// 如果是类似"patrol_1754620020831"的字符串，提取数字部分
						const match = id.match(/\d+/);
						if (match) {
							const extractedNum = parseInt(match[0]);
							if (extractedNum > MAX_SAFE_ID) {
								// 数字太大，生成一个安全的ID
								const timestamp = Date.now();
								const shortId = parseInt(timestamp.toString().slice(-6)) * 1000 + Math.floor(
									Math.random() * 1000);
								return Math.min(shortId, MAX_SAFE_ID);
							}
							return Math.max(extractedNum, MIN_SAFE_ID);
						}
					}

					// 默认返回一个安全范围内的随机数字ID
					return Math.floor(Math.random() * (MAX_SAFE_ID - MIN_SAFE_ID + 1)) + MIN_SAFE_ID;
				};

				//  获取月票信息的辅助函数
				const getMonthTicketInfo = () => {
					if (this.ownerInfo?.isMonthlyTicket && this.ownerInfo?.ticketName) {
						console.log(' [月票信息] 检测到月票车:', {
							ticketName: this.ownerInfo.ticketName,
							monthTicketId: this.ownerInfo.monthTicketId || this.ownerInfo.ownerId,
							ownerId: this.ownerInfo.ownerId
						});

						return {
							monthTicketId: this.ownerInfo.monthTicketId || this.ownerInfo.ownerId,
							isMonthlyTicket: true,
							ticketName: this.ownerInfo.ticketName
						};
					}

					console.log(' [车辆信息] 非月票车或无月票信息');
					return {
						monthTicketId: null,
						isMonthlyTicket: false,
						ticketName: null
					};
				};

				//  获取月票信息
				const monthTicketInfo = getMonthTicketInfo();
				console.log("测试数据", this.formData.enterTime)
				console.log("测试数据2", this.formData.arrivedate)
				// 构建符合后端实体类的提交数据（使用驼峰命名）
				const submitData = {
					plateNumber: this.formData.plateNumber,
					ownerId: this.ownerInfo?.ownerId ? getNumericId(this.ownerInfo.ownerId) :
						null, // 如果有业主信息则使用业主ID，否则设为null

					//  添加预约记录关联
					appointmentId: this.selectedAppointmentId ? getNumericId(this.selectedAppointmentId) :
						null, // 预约记录ID

					//  添加月票关联信息
					monthTicketId: monthTicketInfo.monthTicketId ? getNumericId(monthTicketInfo
						.monthTicketId) : null,
					isMonthlyTicket: monthTicketInfo.isMonthlyTicket,

					violationType: this.getViolationTypeName(), // 使用中文名称
					customType: this.formData.customType || null,
					location: this.formData.location,
					description: this.formData.description || '',
					createdAt: (() => {
						const now = new Date();
						const year = now.getFullYear();
						const month = String(now.getMonth() + 1).padStart(2, '0');
						const day = String(now.getDate()).padStart(2, '0');
						const hour = String(now.getHours()).padStart(2, '0');
						const minute = String(now.getMinutes()).padStart(2, '0');
						const second = String(now.getSeconds()).padStart(2, '0');
						return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
					})(), // 违规发生时间 - 格式：yyyy-MM-dd HH:mm:ss
					reporterId: getNumericId(currentUserId), // 举报人ID转换为数字
					// 移除状态字段：不再处理状态
					severity: this.calculateSeverity(), // 计算严重程度
					createdBy: currentUserName, // 创建人姓名
					remark: this.formData.description || '', // 备注信息

					//  拉黑相关字段（仅管理员角色才有权限设置）
					shouldBlacklist: this.shouldShowBlacklistSection && this.formData.shouldBlacklist ? 1 :
						0, // 是否拉黑 (转换为数字：true->1, false->0)
					blacklistReason: this.shouldShowBlacklistSection && this.formData.shouldBlacklist ? this
						.formData.blacklistReason : null, // 拉黑原因

					//  黑名单类型信息
					blacklistTypeCode: this.shouldShowBlacklistSection && this.formData.shouldBlacklist && this
						.blacklistTypeOptions.length > 0 ?
						this.blacklistTypeOptions[this.selectedBlacklistTypeIndex].code : null, // 黑名单类型编码
					blacklistTypeName: this.shouldShowBlacklistSection && this.formData.shouldBlacklist && this
						.blacklistTypeOptions.length > 0 ?
						this.blacklistTypeOptions[this.selectedBlacklistTypeIndex].name : null, // 黑名单类型名称

					//  黑名单时长信息
					blacklistDurationType: this.shouldShowBlacklistSection && this.formData.shouldBlacklist ?
						this.blacklistDurationType : null, // 拉黑时长类型：permanent(永久), temporary(临时)
					blacklistStartTime: this.shouldShowBlacklistSection && this.formData.shouldBlacklist &&
						this.blacklistDurationType === 'temporary' ?
						this.ensureDateTimeFormat(this.blacklistStartTime) : null, // 拉黑开始时间
					blacklistEndTime: this.shouldShowBlacklistSection && this.formData.shouldBlacklist && this
						.blacklistDurationType === 'temporary' ?
						this.ensureDateTimeFormat(this.blacklistEndTime) : null, // 拉黑结束时间

					// 以下字段暂时设为空，可以后续扩展（移除处理人字段）
					photos: this.formData.photos.length > 0 ? JSON.stringify(this.formData.photos) :
						"", // 照片信息（JSON字符串格式）
					voiceMemo: null, // 语音备忘（后续可以扩展）

					//  修复：正确映射时间字段到violations表
					enterTime: this.formData.enterTime, //  进场时间：来自预约表的arrivedate或在场接口查询结果
					leaveTime: this.formData.leaveTime, //  离场时间：从预约表leavedate获取
					appointmentTime: this.formData.appointmentTime, //  预约时间：从预约表visitdate/recorddate获取

					//  停车场信息
					parkCode: 'NEFU', // 停车场编码（东北林业大学固定为NEFU）
					parkName: this.selectedParkingLot || '东北林业大学', // 停车场名称

					//  东北林业大学月票车特殊处理：存储查询出来的月票车信息
					ownerName: this.ownerInfo?.name || null, // 车主姓名
					ownerPhone: this.ownerInfo?.phone || null, // 车主电话
					ownerAddress: this.ownerInfo?.address || null, // 车主地址（学院）
					ownerCategory: this.ownerInfo?.ownerCategory || null, // 人员类别
					customerCompany: this.ownerInfo?.customerCompany || null, // 单位
					customerRoomNumber: this.ownerInfo?.customerRoomNumber || null, // 车位号
					vipTypeName: this.ownerInfo?.ticketName || null // 月票类型名称（VIP类型）
				};

				// 调用真实API接口
				const result = await violationApi.createViolation(submitData);

				console.log('✅ 违规记录提交成功:', result);

				// 返回成功响应
				return {
					success: true,
					violationId: result.id || 'VIO_' + Date.now(),
					message: '违规记录已成功提交到数据库',
					currentUser: currentUserName,
					userRole: userRole,
					plateNumber: submitData.plateNumber, //  添加车牌号，避免重置后丢失
					data: result
				};

			} catch (error) {
				console.error('❌ 提交违规记录失败:', error);

				// 抛出错误供调用者处理
				throw new Error(error.message || '提交失败，请检查网络连接后重试');
			}
		},

		// 计算违规严重程度
		calculateSeverity() {
			const severityMap = {
				// 严重违规 - 'severe'
				'block_passage': 'severe', // 堵塞消防通道 - 严重
				'disabled_space': 'severe', // 占用残疾人车位 - 严重
				'fire_lane': 'severe', // 占用消防通道 - 严重
				'green_belt': 'severe', // 占用绿化带 - 严重
				'loading_zone': 'severe', // 占用卸货区 - 严重

				// 中等违规 - 'moderate'
				'occupy_space': 'moderate', // 占用他人车位 - 中等
				'unauthorized': 'moderate', // 未经授权停车 - 中等
				'block_plate': 'moderate', // 遮挡车牌 - 中等
				'vip_space': 'moderate', // 占用VIP车位 - 中等
				'charging_space': 'moderate', // 占用充电桩车位 - 中等
				'reverse_parking': 'moderate', // 逆向停车 - 中等
				'cross_parking': 'moderate', // 跨车位停车 - 中等
				'vehicle_damage': 'moderate', // 车辆损坏 - 中等

				// 轻微违规 - 'mild'
				'overtime': 'mild', // 超时停车 - 轻微
				'wrong_position': 'mild', // 未按位停车 - 轻微
				'cross_line': 'mild', // 压线停车 - 轻微
				'engine_on': 'mild', // 未熄火停车 - 轻微
				'oversized': 'mild', // 超宽停车 - 轻微
				'other': 'mild' // 其他 - 轻微
			};
			return severityMap[this.formData.violationType] || 'mild';
		},

		// 计算信用分影响
		calculateCreditImpact() {
			const impactMap = {
				'severe': -10, // 严重违规扣10分
				'moderate': -5, // 中等违规扣5分
				'mild': -2 // 轻微违规扣2分
			};
			const severity = this.calculateSeverity();
			return impactMap[severity] || -2;
		},

		// 重置表单
		resetForm(showToast = false) {
			console.log(' 重置表单数据');
			// 重置表单数据
			this.formData = {
				plateNumber: '',
				violationType: '',
				customType: '',
				location: '',
				photos: [],
				description: '',
				shouldBlacklist: false,
				blacklistReason: '',
				blacklistDecisionMade: true, // ✅ 重置为已决定不拉黑（无需用户点击）
				enterTime: null, //  重置进场时间
				leaveTime: null, //  重置离场时间
				appointmentTime: null //  重置预约时间
			};

			//  重置黑名单相关状态
			this.selectedBlacklistTypeIndex = 0;
			this.blacklistDurationType = 'permanent';
			this.blacklistStartTime = '';
			this.blacklistEndTime = '';

			// 重置界面状态
			this.uiState = {
				showMoreTypes: false,
				searchKeyword: '',
				isSearching: false
			};

			// 重置其他状态
			this.ownerInfo = null;
			this.showPlateSuggestions = false;
			this.plateSuggestions = [];
			this.plateFocused = false;
			this.locationFocused = false;

			//  重置预约记录相关状态
			this.appointmentRecords = [];
			this.violationSuggestions = [];
			this.selectedAppointmentId = null;
			this.showAppointmentModal = false;
			this.whitelistInfo = null;
			this.isWhitelistVehicle = false;

			// 重置扫描和识别状态
			this.showCamera = false;
			this.isRecognizing = false;
			this.scanResult = '';
			this.scanning = false;
			this.showScanModal = false;

			//  重置车牌号码相关状态
			this.plateChars = ['', '', '', '', '', '', '']; // 重置为7位空数组（蓝牌默认）
			this.currentIndex = 0; // 重置当前选中位置为第一位
			this.isNewEnergyMode = false; // 重置为普通车牌

			// 重置车牌类型选择器到蓝牌
			this.selectedColor = 'linear-gradient(to bottom, #216fef, #0c4fc5)';
			this.textColor = '#fff';

			// 重置键盘状态
			this.showProvinceKeyboard = true; // 默认显示省份键盘
			this.showNumberKeyboard = false; // 隐藏数字字母键盘
			this.showNumbers = false; // 重置数字显示状态

			// 仅在需要时显示提示（例如用户手动点击重置按钮）
			if (showToast) {
				uni.showToast({
					title: '已重置，可继续添加',
					icon: 'success',
					duration: 1500
				});
			}
		},

		// 执行自动识别
		async performAutoRecognize() {
			if (!this.autoRecognize || !this.showCamera) return;

			// 防抖：如果正在识别中，跳过此次
			if (this.isRecognizing) {
				console.log('⏭️ 跳过自动识别（正在识别中）');
				this.scheduleNextAutoRecognize();
				return;
			}

			// 防抖：检查距离上次识别的时间间隔
			const now = Date.now();
			if (now - this.lastRecognizeTime < 2000) {
				console.log('⏭️ 跳过自动识别（间隔太短）');
				this.scheduleNextAutoRecognize();
				return;
			}

			this.autoRecognizeCount++;
			this.lastRecognizeTime = now;
			console.log(` 执行第${this.autoRecognizeCount}次自动识别`);

			try {
				// 自动拍照
				await this.autoCapture();
			} catch (error) {
				console.error('自动识别失败:', error);
			}

			// 调度下次自动识别
			this.scheduleNextAutoRecognize();
		},

		// 调度下次自动识别
		scheduleNextAutoRecognize() {
			if (!this.autoRecognize) return;

			this.autoRecognizeTimer = setTimeout(() => {
				this.performAutoRecognize();
			}, this.autoRecognizeInterval);
		},

		// 自动拍照（用于自动识别）
		async autoCapture() {
			if (this.isRecognizing) return;

			this.isRecognizing = true;
			try {
				const ctx = uni.createCameraContext('camera', this);
				return new Promise((resolve, reject) => {
					ctx.takePhoto({
						quality: 'high',
						success: async (res) => {
							try {
								await this.recognizeFromImage(res.tempImagePath,
									true); // 传入true表示自动识别
								resolve();
							} catch (error) {
								reject(error);
							}
						},
						fail: (err) => {
							console.error('自动拍照失败:', err);
							this.isRecognizing = false;
							reject(err);
						}
					});
				});
			} catch (error) {
				console.error('自动拍照异常:', error);
				this.isRecognizing = false;
				throw error;
			}
		},

		// 拍照识别（手动）
		async capturePhoto() {
			if (this.isRecognizing || this.autoRecognize) return;

			this.isRecognizing = true;
			try {
				// 从camera组件获取照片
				const ctx = uni.createCameraContext('camera', this);
				ctx.takePhoto({
					quality: 'high',
					success: (res) => {
						this.recognizeFromImage(res.tempImagePath, false); // 传入false表示手动识别
					},
					fail: (err) => {
						console.error('拍照失败:', err);
						uni.showToast({
							title: '拍照失败',
							icon: 'none'
						});
						this.isRecognizing = false;
					}
				});
			} catch (error) {
				console.error('拍照异常:', error);
				this.isRecognizing = false;
				uni.showToast({
					title: '拍照失败',
					icon: 'none'
				});
			}
		},

		// 摄像头错误处理
		handleCameraError(error) {
			console.error('摄像头错误:', error);
			uni.showToast({
				title: '摄像头启动失败',
				icon: 'none'
			});
			this.showCamera = false;
		},

		// 从相册选择
		chooseFromAlbum() {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album'],
				success: (res) => {
					this.recognizeFromImage(res.tempFilePaths[0]);
				}
			});
		},

		// 从图片识别
		async recognizeFromImage(imagePath, isAutoRecognition = false) {
			if (!isAutoRecognition) {
				uni.showLoading({
					title: '识别中...'
				});
			}

			try {
				const base64 = await this.imageToBase64(imagePath);
				const result = await this.callRecognitionAPI(base64, isAutoRecognition);

				if (result && result.success) {
					// 识别成功，重置失败计数
					this.failedRecognizeCount = 0;

					this.lastResult = {
						plateNumber: result.plateNumber || 'Unknown',
						color: result.color || '未知',
						confidence: result.confidence || 0,
						recognizeTime: new Date().toISOString()
					};

					this.scanResult = result.plateNumber;

					if (isAutoRecognition) {
						// 自动识别成功，暂停自动识别并显示确认对话框
						console.log(`✅ 自动识别成功: ${result.plateNumber}`);
						console.log(' 暂停自动识别，等待用户选择');

						// 先暂停自动识别
						this.stopAutoRecognize();

						uni.showModal({
							title: '车牌识别成功',
							content: `识别到车牌号码：${result.plateNumber}\n车牌颜色：${result.color}\n置信度：${result.confidence}%`,
							confirmText: '继续识别',
							cancelText: '使用',
							success: (res) => {
								console.log(' 用户选择:', res);
								if (res.cancel) {
									// 用户选择使用此车牌，关闭摄像头和弹窗并自动填充车牌号码
									this.showCamera = false;
									// 自动填充识别到的车牌号码到虚拟键盘
									this.autoFillPlateNumber(result.plateNumber);
									// 显示虚拟键盘
									this.showPlateKeyboard = true;
									// 关闭车牌识别弹窗
									this.closePlateRecognition();
									console.log(' [车牌识别] 使用识别结果，已关闭弹窗');
								} else if (res.confirm) {
									// 用户选择继续识别，重新启动自动识别
									console.log(' 用户选择继续识别，重新启动自动识别');
									this.startAutoRecognize();
								}
							},
							fail: (err) => {
								console.error('❌ showModal 失败:', err);
							}
						});
					} else {
						// 手动识别成功，关闭摄像头、弹窗并自动填充结果
						this.showCamera = false;
						this.stopAutoRecognize();

						// 自动填充识别到的车牌号码到虚拟键盘
						this.autoFillPlateNumber(result.plateNumber);
						// 显示虚拟键盘
						this.showPlateKeyboard = true;
						// 关闭车牌识别弹窗
						this.closePlateRecognition();

						uni.showToast({
							title: '识别成功',
							icon: 'success'
						});
					}
				} else {
					console.error('识别失败，API响应:', result);
					this.failedRecognizeCount++;
					console.log(`❌ 识别失败，失败次数: ${this.failedRecognizeCount}/7`);

					// 检查是否达到失败次数上限
					if (this.failedRecognizeCount >= 7) {
						this.isRecognitionDisabled = true;
						// 设置5分钟后解除禁用
						this.disabledUntilTime = Date.now() + 5 * 60 * 1000;
						this.stopAutoRecognize();
						this.closePlateRecognition();

						console.log(' 识别失败7次，禁用识别功能5分钟');
						uni.showModal({
							title: '识别失败次数过多',
							content: '车牌识别已失败7次，功能将禁用5分钟。\n\n请手动输入车牌号码或等待5分钟后重试。',
							showCancel: false,
							confirmText: '知道了'
						});
						return;
					}

					if (isAutoRecognition) {
						// 自动识别失败，静默处理，继续下次识别
						console.log(`❌ 第${this.autoRecognizeCount}次自动识别失败，继续下次识别`);
					} else {
						// 手动识别失败，显示错误信息
						const errorMsg = result && result.errorMessage ? result.errorMessage : `识别失败，请重试 (${this.failedRecognizeCount}/7)`;
						uni.showToast({
							title: errorMsg,
							icon: 'none',
							duration: 3000
						});
					}
				}
			} catch (error) {
				console.error('识别API调用失败:', error);
				this.failedRecognizeCount++;
				console.log(`识别异常，失败次数: ${this.failedRecognizeCount}/7`);

				// 检查是否达到失败次数上限
				if (this.failedRecognizeCount >= 7) {
					this.isRecognitionDisabled = true;
					// 设置5分钟后解除禁用
					this.disabledUntilTime = Date.now() + 5 * 60 * 1000;
					this.stopAutoRecognize();
					this.closePlateRecognition();

					console.log(' 识别失败7次，禁用识别功能5分钟');
					uni.showModal({
						title: '识别失败次数过多',
						content: '车牌识别已失败7次，功能将禁用5分钟。\n\n请手动输入车牌号码或等待5分钟后重试。',
						showCancel: false,
						confirmText: '知道了'
					});
					return;
				}

				if (isAutoRecognition) {
					// 自动识别异常，静默处理
					console.log(`❌ 第${this.autoRecognizeCount}次自动识别异常:`, error.message);
				} else {
					// 手动识别异常，模拟结果用于测试
					this.lastResult = {
						plateNumber: '黑A12345',
						color: '蓝牌',
						confidence: 85,
						recognizeTime: new Date().toISOString()
					};

					this.scanResult = '黑A12345';
					this.showCamera = false;
					this.stopAutoRecognize();

					// 自动填充模拟结果到车牌展示和虚拟键盘
					this.useScanResult();

					uni.showToast({
						title: '模拟识别成功（请配置API）',
						icon: 'success'
					});
				}
			} finally {
				if (!isAutoRecognition) {
					uni.hideLoading();
				}
				this.isRecognizing = false;
			}
		},

		// 调用识别API
		async callRecognitionAPI(base64Image, isAutoRecognition = false) {
			console.log(isAutoRecognition ? ' 自动识别API调用' : ' 手动识别API调用');

			try {
				// 移除base64中的空白字符
				const cleanBase64 = base64Image.replace(/\s/g, '');

				const response = await uni.request({
					url: 'https://www.xuerparking.cn:8543/api/plate/recognize',
					method: 'POST',
					header: {
						'Content-Type': 'application/json'
					},
					data: {
						image: cleanBase64,
						multiDetect: false
					},
					timeout: isAutoRecognition ? 15000 : 30000 // 自动识别使用较短超时
				});

				if (!isAutoRecognition) {
					console.log('车牌识别响应:', response);
				}

				if (response.statusCode === 200) {
					const result = response.data;

					// 检查响应格式：处理可能的双重嵌套结构
					let plateData = null;

					if (result.code === "0" && result.data) {
						// 检查是否是双重嵌套的Result结构
						if (result.data.code === "0" && result.data.data) {
							plateData = result.data.data; // 双重嵌套情况
						} else if (result.data.success) {
							plateData = result.data; // 正常情况
						}
					}

					if (plateData && plateData.success) {
						const recognitionResult = {
							success: true,
							plateNumber: plateData.plateNumber || '未识别',
							color: plateData.color || '未知',
							confidence: plateData.confidence || 0,
							recognizeTime: new Date().toISOString()
						};

						return recognitionResult;
					} else {
						// 处理错误情况
						let errorMsg = '识别失败';

						// 更智能的错误信息提取
						if (result.code === "-1") {
							errorMsg = result.msg || '识别失败';
						} else if (result.data && result.data.code === "-1") {
							errorMsg = result.data.msg || '识别失败';
						} else if (result.data && result.data.errorMessage) {
							errorMsg = result.data.errorMessage;
						} else if (!plateData) {
							errorMsg = '未检测到车牌或响应格式异常';
						}

						throw new Error(errorMsg);
					}
				} else {
					throw new Error(`请求失败: ${response.statusCode}`);
				}
			} catch (error) {
				if (!isAutoRecognition) {
					console.error('车牌识别失败:', error);
					uni.showToast({
						title: error.message || '识别失败',
						icon: 'error',
						duration: 3000
					});
				}

				// 返回错误结果
				return {
					success: false,
					errorMessage: error.message || '识别失败'
				};
			} finally {
				this.isRecognizing = false;
			}
		},

		// 图片转base64
		imageToBase64(imagePath) {
			return new Promise((resolve, reject) => {
				uni.getFileSystemManager().readFile({
					filePath: imagePath,
					encoding: 'base64',
					success: (res) => {
						// 确保base64数据格式正确，移除可能的换行符和空格
						let base64Data = res.data;
						if (base64Data) {
							base64Data = base64Data.replace(/\s/g, ''); // 移除所有空白字符
							console.log('Base64 图片大小:', base64Data.length);
						}
						resolve(base64Data);
					},
					fail: (error) => {
						console.error('图片转base64失败:', error);
						reject(error);
					}
				});
			});
		},

		// ================ 车牌键盘相关方法 ================

		// 显示键盘并传递当前车牌号码
		showKeyboardWithCurrentValue() {
			// 获取当前输入的车牌号码
			const currentPlateNumber = this.getPlateNumber();
			console.log(' 显示键盘，当前车牌号码:', currentPlateNumber);
			this.toShow(currentPlateNumber);
		},

		// 获取当前车牌号码
		getPlateNumber() {
			return this.formData.plateNumber || '';
		},

		toShow(value) {
			this.value = value || '';
			this.isShow = true;
			this.$refs.keyboardInput.changeValue(this.value);
			this.$nextTick(() => {
				this.updateCurrentPlateChars();
			});
		},

		keyboardClosed() {
			this.isShow = false;
			this.clearCurrentPlateChars();
			this.$emit('cancel');
		},

		toCancel() {
			this.keyboardClosed();
		},

		toConfirm() {
			this.isShow = false;
			if (this.$refs.keyboardInput && this.$refs.keyboardInput.values) {
				let value = this.$refs.keyboardInput.values.join('');
				this.formData.plateNumber = value;
				this.onPlateNumberChange();
			}
		},

		inputChange(index) {
			this.carIndex = index;

			// 安全检查：确保 keyboardInput 组件存在且有 values 属性
			if (!this.$refs.keyboardInput || !this.$refs.keyboardInput.values) {
				console.warn('keyboardInput 组件或其 values 属性不存在');
				return;
			}

			let newValue = this.$refs.keyboardInput.values[index - 1];

			// 安全检查：确保弹窗键盘组件存在
			if (!this.$refs.popupKeyboard) {
				console.warn('popupKeyboard 组件不存在');
				return;
			}

			// 切换弹窗键盘的模式
			if (index == 0) {
				this.$refs.popupKeyboard.changeMode(index == 0 ? 0 : 1);
			} else {
				this.$refs.popupKeyboard.changeMode(1);
			}

			// 更新车牌字符数组以保持同步
			this.$nextTick(() => {
				this.updateCurrentPlateChars();
			});
		},

		inputAdd(v) {
			console.log('➕ 执行添加操作:', v);
			this.$refs.keyboardInput.toAdd(v);
			this.$nextTick(() => {
				console.log(' 添加后更新车牌字符数组');
				this.updateCurrentPlateChars();
				// 触发计算属性更新
				this.plateUpdateTrigger++;
			});
		},

		inputDel() {
			console.log('️ 执行删除操作');
			this.$refs.keyboardInput.toDel();

			// 立即更新预览区域，确保删除操作能实时反映
			this.$nextTick(() => {
				console.log(' 删除后更新车牌字符数组');
				this.updateCurrentPlateChars();
				// 触发计算属性更新
				this.plateUpdateTrigger++;

				// 添加额外的延迟确保更新
				setTimeout(() => {
					this.$forceUpdate();
					console.log(' 强制更新完成');
				}, 50);
			});
		},

		inputClear() {
			console.log(' 执行清除操作');
			this.$refs.keyboardInput.toClear();
			this.clearCurrentPlateChars();
			// 触发计算属性更新
			this.plateUpdateTrigger++;
		},

		// 车牌颜色切换
		changeColor(color) {
			console.log(' 切换车牌类型，清除之前输入的车牌号码');

			// 先清除所有输入的车牌号码
			this.clearAllPlateInput();

			this.carColor = color;
			this.selectedColor = color;

			if (color == 'linear-gradient(to bottom, #d0f1e4, #6ad390)') {
				this.carMax = false;
				this.maxCarLenght = 8;
				this.plateType = "newEnergy";
				this.borderBgColor = "#000";
				this.dynamicWidth = 22;
				this.textColor = '#000';
				// 设置新能源车牌标志和8位字符数组
				this.isNewEnergyMode = true;
				this.plateChars = ['', '', '', '', '', '', '', ''];
			} else {
				this.carMax = true;
				this.maxCarLenght = 7;
				this.dynamicWidth = 25;
				// 设置普通车牌标志和7位字符数组
				this.isNewEnergyMode = false;
				this.plateChars = ['', '', '', '', '', '', ''];
				if (color == 'linear-gradient(to bottom, #216fef, #0c4fc5)') {
					this.plateType = "blue";
					this.borderBgColor = "#fff";
					this.textColor = '#fff';
				} else if (color == 'linear-gradient(to bottom, #f8c401, #dba700)') {
					this.plateType = "yellow";
					this.borderBgColor = "#000";
					this.textColor = '#000';
				} else if (color == 'linear-gradient(to bottom, #f5f5f5, #e0e0e0)') {
					this.plateType = "white";
					this.borderBgColor = "#000";
					this.textColor = '#000';
				} else if (color == 'linear-gradient(to bottom, #525252, #1e1e1e)') {
					this.plateType = "black";
					this.borderBgColor = "#fff";
					this.textColor = '#fff';
				}
			}

			// 调整车牌字符数组长度以匹配新的车牌类型
			this.adjustPlateCharsLength();
			this.updateCurrentPlateChars();
			// 重新初始化自定义键盘以适应新的车牌类型
			this.initCustomKeyboard();
		},

		// 清除所有车牌输入
		clearAllPlateInput() {
			this.formData.plateNumber = '';
			if (this.$refs.keyboardInput) {
				this.$refs.keyboardInput.toClear();
			}
			this.clearCurrentPlateChars();
			// 同时清空自定义键盘数据
			this.clearAll();

			//  修复：清空业主信息和表单数据
			this.ownerInfo = null;
			this.formData.enterTime = null;
			this.formData.leaveTime = null;
			this.formData.appointmentTime = null;
			this.selectedAppointmentId = null;
			this.showViolationRecords = false;
		},

		// 调整车牌字符数组长度
		adjustPlateCharsLength() {
			const newLength = this.maxCarLenght;
			this.currentPlateChars = new Array(newLength).fill('');
		},

		// 更新当前车牌字符数组
		updateCurrentPlateChars() {
			if (this.$refs.keyboardInput && this.$refs.keyboardInput.values) {
				const values = this.$refs.keyboardInput.values;
				this.currentPlateChars = [...values];

				// 确保数组长度正确
				while (this.currentPlateChars.length < this.maxCarLenght) {
					this.currentPlateChars.push('');
				}
				// 更新表单数据
				this.formData.plateNumber = values.join('');
			}
		},

		// 清除当前车牌字符数组
		clearCurrentPlateChars() {
			this.currentPlateChars = new Array(this.maxCarLenght).fill('');
		},

		// ================  预约记录相关方法 ================

		// 加载预约记录并分析违规情况
		async loadAppointmentRecords(plateNumber) {
			if (!plateNumber) {
				this.appointmentRecords = [];
				this.violationSuggestions = [];
				return;
			}

			try {
				console.log(' 查询预约记录:', plateNumber);

				// 使用封装好的API调用
				const response = await violationApi.getAppointmentRecords(plateNumber);

				if (response) {
					this.appointmentRecords = Array.isArray(response) ? response : (response.data || []);
					console.log('✅ 预约记录查询成功:', this.appointmentRecords);

					// 如果有预约记录，进行违规分析
					if (this.appointmentRecords.length > 0) {
						await this.analyzeViolations(plateNumber);

						// 显示成功提示，提醒用户选择预约记录
						uni.showToast({
							title: `找到${this.appointmentRecords.length}条预约记录，请选择`,
							icon: 'none',
							duration: 3000
						});

						// 可选：显示预约记录选择弹窗（如果用户喜欢弹窗方式）
						// this.showAppointmentSelectionModal();
					} else {
						uni.showToast({
							title: '未找到预约记录',
							icon: 'none',
							duration: 2000
						});
					}
				} else {
					console.warn('⚠️ 预约记录查询失败:', response);
					this.appointmentRecords = [];
				}
			} catch (error) {
				console.error('❌ 查询预约记录失败:', error);
				this.appointmentRecords = [];
			}
		},

		// 分析违规情况
		async analyzeViolations(plateNumber) {
			try {
				console.log(' 分析违规情况:', plateNumber);

				// 使用封装好的API调用
				const response = await violationApi.analyzeViolationByPlate(plateNumber);

				if (response) {
					const analysisData = response.data ? response.data : response;
					this.violationSuggestions = analysisData.violationSuggestions || [];
					console.log('✅ 违规分析成功:', this.violationSuggestions);
				} else {
					console.warn('⚠️ 违规分析失败:', response);
					this.violationSuggestions = [];
				}
			} catch (error) {
				console.error('❌ 违规分析失败:', error);
				this.violationSuggestions = [];
			}
		},

		// 显示预约记录选择弹窗
		showAppointmentSelectionModal() {
			if (this.appointmentRecords.length === 0) {
				return;
			}

			// 构建选择项
			const itemList = this.appointmentRecords.map((record, index) => {
				const statusText = this.getStatusText(record.parkingStatus);
				const timeInfo = this.formatTimeInfo(record);
				const suggestion = this.getViolationSuggestionForRecord(record.id);

				let title = `${record.recorddate} ${statusText}`;
				let content = `${record.community} ${record.building}栋${record.units}单元${record.room}室`;

				if (timeInfo) {
					content += `\n${timeInfo}`;
				}

				if (suggestion) {
					content +=
						`\n 建议：${suggestion.type} (${suggestion.severity === 'severe' ? '严重' : suggestion.severity === 'moderate' ? '中等' : '轻微'})`;
				}

				return {
					title,
					content,
					recordId: record.id,
					record: record,
					suggestion: suggestion
				};
			});

			uni.showActionSheet({
				itemList: itemList.map(item => item.title),
				success: (res) => {
					const selectedItem = itemList[res.tapIndex];
					this.selectAppointmentRecord(selectedItem.record, selectedItem.suggestion);
				}
			});
		},

		// 选择预约记录
		selectAppointmentRecord(record, suggestion) {
			this.selectedAppointmentId = record.id;

			// 自动填充位置信息
			const location = `${record.community} ${record.building}栋${record.units}单元${record.room}室`;
			this.formData.location = location;

			// 如果有违规建议，自动填充违规类型和描述
			if (suggestion) {
				// 根据建议类型匹配违规类型配置
				const matchedType = this.findMatchingViolationType(suggestion.type);
				if (matchedType) {
					this.formData.violationType = matchedType.value;
					this.formData.description = suggestion.description || '';
				}

				uni.showToast({
					title: `已选择预约记录并自动填充违规信息`,
					icon: 'success',
					duration: 2000
				});
			} else {
				uni.showToast({
					title: '已选择预约记录',
					icon: 'success',
					duration: 1500
				});
			}
		},

		// 获取状态文本
		getStatusText(status) {
			const statusMap = {
				'已离场': '✅',
				'在场中': '',
				'未进场': '⏳'
			};
			return statusMap[status] || status;
		},

		// 格式化时间信息
		formatTimeInfo(record) {
			let timeInfo = '';

			if (record.arrivedate && record.leavedate) {
				const duration = this.calculateDuration(record.arrivedate, record.leavedate);
				timeInfo = `停车时长: ${duration}`;
			} else if (record.arrivedate) {
				timeInfo = `进场: ${record.arrivedate}`;
			} else if (record.leavedate) {
				timeInfo = `离场: ${record.leavedate}`;
			}

			return timeInfo;
		},

		// 计算停车时长
		calculateDuration(arriveTime, leaveTime) {
			try {
				const arrive = new Date(arriveTime);
				const leave = new Date(leaveTime);
				const diffMs = leave.getTime() - arrive.getTime();
				const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
				const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

				if (diffHours > 0) {
					return `${diffHours}小时${diffMinutes}分钟`;
				} else {
					return `${diffMinutes}分钟`;
				}
			} catch (error) {
				return '计算失败';
			}
		},

		// 获取指定预约记录的违规建议
		getViolationSuggestionForRecord(appointmentId) {
			return this.violationSuggestions.find(s => s.appointmentId === appointmentId);
		},

		// 根据建议类型匹配违规类型配置
		findMatchingViolationType(suggestionType) {
			//  使用动态加载的 typeOptions
			const allTypes = this.typeOptions;

			// 精确匹配 - 先按 label，再按 name
			let matched = allTypes.find(type =>
				type.label === suggestionType ||
				type.name === suggestionType
			);
			if (matched) return matched;

			// 模糊匹配
			const fuzzyMatches = {
				'超时停车': 'overtime',
				'未按时离场': 'overtime',
				'占用他人车位': 'occupy_space',
				'未经授权停车': 'unauthorized',
				'压线停车': 'cross_line',
				'未按位停车': 'wrong_position'
			};

			const matchedValue = fuzzyMatches[suggestionType];
			if (matchedValue) {
				matched = allTypes.find(type => type.value === matchedValue);
			}

			return matched || null;
		},

		// 获取状态样式类
		getStatusClass(status) {
			const classMap = {
				'已离场': 'status-completed',
				'在场中': 'status-parking',
				'未进场': 'status-pending'
			};
			return classMap[status] || 'status-default';
		},

		// 获取建议样式类
		getSuggestionClass(severity) {
			const classMap = {
				'severe': 'suggestion-severe',
				'moderate': 'suggestion-moderate',
				'mild': 'suggestion-mild'
			};
			return classMap[severity] || 'suggestion-default';
		},

		// 获取严重程度文本
		getSeverityText(severity) {
			const textMap = {
				'severe': '严重',
				'moderate': '中等',
				'mild': '轻微'
			};
			return textMap[severity] || '未知';
		},

		// 判断是否为新能源车牌
		isNewEnergyPlate(plateNumber) {
			if (!plateNumber) return false;
			// 简化判断逻辑，只需要检查长度是否为8位
			return plateNumber.length === 8;
		},

		// 加载更多搜索结果
		async loadMoreResults() {
			if (!this.plateSearchKeyword.trim() || this.isSearching) {
				return;
			}

			this.currentSearchPage++;
			this.isSearching = true;

			try {
				console.log(` 加载第${this.currentSearchPage}页搜索结果`);
				console.log(` 使用${this.usingSmartSearch ? '本地数据搜索' : '原有搜索'}API`);

				let response;
				if (this.usingSmartSearch) {
					// 使用本地数据库搜索API
					const parkName = this.currentPark || '默认停车场';
					response = await violationApi.searchLocalData({
						keyword: this.plateSearchKeyword,
						parkName: parkName,
						page: this.currentSearchPage,
						size: 200
					});
				} else {
					// 使用原有搜索API
					response = await ownerApi.getPlateSuggestions(this.plateSearchKeyword, {
						page: this.currentSearchPage,
						size: 200
					});
				}

				// 处理本地数据搜索和原有搜索的不同响应格式
				let dataArray, totalCount, hasMore;

				if (this.usingSmartSearch) {
					// 本地数据搜索：处理records格式
					if (response && response.records && Array.isArray(response.records)) {
						dataArray = response.records;
						totalCount = response.total || 0;
						hasMore = response.hasMore || false;
					}
				} else {
					// 原有搜索：处理data格式
					if (response && response.data && Array.isArray(response.data)) {
						dataArray = response.data;
						totalCount = response.total || response.count || this.totalSearchResults;
						hasMore = dataArray.length >= 200;
					}
				}

				if (dataArray && dataArray.length > 0) {
					// 将新结果追加到现有结果中
					const newSuggestions = dataArray.map(item => {
						if (this.usingSmartSearch) {
							// 本地数据搜索结果格式
							return {
								plateNumber: item.plateNumber,
								ownerName: item.ownerName,
								ownerPhone: item.ownerPhone,
								ownerId: item.ownerId || item.monthTicketId || null,
								ticketName: item.ticketName,
								parkingSpot: item.parkingSpot,
								validStatus: item.validStatus,
								isFrozen: item.isFrozen,
								isInPark: item.isInPark,
								appointmentCount: item.appointmentCount || 0,
								violationCount: item.violationCount || 0,
								creditScore: item.creditScore || 100
							};
						} else {
							// 原有搜索结果格式
							const plateNumber = item.plateNumber || item.plate_number || item.plate;
							return {
								plateNumber: plateNumber,
								ownerName: item.ownerName || item.owner_name || item.name,
								ownerId: item.ownerId || item.owner_id || item.id,
								appointmentCount: 0
							};
						}
					});

					this.plateSuggestions.push(...newSuggestions);

					// 检查是否还有更多结果
					if (this.plateSuggestions.length >= totalCount || !hasMore || dataArray.length < 200) {
						this.showLoadMoreBtn = false;
						uni.showToast({
							title: '已加载全部结果',
							icon: 'success',
							duration: 2000
						});
					}

					console.log(`✅ 成功加载第${this.currentSearchPage}页，当前共${this.plateSuggestions.length}条结果`);
				} else {
					// 没有更多结果
					this.showLoadMoreBtn = false;
					uni.showToast({
						title: '没有更多结果',
						icon: 'none',
						duration: 2000
					});
				}
			} catch (error) {
				console.error('❌ 加载更多结果失败:', error);
				this.currentSearchPage--; // 回退页码

				uni.showToast({
					title: '加载失败，请重试',
					icon: 'none',
					duration: 2000
				});
			} finally {
				this.isSearching = false;
			}
		},
		onBlacklistSwitchChange(e) {
			this.formData.shouldBlacklist = e.detail.value;
			this.formData.blacklistDecisionMade = true; // 标记用户已做出决定

			//  如果关闭拉黑，清空相关字段
			if (!e.detail.value) {
				this.formData.blacklistReason = '';
			}

			console.log(' 拉黑开关状态:', this.formData.shouldBlacklist);
			console.log('✅ 用户已明确做出拉黑决定');
		},
		useBlacklistReasonTemplate(template) {
			this.formData.blacklistReason = template;
		},

		// 切换拉黑模板展开状态
		toggleTemplates() {
			this.showTemplates = !this.showTemplates;
		},

		// ========== 黑名单类型相关方法 ==========

		/**
		 * 加载黑名单类型列表
		 */
		async loadBlacklistTypes() {
			// 如果不需要显示拉黑设置，则不加载
			if (!this.shouldShowBlacklistSection) {
				console.log('⚠️ [黑名单类型] 当前用户无拉黑权限，跳过加载');
				return;
			}

			this.blacklistTypeLoading = true;

			try {
				console.log(' [黑名单类型] 开始加载黑名单类型列表...');

				const response = await uni.request({
					url: 'https://www.xuerparking.cn:8543/parking/acms/vip/blacklist-types',
					method: 'POST',
					header: {
						'Content-Type': 'application/json'
					},
					data: {
						parkName: this.selectedParkingLot || '东北林业大学'
					}
				});
				console.log("查询的黑名单类型名称：", response)
				if (response.statusCode === 200 && response.data.data.code === "0") {
					const {
						blacklistTypes,
						isDefault
					} = response.data.data.data;

					this.blacklistTypeOptions = blacklistTypes || [];
					this.isDefaultBlacklistTypes = isDefault || false;

					// 设置默认选中第一个
					if (this.blacklistTypeOptions.length > 0) {
						this.selectedBlacklistTypeIndex = 0;
					}

					console.log('✅ [黑名单类型] 加载成功:', {
						count: this.blacklistTypeOptions.length,
						isDefault: this.isDefaultBlacklistTypes,
						types: this.blacklistTypeOptions
					});

					// 如果是默认数据，给出提示
					if (this.isDefaultBlacklistTypes) {
						console.warn('⚠️ [黑名单类型] 使用默认黑名单类型（ACMS未配置）');
					}
				} else {
					throw new Error(response.data?.msg || '获取黑名单类型失败');
				}
			} catch (error) {
				console.error('❌ [黑名单类型] 加载失败:', error);

				// 使用本地兜底数据
				this.blacklistTypeOptions = [{
					code: 'local_violation',
					name: '违规黑名单',
					description: '因违规停车被加入黑名单'
				},
				{
					code: 'local_security',
					name: '安全黑名单',
					description: '因安全原因被加入黑名单'
				}
				];
				this.isDefaultBlacklistTypes = true;
				this.selectedBlacklistTypeIndex = 0;

				console.warn('⚠️ [黑名单类型] 使用本地兜底数据');
			} finally {
				this.blacklistTypeLoading = false;
			}
		},

		/**
		 * 黑名单类型选择变更
		 */
		onBlacklistTypeChange(e) {
			this.selectedBlacklistTypeIndex = e.detail.value;
			const selectedType = this.blacklistTypeOptions[this.selectedBlacklistTypeIndex];

			console.log(' [黑名单类型] 选择变更:', {
				index: this.selectedBlacklistTypeIndex,
				type: selectedType
			});
		},

		/**
		 * 黑名单时长类型变更
		 */
		onBlacklistDurationTypeChange(e) {
			this.blacklistDurationType = e.detail.value;

			console.log(' [黑名单时长] 类型变更:', this.blacklistDurationType);

			// 如果切换到永久拉黑，清空时间选择
			if (this.blacklistDurationType === 'permanent') {
				this.blacklistStartTime = '';
				this.blacklistEndTime = '';
			} else {
				// 如果切换到临时拉黑，设置默认时间（当前时间 ~ 30天后）
				const now = new Date();
				const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

				this.blacklistStartTime = this.formatDateTime(now);
				this.blacklistEndTime = this.formatDateTime(endDate);
			}
		},

		/**
		 * 黑名单开始时间变更
		 */
		onBlacklistStartTimeChange(e) {
			this.blacklistStartTime = e.detail.value;
			console.log(' [黑名单时长] 开始时间:', this.blacklistStartTime);
		},

		/**
		 * 黑名单结束时间变更
		 */
		onBlacklistEndTimeChange(e) {
			this.blacklistEndTime = e.detail.value;
			console.log(' [黑名单时长] 结束时间:', this.blacklistEndTime);
		},

		/**
		 *  快速选择拉黑时长
		 * @param {number} days - 天数（15、30、60）
		 */
		selectQuickDuration(days) {
			const now = new Date();
			const endDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

			this.blacklistStartTime = this.formatDateTime(now);
			this.blacklistEndTime = this.formatDateTime(endDate);

			console.log(`⏱️ [快速选择] 已设置${days}天拉黑时长`);
			console.log('开始时间:', this.blacklistStartTime);
			console.log('结束时间:', this.blacklistEndTime);

			uni.showToast({
				title: `已设置${days}天拉黑时长`,
				icon: 'success',
				duration: 1500
			});
		},

		/**
		 * 格式化日期时间（用于时间选择器）
		 */
		formatDateTime(date) {
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			const hours = String(date.getHours()).padStart(2, '0');
			const minutes = String(date.getMinutes()).padStart(2, '0');

			return `${year}-${month}-${day} ${hours}:${minutes}`;
		},

		/**
		 * 确保日期时间格式正确
		 * 如果只有日期部分（YYYY-MM-DD），则添加时间部分（00:00:00）
		 * 如果已经包含时间，则保持不变
		 */
		ensureDateTimeFormat(dateStr) {
			if (!dateStr) return null;

			// 如果已经包含时间部分（包含空格或T），直接返回
			if (dateStr.includes(' ') || dateStr.includes('T')) {
				// 确保格式为 YYYY-MM-DD HH:mm:ss
				if (!dateStr.includes(':')) {
					return `${dateStr} 00:00:00`;
				}
				// 如果只有时分没有秒，添加秒
				const parts = dateStr.split(' ');
				if (parts.length === 2) {
					const timePart = parts[1];
					const timeComponents = timePart.split(':');
					if (timeComponents.length === 2) {
						return `${dateStr}:00`;
					}
				}
				return dateStr;
			}

			// 只有日期部分（YYYY-MM-DD），添加时间 00:00:00
			return `${dateStr} 00:00:00`;
		},

		//  车牌点击处理核心逻辑 - 实现用户需求
		async handlePlateClickLogic(plateNumber) {
			const minLength = this.isNewEnergyMode ? 8 : 7;
			if (!plateNumber || plateNumber.length < minLength) {
				return;
			}

			console.log(' [车牌点击处理] 开始处理车牌:', plateNumber);

			// 显示加载提示
			uni.showLoading({
				title: '查询车辆信息...',
				mask: true
			});

			try {
				// 调用综合处理方法
				const result = await violationApi.handlePlateSelection(plateNumber);

				console.log('✅ [车牌点击处理] 处理结果:', result);

				// 隐藏加载提示
				uni.hideLoading();

				// 根据处理结果执行相应操作
				await this.processPlateClickResult(result, plateNumber);

			} catch (error) {
				console.error('❌ [车牌点击处理] 处理失败:', error);

				// 隐藏加载提示
				uni.hideLoading();

				// 显示错误信息
				uni.showModal({
					title: '查询失败',
					content: error.message || '网络错误，请稍后重试',
					showCancel: false,
					confirmText: '知道了'
				});
			}
		},

		//  处理车牌点击结果
		async processPlateClickResult(result, plateNumber) {
			switch (result.suggestedAction) {
				case 'show_owner_and_violations':
					//  展示业主信息和违规记录
					await this.showOwnerInfoAndViolations(result, plateNumber);
					break;

				case 'show_owner_no_violations':
					//  展示业主信息（无违规记录）
					await this.showOwnerInfoWithoutViolations(result, plateNumber);
					break;

				case 'show_owner_and_use_appointment_data':
					//  展示业主信息并使用预约记录
					await this.showOwnerInfoAndUseAppointment(result, plateNumber);
					break;

				case 'use_appointment_data':
					// 有预约记录，根据预约记录填充信息
					await this.fillViolationFromAppointment(result, plateNumber);
					break;

				case 'use_onsite_data':
					// 车辆在场，根据在场信息填充违规记录
					await this.fillViolationFromOnSite(result, plateNumber);
					break;

				case 'show_not_onsite_warning':
					// 车辆未在场，显示警告
					this.showNotOnSiteWarning(plateNumber);
					break;

				case 'show_unknown_vehicle_warning':
					//  未知车辆警告（无任何记录）
					this.showUnknownVehicleWarning(plateNumber);
					break;

				case 'show_no_records':
					//  无违规记录，提示手动填写
					this.showNoRecordsDialog(plateNumber);
					break;

				case 'show_error':
					// 显示错误信息
					uni.showModal({
						title: '查询失败',
						content: result.message,
						showCancel: false,
						confirmText: '知道了'
					});
					break;

				default:
					console.warn(' [车牌点击处理] 未知的处理动作:', result.suggestedAction);
			}
		},

		//  根据预约记录填充违规信息
		async fillViolationFromAppointment(result, plateNumber) {
			console.log(' [预约记录填充] 处理预约数据:', result.appointmentRecords);

			// 显示预约记录选择弹窗
			const appointmentOptions = result.appointmentRecords.map((record, index) => {
				const statusText = this.getAppointmentStatusText(record);
				const timeInfo = this.formatAppointmentTime(record);
				return `${record.recorddate || '未知日期'} ${statusText} ${timeInfo}`;
			});

			try {
				const selectedIndex = await this.showAppointmentSelection(appointmentOptions);
				const selectedRecord = result.appointmentRecords[selectedIndex];

				console.log('✅ [预约记录填充] 用户选择了预约记录:', selectedRecord);

				//  修复：设置预约车的时间信息到表单数据
				if (selectedRecord.arrivedate || selectedRecord.arrive_date || selectedRecord.arriveDate) {
					this.formData.enterTime = selectedRecord.arrivedate || selectedRecord.arrive_date ||
						selectedRecord.arriveDate;
					console.log('⏰ [预约记录填充] 设置进场时间:', this.formData.enterTime);
				}
				if (selectedRecord.leavedate || selectedRecord.leave_date || selectedRecord.leaveDate) {
					this.formData.leaveTime = selectedRecord.leavedate || selectedRecord.leave_date ||
						selectedRecord.leaveDate;
					console.log('⏰ [预约记录填充] 设置离场时间:', this.formData.leaveTime);
				}
				if (selectedRecord.recorddate || selectedRecord.visit_date || selectedRecord.recorddate) {
					this.formData.appointmentTime = selectedRecord.recorddate || selectedRecord.visit_date ||
						selectedRecord.recorddate;
					console.log('⏰ [预约记录填充] 设置预约时间:', this.formData.appointmentTime);
				}
				if (selectedRecord.id) {
					//  修复：保存预约记录ID用于关联
					this.selectedAppointmentId = selectedRecord.id;
					console.log(' [预约记录填充] 设置预约记录ID:', this.selectedAppointmentId);
				}

				//  修复：设置车主ID到ownerInfo
				if (selectedRecord.ownerid || selectedRecord.owner_id || selectedRecord.ownerId) {
					const ownerId = selectedRecord.ownerid || selectedRecord.owner_id || selectedRecord.ownerId;
					if (this.ownerInfo) {
						this.ownerInfo.ownerId = ownerId;
						console.log(' [预约记录填充] 设置车主ID:', ownerId);
					}
				}

				// 自动填充位置信息
				if (selectedRecord.community && selectedRecord.building) {
					this.formData.location =
						`${selectedRecord.community} ${selectedRecord.building}栋${selectedRecord.units || ''}单元${selectedRecord.room || ''}室`;
				}

				// 根据预约状态建议违规类型
				this.suggestViolationTypeFromAppointment(selectedRecord);

				// 显示成功提示
				uni.showToast({
					title: '已根据预约记录填充信息',
					icon: 'success',
					duration: 2000
				});

			} catch (error) {
				console.log('ℹ️ [预约记录填充] 用户取消了选择');
			}
		},

		//  根据在场信息填充违规记录
		async fillViolationFromOnSite(result, plateNumber) {
			console.log(' [在场信息填充] 处理在场数据:', result.onSiteData);

			//  修改：从recordList数组中获取进场时间并格式化
			let formattedEnterTime = null;
			let displayEnterTime = '未知';

			if (result.onSiteData && result.onSiteData.recordList && Array.isArray(result.onSiteData.recordList) &&
				result.onSiteData.recordList.length > 0) {
				console.log('✅ [在场信息填充] 检测到车辆在场，recordList有数据:', result.onSiteData.recordList);

				// 获取第一条记录的进场时间
				const firstRecord = result.onSiteData.recordList[0];
				const rawEnterTime = firstRecord.enterTime;

				console.log(' [在场信息填充] 原始进场时间:', rawEnterTime);

				if (rawEnterTime && typeof rawEnterTime === 'string') {
					// 将 yyyyMMddHHmmss 格式转换为 yyyy-mm-dd hh:mm:ss 格式
					formattedEnterTime = this.formatEnterTime(rawEnterTime);
					displayEnterTime = formattedEnterTime || rawEnterTime;

					console.log('✅ [在场信息填充] 格式化后的进场时间:', formattedEnterTime);
				}
			} else {
				console.log('⚠️ [在场信息填充] recordList为空或无数据，车辆可能不在场');
			}

			// 记录格式化后的进场时间到表单数据中
			if (formattedEnterTime) {
				this.formData.enterTime = formattedEnterTime;
				console.log('⏰ [在场信息填充] 记录格式化进场时间到表单:', formattedEnterTime);
			}

			// 显示成功提示
			uni.showModal({
				title: '车辆在场确认',
				content: `车辆 ${plateNumber} 当前在场\n进场时间：${displayEnterTime}\n\n请继续填写违规信息`,
				showCancel: false,
				confirmText: '继续'
			});
		},

		//  格式化进场时间：yyyyMMddHHmmss -> yyyy-mm-dd hh:mm:ss
		formatEnterTime(rawTime) {
			try {
				if (!rawTime || typeof rawTime !== 'string' || rawTime.length !== 14) {
					console.warn('⚠️ [时间格式化] 无效的时间格式:', rawTime);
					return null;
				}

				// 解析 yyyyMMddHHmmss 格式
				const year = rawTime.substring(0, 4);
				const month = rawTime.substring(4, 6);
				const day = rawTime.substring(6, 8);
				const hour = rawTime.substring(8, 10);
				const minute = rawTime.substring(10, 12);
				const second = rawTime.substring(12, 14);

				// 格式化为 yyyy-mm-dd hh:mm:ss
				const formattedTime = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

				console.log(`✅ [时间格式化] ${rawTime} -> ${formattedTime}`);
				return formattedTime;

			} catch (error) {
				console.error('❌ [时间格式化] 格式化失败:', error, '原始时间:', rawTime);
				return null;
			}
		},

		//  展示业主信息和违规记录
		async showOwnerInfoAndViolations(result, plateNumber) {
			console.log(' [业主信息展示] 处理业主信息和违规记录:', result);

			// 设置车牌号和业主信息
			this.formData.plateNumber = plateNumber;
			this.ownerInfo = {
				...result.ownerInfo,
				isExistingOwner: true, // 标记为现有业主
				violationCount: result.violationCount,
				violationRecords: result.violationRecords // 添加违规记录
			};

			//  不再使用弹窗，直接显示在列表中
			// 自动展开违规记录列表（如果有违规记录）
			if (result.violationRecords && result.violationRecords.length > 0) {
				this.showViolationRecords = true;
			}

			// 显示加载成功提示
			uni.showToast({
				title: `已加载车主信息，发现${result.violationCount}条违规记录`,
				icon: 'success',
				duration: 2000
			});
		},

		//  展示业主信息（无违规记录）
		async showOwnerInfoWithoutViolations(result, plateNumber) {
			console.log(' [业主信息展示] 展示业主信息（无违规记录）:', result);

			// 设置车牌号和业主信息
			this.formData.plateNumber = plateNumber;
			this.ownerInfo = {
				...result.ownerInfo,
				isExistingOwner: true, // 标记为现有业主
				violationCount: 0,
				violationRecords: [] // 空的违规记录数组
			};

			//  不再使用弹窗，直接显示在界面中
			// 显示加载成功提示
			uni.showToast({
				title: '已加载车主信息，该车主暂无违规记录',
				icon: 'success',
				duration: 2000
			});
		},

		//  展示业主信息并使用预约记录
		async showOwnerInfoAndUseAppointment(result, plateNumber) {
			console.log(' [业主信息-预约] 处理业主信息和预约记录:', result);

			// 设置业主信息
			this.ownerInfo = {
				...result.ownerInfo,
				isExistingOwner: true, // 标记为现有业主
				violationCount: 0, // 无违规记录
				violationRecords: [] // 空的违规记录数组
			};

			//  不再使用弹窗，提供选择预约记录的选项
			uni.showModal({
				title: '业主信息已加载',
				content: `已找到业主信息，该车主无违规记录\n发现${result.appointmentRecords.length}条预约记录`,
				showCancel: true,
				cancelText: '选择预约',
				confirmText: '直接添加',
				success: async (res) => {
					if (res.confirm) {
						// 用户选择直接添加违规记录
						uni.showToast({
							title: '已加载车主信息，请继续填写违规详情',
							icon: 'success',
							duration: 2000
						});
					} else {
						// 用户选择根据预约记录填充信息
						await this.fillViolationFromAppointment(result, plateNumber);
					}
				}
			});
		},

		//  构建违规记录摘要（保留方法，但现在主要用列表展示）
		buildViolationSummary(violationRecords) {
			if (!violationRecords || violationRecords.length === 0) {
				return '暂无违规记录';
			}

			// 现在主要用于快速预览，只显示记录数量和最近一条
			const latestRecord = violationRecords[0];
			const date = latestRecord.createTime ? latestRecord.createTime.substring(0, 10) : '未知日期';
			const type = latestRecord.violationType || '未知类型';

			return `最近一次：${date} ${type}`;
		},

		//  切换违规记录列表的展开/收起状态
		toggleViolationRecords() {
			this.showViolationRecords = !this.showViolationRecords;
		},

		//  格式化违规记录日期 - 统一格式：yyyy-MM-dd HH:mm:ss
		formatViolationDate(dateTime) {
			if (!dateTime) return '未知时间';
			try {
				const target = new Date(dateTime);
				if (isNaN(target.getTime())) return dateTime; // 解析失败则原样返回

				// 统一格式化为：yyyy-MM-dd HH:mm:ss
				const yyyy = target.getFullYear();
				const MM = String(target.getMonth() + 1).padStart(2, '0');
				const dd = String(target.getDate()).padStart(2, '0');
				const HH = String(target.getHours()).padStart(2, '0');
				const mm = String(target.getMinutes()).padStart(2, '0');
				const ss = String(target.getSeconds()).padStart(2, '0');

				return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}`;
			} catch (error) {
				return dateTime || '未知时间';
			}
		},

		// 格式化访客预约时间 - 格式：MM-dd HH:mm:ss
		formatVisitorTime(dateTime) {
			if (!dateTime) return '';
			try {
				const target = new Date(dateTime);
				if (isNaN(target.getTime())) return dateTime;

				const MM = String(target.getMonth() + 1).padStart(2, '0');
				const dd = String(target.getDate()).padStart(2, '0');
				const HH = String(target.getHours()).padStart(2, '0');
				const mm = String(target.getMinutes()).padStart(2, '0');
				const ss = String(target.getSeconds()).padStart(2, '0');

				return `${MM}-${dd} ${HH}:${mm}:${ss}`;
			} catch (error) {
				return dateTime || '';
			}
		},

		//  获取违规状态样式类
		getViolationStatusClass(status) {
			switch (status) {
				case 'COMPLETED':
					return 'status-completed';
				case 'PENDING':
					return 'status-pending';
				default:
					return 'status-unknown';
			}
		},

		//  获取违规状态文本
		getViolationStatusText(status) {
			switch (status) {
				case 'COMPLETED':
					return '已处理';
				case 'PENDING':
					return '处理中';
				default:
					return null; // 不显示未知状态
			}
		},

		//  获取违规类型样式类
		getViolationTypeClass(violationType) {
			if (!violationType) return 'type-unknown';

			const type = violationType.toLowerCase();

			// 超时相关
			if (type.includes('超时') || type.includes('overtime')) {
				return 'type-overtime';
			}
			// 占用相关
			if (type.includes('占用') || type.includes('占位') || type.includes('占道')) {
				return 'type-occupy';
			}
			// 违停相关
			if (type.includes('违停') || type.includes('乱停') || type.includes('illegal')) {
				return 'type-illegal';
			}
			// 逆向相关
			if (type.includes('逆向') || type.includes('反向')) {
				return 'type-reverse';
			}
			// 其他严重违规
			if (type.includes('堵塞') || type.includes('阻挡') || type.includes('block')) {
				return 'type-serious';
			}

			// 默认样式
			return 'type-default';
		},

		//  查看违规历史详情（保留，但现在主要用列表显示）
		viewViolationHistory(plateNumber, violationRecords) {
			// 直接展开违规记录列表，不再使用弹窗
			this.showViolationRecords = true;

			uni.showToast({
				title: '违规记录已展开显示',
				icon: 'success',
				duration: 1500
			});
		},

		//  显示未知车辆警告
		showUnknownVehicleWarning(plateNumber) {
			uni.showModal({
				title: '未找到车辆记录',
				content: `车牌 ${plateNumber} 未找到任何记录：\n\n• 无违规历史记录\n• 无预约记录\n• 当前不在场\n\n这可能是外来车辆或新车辆。`,
				showCancel: true,
				cancelText: '重新输入',
				confirmText: '继续添加',
				success: (res) => {
					if (res.confirm) {
						// 用户选择继续添加，作为新车辆处理
						uni.showToast({
							title: '将作为新车辆处理',
							icon: 'none',
							duration: 2000
						});
						// 清空业主信息，用户需要手动填写
						this.ownerInfo = null;
					} else {
						// 用户选择重新输入车牌
						this.formData.plateNumber = '';
						this.ownerInfo = null;
						// 重新显示车牌键盘
						this.showKeyboard();
					}
				}
			});
		},

		//  显示无业主信息提示
		showNoRecordsDialog(plateNumber) {
			uni.showModal({
				title: '未找到业主信息',
				content: `车牌 ${plateNumber} 未找到业主信息（无违规记录，无预约记录），请手动填写业主信息。`,
				showCancel: true,
				cancelText: '重新输入',
				confirmText: '手动填写',
				success: (res) => {
					if (res.confirm) {
						// 用户选择手动填写
						this.formData.plateNumber = plateNumber;
						this.ownerInfo = null; // 清空业主信息，需要手动填写
						uni.showToast({
							title: '请手动填写业主信息',
							icon: 'none',
							duration: 2000
						});
					} else {
						// 用户选择重新输入车牌
						this.formData.plateNumber = '';
						this.ownerInfo = null;
						this.showKeyboard();
					}
				}
			});
		},

		//  显示车辆未在场警告
		showNotOnSiteWarning(plateNumber) {
			uni.showModal({
				title: '车辆未在场',
				content: `车牌 ${plateNumber} 当前未在场，无法添加违规记录。\n\n只有在场车辆才能添加违规记录。`,
				showCancel: true,
				cancelText: '重新选择',
				confirmText: '强制添加',
				success: (res) => {
					if (res.confirm) {
						// 用户选择强制添加
						uni.showToast({
							title: '已允许强制添加违规记录',
							icon: 'none',
							duration: 2000
						});
					} else {
						// 用户选择重新选择车牌
						this.formData.plateNumber = '';
						this.ownerInfo = null;
					}
				}
			});
		},

		//  显示预约记录选择弹窗
		showAppointmentSelection(options) {
			return new Promise((resolve, reject) => {
				uni.showActionSheet({
					itemList: options,
					success: (res) => {
						resolve(res.tapIndex);
					},
					fail: () => {
						reject(new Error('用户取消选择'));
					}
				});
			});
		},

		//  获取预约状态文本
		getAppointmentStatusText(record) {
			switch (record.venuestatus) {
				case '已入场':
					return ' 在场';
				case '已离场':
					return '✅ 已离场';
				case '未入场':
					return '⏳ 未进场';
				default:
					return record.venuestatus || '未知状态';
			}
		},

		//  格式化预约时间信息
		formatAppointmentTime(record) {
			if (record.arrivedate && record.leavedate) {
				return `${record.arrivedate} ~ ${record.leavedate}`;
			} else if (record.arrivedate) {
				return `进场: ${record.arrivedate}`;
			} else if (record.recorddate) {
				return `预约: ${record.recorddate}`;
			}
			return '';
		},

		//  根据预约状态建议违规类型
		suggestViolationTypeFromAppointment(record) {
			// 根据预约状态建议违规类型
			if (record.venuestatus === '已入场' || record.venuestatus === '在场中') {
				// 如果车辆在场，可能是超时停车
				//  使用动态加载的 typeOptions
				const violationType = this.typeOptions.find(type => type.value === 'overtime');
				if (violationType) {
					this.formData.violationType = violationType.value;
					this.formData.description = `车辆超过预约时间仍在停车场内`;
				}
			} else if (record.venuestatus === '已离场') {
				// 如果车辆已离场，可能是其他违规行为
				uni.showToast({
					title: '车辆已离场，请选择相应违规类型',
					icon: 'none',
					duration: 2000
				});
			} else if (record.venuestatus === '未入场') {
				// 如果车辆未进场但有预约，可能是占用车位等
				//  使用动态加载的 typeOptions
				const violationType = this.typeOptions.find(type => type.value === 'occupy_space');
				if (violationType) {
					this.formData.violationType = violationType.value;
					this.formData.description = `车辆未按预约进场但占用停车位`;
				}
			}
		},

	},

	// 车牌键盘相关方法
	openPlateKeyboard() {
		console.log(' 打开车牌键盘');
		const currentPlate = this.formData.plateNumber || '';
		this.value = currentPlate;
		this.isShow = true;
		this.showContent = true;

		// 使用现有的键盘组件
		if (this.$refs.keyboardInput) {
			this.$refs.keyboardInput.changeValue(currentPlate);
		}

		this.$nextTick(() => {
			this.updateCurrentPlateChars();
		});
	},

	// 车牌颜色切换
	changePlateColor(colorType) {
		const colorMap = {
			'blue': {
				background: 'linear-gradient(to bottom, #216fef, #0c4fc5)',
				text: '#fff',
				border: '#fff',
				type: 'blue'
			},
			'green': {
				background: 'linear-gradient(to bottom, #4caf50, #2e7d32)',
				text: '#fff',
				border: '#fff',
				type: 'green'
			},
			'yellow': {
				background: 'linear-gradient(to bottom, #ffeb3b, #f57f17)',
				text: '#000',
				border: '#000',
				type: 'yellow'
			},
			'white': {
				background: 'linear-gradient(to bottom, #ffffff, #f5f5f5)',
				text: '#000',
				border: '#000',
				type: 'white'
			}
		};

		const config = colorMap[colorType] || colorMap['blue'];
		this.carColor = config.background;
		this.selectedColor = config.background;
		this.textColor = config.text;
		this.borderBgColor = config.border;
		this.plateType = config.type;
	},

	// 车牌类型切换（新能源/传统）
	changePlateType(isNewEnergy = false) {
		this.carMax = !isNewEnergy;
		this.maxCarLenght = isNewEnergy ? 8 : 7;

		// 重新初始化车牌字符数组
		const currentPlate = this.formData.plateNumber || '';
		this.currentPlateChars = new Array(this.maxCarLenght).fill('');
		for (let i = 0; i < currentPlate.length && i < this.maxCarLenght; i++) {
			this.currentPlateChars[i] = currentPlate[i];
		}

		// 调整车牌颜色（新能源车默认绿色）
		if (isNewEnergy) {
			this.changePlateColor('green');
		} else {
			this.changePlateColor('blue');
		}
	},



	components: {

	}
}
</script>

<style lang="scss" scoped>
.container {
	min-height: 140vh;
	background: #f5f6fa;
	width: 100%;
}



/* 页面内容 */
.page-content {
	padding-top: 12rpx;
	padding-bottom: 20rpx;

	padding-left: 16rpx;
	padding-right: 16rpx;
}

/* 提交按钮区域 */
.submit-section {
	padding: 20rpx 16rpx;
	background: #ffffff;
	border-top: 1rpx solid #f0f0f0;
}

/* 提醒记录内联确认卡片样式 */
.reminder-confirm-card {
	margin: 16rpx;
}

.reminder-confirm-content {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
	/* 减小中部间距 */
	color: #333;
	white-space: pre-line;
}

.confirm-desc {
	font-size: 28rpx;
	color: #606266;
}

.confirm-list {
	font-size: 26rpx;
	color: #303133;
}

.confirm-question {
	margin-top: 12rpx;
	margin-bottom: 20rpx;
	/* 与按钮区拉开间距 */
	font-size: 28rpx;
	color: #606266;
}

.inline-confirm-actions {
	display: flex;
	justify-content: space-between;
}

/* 居中 Popup 内容容器样式 */
.popup-container {
	height: auto;
	width: 620rpx;
	padding: 24rpx 24rpx 20rpx;
	/* 减少整体内边距，去除底部多余间隙 */
	background: #ffffff;
	border-radius: 20rpx;
	box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.12);
}

.popup-title {
	text-align: center;
	font-size: 32rpx;
	font-weight: 700;
	color: #ff4d4f;
	margin-bottom: 20rpx;
}

.popup-title .title-icon {
	margin-right: 8rpx;
}

.popup-container {
	box-shadow: 0 12rpx 36rpx rgba(0, 0, 0, 0.12);
	border-radius: 16rpx;
	padding: 24rpx;
}

/* 记录列表视觉样式 */
.records-panel {
	background: #f7f8fa;
	border-radius: 16rpx;
	padding: 12rpx 12rpx 0;
	/* 去掉底部间隙 */
}

.record-item {
	display: flex;
	align-items: center;
	/* 水平居中对齐内容 */
	gap: 8rpx;
	margin-bottom: 6rpx;
	padding: 10rpx 12rpx;
	background: #ffffff;
	border: 2rpx solid #f0f0f0;
	border-left: 6rpx solid #ffccc7;
	border-radius: 12rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.record-index {
	width: 40rpx;
	height: 40rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #ff7a59 0%, #ff4d4f 100%);
	color: #fff;
	font-size: 26rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 6rpx 14rpx rgba(255, 77, 79, 0.25);
	flex-shrink: 0;
}

.record-text {
	color: #303133;
	font-size: 28rpx;
	line-height: 1.6;
}

/* 新增：结构化提醒记录列表样式 */
.record-content {
	flex: 1;
}

.record-row {
	display: flex;
	align-items: center;
	flex-wrap: nowrap;
	gap: 10rpx;
	width: 100%;
}

.record-row.top-row {
	margin-bottom: 4rpx;
	gap: 8rpx;
	display: flex;
	align-items: center;
	flex-wrap: nowrap;
	/* 强制单行显示 */
	width: 100%;
}

.type-badge {
	background: #fff1f0;
	color: #ff4d4f;
	font-size: 22rpx;
	padding: 2rpx 10rpx;
	border-radius: 999rpx;
	border: 2rpx solid #ffccc7;
}

.time-text {
	color: #606266;
	font-size: 24rpx;
	margin-left: auto;
	/* 将时间推到右侧 */
	white-space: nowrap;
	/* 不换行 */
}

.plate-number {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 8rpx 16rpx;
	border-radius: 8rpx;
	font-weight: bold;
	font-family: 'Arial', monospace;
	letter-spacing: 1rpx;
	min-width: 160rpx;
	font-size: 28rpx;
	text-align: center;
	white-space: nowrap;
	/* 车牌不换行 */
	flex: 0 0 auto;
	/* 不挤压换行 */
	transition: all 0.3s ease;
}

.type-badge {
	flex: 0 0 auto;
	white-space: nowrap;
}

.record-row.top-row>* {
	flex-shrink: 0;
	/* 禁止子元素因压缩而换行 */
}

.blue-plate {
	font-family: 'Arial', monospace;
	background: linear-gradient(180deg, #0C4FC5 0%, #216FEF 100%);
	color: #FFFFFF;
}

.green-plate {
	font-family: 'Arial', monospace;
	background: linear-gradient(180deg, #6AD390 0%, #D0F1E4 100%);
	color: #000000;
}

.location-icon {
	font-size: 26rpx;
	line-height: 1;
	// color: #ff4d4f;
}

.location-text {
	color: #303133;
	font-size: 26rpx;
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

/* 按钮区分隔与对齐 */
.inline-confirm-actions {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 16rpx;
	padding-top: 0;
	/* 去除底部间隙 */
	border-top: none;
}

/* 分页条 */
.pagination-bar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 8rpx 8rpx 0;
	/* 与列表紧贴，无底部留白 */
}

.page-text {
	font-size: 26rpx;
	color: #606266;
}

.submit-btn {
	width: 100%;
	height: 72rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #0081ff, #1890ff);
	border-radius: 8rpx;
	font-size: 28rpx;
	font-weight: 600;
	color: #ffffff;
	transition: all 0.3s ease;
	box-shadow: 0 2rpx 8rpx rgba(0, 129, 255, 0.3);
}

.submit-btn.disabled {
	opacity: 0.5;
	background: #cccccc;
}

.appointment-reminder {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	background: #fef0f0;
	border: 2rpx solid #f56c6c;
	border-radius: 12rpx;
	padding: 20rpx;
	margin-bottom: 20rpx;
	animation: shake 0.5s ease-in-out infinite alternate;
}

.reminder-icon {
	font-size: 32rpx;
}

.reminder-text {
	font-size: 26rpx;
	color: #f56c6c;
	font-weight: 600;
}

@keyframes shake {
	0% {
		transform: translateX(0);
	}

	100% {
		transform: translateX(4rpx);
	}
}

/* 卡片样式 */
.section-card {
	background: #ffffff;
	border-radius: 10rpx;
	margin-bottom: 12rpx;
	box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.08);
	overflow: visible;
}

/* 违规类型区域特殊样式 */
.violation-type-section {
	transition: margin-top 0.3s ease;
}

.section-header {
	display: flex;
	align-items: center;
	padding: 20rpx 20rpx 12rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.header-icon {
	width: 36rpx;
	height: 36rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 10rpx;
}

.header-icon .icon-emoji {
	font-size: 28rpx;
}

.section-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #333333;
}

.section-subtitle {
	font-size: 22rpx;
	font-weight: 400;
	color: #999999;
	margin-left: 8rpx;
}

/* 车牌信息样式 */
.input-group {
	padding: 20rpx;
	position: relative;
	z-index: 1;
}

.input-wrapper {
	display: flex;
	align-items: center;
	background: #f8f9fa;
	border-radius: 8rpx;
	padding: 0 16rpx;
	margin-bottom: 12rpx;
}

.plate-input {
	flex: 1;
	height: 68rpx;
	font-size: 28rpx;
	color: #333333;
}

.scan-btn {
	display: flex;
	align-items: center;
	padding: 10rpx 16rpx;
	background: #0081ff;
	border-radius: 6rpx;
	margin-left: 10rpx;
}

.scan-btn .icon-emoji {
	font-size: 24rpx;
	margin-right: 8rpx;
}

.btn-text {
	font-size: 24rpx;
	color: #ffffff;
}

/*  白名单警告卡片样式 */
.whitelist-warning-card {
	background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
	border-radius: 16rpx;
	padding: 24rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 4rpx 12rpx rgba(255, 152, 0, 0.15);
	border: 2rpx solid #ff9800;
	animation: pulse-warning 2s ease-in-out infinite;
}

@keyframes pulse-warning {

	0%,
	100% {
		box-shadow: 0 4rpx 12rpx rgba(255, 152, 0, 0.15);
	}

	50% {
		box-shadow: 0 4rpx 20rpx rgba(255, 152, 0, 0.3);
	}
}

.warning-header {
	display: flex;
	align-items: center;
	margin-bottom: 16rpx;
	padding-bottom: 12rpx;
	border-bottom: 1rpx solid rgba(255, 152, 0, 0.3);
}

.warning-icon {
	font-size: 32rpx;
	margin-right: 12rpx;
}

.warning-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #e65100;
}

.warning-content {
	margin-bottom: 16rpx;
}

.warning-row {
	display: flex;
	align-items: center;
	margin-bottom: 8rpx;
	padding: 6rpx 0;
}

.warning-label {
	font-size: 28rpx;
	color: #6d4c41;
	font-weight: 500;
	min-width: 120rpx;
}

.warning-value {
	font-size: 28rpx;
	color: #3e2723;
	font-weight: 600;
}

.warning-message {
	background: rgba(255, 87, 34, 0.1);
	border-radius: 8rpx;
	padding: 12rpx 16rpx;
	border-left: 4rpx solid #ff5722;
}

.message-text {
	font-size: 26rpx;
	color: #bf360c;
	line-height: 1.5;
}

/* 业主信息卡片样式 */
.owner-info-card {
	background: linear-gradient(135deg, #f8fbff 0%, #f1f6ff 100%);
	border-radius: 16rpx;
	padding: 24rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
	border: 1rpx solid #e3f2fd;
}

.owner-header {
	display: flex;
	align-items: center;
	margin-bottom: 20rpx;
}

.owner-avatar {
	width: 80rpx;
	height: 80rpx;
	background: linear-gradient(45deg, #1976d2, #42a5f5);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 20rpx;
	flex-shrink: 0;
}

.avatar-text {
	color: #fff;
	font-size: 32rpx;
	font-weight: 600;
}

.owner-basic {
	flex: 1;
	min-width: 0;
}

.owner-name {
	display: flex;
	align-items: center;
	margin-bottom: 8rpx;
}

.name-text {
	font-size: 32rpx;
	font-weight: 600;
	color: #1a1a1a;
	margin-right: 12rpx;
}

.owner-phone {
	display: flex;
	align-items: center;
	background: rgba(25, 118, 210, 0.1);
	border-radius: 20rpx;
	padding: 8rpx 16rpx;
	cursor: pointer;
	transition: all 0.3s ease;
}

.owner-phone:active {
	background: rgba(25, 118, 210, 0.2);
	transform: scale(0.98);
}

.phone-icon {
	font-size: 24rpx;
	margin-right: 8rpx;
}

.phone-text {
	font-size: 28rpx;
	color: #1976d2;
	font-weight: 500;
	margin-right: 8rpx;
}

.call-hint {
	font-size: 20rpx;
	color: #666;
	background: rgba(255, 255, 255, 0.8);
	padding: 2rpx 8rpx;
	border-radius: 10rpx;
}

.owner-details {
	border-top: 1rpx solid #e8f4fd;
	padding-top: 16rpx;
}

.detail-row {
	display: flex;
	align-items: center;
	margin-bottom: 12rpx;
	padding: 8rpx 0;
}

.detail-row:last-child {
	margin-bottom: 0;
}

.detail-icon {
	font-size: 28rpx;
	margin-right: 12rpx;
	width: 32rpx;
	text-align: center;
}

.detail-label {
	font-size: 26rpx;
	color: #666;
	margin-right: 8rpx;
	min-width: 80rpx;
}

.detail-value {
	font-size: 28rpx;
	color: #333;
	flex: 1;
	word-wrap: break-word;
}

.detail-value.monthly-ticket {
	color: #1976d2;
	font-weight: 500;
	background: rgba(25, 118, 210, 0.1);
	padding: 4rpx 12rpx;
	border-radius: 12rpx;
}

.info-item {
	display: flex;
	align-items: center;
	margin-bottom: 8rpx;
}

.info-item:last-child {
	margin-bottom: 0;
}

.info-label {
	font-size: 28rpx;
	color: #666666;
	margin-right: 16rpx;
	width: 200rpx;
}

.info-value {
	font-size: 28rpx;
	color: #1976d2;
	font-weight: 500;
}

/* 信用分样式 */
.credit-excellent {
	color: #52c41a !important;
	font-weight: 600;
}

.credit-warning {
	color: #faad14 !important;
	font-weight: 600;
}

.credit-danger {
	color: #ff4d4f !important;
	font-weight: 600;
}

/* 违规类型样式 */
.violation-types {
	padding: 20rpx;
	position: relative;
	z-index: 10;
}

/* 已选择类型显示 */
.selected-type {
	margin-bottom: 16rpx;
}

.selected-display {
	display: flex;
	align-items: center;
	padding: 12rpx 16rpx;
	background: #e3f2fd;
	border-radius: 8rpx;
	border: 1rpx solid #0081ff;
}

.selected-icon {
	font-size: 24rpx;
	margin-right: 12rpx;
}

.selected-name {
	flex: 1;
	font-size: 26rpx;
	color: #0081ff;
	font-weight: 600;
}

.selected-check {
	font-size: 20rpx;
	color: #0081ff;
	font-weight: bold;
}

/* 搜索区域 */
.search-section {
	margin-bottom: 16rpx;
}

.search-container {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.search-box {
	display: flex;
	align-items: center;
	background: #f8f9fa;
	border-radius: 8rpx;
	padding: 0 16rpx;
	border: 1rpx solid #e0e0e0;
	flex: 1;
}

.search-icon {
	font-size: 24rpx;
	color: #999999;
	margin-right: 12rpx;
}

.search-input {
	flex: 1;
	height: 64rpx;
	font-size: 26rpx;
	color: #333333;
}

.search-clear {
	padding: 8rpx;
	color: #999999;
	font-size: 28rpx;
	font-weight: bold;
}

.search-cancel {
	padding: 12rpx 16rpx;
}

.cancel-text {
	font-size: 26rpx;
	color: #666666;
}

/* 搜索结果 */
.search-results {
	margin-bottom: 16rpx;
}

/* 无搜索结果提示 */
.no-results {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 40rpx 20rpx;
	text-align: center;
}

.no-results-icon {
	font-size: 48rpx;
	color: #cccccc;
	margin-bottom: 16rpx;
}

.no-results-text {
	font-size: 28rpx;
	color: #666666;
	margin-bottom: 8rpx;
	font-weight: 500;
}

.no-results-tip {
	font-size: 24rpx;
	color: #999999;
	line-height: 1.4;
}

/* 区域标签 */
.section-label {
	font-size: 24rpx;
	color: #666666;
	margin-bottom: 12rpx;
	font-weight: 500;
}

/* 标签容器 */
.type-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 8rpx;
}

/* 类型标签 */
.type-tag {
	display: flex;
	align-items: center;
	padding: 8rpx 16rpx;
	background: #f0f9ff;
	border: 1rpx solid #0081ff;
	border-radius: 20rpx;
	font-size: 24rpx;
	color: #0081ff;
	transition: all 0.3s ease;
	min-height: 48rpx;
}

.type-tag.selected {
	background: #0081ff;
	color: #ffffff;
}

.type-tag.more {
	background: #f8f9fa;
	border-color: #cccccc;
	color: #666666;
}

.tag-icon {
	font-size: 20rpx;
	margin-right: 6rpx;
}

.tag-text {
	font-size: 22rpx;
	white-space: nowrap;
}

/* 分割线 */
.divider {
	height: 1rpx;
	background: #f0f0f0;
	margin: 16rpx 0;
}

/* 搜索入口 */
.search-entry {
	margin-top: 8rpx;
}

.search-trigger {
	display: flex;
	align-items: center;
	padding: 12rpx 16rpx;
	background: #f8f9fa;
	border-radius: 8rpx;
	border: 1rpx dashed #cccccc;
}

.search-trigger .search-icon {
	font-size: 24rpx;
	color: #999999;
	margin-right: 12rpx;
}

.search-text {
	font-size: 24rpx;
	color: #999999;
}

.custom-type-input {
	background: #f8f9fa;
	border-radius: 12rpx;
	padding: 0 24rpx;
}

.custom-input {
	width: 100%;
	height: 88rpx;
	font-size: 28rpx;
	color: #333333;
}

/* 位置输入样式 */
.location-input-group {
	padding: 20rpx;
	position: relative;
}

.location-row {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.location-wrapper {
	flex: 1;
	display: flex;
	align-items: center;
	background: #ffffff;
	border: 2rpx solid #e4e7ed;
	border-radius: 12rpx;
	padding: 0 16rpx;
	position: relative;
	transition: all 0.3s ease;
}

.location-wrapper.focused {
	border-color: #2979ff;
	box-shadow: 0 0 0 4rpx rgba(41, 121, 255, 0.1);
}

.location-wrapper.hasText {
	border-color: #2979ff;
}



/* 清空位置按钮 */
.clear-location-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 40rpx;
	height: 40rpx;
	border-radius: 50%;
	background: rgba(200, 201, 204, 0.1);
	transition: all 0.2s ease;
	margin-right: 8rpx;
	position: absolute;
	right: 48rpx;
	/* 在下拉图标左侧 */
	z-index: 10;
	cursor: pointer;
}

.clear-location-btn:active {
	background: rgba(200, 201, 204, 0.2);
	transform: scale(0.95);
}

/* 定位按钮样式 */
.location-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 16rpx 20rpx;
	background: linear-gradient(135deg, #1989fa 0%, #0c6dd1 100%);
	border-radius: 12rpx;
	box-shadow: 0 4rpx 12rpx rgba(25, 137, 250, 0.3);
	transition: all 0.3s ease;
	white-space: nowrap;
	flex-shrink: 0;
}

.location-btn:active {
	transform: scale(0.98);
	box-shadow: 0 2rpx 8rpx rgba(25, 137, 250, 0.2);
}

.location-btn-text {
	margin-left: 8rpx;
	font-size: 26rpx;
	color: #ffffff;
	font-weight: 500;
}

/* 位置建议下拉框样式 */
.location-suggestions {
	position: absolute;
	top: 100%;
	left: 0;
	right: 0;
	background: #ffffff;
	border-radius: 8rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.12);
	z-index: 1001;
	margin-top: 6rpx;
	border: 1rpx solid #e8e8e8;
	overflow: hidden;
}

.suggestions-scroll {
	max-height: 320rpx;
}

.location-suggestion-item {
	display: flex;
	align-items: center;
	padding: 12rpx 16rpx;
	border-bottom: 1rpx solid #f0f0f0;
	cursor: pointer;
	transition: all 0.3s ease;
}

.location-suggestion-item:last-child {
	border-bottom: none;
}

.location-suggestion-item:active {
	background: #f8f9ff;
}

.suggestion-icon {
	width: 32rpx;
	height: 32rpx;
	border-radius: 6rpx;
	background: #f5f7fa;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 12rpx;
}

.suggestion-icon .icon-emoji {
	font-size: 20rpx;
}

.suggestion-content {
	flex: 1;
}

.suggestion-text {
	font-size: 24rpx;
	color: #333;
	margin-bottom: 2rpx;
	display: block;
}

.suggestion-arrow {
	color: #ccc;
}

.suggestion-arrow .icon-emoji {
	font-size: 16rpx;
}

.suggestions-footer {
	padding: 8rpx 16rpx;
	background: #f8f9fa;
	border-top: 1rpx solid #e8e8e8;
}

.footer-text {
	font-size: 20rpx;
	color: #666;
}

/* 现场取证样式 */
.evidence-section {
	padding: 20rpx;
}

.photo-upload {
	margin-bottom: 20rpx;
}

.upload-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16rpx;
}

.upload-title {
	font-size: 28rpx;
	color: #333333;
	font-weight: 500;
}

.photo-count {
	font-size: 24rpx;
	color: #999999;
}

.photo-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 10rpx;
}

.photo-item {
	position: relative;
	width: 100%;
	height: 120rpx;
	border-radius: 6rpx;
	overflow: hidden;
}

.photo-image {
	width: 100%;
	height: 100%;
}

.photo-delete {
	position: absolute;
	top: 8rpx;
	right: 8rpx;
	width: 32rpx;
	height: 32rpx;
	background: rgba(0, 0, 0, 0.6);
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.photo-delete .icon-emoji {
	font-size: 20rpx;
	color: #ffffff;
}

.photo-add {
	width: 100%;
	height: 120rpx;
	border: 2rpx dashed #cccccc;
	border-radius: 6rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background: #fafafa;
}

.add-icon {
	font-size: 40rpx;
	color: #cccccc;
	margin-bottom: 8rpx;
}

.add-text {
	font-size: 24rpx;
	color: #999999;
}



.voice-player {
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	padding: 20rpx 24rpx;
	background: #e8f5e8;
	border-radius: 12rpx;
}

.voice-info {
	display: flex;
	align-items: center;
}

.voice-info .icon-emoji {
	font-size: 28rpx;
	margin-right: 12rpx;
	color: #19be6b;
}

.voice-duration {
	font-size: 28rpx;
	color: #19be6b;
	font-weight: 500;
}

.voice-actions {
	display: flex;
	gap: 16rpx;
}

.voice-action-btn {
	width: 48rpx;
	height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #19be6b;
	border-radius: 24rpx;
}

.voice-action-btn.delete {
	background: #ff4d4f;
}

.voice-action-btn .icon-emoji {
	font-size: 24rpx;
}

/* 描述输入样式 */
.description-input {
	padding: 20rpx;
}

.description-textarea {
	width: 100%;
	min-height: 120rpx;
	padding: 16rpx;
	background: #f8f9fa;
	border-radius: 8rpx;
	font-size: 26rpx;
	color: #333333;
	line-height: 1.4;
}

/* 描述模板样式 */
.description-templates {
	margin-top: 20rpx;
}

.template-label {
	font-size: 24rpx;
	color: #909399;
	margin-bottom: 12rpx;
	display: block;
}

.template-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
}

.template-tag {
	background: #f0f9ff;
	border: 2rpx solid #e1f5fe;
	border-radius: 20rpx;
	padding: 8rpx 16rpx;
	transition: all 0.2s ease;
}

.template-tag:active {
	background: #e3f2fd;
	border-color: #1976d2;
	transform: scale(0.95);
}

.template-text {
	font-size: 24rpx;
	color: #1976d2;
}

/* 车牌扫描弹窗样式 */
.scan-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.6);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 2000;
}

.scan-content {
	width: 90%;
	max-width: 700rpx;
	max-height: 90vh;
	background: #ffffff;
	border-radius: 16rpx;
	overflow: hidden;
}

.scan-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 32rpx;
	background: #f8f9fa;
	border-bottom: 1rpx solid #f0f0f0;
}

.scan-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333333;
}

.scan-close {
	width: 48rpx;
	height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #f0f0f0;
	border-radius: 24rpx;
}

.scan-close .icon-emoji {
	font-size: 28rpx;
	color: #666666;
}

.scan-area {
	padding: 40rpx;
	text-align: center;
}

.scan-frame {
	width: 400rpx;
	height: 200rpx;
	border: 4rpx solid #0081ff;
	border-radius: 12rpx;
	margin: 0 auto 20rpx;
	position: relative;
	overflow: hidden;
}

.scan-line {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 4rpx;
	background: linear-gradient(90deg, transparent, #0081ff, transparent);
	animation: scan 2s linear infinite;
}

@keyframes scan {
	0% {
		transform: translateY(0);
	}

	100% {
		transform: translateY(196rpx);
	}
}

.scan-tip {
	font-size: 28rpx;
	color: #666666;
}

.scan-result {
	padding: 24rpx 40rpx;
	background: #f0f9ff;
	border-top: 1rpx solid #e6f7ff;
	text-align: center;
}

.result-label {
	font-size: 24rpx;
	color: #666666;
	margin-right: 12rpx;
}

.result-text {
	font-size: 32rpx;
	font-weight: 600;
	color: #0081ff;
}

.scan-actions {
	display: flex;
	padding: 32rpx;
	gap: 16rpx;
}

.scan-action-btn {
	flex: 1;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 12rpx;
	font-size: 28rpx;
	font-weight: 500;
	background: #f8f9fa;
	color: #666666;
	transition: all 0.3s ease;
}

.scan-action-btn.primary {
	background: #0081ff;
	color: #ffffff;
}

.scan-action-btn.scanning {
	background: #ff9500;
	color: #ffffff;
}

/* 摄像头界面样式 */
.camera-container {
	position: relative;
	width: 100%;
	height: 500rpx;
	background: #000;
	border-radius: 12rpx;
	overflow: hidden;
}

.camera-preview {
	width: 100%;
	height: 100%;
	position: relative;
}

.plate-frame {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 300rpx;
	height: 120rpx;
	border: 4rpx solid #00ff00;
	border-radius: 8rpx;
}

.frame-corner {
	position: absolute;
	width: 40rpx;
	height: 40rpx;
	border: 6rpx solid #00ff00;
}

.frame-corner.tl {
	top: -6rpx;
	left: -6rpx;
	border-right: none;
	border-bottom: none;
}

.frame-corner.tr {
	top: -6rpx;
	right: -6rpx;
	border-left: none;
	border-bottom: none;
}

.frame-corner.bl {
	bottom: -6rpx;
	left: -6rpx;
	border-right: none;
	border-top: none;
}

.frame-corner.br {
	bottom: -6rpx;
	right: -6rpx;
	border-left: none;
	border-top: none;
}

.frame-text {
	position: absolute;
	bottom: -60rpx;
	left: 50%;
	transform: translateX(-50%);
	color: #fff;
	font-size: 28rpx;
	white-space: nowrap;
	text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.8);
}

/* 自动识别状态指示器 */
.auto-status {
	width: 105px;
	position: absolute;
	margin-top: 25px;
	top: 85px;
	left: 30rpx;
	display: flex;
	align-items: center;
	gap: 10rpx;
	background: rgba(0, 0, 0, 0.6);
	padding: 6rpx 16rpx;
	border-radius: 20rpx;
	backdrop-filter: blur(10rpx);
}

.status-dot {
	width: 20rpx;
	height: 20rpx;
	background: #00ff00;
	border-radius: 50%;
	animation: pulse 1.5s infinite;
}

@keyframes pulse {
	0% {
		opacity: 1;
		transform: scale(1);
	}

	50% {
		opacity: 0.7;
		transform: scale(1.2);
	}

	100% {
		opacity: 1;
		transform: scale(1);
	}
}

.status-text {
	color: #fff;
	font-size: 24rpx;
	font-weight: bold;
}

.camera-controls {
	display: flex;
	gap: 20rpx;
	padding: 20rpx;
	justify-content: center;
}

.capture-btn,
.close-btn {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 260rpx;
	height: 260rpx;
	border-radius: 12rpx;
	border: none;
	font-size: 24rpx;
	font-weight: bold;
	color: #fff;
	transition: all 0.3s ease;
}

.capture-btn {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.4);
}

.capture-btn:disabled {
	background: #999;
	box-shadow: none;
	opacity: 0.5;
}

.close-btn {
	background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
	box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.4);
}

.camera-icon,
.close-icon {
	font-size: 28rpx;
	margin-bottom: 8rpx;
}

.loading-overlay {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.7);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1002;
}

.loading-content {
	background: rgba(255, 255, 255, 0.9);
	padding: 40rpx 60rpx;
	border-radius: 20rpx;
	backdrop-filter: blur(10rpx);
}

.loading-text {
	font-size: 28rpx;
	color: #333;
	font-weight: bold;
}

/* 功能按钮样式 */
.function-buttons {
	padding: 20rpx;
}

/* ================ 车牌输入区域样式 ================ */

/* 车牌输入区域 */
.plate-input-section {
	margin-bottom: 20rpx;
}

/* 输入和操作按钮容器 */
.input-actions-container {
	display: flex;
	gap: 16rpx;
	align-items: flex-start;
}

/* 车牌搜索容器 */
.plate-search-container {
	position: relative;
	flex: 1;
	z-index: 1000;
}

/* 搜索输入框包装器 */
.search-input-wrapper {
	position: relative;
	display: flex;
	align-items: center;
	background: #ffffff;
	border: 2rpx solid #e4e7ed;
	border-radius: 12rpx;
	padding: 0 16rpx;
	transition: all 0.3s ease;
}

.search-input-wrapper.focused {
	border-color: #2979ff;
	box-shadow: 0 0 0 4rpx rgba(41, 121, 255, 0.1);
}

.search-input-wrapper.hasText {
	border-color: #2979ff;
}

/* 搜索输入框 */
.plate-search-input {
	flex: 1;
	height: 88rpx;
	font-size: 32rpx;
	color: #303133;
	background: transparent;
	border: none;
	outline: none;
	padding-right: 60rpx;
	/* 为清空按钮留出空间 */
}

.plate-search-input::placeholder {
	color: #c0c4cc;
	font-size: 30rpx;
}

/* 搜索图标 */
.search-icon {
	position: absolute;
	right: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

/* 清空按钮 */
.clear-btn {
	position: absolute;
	right: 16rpx;
	top: 50%;
	transform: translateY(-50%);
	display: flex;
	align-items: center;
	justify-content: center;
	width: 40rpx;
	height: 40rpx;
	border-radius: 50%;
	background: rgba(200, 201, 204, 0.1);
	transition: all 0.2s ease;
	z-index: 10;
	cursor: pointer;
}

.clear-btn:active {
	background: rgba(200, 201, 204, 0.2);
	transform: scale(0.95);
}

/* 车牌识别按钮容器 */
.recognition-btn-container {
	flex-shrink: 0;
	display: flex;
	justify-content: flex-end;
	gap: 12rpx;
	padding-left: 60rpx;
}

/* 车牌识别按钮 */
.plate-recognition-btn {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	width: 400rpx;
	height: 88rpx;
	background: #ffffff;
	border: 2rpx solid #2979ff;
	border-radius: 12rpx;
	transition: all 0.2s ease;
	gap: 8rpx;
	margin-left: 80rpx;
}

.plate-recognition-btn:active {
	background: #f0f7ff;
	transform: scale(0.98);
}

.plate-recognition-btn.disabled {
	background: #f5f7fa;
	border-color: #dcdfe6;
	opacity: 0.6;
	cursor: not-allowed;
}

.plate-recognition-btn.disabled:active {
	background: #f5f7fa;
	transform: none;
}

.plate-recognition-btn.disabled .btn-label {
	color: #909399;
}

.plate-recognition-btn .btn-label {
	font-size: 24rpx;
	color: #2979ff;
	font-weight: 500;
}

/* 车牌键盘按钮 */
.plate-keyboard-btn {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 120rpx;
	height: 88rpx;
	background: #ffffff;
	border: 2rpx solid #2979ff;
	border-radius: 12rpx;
	transition: all 0.2s ease;
}

.plate-keyboard-btn:active {
	background: #f0f7ff;
	transform: scale(0.98);
}

.plate-keyboard-btn .btn-label {
	font-size: 24rpx;
	color: #2979ff;
	margin-top: 4rpx;
	font-weight: 500;
}

/* 车牌键盘容器样式 */
.keyboard-container {
	/* 移除底部间距，让键盘紧贴底部导航栏 */
	padding-bottom: 0;
	padding-bottom: env(safe-area-inset-bottom);
	/* 只保留底部安全区域 */
}

/* 车牌键盘预览样式 */
.keyboard-preview {
	padding: 30rpx;
	background: #ffffff;
	border-radius: 20rpx 20rpx 0 0;
	margin-bottom: 20rpx;
}

.preview-title {
	font-size: 28rpx;
	color: #333333;
	text-align: center;
	margin-bottom: 20rpx;
	font-weight: 500;
}

.preview-car-plate {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 20rpx 30rpx;
	border-radius: 12rpx;
	border: 3rpx solid;
	margin: 0 auto;
	max-width: 400rpx;
	min-height: 80rpx;
}

.preview-plate-text {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
	font-size: 32rpx;
	font-weight: bold;
	letter-spacing: 2rpx;
}

.plate-char {
	min-width: 30rpx;
	text-align: center;
	font-family: 'Arial', monospace;
}



/* ================ 搜索建议下拉框样式 ================ */

/* 搜索建议下拉框 */
.search-suggestions {
	position: absolute;
	top: 100%;
	left: 0;
	right: 0;
	background: #ffffff;
	border-radius: 8rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.12);
	z-index: 1001;
	margin-top: 6rpx;
	border: 1rpx solid #e8e8e8;
	overflow: hidden;
}

.suggestions-scroll {
	max-height: 320rpx;
}

/* 位置搜索建议下拉框样式已在上方定义，此处删除重复定义 */

/* 建议项样式 */
.suggestion-item {
	display: flex;
	align-items: center;
	padding: 12rpx 16rpx;
	border-bottom: 1rpx solid #f0f0f0;
	cursor: pointer;
	transition: all 0.3s ease;
}

.suggestion-item:last-child {
	border-bottom: none;
}

.suggestion-item:active {
	background: #f8f9ff;
}

.suggestion-icon {
	width: 32rpx;
	height: 32rpx;
	border-radius: 6rpx;
	background: #f5f7fa;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 12rpx;
}

.suggestion-icon .icon-emoji {
	font-size: 20rpx;
}

.suggestion-content {
	flex: 1;
}

.suggestion-text {
	font-size: 24rpx;
	color: #333;
	margin-bottom: 2rpx;
	display: block;
}

.suggestion-type {
	font-size: 20rpx;
	color: #999;
}

.suggestion-arrow {
	color: #ccc;
}

.suggestion-arrow .icon-emoji {
	font-size: 16rpx;
}

/* 建议底部 */
.suggestions-footer {
	padding: 8rpx 16rpx;
	background: #f8f9fa;
	border-top: 1rpx solid #e8e8e8;
}

.footer-text {
	font-size: 20rpx;
	color: #666;
}

/* 位置建议项样式已在上方定义，此处删除重复 */

/* ================ 车牌识别弹窗样式 ================ */

/* 全屏识别弹窗 */
.plate-recognition-fullscreen {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 9999;
	background: rgba(0, 0, 0, 0.5);
}

/* 全屏摄像头容器 */
.camera-container-fullscreen {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	width: 100%;
	height: 100vh;
	overflow: hidden;
	background: #000000;
	z-index: 1;
}

.camera-preview {
	width: 100%;
	height: 100%;
}

/* 车牌框选区域 - 增大尺寸 */
.plate-frame {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 500rpx;
	height: 200rpx;
	border: 4rpx solid transparent;
}

.frame-corner {
	position: absolute;
	width: 60rpx;
	height: 60rpx;
	border: 6rpx solid #2979ff;
}

.frame-corner.tl {
	top: -4rpx;
	left: -4rpx;
	border-right: none;
	border-bottom: none;
}

.frame-corner.tr {
	top: -4rpx;
	right: -4rpx;
	border-left: none;
	border-bottom: none;
}

.frame-corner.bl {
	bottom: -4rpx;
	left: -4rpx;
	border-right: none;
	border-top: none;
}

.frame-corner.br {
	bottom: -4rpx;
	right: -4rpx;
	border-left: none;
	border-top: none;
}

.frame-text {
	position: absolute;
	bottom: -60rpx;
	left: 50%;
	transform: translateX(-50%);
	color: #2979ff;
	font-size: 24rpx;
	background: rgba(255, 255, 255, 0.9);
	padding: 8rpx 16rpx;
	border-radius: 20rpx;
}

/* 自动识别状态指示器 - 往下移动 */
.auto-status {
	position: absolute;
	top: 140rpx;
	right: 20rpx;
	display: flex;
	align-items: center;
	background: rgba(0, 0, 0, 0.6);
	padding: 8rpx 16rpx;
	border-radius: 20rpx;
	backdrop-filter: blur(10rpx);
}

.status-dot {
	width: 12rpx;
	height: 12rpx;
	background: #19be6b;
	border-radius: 50%;
	margin-right: 8rpx;
	animation: pulse 1.5s infinite;
}

@keyframes pulse {
	0% {
		opacity: 1;
	}

	50% {
		opacity: 0.5;
	}

	100% {
		opacity: 1;
	}
}

.auto-status .status-text {
	color: #ffffff;
	font-size: 24rpx;
}

/* 摄像头控制按钮 - 再往上移动 */
.camera-controls {
	position: absolute;
	bottom: 180rpx;
	left: 0;
	right: 0;
	display: flex;
	gap: 20rpx;
	justify-content: center;
	padding: 0 40rpx;
	z-index: 10;
}

.control-btn {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 140rpx;
	height: 140rpx;
	border-radius: 16rpx;
	transition: all 0.2s ease;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.3);
}

.control-btn text {
	font-size: 22rpx;
	margin-top: 8rpx;
}

.capture-btn {
	background: #2979ff;
	color: #ffffff;
}

.capture-btn:active {
	background: #1e5bb8;
	transform: scale(0.95);
}

.capture-btn.disabled {
	background: #c0c4cc;
	pointer-events: none;
}

.auto-btn {
	background: #f5f7fa;
	color: #606266;
	border: 2rpx solid #e4e7ed;
}

.auto-btn.active {
	background: #19be6b;
	color: #ffffff;
	border-color: #19be6b;
}

.auto-btn:active {
	transform: scale(0.95);
}

.close-btn {
	position: absolute;
	top: 180rpx;
	right: 30rpx;
	background: #f56c6c;
	color: #ffffff;
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.3);
	z-index: 10;
}

.close-btn text {
	display: none;
}

.close-btn:active {
	background: #e85a5a;
	transform: scale(0.95);
}

/* 加载遮罩 - 优化样式 */
.loading-overlay {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.75);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 11;
	backdrop-filter: blur(8rpx);
}

.loading-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 24rpx;
	padding: 60rpx 80rpx;
	background: rgba(0, 0, 0, 0.8);
	border-radius: 20rpx;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.3);
}

.loading-text {
	color: #ffffff;
	font-size: 28rpx;
	font-weight: 500;
}

/* 识别选择界面 - 真正居中显示的弹窗 */
.recognition-options {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 600rpx;
	display: flex;
	flex-direction: column;
	gap: 30rpx;
	padding: 80rpx 60rpx;
	border-radius: 24rpx;
	background: rgba(255, 255, 255, 0.98);
	box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.2);
	z-index: 1000;
}

.option-item {
	display: flex;
	align-items: center;
	padding: 36rpx 30rpx;
	background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
	border-radius: 16rpx;
	transition: all 0.3s ease;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
	border: 2rpx solid #e9ecef;
}

.option-item:last-child {
	margin-bottom: 0;
}

.option-item:active {
	transform: scale(0.96);
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.12);
	background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
}

.option-icon {
	margin-right: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.option-content {
	flex: 1;
	text-align: left;
	display: flex;
	flex-direction: column;
	gap: 4rpx;
}

.option-title {
	font-size: 32rpx;
	color: #303133;
	font-weight: 600;
}

.option-desc {
	font-size: 24rpx;
	color: #909399;
}

/* 识别结果 - 真正居中显示的弹窗 */
.recognition-result {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 600rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 60rpx 40rpx;
	border-radius: 24rpx;
	background: rgba(255, 255, 255, 0.98);
	box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.2);
	z-index: 1000;
}

.result-header {
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 30rpx;
}

.result-title {
	font-size: 36rpx;
	font-weight: 700;
	color: #19be6b;
	margin-left: 12rpx;
}

.result-plate {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16rpx;
	padding: 40rpx 60rpx;
	background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
	border-radius: 20rpx;
	margin-bottom: 40rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
	text-align: center;
	border: 2rpx solid #e9ecef;
}

.plate-text {
	font-size: 56rpx;
	font-weight: 800;
	color: #2979ff;
	letter-spacing: 6rpx;
	margin-bottom: 8rpx;
}

.plate-color {
	font-size: 26rpx;
	color: #666666;
	margin-bottom: 4rpx;
}

.plate-confidence {
	font-size: 24rpx;
	color: #909399;
}

.result-actions {
	display: flex;
	gap: 20rpx;
	width: 100%;
}

.action-btn {
	flex: 1;
	padding: 28rpx 0;
	border-radius: 12rpx;
	font-size: 30rpx;
	font-weight: 600;
	transition: all 0.2s ease;
	text-align: center;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.use-btn {
	background: linear-gradient(135deg, #2979ff 0%, #1e5fa8 100%);
	color: #ffffff;
}

.use-btn:active {
	transform: scale(0.96);
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
}

.retry-btn {
	background: #f8f9fa;
	color: #666666;
	border: 2rpx solid #e9ecef;
}

.retry-btn:active {
	transform: scale(0.96);
	background: #e9ecef;
}

/* 识别操作按钮 */
.recognition-actions {
	margin-top: 40rpx;
}

.recognition-btn {
	width: 100%;
	height: 88rpx;
	background: #2979ff;
	color: #ffffff;
	border: none;
	border-radius: 12rpx;
	font-size: 32rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s ease;
}

.recognition-btn:active {
	background: #1e5bb8;
	transform: scale(0.98);
}

.recognition-btn.disabled {
	background: #c0c4cc;
	color: #ffffff;
	pointer-events: none;
}

.btn-text {
	margin-left: 12rpx;
}

/* ================ 车牌键盘样式 ================ */

/* 键盘输入容器 */
.keyboard-input-container {
	display: flex;
	align-items: center;
	background: #f8f9fa;
	border-radius: 8rpx;
	padding: 0 16rpx;
	margin-bottom: 12rpx;
}

.xm-keyboard-v2 {
	flex: 1;
	margin: 0;
}

.keyboard-input-wrapper {
	width: 100%;
	margin: 0;
}

/* 车牌类型选择器 */
.plate-type-selector {
	margin-top: 20rpx;
}

.color-car-button {
	display: flex;
	justify-content: space-between;
	gap: 10rpx;
	flex-wrap: wrap;
}

.blue-car,
.yellow-car,
.white-car,
.black-car,
.green-car {
	flex: 1;
	min-width: 100rpx;
	height: 60rpx;
	border-radius: 8rpx;
	border: 2rpx solid #e0e0e0;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #f8f9fa;
	transition: all 0.3s ease;
}

.blue-car-text,
.yellow-car-text,
.white-car-text,
.black-car-text,
.green-car-text {
	font-size: 24rpx;
	font-weight: bold;
	color: #666;
}

/* 车牌类型选择按钮样式 */
.blue-car.selected {
	background: linear-gradient(to bottom, #216fef, #0c4fc5) !important;
	border: 2rpx solid #216fef;
	color: #fff;
}

.blue-car.selected .blue-car-text {
	color: #fff;
}

.yellow-car.selected {
	background: linear-gradient(to bottom, #f8c401, #dba700) !important;
	border: 2rpx solid #f8c401;
}

.yellow-car.selected .yellow-car-text {
	color: #000;
}

.white-car.selected {
	background: linear-gradient(to bottom, #f5f5f5, #e0e0e0) !important;
	border: 2rpx solid #e0e0e0;
}

.white-car.selected .white-car-text {
	color: #000;
}

.black-car.selected {
	background: linear-gradient(to bottom, #525252, #1e1e1e) !important;
	border: 2rpx solid #000;
}

.black-car.selected .black-car-text {
	color: #fff;
}

.green-car.selected {
	background: linear-gradient(to bottom, #d0f1e4, #6ad390) !important;
	border: 2rpx solid #6ad390;
}

.green-car.selected .green-car-text {
	color: #000;
}

/* 确认弹窗样式 */
.confirm-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.6);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 2000;
}

.confirm-content {
	width: 80%;
	max-width: 500rpx;
	background: #ffffff;
	border-radius: 16rpx;
	overflow: hidden;
}

.confirm-header {
	padding: 32rpx 32rpx 24rpx;
	text-align: center;
	border-bottom: 1rpx solid #f0f0f0;
}

.confirm-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333333;
}

.confirm-body {
	padding: 32rpx;
	text-align: center;
}

.confirm-text {
	font-size: 28rpx;
	color: #666666;
	margin-bottom: 24rpx;
}

.confirm-info {
	background: #f8f9fa;
	border-radius: 12rpx;
	padding: 24rpx;
	text-align: left;
}

.info-text {
	display: block;
	font-size: 26rpx;
	color: #333333;
	margin-bottom: 8rpx;
}

.info-text:last-child {
	margin-bottom: 0;
}

.confirm-actions {
	display: flex;
	border-top: 1rpx solid #f0f0f0;
}

.confirm-btn {
	flex: 1;
	height: 88rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28rpx;
	font-weight: 500;
	transition: all 0.3s ease;
}

.confirm-btn.cancel {
	color: #666666;
	background: #f8f9fa;
	border-right: 1rpx solid #f0f0f0;
}

.confirm-btn.primary {
	color: #ffffff;
	background: #0081ff;
}

/* 自定义导航栏样式 */
.custom-navbar {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	background: #0081ff;
	z-index: 9999;
}

.navbar-content {
	height: 44px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 16px;
}

.navbar-left {
	flex: 1;
	display: flex;
	align-items: center;
	padding-left: 16px;
}

.navbar-center {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
}

.navbar-right {
	width: 60px;
	display: flex;
	align-items: center;
	justify-content: flex-end;
	padding-right: 16px;
}

// 停车场名称
.parking-lot-name {
	color: #ffffff;
	font-size: 14px;
	font-weight: 400;
	opacity: 0.9;
}

// 用户信息按钮
.user-info-btn {
	width: 40px;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.2);
	transition: background 0.3s ease;
}

.user-info-btn:active {
	background: rgba(255, 255, 255, 0.3);
}

// 导航栏标题
.navbar-title {
	color: #ffffff;
	font-size: 18px;
	font-weight: 500;
}

// 更多操作按钮
.more-btn {
	width: 40px;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.2);
	transition: background 0.3s ease;
}

.more-btn:active {
	background: rgba(255, 255, 255, 0.3);
}

.more-icon {
	color: #ffffff;
	font-size: 18px;
	font-weight: bold;
}

// 车场选择器
.parking-selector {
	position: fixed;
	left: 0;
	right: 0;
	height: 62px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	z-index: 9998;
	box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
	backdrop-filter: blur(15px);
	background: rgba(248, 250, 252, 0.98);
	display: flex;
	align-items: center;
	padding: 4px 12px;
	gap: 8px;
}

.parking-content {
	flex: 1;
	max-width: 88%;
	height: 40px;
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 0 14px;
	cursor: pointer;
	transition: all 0.3s ease;
	border-radius: 20px;
	background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%);
	box-shadow: 0 1px 8px rgba(0, 0, 0, 0.06);
	border: 1px solid rgba(255, 255, 255, 0.8);
}

.parking-content:hover {
	transform: translateY(-1px);
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.parking-content:active {
	transform: translateY(0);
}

.parking-icon-container {
	width: 32px;
	height: 32px;
	background: linear-gradient(135deg, #005abb 0%, #0066cc 100%);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 1px 6px rgba(0, 90, 187, 0.25);
	flex-shrink: 0;
}

.parking-icon {
	font-size: 16px;
	filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.parking-details {
	display: flex;
	flex-direction: column;
	gap: 2px;
	flex: 1;
	min-width: 0;
}

.parking-name {
	font-size: 14px;
	font-weight: 600;
	color: #2c3e50;
	line-height: 1.2;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.parking-desc {
	font-size: 10px;
	color: #7f8c8d;
	opacity: 0.8;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.dropdown-container {
	width: 24px;
	height: 24px;
	background: linear-gradient(135deg, #005abb 0%, #0066cc 100%);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s ease;
	flex-shrink: 0;
	box-shadow: 0 1px 4px rgba(0, 90, 187, 0.2);
}

.dropdown-icon {
	font-size: 10px;
	color: #ffffff;
	transform: rotate(0deg);
	transition: transform 0.3s ease;
	font-weight: bold;
}

.parking-content:hover .dropdown-container {
	transform: scale(1.1) rotate(180deg);
}

// 用户信息部分
.user-section {
	position: relative;
	display: flex;
	align-items: center;
	gap: 6px;
	max-width: 24%;
	flex-shrink: 0;
	margin-left: auto;
}

.user-info-btn {
	flex: 1;
	height: 40px;
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 0 10px;
	cursor: pointer;
	transition: all 0.3s ease;
	border-radius: 20px;
	background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%);
	box-shadow: 0 1px 8px rgba(0, 0, 0, 0.06);
	border: 1px solid rgba(255, 255, 255, 0.8);
}

.user-info-btn:hover {
	transform: translateY(-1px);
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.user-info-btn:active {
	transform: translateY(0);
}

.user-avatar {
	width: 28px;
	height: 28px;
	background: linear-gradient(135deg, #005abb 0%, #0066cc 100%);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 1px 6px rgba(255, 107, 107, 0.25);
	flex-shrink: 0;
	margin-left: 7px;
}

.user-avatar-text {
	font-size: 14px;
	filter: drop-shadow(0 1px 2px rgba(255, 255, 255, 0.1));
}

.user-details {
	display: flex;
	flex-direction: column;
	gap: 1px;
	flex: 1;
	min-width: 0;
}

.user-name {
	font-size: 12px;
	font-weight: 600;
	color: #2c3e50;
	line-height: 1.2;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.user-desc {
	font-size: 9px;
	color: #7f8c8d;
	opacity: 0.8;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.logout-btn {
	width: 44px;
	height: 44px;
	background: rgba(255, 255, 255, 0.95);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.3s ease;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
	flex-shrink: 0;
}

.logout-btn:hover {
	transform: translateY(-1px) scale(1.05);
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
	background: rgba(255, 107, 107, 0.1);
}

.logout-btn:active {
	transform: translateY(0) scale(1);
}

.logout-icon {
	font-size: 20px;
	filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.debug-btn {
	width: 40px;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.2);
	transition: background 0.3s ease;
	margin-left: 8px;
}

.debug-btn:active {
	background: rgba(255, 255, 255, 0.3);
}

.debug-icon {
	color: #ffffff;
	font-size: 18px;
}

.navbar-title {
	color: #ffffff;
	font-size: 18px;
	font-weight: 600;
}

.navbar-back {
	width: 40px;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.2);
	transition: background 0.3s ease;
}

.navbar-back:active {
	background: rgba(255, 255, 255, 0.3);
}

.back-icon {
	color: #ffffff;
	font-size: 24px;
	font-weight: bold;
}

.navbar-back-disabled {
	width: 40px;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	opacity: 0.3;
	/* 灰色显示，表示禁用状态 */
}

.back-icon-disabled {
	color: #ffffff;
	font-size: 24px;
	font-weight: bold;
}

/* 响应式适配 */
@media (max-width: 750rpx) {
	.type-grid {
		grid-template-columns: 1fr;
	}

	.photo-grid {
		grid-template-columns: repeat(2, 1fr);
	}

	/* 小屏设备上增加键盘底部间距 */
	.custom-plate-keyboard {
		padding-bottom: calc(40rpx + env(safe-area-inset-bottom, 0px) + 140rpx) !important;
	}
}

/* ================ 搜索弹窗样式 ================ */
/* 搜索结果列表样式 */
.search-results-section {
	margin: 30rpx 0;
	background: #fff;
	border-radius: 20rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	overflow: hidden;
	animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
	from {
		opacity: 0;
		transform: translateY(-20rpx);
	}

	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.search-section-header {
	background: linear-gradient(135deg, #f8fbff, #e8f4ff);
	padding: 30rpx;
	border-bottom: 2rpx solid #f0f0f0;
}

.search-title-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20rpx;
}

.search-section-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #2979ff;
}

.search-close-btn {
	padding: 8rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.8);
	cursor: pointer;
	transition: all 0.2s ease;
}

.search-close-btn:active {
	transform: scale(0.9);
	background: rgba(255, 255, 255, 1);
}

.search-input-container {
	display: flex;
	align-items: center;
	background: #fff;
	border-radius: 16rpx;
	padding: 0 20rpx;
	border: 2rpx solid #e8e8e8;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.search-input {
	flex: 1;
	height: 80rpx;
	font-size: 28rpx;
	color: #333;
	background: transparent;
	border: none;
}

.search-btn {
	padding: 15rpx;
	border-radius: 50%;
	background: #e3f2fd;
	margin-left: 15rpx;
	transition: all 0.2s ease;
}

.search-btn:active {
	transform: scale(0.9);
	background: #bbdefb;
}

.search-results-content {
	padding: 30rpx;
}

.result-summary {
	margin-bottom: 30rpx;
	padding: 20rpx;
	background: linear-gradient(135deg, #f0f8ff, #e6f3ff);
	border-radius: 16rpx;
	border-left: 6rpx solid #2979ff;
}

.result-count {
	font-size: 26rpx;
	color: #2979ff;
	font-weight: 500;
}

/* 车主分组样式 */
.owner-group {
	margin-bottom: 30rpx;
	border-radius: 16rpx;
	overflow: hidden;
	border: 1rpx solid #e8e8e8;
	background: #fff;
}

.owner-group-header {
	background: linear-gradient(135deg, #f8f9fa, #e9ecef);
	padding: 25rpx 30rpx;
	border-bottom: 1rpx solid #e8e8e8;
	display: flex;
	align-items: center;
	justify-content: space-between;
	cursor: pointer;
	transition: all 0.2s ease;
}

.owner-group-header:active {
	background: linear-gradient(135deg, #e9ecef, #dee2e6);
}

.owner-group-info {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.owner-avatar {
	width: 60rpx;
	height: 60rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #667eea, #764ba2);
	display: flex;
	align-items: center;
	justify-content: center;
	color: #fff;
	font-size: 24rpx;
	font-weight: 600;
}

.owner-details {
	flex: 1;
}

.owner-name {
	font-size: 28rpx;
	font-weight: 600;
	color: #333;
	margin-bottom: 8rpx;
}

.owner-meta {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.owner-phone,
.plates-count {
	font-size: 24rpx;
	color: #666;
}

.plates-count {
	background: #e3f2fd;
	padding: 6rpx 12rpx;
	border-radius: 20rpx;
	color: #1976d2;
	font-weight: 500;
}

.expand-icon {
	transition: transform 0.3s ease;
	color: #666;
}

.expand-icon.expanded {
	transform: rotate(180deg);
}

/* 车牌卡片样式 */
.plates-container {
	padding: 20rpx 30rpx 30rpx;
	background: #fafbfc;
}

.plate-card {
	background: #fff;
	border-radius: 16rpx;
	margin-bottom: 20rpx;
	overflow: hidden;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
	border: 2rpx solid transparent;
	transition: all 0.3s ease;
	cursor: pointer;
}

.plate-card:hover {
	border-color: #2979ff;
	box-shadow: 0 4rpx 20rpx rgba(41, 121, 255, 0.15);
	transform: translateY(-2rpx);
}

.plate-card:active {
	transform: translateY(0);
}

.plate-card:last-child {
	margin-bottom: 0;
}

.plate-header {
	padding: 25rpx 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.plate-number-section {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.plate-number {
	font-size: 32rpx;
	font-weight: 700;
	color: #1a1a1a;
	letter-spacing: 2rpx;
	font-family: 'Courier New', monospace;
}

.plate-type {
	background: linear-gradient(135deg, #4caf50, #45a049);
	color: #fff;
	padding: 8rpx 16rpx;
	border-radius: 20rpx;
	font-size: 22rpx;
	font-weight: 500;
}

.violation-badge {
	background: linear-gradient(135deg, #ff5722, #e64a19);
	color: #fff;
	padding: 8rpx 16rpx;
	border-radius: 20rpx;
	font-size: 22rpx;
	font-weight: 500;
}

.plate-info {
	padding: 20rpx 30rpx;
}

.info-row {
	display: flex;
	align-items: center;
	margin-bottom: 16rpx;
}

.info-row:last-child {
	margin-bottom: 0;
}

.info-label {
	font-size: 24rpx;
	color: #666;
	width: 120rpx;
	flex-shrink: 0;
}

.info-value {
	font-size: 26rpx;
	color: #333;
	flex: 1;
}

/* 违规记录样式 */
.violations-section {
	margin-top: 20rpx;
	padding-top: 20rpx;
	border-top: 1rpx solid #f0f0f0;
}

.violations-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20rpx;
}

.violations-title {
	font-size: 26rpx;
	font-weight: 600;
	color: #333;
}

.violations-count {
	background: #ffebee;
	color: #d32f2f;
	padding: 6rpx 12rpx;
	border-radius: 16rpx;
	font-size: 22rpx;
	font-weight: 500;
}

.violation-item {
	background: #fff8e1;
	border-left: 4rpx solid #ffc107;
	padding: 20rpx;
	margin-bottom: 16rpx;
	border-radius: 0 12rpx 12rpx 0;
}

.violation-item:last-child {
	margin-bottom: 0;
}

.violation-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 12rpx;
}

.violation-type {
	font-size: 26rpx;
	font-weight: 600;
	color: #e65100;
}

.violation-status {
	background: #f44336;
	color: #fff;
	padding: 4rpx 12rpx;
	border-radius: 12rpx;
	font-size: 20rpx;
}

.violation-details {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 12rpx;
}

.violation-detail {
	font-size: 24rpx;
}

.violation-detail-label {
	color: #666;
}

.violation-detail-value {
	color: #333;
	font-weight: 500;
	margin-left: 8rpx;
}

/* 加载更多按钮样式 */
.load-more-section {
	padding: 30rpx;
	text-align: center;
}

.load-more-btn {
	background: linear-gradient(135deg, #2196f3, #1976d2);
	color: #fff;
	padding: 20rpx 40rpx;
	border-radius: 50rpx;
	font-size: 26rpx;
	font-weight: 500;
	border: none;
	box-shadow: 0 4rpx 15rpx rgba(33, 150, 243, 0.3);
	transition: all 0.3s ease;
}

.load-more-btn:active {
	transform: translateY(2rpx);
	box-shadow: 0 2rpx 8rpx rgba(33, 150, 243, 0.3);
}

.load-more-btn:disabled {
	background: #ccc;
	box-shadow: none;
	cursor: not-allowed;
}

.result-item {
	display: flex;
	align-items: flex-start;
	padding: 24rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
	cursor: pointer;
	transition: all 0.3s ease;
	border-radius: 8rpx;
	margin: 0 -16rpx;
	padding-left: 16rpx;
	padding-right: 16rpx;
}

.result-item:hover {
	background: #f8fbff;
	transform: translateY(-2rpx);
	box-shadow: 0 4rpx 12rpx rgba(33, 111, 239, 0.1);
}

.result-item:last-child {
	border-bottom: none;
}

.result-icon {
	width: 72rpx;
	height: 72rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #e3f2fd, #bbdefb);
	border-radius: 50%;
	margin-right: 24rpx;
	box-shadow: 0 2rpx 8rpx rgba(33, 150, 243, 0.15);
}

.result-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.result-plate,
.result-location {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
	margin-bottom: 5rpx;
}

/*  车牌号码字符拆分显示样式 */
.result-plate-number {
	padding: 10rpx 16rpx;
	border-radius: 12rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 600;
	font-size: 26rpx;
	letter-spacing: 2rpx;
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
}

.result-plate-number.green-plate {
	background: linear-gradient(to bottom, #d0f1e4, #6ad390);
	border: 2rpx solid #6ad390;
}

.result-plate-number.blue-plate {
	background: linear-gradient(to bottom, #216fef, #0c4fc5);
	border: 2rpx solid #216fef;
}



.result-owner {
	font-size: 24rpx;
	color: #666;
	margin-bottom: 8rpx;
}

/*  月票车搜索结果样式 */

/* 车辆类型标签样式 */
.vehicle-tag,
.owner-vehicle-tag {
	display: inline-flex;
	align-items: center;
	padding: 4rpx 12rpx;
	border-radius: 20rpx;
	font-size: 20rpx;
	font-weight: 500;
	margin-left: 12rpx;
}

.monthly-tag {
	background: linear-gradient(135deg, #4CAF50, #45a049);
	color: white;
	box-shadow: 0 2rpx 4rpx rgba(76, 175, 80, 0.3);
}

.appointment-tag {
	background: linear-gradient(135deg, #FF9800, #f57c00);
	color: white;
	box-shadow: 0 2rpx 4rpx rgba(255, 152, 0, 0.3);
}

.in-site-tag {
	background: linear-gradient(135deg, #2196F3, #1976D2);
	color: white;
	box-shadow: 0 2rpx 4rpx rgba(33, 150, 243, 0.3);
}

.tag-text {
	font-size: 20rpx;
	font-weight: 500;
}

/* 车主姓名行样式 */
.owner-name-row {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	margin-bottom: 8rpx;
}

.owner-name {
	font-size: 32rpx;
	color: #1976d2;
	font-weight: 600;
}

/* 车位信息样式 */
.parking-spots {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	margin-top: 8rpx;
	padding: 8rpx 12rpx;
	background: #f8f9fa;
	border-radius: 8rpx;
	border-left: 4rpx solid #4CAF50;
}

.spots-label {
	font-size: 24rpx;
	color: #666;
	margin-right: 8rpx;
	font-weight: 500;
}

.spot-item {
	font-size: 24rpx;
	color: #4CAF50;
	font-weight: 500;
	background: #e8f5e8;
	padding: 4rpx 8rpx;
	border-radius: 4rpx;
	margin-right: 8rpx;
	margin-bottom: 4rpx;
}

/* 业主信息中的标签样式调整 */
.owner-info .info-item {
	align-items: flex-start;
}

.owner-vehicle-tag,
.vehicle-status-tag {
	margin-left: 16rpx;
	margin-top: 2rpx;
}

/* 进场时间样式 */
.enter-time {
	color: #2196F3;
	font-weight: 500;
}

/*  月票车搜索结果样式 */
.result-ticket {
	font-size: 24rpx;
	color: #2979ff;
	margin-bottom: 6rpx;
}

.result-parking-spot {
	font-size: 24rpx;
	color: #ff6b35;
	margin-bottom: 6rpx;
}

.result-status {
	display: flex;
	flex-wrap: wrap;
	gap: 8rpx;
	margin-bottom: 8rpx;
}

.status-tag {
	font-size: 22rpx;
	padding: 6rpx 12rpx;
	border-radius: 12rpx;
	color: white;
	font-weight: 600;
	text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.2);
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.status-tag.valid {
	background: #4caf50;
}

.status-tag.expired {
	background: #ff9800;
}

.status-tag.frozen {
	background: #f44336;
}

.status-tag.in-park {
	background: #2196f3;
}

.result-stats {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
}

.stat-item {
	font-size: 22rpx;
	color: #555;
	background: linear-gradient(135deg, #f8f9fa, #e9ecef);
	padding: 6rpx 12rpx;
	border-radius: 10rpx;
	border: 1rpx solid #e0e0e0;
	font-weight: 500;
}

.result-arrow {
	width: 40rpx;
	height: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.search-empty {
	text-align: center;
	padding: 80rpx 0;
	background: linear-gradient(135deg, #f8fbff, #f0f7ff);
	border-radius: 16rpx;
	margin: 20rpx 0;
}

.empty-text {
	font-size: 30rpx;
	color: #666;
	font-weight: 500;
}

/* 修改原有输入框样式以适配点击态 */
.plate-display-input {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 92rpx;
	/* 为搜索图标和清空按钮留出空间 */
}

.plate-text {
	font-size: 34rpx;
	color: #303133;
	font-weight: 600;
	letter-spacing: 1rpx;
}

.placeholder-text {
	font-size: 32rpx;
	color: #bbb;
	font-style: italic;
}

/* 违规位置直接输入框样式 */
.location-input {
	flex: 1;
	height: 92rpx;
	font-size: 28rpx;
	color: #303133;
	background: transparent;
	border: none;
	outline: none;
	padding-right: 90rpx;
	/* 为清空按钮和下拉图标留出空间 */
	font-weight: 500;
}

.location-input::placeholder {
	color: #bbb;
	font-size: 26rpx;
	font-style: italic;
}

.search-input-wrapper .search-icon {
	position: absolute;
	right: 60rpx;
	/* 在清空按钮左侧 */
	top: 50%;
	transform: translateY(-50%);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 5;
}

/* ================  预约记录区域样式 ================ */

.appointment-records-card {
	border: 2rpx solid #2979ff;
	box-shadow: 0 4rpx 12rpx rgba(41, 121, 255, 0.1);
}

.appointment-records-card .section-header {
	position: relative;
}

.selection-status {
	position: absolute;
	right: 20rpx;
	top: 50%;
	transform: translateY(-50%);
}

.selected-badge {
	background: linear-gradient(135deg, #67c23a, #85ce61);
	color: white;
	font-size: 24rpx;
	padding: 10rpx 20rpx;
	border-radius: 24rpx;
	font-weight: 700;
	text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.2);
	box-shadow: 0 2rpx 6rpx rgba(103, 194, 58, 0.3);
}

.appointment-records-section {
	padding: 32rpx;
}

.records-tip-container {
	margin-bottom: 20rpx;
}

.records-tip {
	display: block;
	font-size: 28rpx;
	color: #2979ff;
	background: linear-gradient(135deg, #f0f9ff, #e3f2fd);
	padding: 20rpx 24rpx;
	border-radius: 12rpx;
	border-left: 6rpx solid #2979ff;
	margin-bottom: 12rpx;
	line-height: 1.5;
	font-weight: 700;
	box-shadow: 0 2rpx 8rpx rgba(41, 121, 255, 0.1);
}

.records-tip-detail {
	display: block;
	font-size: 26rpx;
	color: #f56c6c;
	background: linear-gradient(135deg, #fef0f0, #fde2e2);
	padding: 16rpx 24rpx;
	border-radius: 12rpx;
	border-left: 6rpx solid #f56c6c;
	line-height: 1.5;
	animation: blink 2s infinite;
	font-weight: 600;
	box-shadow: 0 2rpx 8rpx rgba(245, 108, 108, 0.15);
}

@keyframes blink {

	0%,
	50% {
		opacity: 1;
	}

	51%,
	100% {
		opacity: 0.6;
	}
}

.records-list {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.record-item {
	background: #ffffff;
	border: 2rpx solid #e4e7ed;
	border-radius: 16rpx;
	padding: 24rpx;
	transition: all 0.3s ease;
	cursor: pointer;
	position: relative;
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.02);
}

.record-item:hover {
	border-color: #2979ff;
	box-shadow: 0 4rpx 16rpx rgba(41, 121, 255, 0.12);
	transform: translateY(-2rpx);
}

.record-item.selected {
	border-color: #2979ff;
	background: linear-gradient(135deg, #f0f9ff, #e3f2fd);
	box-shadow: 0 6rpx 20rpx rgba(41, 121, 255, 0.2);
	transform: translateY(-1rpx);
}

.record-selection-indicator {
	position: absolute;
	top: 16rpx;
	right: 16rpx;
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.selection-radio {
	width: 36rpx;
	height: 36rpx;
	border: 3rpx solid #dcdfe6;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s ease;
	background: #ffffff;
}

.selection-radio.checked {
	border-color: #2979ff;
	background: #2979ff;
}

.radio-icon {
	color: #ffffff;
	font-size: 20rpx;
	font-weight: bold;
}

.selection-text {
	font-size: 22rpx;
	color: #909399;
	font-weight: 500;
}

.record-item.selected .selection-text {
	color: #2979ff;
	font-weight: 600;
}

.record-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12rpx;
}

.record-date {
	font-size: 28rpx;
	font-weight: 600;
	color: #303133;
}

.record-status {
	padding: 6rpx 12rpx;
	border-radius: 20rpx;
	font-size: 22rpx;
}

.status-completed {
	background: #f0f9ff;
	color: #2979ff;
	border: 1rpx solid #2979ff;
}

.status-parking {
	background: #fff7e6;
	color: #fa8c16;
	border: 1rpx solid #fa8c16;
}

.status-pending {
	background: #f6f6f6;
	color: #666;
	border: 1rpx solid #d9d9d9;
}

.status-default {
	background: #f6f6f6;
	color: #666;
	border: 1rpx solid #d9d9d9;
}

.record-address {
	display: flex;
	align-items: center;
	margin-bottom: 8rpx;
}

.record-address .icon-emoji {
	font-size: 20rpx;
	margin-right: 8rpx;
	color: #52c41a;
}

.address-text {
	font-size: 24rpx;
	color: #666;
	line-height: 1.4;
}

.record-time {
	margin-bottom: 8rpx;
}

.time-info {
	font-size: 22rpx;
	color: #999;
	background: #f5f5f5;
	padding: 4rpx 8rpx;
	border-radius: 4rpx;
	display: inline-block;
}

.violation-suggestion {
	margin-top: 12rpx;
	padding-top: 12rpx;
	border-top: 1rpx dashed #e4e7ed;
}

.suggestion-content {
	display: flex;
	align-items: center;
	padding: 8rpx 12rpx;
	border-radius: 8rpx;
	font-size: 22rpx;
}

.suggestion-severe {
	background: #fff2f0;
	color: #ff4d4f;
	border: 1rpx solid #ffccc7;
}

.suggestion-moderate {
	background: #fff7e6;
	color: #fa8c16;
	border: 1rpx solid #ffd591;
}

.suggestion-mild {
	background: #f6ffed;
	color: #52c41a;
	border: 1rpx solid #b7eb8f;
}

.suggestion-default {
	background: #f0f0f0;
	color: #666;
	border: 1rpx solid #d9d9d9;
}

.suggestion-icon {
	margin-right: 8rpx;
	font-size: 20rpx;
}

.suggestion-text {
	flex: 1;
	font-weight: 500;
}

.suggestion-level {
	font-size: 20rpx;
	opacity: 0.8;
}

.result-plate-number {
	display: inline-block;
	font-size: 28rpx;
	font-weight: bold;
	padding: 8rpx 16rpx;
	border-radius: 8rpx;
	font-family: "微软雅黑";
	letter-spacing: 1rpx;
	min-width: 160rpx;
	text-align: center;
	position: relative;
	transition: all 0.3s ease;
	margin-bottom: 8rpx;

	&.blue-plate {
		background: linear-gradient(135deg, #0C4FC5, #216FEF);
		color: #FFFFFF;
		border: 1px solid #0C4FC5;
		box-shadow: 0 4rpx 12rpx rgba(12, 79, 197, 0.2);
	}

	&.green-plate {
		background: linear-gradient(180deg, #6AD390 0%, #D0F1E4 100%);
		color: #000000;
		border: 1px solid #6AD390;
		box-shadow: 0 4rpx 12rpx rgba(82, 196, 26, 0.2);

		&::before {
			content: '新能源';
			position: absolute;
			top: -20rpx;
			right: -10rpx;
			background: #f6ffed;
			color: #52c41a;
			font-size: 20rpx;
			padding: 2rpx 8rpx;
			border-radius: 4rpx;
			border: 1px solid #b7eb8f;
			transform: scale(0.8);
		}
	}
}

.result-details {
	display: flex;
	flex-direction: column;
	gap: 4rpx;
}

.result-owner {
	font-size: 24rpx;
	color: #606266;
}

.result-appointments {
	font-size: 22rpx;
	color: #1890ff;
	font-weight: 500;
}

/* 加载更多按钮样式 */
.load-more-section {
	padding: 20rpx 16rpx;
	border-top: 1rpx solid #f0f0f0;
}

.load-more-btn {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 24rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 12rpx;
	transition: all 0.3s ease;
}

.load-more-btn:active {
	transform: scale(0.98);
	opacity: 0.8;
}

.load-more-text {
	font-size: 28rpx;
	color: #ffffff;
	font-weight: 600;
	margin-bottom: 6rpx;
}

.load-more-tip {
	font-size: 22rpx;
	color: rgba(255, 255, 255, 0.8);
}

.result-tip {
	font-size: 20rpx;
	color: #999;
	margin-left: 10rpx;
	font-style: italic;
}

/*  车主分组样式 */
.owner-group {
	margin-bottom: 12rpx;
}

.owner-frame {
	border: 4rpx solid #2979ff;
	border-radius: 24rpx;
	background: #fff;
	overflow: hidden;
	box-shadow: 0 4rpx 24rpx rgba(41, 121, 255, 0.1);
}

.owner-header {
	padding: 40rpx;
	background: linear-gradient(135deg, #f8fbff, #e8f4ff);
}

.owner-info {
	width: 100%;
}

.owner-name {
	font-size: 32rpx;
	font-weight: 600;
	color: #2979ff;
	margin-bottom: 16rpx;
	display: block;
}

.owner-details {
	display: flex;
	flex-wrap: wrap;
	gap: 20rpx;
	align-items: center;
}

.owner-ticket,
.owner-credit,
.owner-phone {
	font-size: 26rpx;
	color: #666;
	background: rgba(41, 121, 255, 0.1);
	padding: 8rpx 16rpx;
	border-radius: 24rpx;
	font-weight: 500;
}

.clickable-phone {
	cursor: pointer;
	transition: all 0.3s ease;
	background: linear-gradient(135deg, rgba(46, 204, 113, 0.15), rgba(39, 174, 96, 0.15));
	color: #27ae60;
	border: 1rpx solid rgba(39, 174, 96, 0.3);
}

.clickable-phone:hover {
	background: linear-gradient(135deg, rgba(46, 204, 113, 0.25), rgba(39, 174, 96, 0.25));
	transform: scale(1.05);
	border-color: rgba(39, 174, 96, 0.5);
	box-shadow: 0 2rpx 8rpx rgba(39, 174, 96, 0.2);
}

.clickable-phone:active {
	transform: scale(0.95);
}

.owner-divider {
	height: 2rpx;
	background: linear-gradient(to right, transparent, #e0e0e0, transparent);
	margin: 0 30rpx;
}

.plates-container {
	padding: 30rpx 40rpx;
	padding-top: 20rpx;
}

.plate-card {
	background: #fff;
	border: 2rpx solid #e8e8e8;
	border-radius: 16rpx;
	margin-bottom: 8rpx;
	transition: all 0.2s ease;
	cursor: pointer;
}

.plate-card:last-child {
	margin-bottom: 0;
}

.plate-card:hover {
	border-color: #2979ff;
	box-shadow: 0 4rpx 16rpx rgba(41, 121, 255, 0.15);
	transform: translateY(-2rpx);
}

.plate-card:active {
	transform: translateY(0) scale(0.98);
}

.plate-content {
	display: flex;
	align-items: center;
	padding: 24rpx 40rpx;
}

.plate-icon {
	font-size: 36rpx;
	margin-right: 24rpx;
}

.plate-number {
	font-size: 36rpx;
	font-weight: 700;
	padding: 12rpx 18rpx;
	border-radius: 12rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	letter-spacing: 2rpx;
	text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
}

.plate-number.blue-plate {
	background: linear-gradient(to bottom, #216fef, #0c4fc5);
	color: #fff;
	border: 2rpx solid #216fef;
}

.plate-number.green-plate {
	background: linear-gradient(to bottom, #d0f1e4, #6ad390);
	color: #000;
	border: 2rpx solid #6ad390;
}

.blacklist-section {
	margin-top: 20rpx;
}

.blacklist-content {
	padding: 20rpx;
}

.blacklist-switch-container {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 30rpx;
	padding: 20rpx;
	background: #f8f9fa;
	border-radius: 12rpx;
}

.blacklist-switch-container.required-field {
	border: 2rpx solid #ff4757;
	background: #fff5f5;
}

.switch-label {
	display: flex;
	flex-direction: column;
	flex: 1;
}

.label-text {
	font-size: 28rpx;
	color: #333;
	margin-bottom: 8rpx;
	font-weight: 500;
}

.label-required {
	color: #ff4757;
	font-size: 30rpx;
	font-weight: bold;
	margin-left: 8rpx;
}

.label-desc {
	font-size: 24rpx;
	color: #666;
	line-height: 1.4;
}

.switch-wrapper {
	display: flex;
	align-items: center;
}

.blacklist-switch {
	transform: scale(0.9);
}

/*  黑名单类型选择器样式 */
.blacklist-type-container {
	margin-top: 20rpx;
	padding: 20rpx;
	background: #f0f7ff;
	border: 2rpx solid #e3f2fd;
	border-radius: 12rpx;
}

.type-header {
	display: flex;
	align-items: center;
	margin-bottom: 16rpx;
}

.type-label {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
}

.type-required {
	font-size: 24rpx;
	color: #ff4757;
	margin-left: 4rpx;
}

.type-hint {
	font-size: 22rpx;
	color: #999;
	margin-left: 8rpx;
}

.picker-input {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 16rpx 20rpx;
	background: #fff;
	border: 2rpx solid #e3f2fd;
	border-radius: 8rpx;
	min-height: 80rpx;
	box-sizing: border-box;
}

.picker-text {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
}

.picker-placeholder {
	font-size: 26rpx;
	color: #999;
}

.picker-arrow {
	font-size: 24rpx;
	color: #999;
	margin-left: 16rpx;
}

.type-description {
	display: flex;
	align-items: flex-start;
	margin-top: 12rpx;
	padding: 12rpx 16rpx;
	background: rgba(33, 150, 243, 0.08);
	border-radius: 8rpx;
}

.description-icon {
	font-size: 28rpx;
	margin-right: 8rpx;
	flex-shrink: 0;
}

.description-text {
	font-size: 24rpx;
	color: #666;
	line-height: 1.5;
	flex: 1;
}

/*  黑名单时长选择器样式 */
.blacklist-duration-container {
	margin-top: 20rpx;
	padding: 20rpx;
	background: #fffbf0;
	border: 2rpx solid #fff4e5;
	border-radius: 12rpx;
}

.duration-header {
	display: flex;
	align-items: center;
	margin-bottom: 16rpx;
}

.duration-label {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
}

.duration-required {
	font-size: 24rpx;
	color: #ff4757;
	margin-left: 4rpx;
}

.duration-type-selector {
	display: flex;
	gap: 16rpx;
	margin-bottom: 16rpx;
}

.duration-type-option {
	flex: 1;
	display: flex;
	align-items: center;
	padding: 16rpx 20rpx;
	background: #fff;
	border: 2rpx solid #fff4e5;
	border-radius: 8rpx;
	cursor: pointer;
	transition: all 0.2s ease;
}

.duration-type-option.active {
	background: #fff9e6;
	border-color: #ffc107;
}

.duration-type-option:active {
	transform: scale(0.98);
}

.option-radio {
	margin-right: 12rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 40rpx;
	height: 40rpx;
}

.radio-icon {
	font-size: 32rpx;
	color: #ffc107;
	font-weight: bold;
}

.radio-icon-empty {
	font-size: 32rpx;
	color: #ccc;
}

.option-text {
	font-size: 26rpx;
	color: #333;
	font-weight: 500;
}

.duration-time-selector {
	margin-top: 16rpx;
	padding: 16rpx;
	background: #fff;
	border: 2rpx solid #fff4e5;
	border-radius: 8rpx;
}

/*  快速时间选择模板样式 */
.quick-time-templates {
	margin-bottom: 16rpx;
	padding-bottom: 16rpx;
	border-bottom: 2rpx solid #fff4e5;
}

.quick-time-templates .template-label {
	font-size: 26rpx;
	color: #666;
	margin-bottom: 12rpx;
	display: block;
}

.template-buttons-wrapper {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.template-buttons-row {
	display: flex;
	gap: 12rpx;
}

.template-btn {
	flex: 1;
	height: 56rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
	border-radius: 8rpx;
	box-shadow: 0 4rpx 8rpx rgba(255, 193, 7, 0.2);
	transition: all 0.3s ease;
}

.template-btn-short {
	background: linear-gradient(135deg, #4caf50 0%, #43a047 100%);
	box-shadow: 0 4rpx 8rpx rgba(76, 175, 80, 0.2);
}

.template-btn:active {
	transform: scale(0.95);
	box-shadow: 0 2rpx 4rpx rgba(255, 193, 7, 0.3);
}

.template-btn-short:active {
	box-shadow: 0 2rpx 4rpx rgba(76, 175, 80, 0.3);
}

.template-btn .btn-text {
	font-size: 24rpx;
	color: #fff;
	font-weight: 500;
}

.time-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 12rpx;
}

.time-item:last-child {
	margin-bottom: 0;
}

.time-label {
	font-size: 26rpx;
	color: #666;
	min-width: 140rpx;
}

.picker-input-small {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12rpx 16rpx;
	background: #f8f9fa;
	border: 1rpx solid #e9ecef;
	border-radius: 6rpx;
	min-width: 300rpx;
}

.picker-input-small text {
	font-size: 24rpx;
	color: #333;
}

.blacklist-reason-container {
	margin-top: 20rpx;
	padding: 20rpx;
	background: #fff5f5;
	border: 2rpx solid #ffebee;
	border-radius: 12rpx;
}

.reason-header {
	display: flex;
	align-items: center;
	margin-bottom: 16rpx;
}

.reason-label {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
}

.reason-required {
	font-size: 24rpx;
	color: #ff4757;
	margin-left: 4rpx;
}

.reason-textarea {
	width: 100%;
	min-height: 120rpx;
	padding: 16rpx;
	background: #fff;
	border: 2rpx solid #ffebee;
	border-radius: 8rpx;
	font-size: 26rpx;
	color: #333;
	line-height: 1.4;
	box-sizing: border-box;
}

.reason-textarea:focus {
	border-color: #ff4757;
	background: #fff;
}

.reason-templates {
	margin-top: 20rpx;
	transition: all 0.3s ease;
}

.templates-expanded {
	margin-bottom: 20rpx;
}

.template-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 12rpx 16rpx;
	background: #f8f9fa;
	border: 1rpx solid #e9ecef;
	border-radius: 8rpx;
	cursor: pointer;
	transition: all 0.2s ease;
}

.template-header:active {
	background: #e9ecef;
	transform: scale(0.98);
}

.template-label {
	font-size: 24rpx;
	color: #666;
}

.template-toggle {
	font-size: 22rpx;
	color: #007aff;
	font-weight: 500;
}

.template-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
	margin-top: 12rpx;
	animation: slideDown 0.3s ease;
}

@keyframes slideDown {
	from {
		opacity: 0;
		transform: translateY(-10rpx);
	}

	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.template-tag {
	background: #fff;
	border: 2rpx solid #ffebee;
	border-radius: 20rpx;
	padding: 8rpx 16rpx;
	transition: all 0.2s ease;
}

.template-tag:active {
	background: #ffebee;
	border-color: #ff4757;
	transform: scale(0.95);
}

.template-text {
	font-size: 24rpx;
	color: #ff4757;
}



/* ========== API测试工具样式 ========== */
.floating-debug-btn {
	position: fixed;
	bottom: 120rpx;
	right: 30rpx;
	width: 120rpx;
	height: 120rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 60rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 20rpx rgba(102, 126, 234, 0.4);
	z-index: 999;
	transition: all 0.3s ease;
}

.floating-debug-btn:active {
	transform: scale(0.95);
	box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.6);
}

.debug-icon {
	font-size: 40rpx;
	margin-bottom: 4rpx;
}

.debug-label {
	font-size: 20rpx;
	color: white;
	font-weight: bold;
	text-align: center;
}

.api-test-modal {
	background: white;
	border-radius: 20rpx 20rpx 0 0;
	max-height: 80vh;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.modal-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx 40rpx;
	border-bottom: 1px solid #eee;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: white;
}

.modal-title {
	font-size: 32rpx;
	font-weight: bold;
}

.close-btn {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 30rpx;
}

.close-icon {
	font-size: 28rpx;
	color: white;
}

.test-input-section {
	margin-bottom: 30rpx;
	padding: 0 40rpx;
}

.input-row {
	display: flex;
	align-items: center;
	margin-bottom: 20rpx;
}

.input-label {
	width: 200rpx;
	font-size: 28rpx;
	color: #333;
}

.test-input {
	flex: 1;
	height: 70rpx;
	padding: 0 20rpx;
	border: 2rpx solid #e0e0e0;
	border-radius: 8rpx;
	font-size: 26rpx;
}

.test-buttons {
	display: flex;
	flex-wrap: wrap;
	gap: 20rpx;
	margin-bottom: 30rpx;
	padding: 0 40rpx;
}

.api-test-btn {
	flex: 1;
	min-width: 200rpx;
	height: 70rpx;
	border: 1rpx solid #e0e0e0;
	border-radius: 8rpx;
	background: white;
	font-size: 24rpx;
	color: #666;
}

.api-test-btn.primary {
	background: #2979ff;
	color: white;
	border-color: #2979ff;
}

.api-test-btn.secondary {
	background: #FF9500;
	color: white;
	border-color: #FF9500;
}

/* 自定义车牌键盘样式 */
.custom-plate-keyboard {
	margin-top: 20rpx;
	background: #f8f8f8;
	border-radius: 12rpx;
	padding: 20rpx;
	border: 1rpx solid #e0e0e0;
}

/* 车牌显示区域 */
.plate-display {
	border-radius: 8rpx;
	padding: 20rpx;
	margin-bottom: 36rpx;
	background: white;
	border: 2rpx solid white;
}

.plate-chars {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 8rpx;
}

.plate-char-box {
	width: 60rpx;
	height: 80rpx;
	background: transparent;
	border: none;
	border-radius: 6rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 36rpx;
	font-weight: bold;
	transition: all 0.2s ease;
	position: relative;
	color: #333;
}

.plate-char-box.active {
	background: transparent;
	border: none;
	transform: scale(1.05);
}

.plate-char-box.active::after {
	content: '';
	position: absolute;
	bottom: -3rpx;
	left: 50%;
	transform: translateX(-50%);
	width: 30rpx;
	height: 3rpx;
	background: #333;
	border-radius: 2rpx;
	animation: blink 1s infinite;
}

@keyframes blink {

	0%,
	50% {
		opacity: 1;
	}

	51%,
	100% {
		opacity: 0;
	}
}

.plate-char-text {
	color: inherit;
	font-family: 'DIN Alternate', 'DIN', 'Arial Black', 'Alibaba PuHuiTi', 'Microsoft YaHei', sans-serif;
	letter-spacing: 1rpx;
}

/* 键盘区域 */
.keyboard-section {
	background: white;
	border-radius: 12rpx;
	padding: 15rpx 20rpx;
	margin-bottom: 15rpx;
	border: 1rpx solid #e0e0e0;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.keyboard-actions {
	display: flex;
	gap: 20rpx;
}

.keyboard-action {
	padding: 10rpx 20rpx;
	background: #f5f5f5;
	border-radius: 20rpx;
	font-size: 26rpx;
	color: #666;
	transition: all 0.2s ease;
	border: 1rpx solid #e0e0e0;
}

.keyboard-action:active {
	background: #e0e0e0;
	transform: scale(0.95);
}

/* 省份键盘网格 */
.province-grid {
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	gap: 12rpx;
	padding: 5rpx;
}

.province-key {
	height: 85rpx;
	background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
	border: none;
	color: white;
	border-radius: 12rpx;
	font-size: 56rpx;
	font-weight: bold;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 2rpx 6rpx rgba(33, 150, 243, 0.4);
}

.province-key:active {
	background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
	transform: scale(0.95);
	box-shadow: 0 1rpx 3rpx rgba(33, 150, 243, 0.6);
}

/* ABC按钮特殊样式 */
.abc-key {
	grid-column: span 2;
	background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%) !important;
	border: none !important;
	color: white !important;
	font-size: 38rpx !important;
	font-weight: 600 !important;
	box-shadow: 0 2rpx 6rpx rgba(33, 150, 243, 0.4) !important;
	margin-left: 35rpx;
}

.abc-key:active {
	background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
	box-shadow: 0 1rpx 3rpx rgba(33, 150, 243, 0.6) !important;
}

/* 省份切换按钮特殊样式 */
.province-switch {
	background: #155cd6 !important;
	border: none !important;
	color: white !important;
	font-size: 36rpx !important;
	font-weight: 600 !important;
	box-shadow: 0 2rpx 6rpx rgba(33, 150, 243, 0.4) !important;
}

.province-switch:active {
	background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
	box-shadow: 0 1rpx 3rpx rgba(33, 150, 243, 0.6) !important;
}

/* 键盘行和按键 */
.keyboard-row {
	display: flex;
	justify-content: center;
	gap: 10rpx;
	margin-bottom: 12rpx;
}

.keyboard-rows .keyboard-row:last-child {
	margin-bottom: 0;
}

.keyboard-key {
	min-width: 60rpx;
	height: 85rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 10rpx;
	font-size: 36rpx;
	font-weight: bold;
	transition: all 0.2s ease;
	position: relative;
	background: white;
	border: 1rpx solid #e5e5e5;
	color: #333;
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

/* 数字行样式 */
.number-row .keyboard-key {
	flex: 1;
	background: white;
	border: 1rpx solid #e5e5e5;
	color: #333;
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.number-row .keyboard-key:active {
	background: #f5f5f5;
	transform: scale(0.95);
	box-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.15);
}

/* 字母行样式 */
.letter-row .keyboard-key {
	flex: 1;
	background: white;
	border: 1rpx solid #e5e5e5;
	color: #333;
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.letter-row .keyboard-key:active {
	background: #f5f5f5;
	transform: scale(0.95);
	box-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.15);
}

/* 特殊功能键样式 */
.special-key {
	background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%) !important;
	border: none !important;
	color: white !important;
	font-size: 32rpx !important;
	min-width: 90rpx !important;
	box-shadow: 0 2rpx 6rpx rgba(33, 150, 243, 0.4) !important;
}

.special-key:active {
	background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
	box-shadow: 0 1rpx 3rpx rgba(33, 150, 243, 0.6) !important;
}

/* 退格按钮样式 */
.backspace-key {
	background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%) !important;
	border: none !important;
	color: white !important;
	font-size: 28rpx !important;
	min-width: 100rpx !important;
	font-weight: 600 !important;
	box-shadow: 0 2rpx 6rpx rgba(255, 107, 107, 0.4) !important;
}

.backspace-key:active {
	background: linear-gradient(135deg, #ff5252 0%, #e53935 100%) !important;
	transform: scale(0.95);
	box-shadow: 0 1rpx 3rpx rgba(255, 107, 107, 0.6) !important;
}

/* 禁用状态 */
.keyboard-key.disabled {
	background: #f0f0f0 !important;
	color: #ccc !important;
	border-color: #eee !important;
	transform: none !important;
}

/* 退格按钮禁用状态 */
.backspace-key.disabled {
	background: #f5f5f5 !important;
	color: #ccc !important;
	border-color: #e0e0e0 !important;
	opacity: 0.5;
}

.key-text {
	color: inherit;
	font-size: 28rpx;
	font-family: 'Microsoft YaHei', sans-serif;
}

/* 键盘底部 */
.keyboard-footer {
	background: white;
	border-radius: 8rpx;
	padding: 20rpx;
	border: 1rpx solid #e0e0e0;
}

.footer-actions {
	display: flex;
	gap: 20rpx;
}

.action-btn {
	flex: 1;
	height: 90rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 8rpx;
	font-size: 36rpx;
	font-weight: bold;
	transition: all 0.2s ease;
	background: #f8f8f8;
	border: 2rpx solid #ddd;
	color: #333;
}

.action-btn.primary {
	background: #333;
	color: white;
	border-color: #333;
}

.action-btn.abc-btn {
	background: #007aff;
	color: white;
	border-color: #007aff;
}

.action-btn:active {
	transform: scale(0.95);
}

.action-btn:not(.primary):active {
	background: #e0e0e0;
}

.action-btn.primary:active {
	background: #555;
}

.action-btn.abc-btn:active {
	background: #0056d6;
}

/* 新能源车牌提示样式 */
.new-energy-tip {
	grid-column: 1 / -1;
	text-align: center;
	margin-top: 20rpx;
	padding: 15rpx;
	background: linear-gradient(135deg, #e8f5e8, #d4edda);
	border-radius: 8rpx;
	border: 1rpx solid #c3e6cb;
}

.tip-text {
	font-size: 24rpx;
	color: #155724;
	font-weight: 500;
}

.action-text {
	color: inherit;
	font-family: 'Microsoft YaHei', sans-serif;
}

/* 测试建议样式 */
.test-suggestions {
	margin-top: 20px;
	padding: 15px;
	background: #f8f9fa;
	border-radius: 8px;
	border-left: 4px solid #007AFF;
}

.suggestions-title {
	font-size: 14px;
	font-weight: bold;
	color: #333;
	margin-bottom: 10px;
	display: block;
}

.suggestion-buttons {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	margin-bottom: 10px;
}

.suggestion-btn {
	padding: 6px 12px;
	background: #e3f2fd;
	border: 1px solid #2196F3;
	border-radius: 16px;
	font-size: 12px;
	color: #2196F3;
	cursor: pointer;
}

.suggestion-btn:active {
	background: #2196F3;
	color: white;
}

.suggestions-note {
	font-size: 12px;
	color: #666;
	line-height: 1.4;
	display: block;
}

.test-results {
	flex: 1;
	display: flex;
	flex-direction: column;
	padding: 0 40rpx 40rpx 40rpx;
}

.results-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 20rpx;
}

.results-scroll {
	flex: 1;
	border: 1rpx solid #e0e0e0;
	border-radius: 8rpx;
	padding: 20rpx;
	background: #f8f9fa;
}

.result-item {
	margin-bottom: 20rpx;
	padding: 15rpx;
	background: white;
	border-radius: 8rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.result-item:last-child {
	margin-bottom: 0;
}

.result-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 10rpx;
}

.result-time {
	font-size: 22rpx;
	color: #999;
}

.result-api {
	font-size: 22rpx;
	color: #666;
	background: #f0f0f0;
	padding: 4rpx 8rpx;
	border-radius: 4rpx;
}

.result-status {
	font-size: 24rpx;
}

.result-status.success {
	color: #4caf50;
}

.result-status.error {
	color: #f44336;
}

.result-message {
	font-size: 24rpx;
	color: #333;
	line-height: 1.4;
	margin-bottom: 10rpx;
}

.result-data {
	background: #f8f9fa;
	padding: 10rpx;
	border-radius: 4rpx;
	border-left: 3rpx solid #2979ff;
}

.data-text {
	font-size: 22rpx;
	color: #666;
	line-height: 1.3;
	word-break: break-all;
}


/* ========== 用户信息下拉窗口样式 ========== */
.user-info-dropdown {
	position: absolute;
	top: 100%;
	right: 0;
	width: 320rpx;
	z-index: 9999;
	background: #ffffff;
	border-radius: 20rpx;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
	overflow: hidden;
	animation: slideDown 0.3s ease-out;
	margin-top: 20rpx;
}

@keyframes slideDown {
	from {
		opacity: 0;
		transform: translateY(-10rpx);
	}

	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.dropdown-content {
	background: #ffffff;
}

.user-info-header {
	display: flex;
	align-items: center;
	padding: 30rpx 40rpx;
	background: #005ec0;
}

.user-avatar-large {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.2);
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 24rpx;
	border: 3rpx solid rgba(255, 255, 255, 0.3);
}

.user-avatar-text-large {
	font-size: 32rpx;
	color: #ffffff;
	font-weight: bold;
}

.user-details-large {
	flex: 1;
}

.user-name-large {
	font-size: 32rpx;
	color: #ffffff;
	font-weight: bold;
	margin-bottom: 8rpx;
	display: block;
}

.user-role {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.8);
	margin-bottom: 4rpx;
	display: block;
}

.user-workplace {
	font-size: 22rpx;
	color: rgba(255, 255, 255, 0.7);
	display: block;
}

.dropdown-divider {
	height: 1rpx;
	background: #f0f0f0;
}

.dropdown-actions {
	padding: 20rpx 0;
}

.dropdown-action-item {
	display: flex;
	align-items: center;
	padding: 20rpx 40rpx;
	transition: all 0.2s ease;
	cursor: pointer;
}

.dropdown-action-item:hover {
	background: #f8f9fa;
}

.dropdown-action-item:active {
	background: #e9ecef;
	transform: scale(0.98);
}

.dropdown-action-item.logout-item {
	border-top: 1rpx solid #f0f0f0;
}

.dropdown-action-item.logout-item:hover {
	background: #fff5f5;
}

.dropdown-action-item.logout-item .action-text {
	color: #dc3545;
}

.action-icon {
	font-size: 32rpx;
	margin-right: 24rpx;
	width: 40rpx;
	text-align: center;
}

.action-text {
	flex: 1;
	font-size: 28rpx;
	color: #333;
}

.action-arrow {
	font-size: 24rpx;
	color: #999;
}

/* ========== 弹出式车牌键盘样式 ========== */
.keyboard-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	z-index: 999;
	display: flex;
	align-items: flex-end;
	animation: fadeIn 0.3s ease;
}

.custom-plate-keyboard {
	width: 100%;
	background: #ffffff;
	border-radius: 20rpx 20rpx 0 0;
	padding: 0 20rpx 40rpx;
	padding-bottom: calc(40rpx + env(safe-area-inset-bottom, 0px) + 120rpx);
	max-height: 80vh;
	animation: slideUp 0.3s ease;
}

/* 车牌显示区域 */
.plate-display {
	margin: 30rpx 0 36rpx;
	padding: 20rpx;
	border-radius: 12rpx;
	border: 3rpx solid white;
	position: relative;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.plate-chars {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
}

.plate-char-box {
	width: 60rpx;
	height: 80rpx;
	border: none;
	border-radius: 8rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: transparent;
	transition: all 0.3s ease;
	position: relative;
}

.plate-char-box.active {
	border: none;
	background: transparent;
	transform: scale(1.05);
}

.plate-char-box.active::after {
	content: '';
	position: absolute;
	bottom: -10rpx;
	left: 50%;
	transform: translateX(-50%);
	width: 0;
	height: 0;
	border-left: 10rpx solid transparent;
	border-right: 10rpx solid transparent;
	border-bottom: 10rpx solid #ff6b6b;
}

.plate-char-text {
	font-size: 38rpx;
	font-weight: 800;
	text-align: center;
	font-family: 'DIN Alternate', 'DIN', 'Arial Black', 'Alibaba PuHuiTi', 'Microsoft YaHei', sans-serif;
	letter-spacing: 1rpx;
}

/* 键盘部分 */
.keyboard-section {
	background: #f8f9fa;
	border-radius: 16rpx;
	padding: 20rpx;
	margin-bottom: 20rpx;
}

.keyboard-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
	padding-bottom: 15rpx;
	border-bottom: 1rpx solid #e9ecef;
}

.keyboard-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
}

.keyboard-actions {
	display: flex;
	gap: 20rpx;
}

.keyboard-action {
	padding: 8rpx 16rpx;
	background: #007aff;
	color: #fff;
	border-radius: 8rpx;
	font-size: 24rpx;
}

/* 省份键盘 */
.province-grid {
	display: grid;
	grid-template-columns: repeat(6, 1fr);
	gap: 12rpx;
}

.province-key {
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #ffffff;
	border: 1rpx solid #dee2e6;
	border-radius: 12rpx;
	font-size: 38rpx;
	font-weight: 500;
	color: #333;
	transition: all 0.2s ease;
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
}

.province-key:active {
	background: #007aff;
	color: #fff;
	transform: scale(0.95);
}

/* 数字字母键盘 */
.keyboard-rows {
	display: flex;
	flex-direction: column;
	gap: 15rpx;
	padding: 15rpx;
}

.keyboard-row {
	display: flex;
	justify-content: center;
	gap: 12rpx;
}

.keyboard-key {
	flex: 1;
	height: 90rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #f8f8f8;
	border: 2rpx solid #ddd;
	border-radius: 8rpx;
	font-size: 38rpx;
	font-weight: bold;
	color: #333;
	transition: all 0.2s ease;
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
	max-width: 70rpx;
}

.keyboard-key:active {
	background: #007aff;
	color: #fff;
	transform: scale(0.95);
}

.keyboard-key.disabled {
	background: #f8f9fa;
	color: #adb5bd;
	border-color: #e9ecef;
}

.keyboard-key.disabled:active {
	background: #f8f9fa;
	color: #adb5bd;
	transform: none;
}

.key-text {
	font-size: 28rpx;
	font-weight: 500;
}

/* 键盘底部操作 */
.keyboard-footer {
	padding-top: 20rpx;
	border-top: 1rpx solid #e9ecef;
}

.footer-actions {
	display: flex;
	gap: 16rpx;
}

.action-btn {
	flex: 1;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #6c757d;
	color: #fff;
	border-radius: 12rpx;
	font-size: 28rpx;
	font-weight: 500;
	transition: all 0.2s ease;
}

.action-btn.primary {
	background: #28a745;
}

.action-btn:active {
	transform: scale(0.95);
	opacity: 0.8;
}

.action-text {
	font-size: 28rpx;
	font-weight: 500;
}

/* 动画效果 */
@keyframes fadeIn {
	from {
		opacity: 0;
	}

	to {
		opacity: 1;
	}
}

@keyframes slideUp {
	from {
		transform: translateY(100%);
	}

	to {
		transform: translateY(0);
	}
}

/* 车牌显示输入区域样式 */
.plate-display-input {
	padding: 20rpx;
	background: #ffffff;
	border-radius: 16rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

/*  违规记录列表样式 */
.violation-records-section {
	margin-top: 24rpx;
	background: linear-gradient(135deg, #fff5f5 0%, #fef2f2 100%);
	border-radius: 16rpx;
	padding: 20rpx;
	border: 1rpx solid #ffe4e6;
}

.violation-records-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
	border-radius: 12rpx;
	padding: 16rpx 20rpx;
	margin-bottom: 16rpx;
	box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.3);
}

.records-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #fff;
}

.records-count {
	font-size: 26rpx;
	color: #fff;
	background: rgba(255, 255, 255, 0.2);
	padding: 6rpx 12rpx;
	border-radius: 16rpx;
	border: 1rpx solid rgba(255, 255, 255, 0.3);
}

.expand-toggle {
	display: flex;
	align-items: center;
	gap: 6rpx;
	cursor: pointer;
	padding: 4rpx 8rpx;
	border-radius: 8rpx;
	transition: all 0.3s ease;
}

.expand-toggle:active {
	background: rgba(255, 255, 255, 0.1);
}

.toggle-text {
	font-size: 24rpx;
	color: #fff;
	opacity: 0.9;
}

.violation-records-list {
	margin-top: 16rpx;
}

.violation-record-item {
	background: #ffffff;
	border-radius: 16rpx;
	padding: 20rpx;
	margin-bottom: 12rpx;
	border: 1rpx solid #ffebee;
	box-shadow: 0 2rpx 8rpx rgba(255, 107, 107, 0.1);
	position: relative;
	overflow: hidden;
}

.violation-record-item::before {
	content: '';
	position: absolute;
	left: 0;
	top: 0;
	bottom: 0;
	width: 4rpx;
	background: linear-gradient(180deg, #ff6b6b 0%, #ff5252 100%);
}

.record-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.record-date {
	background: #f8f9fa;
	padding: 8rpx 16rpx;
	border-radius: 20rpx;
}

.date-text {
	font-size: 26rpx;
	color: #666;
}

.record-status {
	padding: 8rpx 16rpx;
	border-radius: 20rpx;
	font-size: 24rpx;
	color: #fff;
}

.status-completed {
	background: #52c41a;
}

.status-pending {
	background: #faad14;
}

.status-unknown {
	background: #d9d9d9;
	color: #666;
}

.record-content {
	padding-top: 16rpx;
	margin-left: 8rpx;
}

.record-info-row {
	display: flex;
	align-items: flex-start;
	margin-bottom: 16rpx;
	padding: 10rpx 12rpx;
	background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
	border-radius: 8rpx;
	border-left: 3rpx solid #ff6b6b;
	transition: all 0.3s ease;
}

.record-info-row:hover {
	background: linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%);
}

.record-info-row:last-child {
	margin-bottom: 0;
}

.record-info-row .info-icon {
	font-size: 24rpx;
	width: 28rpx;
	text-align: center;
	margin-top: 2rpx;
	margin-right: 8rpx;
	flex-shrink: 0;
}

.record-info-row .info-content {
	flex: 1;
	display: flex;
	flex-wrap: nowrap;
	align-items: flex-start;
}

.record-info-row .info-label {
	font-size: 26rpx;
	color: #666;
	min-width: 180rpx;
	flex-shrink: 0;
	margin-right: 8rpx;
	font-weight: 500;
}

.record-info-row .info-value {
	font-size: 28rpx;
	color: #333;
	flex: 1;
	word-wrap: break-word;
	line-height: 1.4;
}

/* 无违规记录提示样式 */
.no-violation-tip {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	padding: 24rpx;
	margin-top: 20rpx;
	background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
	border-radius: 16rpx;
	border: 1rpx solid #bbf7d0;
	box-shadow: 0 4rpx 12rpx rgba(34, 197, 94, 0.1);
}

.no-violation-tip .tip-icon {
	font-size: 32rpx;
	filter: drop-shadow(0 2rpx 4rpx rgba(34, 197, 94, 0.3));
}

.no-violation-tip .tip-text {
	font-size: 28rpx;
	color: #16a34a;
	font-weight: 500;
}

.record-info-row.time-row {
	margin-top: 16rpx;
	/* 与上方内容拉开一点距离 */
}

/* 违规类型特殊样式 */
.violation-type-row {
	background: linear-gradient(135deg, #fff5f5 0%, #fef2f2 100%) !important;
	border-left: 3rpx solid #ef4444 !important;
}

.violation-type-icon {
	font-size: 28rpx !important;
	filter: drop-shadow(0 2rpx 4rpx rgba(239, 68, 68, 0.3));
}

.violation-type-tag {
	display: inline-flex;
	align-items: center;
	padding: 6rpx 12rpx;
	border-radius: 16rpx;
	font-weight: 600;
	font-size: 26rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

/* 位置值标签样式 */
.location-tag {
	display: inline-flex;
	align-items: center;
	max-width: 100%;
	padding: 6rpx 12rpx;
	background: linear-gradient(135deg, #e9fdf5 0%, #d5fbef 100%);
	color: #047857;
	border: 1rpx solid #34d399;
	border-radius: 999rpx;
	box-shadow: 0 2rpx 6rpx rgba(5, 150, 105, 0.08);
}

.location-text {
	font-size: 26rpx;
	font-weight: 500;
	color: #065f46;
}

/* 时间徽章样式 */
.time-badge {
	display: inline-flex;
	align-items: center;
	padding: 6rpx 12rpx;
	background: linear-gradient(135deg, #f3f0ff 0%, #ebe4ff 100%);
	border: 1rpx solid #c4b5fd;
	border-radius: 999rpx;
	box-shadow: 0 2rpx 6rpx rgba(124, 58, 237, 0.08);
}

.time-text {
	font-size: 26rpx;
	font-weight: 600;
	color: #6d28d9;
}

/* 顶部内联信息（类型/位置） */
.inline-meta {
	margin-left: 12rpx;
	font-size: 24rpx;
	color: #666;
}

.inline-meta.meta-type {
	color: #d97706;
}

.inline-meta.meta-location {
	color: #047857;
}

/* 违规类型标签颜色 */
.type-overtime {
	background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
	color: #d97706;
	border: 1rpx solid #f59e0b;
}

.type-occupy {
	background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
	color: #dc2626;
	border: 1rpx solid #ef4444;
}

.type-illegal {
	background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
	color: #b91c1c;
	border: 1rpx solid #dc2626;
}

.type-reverse {
	background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
	color: #3730a3;
	border: 1rpx solid #4f46e5;
}

.type-serious {
	background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
	color: #f9fafb;
	border: 1rpx solid #6b7280;
}

.type-default {
	background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
	color: #374151;
	border: 1rpx solid #9ca3af;
}

.type-unknown {
	background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
	color: #6b7280;
	border: 1rpx solid #d1d5db;
}

/* 违规描述特殊样式 */
.description-row {
	background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
	border-left: 3rpx solid #0ea5e9 !important;
}

.description-content {
	background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
	padding: 12rpx 16rpx;
	border-radius: 12rpx;
	border: 1rpx solid #bae6fd;
	margin-top: 4rpx;
}

.description-text {
	font-size: 26rpx;
	color: #0c4a6e;
	line-height: 1.5;
	word-wrap: break-word;
}

/* 位置和时间值的特殊样式 */
.location-value {
	color: #059669 !important;
	font-weight: 500;
}

.time-value {
	color: #7c3aed !important;
	font-weight: 500;
}

/*  下拉选择器样式 */
.dropdown-icon {
	position: absolute;
	right: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 36rpx;
	height: 36rpx;
	cursor: pointer;
}

.location-dropdown {
	position: absolute;
	top: 100%;
	left: 20rpx;
	right: 20rpx;
	background: #ffffff;
	border: 2rpx solid #e4e7ed;
	border-radius: 12rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
	max-height: 400rpx;
	overflow-y: auto;
	z-index: 100;
	margin-top: 8rpx;
}

.dropdown-item {
	padding: 24rpx 32rpx;
	font-size: 30rpx;
	color: #333;
	border-bottom: 1rpx solid #f0f0f0;
	transition: background 0.3s;
}

.dropdown-item:last-child {
	border-bottom: none;
}

.dropdown-item:active {
	background: #f8f9fa;
}

/* 访客预约信息样式 */
.visitor-reservation-section {
	margin-top: 24rpx;
	background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
	border-radius: 16rpx;
	padding: 20rpx;
	border: 1rpx solid #bae6fd;
	box-shadow: 0 4rpx 12rpx rgba(14, 165, 233, 0.1);
}

.visitor-reservation-section .section-title {
	display: flex;
	align-items: center;
	gap: 12rpx;
	background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
	border-radius: 12rpx;
	padding: 16rpx 20rpx;
	margin-bottom: 16rpx;
	box-shadow: 0 4rpx 12rpx rgba(14, 165, 233, 0.3);
}

.visitor-reservation-section .title-icon {
	font-size: 28rpx;
	filter: drop-shadow(0 2rpx 4rpx rgba(255, 255, 255, 0.3));
}

.visitor-reservation-section .title-text {
	font-size: 30rpx;
	font-weight: 600;
	color: #fff;
}

.visitor-reservation-card {
	background: #ffffff;
	border-radius: 16rpx;
	padding: 20rpx;
	margin-bottom: 12rpx;
	border: 1rpx solid #e0f2fe;
	box-shadow: 0 2rpx 8rpx rgba(14, 165, 233, 0.1);
	position: relative;
	overflow: hidden;
}

.visitor-reservation-card:last-child {
	margin-bottom: 0;
}

.visitor-reservation-card::before {
	content: '';
	position: absolute;
	left: 0;
	top: 0;
	bottom: 0;
	width: 4rpx;
	background: linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%);
}

.visitor-detail-row {
	display: flex;
	align-items: flex-start;
	margin-bottom: 16rpx;
	padding: 10rpx 12rpx;
	background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
	border-radius: 8rpx;
	border-left: 3rpx solid #0ea5e9;
	transition: all 0.3s ease;
}

.visitor-detail-row:last-child {
	margin-bottom: 0;
}

.visitor-detail-row .visitor-icon {
	font-size: 24rpx;
	width: 28rpx;
	text-align: center;
	margin-top: 2rpx;
	margin-right: 8rpx;
	flex-shrink: 0;
}

.visitor-detail-row .visitor-label {
	font-size: 26rpx;
	color: #666;
	min-width: 160rpx;
	flex-shrink: 0;
	margin-right: 8rpx;
	font-weight: 500;
}

.visitor-detail-row .visitor-value {
	font-size: 28rpx;
	color: #333;
	flex: 1;
	word-wrap: break-word;
	line-height: 1.4;
}

.visitor-detail-row .visitor-value.visitor-type {
	display: inline-flex;
	align-items: center;
	padding: 6rpx 12rpx;
	background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
	color: #1e40af;
	border: 1rpx solid #60a5fa;
	border-radius: 16rpx;
	font-weight: 600;
	box-shadow: 0 2rpx 6rpx rgba(37, 99, 235, 0.1);
}

.visitor-detail-row .visitor-value.visitor-time {
	color: #0c4a6e;
	font-weight: 600;
	font-family: 'Courier New', monospace;
}

/* 访客标签样式 */
.visitor-tag {
	background: linear-gradient(135deg, #0ea5e9, #0284c7);
	color: white;
	box-shadow: 0 2rpx 4rpx rgba(14, 165, 233, 0.3);
}
</style>