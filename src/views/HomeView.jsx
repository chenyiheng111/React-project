import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, message } from 'antd';
import { 
  HomeOutlined, 
  UserOutlined, 
  BookOutlined, 
  LogoutOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header, Sider, Content } = Layout;
const { SubMenu } = Menu;

const HomeView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [current, setCurrent] = useState('');

  // 根据当前路径设置菜单选中项
  useEffect(() => {
    const pathname = location.pathname;
    if (pathname === '/') {
      setCurrent('quiz');
    } else if (pathname.startsWith('/users')) {
      setCurrent('users');
    } else if (pathname.startsWith('/questions')) {
      setCurrent('questions');
    }
  }, [location.pathname]);

  // 处理菜单点击
  const handleMenuClick = (e) => {
    const key = e.key;
    setCurrent(key);
    
    switch (key) {
      case 'quiz':
        navigate('/');
        break;
      case 'users':
        navigate('/users');
        break;
      case 'questions':
        navigate('/questions');
        break;
      default:
        break;
    }
  };

  // 处理退出登录
  const handleLogout = () => {
    logout();
    navigate('/login');
    message.success('已成功退出登录');
  };

  // 用户菜单
  const userMenu = (
    <Menu>
      <Menu.Item key="1" icon={<SettingOutlined />} disabled>
        个人设置
      </Menu.Item>
      <Menu.Item key="2" icon={<LogoutOutlined />} onClick={handleLogout}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  // 构建菜单数据
  const buildMenuItems = () => {
    const menuItems = [
      {
        key: 'quiz',
        icon: <HomeOutlined />,
        label: '在线答题'
      }
    ];

    // 如果是管理员，添加管理菜单
    if (isAdmin) {
      menuItems.push(
        {
          key: 'users',
          icon: <UserOutlined />,
          label: '用户管理'
        },
        {
          key: 'questions',
          icon: <BookOutlined />,
          label: '题库管理'
        }
      );
    }

    return menuItems;
  };

  return (
    <Layout className="admin-layout">
      {/* 顶部导航栏 */}
      <Header className="admin-header">
        <div className="admin-logo">Quiz 在线答题系统</div>
        <div>
          <Dropdown overlay={userMenu} trigger={['click']}>
            <Button type="text" className="user-info">
              <Avatar icon={<UserOutlined />} />
              <span style={{ marginLeft: 8 }}>{user?.username || '用户'}</span>
            </Button>
          </Dropdown>
        </div>
      </Header>

      <Layout>
        {/* 侧边栏菜单 */}
        <Sider 
          collapsible 
          collapsed={collapsed} 
          onCollapse={setCollapsed} 
          className="admin-sider"
        >
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[current]}
            onClick={handleMenuClick}
            className="admin-menu"
            items={buildMenuItems()}
          />
        </Sider>

        {/* 主内容区域 */}
        <Content className="admin-content">
          <div className="content-container">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default HomeView;