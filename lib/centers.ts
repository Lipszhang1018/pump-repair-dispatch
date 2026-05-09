// 七个分派中心
export const CENTERS = [
  { id: 'nanxing', name: '南星中心', color: '#3B82F6' },
  { id: 'qianjiang', name: '钱江新城中心', color: '#10B981' },
  { id: 'hubin', name: '湖滨中心', color: '#F59E0B' },
  { id: 'huajiachi', name: '华家池中心', color: '#EF4444' },
  { id: 'dinglan', name: '丁兰中心', color: '#8B5CF6' },
  { id: 'jianqiao', name: '笕桥中心', color: '#EC4899' },
  { id: 'chengdongxincheng', name: '城东新城中心', color: '#06B6D4' },
] as const

export type CenterId = typeof CENTERS[number]['id']

export function getCenterById(id: string) {
  return CENTERS.find(c => c.id === id)
}

export function getCenterName(id: string) {
  const center = getCenterById(id)
  return center?.name ?? id
}
