## 概述

这是一个基于 React 的 Web 应用，使用现代工具和库进行状态管理、路由、UI 组件等。该应用采用 Redux Toolkit 进行状态管理，使用 React Router 进行客户端路由，并通过 Ant Design 提供 UI 组件。项目集成了 `@react-google-maps/api` 用于 Google 地图。通过 ESLint、Stylelint 和 Husky 保证代码质量和一致性。

## 开发步骤

### 1. 克隆项目代码
首先，使用 Git 将项目代码克隆到本地。你可以使用以下命令将代码拉取下来：

```bash
git clone https://github.com/Meareen1996/72h-map-demo.git
```

进入项目目录：

```bash
cd 72h-map-demo
```

### 2. 安装依赖
在克隆代码后，确保你已经全局安装了 `node` 和 `pnpm`，然后运行以下命令安装所有依赖：

```bash
pnpm install
```

### 3. 启动本地开发环境
安装完成后，运行以下命令启动本地开发服务器：

```bash
pnpm start
```

此时，项目将运行并在本地开发环境中启动。

### 4. 项目初始化与配置
- 设置目录结构。
- 配置 `package.json` 管理依赖和脚本。

### 5. 安装额外依赖
- 安装核心依赖如 `react`、`redux`、`react-redux`。
- 安装 `antd` 作为 UI 组件库，并集成 `@ant-design/icons`。
- 安装 `@react-google-maps/api` 支持地图功能。

### 6. 配置开发工具
- 配置 Babel，支持 React、TypeScript 和现代 JavaScript。
- 使用 Webpack 处理 JavaScript、CSS、SCSS 文件的打包。
- 集成 ESLint 和 Stylelint 进行代码质量检查。
- 配置 Husky 和 `lint-staged` 在提交代码时进行检查。

### 7. 浏览器兼容性
- 配置 `browserslist` 以确保项目兼容主流浏览器。

### 8. 构建与运行
- 运行 `pnpm build` 生成生产环境的构建文件。
- 使用 `pnpm start` 启动开发服务器。

## 结论

项目配置完善，支持扩展开发并具备高质量代码标准，已准备好进行进一步的开发和部署。