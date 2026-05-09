'use client'

import { useEffect, useState } from 'react'
import { CENTERS, getCenterById } from '@/lib/centers'
import { Personnel, STATUS_COLORS, STATUS_MAP } from '@/lib/personnel'

// 各中心的模拟坐标（杭州地区）
const CENTER_COORDS: Record<string, [number, number]> = {
  nanxing: [30.2365, 120.1755],        // 南星 - 杭州上城区
  qianjiang: [30.2525, 120.2055],      // 钱江新城
  hubin: [30.2635, 120.1535],          // 湖滨 - 杭州西湖边
  huajiachi: [30.2715, 120.1375],      // 华家池
  dinglan: [30.2955, 120.1655],        // 丁兰
  jianqiao: [30.2835, 120.1955],        // 笕桥
  chengdongxincheng: [30.2655, 120.2255], // 城东新城
}

export default function MapPage() {
  const [personnel, setPersonnel] = useState<Personnel[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    // 加载 Leaflet CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    // 加载 Leaflet JS
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.async = true
    script.onload = () => {
      setMapLoaded(true)
    }
    document.head.appendChild(script)

    // 获取人员数据
    fetch('/api/personnel')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPersonnel(data.data)
        }
      })

    return () => {
      document.head.removeChild(link)
      document.head.removeChild(script)
    }
  }, [])

  useEffect(() => {
    if (!mapLoaded) return

    // @ts-ignore
    const L = window.L

    // 初始化地图（以杭州为中心）
    const map = L.map('map').setView([30.27, 120.18], 12)

    // 添加 OpenStreetMap 图层
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)

    // 为每个中心添加标记
    CENTERS.forEach(center => {
      const coords = CENTER_COORDS[center.id]
      if (!coords) return

      const centerPersonnel = personnel.filter(p => p.centerId === center.id)
      const idleCount = centerPersonnel.filter(p => p.status === 'idle').length
      const workingCount = centerPersonnel.filter(p => p.status === 'working').length

      // 创建自定义图标
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background: ${center.color};
            width: 36px;
            height: 36px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 3px 10px rgba(0,0,0,0.3);
            border: 3px solid white;
          ">
            <span style="
              transform: rotate(45deg);
              color: white;
              font-size: 14px;
              font-weight: bold;
            ">${idleCount}</span>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36]
      })

      const marker = L.marker(coords, { icon }).addTo(map)

      // 弹窗内容
      const workingList = centerPersonnel.filter(p => p.status === 'working')
      const workingHtml = workingList.length > 0 
        ? `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">
            <strong style="color: #f59e0b;">工作中 (${workingCount})</strong>
            ${workingList.map(p => `<div style="font-size: 12px; margin-top: 4px;">🟡 ${p.name} - ${p.currentOrderId || '处理中'}</div>`).join('')}
           </div>`
        : ''

      marker.bindPopup(`
        <div class="map-popup">
          <strong style="color: ${center.color};">${center.name}</strong>
          <p>🟢 空闲: ${idleCount} 人</p>
          <p>🟡 工作中: ${workingCount} 人</p>
          ${workingHtml}
        </div>
      `)

      // 点击显示更多信息
      marker.on('click', () => {
        marker.openPopup()
      })
    })

    // 添加图例
    const legend = L.control({ position: 'bottomright' })
    legend.onAdd = function() {
      const div = L.DomUtil.create('div', 'leaflet-legend')
      div.innerHTML = `
        <div style="
          background: white;
          padding: 12px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          font-size: 12px;
        ">
          <div style="font-weight: 600; margin-bottom: 8px;">图例</div>
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <span style="color: #22c55e;">●</span> 空闲
          </div>
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <span style="color: #f59e0b;">●</span> 工作中
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="color: #6b7280;">●</span> 离线
          </div>
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee; font-size: 11px; color: #6b7280;">
            数字 = 该中心空闲人数
          </div>
        </div>
      `
      return div
    }
    legend.addTo(map)

  }, [mapLoaded, personnel])

  // 统计
  const stats = {
    total: personnel.length,
    idle: personnel.filter(p => p.status === 'idle').length,
    working: personnel.filter(p => p.status === 'working').length,
    offline: personnel.filter(p => p.status === 'offline').length,
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

      {/* 地图说明 */}
      <div style={{ 
        background: 'white', 
        padding: '12px 16px', 
        borderRadius: 10, 
        marginBottom: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        fontSize: 13,
        color: '#6b7280'
      }}>
        <strong style={{ color: '#374151' }}>💡 提示：</strong>
        点击地图上的标记可以查看该中心的详细信息，包括空闲人数和正在处理的任务。
      </div>

      {/* 地图容器 */}
      <div className="card" style={{ padding: 0 }}>
        <div id="map" className="map-container" style={{ height: 500, borderRadius: 12, margin: 0 }}></div>
      </div>

      {/* 中心列表 */}
      <div className="card">
        <h2 className="page-title" style={{ marginBottom: 16 }}>各中心人员分布</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {CENTERS.map(center => {
            const centerPersonnel = personnel.filter(p => p.centerId === center.id)
            const idleCount = centerPersonnel.filter(p => p.status === 'idle').length
            return (
              <div 
                key={center.id}
                style={{ 
                  background: '#f9fafb',
                  padding: 12,
                  borderRadius: 8,
                  borderLeft: `4px solid ${center.color}`
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>
                  {center.name}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>
                  总人数: {centerPersonnel.length} | 
                  <span style={{ color: STATUS_COLORS.idle }}> 空闲 {idleCount}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
