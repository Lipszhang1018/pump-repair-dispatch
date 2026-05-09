'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { RepairOrder, OrderStatus } from '@/lib/types'
import { CENTERS, getCenterById, getCenterName } from '@/lib/centers'

const STATUS_MAP: Record<OrderStatus, string> = {
  pending: '待分派',
  assigned: '已分派',
  processing: '处理中',
  completed: '已完成',
  cancelled: '已取消',
}

const LEVEL_MAP = {
  urgent: '紧急',
  high: '重要',
  normal: '一般',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<RepairOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [centerFilter, setCenterFilter] = useState<string>('all')

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      if (data.success) {
        setOrders(data.data)
      }
    } catch (error) {
      console.error('获取派单列表失败', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, status: OrderStatus, assignee: string) {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (data.success) {
        // 如果完成派单，释放人员状态
        if (status === 'completed') {
          // 查找该人员并更新状态
          const personRes = await fetch(`/api/personnel?role=technician`)
          const personData = await personRes.json()
          if (personData.success) {
            const person = personData.data.find((p: any) => p.name === assignee)
            if (person) {
              await fetch(`/api/personnel/${person.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'idle', currentOrderId: undefined }),
              })
            }
          }
        }
        fetchOrders()
      }
    } catch (error) {
      console.error('更新状态失败', error)
    }
  }

  async function deleteOrder(id: string) {
    if (!confirm('确定要删除这条派单吗？')) return
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        fetchOrders()
      }
    } catch (error) {
      console.error('删除失败', error)
    }
  }

  const filteredOrders = orders.filter(order => {
    if (filter !== 'all' && order.status !== filter) return false
    if (centerFilter !== 'all' && order.assignedCenter !== centerFilter) return false
    return true
  })

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'assigned').length,
    processing: orders.filter(o => o.status === 'processing').length,
    completed: orders.filter(o => o.status === 'completed').length,
  }

  if (loading) {
    return <div className="card">加载中...</div>
  }

  return (
    <div>
      <div className="stats">
        <div className="stat-card">
          <div className="number">{stats.total}</div>
          <div className="label">总派单</div>
        </div>
        <div className="stat-card">
          <div className="number">{stats.pending}</div>
          <div className="label">已分派</div>
        </div>
        <div className="stat-card">
          <div className="number">{stats.processing}</div>
          <div className="label">处理中</div>
        </div>
        <div className="stat-card">
          <div className="number">{stats.completed}</div>
          <div className="label">已完成</div>
        </div>
      </div>

      <div className="card">
        <div className="page-title">
          <h2>派单列表</h2>
          <Link href="/orders/new" className="btn btn-primary">+ 新建派单</Link>
        </div>

        <div className="form-row" style={{ marginBottom: 20 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <select value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">全部状态</option>
              {Object.entries(STATUS_MAP).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <select value={centerFilter} onChange={e => setCenterFilter(e.target.value)}>
              <option value="all">全部中心</option>
              {CENTERS.map(center => (
                <option key={center.id} value={center.id}>{center.name}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <h3>暂无派单</h3>
            <p>点击上方按钮创建第一条派单</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>工单号</th>
                <th>泵房信息</th>
                <th>报警类型</th>
                <th>紧急程度</th>
                <th>分派中心</th>
                <th>状态</th>
                <th>时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => {
                const center = getCenterById(order.assignedCenter)
                return (
                  <tr key={order.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{order.id}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{order.pumpRoomName}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{order.pumpRoomAddress}</div>
                    </td>
                    <td>{order.alarmType}</td>
                    <td>
                      <span className={`status-badge level-${order.alarmLevel}`}>
                        {LEVEL_MAP[order.alarmLevel]}
                      </span>
                    </td>
                    <td>
                      <span 
                        className="center-tag"
                        style={{ backgroundColor: center?.color }}
                      >
                        {center?.name}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${order.status}`}>
                        {STATUS_MAP[order.status]}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: '#6b7280' }}>
                      {new Date(order.createdAt).toLocaleDateString('zh-CN')}
                    </td>
                    <td>
                      <div className="actions">
                        {order.status === 'assigned' && (
                          <button 
                            className="btn btn-sm btn-secondary"
                            onClick={() => updateStatus(order.id, 'processing', order.assignee)}
                          >
                            开始处理
                          </button>
                        )}
                        {order.status === 'processing' && (
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => updateStatus(order.id, 'completed', order.assignee)}
                          >
                            完成
                          </button>
                        )}
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => deleteOrder(order.id)}
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
