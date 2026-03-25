import { NextRequest, NextResponse } from 'next/server'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import { createTopicSchema } from '~/validations/topic'
import { prisma } from '~/prisma/index'
import { redis } from '~/lib/redis'

// GET - 获取话题列表
export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sortField = searchParams.get('sortField') || 'created'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const username = searchParams.get('username')
    const type = searchParams.get('type')


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
    console.log(where)
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

// POST - 创建新话题
export async function POST(request: NextRequest) {
  const payload = await verifyHeaderCookie(request)
  if (!payload) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const validatedData = createTopicSchema.parse(body)
  const { title, content } = validatedData

  const topic = await prisma.topic.create({
    data: {
      title,
      content,
      user_id: payload.uid
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true
        }
      }
    }
  })

  return Response.json({
    message: 'Topic created successfully',
    topic: {
      id: topic.id,
      title: topic.title,
      content: topic.content,
      is_pinned: topic.is_pinned,
      view_count: topic.view_count,
      like_count: topic.like_count,
      user: {
        id: topic.user.id,
        name: topic.user.name,
        avatar: topic.user.avatar
      },
      created: topic.created.toISOString(),
      updated: topic.updated.toISOString()
    }
  }, { status: 201 })
}
