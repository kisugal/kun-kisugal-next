import { TopicListClient } from './TopicListClient'
import { TopicSearchListClient } from './TopicSearchListClient'

export const TopicListPage = () => {
  return (
    <TopicListClient
    // initialTopics={initialTopics}
    // initialTotal={initialTotal}
    />
  )
}

export const TopicSearchListPage = () => {
  return <TopicSearchListClient />
}
