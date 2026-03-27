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
        
        <view class="empty-state" v-if="!selectedSubjectId">
          <!-- <image class="empty-img" src="/static/assets/images/empty-calendar.png" mode="aspectFit"></image> -->
          <text class="empty-text">请先选择练车科目</text>
        </view>

        <view class="session-grid" v-else-if="sessionList.length > 0">
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
          <!-- <image class="empty-img" src="/static/assets/images/empty-calendar.png" mode="aspectFit"></image> -->
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
import { getAppointDetailData, submitAppointmentOrder } from '@/api/student/appointDetail';

// --- 接收上个页面传来的参数 ---
const queryParams = reactive({
  coachId: null,
  date: ''
});

// --- 响应式状态数据 ---
const coachInfo = reactive({
  id: null,
  name: '',
  avatar: '',
  rating: 0,
  teachingYears: 0,
  price: 0 
});

const dateList = ref([]);
const selectedDate = ref('');

// 练车内容 (科目与项目字典树)
const subjectList = ref([]);
const selectedSubjectId = ref(null);

const itemList = ref([]);
const selectedItemId = ref(null);

// 时段排班列表
const sessionList = ref([]);
const allSessionList = ref([]);

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
    fetchDetailData(); // 聚合请求替换了之前的两个 Mock 方法
  } else {
    uni.showToast({ title: '参数错误', icon: 'none' });
    setTimeout(() => uni.navigateBack(), 1500);
  }
});

// 1. 生成快捷日期轴 (7天，始终以今天为起点)
const generateDateList = () => {
  const weeks = ['日', '一', '二', '三', '四', '五', '六'];
  const list = [];
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

// 2. 核心：从后端拉取排班详情聚合数据
const fetchDetailData = async () => {
  if (!queryParams.coachId || !selectedDate.value) return;
  
  // 切换日期时，清空之前选中的时段
  selectedSessions.value = [];
  
  try {
    uni.showLoading({ title: '加载排班中...', mask: true });
    const res = await getAppointDetailData({
      coachId: queryParams.coachId,
      date: selectedDate.value
    });
    
    if (res.code === 200 && res.data) {
      const data = res.data;
      
      // 1. 映射教练名片
      if (data.coachInfo) {
        Object.assign(coachInfo, data.coachInfo);
      }

      // 2. 映射时段网格
      sessionList.value = data.sessionList || [];
      allSessionList.value = data.sessionList || [];
      
      // 3. 映射科目与项目树
      if (data.subjectList) {
        subjectList.value = data.subjectList;
        // 如果之前已经选了科目，切换日期时保持项目列表联动刷新
        if (selectedSubjectId.value) {
          const currentSub = subjectList.value.find(s => s.id === selectedSubjectId.value);
          itemList.value = currentSub ? currentSub.itemList : [];
        
          // 时段刷新
          const currentSes = allSessionList.value?.filter(s => s.subjectId === selectedSubjectId.value);

          sessionList.value = currentSes || [];
          selectedSessions.value = []; // 切换科目时清空已选时段
        }
      }
      

    } else {
      uni.showToast({ title: res.msg || '获取排班失败', icon: 'none' });
    }
  } catch (error) {
    console.error('获取排班详情异常:', error);
  } finally {
    uni.hideLoading();
  }
};

// --- 交互事件 ---
const selectDate = (dateStr) => {
  if (selectedDate.value === dateStr) return;
  selectedDate.value = dateStr;
  fetchDetailData(); // 重新拉取该日期的真实排班
};

const selectSubject = (subjectId) => {
  selectedSubjectId.value = subjectId;
  // 从后端传来的字典树中，提取当前科目对应的项目列表
  const currentSub = subjectList.value.find(s => s.id === subjectId);
  itemList.value = currentSub ? currentSub.itemList : [];
  selectedItemId.value = null; // 切换科目时清空已选项目

  // 从后端传来的字典树中，提取当前科目对应的时段列表
  const currentSes = allSessionList.value.filter(s => s.subjectId === subjectId);

  sessionList.value = currentSes || [];
  selectedSessions.value = []; // 切换科目时清空已选时段
};

const toggleSession = (session) => {
  if (session.status === 'full') {
    uni.showToast({ title: '该时段名额已满', icon: 'none' });
    return;
  }
  
  const index = selectedSessions.value.findIndex(s => s.id === session.id);
  if (index > -1) {
    selectedSessions.value.splice(index, 1);
  } else {
    // 限制一次最多约2个课时，防止恶意占座
    if (selectedSessions.value.length >= 2) {
      uni.showToast({ title: '一次最多只能预约 2 个时段哦', icon: 'none' });
      return;
    }
    selectedSessions.value.push(session);
  }
};

const submitAppointment = async () => {
  // 1. 前端基础防呆校验
  if (!selectedSubjectId.value) {
    uni.showToast({ title: '请先选择练车科目', icon: 'none' });
    return;
  }
  if (selectedSessions.value.length === 0) {
    uni.showToast({ title: '请至少选择一个练车时段', icon: 'none' });
    return;
  }
  
  // TODO: 构造订单数据，调用后端创建预约单接口
  // uni.showLoading({ title: '提交预约中...', mask: true });
  // setTimeout(() => {
  //   uni.hideLoading();
  //   uni.showToast({ title: '页面暂定，待接入下单接口！', icon: 'none' });
  // }, 1000);
  // 2. 构造符合 SubmitAppointmentDto 规范的 Payload
  const payload = {
    coachId: queryParams.coachId,
    date: selectedDate.value,
    subjectId: selectedSubjectId.value,
    itemId: selectedItemId.value || null, // 没选具体项目传 null
    // 使用 map 提取出所有选中时段的 ID
    sessionIds: selectedSessions.value.map(session => session.id) 
  };
  
  // 3. 发送请求，锁定名额
  try {
    uni.showLoading({ title: '正在为您锁单...', mask: true });
    
    const res = await submitAppointmentOrder(payload);
    
    if (res.code === 200) {
      // 下单成功
      uni.showToast({ title: '预约成功！', icon: 'success' });
      
      // 延迟 1.5 秒后，跳转到“练车记录”页面，让学员查看这笔“待确认”的订单
      setTimeout(() => {
        uni.navigateTo({
          url: '/pages/student/record/record'
        });
      }, 1500);
      
    } else {
      // 下单失败 (例如手慢了被别人抢光，触发了后端的 RuntimeException)
      uni.showModal({
        title: '预约失败',
        content: res.msg || '该时段名额可能已被抢空，请重试',
        showCancel: false,
        success: () => {
          // 刷新当前页面的排班数据，让学员看到最新的剩余名额
          fetchDetailData(); 
        }
      });
    }
  } catch (error) {
    console.error('提交预约请求异常:', error);
    uni.showToast({ title: '网络开小差了，请重试', icon: 'none' });
  } finally {
    uni.hideLoading();
  }
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