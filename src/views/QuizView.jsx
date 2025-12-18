import React, { useState, useEffect } from 'react';
import { Card, Button, Radio, Checkbox, Progress, Result, message, Space, Divider } from 'antd';
import { LeftOutlined, RightOutlined, ReloadOutlined, CheckOutlined } from '@ant-design/icons';
import { mockGetRandomQuestionsResponse, mockSaveQuizRecordResponse } from '../mock/data';

const { RadioGroup } = Radio;
const { Group: CheckboxGroup } = Checkbox;

const QuizView = () => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [duration, setDuration] = useState(0);
  const [timer, setTimer] = useState(null);

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

  // 开始答题
  const startQuiz = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/questions/random', {
        params: { limit: 10 } // 随机获取10道题
      });
      const { data } = response.data;
      setQuestions(data);
      setCurrentIndex(0);
      setAnswers(new Array(data.length).fill(null));
      setFinished(false);
      setScore(0);
      setCorrectCount(0);
      setWrongCount(0);
      setDuration(0);
      // 开始计时
      if (timer) {
        clearInterval(timer);
      }
      const newTimer = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      setTimer(newTimer);
    } catch (error) {
      message.error('获取题目失败');
      console.error('获取题目失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    startQuiz();
    
    // 组件卸载时清除计时器
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, []);

  // 处理答案选择
  const handleAnswerChange = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = value;
    setAnswers(newAnswers);
  };

  // 上一题
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // 下一题
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  // 跳转到指定题目
  const handleJump = (index) => {
    setCurrentIndex(index);
  };

  // 提交答题
  const handleSubmit = async () => {
    try {
      // 检查是否有未答的题目
      const unansweredCount = answers.filter(answer => answer === null).length;
      if (unansweredCount > 0) {
        const confirm = window.confirm(`还有${unansweredCount}道题未答，确定要提交吗？`);
        if (!confirm) {
          return;
        }
      }

      setLoading(true);
      // 停止计时
      if (timer) {
        clearInterval(timer);
        setTimer(null);
      }

      // 计算得分和正确/错误数量
      let totalScore = 0;
      let correct = 0;
      let wrong = 0;

      questions.forEach((question, index) => {
        const userAnswer = answers[index];
        const correctAnswer = question.answer;
        const isCorrect = checkAnswer(userAnswer, correctAnswer, question.type);
        
        if (isCorrect) {
          correct++;
          // 根据难度计算分数
          let questionScore = 10;
          if (question.difficulty === '2') {
            questionScore = 15;
          } else if (question.difficulty === '3') {
            questionScore = 20;
          }
          totalScore += questionScore;
        } else {
          wrong++;
        }
      });

      setScore(totalScore);
      setCorrectCount(correct);
      setWrongCount(wrong);
      setFinished(true);

      // 保存答题记录
      try {
        await axiosInstance.post('/api/quiz/record', {
          questions: questions.map(q => q.id),
          answers: answers,
          score: totalScore,
          duration: duration
        });
      } catch (error) {
        console.error('保存答题记录失败:', error);
      }

    } catch (error) {
      message.error('提交失败，请重试');
      console.error('提交失败:', error);
    } finally {
      setLoading(false);
    }
  };



  // 重新开始
  const handleRestart = () => {
    startQuiz();
  };

  // 格式化时间
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading && questions.length === 0) {
    return <div className="loading-container">正在加载题目...</div>;
  }

  if (questions.length === 0) {
    return (
      <Result
        status="warning"
        title="暂无题目"
        subTitle="题库中没有可用的题目，请联系管理员添加"
        extra={<Button type="primary" onClick={startQuiz}>刷新</Button>}
      />
    );
  }

  // 计算进度
  const progress = Math.round(((currentIndex + 1) / questions.length) * 100);

  // 当前题目
  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentIndex];
  const options = JSON.parse(currentQuestion.options) || [];

  return (
    <div className="quiz-container">
      <div className="quiz-progress">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>第 {currentIndex + 1} 题 / 共 {questions.length} 题</div>
          <div>时间: {formatTime(duration)}</div>
        </div>
        <Progress percent={progress} status="active" />
      </div>

      {/* 题目导航 */}
      <div className="question-navigation">
        {questions.map((_, index) => (
          <Button
            key={index}
            type={currentIndex === index ? 'primary' : 'default'}
            size="small"
            onClick={() => handleJump(index)}
            icon={answers[index] !== null ? <CheckOutlined /> : null}
            style={{ minWidth: 40 }}
          >
            {index + 1}
          </Button>
        ))}
      </div>

      <Divider />

      {!finished ? (
        <Card title={`${currentIndex + 1}. ${currentQuestion.content}`} className="question-card">
          <div style={{ marginBottom: 20 }}>
            <Space>
              <span>类型: {questionTypeMap[currentQuestion.type]}</span>
              <span>难度: {difficultyMap[currentQuestion.difficulty]}</span>
            </Space>
          </div>

          <div className="answer-options">
            {currentQuestion.type === '1' || currentQuestion.type === '3' ? (
              // 单选题或判断题
              <RadioGroup
                value={currentAnswer}
                onChange={(e) => handleAnswerChange(e.target.value)}
              >
                {options.map((option, index) => (
                  <Radio key={index} value={index}>
                    {String.fromCharCode(65 + index)}. {option}
                  </Radio>
                ))}
              </RadioGroup>
            ) : (
              // 多选题
              <CheckboxGroup
                value={currentAnswer || []}
                onChange={handleAnswerChange}
              >
                {options.map((option, index) => (
                  <Checkbox key={index} value={index}>
                    {String.fromCharCode(65 + index)}. {option}
                  </Checkbox>
                ))}
              </CheckboxGroup>
            )}
          </div>

          <Divider />

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              type="default"
              icon={<LeftOutlined />}
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              上一题
            </Button>
            <Space>
              <Button
                type="primary"
                icon={<RightOutlined />}
                onClick={handleNext}
                disabled={currentIndex === questions.length - 1}
              >
                下一题
              </Button>
              <Button
                type="primary"
                danger
                onClick={handleSubmit}
                loading={loading}
              >
                提交答案
              </Button>
            </Space>
          </div>
        </Card>
      ) : (
        <Result
          status={score >= 60 ? 'success' : 'error'}
          title={score >= 60 ? '答题完成！' : '答题完成！'}
          subTitle={`你的得分是 ${score} 分`}
          extra={[
            <div key="1" style={{ marginBottom: 20 }}>
              <div>共 {questions.length} 题，答对 {correctCount} 题，答错 {wrongCount} 题</div>
              <div>用时: {formatTime(duration)}</div>
            </div>,
            <Button key="2" type="primary" icon={<ReloadOutlined />} onClick={handleRestart}>
              重新答题
            </Button>
          ]}
        />
      )}
    </div>
  );
};

// 检查答案是否正确
const checkAnswer = (userAnswer, correctAnswer, questionType) => {
  if (userAnswer === null) return false;
  
  if (questionType === '1' || questionType === '3') {
    // 单选题或判断题
    return String(userAnswer) === String(correctAnswer);
  } else {
    // 多选题
    if (!Array.isArray(userAnswer)) {
      return false;
    }
    if (!Array.isArray(correctAnswer)) {
      correctAnswer = JSON.parse(correctAnswer);
    }
    if (userAnswer.length !== correctAnswer.length) {
      return false;
    }
    return userAnswer.sort().join(',') === correctAnswer.sort().join(',');
  }
};

export default QuizView;