import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "~/prisma/index";

// GET - 搜索话题
export const GET = async (req: NextRequest) => {
	try {
		const { searchParams } = new URL(req.url);
		const q = (searchParams.get("q") || "");
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "10");
		const sortField = searchParams.get("sortField") || "created";
		const sortOrder = searchParams.get("sortOrder") || "desc";
		const type = searchParams.get("type") || "all";
		const username = searchParams.get("username")


		const searchTerm = q.trim();
		const skip = (page - 1) * limit;

		// 构建查询条件：在标题和内容中搜索，只显示未删除的话题
		let where: any = {
			status: 0,
		};
		if (q || searchTerm !== "") {
			where.OR = [
				{ title: { contains: searchTerm } },
				{ content: { contains: searchTerm } },
			];
		}

		if (username) {
			const user = await prisma.user.findUnique({
				where: { name: username },
				select: { id: true }
			})
			if (user) {
				where.user_id = user.id
			}
		} else if (type === 'image') {
			where.content = { contains: '![' }
		}
		// 构建排序
		const orderBy: any = {};
		orderBy[sortField] = sortOrder;

		// 查询数据库
		const [topics, total] = await Promise.all([
			prisma.topic.findMany({
				where,
				skip,
				take: limit,
				orderBy: [
					{ is_pinned: "desc" }, // 置顶话题优先
					orderBy,
				],
				select: {
					id: true,
					title: true,
					content: true,
					created: true,
					updated: true,
					view_count: true,
					like_count: true,
					is_pinned: true,
					user: {
						select: {
							id: true,
							name: true,
							avatar: true,
						},
					},
					_count: {
						select: {
							topic_comments: true,
						},
					},
				},
			}),
			prisma.topic.count({ where }),
		]);

		// 格式化数据
		const formattedTopics = topics.map((topic) => ({
			...topic,
			comment_count: topic._count.topic_comments,
			_count: undefined,
		}));

		const result = {
			topics: formattedTopics,
			total,
			page,
			limit,
		};

		return NextResponse.json(result, {
			headers: {
				"X-Cache": "MISS",
				"Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
			},
		});
	} catch (error) {
		console.error("搜索话题失败:", error);
		return NextResponse.json({ error: "搜索话题失败" }, { status: 500 });
	}
};
