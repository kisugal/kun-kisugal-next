import type { Metadata } from "next";
import { TopicSearchListPage } from "~/components/topic/TopicListPage";
import { kunMoyuMoe } from "~/config/moyu-moe";

export const metadata: Metadata = {
	title: `话题搜索 - ${kunMoyuMoe.title}`,
	description: "搜索话题讨论",
};

export const dynamic = 'force-dynamic'

export default async function TopicSearchPage() {
	return (
		<TopicSearchListPage />
	);
}
