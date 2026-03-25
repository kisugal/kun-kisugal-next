export interface KunNavItem {
  name: string
  href: string
  rel?: string
}

export const kunNavItem: KunNavItem[] = [
]

export const kunMobileNavItem: KunNavItem[] = [
  ...kunNavItem,
  {
    name: 'Galame',
    href: '/galgame'
  },
  {
    name: '游戏补丁',
    href: '/resource'
  },
  {
    name: '标签列表',
    href: '/tag'
  },
  {
    name: '制作会社',
    href: '/companies'
  },
  {
    name: '评论列表',
    href: '/comment'
  },
  {
    name: '加入我们',
    href: 'https://t.me/LyCoriseGAL'
  },
  {
    name: '以下为广告捏~',
    href: '/',
    rel: 'nofollow'
  },
  {
    name: 'Ai女友💋',
    href: 'https://genrati.xyz?ref_id=006f5ccb-b0d3-471b-a674-de5e5114ed67',
    rel: 'nofollow'
  },
  {
    name: '⚡️翻墙Vpn推荐',
    href: 'https://eueua.cc/#/register?code=V437MLYw',
    rel: 'nofollow'
  },
  {
    name: '哔咔漫画',
    href: 'https://wrkb-tj.fukmaydt.com/?ch=m1f1v8bk',
    rel: 'nofollow'
  }
]
