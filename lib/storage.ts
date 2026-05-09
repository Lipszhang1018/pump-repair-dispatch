import { RepairOrder } from './types'

const DATA_FILE = './data/orders.json'

// 简单的文件存储实现
// 在 Vercel 环境中使用内存存储
let orders: RepairOrder[] = []
let initialized = false

async function ensureDataDir() {
  // Vercel Serverless 环境下使用内存存储
}

export async function getAllOrders(): Promise<RepairOrder[]> {
  return [...orders].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export async function getOrderById(id: string): Promise<RepairOrder | null> {
  return orders.find(o => o.id === id) ?? null
}

export async function createOrder(order: RepairOrder): Promise<RepairOrder> {
  orders.push(order)
  return order
}

export async function updateOrder(id: string, updates: Partial<RepairOrder>): Promise<RepairOrder | null> {
  const index = orders.findIndex(o => o.id === id)
  if (index === -1) return null
  
  orders[index] = { ...orders[index], ...updates, updatedAt: new Date().toISOString() }
  return orders[index]
}

export async function deleteOrder(id: string): Promise<boolean> {
  const index = orders.findIndex(o => o.id === id)
  if (index === -1) return false
  
  orders.splice(index, 1)
  return true
}

export async function getOrdersByCenter(centerId: string): Promise<RepairOrder[]> {
  return orders
    .filter(o => o.assignedCenter === centerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function getOrdersByStatus(status: string): Promise<RepairOrder[]> {
  return orders.filter(o => o.status === status)
}
