import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "pet-health-diary",
  brand: {
    displayName: "펫 건강 다이어리", // 화면에 노출될 앱의 한글 이름으로 바꿔주세요.
    primaryColor: "#E0B20C", // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
    icon: 'https://static.toss.im/appsintoss/42853/92ea3ec8-fb00-402b-9fbf-2e30d363104c.png' // 화면에 노출될 앱의 아이콘 이미지 주소로 바꿔주세요.
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite dev",
      build: "vite build"
    }
  },
  permissions: [],
  outdir: "dist",
  webViewProps: {
    type: 'partner'
  }
});
