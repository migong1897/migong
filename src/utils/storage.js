import { supabase } from './supabase'

// 表名
const TABLE_NAME = 'teaching_quality_data'
const USERS_TABLE = 'users'

// 获取所有数据
export async function getAllData() {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('获取数据失败:', error)
    return []
  }
  return data || []
}

// 添加单条记录
export async function addRecord(record) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert([record])
    .select()
    .single()
  
  if (error) {
    console.error('添加记录失败:', error)
    throw error
  }
  return data
}

// 更新记录
export async function updateRecord(id, updates) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('更新记录失败:', error)
    throw error
  }
  return data
}

// 删除记录
export async function deleteRecord(id) {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('删除记录失败:', error)
    throw error
  }
}

// 批量导入数据
export async function importData(records) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(records)
    .select()
  
  if (error) {
    console.error('批量导入失败:', error)
    throw error
  }
  return data.length
}

// 用户登录
export async function login(username, password) {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .single()
  
  if (error || !data) {
    throw new Error('用户名或密码错误')
  }
  
  const user = { username: data.username, role: data.role, id: data.id }
  localStorage.setItem('teaching_quality_user', JSON.stringify(user))
  return user
}

// 退出登录
export function logout() {
  localStorage.removeItem('teaching_quality_user')
}

// 获取当前用户
export function getCurrentUser() {
  const user = localStorage.getItem('teaching_quality_user')
  return user ? JSON.parse(user) : null
}

// 检查是否已登录
export function isLoggedIn() {
  return !!localStorage.getItem('teaching_quality_user')
}
