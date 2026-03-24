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

            <!-- <view class="card-right">
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
            </view> -->

            <view class="card-right">
              <view class="name-row">
                <text class="name">{{ school.name || '未知驾校' }}</text>
                <text class="distance">{{ school.distance != null ? school.distance + ' km' : '距离未知' }}</text>
              </view>
              <view class="stat-row">
                <text class="rating" v-if="school.avgRating > 0">⭐ {{ school.avgRating }}</text>
                <text class="rating no-data-text" v-else>暂无评分</text>
                
                <text class="students">累计学员 {{ school.totalStudents || 0 }} 人</text>
              </view>
              <view class="address-row">
                <text class="address">{{ school.address || '暂无详细地址' }}</text>
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

            <!-- <view class="card-right">
              <view class="name-row">

                <text class="name">{{ coach.name }} 教练</text>
                <text class="exp">教龄 {{ coach.teachingYears }} 年</text>
              </view>
              <view class="tags-row">
                <text class="info-tag" v-for="(t, index) in coach.tags" :key="index">{{ t }}</text>
              </view>
              <view class="stat-row">
                <text class="rating">⭐ {{ coach.rating }}</text>
                <text class="students">带教 {{ coach.totalStudents }} 人</text>
              </view>
            </view> -->

            <view class="card-right">
              <view class="name-row">
                <text class="name">{{ coach.name || '未知教练' }}</text>
                <text class="exp">教龄 {{ coach.teachingYears || 0 }} 年</text>
              </view>
              
              <view class="tags-row" v-if="coach.tags && coach.tags.length > 0">
                <text class="info-tag" v-for="(t, index) in coach.tags" :key="index">{{ t }}</text>
              </view>
              <view class="tags-row" v-else>
                <text class="info-tag empty-tag">暂无特色标签</text>
              </view>

              <view class="stat-row">
                <text class="rating" v-if="coach.rating > 0">⭐ {{ coach.rating }}</text>
                <text class="rating no-data-text" v-else>暂无评分</text>
                
                <text class="students">带教 {{ coach.totalStudents || 0 }} 人</text>
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
    </view>

    <view class="btn-group">
      <template v-if="currentStep === 1">
        <button class="next-btn primary-btn" @click="nextStep">下一步，挑选驾校</button>
      </template>
      
      <template v-if="currentStep === 2">
        <button class="prev-btn plain-btn" @click="prevStep">上一步</button>
        <button class="skip-btn plain-btn" @click="skipSchool">跳过</button>
        <button class="next-btn primary-btn" @click="nextStep">下一步</button>
      </template>

      <template v-if="currentStep === 3">
        <button class="prev-btn plain-btn" @click="prevStep">上一步</button>
        <button class="skip-btn plain-btn" @click="submitGuide(true)">跳过</button>
        <button class="next-btn primary-btn" @click="submitGuide(false)">完成设置</button>
      </template>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import SchoolFilter from '@/components/school-filter/school-filter.vue';
import CoachFilter from '@/components/coach-filter/coach-filter.vue';

// 引入后端 API 请求方法
import { getLicenseList } from '@/api/client/license';
import { getSchoolList } from '@/api/student/school';
import { getCoachList } from '@/api/student/coach';
import { submitStudentInit } from '@/api/student/student';


const currentStep = ref(1);

// 提交表单数据
const guideForm = reactive({
  licenseId: null,
  schoolId: null,
  coachId: null
});

// 查询参数
const schoolQuery = reactive({ licenseId: null });
const coachQuery = reactive({ schoolId: null, licenseId: null });

// 列表数据
const licenseList = ref([]);
const schoolList = ref([]);
const coachList = ref([]);

