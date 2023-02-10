import { defineConfig } from 'vite';
import monkey, {cdn} from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: "esnext",
  },
  plugins: [
    monkey({
      entry: 'src/main.ts',
      build: {
        metaFileName: true,
        externalGlobals: {
          "ajax-hook": cdn.jsdelivr("ah", "dist/ajaxhook.min.js"),
          "opencc-js": cdn.jsdelivr("OpenCC", "dist/umd/t2cn.js"),
        },
      },
      userscript: {
        namespace: "Kr328/bilibili-subtitle-tweaks",
        version: "1.2",
        name: "Bilibili Subtitle Tweaks",
        description: "增强 Bilibili 番剧的 CC 字幕，包含自动翻译及自动断行功能。",
        author: "Kr328",
        license: "GPLv3",
        icon: 'https://www.bilibili.com/favicon.ico',
        updateURL: "https://github.com/Kr328/bilibili-subtitle-tweaks/releases/latest/download/bilibili-subtitle-tweaks.meta.js",
        downloadURL: "https://github.com/Kr328/bilibili-subtitle-tweaks/releases/latest/download/bilibili-subtitle-tweaks.user.js",
        match: [
            '*://www.bilibili.com/bangumi/play/ss*',
            '*://www.bilibili.com/bangumi/play/ep*',
        ],
        "run-at": "document-start",
      },
    }),
  ],
});
