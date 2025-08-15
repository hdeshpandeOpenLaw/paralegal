import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    'bg-red-100',
    'text-red-700',
    'bg-blue-100',
    'text-blue-700',
    'bg-green-100',
    'text-green-700',
  ],
  theme: {
    extend: {
      colors: {
        'custom-bg': '#F0F2F7',
        'custom-blue': '#4A90E2',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;
