import { PrismaClient } from '@prisma/client'
import { argon2id } from '@noble/hashes/argon2'
import crypto from 'crypto'

const prisma = new PrismaClient()

const options = {
    t: 2, // Number of iterations (time cost)
    m: 8192, // Memory cost in kibibytes (64 MB)
    p: 3 // Parallelism (threads)
}

async function hashPassword(password: string) {
    const salt = crypto.randomBytes(16).toString('hex')
    const derivedKey = argon2id(password, salt, options)
    const res = Buffer.from(derivedKey).toString('hex')
    return `${salt}:${res}`
}

async function createAdmin() {
    try {
        // 检查管理员是否已存在
        const existingAdmin = await prisma.user.findUnique({
            where: { email: 'syynice999@gmail.com' }
        })

        if (existingAdmin) {
            console.log('⚠️  管理员账号已存在，正在更新密码...')

            // 更新密码
            const password = 'Aa123456'
            const hashedPassword = await hashPassword(password)

            await prisma.user.update({
                where: { id: existingAdmin.id },
                data: {
                    password: hashedPassword,
                    role: 4 // 确保是超级管理员
                }
            })

            console.log('✅ 密码已更新！')
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
            console.log('用户名:', existingAdmin.name)
            console.log('邮箱:', existingAdmin.email)
            console.log('密码:', password)
            console.log('角色: 超级管理员 (role: 4)')
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
            return
        }

        // 创建密码哈希
        const password = 'Aa123456'
        const hashedPassword = await hashPassword(password)

        // 创建管理员账号
        const admin = await prisma.user.create({
            data: {
                name: 'kisushiina',
                email: 'syynice999@gmail.com',
                password: hashedPassword,
                role: 4, // 超级管理员
                status: 0, // 正常状态
                avatar: '',
                bio: '系统管理员',
                ip: '127.0.0.1'
            }
        })

        console.log('✅ 管理员账号创建成功！')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('用户名:', admin.name)
        console.log('邮箱:', admin.email)
        console.log('密码:', password)
        console.log('角色: 超级管理员 (role: 4)')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('⚠️  请登录后立即修改密码！')
    } catch (error) {
        console.error('❌ 创建管理员失败:', error)
    } finally {
        await prisma.$disconnect()
    }
}

createAdmin()
