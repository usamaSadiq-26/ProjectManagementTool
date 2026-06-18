import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, role = 'EMPLOYEE' } = body

    console.log('Signup request received:', { name, email, role })

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Check if this is the first user
    const userCount = await db.user.count()
    const isFirstUser = userCount === 0
    
    // Validate role (must be ADMIN or EMPLOYEE, case-insensitive)
    const requestedRole = (role || 'EMPLOYEE').toUpperCase()
    
    // Allow ADMIN role only if:
    // 1. This is the first user, OR
    // 2. The first user already exists and role is ADMIN
    let finalRole = 'EMPLOYEE'
    if (isFirstUser) {
      // First user can be ADMIN
      finalRole = requestedRole === 'ADMIN' ? 'ADMIN' : 'EMPLOYEE'
      console.log('First user, setting role to:', finalRole, '(first user, admin only if explicitly requested)')
    } else if (requestedRole === 'ADMIN') {
      // Subsequent users can be ADMIN if explicitly requested
      finalRole = 'ADMIN'
      console.log('Setting role to ADMIN (explicitly requested)')
    } else {
      finalRole = 'EMPLOYEE'
      console.log('Setting role to EMPLOYEE (default)')
    }

    console.log('Creating user with role:', finalRole, 'isFirstUser:', isFirstUser, 'requestedRole:', requestedRole)

    // Create user with requested role
    const userData: any = {
      email,
      name,
      role: finalRole,
    }

    const user = await db.user.create({
      data: userData,
    })

    console.log('User created successfully:', { id: user.id, email: user.email, role: user.role })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating user:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      name: error.name,
      stack: error.stack,
    })

    // Provide more specific error message
    let errorMessage = 'Failed to create user'
    if (error.code === 'P2002') {
      errorMessage = 'This email is already registered'
    } else if (error.code === 'P2003') {
      errorMessage = 'Invalid email format'
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
