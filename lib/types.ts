import { CenterId } from './centers'

export type OrderStatus = 'pending' | 'assigned' | 'processing' | 'completed' | 'cancelled'

export interface RepairOrder {
  id: string
  // 泵房信息
  pumpRoomName: string      // 泵房名称
  pumpRoomAddress: string   // 泵房地址
  // 报警信息
  alarmType: string         // 报警类型
  alarmLevel: 'urgent' | 'high' | 'normal'  // 紧急程度
  alarmDescription: string  // 报警描述
  alarmTime: string         // 报警时间
  // 派单信息
  assignedCenter: CenterId  // 分派中心
  assignee: string          // 派给人
  assigneePhone: string     // 联系电话
  status: OrderStatus      // 状态
  remark: string            // 备注
  // 时间戳
  createdAt: string
  updatedAt: string
}

// 生成唯一ID
export function generateOrderId(): string {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `WO-${date}-${random}`
}
