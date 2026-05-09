import { NextRequest, NextResponse } from 'next/server'
import { getPersonnelById, updatePersonnel, deletePersonnel } from '@/lib/personnel-storage'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const personnel = await getPersonnelById(id)
    
    if (!personnel) {
      return NextResponse.json(
        { success: false, error: '人员不存在' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: personnel
    })
  } catch (error) {
    console.error('获取人员详情失败', error)
    return NextResponse.json(
      { success: false, error: '获取人员详情失败' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const updated = await updatePersonnel(id, body)
    
    if (!updated) {
      return NextResponse.json(
        { success: false, error: '人员不存在' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: updated
    })
  } catch (error) {
    console.error('更新人员失败', error)
    return NextResponse.json(
      { success: false, error: '更新人员失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const deleted = await deletePersonnel(id)
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: '人员不存在' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除人员失败', error)
    return NextResponse.json(
      { success: false, error: '删除人员失败' },
      { status: 500 }
    )
  }
}
