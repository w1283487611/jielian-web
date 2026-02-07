import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useStudentStore = defineStore('student', () => {
  // 学员基本信息
  const isSetup = ref(false); // 是否已完成首次引导
  const licenseType = ref(''); // 驾驶证类型：C1, C2
  const licenseId = ref(''); // 当前练习驾驶证类id
  const schoolId = ref(''); // 驾校ID
  const mainInstructorId = ref(''); // 主教练ID
  const subject = ref('科目二'); // 当前科目
  const subjectId = ref(''); // 当前科目id
  
  // 练车统计数据 (Mock)
  const practiceStats = ref({
    totalHours: 12,
    totalCount: 6,
    passRate: '85%'
  });

  // 完成首次设置
  function completeSetup(data) {
    licenseType.value = data.licenseType;
    schoolId.value = data.schoolId;
    mainInstructorId.value = data.mainInstructorId;
    isSetup.value = true;
  }

  // 更改当前科目
  function updateSubject(subject) {
    subject.value = subject;
  }

  return { 
    isSetup, 
    licenseType, 
    schoolId, 
    mainInstructorId, 
    subject, 
    practiceStats,
    completeSetup,
    updateSubject
  };
}, {
  persist: true // 开启持久化
});