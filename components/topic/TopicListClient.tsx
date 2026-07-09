'use client'

import {
  Accordion,
  AccordionItem,
  Button,
  Card,
  CardBody,
  Select,
  SelectItem,
  Skeleton,
  Tab,
  Tabs
} from '@heroui/react'
import { Leaf, Plus } from 'lucide-react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  useCallback,
  useEffect,
  useState,
  useTransition
} from 'react'
import toast from 'react-hot-toast'
import { KunPagination } from '~/components/kun/Pagination'
import { useUserStore } from '~/store/userStore'
import type { TopicCard } from '~/types/api/topic'
import { kunFetchGet } from '~/utils/kunFetch'
import { TopicList } from './TopicList'


// 动态加载右侧边栏，不阻塞首屏
const RightSidebar = dynamic(
  () =>
    import('~/components/layout/RightSidebar').then(
      (mod) => ({
        default: mod.RightSidebar
      })
    ),
  {
    ssr: false,
    loading: () => (
      <div className="hidden lg:block w-80 space-y-4">
        <Card>
          <CardBody className="space-y-3">
            <Skeleton className="h-6 w-32 rounded-lg" />
            <Skeleton className="h-4 w-full rounded-lg" />
            <Skeleton className="h-4 w-full rounded-lg" />
          </CardBody>
        </Card>
      </div>
    )
  }
)


interface TopicListResponse {
  topics: TopicCard[]
  total: number
  page: number
  limit: number
}


type TabType =
  | 'OFFICIAL_ANNOUNCEMENT'
  | 'DISCUSSION'
  | 'THIRD_PARTY_RESOURCE'


const sortOptions = [
  {
    key: 'created',
    label: '最新发布'
  },
  {
    key: 'view_count',
    label: '浏览最多'
  },
  {
    key: 'like_count',
    label: '点赞最多'
  }
]


const orderOptions = [
  {
    key: 'desc',
    label: '降序'
  },
  {
    key: 'asc',
    label: '升序'
  }
]


// 广告列表
const glgc = [
  {
    title: '精选黄油',
    imageurl:
      'https://upload.cc/i1/2026/07/09/C2WrOU.png',
    url:
      'https://l1.hljxyhbkj.com/dh1012',
    content:
      '福利游戏合集,免费福利手游 绅士必备，实用宝藏网站让你尽情释放欲望'
  },
  {
    title: 'DZMM AI伴侣 ❤️',
    imageurl:
      'https://d.acgll.com/%E5%9B%BE%E7%89%87%E5%AD%98%E5%82%A8/photo_2026-05-03_23-53-08.jpg',
    url:
      'https://www.ainvmei.com/?rf=e32c5b70',
    content:
      '高自由度 AI 互动平台，支持图文模式、语音陪伴、AI 绘图与多题材角色互动。'
  },
  {
    title: '翻墙Vpn推荐⚡️',
    imageurl:
      'https://d.acgll.com/%E5%9B%BE%E7%89%87%E5%AD%98%E5%82%A8/%E5%B9%BF%E5%91%8A%E5%9B%BE1180x720.jpg',
    url:
      'https://www.tspeedcat.top/#/register?code=FttmLPkV',
    content:
      '翻墙Vpn推荐，加速下载！觉得下载资源慢？觉得加载页面不丝滑？'
  },
  {
    title: '精品飞机杯',
    imageurl:
      'https://d.acgll.com/%E5%9B%BE%E7%89%87%E5%AD%98%E5%82%A8/686B6C6A29B3FF47E39861DE80DABFF3.jpg',
    url:
      'https://gateway.alihealth.taobao.com/act/T8gVSF$zZ6d?JKid=wtcps_01%7EZ%7EqtS5gwQgQOb3nC14bLnuD9W%7E4aaC-xJKcPo%7EEhpYW0LPJOS%7Ezcjmt261onAay3Pc4Ka1HPQ4cd%7E-RaJdr0uyL4oTqGLsT-HcUQPzLlB1ee1yNuGZ8EycTf2Ro7Nr2LJh%7EU0GRkbrZMkkO2Huz-w%3D%3D_01_4a653ba46a3c4f0d819ab763b3e33e7d&quickLaunch=true&forbidRefineType=goOut',
    content:
      null
  }
]


interface Props {
  initialTopics?: TopicCard[]
  initialTotal?: number
}


const STORAGE_KEY =
  'topic_list_state'


