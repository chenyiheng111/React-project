import React, { createContext, useState, useEffect, useContext } from 'react';
import { message } from 'antd';
import { mockLoginResponse, mockRegisterResponse } from '../mock/data';

// 创建AuthContext
const AuthContext = createContext();

// AuthProvider组件，用于提供认证状态和方法
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // 初始化时从localStorage加载用户信息
  useEffect(() => {
    const loadUser = () => {
      try {
        const userInfo = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');

        if (userInfo && token) {
          const parsedUser = JSON.parse(userInfo);
          setUser(parsedUser);
          setIsAuthenticated(true);
          setIsAdmin(userRole === '1'); // 1表示管理员
          // 设置axios默认token
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Failed to load user info:', error);
        // 清除可能损坏的localStorage数据
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // 登录方法
  const login = async (username, password) => {
    try {
      const response = mockLoginResponse(username, password);
      if (response.success) {
        const { token, user: userData } = response.data;

        // 保存到localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userRole', userData.role);

        // 更新状态
        setUser(userData);
        setIsAuthenticated(true);
        setIsAdmin(userData.role === '1');

        message.success('登录成功');
        return true;
      } else {
        message.error(response.message);
        return false;
      }
    } catch (error) {
      message.error('登录失败，请检查用户名和密码');
      return false;
    }
  };

  // 注册方法
  const register = async (username, password, confirmPassword) => {
    if (password !== confirmPassword) {
      message.error('两次输入的密码不一致');
      return false;
    }

    try {
      const response = mockRegisterResponse(username, password);
      if (response.success) {
        message.success('注册成功，请登录');
        return true;
      } else {
        message.error(response.message);
        return false;
      }
    } catch (error) {
      message.error('注册失败，用户名可能已存在');
      return false;
    }
  };

  // 登出方法
  const logout = () => {
    // 清除localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');

    // 更新状态
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);

    message.success('登出成功');
  };

  // 提供给子组件的上下文值
  const contextValue = {
    user,
    isAuthenticated,
    isAdmin,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// 自定义Hook，方便子组件使用AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;