<template>
  <view class="guide-container">
    <view class="step-header">
      <text :class="['step-item', currentStep >= 1 ? 'active' : '']">1.选驾照</text>
      <text class="step-line"></text>
      <text :class="['step-item', currentStep >= 2 ? 'active' : '']">2.选驾校</text>
      <text class="step-line"></text>
      <text :class="['step-item', currentStep >= 3 ? 'active' : '']">3.选教练</text>
    </view>

    <view v-show="currentStep === 1" class="step-content">
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
      <button class="next-btn" :disabled="!guideForm.licenseId" @click="nextStep">下一步</button>
    </view>

    <view v-show="currentStep === 2" class="step-content">
      <view class="title">选择您的意向驾校（可选）</view>
      <scroll-view scroll-y class="list-view">
        <view 
          v-for="school in schoolList" 
          :key="school.id"
          :class="['list-item', guideForm.schoolId === school.id ? 'selected' : '']"
          @click="selectSchool(school.id)"
        >
          <text class="name">{{ school.name }}</text>
          </view>
      </scroll-view>
      <view class="btn-group">
        <button class="skip-btn" @click="skipSchool">暂不选择，跳过</button>
        <button class="next-btn" :disabled="!guideForm.schoolId" @click="nextStep">下一步</button>
      </view>
    </view>

    <view v-show="currentStep === 3" class="step-content">
      <view class="title">选择您的意向教练（可选）</view>
      <scroll-view scroll-y class="list-view">
        <view 
          v-for="coach in coachList" 
          :key="coach.id"
          :class="['list-item', guideForm.coachId === coach.id ? 'selected' : '']"
          @click="selectCoach(coach.id)"
        >
          <text class="name">教练 ID: {{ coach.id }}</text>
        </view>
      </scroll-view>
      <view class="btn-group">
        <button class="skip-btn" @click="submitGuide">暂不选择，完成</button>
        <button class="next-btn" :disabled="!guideForm.coachId" @click="submitGuide">完成设置</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
// 假设这些是你在 /src/api/student/student.js 中封装好的 API
// import { getLicenseList, getSchoolList, getCoachList, submitStudentInit } from '@/api/student/student';

const currentStep = ref(1);

// 收集的表单数据，采用驼峰命名
const guideForm = reactive({
  licenseId: null,
  schoolId: null,
  coachId: null
});

// 列表数据
const licenseList = ref([]);
const schoolList = ref([]);
const coachList = ref([]);

// 页面加载时获取驾照列表
onLoad(() => {
  fetchLicenseList();
});

const fetchLicenseList = async () => {
  // 模拟 API 请求
  // const res = await getLicenseList();
  // if (res.code === 200) { licenseList.value = res.data; }
  licenseList.value = [
    { id: 1, code: 'C1', name: '小型汽车手动挡' },
    { id: 2, code: 'C2', name: '小型汽车自动挡' },
    { id: 3, code: 'D', name: '普通三轮摩托车' }
  ];
};

const fetchSchoolList = async () => {
  // 根据业务需求，这里可以传入经纬度获取附近驾校
  // const res = await getSchoolList();
  // if (res.code === 200) { schoolList.value = res.data; }
  schoolList.value = [
    { id: 1, name: '顺达驾校' },
    { id: 2, name: '平安驾校' }
  ];
};

const fetchCoachList = async () => {
  // 如果选了驾校，传入 schoolId 获取该驾校教练；否则获取推荐教练
  // const res = await getCoachList({ schoolId: guideForm.schoolId });
  // if (res.code === 200) { coachList.value = res.data; }
  coachList.value = [
    { id: 101, name: '张教练' },
    { id: 102, name: '李教练' }
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

// 提交最终结果
const submitGuide = async () => {
  try {
    uni.showLoading({ title: '配置中...' });
    
    // 调用后端接口保存配置，后端需要往 student 表和 user_driver_license 表写入初始记录
    // await submitStudentInit(guideForm);
    
    uni.hideLoading();
    uni.showToast({ title: '设置成功', icon: 'success' });
    
    // 延迟跳转至学员端首页 Tabbar
    setTimeout(() => {
      uni.switchTab({
        url: '/pages/tabbar/student/index/index'
      });
    }, 1000);
  } catch (error) {
    uni.hideLoading();
    uni.showToast({ title: '设置失败，请重试', icon: 'none' });
  }
};
</script>

<style lang="scss" scoped>
/* 这里添加基础样式，略过具体 CSS，你可以根据全局主题完善 */
.guide-container {
  padding: 30rpx;
  background-color: #f5f7fa;
  min-height: 100vh;
}
.step-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 50rpx;
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
  background-color: #eee;
  margin: 0 20rpx;
}
.title {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 40rpx;
  text-align: center;
}
.grid-item, .list-item {
  padding: 30rpx;
  margin-bottom: 20rpx;
  background-color: #fff;
  border-radius: 12rpx;
  border: 2rpx solid transparent;
}
.grid-item.selected, .list-item.selected {
  border-color: #007aff;
  background-color: #e6f2ff;
}
.btn-group {
  display: flex;
  gap: 20rpx;
  margin-top: 60rpx;
}
button {
  width: 100%;
}
</style>