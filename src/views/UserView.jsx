import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Popconfirm, message, Space, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { mockGetUsersResponse, mockAddUserResponse, mockUpdateUserResponse, mockDeleteUserResponse } from '../mock/data';

const { Option } = Select;

const UserView = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // 获取用户列表
  const fetchUsers = async (page = 1, pageSize = 10, keyword = '') => {
    try {
      setLoading(true);
      const response = mockGetUsersResponse(page, pageSize, keyword);
      const { data, total } = response;
      setUsers(data);
      setPagination(prev => ({
        ...prev,
        current: page,
        pageSize,
        total
      }));
    } catch (error) {
      message.error('获取用户列表失败');
      console.error('获取用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchUsers();
  }, []);

  // 搜索用户
  const handleSearch = () => {
    fetchUsers(1, pagination.pageSize, searchText);
  };

  // 重置搜索
  const handleReset = () => {
    setSearchText('');
    fetchUsers(1, pagination.pageSize);
  };

  // 分页变化
  const handlePageChange = (page, pageSize) => {
    fetchUsers(page, pageSize, searchText);
  };

  // 显示添加用户模态框
  const showAddModal = () => {
    setIsEditMode(false);
    setCurrentUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 显示编辑用户模态框
  const showEditModal = (record) => {
    setIsEditMode(true);
    setCurrentUser(record);
    form.setFieldsValue({
      username: record.username,
      role: record.role
    });
    setIsModalVisible(true);
  };

  // 关闭模态框
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (isEditMode) {
        // 编辑用户
        const response = mockUpdateUserResponse(currentUser.id, values);
        if (response.success) {
          message.success('用户更新成功');
        } else {
          message.error(response.message);
          return;
        }
      } else {
        // 添加用户
        const response = mockAddUserResponse(values);
        if (response.success) {
          message.success('用户添加成功');
        } else {
          message.error(response.message);
          return;
        }
      }

      setIsModalVisible(false);
      fetchUsers(pagination.current, pagination.pageSize, searchText);
    } catch (error) {
      message.error('操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 删除用户
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = mockDeleteUserResponse(id);
      if (response.success) {
        message.success('用户删除成功');
        fetchUsers(pagination.current, pagination.pageSize, searchText);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('用户删除失败');
      console.error('删除用户失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 表格列配置
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      filterDropdown: () => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="搜索用户名"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button type="primary" onClick={handleSearch} icon={<SearchOutlined />} size="small">
              搜索
            </Button>
            <Button onClick={handleReset} size="small">
              重置
            </Button>
          </Space>
        </div>
      ),
      filterIcon: () => <SearchOutlined />
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <span>{role === '1' ? '管理员' : '普通用户'}</span>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => showEditModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="danger" 
              icon={<DeleteOutlined />} 
              size="small"
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="content-container">
      <div className="button-group">
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={showAddModal}
        >
          添加用户
        </Button>
        <div className="search-container">
          <Input
            placeholder="搜索用户名"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 200 }}
          />
          <Button 
            type="default" 
            icon={<SearchOutlined />}
            onClick={handleSearch}
          >
            搜索
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        loading={loading}
        rowKey="id"
        pagination={pagination}
        onChange={handlePageChange}
        className="table-container"
      />

      {/* 用户表单模态框 */}
      <Modal
        title={isEditMode ? '编辑用户' : '添加用户'}
        visible={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        confirmLoading={loading}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ role: '0' }}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 4, max: 20, message: '用户名长度在 4 到 20 个字符' }
            ]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          {!isEditMode && (
            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, max: 20, message: '密码长度在 6 到 20 个字符' }
              ]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}

          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              <Option value="0">普通用户</Option>
              <Option value="1">管理员</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserView;