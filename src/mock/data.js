// 模拟数据文件

// 模拟用户数据
export const mockUsers = [
  { id: 1, username: 'admin', password: 'admin123', role: '1' }, // 管理员
  { id: 2, username: 'user1', password: 'user123', role: '0' },  // 普通用户
  { id: 3, username: 'user2', password: 'user123', role: '0' },  // 普通用户
  { id: 4, username: 'user3', password: 'user123', role: '0' },  // 普通用户
  { id: 5, username: 'user4', password: 'user123', role: '0' },  // 普通用户
];

// 模拟题目数据
export const mockQuestions = [
  {
    id: 1,
    content: 'React的核心思想是什么？',
    type: '1', // 单选题
    difficulty: '2', // 中等
    options: JSON.stringify(['组件化', '响应式', '单向数据流', '虚拟DOM']),
    answer: '0'
  },
  {
    id: 2,
    content: '以下哪些是JavaScript的基本数据类型？',
    type: '2', // 多选题
    difficulty: '2', // 中等
    options: JSON.stringify(['String', 'Number', 'Boolean', 'Object']),
    answer: JSON.stringify(['0', '1', '2'])
  },
  {
    id: 3,
    content: 'CSS盒模型包括margin、padding、border和content四个部分。',
    type: '3', // 判断题
    difficulty: '1', // 简单
    options: JSON.stringify(['对', '错']),
    answer: '0'
  },
  {
    id: 4,
    content: '以下哪个不是React的生命周期方法？',
    type: '1', // 单选题
    difficulty: '3', // 困难
    options: JSON.stringify(['componentDidMount', 'componentWillUnmount', 'render', 'componentWillUpdate']),
    answer: '3'
  },
  {
    id: 5,
    content: '以下哪些是HTTP的常用请求方法？',
    type: '2', // 多选题
    difficulty: '2', // 中等
    options: JSON.stringify(['GET', 'POST', 'PUT', 'DELETE']),
    answer: JSON.stringify(['0', '1', '2', '3'])
  },
  {
    id: 6,
    content: 'JavaScript是一种强类型语言。',
    type: '3', // 判断题
    difficulty: '1', // 简单
    options: JSON.stringify(['对', '错']),
    answer: '1'
  },
  {
    id: 7,
    content: '以下哪个是React的状态管理库？',
    type: '1', // 单选题
    difficulty: '2', // 中等
    options: JSON.stringify(['Redux', 'Vuex', 'MobX', 'All of the above']),
    answer: '3'
  },
  {
    id: 8,
    content: '以下哪些是CSS预处理器？',
    type: '2', // 多选题
    difficulty: '2', // 中等
    options: JSON.stringify(['Sass', 'Less', 'Stylus', 'PostCSS']),
    answer: JSON.stringify(['0', '1', '2'])
  },
  {
    id: 9,
    content: 'HTML5新增的语义化标签包括header、footer、nav等。',
    type: '3', // 判断题
    difficulty: '1', // 简单
    options: JSON.stringify(['对', '错']),
    answer: '0'
  },
  {
    id: 10,
    content: '以下哪个是JavaScript的异步编程解决方案？',
    type: '1', // 单选题
    difficulty: '3', // 困难
    options: JSON.stringify(['Promise', 'async/await', 'Generator', 'All of the above']),
    answer: '3'
  },
  {
    id: 11,
    content: '以下哪个是React的UI组件库？',
    type: '1', // 单选题
    difficulty: '1', // 简单
    options: JSON.stringify(['Ant Design', 'Element UI', 'Bootstrap', 'Materialize']),
    answer: '0'
  },
  {
    id: 12,
    content: '以下哪些是浏览器的存储方式？',
    type: '2', // 多选题
    difficulty: '2', // 中等
    options: JSON.stringify(['localStorage', 'sessionStorage', 'Cookie', 'IndexedDB']),
    answer: JSON.stringify(['0', '1', '2', '3'])
  }
];

// 模拟答题记录数据
export const mockQuizRecords = [
  { id: 1, userId: 2, score: 85, duration: 120, date: '2024-01-15T10:30:00' },
  { id: 2, userId: 3, score: 90, duration: 110, date: '2024-01-16T14:20:00' },
  { id: 3, userId: 2, score: 75, duration: 130, date: '2024-01-17T09:45:00' },
];

// 模拟登录响应
export const mockLoginResponse = (username, password) => {
  const user = mockUsers.find(u => u.username === username && u.password === password);
  if (user) {
    return {
      success: true,
      data: {
        token: `mock-token-${user.id}`,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      }
    };
  }
  return {
    success: false,
    message: '用户名或密码错误'
  };
};

// 模拟注册响应
export const mockRegisterResponse = (username, password) => {
  const userExists = mockUsers.find(u => u.username === username);
  if (userExists) {
    return {
      success: false,
      message: '用户名已存在'
    };
  }
  const newUser = {
    id: mockUsers.length + 1,
    username,
    password,
    role: '0' // 默认普通用户
  };
  mockUsers.push(newUser);
  return {
    success: true,
    data: {
      token: `mock-token-${newUser.id}`,
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role
      }
    }
  };
};

