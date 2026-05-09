import { CenterId } from './centers'

// 人员角色
export type PersonnelRole = 'dispatcher' | 'technician' | 'supervisor'

// 人员状态
export type PersonnelStatus = 'idle' | 'working' | 'offline'

// 人员数据结构
export interface Personnel {
  id: string
  name: string          // 姓名
  phone: string         // 联系电话
  role: PersonnelRole   // 角色
  status: PersonnelStatus  // 状态
  centerId: CenterId   // 所属中心
  currentOrderId?: string  // 当前处理的工单ID
  createdAt: string
}

// 角色名称映射
export const ROLE_MAP: Record<PersonnelRole, string> = {
  dispatcher: '调度员',
  technician: '维修员',
  supervisor: '班长',
}

// 状态名称映射
export const STATUS_MAP: Record<PersonnelStatus, string> = {
  idle: '空闲',
  working: '工作中',
  offline: '离线',
}

// 状态颜色映射
export const STATUS_COLORS: Record<PersonnelStatus, string> = {
  idle: '#22c55e',      // 绿色
  working: '#f59e0b',   // 黄色
  offline: '#6b7280',   // 灰色
}

// 角色颜色映射
export const ROLE_COLORS: Record<PersonnelRole, string> = {
  dispatcher: '#3b82f6',  // 蓝色
  technician: '#8b5cf6',  // 紫色
  supervisor: '#ef4444',  // 红色
}

// 生成唯一ID
export function generatePersonnelId(): string {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `P-${date}-${random}`
}

// 初始演示数据
export const INITIAL_PERSONNEL: Personnel[] = [
  // 南星中心
  { id: 'P-20260509-NX01', name: '张伟', phone: '13800138001', role: 'technician', status: 'idle', centerId: 'nanxing', createdAt: new Date().toISOString() },
  { id: 'P-20260509-NX02', name: '李娜', phone: '13800138002', role: 'technician', status: 'working', centerId: 'nanxing', createdAt: new Date().toISOString() },
  { id: 'P-20260509-NX03', name: '王强', phone: '13800138003', role: 'supervisor', status: 'idle', centerId: 'nanxing', createdAt: new Date().toISOString() },
  // 钱江新城中心
  { id: 'P-20260509-QJ01', name: '刘洋', phone: '13800138011', role: 'technician', status: 'idle', centerId: 'qianjiang', createdAt: new Date().toISOString() },
  { id: 'P-20260509-QJ02', name: '陈静', phone: '13800138012', role: 'technician', status: 'offline', centerId: 'qianjiang', createdAt: new Date().toISOString() },
  // 湖滨中心
  { id: 'P-20260509-HB01', name: '赵磊', phone: '13800138021', role: 'technician', status: 'idle', centerId: 'hubin', createdAt: new Date().toISOString() },
  { id: 'P-20260509-HB02', name: '孙颖', phone: '13800138022', role: 'supervisor', status: 'working', centerId: 'hubin', createdAt: new Date().toISOString() },
  // 华家池中心
  { id: 'P-20260509-HJ01', name: '周明', phone: '13800138031', role: 'technician', status: 'idle', centerId: 'huajiachi', createdAt: new Date().toISOString() },
  // 丁兰中心
  { id: 'P-20260509-DL01', name: '吴芳', phone: '13800138041', role: 'technician', status: 'idle', centerId: 'dinglan', createdAt: new Date().toISOString() },
  { id: 'P-20260509-DL02', name: '郑浩', phone: '13800138042', role: 'supervisor', status: 'idle', centerId: 'dinglan', createdAt: new Date().toISOString() },
  // 笕桥中心
  { id: 'P-20260509-JQ01', name: '王丽', phone: '13800138051', role: 'technician', status: 'working', centerId: 'jianqiao', createdAt: new Date().toISOString() },
  // 城东新城中心
  { id: 'P-20260509-CD01', name: '李明', phone: '13800138061', role: 'technician', status: 'idle', centerId: 'chengdongxincheng', createdAt: new Date().toISOString() },
  { id: 'P-20260509-CD02', name: '林梅', phone: '13800138062', role: 'supervisor', status: 'idle', centerId: 'chengdongxincheng', createdAt: new Date().toISOString() },
]
