import { NextRequest, NextResponse } from 'next/server'
import { getAllPersonnel, createPersonnel, getIdlePersonnel, getWorkingPersonnel } from '@/lib/personnel-storage'
import { Personnel, generatePersonnelId } from '@/lib/personnel'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const role = searchParams.get('role')
    const centerId = searchParams.get('centerId')
    
    let personnel = await getAllPersonnel()
    
    if (status === 'idle') {
      personnel = await getIdlePersonnel()
    } else if (status === 'working') {
      personnel = await getWorkingPersonnel()
    }
    
    if (role) {
      personnel = personnel.filter(p => p.role === role)
    }
    
    if (centerId) {
      personnel = personnel.filter(p => p.centerId === centerId)
    }
    
    return NextResponse.json({
      success: true,
      data: personnel,
      total: personnel.length
    })
  } catch (error) {
    console.error('获取人员列表失败', error)
    return NextResponse.json(
      { success: false, error: '获取人员列表失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const newPersonnel: Personnel = {
      id: generatePersonnelId(),
      name: body.name,
      phone: body.phone,
      role: body.role,
      status: body.status || 'idle',
      centerId: body.centerId,
      createdAt: new Date().toISOString(),
    }
    
    const created = await createPersonnel(newPersonnel)
    
    return NextResponse.json({
      success: true,
      data: created
    })
  } catch (error) {
    console.error('创建人员失败', error)
    return NextResponse.json(
      { success: false, error: '创建人员失败' },
      { status: 500 }
    )
  }
}
