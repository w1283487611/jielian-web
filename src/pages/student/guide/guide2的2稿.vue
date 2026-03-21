<template>
  <view class="guide-container">
    <view class="step-header">
      <text :class="['step-item', currentStep >= 1 ? 'active' : '']">1.选驾照</text>
      <text class="step-line"></text>
      <text :class="['step-item', currentStep >= 2 ? 'active' : '']">2.选驾校</text>
      <text class="step-line"></text>
      <text :class="['step-item', currentStep >= 3 ? 'active' : '']">3.选教练</text>
    </view>

    <view v-show="currentStep === 1" class="step-content animate-fade-in">
      <view class="title">您打算考取什么驾驶证？</view>
      <view class="grid-list">
        <view 
          v-for="item in licenseList" 
          :key="item.id" 
          :class="['grid-item', guideForm.licenseId === item.id ? 'selected' : '']"
          @click="selectLicense(item.id)"
        >
          <text class="code">{{ item.code }}</text>
          <text class="name">{{ item.name }}</text>
        </view>
      </view>
      <view class="btn-group">
        <button class="next-btn primary-btn" :disabled="!guideForm.licenseId" @click="nextStep">下一步，挑选驾校</button>
      </view>
    </view>

    <view v-show="currentStep === 2" class="step-content animate-fade-in">
      <view class="title">选择意向驾校</view>
      
      <school-filter @change="onSchoolFilterChange"></school-filter>

      <scroll-view scroll-y class="list-view">
        <view 
          v-for="school in schoolList" 
          :key="school.id"
          :class="['rich-card', guideForm.schoolId === school.id ? 'selected' : '']"
        >
          <view class="card-body" @click="goToSchoolDetail(school.id)">
            <view class="card-left">
              <image class="avatar-img" src="/static/assets/logo/logo.png" mode="aspectFill"></image>
            </view>
            <view class="card-right">
              <view class="name-row">
                <text class="name">{{ school.name }}</text>
                <text class="distance">{{ school.distance || '未知' }} km</text>
              </view>
              <view class="stat-row">
                <text class="rating">⭐ {{ school.avgRating }}</text>
                <text class="students">累计学员 {{ school.totalStudents }} 人</text>
              </view>
              <view class="address-row">
                <text class="address">{{ school.address }}</text>
              </view>
            </view>
          </view>
          
          <view class="card-footer">
            <button class="select-btn" :class="{ 'is-selected': guideForm.schoolId === school.id }" @click.stop="selectSchool(school.id)">
              {{ guideForm.schoolId === school.id ? '已选择该驾校' : '选择此驾校' }}
            </button>
          </view>
        </view>
      </scroll-view>

      <view class="btn-group">
        <button class="prev-btn plain-btn" @click="prevStep">上一步</button>
        <button class="skip-btn plain-btn" @click="skipSchool">跳过</button>
        <button class="next-btn primary-btn" :disabled="!guideForm.schoolId" @click="nextStep">下一步</button>
      </view>
    </view>

    <view v-show="currentStep === 3" class="step-content animate-fade-in">
      <view class="title">选择意向教练</view>
      <view class="sub-title" v-if="guideForm.schoolId">已为您筛选所选驾校下的教练</view>
      
      <coach-filter @change="onCoachFilterChange"></coach-filter>

      <scroll-view scroll-y class="list-view">
        <view 
          v-for="coach in coachList" 
          :key="coach.id"
          :class="['rich-card', guideForm.coachId === coach.id ? 'selected' : '']"
        >
          <view class="card-body" @click="goToCoachDetail(coach.id)">
            <view class="card-left">
              <image class="avatar-img" src="/static/assets/images/profile.jpg" mode="aspectFill"></image>
            </view>
            <view class="card-right">
              <view class="name-row">
                <text class="name">{{ coach.nickName }} 教练</text>
                <text class="exp">教龄 {{ coach.teachingYears }} 年</text>
              </view>
              <view class="tags-row">
                <text class="info-tag" v-for="(t, index) in coach.tags" :key="index">{{ t }}</text>
              </view>
              <view class="stat-row">
                <text class="rating">⭐ {{ coach.rating }}</text>
                <text class="students">带教 {{ coach.totalStudents }} 人</text>
              </view>
            </view>
          </view>

          <view class="card-footer">
            <button class="select-btn" :class="{ 'is-selected': guideForm.coachId === coach.id }" @click.stop="selectCoach(coach.id)">
              {{ guideForm.coachId === coach.id ? '已选择该教练' : '选择此教练' }}
            </button>
          </view>
        </view>
      </scroll-view>

      <view class="btn-group">
        <button class="prev-btn plain-btn" @click="prevStep">上一步</button>
        <button class="skip-btn plain-btn" @click="submitGuide">跳过</button>
        <button class="next-btn primary-btn" :disabled="!guideForm.coachId" @click="submitGuide">完成设置</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import SchoolFilter from '@/components/school-filter/school-filter.vue';
