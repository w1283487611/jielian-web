import { createPinia, setActivePinia } from 'pinia';
// import { createPersistedState } from 'pinia-plugin-persistedstate' // 数据持久化
import { createUnistorage } from 'pinia-plugin-unistorage'; // 数据持久化

// 1- 注册大仓库
const store = createPinia();
store.use(createUnistorage());
// 立即激活 Pinia 实例, 这样即使在 app.use(store)之前调用 store 也能正常工作 （解决APP端白屏问题）
setActivePinia(store);

// 2- 传入大仓库：告知模块todos是属于哪一个大仓库下的。
import useTestStore from "./modules/test";
import useUserStore from "./modules/user";
import useTabbarStore from "./modules/tabbar";

const test = useTestStore(store);
const user = useUserStore(store);
const tabbar = useTabbarStore(store);
// console.log(test);

export default store;