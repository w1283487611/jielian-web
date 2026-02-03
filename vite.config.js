import { defineConfig, loadEnv } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  // mode是当前模式（如development、staging、production）
  const isProduction = mode === "production";
  if (isProduction) {// 如果是生产模式，设置更多优化
    console.log("✅ Vite 运行在生产模式");
    // 你可以在这里添加生产模式特定的配置
  } else {
    console.log("⚠️  Vite 运行在开发模式");
  }
  // 加载环境变量，envDir 指定目录，默认是项目根目录
  const env = loadEnv(mode, process.cwd());
  console.log('当前环境变量：', env)
  const baseUrl = env.VITE_API_BASE_URL // 获取环境变量
  // const baseUrl = "http://localhost:8081"; // 后端接口
  const { VITE_APP_ENV } = env;
  return {
    // 部署生产环境和开发环境下的URL。
    // 默认情况下，vite 会假设你的应用是被部署在一个域名的根路径上
    // 例如 https://www.jielian.com/。如果应用被部署在一个子路径上，
    // 你就需要用这个选项指定这个子路径。
    // 例如，如果你的应用被部署在 https://www.jielian.com/admin/，
    // 则设置 baseUrl 为 /admin/。
    base: VITE_APP_ENV === "production" ? "/" : "/",
    plugins: [
      // 只需配置 uni 插件，并在其选项中传递 vue 的编译设置
      uni({
        vueOptions: {
          template: {
            compilerOptions: {
              // 核心配置：将 uni- 开头的标签都视为自定义元素
              isCustomElement: (tag) => tag.startsWith("uni-"),
            },
          },
        },
      }),

      // createVitePlugins(env, command === 'build'),
    ],
    resolve: {
      // https://cn.vitejs.dev/config/#resolve-alias
      alias: {
        // 设置路径
        "~": path.resolve(__dirname, "./"),
        // 设置别名
        "@": path.resolve(__dirname, "./src"),
      },
      // https://cn.vitejs.dev/config/#resolve-extensions
      extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"],
    },
    server: {
      port: 82,
      host: true,
      open: false,
      proxy: {
        "/dev-api": {
          target: baseUrl, // 动态设置
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/dev-api/, ""),
        },
        "^/v3/api-docs/(.*)": {
          target: baseUrl,
          changeOrigin: true,
        },
      },
    },
    // 其他优化配置
    build: {
      // 生产构建优化
      minify: isProduction ? 'terser' : false,
      sourcemap: !isProduction,
      // 摇树优化
      rollupOptions: {
        treeshake: isProduction
      }
    },
  };
});
