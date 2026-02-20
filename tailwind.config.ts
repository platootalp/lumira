import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 基金颜色规范
        fund: {
          up: "#F56C6C",      // 上涨 - 红色
          down: "#67C23A",    // 下跌 - 绿色
          primary: "#409EFF", // 主色
          warning: "#E6A23C", // 警告
          danger: "#F56C6C",  // 危险
        }
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
