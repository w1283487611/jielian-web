<template>
  <view class="detail-container">
    <view class="coach-header">
      <view class="coach-info">
        <image class="avatar" :src="handleAvatar(coachInfo.avatar)" mode="aspectFill"></image>
        <view class="info-right">
          <view class="name">{{ coachInfo.name }} 教练</view>
          <view class="rating">⭐ {{ coachInfo.rating }} · 教龄 {{ coachInfo.teachingYears }} 年</view>
        </view>
      </view>
    </view>

    <view class="date-section base-box">
      <scroll-view scroll-x class="date-scroll" :show-scrollbar="false">
        <view 
          v-for="(dateItem, index) in dateList" 
          :key="index"
          class="date-item"
          :class="{ 'active': selectedDate === dateItem.fullDate }"
          @click="selectDate(dateItem.fullDate)"
        >
          <text class="week">{{ dateItem.weekLabel }}</text>
          <text class="day">{{ dateItem.dayLabel }}</text>
        </view>
      </scroll-view>
    </view>

    <view class="scroll-content">
      <view class="subject-section base-box">
        <view class="section-title">选择练车内容</view>
        <view class="tag-group">
          <view 
            class="tag-item" 
            v-for="sub in subjectList" 
            :key="sub.id"
            :class="{ 'active': selectedSubjectId === sub.id }"
            @click="selectSubject(sub.id)"
          >{{ sub.name }}</view>
        </view>
        
        <view class="sub-item-group" v-if="itemList.length > 0">
          <view 
            class="sub-tag" 
            v-for="item in itemList" 
            :key="item.id"
            :class="{ 'active': selectedItemId === item.id }"
            @click="selectedItemId = item.id"
          >{{ item.name }}</view>
        </view>
      </view>

      <view class="session-section base-box">
        <view class="section-title">
          <text>选择时段</text>
          <text class="sub-tip">（可多选）</text>
        </view>
        
        <view class="session-grid" v-if="sessionList.length > 0">
          <view 
            class="session-item" 
            v-for="session in sessionList" 
            :key="session.id"
            :class="{ 
              'full': session.status === 'full', 
              'selected': isSessionSelected(session.id) 
            }"
            @click="toggleSession(session)"
          >
            <view class="time">{{ session.startTime }} - {{ session.endTime }}</view>
            <view class="status-text" v-if="session.status === 'full'">已满</view>
            <view class="status-text" v-else>余 {{ session.availableCount }} 人</view>
            
            <view class="check-icon" v-if="isSessionSelected(session.id)">
              <text class="iconfont icon-check"></text>
            </view>
          </view>
        </view>

        <view class="empty-state" v-else>
          <image class="empty-img" src="/static/assets/images/empty-calendar.png" mode="aspectFit"></image>
          <text class="empty-text">教练这一天休息或暂未排班哦</text>
        </view>
      </view>
    </view>

    <view class="bottom-spacer"></view>

    <view class="fixed-bottom-bar">
      <view class="summary-info">
        <view class="selected-count">
          已选 <text class="highlight">{{ selectedSessions.length }}</text> 个时段
        </view>
        <view class="cost-info">
          <text v-if="coachInfo.price">课时费：<text class="price">￥{{ totalCost }}</text></text>
          <text v-else>扣除套餐：<text class="price">{{ selectedSessions.length }} 学时</text></text>
        </view>
      </view>
      <button 
        class="submit-btn" 
        :class="{ 'disabled': selectedSessions.length === 0 || !selectedSubjectId }"
        @click="submitAppointment"
      >
        确认预约
      </button>
    </view>

  </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { handleAvatar } from '@/utils/common';

// --- 接收上个页面传来的参数 ---
const queryParams = reactive({
  coachId: null,
  date: ''
});

// --- Mock 状态数据 ---
const coachInfo = reactive({
  id: null,
  name: '张教练',
  avatar: '',
  rating: 4.9,
  teachingYears: 8,
  price: 0 // 如果是散客约私教，这里会有金额(如 150)；驾校学员则是 0
});

const dateList = ref([]);
const selectedDate = ref('');

// 练车内容
const subjectList = ref([
  { id: 2, name: '科目二' },
  { id: 3, name: '科目三' }
]);
const selectedSubjectId = ref(null);

const itemList = ref([]);
const selectedItemId = ref(null);

// 科目二的项目联动 Mock
const mockItems = {
  2: [
    { id: 201, name: '倒车入库' }, { id: 202, name: '侧方停车' }, 
    { id: 203, name: '坡道定点' }, { id: 204, name: '曲线行驶' }, { id: 205, name: '直角转弯' }
  ],
  3: [
    { id: 301, name: '上车准备' }, { id: 302, name: '直线行驶' }, { id: 303, name: '靠边停车' }
  ]
};

// 时段排班列表
const sessionList = ref([]);

// 用户选中的时段 (支持选多节课)
const selectedSessions = ref([]);

