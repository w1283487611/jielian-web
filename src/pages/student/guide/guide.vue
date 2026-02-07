<template>
  <view class="container">
    <!-- 步骤条 -->
    <view class="steps-box">
      <view class="step-item" :class="{ active: currentStep >= 1 }">1.选驾照</view>
      <view class="line" :class="{ active: currentStep >= 2 }"></view>
      <view class="step-item" :class="{ active: currentStep >= 2 }">2.选驾校</view>
      <view class="line" :class="{ active: currentStep >= 3 }"></view>
      <view class="step-item" :class="{ active: currentStep >= 3 }">3.定教练</view>
    </view>

    <!-- 内容区域 -->
    <view class="content-area">
      <!-- 步骤1：选择驾照 -->
      <view v-if="currentStep === 1" class="step-content">
        <view class="title">您想考取哪种驾照？</view>
        <!-- <scroll-view>
          
        </scroll-view> -->
        <!-- <view>组件1</view>
        <view>组件2
          <view>内容</view>
        </view> -->
        <!-- <view class="grid-layout"> -->
        <scroll-view class="grid-scroll" scroll-y :enhanced="true" :style="{ height: licenseScrollHeight }">
          <view class="grid-layout">
            <view v-for="license in licenses" :key="license.id" class="card-select"
              :class="{ selected: form.license === license.id }"
              @click="form.license = form.license === license.id ? '' : license.id">
              <text class="card-icon">🚗</text>
              <text class="card-text">{{ license.code }} {{ license.name }}</text>
              <!-- <text>{{ license.code }}</text> -->
              <view v-if="form.license === license.id">
                <view v-for="subject in license.subjects" :key="subject.id" class="card-select sub-card-select"
                  :class="{ selected: form.subjectId === subject.id }"
                  @click="form.subjectId = form.subjectId === subject.id ? '' : subject.id">
                  {{ subject.name }}
                </view>
              </view>
            </view>
          </view>

        </scroll-view>


        <!-- </view> -->
      </view>

      <!-- 步骤2：选择驾校 -->
      <view v-if="currentStep === 2" class="step-content">
        <view class="title">请选择服务的驾校</view>
        <scroll-view scroll-y class="list-scroll">
          <view v-for="school in schoolList" :key="school.id" class="list-item"
            :class="{ selected: form.schoolId === school.id }" @click="selectSchool(school)">
            <view class="item-info">
              <text class="item-name">{{ school.name }}</text>
              <text class="item-desc">{{ school.address }}</text>
            </view>
            <text v-if="form.schoolId === school.id" class="check-icon">✔</text>
          </view>
        </scroll-view>
      </view>

      <!-- 步骤3：选择主教练 -->
      <view v-if="currentStep === 3" class="step-content">
        <view class="title">绑定您的主教练</view>
        <view class="subtitle">主教练将负责您的主要教学进度</view>
        <scroll-view scroll-y class="list-scroll">
          <view v-for="coach in coachList" :key="coach.id" class="coach-card"
            :class="{ selected: form.mainCoachId === coach.id }" @click="form.mainCoachId = coach.id">
            <image :src="coach.avatar" class="avatar" mode="aspectFill"></image>
            <view class="coach-info">
              <view class="coach-name">{{ coach.name }} <text class="tag">金牌</text></view>
              <view class="coach-rate">评分 {{ coach.rate }} | 教龄 {{ coach.years }}年</view>
            </view>
            <button class="select-btn" :class="{ active: form.mainCoachId === coach.id }">
              {{ form.mainCoachId === coach.id ? '已选' : '选择' }}
            </button>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="footer">
      <button v-if="currentStep > 1" class="btn secondary" @click="currentStep--">上一步</button>
      <button v-if="currentStep < 3" class="btn primary" @click="nextStep">下一步</button>
      <button v-else class="btn primary" @click="submitSetup">完成设置</button>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { onLoad, onShow, onReady } from '@dcloudio/uni-app'
// 模拟 Pinia store 引用
// import { useUserStore } from '@/stores/user';
import { listLicense } from "@/api/client/license";
import { listSubjectByLicenseId, tagListSubjectByLicenseId } from "@/api/client/subject";
import {
  STUDENT_HOME_PATH,
} from "@/utils/constants";

const currentStep = ref(1);
const form = reactive({
  license: '',
  subjectId: '',
  schoolId: null,
  mainCoachId: null,
  subject: '科目二' // 默认
});

// 模拟数据
const licenses = ref([
  {
    id: '1', code: 'C1', name: '小型汽车手动挡',
    subjects: [
      { id: '1', name: '科目一',  type: '2'},// 科目类型，1：实操，2：理论
      { id: '2', name: '科目二' },
      { id: '3', name: '科目三' },


    ]
  },
  { id: '2', code: 'C2', name: '小型汽车手动挡', subjects: [] },
  { id: '3', code: 'C3', name: '小型汽车手动挡', subjects: [] },

]);

// const licenses = ref([
//   { id: 1, code: 'C1', name: '小型汽车手动挡', subjects:[{id:1,name:'科目一'},]},
//   { id: '2', code: 'C2', name: '小型汽车手动挡', subjects:[]},
//   { id: '3', code: 'C3', name: '小型汽车手动挡', subjects:[]},

