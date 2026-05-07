import React, { useState, useEffect } from 'react'
import { Layout, Menu, Table, Button, Modal, Form, Input, Select, Upload, message, Card, Row, Col, DatePicker } from 'antd'
import { LineChartOutlined, UploadOutlined, DeleteOutlined, LogoutOutlined } from '@ant-design/icons'
import * as XLSX from 'xlsx'
import { getAllData, addRecord, updateRecord, deleteRecord, importData, login, logout, getCurrentUser, isLoggedIn } from './utils/storage'

const { Header, Content, Footer } = Layout
const { Option } = Select

// 学期选项
const semesters = ['第一学期', '第二学期']

// 学年自动生成
const currentYear = new Date().getFullYear()
const schoolYears = []
for (let y = currentYear; y >= currentYear - 5; y--) {
  schoolYears.push(`${y}-${y + 1}`)
}

// 默认科目列表
const defaultSubjects = ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治']

// 计算综合指数
const calculateCompositeIndex = (record) => {
  const { high_rate, pass_rate, avg_score, actual_count, expected_count } = record
  const attendanceRate = expected_count > 0 ? (actual_count / expected_count) * 100 : 100
  const compositeIndex = (high_rate * 0.3 + pass_rate * 0.3 + avg_score * 0.2 + attendanceRate * 0.2)
  return Math.round(compositeIndex * 100) / 100
}

// 登录组件
const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  
  const handleLogin = () => {
    try {
      const user = login(username, password)
      onLogin(user)
    } catch (e) {
      message.error('用户名或密码错误')
    }
  }
  
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card title="教学质量分析系统登录" style={{ width: 400 }}>
        <Form>
          <Form.Item label="用户名">
            <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item label="密码">
            <Input.Password value={password} onChange={e => setPassword(e.target.value)} placeholder="请输入密码" />
          </Form.Item>
          <Button type="primary" onClick={handleLogin} style={{ width: '100%' }}>登录</Button>
          <div style={{ marginTop: 16, fontSize: 12, color: '#999' }}>
            默认账号: admin / admin123
          </div>
        </Form>
      </Card>
    </div>
  )
}

