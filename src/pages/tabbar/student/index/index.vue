<template>
    <view class="home-container">
        <view class="upload-container">
            <button type="primary" @click="chooseAndUploadImage">上传图片</button>
            <button type="default" @click="chooseAndUploadWeChatFile">上传微信聊天文件</button>
            
            <view v-if="isUploading">上传中... {{ uploadProgress }}%</view>
        </view>
        ====
        <view>
            <uni-file-picker
            ref="uploadfile"
            v-model="fileList"
            file-mediatype="all"
            mode="list"
            :limit="3"
            file-extname="pdf,doc,docx,xls,xlsx,mp4,png,ico,jpg,jpeg"  
            title="上传附件(最多3个)"
            @select="handleSelect"
            />
        </view>
        ====
        <view class="upload-container">
            <button @click="chooseAndUploadVideo">选择视频并上传</button>
            <view v-if="uploadStatus !== 'idle'">
            <text>状态: {{ uploadStatus }}</text>
            <progress :percent="progress" show-info stroke-width="3" />
            </view>
            <view class="actions" v-if="uploaderInstance">
            <button size="mini" @click="pauseUpload">暂停</button>
            <button size="mini" @click="resumeUpload">继续</button>
            </view>
        </view>

        <navigator url="/pages/student/guide/guide" open-type="navigate" class="link-type">
            引导页
        </navigator>
        <navigator url="/pages/student/my-coach/my-coach" open-type="navigate" class="link-type">
            我的教练页
        </navigator>
        <navigator url="/pages/student/appoint-detail/appoint-detail" open-type="navigate" class="link-type">
            预约详情页
        </navigator>
        <!-- 头部统计卡片 -->
        <view class="header-card">
            <view class="user-welcome">
                <text class="hello">Hi, 同学</text>
                <view class="license-tag">C1 | 科目二练习中</view>
            </view>
            <view class="stats-row">
                <view class="stat-item">
                    <text class="num">12.5</text>
                    <text class="label">累计学时(h)</text>
                </view>
                <view class="stat-item">
                    <text class="num">85</text>
                    <text class="label">综合评分</text>
                </view>
                <view class="stat-item">
                    <text class="num">6</text>
                    <text class="label">预约次数</text>
                </view>
            </view>
        </view>

        <!-- 快速预约区 -->
        <view class="section">
            <view class="section-title">快速预约</view>
            <view class="quick-book-card">
                <view class="coach-preview">
                    <image src="https://placehold.co/100" class="avatar"></image>
                    <view class="info">
                        <view class="name">张教练 <text class="badge">主教练</text></view>
                        <view class="status">今日剩余名额: <text class="highlight">3</text></view>
                    </view>
                </view>
                <button class="book-btn" @click="goToBooking(101)">立即预约</button>
            </view>
        </view>

        <!-- 待办/状态提醒 -->
        <view class="section">
            <view class="section-title">当前任务</view>
            <view class="task-card" @click="goToDetail(123)">
                <view class="task-header">
                    <text class="time">今天 14:00 - 16:00</text>
                    <text class="status-text pending">待确认</text>
                </view>
                <view class="task-body">
                    <text class="content">倒车入库专项练习</text>
                    <view class="tips">请在开始后30分钟内确认上车</view>
                </view>
            </view>
        </view>
    </view>
    <!-- 自定义 TabBar -->
    <tabbar />
</template>

<script setup>
import Tabbar from "@/components/tabbar/index.vue";
import { ref, reactive, computed } from 'vue';
import { onLoad, onShow, onReady } from '@dcloudio/uni-app';

import useUserStore from '@/store/modules/user';
import useStudentStore from '@/store/modules/student';
import { listLicense } from "@/api/client/license";
import { listSubjectByLicenseId, tagListSubjectByLicenseId } from "@/api/client/subject";
import {
    STUDENT_HOME_PATH,
} from "@/utils/constants";
import { getStudent, setStudent, getStudy, setStudy } from "@/utils/student";
import {
    STUDENT_STORAGE_KEY,

    STUDENT_GUIDE_PATH, STUDENT_DO_APPOINT_PATH, STUDENT_APPOINT_DETAIL_PATH,
} from "@/utils/constants";