// ]);
const schoolList = ref([
  { id: 1, name: '安顺达驾校', address: '高新区科技路101号' },
  { id: 2, name: '通途驾校', address: '雁塔区电子城西路' }
]);
const coachList = ref([
  { id: 101, name: '张教练', avatar: 'https://placehold.co/100', rate: 4.9, years: 10 },
  { id: 102, name: '李教练', avatar: 'https://placehold.co/100', rate: 4.8, years: 6 }
]);

const selectSchool = (school) => {
  form.schoolId = school.id;
  // 实际开发中这里会触发加载该驾校的教练列表 API
};

const nextStep = () => {
  if (currentStep.value === 1 && !form.license) return uni.showToast({ title: '请选择驾照类型', icon: 'none' });
  if (currentStep.value === 2 && !form.schoolId) return uni.showToast({ title: '请选择驾校', icon: 'none' });
  currentStep.value++;
};

const submitSetup = () => {
  if (!form.mainCoachId) return uni.showToast({ title: '请选择主教练', icon: 'none' });

  uni.showLoading({ title: '系统初始化中...' });
  // TODO: 调用 API 保存用户设置，并获取初始统计数据
  setTimeout(() => {
    uni.hideLoading();
    uni.switchTab({ url: STUDENT_HOME_PATH });
  }, 1500);
};

// const licenseScrollHeight = computed(()=> {
//   const h = 1500;
//   // return 1500rpx;
//   return `${h}px`;
// })
// const licenseScrollHeight = ref('800rpx')
const licenseScrollHeight = ref('auto');

// 计算滚动区域高度
const calculateScrollHeight = () => {
  uni.createSelectorQuery()
    .select('.title')
    .boundingClientRect(data => {
      if (data) {
        // const systemInfo = uni.getSystemInfoSync()
        const windowInfo = uni.getWindowInfo()
        // console.log(windowInfo)
        const windowHeight = windowInfo.windowHeight
        const fixedHeight = data.height
        licenseScrollHeight.value = `${(windowHeight - fixedHeight)*1.5}rpx`
      }
    })
    .exec()
}

onLoad(() => {
  calculateScrollHeight();
  listLicense({pageNum: 1, pageSize: 100 , subjectType: 1}).then((res) => {
    // console.log(res);// {total:10,rows:[],code:200,msg:""}
    licenses.value = res.rows;
  })
    .catch((error) => {
      uni.showToast({
        title: `获取驾驶证列表失败，请与管理员联系: ${error}`,
        type: 'info'
      });
      console.error(error);
    })
});
</script>

<style scoped lang="scss">
.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.steps-box {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  background: #fff;

  .step-item {
    font-size: 28rpx;
    color: #999;

    &.active {
      color: #2979ff;
      font-weight: bold;
    }
  }

  .line {
    width: 60rpx;
    height: 2rpx;
    background: #eee;
    margin: 0 20rpx;

    &.active {
      background: #2979ff;
    }
  }
}

.content-area {
  flex: 1;
  padding: 30rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
  color: #333;
}

.subtitle {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 20rpx;
  margin-top: -20rpx;
}

.grid-layout {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.grid-scroll {
  // height: 1000rpx; //不设置，无法滚动
  flex: 1;
  padding: 20rpx;
  box-sizing: border-box;
  background-color: #f5f5f5;

  .grid-container {
    display: flex;
    flex-wrap: wrap; // 关键：允许换行
    justify-content: space-between;

    // 清除最后一行的margin
    &::after {
      content: '';
      width: 340rpx; // 与grid-item宽度一致
    }
  }
}

.card-select {
  background: #fff;
  padding: 40rpx;
  border-radius: 16rpx;
  text-align: center;
  border: 2rpx solid transparent;
  transition: all 0.3s;

  &.selected {
    border-color: #2979ff;
    background: #eef5ff;
  }

  .card-icon {
    font-size: 60rpx;
    display: block;
    margin-bottom: 20rpx;
  }

  .card-text {
    font-size: 30rpx;
    font-weight: 500;
  }
}

.sub-card-select {
  margin-top: 10rpx;
}

.list-scroll {
  height: 100%;
}

.list-item,
.coach-card {
  background: #fff;
  padding: 30rpx;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  border: 2rpx solid transparent;

  &.selected {
    border-color: #2979ff;
    background: #f0f7ff;
  }
}

.coach-card {
  .avatar {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    margin-right: 20rpx;
  }

  .coach-info {
    flex: 1;
  }

  .coach-name {
    font-size: 32rpx;
    font-weight: bold;
  }

  .tag {
    font-size: 20rpx;
    background: #ff9900;
    color: #fff;
    padding: 2rpx 8rpx;
    border-radius: 4rpx;
    margin-left: 10rpx;
  }

  .coach-rate {
    font-size: 24rpx;
    color: #666;
    margin-top: 8rpx;
  }

  .select-btn {
    font-size: 24rpx;
    background: #f0f0f0;
    color: #333;

    &.active {
      background: #2979ff;
      color: #fff;
    }
  }
}

.footer {
  padding: 30rpx;
  background: #fff;
  display: flex;
  gap: 20rpx;

  .btn {
    flex: 1;
    border-radius: 40rpx;
    font-size: 30rpx;

    &.primary {
      background: #2979ff;
      color: #fff;
    }

    &.secondary {
      background: #f0f0f0;
      color: #333;
    }
  }
}
</style>