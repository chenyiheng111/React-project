import React, { useState } from 'react';
import { Tabs, Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { TabPane } = Tabs;

const LoginView = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [registerForm] = Form.useForm();

  // 登录表单提交
  const handleLogin = async (values) => {
    try {
      setLoading(true);
      const success = await login(values.username, values.password);
      if (success) {
        // 登录成功，跳转到首页
        navigate('/');
      }
    } catch (error) {
      message.error('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 注册表单提交
  const handleRegister = async (values) => {
    try {
      setLoading(true);
      const success = await register(values.username, values.password, values.confirmPassword);
      if (success) {
        // 注册成功，切换到登录标签
        form.setFieldsValue({ username: values.username });
      }
    } catch (error) {
      message.error('注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 标签页切换时重置表单
  const handleTabChange = () => {
    form.resetFields();
    registerForm.resetFields();
  };

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <Tabs activeKey="1" onChange={handleTabChange}>
          {/* 登录标签 */}
          <TabPane tab="登录" key="1">
            <Form
              form={form}
              name="login"
              onFinish={handleLogin}
              autoComplete="off"
              layout="vertical"
            >
              <Form.Item
                label="用户名"
                name="username"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 4, max: 20, message: '用户名长度在 4 到 20 个字符' }
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="请输入用户名"
                />
              </Form.Item>

              <Form.Item
                label="密码"
                name="password"
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 6, max: 20, message: '密码长度在 6 到 20 个字符' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请输入密码"
                />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  className="login-form-button"
                >
                  登录
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          {/* 注册标签 */}
          <TabPane tab="注册" key="2">
            <Form
              form={registerForm}
              name="register"
              onFinish={handleRegister}
              autoComplete="off"
              layout="vertical"
            >
              <Form.Item
                label="用户名"
                name="username"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 4, max: 20, message: '用户名长度在 4 到 20 个字符' }
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="请输入用户名"
                />
              </Form.Item>

              <Form.Item
                label="密码"
                name="password"
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 6, max: 20, message: '密码长度在 6 到 20 个字符' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请输入密码"
                />
              </Form.Item>

              <Form.Item
                label="确认密码"
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: '请确认密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请再次输入密码"
                />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  className="login-form-button"
                >
                  注册
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default LoginView;