import type { Metadata } from "next";
import { TopicSearchListClient } from "~/components/topic/TopicSearchListClient";
import { kunMoyuMoe } from "~/config/moyu-moe";

export const metadata: Metadata = {
	title: `话题搜索 - ${kunMoyuMoe.title}`,
	description: "搜索话题讨论",
};
export default async function TopicSearchPage() {
	return (
		<>
			<TopicSearchListClient />
		</>
	);
}
