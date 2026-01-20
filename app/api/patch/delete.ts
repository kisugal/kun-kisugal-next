import { z } from 'zod'
import { deleteFileFromS3 } from '~/lib/s3'
import { prisma } from '~/prisma/index'

const patchIdSchema = z.object({
  patchId: z.coerce.number().min(1).max(9999999)
})

export const deletePatchById = async (input: z.infer<typeof patchIdSchema>) => {
  const { patchId } = input

  const patch = await prisma.patch.findUnique({
    where: { id: patchId },
    include: {
      tag: { include: { tag: true } },
      company: { include: { company: true } }
    }
  })

  if (!patch) {
    return '未找到该游戏'
  }

  const patchResources = await prisma.patch_resource.findMany({
    where: { patch_id: patchId }
  })

  return await prisma.$transaction(async (prisma) => {
    // 删除 S3 上的资源文件
    if (patchResources.length > 0) {
      await Promise.all(
        patchResources.map(async (resource) => {
          if (resource.storage === 's3') {
            const fileName = resource.content.split('/').pop()
            const s3Key = `patch/${resource.patch_id}/${resource.hash}/${fileName}`
            await deleteFileFromS3(s3Key)
          }

          await prisma.patch_resource.delete({
            where: { id: resource.id }
          })
        })
      )
    }

    // 处理标签：减少计数，如果计数为 0 则删除标签
    if (patch.tag.length > 0) {
      for (const tagRelation of patch.tag) {
        const updatedTag = await prisma.patch_tag.update({
          where: { id: tagRelation.tag_id },
          data: { count: { decrement: 1 } }
        })

        // 如果计数为 0，删除标签
        if (updatedTag.count <= 0) {
          await prisma.patch_tag.delete({
            where: { id: tagRelation.tag_id }
          })
        }
      }
    }

    // 处理公司：减少计数，如果计数为 0 则删除公司
    if (patch.company.length > 0) {
      for (const companyRelation of patch.company) {
        const updatedCompany = await prisma.patch_company.update({
          where: { id: companyRelation.company_id },
          data: { count: { decrement: 1 } }
        })

        // 如果计数为 0，删除公司
        if (updatedCompany.count <= 0) {
          await prisma.patch_company.delete({
            where: { id: companyRelation.company_id }
          })
        }
      }
    }

    // 删除游戏（CASCADE 会自动删除关联数据）
    await prisma.patch.delete({
      where: { id: patchId }
    })

    return {}
  }, {
    timeout: 60000
  })
}
