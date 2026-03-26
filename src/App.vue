<script>
import { ref, reactive, computed } from 'vue';
import { isLogin, getToken, getUserRole } from "@/utils/auth";
import { 
  STUDENT_HOME_PATH, COACH_HOME_PATH,
  SELECT_ROLE_PATH, STUDENT, COACH, 
  LOGIN_PATH,
} from "@/utils/constants";

const isInit = ref(false);

export default {
  onLaunch: function () {
    console.log('App Launch');
    // if (getToken()) { //获取到了token
    if (!isLogin()) { // 未登录
      uni.reLaunch({url:`${LOGIN_PATH}?redirect=${SELECT_ROLE_PATH}`});
    } else { //登录了
      const role = getUserRole();
      if(role) {//获取到了角色
        if(role === STUDENT.roleKey)
          uni.reLaunch({url: STUDENT_HOME_PATH});
        else if(role === COACH.roleKey)
          uni.reLaunch({url: COACH_HOME_PATH});
        else uni.reLaunch({url: SELECT_ROLE_PATH});
      } else {
        uni.reLaunch({url: SELECT_ROLE_PATH});
      }
    }
    
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  },
}
</script>

<style>
/*每个页面公共css */
</style>
