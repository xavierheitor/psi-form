import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')

    // Rotas que precisam de autenticação
    const protectedRoutes = ['/admin', '/form']

    // Verifica se a rota atual precisa de autenticação
    const isProtectedRoute = protectedRoutes.some(route =>
        request.nextUrl.pathname.startsWith(route)
    )

    if (isProtectedRoute && !token) {
        // Redireciona para a página de login se não estiver autenticado
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Verifica se é uma rota de admin
    if (request.nextUrl.pathname.startsWith('/admin')) {
        try {
            if (!token) {
                return NextResponse.redirect(new URL('/login', request.url))
            }

            const decoded = JSON.parse(Buffer.from(token.value, 'base64').toString())

            // Se não for admin, redireciona para a página inicial
            if (!decoded.isAdmin) {
                return NextResponse.redirect(new URL('/', request.url))
            }

            // Se for admin, permite o acesso
            return NextResponse.next()
        } catch (error) {
            // Em caso de erro no token, redireciona para login
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // Para outras rotas protegidas, apenas verifica se está autenticado
    if (isProtectedRoute) {
        return NextResponse.next()
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*', '/form/:path*']
} 