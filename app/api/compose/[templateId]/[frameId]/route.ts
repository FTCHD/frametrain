import type templates from '@/templates'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

export async function GET(
    request: NextRequest,
    { params }: { params: { templateId: keyof typeof templates; frameId: string } }
) {
    const searchParams = request.nextUrl.searchParams

    const token = searchParams.get('t')!

    const castState = searchParams.get('s')!

    cookies().set(process.env.AUTH_SESSION_COOKIE_NAME!, token, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
    })

    redirect(process.env.NEXT_PUBLIC_HOST! + '/compose/' + params.frameId + '?s=' + castState)
}
