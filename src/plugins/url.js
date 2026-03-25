import { isHttp, isEmpty } from "@/utils/validate";

import defAva from "@/static/assets/images/profile.jpg";
import noAva from "@/static/assets/images/noUser.png"; // 用户无头像时展示
import defCov from "@/static/assets/images/defCov.png"; // 默认封面
import defImg from "@/static/assets/images/defImg.png"; // 默认图片

const baseURL = import.meta.env.VITE_API_BASE_URL;
const videoPlayBaseURL = import.meta.env.VITE_VIDEO_PLAY_BASE_URL;

export default {
  // 文件地址过滤
  formatUrl(url) {
    if (isEmpty(url)) return defAva;
    if (!isHttp(url)) {
      url = baseURL + url;
    }
    return url;
  },
  // 头像地址过滤
  formatAvatar(url) {
    // if(isEmpty(url)) return "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png";
    if (isEmpty(url)) return noAva;
    if (!isHttp(url)) {
      url = baseURL + url;
    }
    return url;
  },
  // 视频封面图地址过滤
  formatVideo(url) {
    // if(isEmpty(url)) return "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png";
    if (isEmpty(url)) return "";
    if (!isHttp(url)) {
      url = baseURL + url;
    }
    return url;
  },
  // 视频封面图地址过滤
  formatVideoThumb(url) {
    // if(isEmpty(url)) return "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png";
    if (isEmpty(url)) return defCov;
    if (!isHttp(url)) {
      url = baseURL + url;
    }
    return url;
  },
  // 封面图地址过滤
  formatImg(url) {
    // if(isEmpty(url)) return "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png";
    if (isEmpty(url)) return defImg;
    if (!isHttp(url)) {
      url = videoPlayBaseURL + url;
    }
    return url;
  },
};
