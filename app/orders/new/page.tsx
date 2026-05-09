'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CENTERS } from '@/lib/centers'
import { Personnel, ROLE_MAP } from '@/lib/personnel'

const ALARM_TYPES = [
  '水泵故障',
  '水位异常',
  '压力异常',
  '阀门故障',
  '传感器故障',
  '通讯故障',
  '漏电报警',
  '其他故障',
]

export default function NewOrderPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [personnel, setPersonnel] = useState<Personnel[]>([])
  const [selectedPersonnel, setSelectedPersonnel] = useState<string>('')
  const [form, setForm] = useState({
    pumpRoomName: '',
    pumpRoomAddress: '',
    alarmType: ALARM_TYPES[0],
    alarmLevel: 'normal',
    alarmDescription: '',
    alarmTime: new Date().toISOString().slice(0, 16),
    assignedCenter: CENTERS[0].id,
    assignee: '',
    assigneePhone: '',
    remark: '',
  })

  // 获取人员列表
  useEffect(() => {
    fetch('/api/personnel')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPersonnel(data.data)
        }
      })
  }, [])

  // 当选择中心时，过滤该中心的人员
  const filteredPersonnel = personnel.filter(p => p.centerId === form.assignedCenter)

  // 当选择人员时，自动填充姓名和电话
  useEffect(() => {
    if (selectedPersonnel) {
      const person = personnel.find(p => p.id === selectedPersonnel)
      if (person) {
        setForm(prev => ({
          ...prev,
          assignee: person.name,
          assigneePhone: person.phone,
        }))
      }
    }
  }, [selectedPersonnel, personnel])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    // 如果切换了中心，清空已选人员
    if (name === 'assignedCenter') {
      setSelectedPersonnel('')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      
      if (data.success) {
        // 如果选择了人员，自动更新其状态为"工作中"
        if (selectedPersonnel) {
          await fetch(`/api/personnel/${selectedPersonnel}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              status: 'working',
              currentOrderId: data.data.id 
            }),
          })
        }
        alert('派单创建成功！')
        router.push('/orders')
      } else {
        alert(data.error || '创建失败')
      }
    } catch (error) {
      alert('网络错误，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="card">
        <div className="page-title">
          <h2>新建派单</h2>
          <Link href="/orders" className="btn btn-secondary">返回列表</Link>
        </div>

        <form onSubmit={handleSubmit}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#374151' }}>
            泵房信息
          </h3>
          <div className="form-row">
            <div className="form-group">
              <label>泵房名称 *</label>
              <input
                type="text"
                name="pumpRoomName"
                value={form.pumpRoomName}
                onChange={handleChange}
                placeholder="如：南星泵房1号"
                required
              />
            </div>
            <div className="form-group">
              <label>泵房地址 *</label>
              <input
                type="text"
                name="pumpRoomAddress"
                value={form.pumpRoomAddress}
                onChange={handleChange}
                placeholder="如：上城区南星路123号"
                required
              />
            </div>
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, marginTop: 24, color: '#374151' }}>
            报警信息
          </h3>
          <div className="form-row">
            <div className="form-group">
              <label>报警类型 *</label>
              <select name="alarmType" value={form.alarmType} onChange={handleChange}>
                {ALARM_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>紧急程度 *</label>
              <select name="alarmLevel" value={form.alarmLevel} onChange={handleChange}>
                <option value="normal">一般</option>
                <option value="high">重要</option>
                <option value="urgent">紧急</option>
              </select>
            </div>
            <div className="form-group">
              <label>报警时间 *</label>
              <input
                type="datetime-local"
                name="alarmTime"
                value={form.alarmTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>报警描述 *</label>
            <textarea
              name="alarmDescription"
              value={form.alarmDescription}
              onChange={handleChange}
              rows={3}
              placeholder="请详细描述报警情况..."
              required
            />
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, marginTop: 24, color: '#374151' }}>
            分派信息
          </h3>
          <div className="form-row">
            <div className="form-group">
              <label>分派中心 *</label>
              <select name="assignedCenter" value={form.assignedCenter} onChange={handleChange}>
                {CENTERS.map(center => (
                  <option key={center.id} value={center.id}>{center.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>选择人员 *</label>
              <select 
                value={selectedPersonnel} 
                onChange={e => setSelectedPersonnel(e.target.value)}
              >
                <option value="">-- 选择维修人员 --</option>
                {filteredPersonnel.map(p => (
                  <option key={p.id} value={p.id} disabled={p.status !== 'idle'}>
                    {p.name} ({ROLE_MAP[p.role]}) {p.status !== 'idle' ? `- ${p.status === 'working' ? '工作中' : '离线'}` : '✅ 空闲'}
                  </option>
                ))}
              </select>
              <small style={{ color: '#6b7280', fontSize: 12 }}>
                选择人员后将自动填充姓名和电话
              </small>
            </div>
            <div className="form-group">
              <label>派给人员 *</label>
              <input
                type="text"
                name="assignee"
                value={form.assignee}
                onChange={handleChange}
                placeholder="维修人员姓名"
                required
              />
            </div>
            <div className="form-group">
              <label>联系电话 *</label>
              <input
                type="tel"
                name="assigneePhone"
                value={form.assigneePhone}
                onChange={handleChange}
                placeholder="138xxxxxxxx"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>备注</label>
            <textarea
              name="remark"
              value={form.remark}
              onChange={handleChange}
              rows={2}
              placeholder="其他补充信息..."
            />
          </div>

          <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? '提交中...' : '确认分派'}
            </button>
            <Link href="/orders" className="btn btn-secondary">
              取消
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
