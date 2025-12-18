import React from 'react';
import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// 懒加载组件
const LoginView = React.lazy(() => import('../views/LoginView'));
const HomeView = React.lazy(() => import('../views/HomeView'));
const UserView = React.lazy(() => import('../views/UserView'));
const QuestionView = React.lazy(() => import('../views/QuestionView'));
const QuizView = React.lazy(() => import('../views/QuizView'));

// 私有路由组件，用于验证用户是否登录
const PrivateRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>加载中...</div>; // 可以替换为更美观的加载组件
  }

  // 如果未登录，重定向到登录页面
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 如果需要管理员权限，但不是管理员，重定向到首页
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// 管理员路由组件，用于验证用户是否为管理员
const AdminRoute = ({ children }) => {
  return <PrivateRoute requireAdmin>{children}</PrivateRoute>;
};

// 创建路由
const router = createBrowserRouter([
  // 登录页面
  {
    path: '/login',
    element: <LoginView />,
  },
  // 根路由
  {
    path: '/',
    element: (
      <PrivateRoute>
        <HomeView />
      </PrivateRoute>
    ),
    children: [
      // 在线答题页面（普通用户）
      {
        index: true, // 默认子路由
        element: <QuizView />,
      },
      // 用户管理页面（管理员）
      {
        path: 'users',
        element: (
          <AdminRoute>
            <UserView />
          </AdminRoute>
        ),
      },
      // 题库管理页面（管理员）
      {
        path: 'questions',
        element: (
          <AdminRoute>
            <QuestionView />
          </AdminRoute>
        ),
      },
      // 答题页面
      {
        path: 'quiz',
        element: <QuizView />,
      },
    ],
  },
  // 404页面
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default router;