import { prisma } from '../prisma/index'

/**
 * 删除所有标签和公司
 * ⚠️ 警告：这会删除所有标签和公司数据！
 * 运行: npx tsx scripts/delete-all-tags.ts
 */
async function deleteAllTagsAndCompanies() {
    console.log('⚠️  警告：即将删除所有标签和公司数据！')
    console.log('等待 3 秒...')
    await new Promise(resolve => setTimeout(resolve, 3000))

    try {
        await prisma.$transaction(async (prisma) => {
            // 删除所有标签关联
            const deletedTagRelations = await prisma.patch_tag_relation.deleteMany({})
            console.log(`✓ 删除了 ${deletedTagRelations.count} 个标签关联`)

            // 删除所有标签
            const deletedTags = await prisma.patch_tag.deleteMany({})
            console.log(`✓ 删除了 ${deletedTags.count} 个标签`)

            // 删除所有公司关联
            const deletedCompanyRelations = await prisma.patch_company_relation.deleteMany({})
            console.log(`✓ 删除了 ${deletedCompanyRelations.count} 个公司关联`)

            // 删除所有公司
            const deletedCompanies = await prisma.patch_company.deleteMany({})
            console.log(`✓ 删除了 ${deletedCompanies.count} 个公司`)
        })

        console.log('\n✅ 所有标签和公司已删除！')
    } catch (error) {
        console.error('❌ 删除失败:', error)
        process.exit(1)
    }
}

deleteAllTagsAndCompanies()
    .catch((error) => {
        console.error('执行失败:', error)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })




