import axios from 'axios';
import { message } from 'antd';
import {
  mockGetRandomQuestionsResponse,
  mockSaveQuizRecordResponse,
  mockGetUsersResponse,
  mockAddUserResponse,
  mockUpdateUserResponse,
  mockDeleteUserResponse,
  mockGetQuestionsResponse,
  mockAddQuestionResponse,
  mockUpdateQuestionResponse,
  mockDeleteQuestionResponse
} from '../mock/data';

// 创建axios实例
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001/api', // API基础URL
  timeout: 10000, // 请求超时时间
});

// 请求拦截器 - 返回模拟数据
axiosInstance.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    if (token) {
      // 设置Authorization头
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 模拟数据处理
    const url = config.url;
    const method = config.method;
    const params = config.params || {};
    const data = config.data || {};
    
    // 模拟API响应
    let mockResponse;
    
    // 根据URL和方法返回对应的模拟数据
    if (url === '/questions/random' && method === 'get') {
      mockResponse = mockGetRandomQuestionsResponse(params.limit || 10);
    } else if (url === '/quiz/record' && method === 'post') {
      mockResponse = mockSaveQuizRecordResponse(data);
    } else if (url === '/users' && method === 'get') {
      mockResponse = mockGetUsersResponse(params.page || 1, params.pageSize || 10, params.keyword || '');
    } else if (url === '/users' && method === 'post') {
      mockResponse = mockAddUserResponse(data);
    } else if (url.startsWith('/users/') && method === 'put') {
      const id = parseInt(url.split('/')[2]);
      mockResponse = mockUpdateUserResponse(id, data);
    } else if (url.startsWith('/users/') && method === 'delete') {
      const id = parseInt(url.split('/')[2]);
      mockResponse = mockDeleteUserResponse(id);
    } else if (url === '/questions' && method === 'get') {
      mockResponse = mockGetQuestionsResponse(
        params.page || 1, 
        params.pageSize || 10, 
        params.keyword || '',
        params.type || '',
        params.difficulty || ''
      );
    } else if (url === '/questions' && method === 'post') {
      mockResponse = mockAddQuestionResponse(data);
    } else if (url.startsWith('/questions/') && method === 'put') {
      const id = parseInt(url.split('/')[2]);
      mockResponse = mockUpdateQuestionResponse(id, data);
    } else if (url.startsWith('/questions/') && method === 'delete') {
      const id = parseInt(url.split('/')[2]);
      mockResponse = mockDeleteQuestionResponse(id);
    }
    
    // 如果有模拟响应，直接返回Promise.resolve
    if (mockResponse) {
      return Promise.resolve({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config
      });
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 处理响应错误
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未授权，清除localStorage并提示用户重新登录
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('userRole');
          message.error('登录已过期，请重新登录');
          // 重定向到登录页面
          window.location.href = '/login';
          break;
        case 403:
          message.error('没有权限访问该资源');
          break;
        case 404:
          message.error('请求的资源不存在');
          break;
        case 500:
          message.error('服务器内部错误');
          break;
        default:
          message.error(error.response.data.message || '请求失败');
      }
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      message.error('网络异常，无法连接到服务器');
    } else {
      // 请求配置出错
      message.error('请求配置错误');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;