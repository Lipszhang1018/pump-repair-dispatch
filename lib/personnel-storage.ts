import { Personnel, INITIAL_PERSONNEL } from './personnel'

// Vercel Serverless 环境下使用内存存储
let personnel: Personnel[] = [...INITIAL_PERSONNEL]
let initialized = false

export async function getAllPersonnel(): Promise<Personnel[]> {
  return [...personnel]
}

export async function getPersonnelById(id: string): Promise<Personnel | null> {
  return personnel.find(p => p.id === id) ?? null
}

export async function getPersonnelByCenter(centerId: string): Promise<Personnel[]> {
  return personnel.filter(p => p.centerId === centerId)
}

export async function getPersonnelByStatus(status: string): Promise<Personnel[]> {
  return personnel.filter(p => p.status === status)
}

export async function getPersonnelByRole(role: string): Promise<Personnel[]> {
  return personnel.filter(p => p.role === role)
}

export async function createPersonnel(person: Personnel): Promise<Personnel> {
  personnel.push(person)
  return person
}

export async function updatePersonnel(id: string, updates: Partial<Personnel>): Promise<Personnel | null> {
  const index = personnel.findIndex(p => p.id === id)
  if (index === -1) return null
  
  personnel[index] = { ...personnel[index], ...updates }
  return personnel[index]
}

export async function deletePersonnel(id: string): Promise<boolean> {
  const index = personnel.findIndex(p => p.id === id)
  if (index === -1) return false
  
  personnel.splice(index, 1)
  return true
}

// 根据工单ID更新人员状态（接单时）
export async function assignOrderToPersonnel(personnelId: string, orderId: string): Promise<Personnel | null> {
  return updatePersonnel(personnelId, {
    status: 'working',
    currentOrderId: orderId
  })
}

// 完成工单后释放人员状态
export async function releasePersonnelFromOrder(personnelId: string): Promise<Personnel | null> {
  return updatePersonnel(personnelId, {
    status: 'idle',
    currentOrderId: undefined
  })
}

// 获取空闲人员
export async function getIdlePersonnel(): Promise<Personnel[]> {
  return personnel.filter(p => p.status === 'idle')
}

// 获取工作中人员
export async function getWorkingPersonnel(): Promise<Personnel[]> {
  return personnel.filter(p => p.status === 'working')
}