onMounted(() => {
  // 页面加载时自动获取驾驶证列表
  fetchLicenseList();
  
  // 监听从详情页返回的选中事件
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

// --- 数据请求部分 ---
// 获取驾驶证列表
const fetchLicenseList = async () => {
  // licenseList.value = [
  //   { id: 1, code: 'C1', name: '小型汽车手动挡' },
  //   { id: 2, code: 'C2', name: '小型汽车自动挡' },
  //   { id: 3, code: 'D', name: '普通三轮摩托车' }
  // ];
  try {
    const res = await getLicenseList();
    if (res.code === 200) {
      licenseList.value = res.rows;
    } else {
      uni.showToast({ title: res.msg || '获取驾驶证失败', icon: 'none' });
    }
  } catch (error) {
    console.error('获取驾驶证列表异常:', error);
  }
};

// 获取驾校列表
const fetchSchoolList = async () => {
  schoolQuery.licenseId = guideForm.licenseId;
  try {
    uni.showLoading({ title: '加载驾校中...' });
    const res = await getSchoolList(schoolQuery);
    uni.hideLoading();
    if (res.code === 200) {
      schoolList.value = res.rows;
    }
  } catch (error) {
    uni.hideLoading();
    console.error('获取驾校列表异常:', error);
  }
  // schoolList.value = [
  //   { id: 1, name: '顺达驾校', distance: 1.2, avgRating: 4.8, totalStudents: 3200, address: '天河区科韵路12号' },
  //   { id: 2, name: '平安驾校', distance: 3.5, avgRating: 4.9, totalStudents: 5100, address: '海珠区新港东路' }
  // ];
};

// 获取教练列表
const fetchCoachList = async () => {
  coachQuery.schoolId = guideForm.schoolId;
  coachQuery.licenseId = guideForm.licenseId;
  try {
    uni.showLoading({ title: '加载教练中...' });
    const res = await getCoachList(coachQuery);
    uni.hideLoading();
    if (res.code === 200) {
      coachList.value = res.rows;
    }
  } catch (error) {
    uni.hideLoading();
    console.error('获取教练列表异常:', error);
  }
  // coachList.value = [
  //   { id: 101, nickName: '张建国', teachingYears: 8, rating: 4.9, totalStudents: 850, tags: ['脾气好', '通过率高'] },
  //   { id: 102, nickName: '李伟', teachingYears: 12, rating: 4.7, totalStudents: 1200, tags: ['严谨认真', '老教练'] }
  // ];
};

// --- 选择与交互 ---
const selectLicense = (id) => { guideForm.licenseId = id; };
const selectSchool = (id) => { guideForm.schoolId = id; };
const selectCoach = (id) => { guideForm.coachId = id; };

const onSchoolFilterChange = (filterData) => {
  Object.assign(schoolQuery, filterData);
  // 参数变化后重新请求
  fetchSchoolList();
};

const onCoachFilterChange = (filterData) => {
  Object.assign(coachQuery, filterData);
  // 参数变化后重新请求
  fetchCoachList();
};

const goToSchoolDetail = (schoolId) => {
  uni.navigateTo({ url: `/pages/student/school-detail/school-detail?id=${schoolId}` });
};

const goToCoachDetail = (coachId) => {
  uni.navigateTo({ url: `/pages/student/coach-detail/coach-detail?id=${coachId}` });
};

// --- 步骤控制逻辑（含校验提示） ---
const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const skipSchool = () => {
  guideForm.schoolId = null; // 跳过则清空已选项
  currentStep.value = 3;
  fetchCoachList();
};

const nextStep = () => {
  if (currentStep.value === 1) {
    // 步骤一：未选驾照拦截
    if (!guideForm.licenseId) {
      uni.showToast({ title: '请先选择要考取的驾驶证', icon: 'none' });
      return;
    }
    currentStep.value = 2;
    fetchSchoolList();
  } else if (currentStep.value === 2) {
    // 步骤二：未选驾校拦截
    if (!guideForm.schoolId) {
      uni.showToast({ title: '请选择意向驾校，或点击跳过', icon: 'none' });
      return;
    }
    currentStep.value = 3;
    fetchCoachList();
  }
};

// 提交最终配置至后端
const submitGuide = async (isSkip = false) => {
  // 如果是跳过教练，清空选项；如果是提交，检查是否选中教练
  if (isSkip) {
    guideForm.coachId = null;
  } else if (!guideForm.coachId) {
    uni.showToast({ title: '请选择意向教练，或点击跳过', icon: 'none' });
    return;
  }

  try {
    uni.showLoading({ title: '配置中...' });
    // 模拟提交 API
    // setTimeout(() => {
    //   uni.hideLoading();
    //   uni.showToast({ title: '设置成功', icon: 'success' });
    //   uni.switchTab({
    //     url: '/pages/tabbar/student/index/index'
    //   });
    // }, 800);
    // 发起真实请求保存学员初始配置
    const res = await submitStudentInit(guideForm);
    uni.hideLoading();
    
    if (res.code === 200) {
      uni.showToast({ title: '设置成功', icon: 'success' });
      // 延迟跳转至学员首页，给予 Toast 显示时间
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/tabbar/student/index/index'
        });
      }, 800);
    } else {
      uni.showToast({ title: res.msg || '设置失败', icon: 'none' });
    }
  } catch (error) {
    uni.hideLoading();
    uni.showToast({ title: '网络异常，请重试', icon: 'none' });
    console.error('提交引导配置异常:', error);
  }
};
</script>