// 模拟获取用户列表
export const mockGetUsersResponse = (page = 1, pageSize = 10, keyword = '') => {
  let filteredUsers = [...mockUsers];
  if (keyword) {
    filteredUsers = filteredUsers.filter(user => user.username.includes(keyword));
  }
  
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedUsers = filteredUsers.slice(start, end);
  
  return {
    success: true,
    data: paginatedUsers,
    total: filteredUsers.length
  };
};

// 模拟获取题目列表
export const mockGetQuestionsResponse = (page = 1, pageSize = 10, keyword = '', type = '', difficulty = '') => {
  let filteredQuestions = [...mockQuestions];
  
  if (keyword) {
    filteredQuestions = filteredQuestions.filter(q => q.content.includes(keyword));
  }
  if (type) {
    filteredQuestions = filteredQuestions.filter(q => q.type === type);
  }
  if (difficulty) {
    filteredQuestions = filteredQuestions.filter(q => q.difficulty === difficulty);
  }
  
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedQuestions = filteredQuestions.slice(start, end);
  
  return {
    success: true,
    data: paginatedQuestions,
    total: filteredQuestions.length
  };
};

// 模拟获取随机题目
export const mockGetRandomQuestionsResponse = (limit = 10) => {
  // 随机打乱题目顺序
  const shuffled = [...mockQuestions].sort(() => 0.5 - Math.random());
  const randomQuestions = shuffled.slice(0, limit);
  
  return {
    success: true,
    data: randomQuestions
  };
};

// 模拟保存答题记录
export const mockSaveQuizRecordResponse = (data) => {
  const newRecord = {
    id: mockQuizRecords.length + 1,
    userId: 2, // 模拟当前用户ID
    score: data.score,
    duration: data.duration,
    date: new Date().toISOString()
  };
  mockQuizRecords.push(newRecord);
  
  return {
    success: true,
    data: newRecord
  };
};

// 模拟添加用户
export const mockAddUserResponse = (userData) => {
  const userExists = mockUsers.find(u => u.username === userData.username);
  if (userExists) {
    return {
      success: false,
      message: '用户名已存在'
    };
  }
  
  const newUser = {
    id: mockUsers.length + 1,
    ...userData
  };
  mockUsers.push(newUser);
  
  return {
    success: true,
    data: newUser
  };
};

// 模拟更新用户
export const mockUpdateUserResponse = (id, userData) => {
  const userIndex = mockUsers.findIndex(u => u.id === id);
  if (userIndex === -1) {
    return {
      success: false,
      message: '用户不存在'
    };
  }
  
  // 检查用户名是否重复（排除当前用户）
  const usernameExists = mockUsers.find(u => u.username === userData.username && u.id !== id);
  if (usernameExists) {
    return {
      success: false,
      message: '用户名已存在'
    };
  }
  
  const updatedUser = {
    ...mockUsers[userIndex],
    ...userData
  };
  mockUsers[userIndex] = updatedUser;
  
  return {
    success: true,
    data: updatedUser
  };
};

// 模拟删除用户
export const mockDeleteUserResponse = (id) => {
  const userIndex = mockUsers.findIndex(u => u.id === id);
  if (userIndex === -1) {
    return {
      success: false,
      message: '用户不存在'
    };
  }
  
  // 不能删除管理员
  if (mockUsers[userIndex].role === '1') {
    return {
      success: false,
      message: '不能删除管理员用户'
    };
  }
  
  mockUsers.splice(userIndex, 1);
  
  return {
    success: true,
    message: '用户删除成功'
  };
};

// 模拟添加题目
export const mockAddQuestionResponse = (questionData) => {
  const newQuestion = {
    id: mockQuestions.length + 1,
    ...questionData
  };
  mockQuestions.push(newQuestion);
  
  return {
    success: true,
    data: newQuestion
  };
};

// 模拟更新题目
export const mockUpdateQuestionResponse = (id, questionData) => {
  const questionIndex = mockQuestions.findIndex(q => q.id === id);
  if (questionIndex === -1) {
    return {
      success: false,
      message: '题目不存在'
    };
  }
  
  const updatedQuestion = {
    ...mockQuestions[questionIndex],
    ...questionData
  };
  mockQuestions[questionIndex] = updatedQuestion;
  
  return {
    success: true,
    data: updatedQuestion
  };
};

// 模拟删除题目
export const mockDeleteQuestionResponse = (id) => {
  const questionIndex = mockQuestions.findIndex(q => q.id === id);
  if (questionIndex === -1) {
    return {
      success: false,
      message: '题目不存在'
    };
  }
  
  mockQuestions.splice(questionIndex, 1);
  
  return {
    success: true,
    message: '题目删除成功'
  };
};
