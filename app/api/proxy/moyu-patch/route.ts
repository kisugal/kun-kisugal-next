import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const vndbId = searchParams.get('vndb_id')

    if (!vndbId) {
        return NextResponse.json(
            { success: false, message: 'vndb_id is required' },
            { status: 400 }
        )
    }

    try {
        const response = await fetch(
            `https://www.moyu.moe/api/hikari?vndb_id=${vndbId}`,
            {
                headers: {
                    'User-Agent': 'KisuACG/1.0'
                }
            }
        )

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Failed to fetch from moyu.moe:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to fetch patch data' },
            { status: 500 }
        )
    }
}
