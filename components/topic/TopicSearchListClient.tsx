"use client";

import {
    Card,
    Button,
    CardBody,
    Select,
    SelectItem,
    Skeleton,
} from "@heroui/react";
import { Plus } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { KunPagination } from "~/components/kun/Pagination";
import { useUserStore } from "~/store/userStore";
import type { TopicCard } from "~/types/api/topic";
import { kunFetchGet } from "~/utils/kunFetch";
import { TopicList } from "./TopicList";
import { TopicSearchInput } from "../search/TopicSearchInput";

// 动态加载右侧边栏，不阻塞首屏
const RightSidebar = dynamic(
    () =>
        import("~/components/layout/RightSidebar").then((mod) => ({
            default: mod.RightSidebar,
        })),
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
        ),
    },
);

interface TopicListResponse {
    topics: TopicCard[];
    total: number;
    page: number;
    limit: number;
}

type TabType = "following" | "all" | "official" | "image";

const sortOptions = [
    { key: "created", label: "最新发布" },
    { key: "view_count", label: "浏览最多" },
    { key: "like_count", label: "点赞最多" },
];

const TabType = [
    { key: "following", label: "关注" },
    { key: "all", label: "全部" },
    { key: "official", label: "官方" },
    { key: "image", label: "图片" },
];

const orderOptions = [
    { key: "desc", label: "降序" },
    { key: "asc", label: "升序" },
];

interface Props {
    initialTopics?: TopicCard[];
    initialTotal?: number;
}

const STORAGE_KEY = "topic_list_state";

interface SavedState {
    page: number;
    sortField: string;
    sortOrder: string;
    tab: TabType;
}

