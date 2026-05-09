import { NextRequest, NextResponse } from 'next/server'
import { getAllOrders, createOrder } from '@/lib/storage'
import { generateOrderId } from '@/lib/types'

export async function GET() {
  try {
    const orders = await getAllOrders()
    return NextResponse.json({ success: true, data: orders })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '获取派单列表失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const order = {
      id: generateOrderId(),
      pumpRoomName: body.pumpRoomName,
      pumpRoomAddress: body.pumpRoomAddress,
      alarmType: body.alarmType,
      alarmLevel: body.alarmLevel,
      alarmDescription: body.alarmDescription,
      alarmTime: body.alarmTime,
      assignedCenter: body.assignedCenter,
      assignee: body.assignee,
      assigneePhone: body.assigneePhone,
      status: 'assigned' as const,
      remark: body.remark || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    await createOrder(order)
    return NextResponse.json({ success: true, data: order }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '创建派单失败' },
      { status: 500 }
    )
  }
}