import CoachFilter from '@/components/coach-filter/coach-filter.vue';

const currentStep = ref(1);

const guideForm = reactive({
  licenseId: null,
  schoolId: null,
  coachId: null
});

// 查询参数状态
const schoolQuery = reactive({
  licenseId: null
});

const coachQuery = reactive({
  schoolId: null,
  licenseId: null
});

// 列表数据
const licenseList = ref([]);
const schoolList = ref([]);
const coachList = ref([]);

onMounted(() => {
  fetchLicenseList();
  
  // 监听从详情页返回的事件
  uni.$on('selectSchoolFromDetail', (id) => {
    guideForm.schoolId = id;
  });
  
  uni.$on('selectCoachFromDetail', (id) => {
    guideForm.coachId = id;
  });
});

onUnmounted(() => {
  uni.$off('selectSchoolFromDetail');
  uni.$off('selectCoachFromDetail');
});

// 数据拉取模拟
const fetchLicenseList = async () => {
  licenseList.value = [
    { id: 1, code: 'C1', name: '小型汽车手动挡' },
    { id: 2, code: 'C2', name: '小型汽车自动挡' },
    { id: 3, code: 'D', name: '普通三轮摩托车' }
  ];
};

const fetchSchoolList = async () => {
  schoolQuery.licenseId = guideForm.licenseId;
  // 实际开发中替换为后端请求，如：getSchoolList(schoolQuery)
  schoolList.value = [
    { id: 1, name: '顺达驾校', distance: 1.2, avgRating: 4.8, totalStudents: 3200, address: '天河区科韵路12号' },
    { id: 2, name: '平安驾校', distance: 3.5, avgRating: 4.9, totalStudents: 5100, address: '海珠区新港东路' }
  ];
};

const fetchCoachList = async () => {
  coachQuery.schoolId = guideForm.schoolId;
  coachQuery.licenseId = guideForm.licenseId;
  // 实际开发中替换为后端请求，如：getCoachList(coachQuery)
  coachList.value = [
    { id: 101, nickName: '张建国', teachingYears: 8, rating: 4.9, totalStudents: 850, tags: ['脾气好', '通过率高'] },
    { id: 102, nickName: '李伟', teachingYears: 12, rating: 4.7, totalStudents: 1200, tags: ['严谨认真', '老教练'] }
  ];
};

// 交互操作
const selectLicense = (id) => {
  guideForm.licenseId = id;
};

const selectSchool = (id) => {
  guideForm.schoolId = id;
};

const selectCoach = (id) => {
  guideForm.coachId = id;
};

const onSchoolFilterChange = (filterData) => {
  Object.assign(schoolQuery, filterData);
  fetchSchoolList();
};

const onCoachFilterChange = (filterData) => {
  Object.assign(coachQuery, filterData);
  fetchCoachList();
};

// 路由跳转
const goToSchoolDetail = (schoolId) => {
  uni.navigateTo({
    url: `/pages/student/school-detail/school-detail?id=${schoolId}`
  });
};

const goToCoachDetail = (coachId) => {
  uni.navigateTo({
    url: `/pages/student/coach-detail/coach-detail?id=${coachId}`
  });
};

// 步骤控制
const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const skipSchool = () => {
  guideForm.schoolId = null;
  nextStep();
};

const nextStep = () => {
  if (currentStep.value === 1) {
    currentStep.value = 2;
    fetchSchoolList();
  } else if (currentStep.value === 2) {
    currentStep.value = 3;
    fetchCoachList();
  }
};

