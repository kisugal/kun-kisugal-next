'use client'

import React from 'react'
import { Card, CardHeader, CardBody, Divider, Button } from '@heroui/react'
import {
  BookOpen,
  Download,
  HelpCircle,
  Key,
  Smartphone,
  Monitor
} from 'lucide-react'

export default function TutorialPage() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-10 max-w-5xl mx-auto">
      {/* 标题部分 */}
      <section className="space-y-2 text-center md:text-left">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary flex items-center justify-center md:justify-start gap-3">
          <BookOpen className="w-10 h-10 text-pink-500" />
          模拟器及使用教程
        </h1>
        <p className="text-muted-foreground text-lg">
          欢迎来到 KisuGal 引导中心，这里有你玩 Galgame 需要的一切工具。
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {/* PC端教程 */}
        <Card className="p-2 shadow-sm border-none bg-content2/50">
          <CardHeader className="flex gap-3">
            <Monitor className="text-blue-500" />
            <div className="flex flex-col">
              <p className="text-md font-bold">Windows 电脑端</p>
              <p className="text-small text-default-500">
                运行 Krkr / 完整版游戏
              </p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="gap-3">
            <p className="text-sm">
              1. 推荐使用 7-Zip 解压，密码统一为 <code>kisugal</code>。
            </p>
            <p className="text-sm">
              2. 路径**千万不要有中文**，否则可能无法启动。
            </p>
            <Button
              size="sm"
              color="primary"
              variant="flat"
              radius="full"
              className="mt-2"
            >
              下载 Windows 运行环境
            </Button>
          </CardBody>
        </Card>

        {/* 手机端教程 */}
        <Card className="p-2 shadow-sm border-none bg-content2/50">
          <CardHeader className="flex gap-3">
            <Smartphone className="text-green-500" />
            <div className="flex flex-col">
              <p className="text-md font-bold">Android 手机端</p>
              <p className="text-small text-default-500">
                使用 JoiPlay 或 Kirikiroid2
              </p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="gap-3">
            <p className="text-sm">
              1. 模拟器建议开启“独立存储空间”防止文件报错。
            </p>
            <p className="text-sm">2. 较大资源请确认 SD 卡权限已开启。</p>
            <Button
              size="sm"
              color="success"
              variant="flat"
              radius="full"
              className="mt-2 text-white"
            >
              下载 JoiPlay 模拟器
            </Button>
          </CardBody>
        </Card>
      </div>

      {/* 密码提示框 */}
      <div className="mt-4 p-8 rounded-3xl bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/10 dark:to-purple-950/10 border border-pink-100 dark:border-pink-900/20 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400 font-bold">
          <Key className="w-5 h-5" />
          <span>全站解压密码</span>
        </div>
        <div className="text-3xl font-mono tracking-[0.2em] bg-white dark:bg-black px-8 py-3 rounded-2xl shadow-inner text-pink-500 border border-pink-200 dark:border-pink-800">
          kisugal
        </div>
        <p className="text-xs text-default-400">长按或双击可直接复制</p>
      </div>
    </div>
  )
}
