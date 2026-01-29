import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '~/prisma/index'
import { redis } from '~/lib/redis'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import { z } from 'zod'

// GET - 获取话题列表（带缓存）
export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sortField = searchParams.get('sortField') || 'created'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const username = searchParams.get('username')
    const type = searchParams.get('type')

    // 生成缓存键
    const cacheKey = `topic:list:${type || username || 'all'}:${sortField}:${sortOrder}:${page}:${limit}`

    // 尝试从 Redis 获取缓存（60秒）
    try {
      const cached = await redis.get(cacheKey)
      if (cached) {
        const data = JSON.parse(cached as string)
        // 添加缓存标识
        return NextResponse.json(data, {
          headers: {
            'X-Cache': 'HIT',
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
          }
        })
      }
    } catch (redisError) {
      console.log('Redis 缓存读取失败，继续查询数据库:', redisError)
    }

    // 构建查询条件
    const skip = (page - 1) * limit
    let where: any = {
      status: 0  // 只显示未删除的话题
    }

    if (username) {
      const user = await prisma.user.findUnique({
        where: { name: username },
        select: { id: true }
      })
      if (user) {
        where.user_id = user.id
      }
    } else if (type === 'image') {
      where.content = { contains: '![' }
    }

    const orderBy: any = {}
    orderBy[sortField] = sortOrder

    // 查询数据库 - 置顶话题始终排在最前面
    const [topics, total] = await Promise.all([
      prisma.topic.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { is_pinned: 'desc' },  // 置顶话题优先
          orderBy
        ],
        select: {
          id: true,
          title: true,
          content: true,
          created: true,
          updated: true,
          view_count: true,
          like_count: true,
          is_pinned: true,
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          _count: {
            select: {
              topic_comments: true
            }
          }
        }
      }),
      prisma.topic.count({ where })
    ])

    // 格式化数据
    const formattedTopics = topics.map(topic => ({
      ...topic,
      comment_count: topic._count.topic_comments,
      _count: undefined
    }))

    const result = {
      topics: formattedTopics,
      total,
      page,
      limit
    }

    // 缓存结果（60秒）
    try {
      await redis.setex(cacheKey, 60, JSON.stringify(result))
    } catch (redisError) {
      console.log('Redis 缓存写入失败:', redisError)
    }

    return NextResponse.json(result, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    })
  } catch (error) {
    console.error('获取话题列表失败:', error)
    return NextResponse.json({ error: '获取话题列表失败' }, { status: 500 })
  }
}

// POST - 创建话题
const createTopicSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(50000)
})

export const POST = async (req: NextRequest) => {
  try {
    // 验证用户登录
    const payload = await verifyHeaderCookie(req)
    if (!payload) {
      return NextResponse.json({ error: '用户未登录' }, { status: 401 })
    }

    // 解析请求体
    const body = await req.json()
    const validation = createTopicSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        error: '参数验证失败',
        details: validation.error.errors
      }, { status: 400 })
    }

    const { title, content } = validation.data

    // 创建话题
    const topic = await prisma.topic.create({
      data: {
        title,
        content,
        user_id: payload.uid,
        status: 0,
        is_pinned: false,
        view_count: 0,
        like_count: 0
      },
      select: {
        id: true,
        title: true,
        content: true,
        created: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    })

    // 清除相关缓存
    try {
      const keys = await redis.keys('topic:list:*')
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (redisError) {
      console.log('清除缓存失败:', redisError)
    }

    return NextResponse.json({ topic }, { status: 201 })
  } catch (error) {
    console.error('创建话题失败:', error)
    return NextResponse.json({ error: '创建话题失败' }, { status: 500 })
  }
}
