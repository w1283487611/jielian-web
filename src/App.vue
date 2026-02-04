<script>
import { getToken } from "@/utils/auth";
import { 
  STUDENT_HOME_PATH, COACH_HOME_PATH,
  LOGIN_PATH,
} from "@/utils/constants";


export default {
  onLaunch: function () {
    console.log('App Launch');
    if (getToken()) { //获取到了token
    } else{
      // uni.reLaunch({url:`${LOGIN_PATH}?redirect=${args.url}`});
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