// 主应用
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(isLoggedIn())
  const [user, setUser] = useState(getCurrentUser())
  const [data, setData] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [form] = Form.useForm()
  
  useEffect(() => {
    if (isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated])
  
  const loadData = async () => {
    const records = await getAllData()
    setData(records)
  }
  
  const handleLogin = (user) => {
    setIsAuthenticated(true)
    setUser(user)
  }
  
  const handleLogout = () => {
    logout()
    setIsAuthenticated(false)
    setUser(null)
  }
  
  const handleAdd = () => {
    setEditingRecord(null)
    form.resetFields()
    setModalVisible(true)
  }
  
  const handleEdit = (record) => {
    setEditingRecord(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }
  
  const handleDelete = async (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      onOk: async () => {
        await deleteRecord(id)
        message.success('删除成功')
        loadData()
      }
    })
  }
  
  const handleSubmit = async (values) => {
    try {
      const record = {
        ...values,
        composite_index: calculateCompositeIndex(values)
      }
      
      if (editingRecord) {
        await updateRecord(editingRecord.id, record)
        message.success('更新成功')
      } else {
        await addRecord(record)
        message.success('添加成功')
      }
      
      setModalVisible(false)
      loadData()
    } catch (e) {
      message.error('操作失败')
    }
  }
  
  const handleImport = async (file) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        
        // 处理导入的数据
        const records = jsonData.map(row => ({
          school_year: row['学年'] || row['school_year'] || '',
          semester: row['学期'] || row['semester'] || '',
          subject: row['科目'] || row['subject'] || '',
          grade: parseInt(row['年级'] || row['grade']) || 1,
          class_num: parseInt(row['班级'] || row['class_num']) || 1,
          teacher: row['教师'] || row['teacher'] || '',
          expected_count: parseInt(row['应考人数'] || row['expected_count']) || 0,
          actual_count: parseInt(row['实考人数'] || row['actual_count']) || 0,
          high_count: parseInt(row['高分人数'] || row['high_count']) || 0,
          pass_count: parseInt(row['及格人数'] || row['pass_count']) || 0,
          low_count: parseInt(row['低分人数'] || row['low_count']) || 0,
          avg_score: parseFloat(row['平均分'] || row['avg_score']) || 0,
          high_rate: parseFloat(row['高分率'] || row['high_rate']) || 0,
          pass_rate: parseFloat(row['及格率'] || row['pass_rate']) || 0,
          low_rate: parseFloat(row['低分率'] || row['low_rate']) || 0,
          avg_rate: parseFloat(row['平均率'] || row['avg_rate']) || 0,
        })).map(record => ({
          ...record,
          composite_index: calculateCompositeIndex(record)
        }))
        
        await importData(records)
        message.success(`成功导入 ${records.length} 条记录`)
        loadData()
      } catch (error) {
        message.error('导入失败，请检查文件格式')
      }
    }
    reader.readAsBinaryString(file)
    return false
  }
  
  const columns = [
    { title: '学年', dataIndex: 'school_year', key: 'school_year', width: 100 },
    { title: '学期', dataIndex: 'semester', key: 'semester', width: 80 },
    { title: '科目', dataIndex: 'subject', key: 'subject', width: 80 },
    { title: '年级', dataIndex: 'grade', key: 'grade', width: 60 },
    { title: '班级', dataIndex: 'class_num', key: 'class_num', width: 60 },
    { title: '教师', dataIndex: 'teacher', key: 'teacher', width: 100 },
    { title: '应考人数', dataIndex: 'expected_count', key: 'expected_count', width: 80 },
    { title: '实考人数', dataIndex: 'actual_count', key: 'actual_count', width: 80 },
    { title: '高分人数', dataIndex: 'high_count', key: 'high_count', width: 80 },
    { title: '及格人数', dataIndex: 'pass_count', key: 'pass_count', width: 80 },
    { title: '低分人数', dataIndex: 'low_count', key: 'low_count', width: 80 },
    { title: '平均分', dataIndex: 'avg_score', key: 'avg_score', width: 80 },
    { title: '综合指数', dataIndex: 'composite_index', key: 'composite_index', width: 100, 
      render: (val) => <span style={{ color: val >= 80 ? 'green' : val >= 60 ? 'orange' : 'red' }}>{val}</span> },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>删除</Button>
        </>
      )
    }
  ]
  
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />
  }
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', background: '#001529', padding: '0 20px' }}>
        <div style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', marginRight: 'auto' }}>
          米公小学教学质量分析系统
        </div>
        <div style={{ color: 'white', marginRight: 20 }}>欢迎，{user?.username}</div>
        <Button type="primary" icon={<LogoutOutlined />} onClick={handleLogout}>退出</Button>
      </Header>
      <Content style={{ padding: '20px 50px' }}>
        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col span={6}><Card><div style={{ fontSize: 24, color: '#1890ff' }}>{data.length}</div><div>总记录数</div></Card></Col>
          <Col span={6}><Card><div style={{ fontSize: 24, color: '#52c41a' }}>{data.filter(d => d.composite_index >= 80).length}</div><div>优秀</div></Card></Col>
          <Col span={6}><Card><div style={{ fontSize: 24, color: '#faad14' }}>{data.filter(d => d.composite_index >= 60 && d.composite_index < 80).length}</div><div>良好</div></Card></Col>
          <Col span={6}><Card><div style={{ fontSize: 24, color: '#f5222d' }}>{data.filter(d => d.composite_index < 60).length}</div><div>需改进</div></Card></Col>
        </Row>
        <Card
          title="教学质量数据"
          extra={
            <>
              <Upload beforeUpload={handleImport} showUploadList={false}>
                <Button icon={<UploadOutlined />}>导入Excel</Button>
              </Upload>
              <Button type="primary" onClick={handleAdd} style={{ marginLeft: 10 }}>添加记录</Button>
            </>
          }
        >
          <Table dataSource={data} columns={columns} rowKey="id" scroll={{ x: 1500 }} pagination={{ pageSize: 10 }} />
        </Card>
      </Content>
      <Modal
        title={editingRecord ? '编辑记录' : '添加记录'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="school_year" label="学年" rules={[{ required: true }]}>
            <Select>
              {schoolYears.map(y => <Option key={y} value={y}>{y}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="semester" label="学期" rules={[{ required: true }]}>
            <Select>
              {semesters.map(s => <Option key={s} value={s}>{s}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="subject" label="科目" rules={[{ required: true }]}>
            <Select>
              {defaultSubjects.map(s => <Option key={s} value={s}>{s}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="grade" label="年级" rules={[{ required: true }]}>
            <Select>
              {[1,2,3,4,5,6].map(g => <Option key={g} value={g}>{g}年级</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="class_num" label="班级" rules={[{ required: true }]}>
            <Select>
              {[1,2,3,4,5,6,7,8,9,10].map(c => <Option key={c} value={c}>{c}班</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="teacher" label="教师">
            <Input />
          </Form.Item>
          <Form.Item name="expected_count" label="应考人数" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="actual_count" label="实考人数" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="high_count" label="高分人数" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="pass_count" label="及格人数" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="low_count" label="低分人数" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="avg_score" label="平均分" rules={[{ required: true }]}>
            <Input type="number" step="0.01" />
          </Form.Item>
          <Form.Item name="high_rate" label="高分率(%)" rules={[{ required: true }]}>
            <Input type="number" step="0.01" />
          </Form.Item>
          <Form.Item name="pass_rate" label="及格率(%)" rules={[{ required: true }]}>
            <Input type="number" step="0.01" />
          </Form.Item>
          <Form.Item name="low_rate" label="低分率(%)" rules={[{ required: true }]}>
            <Input type="number" step="0.01" />
          </Form.Item>
          <Form.Item name="avg_rate" label="平均率(%)">
            <Input type="number" step="0.01" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              {editingRecord ? '更新' : '添加'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Footer style={{ textAlign: 'center' }}>米公小学教学质量分析系统 ©2024</Footer>
    </Layout>
  )
}

export default App
