'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Personnel, PersonnelStatus, PersonnelRole, ROLE_MAP, STATUS_MAP, STATUS_COLORS } from '@/lib/personnel'
import { CENTERS, getCenterById } from '@/lib/centers'

export default function PersonnelPage() {
  const [personnel, setPersonnel] = useState<Personnel[]>([])
  const [loading, setLoading] = useState(true)
  const [centerFilter, setCenterFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchPersonnel()
  }, [])

  async function fetchPersonnel() {
    try {
      const res = await fetch('/api/personnel')
      const data = await res.json()
      if (data.success) {
        setPersonnel(data.data)
      }
    } catch (error) {
      console.error('获取人员列表失败', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, status: PersonnelStatus) {
    try {
      const res = await fetch(`/api/personnel/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (data.success) {
        fetchPersonnel()
      }
    } catch (error) {
      console.error('更新状态失败', error)
    }
  }

  async function deletePerson(id: string) {
    if (!confirm('确定要删除该人员吗？')) return
    try {
      const res = await fetch(`/api/personnel/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        fetchPersonnel()
      }
    } catch (error) {
      console.error('删除失败', error)
    }
  }

  // 统计数据
  const stats = {
    total: personnel.length,
    idle: personnel.filter(p => p.status === 'idle').length,
    working: personnel.filter(p => p.status === 'working').length,
    offline: personnel.filter(p => p.status === 'offline').length,
  }

  // 过滤
  const filteredPersonnel = personnel.filter(p => {
    if (centerFilter !== 'all' && p.centerId !== centerFilter) return false
    if (statusFilter !== 'all' && p.status !== statusFilter) return false
    return true
  })

  // 按中心分组
  const groupedByCenter = filteredPersonnel.reduce((acc, p) => {
    if (!acc[p.centerId]) acc[p.centerId] = []
    acc[p.centerId].push(p)
    return acc
  }, {} as Record<string, Personnel[]>)

  if (loading) {
    return <div className="card">加载中...</div>
  }

  return (
    <div>
      {/* 统计卡片 */}
      <div className="stats">
        <div className="stat-card">
          <div className="number">{stats.total}</div>
          <div className="label">总人数</div>
        </div>
        <div className="stat-card">
          <div className="number" style={{ color: STATUS_COLORS.idle }}>{stats.idle}</div>
          <div className="label">空闲</div>
        </div>
        <div className="stat-card">
          <div className="number" style={{ color: STATUS_COLORS.working }}>{stats.working}</div>
          <div className="label">工作中</div>
        </div>
        <div className="stat-card">
          <div className="number" style={{ color: STATUS_COLORS.offline }}>{stats.offline}</div>
          <div className="label">离线</div>
        </div>
      </div>

      {/* 主卡片 */}
      <div className="card">
        <div className="page-title">
          <h2>人员状态监控</h2>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>+ 添加人员</button>
        </div>

        {/* 筛选 */}
        <div className="form-row" style={{ marginBottom: 20 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <select value={centerFilter} onChange={e => setCenterFilter(e.target.value)}>
              <option value="all">全部中心</option>
              {CENTERS.map(center => (
                <option key={center.id} value={center.id}>{center.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">全部状态</option>
              <option value="idle">🟢 空闲</option>
              <option value="working">🟡 工作中</option>
              <option value="offline">⚫ 离线</option>
            </select>
          </div>
        </div>

        {/* 状态指示说明 */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 20, fontSize: 13, color: '#6b7280' }}>
          <span><span style={{ color: STATUS_COLORS.idle }}>●</span> 空闲 - 可接受新任务</span>
          <span><span style={{ color: STATUS_COLORS.working }}>●</span> 工作中 - 正在处理任务</span>
          <span><span style={{ color: STATUS_COLORS.offline }}>●</span> 离线 - 不可用</span>
        </div>

        {/* 按中心分组显示 */}
        {Object.entries(groupedByCenter).map(([centerId, members]) => {
          const center = getCenterById(centerId)
          return (
            <div key={centerId} style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, color: '#9ca3af', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span 
                  style={{ 
                    width: 12, height: 12, borderRadius: '50%', 
                    backgroundColor: center?.color 
                  }} 
                />
                {center?.name}
                <span style={{ fontWeight: 'normal', color: '#6b7280' }}>
                  ({members.filter(m => m.status === 'idle').length}/{members.length} 空闲)
                </span>
              </h3>
              
              <div className="personnel-grid">
                {members.map(p => (
                  <div key={p.id} className="personnel-card">
                    <div className="personnel-header">
                      <div className="personnel-avatar" style={{ 
                        backgroundColor: p.status === 'idle' ? '#22c55e' : 
                                        p.status === 'working' ? '#f59e0b' : '#6b7280' 
                      }}>
                        {p.name.charAt(0)}
                      </div>
                      <div className="personnel-info">
                        <div className="personnel-name">{p.name}</div>
                        <div className="personnel-role">{ROLE_MAP[p.role]}</div>
                      </div>
                      <div 
                        className="personnel-status-badge"
                        style={{ backgroundColor: STATUS_COLORS[p.status] + '20', color: STATUS_COLORS[p.status] }}
                      >
                        {STATUS_MAP[p.status]}
                      </div>
                    </div>
                    
                    <div className="personnel-details">
                      <div style={{ fontSize: 12, color: '#6b7280' }}>📞 {p.phone}</div>
                      {p.currentOrderId && (
                        <div style={{ fontSize: 12, color: '#f59e0b', marginTop: 4 }}>
                          处理工单: {p.currentOrderId}
                        </div>
                      )}
                    </div>

                    <div className="personnel-actions">
                      {p.status === 'idle' && (
                        <button 
                          className="btn btn-sm" 
                          style={{ backgroundColor: '#f59e0b20', color: '#f59e0b', border: 'none' }}
                          onClick={() => updateStatus(p.id, 'working')}
                        >
                          设为工作中
                        </button>
                      )}
                      {p.status === 'working' && (
                        <button 
                          className="btn btn-sm" 
                          style={{ backgroundColor: '#22c55e20', color: '#22c55e', border: 'none' }}
                          onClick={() => updateStatus(p.id, 'idle')}
                        >
                          设为空闲
                        </button>
                      )}
                      {p.status === 'offline' && (
                        <button 
                          className="btn btn-sm" 
                          style={{ backgroundColor: '#6b728020', color: '#6b7280', border: 'none' }}
                          onClick={() => updateStatus(p.id, 'idle')}
                        >
                          设为空闲
                        </button>
                      )}
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => deletePerson(p.id)}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {filteredPersonnel.length === 0 && (
          <div className="empty-state">
            <h3>暂无人员</h3>
            <p>点击上方按钮添加第一条人员记录</p>
          </div>
        )}
      </div>

      {/* 添加人员弹窗 */}
      {showAddModal && (
        <AddPersonnelModal 
          onClose={() => setShowAddModal(false)} 
          onSuccess={() => {
            setShowAddModal(false)
            fetchPersonnel()
          }} 
        />
      )}
    </div>
  )
}

// 添加人员弹窗组件
function AddPersonnelModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    role: 'technician' as PersonnelRole,
    centerId: 'nanxing',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch('/api/personnel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        onSuccess()
      }
    } catch (error) {
      console.error('添加失败', error)
    }
  }

  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>添加人员</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>姓名 *</label>
            <input 
              type="text" 
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required 
            />
          </div>
          <div className="form-group">
            <label>联系电话 *</label>
            <input 
              type="tel" 
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              required 
            />
          </div>
          <div className="form-group">
            <label>角色 *</label>
            <select 
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value as PersonnelRole })}
            >
              <option value="technician">维修员</option>
              <option value="supervisor">班长</option>
              <option value="dispatcher">调度员</option>
            </select>
          </div>
          <div className="form-group">
            <label>所属中心 *</label>
            <select 
              value={form.centerId}
              onChange={e => setForm({ ...form, centerId: e.target.value })}
            >
              {CENTERS.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>取消</button>
            <button type="submit" className="btn btn-primary">确认添加</button>
          </div>
        </form>
      </div>
    </div>
  )
}
