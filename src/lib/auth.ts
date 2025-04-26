'use server'

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const prisma = new PrismaClient()

export async function login(email: string, password: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            return { error: 'Usuário não encontrado' }
        }

        const isValidPassword = await bcrypt.compare(password, user.password)

        if (!isValidPassword) {
            return { error: 'Senha incorreta' }
        }

        // Cria o token (em produção, use JWT ou outra solução mais segura)
        const token = Buffer.from(JSON.stringify({
            id: user.id,
            isAdmin: user.isAdmin
        })).toString('base64')

        // Define o cookie
        cookies().set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7 // 1 semana
        })

        return { success: true }
    } catch (error) {
        console.error('Erro no login:', error)
        return { error: 'Erro ao fazer login' }
    }
}

export async function register(name: string, email: string, password: string) {
    try {
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return { error: 'Email já cadastrado' }
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                isAdmin: false // Por padrão, novos usuários não são admin
            }
        })

        return { success: true }
    } catch (error) {
        console.error('Erro no registro:', error)
        return { error: 'Erro ao criar usuário' }
    }
}

export async function logout() {
    cookies().delete('token')
    redirect('/login')
}

export async function getCurrentUser() {
    try {
        const token = cookies().get('token')?.value

        if (!token) {
            return null
        }

        const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                name: true,
                email: true,
                isAdmin: true
            }
        })

        return user
    } catch (error) {
        return null
    }
} 