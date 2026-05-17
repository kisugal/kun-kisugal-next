'use client'

import { useEffect, useRef, useState } from 'react'
import { Button, Tooltip } from '@heroui/react'
import { cn } from '~/utils/cn'

import { X } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@bprogress/next'

export const TopicSearchInput = () => {
    const inputRef = useRef<HTMLInputElement>(null)
    const [isFocused] = useState(false)
    const router = useRouter();
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get("search");

    const [isShowClearButton, setIsShowClearButton] = useState(false)
    const [searchQueryState, setSearchQuery] = useState(searchQuery || '')

    const handleExecuteSearch = () => {
        const trimmedQuery = searchQueryState.trim();
        if (trimmedQuery) {
            router.push(`/topic/search?search=${encodeURIComponent(trimmedQuery)}`);
        } else {
            router.push('/topic/search');
        }
    }

    useEffect(() => {
        setIsShowClearButton(!!searchQuery)
    }, [searchQuery])

    const handleClearInput = () => {
        router.push('/topic/search')
    }

    return (
        <div
            className={cn(
                'flex gap-2 p-3 bg-default-100 rounded-large transition-all duration-200',
                isFocused ? 'ring-2 ring-primary ring-offset-2' : ''
            )}
        >
            <div className="flex flex-wrap items-center w-full gap-2">
                <input
                    ref={inputRef}
                    className="placeholder-default-500 text-default-700 min-w-[120px] flex-grow bg-transparent outline-none"
                    value={searchQueryState}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleExecuteSearch();
                        }
                    }}
                    placeholder="输入内容, 点击按钮或回车创建关键词"
                />

                {isShowClearButton && (
                    <Tooltip content="清除搜索内容">
                        <Button
                            isIconOnly
                            key="delete_button"
                            variant="light"
                            onPress={handleClearInput}
                        >
                            <X />
                        </Button>
                    </Tooltip>
                )}

                <Button color="primary" onPress={handleExecuteSearch}>
                    搜索
                </Button>
            </div>
        </div>
    )
}