export const TopicSearchListClient = ({
    initialTopics = [],
    initialTotal = 0,
}: Props) => {
    const router = useRouter();

    const [topics, setTopics] = useState<TopicCard[]>(initialTopics);
    const [isPending, startTransition] = useTransition();
    const [total, setTotal] = useState(initialTotal);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState("created");
    const [sortOrder, setSortOrder] = useState("desc");
    const [activeTab, setActiveTab] = useState<TabType>("all");
    const limit = 10;

    // 保存状态到 sessionStorage
    const saveState = useCallback(
        (page: number, sort: string, order: string, tab: TabType) => {
            if (typeof window !== "undefined") {
                const state: SavedState = {
                    page,
                    sortField: sort,
                    sortOrder: order,
                    tab,
                };
                sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            }
        },
        [],
    );

    // 从 sessionStorage 读取状态
    const loadState = useCallback((): SavedState | null => {
        if (typeof window !== "undefined") {
            const saved = sessionStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch {
                    return null;
                }
            }
        }
        return null;
    }, []);


    const searchParams = useSearchParams();
    const searchQuery = searchParams.get("search");

    const fetchSearchResults = async (
        query: string,
        page: number = 1,
        sort: string = "created",
        order: string = "desc",
        type: TabType = "all",
    ) => {
        startTransition(async () => {
            try {
                let url = `/api/topic/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}&sortField=${sort}&sortOrder=${order}`;
                if (type === "following") {
                    url += "&type=following";
                } else if (type === "image") {
                    url += "&type=image";
                } else if (type === "official") {
                    url += "&username=KisuGal官方";
                }
                const response = await kunFetchGet<TopicListResponse>(url);
                setTopics(response.topics);
                setTotal(response.total);
                setCurrentPage(response.page);
            } catch (error) {
                console.error("搜索话题失败:", error);
            }
        });
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        if (searchQuery && searchQuery.trim()) {
            fetchSearchResults(searchQuery.trim(), page, sortField, sortOrder, activeTab);
        } else {
            saveState(page, sortField, sortOrder, activeTab);
        }
    };

    const handleSortChange = (field: string, order: string) => {
        setSortField(field);
        setSortOrder(order);
        setCurrentPage(1);
        if (searchQuery && searchQuery.trim()) {
            fetchSearchResults(searchQuery.trim(), 1, field, order);
        } else {
            saveState(1, field, order, activeTab);
        }
    };

    const handleTabChange = (key: string | number) => {
        const tab = key as TabType;
        setActiveTab(tab);
        setCurrentPage(1);
        saveState(1, sortField, sortOrder, tab);
        fetchSearchResults(searchQuery?.trim() || "", 1, sortField, sortOrder, tab);
    };

    useEffect(() => {
        // 最优先：如果 URL 中有 search 查询参数，执行搜索
        if (searchQuery && searchQuery.trim()) {
            setActiveTab("all");
            fetchSearchResults(searchQuery.trim(), 1, sortField, sortOrder);
            return;
        }

        // 从 sessionStorage 恢复状态
        const savedState = loadState();

        if (savedState) {
            setCurrentPage(savedState.page);
            setSortField(savedState.sortField);
            setSortOrder(savedState.sortOrder);
            setActiveTab(savedState.tab);
        } else {
            // 没有保存的状态，加载默认数据
        }

    }, [searchQuery]);

    const totalPages = Math.ceil(total / limit);

    const { user } = useUserStore((state) => state);
    const fabu = async () => {
        if (user.uid === 0) {
            toast.error("请先登录后再创建话题");
            setTimeout(() => {
                router.push("/login");
            }, 1500);
            return;
        } else {
            router.push("/topic/create");
        }
    };

    return (
        <div className="container mx-auto my-4">
            <div className="flex gap-6">
                {/* 主内容区域 */}

                <div className="flex-1 min-w-0 space-y-3">
                    {/* 标签页导航 */}
                    {/* <Tabs
                        selectedKey={activeTab}
                        onSelectionChange={handleTabChange}
                        variant="underlined"
                        classNames={{
                            tabList: "w-full flex rounded-none p-0 border-b border-divider",
                            cursor: "w-full bg-primary",
                            tab: "flex-1 px-6 h-12 flex justify-center",
                            tabContent: "group-data-[selected=true]:text-primary text-center",
                            base: "flex",
                        }}
                    >
                        <Tab key="following" title="关注" />
                        <Tab key="all" title="全部" />
                        <Tab key="official" title="官方" />
                        <Tab key="image" title="图片" />
                    </Tabs> */}
                    {/* </CardBody>
          </Card> */}

                    {/* 筛选和排序 */}
                    {/* <Card>
            <CardHeader className="pb-3"> */}
                    {/* <div className="flex items-center mb-0 gap-2"> */}
                    {/* <Filter className="size-4" />
            <span className="font-medium">筛选和排序</span> */}
                    {/* </div> */}
                    {/* </CardHeader> */}
                    {/* <CardBody className="pt-0"> */}

                    <h1 className="text-2xl font-bold">话题搜索-{searchQuery || "请输入关键词"}</h1>
                    <TopicSearchInput />
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-foreground/70">搜索范围:</span>
                            <Select
                                size="sm"
                                selectedKeys={[activeTab]}
                                onSelectionChange={(keys) => {
                                    const field = Array.from(keys)[0] as string;
                                    handleTabChange(field);
                                }}
                                className="w-32"
                            >
                                {TabType.map((option) => (
                                    <SelectItem key={option.key}>{option.label}</SelectItem>
                                ))}
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-foreground/70">排序方式:</span>
                            <Select
                                size="sm"
                                selectedKeys={[sortField]}
                                onSelectionChange={(keys) => {
                                    const field = Array.from(keys)[0] as string;
                                    handleSortChange(field, sortOrder);
                                }}
                                className="w-32"
                            >
                                {sortOptions.map((option) => (
                                    <SelectItem key={option.key}>{option.label}</SelectItem>
                                ))}
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-foreground/70">排序:</span>
                            <Select
                                size="sm"
                                selectedKeys={[sortOrder]}
                                onSelectionChange={(keys) => {
                                    const order = Array.from(keys)[0] as string;
                                    handleSortChange(sortField, order);
                                }}
                                className="w-20"
                            >
                                {orderOptions.map((option) => (
                                    <SelectItem key={option.key}>{option.label}</SelectItem>
                                ))}
                            </Select>
                        </div>
                    </div>

                    {/* 内容区域 */}
                    {isPending && topics.length === 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                // <Card key={i}>
                                <div className="space-y-3" key={i}>
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="w-10 h-10 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-24 rounded-lg" />
                                            <Skeleton className="h-3 w-32 rounded-lg" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-6 w-3/4 rounded-lg" />
                                    <Skeleton className="h-20 w-full rounded-lg" />
                                </div>
                                // </Card>
                            ))}
                        </div>
                    ) : (
                        // 话题列表
                        <TopicList topics={topics} columns={2} />
                    )}

                    {/* 分页 */}
                    {totalPages > 1 && (
                        <div className="flex justify-center">
                            <KunPagination
                                total={totalPages}
                                page={currentPage}
                                onPageChange={handlePageChange}
                                isLoading={isPending}
                            />
                        </div>
                    )}
                </div>

                {/* 右侧边栏 */}
                <RightSidebar />
            </div>
            <Button
                color="primary"
                size="lg"
                isIconOnly
                variant="shadow"
                className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg"
                onPress={() => fabu()}
            >
                <Plus className="size-5" />
            </Button>
        </div>
    );
};