// --- 计算属性 ---
// 计算总价 (针对收费私教)
const totalCost = computed(() => {
  return selectedSessions.value.length * (coachInfo.price || 0);
});

// 判断某个时段是否被选中
const isSessionSelected = (sessionId) => {
  return selectedSessions.value.some(s => s.id === sessionId);
};

// --- 初始化与加载逻辑 ---
onLoad((options) => {
  if (options.coachId && options.date) {
    queryParams.coachId = Number(options.coachId);
    queryParams.date = options.date;
    selectedDate.value = options.date;
    
    generateDateList();
    fetchCoachDetail();
    fetchDailySessions();
  }
});

// 1. 生成快捷日期轴 (7天)
const generateDateList = () => {
  const weeks = ['日', '一', '二', '三', '四', '五', '六'];
  const list = [];
  // 为了UX，我们把传进来的日期作为起点（或者今天作为起点）
  const startObj = new Date(); 
  
  for (let i = 0; i < 7; i++) {
    const targetDate = new Date(startObj);
    targetDate.setDate(startObj.getDate() + i);
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const fullDate = `${targetDate.getFullYear()}-${month}-${day}`;
    
    let weekLabel = '周' + weeks[targetDate.getDay()];
    if (i === 0) weekLabel = '今天';
    if (i === 1) weekLabel = '明天';
    
    list.push({ fullDate, dayLabel: `${month}-${day}`, weekLabel });
  }
  dateList.value = list;
};

// 2. Mock 获取教练简要信息
const fetchCoachDetail = () => {
  // TODO: 后端根据 queryParams.coachId 获取真实数据
  coachInfo.id = queryParams.coachId;
};

// 3. Mock 获取某一天的排班时段
const fetchDailySessions = () => {
  // 切换日期时，清空之前选中的时段
  selectedSessions.value = [];
  
  // TODO: 调用后端接口查询排班
  uni.showLoading({ title: '加载时段...' });
  setTimeout(() => {
    // 模拟数据：上午两节，下午两节
    sessionList.value = [
      { id: 1, startTime: '09:00', endTime: '10:00', availableCount: 3, status: 'available' },
      { id: 2, startTime: '10:00', endTime: '11:00', availableCount: 0, status: 'full' }, // 已满不可选
      { id: 3, startTime: '14:00', endTime: '15:00', availableCount: 1, status: 'available' },
      { id: 4, startTime: '15:00', endTime: '16:00', availableCount: 4, status: 'available' },
    ];
    uni.hideLoading();
  }, 500);
};

// --- 交互事件 ---
const selectDate = (dateStr) => {
  if (selectedDate.value === dateStr) return;
  selectedDate.value = dateStr;
  fetchDailySessions(); // 重新拉取该日期的排班
};

const selectSubject = (subjectId) => {
  selectedSubjectId.value = subjectId;
  itemList.value = mockItems[subjectId] || [];
  selectedItemId.value = null; // 切换科目时清空已选项目
};

const toggleSession = (session) => {
  if (session.status === 'full') {
    uni.showToast({ title: '该时段名额已满', icon: 'none' });
    return;
  }
  
  const index = selectedSessions.value.findIndex(s => s.id === session.id);
  if (index > -1) {
    // 已选中则取消
    selectedSessions.value.splice(index, 1);
  } else {
    // 没选中则加入 (驾校一般限制一次最多约2-3个课时，这里可以加限制)
    if (selectedSessions.value.length >= 2) {
      uni.showToast({ title: '一次最多只能预约 2 个时段哦', icon: 'none' });
      return;
    }
    selectedSessions.value.push(session);
  }
};

const submitAppointment = () => {
  if (!selectedSubjectId.value) {
    uni.showToast({ title: '请先选择练车科目', icon: 'none' });
    return;
  }
  if (selectedSessions.value.length === 0) {
    uni.showToast({ title: '请至少选择一个练车时段', icon: 'none' });
    return;
  }
  
  // TODO: 构造订单数据，调用后端创建预约单接口
  uni.showLoading({ title: '提交预约中...', mask: true });
  setTimeout(() => {
    uni.hideLoading();
    uni.showToast({ title: '预约成功！', icon: 'success' });
    // 延迟返回，或者跳转到订单详情页
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  }, 1000);
};
</script>