const submitGuide = async () => {
  try {
    uni.showLoading({ title: '配置中...' });
    // 模拟提交 API：await submitStudentInit(guideForm);
    uni.hideLoading();
    uni.showToast({ title: '设置成功', icon: 'success' });
    
    setTimeout(() => {
      uni.switchTab({
        url: '/pages/tabbar/student/index/index'
      });
    }, 1000);
  } catch (error) {
    uni.hideLoading();
    uni.showToast({ title: '设置失败', icon: 'none' });
  }
};
</script>

<style lang="scss" scoped>
.guide-container {
  padding: 30rpx;
  background-color: #f5f7fa;
  min-height: 100vh;
}
.step-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40rpx;
}
.step-item {
  color: #999;
  font-size: 28rpx;
}
.step-item.active {
  color: #007aff;
  font-weight: bold;
}
.step-line {
  flex: 1;
  height: 2rpx;
  background-color: #ddd;
  margin: 0 20rpx;
}
.title {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}
.sub-title {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 30rpx;
}

/* 驾照选择网格 */
.grid-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}
.grid-item {
  width: 47%;
  padding: 30rpx 0;
  text-align: center;
  background-color: #fff;
  border-radius: 12rpx;
  border: 2rpx solid transparent;
  .code { font-size: 32rpx; font-weight: bold; display: block; margin-bottom: 10rpx;}
  .name { font-size: 24rpx; color: #666; }
}
.grid-item.selected {
  border-color: #007aff;
  background-color: #e6f2ff;
  .code, .name { color: #007aff; }
}

/* 列表卡片样式 */
.list-view {
  height: calc(100vh - 480rpx);
}
.rich-card {
  background-color: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  border: 2rpx solid transparent;
  overflow: hidden;
  &.selected {
    border-color: #007aff;
    box-shadow: 0 4rpx 12rpx rgba(0,122,255,0.1);
  }
  
  .card-body {
    display: flex;
    padding: 24rpx;
    &:active {
      background-color: #f9f9f9;
    }
    .card-left {
      margin-right: 24rpx;
      .avatar-img { width: 100rpx; height: 100rpx; border-radius: 12rpx; }
    }
    .card-right {
      flex: 1;
      .name-row { display: flex; justify-content: space-between; .name { font-size: 30rpx; font-weight: bold; } .distance, .exp { font-size: 24rpx; color: #999; } }
      .tags-row { margin: 10rpx 0; .info-tag { font-size: 20rpx; color: #ff9800; background-color: #fff3e0; padding: 4rpx 12rpx; border-radius: 6rpx; margin-right: 10rpx; } }
      .stat-row { display: flex; justify-content: space-between; font-size: 24rpx; margin-top: 10rpx; .rating { color: #f56c6c; font-weight: bold; } .students { color: #666; } }
      .address-row { margin-top: 10rpx; .address { font-size: 22rpx; color: #999; } }
    }
  }

  .card-footer {
    border-top: 1rpx solid #f0f0f0;
    padding: 16rpx 24rpx;
    .select-btn {
      width: 100%;
      height: 60rpx;
      line-height: 60rpx;
      font-size: 26rpx;
      background-color: #f0f2f5;
      color: #333;
      border-radius: 30rpx;
      &.is-selected {
        background-color: #e6f2ff;
        color: #007aff;
        border: 1px solid #007aff;
      }
      &::after { border: none; }
    }
  }
}

// 底部按钮
.btn-group {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 20rpx;
  padding: 24rpx 30rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom)); /* 适配全面屏底部小黑条 */
  background-color: #fff;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.08); /* 添加顶部阴影增加层次感 */
  z-index: 100; /* 确保层级在最上面 */

  .plain-btn { 
    background-color: #f0f2f5; 
    color: #666; 
    flex: 1; 
    font-size: 28rpx;
    margin: 0; /* 清除默认外边距 */
  }
  .primary-btn { 
    background-color: #007aff; 
    color: #fff; 
    flex: 2; 
    font-size: 28rpx;
    margin: 0; /* 清除默认外边距 */
  }
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-in;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10rpx); }
  to { opacity: 1; transform: translateY(0); }
}
</style>