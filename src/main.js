import {
	createSSRApp
} from "vue";

import App from "@/App.vue";
import store from "@/store";
// import { setupPermission } from "@/permission";
// setupPermission();

import plugins from "./plugins"; // plugins

// import './permission' // 路由跳转拦截认证
import './test' // 测试

export function createApp() {
	const app = createSSRApp(App);
	app.use(plugins);
	app.use(store);
	
	return {
		app,
	};
}