<style lang="scss" scoped>
.guide-container {
  padding: 30rpx;
  background-color: #f5f7fa;
  min-height: 100vh;
  /* 为底部固定的操作栏预留空间，防止内容被遮挡 */
  padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
}

.step-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40rpx;
}
.step-item { color: #999; font-size: 28rpx; }
.step-item.active { color: #007aff; font-weight: bold; }
.step-line { flex: 1; height: 2rpx; background-color: #ddd; margin: 0 20rpx; }
.title { font-size: 36rpx; font-weight: bold; margin-bottom: 10rpx; }
.sub-title { font-size: 24rpx; color: #666; margin-bottom: 30rpx; }

/* 驾照网格 */
.grid-list { display: flex; flex-wrap: wrap; gap: 20rpx; }
.grid-item {
  width: 47%; padding: 30rpx 0; text-align: center; background-color: #fff;
  border-radius: 12rpx; border: 2rpx solid transparent;
  .code { font-size: 32rpx; font-weight: bold; display: block; margin-bottom: 10rpx;}
  .name { font-size: 24rpx; color: #666; }
}
.grid-item.selected { border-color: #007aff; background-color: #e6f2ff; .code, .name { color: #007aff; } }

/* 滚动列表 */
.list-view {
  /* 动态计算高度，减去头部和底部固定栏的高度 */
  height: calc(100vh - 460rpx - env(safe-area-inset-bottom));
}

.rich-card {
  background-color: #fff; border-radius: 16rpx; margin-bottom: 20rpx;
  border: 2rpx solid transparent; overflow: hidden;
  &.selected { border-color: #007aff; box-shadow: 0 4rpx 12rpx rgba(0,122,255,0.1); }
  
  .card-body {
    display: flex; padding: 24rpx;
    &:active { background-color: #f9f9f9; }
    .card-left { margin-right: 24rpx; .avatar-img { width: 100rpx; height: 100rpx; border-radius: 12rpx; } }
    .card-right {
      flex: 1;
      .name-row { display: flex; justify-content: space-between; .name { font-size: 30rpx; font-weight: bold; } .distance, .exp { font-size: 24rpx; color: #999; } }
      .tags-row { margin: 10rpx 0; .info-tag { font-size: 20rpx; color: #ff9800; background-color: #fff3e0; padding: 4rpx 12rpx; border-radius: 6rpx; margin-right: 10rpx; } }
      .stat-row { display: flex; justify-content: space-between; font-size: 24rpx; margin-top: 10rpx; .rating { color: #f56c6c; font-weight: bold; } .students { color: #666; } }
      .address-row { margin-top: 10rpx; .address { font-size: 22rpx; color: #999; } }
    }
  }

  .card-footer {
    border-top: 1rpx solid #f0f0f0; padding: 16rpx 24rpx;
    .select-btn {
      width: 100%; height: 60rpx; line-height: 60rpx; font-size: 26rpx;
      background-color: #f0f2f5; color: #333; border-radius: 30rpx;
      &.is-selected { background-color: #e6f2ff; color: #007aff; border: 1px solid #007aff; }
      &::after { border: none; }
    }
  }
}

/* 全局固定底栏 */
.btn-group {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 20rpx;
  padding: 24rpx 30rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background-color: #fff;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);
  z-index: 100;

  .plain-btn { background-color: #f0f2f5; color: #666; flex: 1; font-size: 28rpx; margin: 0; }
  .primary-btn { background-color: #007aff; color: #fff; flex: 2; font-size: 28rpx; margin: 0; }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-in;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10rpx); }
  to { opacity: 1; transform: translateY(0); }
}

/* 在现有的样式中补充这两条 */
.no-data-text {
  color: #c0c4cc !important; /* 灰色弱化显示 */
  font-weight: normal !important;
  font-size: 22rpx;
}

.empty-tag {
  background-color: #f5f7fa !important;
  color: #909399 !important;
  border: 1px dashed #dcdfe6;
}
</style>