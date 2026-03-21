import { defineStore } from "pinia";
import { ref } from "vue";
import { getInfo as getStuInfo } from "@/api/student/student";

const useStudentStore = defineStore(
  "student",
  () => {
    // 学员基本信息
    const isSetup = ref(false); // 是否已完成首次引导

    const id = ref(null); // 学员id
    const licenseId = ref(null); // 当前练习驾驶证id
    const licenseCode = ref(""); // 当前练习驾驶证代码：C1, C2
    const vehicleType = ref(""); // 当前练习车型：小车
    const vehicleSubType = ref(""); // 当前练习驾驶证对应车型：小车

    const subjectId = ref(null); // 当前科目id
    const subjectName = ref(null); // 当前科目名

    const schoolId = ref(null); // 当前驾校ID
    const schoolName = ref(""); // 当前驾校名

    const coachId = ref(null); // 主教练ID
    const coachName = ref(""); // 主教练名
    const tempCoachId = ref(null); // 临时教练ID
    const tempCoachName = ref(""); // 临时教练名

    const student = ref(null); //

    // 当前状态练车统计数据 (Mock)
    const practiceStats = ref({
      totalHours: 12,
      totalAppoints: 6,
      totalFinish: 6,
      totalBreaks: 0,
      passRate: "100%",
    });

    // 历史状态统计数据
    const statistic = ref({
      totalHours: 12,
      totalAppoints: 6,
      totalFinish: 6,
      totalBreaks: 0,
      passRate: "100%",
    });

    // 获取用户信息
    function getInfo() {
      return new Promise((resolve, reject) => {
        getStuInfo()
          .then((res) => {
            const student = res.student;
            this.student = student;
            const practiceStats = res.statistic;
            const statistic = res.statistic;
            this.practiceStats = practiceStats;
            this.statistic = statistic;

            const subject = res.subject;
            this.subject = subject;
            const license = res.license;
            this.license = license;
            // let avatar = user.avatar || "";
            // if (!isHttp(avatar)) {
            //   avatar = isEmpty(avatar)
            //     ? defAva
            //     : import.meta.env.VITE_APP_BASE_API + avatar;
            // }
            // if (res.roles && res.roles.length > 0) {
            //   // 验证返回的roles是否是一个非空数组
            //   this.roles = res.roles;
            //   this.permissions = res.permissions;
            // } else {
            //   this.roles = ["ROLE_DEFAULT"];
            // }
            this.id = student.id;
            this.licenseId = student.licenseId;
            this.licenseName = student.licenseName;
            this.vehicleType = student.vehicleType;

            this.subjectId = student.subjectId;
            this.subjectName = student.subjectName;

            this.schoolId = student.schoolId;
            this.schoolName = student.schoolName;

            this.schoolId = student.schoolId;
            this.schoolName = student.schoolName;

            this.schoolId = student.schoolId;
            this.schoolName = student.schoolName;
            // this.avatar = avatar;

            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      });
    }

    
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

    function setStudy(study) {
      licenseId.value = study.licenseId;
      subjectId.value = study.subjectId;
    }

    

    return {
      isSetup,
      id,
      licenseId,
      licenseCode,
      vehicleType,

      subjectId,
      subjectName,

      schoolId,
      schoolName,

      coachId,
      coachName,
      tempCoachId,
      tempCoachName,

      practiceStats,
      statistic,
      student,

      getInfo,
      completeSetup,
      updateSubject,
      setStudy,
      
    };
  },
  {
    persist: true, // 开启持久化
  }
);

export default useStudentStore;
