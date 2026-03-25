import { NextRequest, NextResponse } from 'next/server'
import { kunParseFormData } from '~/app/api/utils/parseQuery'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import { avatarSchema } from '~/validations/user'
import { updateUserAvatar } from './updateUserAvatar'

export const POST = async (req: NextRequest) => {
  try {
    const input = await kunParseFormData(req, avatarSchema)
    if (typeof input === 'string') {
      return NextResponse.json({ error: input }, { status: 400 })
    }
    const payload = await verifyHeaderCookie(req)
    if (!payload) {
      return NextResponse.json({ error: '用户未登录' }, { status: 401 })
    }

    const avatar = await new Response(input.avatar)?.arrayBuffer()

    const res = await updateUserAvatar(payload.uid, avatar)
    if (typeof res === 'string') {
      return NextResponse.json({ error: res }, { status: 400 })
    }
    return NextResponse.json(res)
  } catch (error) {
    console.error('头像上传错误:', error)
    return NextResponse.json({ error: '头像上传失败，请稍后重试' }, { status: 500 })
  }
}
