import { NextRequest, NextResponse } from 'next/server'
import { getOrderById, updateOrder, deleteOrder } from '@/lib/storage'

type Params = { params: { id: string } }

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const order = await getOrderById(params.id)
    if (!order) {
      return NextResponse.json(
        { success: false, error: '派单不存在' },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, data: order })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '获取派单详情失败' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json()
    const order = await updateOrder(params.id, body)
    if (!order) {
      return NextResponse.json(
        { success: false, error: '派单不存在' },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, data: order })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '更新派单失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const deleted = await deleteOrder(params.id)
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: '派单不存在' },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '删除派单失败' },
      { status: 500 }
    )
  }
}
