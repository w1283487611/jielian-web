import mitt from 'mitt';

const emitter = mitt();

// 事件类型（统一管理，避免乱写字符串）
export const EVENT_TYPES = {
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT'
}

// 发布
export const emit = (type, payload) => {
  emitter.emit(type, payload);
}

// 订阅
export const on = (type, handler) => {
  emitter.on(type, handler);
}

// 取消订阅
export const off = (type, handler) => {
  emitter.off(type, handler);
}

export default {...emitter, EVENT_TYPES};