// 文件上传
import { getToken } from '@/utils/auth'
// header: { 'Authorization': 'Bearer ' + getToken() },
// target: 'http://localhost:8081/upload', // 后端上传接口地址


//miniprogram-file-uploader
import Uploader from 'miniprogram-file-uploader';

// 状态管理
const progress = ref(0);
const uploadStatus = ref('idle'); // idle, uploading, paused, success, fail
const uploaderInstance = ref(null);

// 1. 选择文件 (以视频为例)
const chooseAndUploadVideo = () => {
  uni.chooseVideo({
    sourceType: ['album', 'camera'],
    compressed: false, // 建议大文件不压缩，保持原画质
    success: (res) => {
      console.log(res)
      startUpload(res.tempFilePath, res.size);
    },
    fail: (err) => {
      console.error('选择文件失败', err);
    }
  });
};

// 2. 初始化并开始上传
const startUpload = (tempFilePath, size) => {
  uploadStatus.value = 'uploading';
  
  // 实例化 Uploader
  const uploader = new Uploader({
    tempFilePath: tempFilePath,
    totalSize: size,
    // 从 tempFilePath 提取一个临时文件名
    fileName: tempFilePath.substring(tempFilePath.lastIndexOf('/') + 1), 
    
    // 【重要】你的 Spring Boot 2 后端接口
    verifyUrl: 'http://localhost:8081/upload/wx', // 校验接口（秒传/断点续传）
    uploadUrl: 'http://localhost:8081/upload/wx',   // 分片上传接口
    mergeUrl: 'http://localhost:8081/upload/merge/wx',   // 分片上传接口
    // verifyUrl: 'https://你的域名/api/upload/verify', // 校验接口（秒传/断点续传）
    // uploadUrl: 'https://你的域名/api/upload/chunk',   // 分片上传接口

    header: {
      'Authorization': 'Bearer ' + getToken(),
      // 'X-Business-Type': 'video' 
    },


    
    chunkSize: 5 * 1024 * 1024, // 默认 5MB 一片
    testChunks: true,           // 开启分片校验（实现断点续传的关键）
    // maxConcurrency: 1,          // 并发上传的分片数量
  });

  // 监听进度
  uploader.on('progress', (res) => {
    progress.value = res.progress;
  });

  // 监听成功
  uploader.on('success', (res) => {
    if(!res?.data?.needUpload){
        uploadStatus.value = 'success';
        uploaderInstance.value = null;
        uni.showToast({ title: '上传完成', icon: 'success' });
        // res 中会包含后端合并后返回的数据
        console.log('上传成功，后端返回：', res);
    }

  });

  // 监听失败
  uploader.on('fail', (res) => {
    uploadStatus.value = 'fail';
    uni.showToast({ title: '上传失败', icon: 'error' });
    console.error('上传出错：', res);
  });

  // 保存实例并触发上传
  uploaderInstance.value = uploader;
  uploader.upload();
};

// 3. 控制方法
const pauseUpload = () => {
  if (uploaderInstance.value) {
    uploaderInstance.value.pause();
    uploadStatus.value = 'paused';
  }
};

const resumeUpload = () => {
  if (uploaderInstance.value) {
    uploaderInstance.value.resume();
    uploadStatus.value = 'uploading';
  }
};
//---

// uni-file-picker
const uploadfile = ref(null);
// 绑定的文件列表
// 数据结构大致为: [{ uuid, name, extname, path, url, status, progress }]
const fileList = ref([])

/**
 * 文件选择后的回调（接管手动上传逻辑）
 */
const handleSelect = async (e) => {
  // e.tempFiles 是本次新增选择的文件数组
  const tempFiles = e.tempFiles
  // 遍历刚刚选择的文件，逐个发起上传
  tempFiles.forEach((file) => {
    //将选择的文件添加到上传文件列表
    fileList.value.push(file)
    uploadSingleFile(file)
  })
}

/**
 * 单个文件的上传逻辑
 */
