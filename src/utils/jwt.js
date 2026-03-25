import {jwtDecode} from "jwt-decode";

// 检查 Token 是否即将过期（剩余时间 < 5 分钟）
export function isTokenExpiring(token) {
  if (!token) return true;
  try {
    
    const { exp } = jwtDecode(token);
    const now = Date.now() / 1000;
    const remaining = exp - now;
    return remaining < 300; // 5分钟
  } catch {
    return true;
  }
}

// 检查 Token 是否过期
export function isTokenExpired(token) {
  if (!token) return true;
  try {
    const { exp } = jwtDecode(token);
    if(exp === undefined) return false; // token 未携带有效时间 永久有效
    const now = Date.now() / 1000;
    const remaining = exp - now;
    return remaining < 10; // 10秒 防止时间留过少，导致请求失效
  } catch {
    return true;
  }
}
