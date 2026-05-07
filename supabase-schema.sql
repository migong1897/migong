-- 教学质量分析系统数据库表

-- 1. 创建成绩数据表
CREATE TABLE IF NOT EXISTS teaching_quality_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_year VARCHAR(20) NOT NULL,
  semester VARCHAR(10) NOT NULL,
  subject VARCHAR(50) NOT NULL,
  grade INTEGER NOT NULL,
  class_num INTEGER NOT NULL,
  teacher VARCHAR(50),
  expected_count INTEGER DEFAULT 0,
  actual_count INTEGER DEFAULT 0,
  high_count INTEGER DEFAULT 0,
  pass_count INTEGER DEFAULT 0,
  low_count INTEGER DEFAULT 0,
  avg_score DECIMAL(10,2) DEFAULT 0,
  high_rate DECIMAL(10,2) DEFAULT 0,
  pass_rate DECIMAL(10,2) DEFAULT 0,
  low_rate DECIMAL(10,2) DEFAULT 0,
  avg_rate DECIMAL(10,2) DEFAULT 0,
  composite_index DECIMAL(10,4) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'teacher',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 插入默认管理员账号
INSERT INTO users (username, password, role) 
VALUES ('admin', 'admin123', 'admin')
ON CONFLICT (username) DO NOTHING;

-- 4. 启用 Row Level Security
ALTER TABLE teaching_quality_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 5. 创建公开访问策略（所有人都可以读取）
CREATE POLICY "Allow public read" ON teaching_quality_data
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON teaching_quality_data
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON teaching_quality_data
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete" ON teaching_quality_data
  FOR DELETE USING (true);

-- 6. 用户表策略
CREATE POLICY "Allow public read users" ON users
  FOR SELECT USING (true);