interface SavedState {
  page: number
  sortField: string
  sortOrder: string
  tab: TabType
}
export const TopicListClient = ({
  initialTopics = [],
  initialTotal = 0
}: Props) => {

  const router = useRouter()


  const [topics, setTopics] =
    useState<TopicCard[]>(initialTopics)

  const [isPending, startTransition] =
    useTransition()

  const [total, setTotal] =
    useState(initialTotal)

  const [currentPage, setCurrentPage] =
    useState(1)

  const [sortField, setSortField] =
    useState('created')

  const [sortOrder, setSortOrder] =
    useState('desc')

  const [activeTab, setActiveTab] =
    useState<TabType>(
      'OFFICIAL_ANNOUNCEMENT'
    )

  const [isInitialized, setIsInitialized] =
    useState(false)


  const limit = 10



  // 保存列表状态
  const saveState = useCallback(
    (
      page: number,
      sort: string,
      order: string,
      tab: TabType
    ) => {

      if (
        typeof window !== 'undefined'
      ) {

        const state: SavedState = {
          page,
          sortField: sort,
          sortOrder: order,
          tab
        }


        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(state)
        )

      }

    },
    []
  )



  // 获取保存状态
  const loadState =
    useCallback(
      (): SavedState | null => {

        if (
          typeof window !== 'undefined'
        ) {

          const saved =
            sessionStorage.getItem(
              STORAGE_KEY
            )


          if (saved) {

            try {

              return JSON.parse(
                saved
              )

            } catch {

              return null

            }

          }

        }


        return null

      },
      []
    )




  // 获取话题
  const fetchTopics = async (
    page: number = 1,
    sort: string = 'created',
    order: string = 'desc',
    tab: TabType =
      'OFFICIAL_ANNOUNCEMENT'
  ) => {


    startTransition(
      async () => {

        try {

          const url =
            `/api/topic?page=${page}` +
            `&limit=${limit}` +
            `&sortField=${sort}` +
            `&sortOrder=${order}` +
            `&type=${tab}`


          const response =
            await kunFetchGet<TopicListResponse>(
              url
            )


          setTopics(
            response.topics
          )

          setTotal(
            response.total
          )

          setCurrentPage(
            response.page
          )


        } catch (error) {

          console.error(
            '获取话题列表失败:',
            error
          )

        }

      }
    )

  }





  const handlePageChange =
    (page: number) => {


      setCurrentPage(page)


      saveState(
        page,
        sortField,
        sortOrder,
        activeTab
      )


      fetchTopics(
        page,
        sortField,
        sortOrder,
        activeTab
      )


    }




  const handleSortChange =
    (
      field: string,
      order: string
    ) => {


      setSortField(field)

      setSortOrder(order)

      setCurrentPage(1)



      saveState(
        1,
        field,
        order,
        activeTab
      )


      fetchTopics(
        1,
        field,
        order,
        activeTab
      )


    }





  const handleTabChange =
    (
      key: string | number
    ) => {


      const tab =
        key as TabType



      setActiveTab(tab)

      setCurrentPage(1)



      saveState(
        1,
        sortField,
        sortOrder,
        tab
      )



      fetchTopics(
        1,
        sortField,
        sortOrder,
        tab
      )


    }





  useEffect(() => {


    const savedState =
      loadState()



    if (savedState) {


      setCurrentPage(
        savedState.page
      )

      setSortField(
        savedState.sortField
      )

      setSortOrder(
        savedState.sortOrder
      )

      setActiveTab(
        savedState.tab
      )



      fetchTopics(
        savedState.page,
        savedState.sortField,
        savedState.sortOrder,
        savedState.tab
      )


    } else {


      fetchTopics(
        1,
        'created',
        'desc',
        'OFFICIAL_ANNOUNCEMENT'
      )


    }



    setIsInitialized(
      true
    )


  }, [])





  const totalPages =
    Math.ceil(
      total / limit
    )





  const { user } =
    useUserStore(
      (state) => state
    )




  const fabu =
    async () => {


      if (
        user.uid === 0
      ) {


        toast.error(
          '请先登录后再创建话题'
        )



        setTimeout(
          () => {
            router.push(
              '/login'
            )
          },
          1500
        )



        return


      }



      router.push(
        '/topic/create'
      )


    }
      return (
    <div className="container mx-auto my-4">

      <div className="flex gap-6">


        {/* 主内容区域 */}
        <div className="flex-1 min-w-0 space-y-3">


          {/* 标签页 */}
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={handleTabChange}
            variant="underlined"
            classNames={{
              tabList:
                'w-full flex rounded-none p-0 border-b border-divider',

              cursor:
                'w-full bg-primary',

              tab:
                'flex-1 px-6 h-12 flex justify-center',

              tabContent:
                'group-data-[selected=true]:text-primary text-center',

              base:
                'flex'
            }}
          >

            <Tab
              key="OFFICIAL_ANNOUNCEMENT"
              title="官方公告"
            />

            <Tab
              key="THIRD_PARTY_RESOURCE"
              title="第三方资源"
            />

            <Tab
              key="DISCUSSION"
              title="讨论"
            />


          </Tabs>




          {/* 广告区域 */}
          <Accordion isCompact>

            <AccordionItem

              key="glgc"

              aria-label="广告推荐"

              startContent={
                <Leaf
                  className="w-5 h-5 text-yellow-500"
                />
              }

              title="精选推荐"

              classNames={{
                trigger:
                  'justify-start',

                title:
                  'text-left flex-1'
              }}

            >


              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  gap-4
                "
              >


                {glgc.map(
                  (item) => (

                    <Card
                      key={item.title}
                      shadow="sm"
                      className="overflow-hidden"
                    >

                      <CardBody
                        className="p-3"
                      >


                        <Link

                          href={item.url}

                          target="_blank"

                          rel="noopener noreferrer"

                        >


                          <div
                            className="
                              flex
                              items-center
                              gap-2
                              mb-2
                            "
                          >

                            <Leaf
                              className="
                                w-4
                                h-4
                                text-yellow-500
                              "
                            />


                            <span
                              className="
                                text-sm
                                font-medium
                                truncate
                              "
                            >

                              {item.title}

                            </span>


                          </div>



                          {item.content && (

                            <div
                              className="
                                text-xs
                                opacity-80
                                mb-3
                                line-clamp-2
                              "
                            >

                              {item.content}

                            </div>

                          )}



                          <img

                            src={item.imageurl}

                            alt={item.title}

                            loading="lazy"

                            className="
                              w-full
                              h-auto
                              rounded-lg
                              opacity-80
                            "

                          />



                        </Link>


                      </CardBody>


                    </Card>


                  )
                )}


              </div>



            </AccordionItem>


          </Accordion>






          {/* 排序 */}

          <div
            className="
              flex
              flex-wrap
              gap-4
            "
          >


            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              <span
                className="
                  text-sm
                  text-foreground/70
                "
              >

                排序方式:

              </span>



              <Select

                size="sm"

                selectedKeys={[
                  sortField
                ]}

                onSelectionChange={
                  (keys) => {

                    const field =
                      Array.from(keys)[0]
                        as string


                    handleSortChange(
                      field,
                      sortOrder
                    )

                  }
                }

                className="w-32"

              >

                {sortOptions.map(
                  (option) => (

                    <SelectItem
                      key={option.key}
                    >

                      {option.label}

                    </SelectItem>

                  )
                )}

              </Select>


            </div>





            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              <span
                className="
                  text-sm
                  text-foreground/70
                "
              >

                排序:

              </span>




              <Select

                size="sm"

                selectedKeys={[
                  sortOrder
                ]}

                onSelectionChange={
                  (keys) => {

                    const order =
                      Array.from(keys)[0]
                        as string


                    handleSortChange(
                      sortField,
                      order
                    )


                  }
                }

                className="w-20"

              >

                {orderOptions.map(
                  (option) => (

                    <SelectItem
                      key={option.key}
                    >

                      {option.label}

                    </SelectItem>

                  )
                )}


              </Select>


            </div>



          </div>







          {/* 内容区域 */}

          {
            isPending &&
            topics.length === 0
              ?

              (

                <div
                  className="
                    grid
                    grid-cols-1
                    md:grid-cols-2
                    gap-4
                  "
                >

                  {
                    [1,2,3,4].map(
                      (i) => (

                        <div
                          key={i}
                          className="space-y-3"
                        >

                          <Skeleton
                            className="
                              w-10
                              h-10
                              rounded-full
                            "
                          />

                          <Skeleton
                            className="
                              h-6
                              w-3/4
                              rounded-lg
                            "
                          />

                          <Skeleton
                            className="
                              h-20
                              w-full
                              rounded-lg
                            "
                          />

                        </div>


                      )
                    )
                  }


                </div>


              )

              :

              (

                <TopicList

                  topics={topics}

                  columns={2}

                />

              )


          }







          {/* 分页 */}

          {
            totalPages > 1 && (

              <div
                className="
                  flex
                  justify-center
                "
              >

                <KunPagination

                  total={totalPages}

                  page={currentPage}

                  onPageChange={
                    handlePageChange
                  }

                  isLoading={
                    isPending
                  }

                />


              </div>


            )
          }




        </div>





        {/* 右侧栏 */}

        <RightSidebar />



      </div>





      {/* 发布按钮 */}

      <Button

        color="primary"

        size="lg"

        isIconOnly

        variant="shadow"

        className="
          fixed
          bottom-6
          right-6
          z-50
          rounded-full
          shadow-lg
        "

        onPress={
          () => fabu()
        }

      >

        <Plus
          className="size-5"
        />


      </Button>



    </div>
  )
}