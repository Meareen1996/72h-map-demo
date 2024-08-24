import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginReact from 'eslint-plugin-react';

export default [
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,  // 同时支持 Node.js 和浏览器环境
      },
      parserOptions: {
        ecmaVersion: 2021, // 支持最新的 ECMAScript 特性
        sourceType: 'module', // 启用 ES 模块化支持 (import/export)
      },
    },
    plugins: {
      js: pluginJs,
      react: pluginReact,
    },
    rules: {
      // 添加自定义规则或覆盖默认规则
    },
  },
  // 直接包含推荐配置对象
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
];
