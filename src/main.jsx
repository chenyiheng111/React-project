import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AuthProvider } from './context/AuthContext';
import router from './router';
import './index.css';

// 创建React根元素
const root = ReactDOM.createRoot(document.getElementById('root'));

// 渲染应用
root.render(
  <React.StrictMode>
    {/* 配置Ant Design中文语言 */}
    <ConfigProvider locale={zhCN}>
      {/* 提供认证上下文 */}
      <AuthProvider>
        {/* 使用React.lazy需要Suspense包裹 */}
        <Suspense fallback={<div>加载中...</div>}>
          {/* 配置路由 */}
          <RouterProvider router={router} />
        </Suspense>
      </AuthProvider>
    </ConfigProvider>
  </React.StrictMode>
);