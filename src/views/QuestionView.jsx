import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Popconfirm, message, Space, Switch, InputNumber, Collapse } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { mockGetQuestionsResponse, mockAddQuestionResponse, mockUpdateQuestionResponse, mockDeleteQuestionResponse } from '../mock/data';

const { Option } = Select;
const { Panel } = Collapse;

const QuestionView = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [form] = Form.useForm();
  const [options, setOptions] = useState(['', '', '', '']);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // 题目类型映射
  const questionTypeMap = {
    '1': '单选题',
    '2': '多选题',
    '3': '判断题'
  };

  // 难度映射
  const difficultyMap = {
    '1': '简单',
    '2': '中等',
    '3': '困难'
  };

  // 获取题目列表
  const fetchQuestions = async (page = 1, pageSize = 10, keyword = '') => {
    try {
      setLoading(true);
      const response = mockGetQuestionsResponse(page, pageSize, keyword);
      const { data, total } = response;
      setQuestions(data);
      setPagination(prev => ({
        ...prev,
        current: page,
        pageSize,
        total
      }));
    } catch (error) {
      message.error('获取题目列表失败');
      console.error('获取题目列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchQuestions();
  }, []);

  // 搜索题目
  const handleSearch = () => {
    fetchQuestions(1, pagination.pageSize, searchText);
  };

  // 重置搜索
  const handleReset = () => {
    setSearchText('');
    fetchQuestions(1, pagination.pageSize);
  };

  // 分页变化
  const handlePageChange = (page, pageSize) => {
    fetchQuestions(page, pageSize, searchText);
  };

  // 处理选项变化
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    form.setFieldsValue({ options: newOptions });
  };

  // 处理题目类型变化
  const handleTypeChange = (type) => {
    // 根据题目类型重置选项数量
    if (type === '3') { // 判断题
      setOptions(['对', '错']);
      form.setFieldsValue({ options: ['对', '错'] });
    } else {
      setOptions(['', '', '', '']);
      form.setFieldsValue({ options: ['', '', '', ''] });
    }
    form.setFieldsValue({ type });
  };

  // 显示添加题目模态框
  const showAddModal = () => {
    setIsEditMode(false);
    setCurrentQuestion(null);
    setOptions(['', '', '', '']);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 显示编辑题目模态框
  const showEditModal = (record) => {
    setIsEditMode(true);
    setCurrentQuestion(record);
    // 处理选项
    const questionOptions = record.options ? JSON.parse(record.options) : [];
    if (questionOptions.length < 4) {
      const filledOptions = [...questionOptions];
      for (let i = questionOptions.length; i < 4; i++) {
        filledOptions.push('');
      }
      setOptions(filledOptions);
      form.setFieldsValue({ options: filledOptions });
    } else {
      setOptions(questionOptions);
      form.setFieldsValue({ options: questionOptions });
    }
    // 设置表单值
    form.setFieldsValue({
      content: record.content,
      type: record.type,
      difficulty: record.difficulty,
      answer: record.answer
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

      // 处理答案格式
      const formattedValues = {
        ...values,
        options: JSON.stringify(values.options.filter(opt => opt.trim() !== ''))
      };

      if (isEditMode) {
        // 编辑题目
        const response = mockUpdateQuestionResponse(currentQuestion.id, formattedValues);
        if (response.success) {
          message.success('题目更新成功');
        } else {
          message.error(response.message);
          return;
        }
      } else {
        // 添加题目
        const response = mockAddQuestionResponse(formattedValues);
        if (response.success) {
          message.success('题目添加成功');
        } else {
          message.error(response.message);
          return;
        }
      }

      setIsModalVisible(false);
      fetchQuestions(pagination.current, pagination.pageSize, searchText);
    } catch (error) {
      message.error('操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 删除题目
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = mockDeleteQuestionResponse(id);
      if (response.success) {
        message.success('题目删除成功');
        fetchQuestions(pagination.current, pagination.pageSize, searchText);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('题目删除失败');
      console.error('删除题目失败:', error);
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
      title: '题目内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      filterDropdown: () => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="搜索题目"
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
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <span>{questionTypeMap[type] || '未知'}</span>
      ),
      filters: [
        { text: '单选题', value: '1' },
        { text: '多选题', value: '2' },
        { text: '判断题', value: '3' }
      ],
      onFilter: (value, record) => record.type === value
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      render: (difficulty) => (
        <span>{difficultyMap[difficulty] || '未知'}</span>
      ),
      filters: [
        { text: '简单', value: '1' },
        { text: '中等', value: '2' },
        { text: '困难', value: '3' }
      ],
      onFilter: (value, record) => record.difficulty === value
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
            title="确定要删除这个题目吗？"
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
          添加题目
        </Button>
        <div className="search-container">
          <Input
            placeholder="搜索题目"
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
        dataSource={questions}
        loading={loading}
        rowKey="id"
        pagination={pagination}
        onChange={handlePageChange}
        className="table-container"
      />

      {/* 题目表单模态框 */}
      <Modal
        title={isEditMode ? '编辑题目' : '添加题目'}
        visible={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        confirmLoading={loading}
        width={800}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ type: '1', difficulty: '2', options: ['', '', '', ''] }}
        >
          <Form.Item
            name="content"
            label="题目内容"
            rules={[{ required: true, message: '请输入题目内容' }]}
          >
            <Input.TextArea rows={3} placeholder="请输入题目内容" />
          </Form.Item>

          <Form.Item
            name="type"
            label="题目类型"
            rules={[{ required: true, message: '请选择题目类型' }]}
          >
            <Select onChange={handleTypeChange}>
              <Option value="1">单选题</Option>
              <Option value="2">多选题</Option>
              <Option value="3">判断题</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="difficulty"
            label="难度"
            rules={[{ required: true, message: '请选择难度' }]}
          >
            <Select>
              <Option value="1">简单</Option>
              <Option value="2">中等</Option>
              <Option value="3">困难</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="options"
            label="选项"
            rules={[{ required: true, message: '请至少输入一个选项' }]}
          >
            <div>
              {options.map((option, index) => {
                // 如果是判断题且不是前两个选项，隐藏输入框
                if (form.getFieldValue('type') === '3' && index > 1) {
                  return null;
                }
                return (
                  <Form.Item
                    key={index}
                    noStyle
                  >
                    <Input
                      placeholder={`选项 ${String.fromCharCode(65 + index)}`}
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      style={{ marginBottom: 8 }}
                    />
                  </Form.Item>
                );
              })}
            </div>
          </Form.Item>

          <Form.Item
            name="answer"
            label="正确答案"
            rules={[{ required: true, message: '请输入正确答案' }]}
          >
            {form.getFieldValue('type') === '3' ? (
              <Select>
                <Option value="0">对</Option>
                <Option value="1">错</Option>
              </Select>
            ) : form.getFieldValue('type') === '2' ? (
              <Select mode="multiple">
                {options.map((option, index) => {
                  if (!option.trim()) return null;
                  return (
                    <Option key={index} value={index}>
                      {String.fromCharCode(65 + index)}: {option}
                    </Option>
                  );
                })}
              </Select>
            ) : (
              <Select>
                {options.map((option, index) => {
                  if (!option.trim()) return null;
                  return (
                    <Option key={index} value={index}>
                      {String.fromCharCode(65 + index)}: {option}
                    </Option>
                  );
                })}
              </Select>
            )}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default QuestionView;