const uploadSingleFile = (file) => {
  // 1. 在 fileList 中找到对应的文件对象（通过自带的 uuid）
  const fileItem = fileList.value.find(v => v.uuid === file.uuid)
  
  if (!fileItem){
    return
  } 

  // 初始化 UI 状态为上传中
  fileItem.status = 'uploading';
  fileItem.progress = 0;
  console.log("开始上传文件")
  // 2. 发起原生上传请求
  const uploadTask = uni.uploadFile({
    url: `http://localhost:8081/upload`, // Vite 环境变量
    filePath: file.path,
    name: 'file', // 后端接收文件的字段名
    header: {
      'Authorization': 'Bearer ' + getToken() 
    },
    success: (res) => {
      try {
        const responseData = JSON.parse(res.data)
        if (responseData.code === 200) {
          // 🚀 上传成功：更新状态并赋值服务器返回的真实 URL
          fileItem.status = 'success'
          fileItem.url = responseData.data.url 
        } else {
          // 接口返回业务错误
          fileItem.status = 'error'
          uni.showToast({ title: responseData.message || '上传失败', icon: 'none' })
        }
      } catch (error) {
        fileItem.status = 'error'
      }
    },
    fail: () => {
      // 网络等底层错误
      fileItem.status = 'error'
      uni.showToast({ title: '网络请求失败', icon: 'none' })
    }
  })

  // 3. 实时更新进度条
  uploadTask.onProgressUpdate((res) => {
    fileItem.progress = res.progress
  })
}

/**
 * 文件删除回调
 */
const handleDelete = (e) => {
  // e.tempFile 是被删除的文件对象
  console.log('用户删除了文件:', e.tempFile)
}

// yu
const isUploading = ref(false)
const uploadProgress = ref(0)

// 场景 A：选择相册图片上传
const chooseAndUploadImage = () => {
  uni.chooseImage({
    count: 1, // 限制每次只能选择一张
    sizeType: ['compressed'], // 可以指定是原图还是压缩图
    sourceType: ['album', 'camera'], 
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0]
      uploadToServer(tempFilePath)
    }
  })
}

// 场景 B：选择微信聊天记录中的文件 (微信小程序专属)
const chooseAndUploadWeChatFile = () => {
  uni.chooseMessageFile({
    count: 1,
    type: 'file', // 'all' | 'video' | 'image' | 'file'
    success: (res) => {
      const tempFilePath = res.tempFiles[0].path
      uploadToServer(tempFilePath)
    }
  })
}

// 核心上传逻辑
const uploadToServer = (filePath) => {
  isUploading.value = true
  uploadProgress.value = 0

  const uploadTask = uni.uploadFile({

    url: 'http://localhost:8081/upload', // 使用 Vite 环境变量
    filePath: filePath,
    name: 'file', // 后端接收文件的字段名，如 formData 中的 'file'
    header: {
      // 从 Pinia 获取 Token，注意加上前缀（根据你们后端的规范）
      'Authorization': `Bearer ${getToken()}` 
    },
    formData: {
      'extraData': '如果后端需要额外的参数，写在这里'
    },
    success: (uploadFileRes) => {
      // ⚠️ 避坑指南：uni.uploadFile 返回的 data 是 String 类型，必须手动 parse！
      try {
        const responseData = JSON.parse(uploadFileRes.data)
        if (responseData.code === 200) {
          uni.showToast({ title: '上传成功', icon: 'success' })
          console.log('服务器文件URL:', responseData.data.url)
        } else {
          uni.showToast({ title: responseData.message || '上传失败', icon: 'none' })
        }
      } catch (e) {
        uni.showToast({ title: '服务器响应异常', icon: 'none' })
      }
    },
    fail: (err) => {
      console.error('上传失败:', err)
      uni.showToast({ title: '网络请求失败', icon: 'none' })
    },
    complete: () => {
      isUploading.value = false
    }
  })

  // 监听上传进度
  uploadTask.onProgressUpdate((res) => {
    uploadProgress.value = res.progress
    // res.totalBytesSent 已经上传的数据长度
    // res.totalBytesExpectedToSend 预期需要上传的数据总长度
  })
}
// end

const userStore = useUserStore();
const studentStore = useStudentStore();

/**
 * 去和教练进行预约页
 * @param bookingId 
 */
const goToBooking = (coachId) => {
    uni.navigateTo({ url: `${STUDENT_DO_APPOINT_PATH}?coachId=${coachId}` });
};

/**
 * 去预约详情页
 * @param appointId 
 */
const goToDetail = (appointId) => {
    uni.navigateTo({ url: `${STUDENT_APPOINT_DETAIL_PATH}?id=${appointId}` });
};

/**
 * 获取用户信息
 */
const getStuInfo = async () => {
    studentStore.getInfo().then((res) => {
        // console.log(res);
        if (res.student.subjectId === undefined) {
            // uni.navigateTo({url: STUDENT_GUIDE_PATH});
            uni.reLaunch({ url: STUDENT_GUIDE_PATH })
            // uni.redirectTo({
            //     url: STUDENT_GUIDE_PATH
            // })
        }
    }).catch((error) => {
        uni.showToast({ title: `学员信息获取失败:${error}`, icon: 'none' });
        console.error(error);
    });
}

onLoad(() => {
    getStuInfo();

});
</script>

<style scoped lang="scss">
.home-container {
    min-height: 100vh;
    background-color: #f5f7fa;
    padding: 30rpx;
}

.header-card {
    background: linear-gradient(135deg, #2979ff, #5393ff);
    border-radius: 24rpx;
    padding: 40rpx;
    color: #fff;
    margin-bottom: 40rpx;
    box-shadow: 0 10rpx 20rpx rgba(41, 121, 255, 0.2);

    .user-welcome {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 40rpx;

        .hello {
            font-size: 36rpx;
            font-weight: bold;
        }

        .license-tag {
            background: rgba(255, 255, 255, 0.2);
            padding: 6rpx 20rpx;
            border-radius: 30rpx;
            font-size: 24rpx;
        }
    }

    .stats-row {
        display: flex;
        justify-content: space-between;

        .stat-item {
            display: flex;
            flex-direction: column;
            align-items: center;

            .num {
                font-size: 44rpx;
                font-weight: bold;
                margin-bottom: 8rpx;
            }

            .label {
                font-size: 24rpx;
                opacity: 0.8;
            }
        }
    }
}

.section {
    margin-bottom: 40rpx;
}

.section-title {
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 20rpx;
    color: #333;
}

.quick-book-card {
    background: #fff;
    padding: 30rpx;
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .coach-preview {
        display: flex;
        align-items: center;

        .avatar {
            width: 80rpx;
            height: 80rpx;
            border-radius: 50%;
            margin-right: 20rpx;
        }

        .name {
            font-weight: bold;
            font-size: 30rpx;
            margin-bottom: 8rpx;
        }

        .badge {
            font-size: 20rpx;
            background: #e3f2fd;
            color: #2979ff;
            padding: 2rpx 8rpx;
            border-radius: 4rpx;
            margin-left: 10rpx;
        }

        .status {
            font-size: 24rpx;
            color: #666;
        }

        .highlight {
            color: #ff5252;
            font-weight: bold;
            margin-left: 6rpx;
        }
    }

    .book-btn {
        margin: 0;
        background: #2979ff;
        color: #fff;
        font-size: 26rpx;
        border-radius: 30rpx;
        padding: 0 30rpx;
        height: 60rpx;
        line-height: 60rpx;
    }
}

.task-card {
    background: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
    border-left: 8rpx solid #ff9900; // 橙色代表待办

    .task-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 16rpx;

        .time {
            font-weight: bold;
            font-size: 30rpx;
        }

        .status-text {
            font-size: 26rpx;
            color: #ff9900;
        }
    }

    .task-body {
        .content {
            font-size: 28rpx;
            color: #333;
            display: block;
            margin-bottom: 8rpx;
        }

        .tips {
            font-size: 24rpx;
            color: #999;
        }
    }
}
</style>