<style lang="scss" scoped>
.detail-container {
  background-color: #f5f7fa;
  min-height: 100vh;
}
.base-box { background-color: #fff; margin-bottom: 20rpx; padding: 30rpx; }
.section-title { font-size: 32rpx; font-weight: bold; color: #333; margin-bottom: 24rpx; .sub-tip { font-size: 24rpx; color: #999; font-weight: normal; } }

/* 1. 顶部教练名片 */
.coach-header {
  background: linear-gradient(to bottom, #007aff, #409eff); color: #fff; padding: 40rpx 30rpx; border-radius: 0 0 40rpx 40rpx; margin-bottom: 20rpx; box-shadow: 0 10rpx 20rpx rgba(0, 122, 255, 0.2);
  .coach-info { display: flex; align-items: center; .avatar { width: 120rpx; height: 120rpx; border-radius: 50%; border: 4rpx solid #fff; margin-right: 30rpx; } .info-right { .name { font-size: 36rpx; font-weight: bold; margin-bottom: 12rpx; } .rating { font-size: 26rpx; opacity: 0.9; } } }
}

/* 2. 快捷日期轴 */
.date-section {
  padding: 20rpx 10rpx; border-radius: 20rpx; box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.02);
  .date-scroll { width: 100%; white-space: nowrap; .date-item { display: inline-flex; flex-direction: column; align-items: center; justify-content: center; width: 110rpx; height: 130rpx; border-radius: 16rpx; background-color: #f5f7fa; margin: 0 10rpx; transition: all 0.3s; .week { font-size: 24rpx; color: #666; margin-bottom: 8rpx; } .day { font-size: 28rpx; font-weight: bold; color: #333; } &.active { background-color: #007aff; box-shadow: 0 6rpx 16rpx rgba(0,122,255,0.3); .week, .day { color: #fff; } } } }
}

.scroll-content { padding-bottom: 180rpx; } /* 留出底部操作台空间 */

/* 3. 练车内容选择 */
.subject-section {
  border-radius: 20rpx;
  .tag-group { display: flex; gap: 20rpx; margin-bottom: 20rpx; .tag-item { padding: 16rpx 40rpx; background-color: #f5f7fa; color: #666; border-radius: 12rpx; font-size: 28rpx; transition: all 0.2s; &.active { background-color: #e6f2ff; color: #007aff; font-weight: bold; border: 2rpx solid #007aff; } } }
  .sub-item-group { display: flex; flex-wrap: wrap; gap: 16rpx; margin-top: 20rpx; padding-top: 20rpx; border-top: 2rpx dashed #eee; .sub-tag { padding: 8rpx 24rpx; background-color: #f9f9f9; color: #999; border-radius: 30rpx; font-size: 24rpx; &.active { background-color: #007aff; color: #fff; } } }
}

/* 4. 时段网格 */
.session-section {
  border-radius: 20rpx;
  .session-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20rpx; }
  .session-item {
    position: relative; background-color: #f8fbff; border: 2rpx solid #d9eaff; border-radius: 16rpx; padding: 30rpx 20rpx; text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center; transition: all 0.2s;
    .time { font-size: 32rpx; font-weight: bold; color: #333; margin-bottom: 12rpx; }
    .status-text { font-size: 24rpx; color: #007aff; background-color: #e6f2ff; padding: 4rpx 16rpx; border-radius: 6rpx; }
    
    /* 选中状态 */
    &.selected { background-color: #e6f2ff; border-color: #007aff; box-shadow: 0 4rpx 12rpx rgba(0,122,255,0.1); .time, .status-text { color: #007aff; font-weight: bold; } }
    .check-icon { position: absolute; right: 0; bottom: 0; background-color: #007aff; color: #fff; width: 40rpx; height: 40rpx; border-radius: 40rpx 0 16rpx 0; display: flex; justify-content: center; align-items: center; .icon-check { font-size: 24rpx; } }
    
    /* 已满/不可用状态 */
    &.full { background-color: #f5f7fa; border-color: #ebeef5; opacity: 0.6; .time { color: #999; text-decoration: line-through; } .status-text { background-color: #e4e7ed; color: #909399; } }
  }
}

.empty-state { display: flex; flex-direction: column; align-items: center; padding: 60rpx 0; .empty-img { width: 200rpx; height: 200rpx; opacity: 0.6; margin-bottom: 20rpx; } .empty-text { font-size: 28rpx; color: #999; } }

/* 5. 底部悬浮操作台 */
.fixed-bottom-bar {
  position: fixed; bottom: 0; left: 0; right: 0; background-color: #fff; display: flex; justify-content: space-between; align-items: center; padding: 20rpx 40rpx; padding-bottom: calc(20rpx + env(safe-area-inset-bottom)); box-shadow: 0 -4rpx 16rpx rgba(0,0,0,0.05); z-index: 100;
  .summary-info { flex: 1; .selected-count { font-size: 28rpx; color: #333; margin-bottom: 8rpx; .highlight { color: #ff3b30; font-weight: bold; font-size: 36rpx; margin: 0 8rpx; } } .cost-info { font-size: 24rpx; color: #999; .price { color: #ff3b30; font-weight: bold; font-size: 30rpx; margin-left: 8rpx; } } }
  .submit-btn { width: 240rpx; height: 80rpx; line-height: 80rpx; background-color: #007aff; color: #fff; font-size: 32rpx; border-radius: 40rpx; font-weight: bold; padding: 0; margin: 0; box-shadow: 0 6rpx 16rpx rgba(0,122,255,0.3); transition: all 0.3s; &.disabled { background-color: #b3d8ff; box-shadow: none; pointer-events: none; } }
}
</style>