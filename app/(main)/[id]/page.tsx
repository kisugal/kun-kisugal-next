import { ErrorComponent } from '~/components/error/ErrorComponent'
import { PatchDetailPage } from '~/components/patch/header/PatchDetailPage'
import { getPatchDetailData } from '~/components/patch/header/data'
import { generateKunMetadataTemplate } from './metadata'
import type { Metadata } from 'next'

export const revalidate = 3

interface Props {
  params: Promise<{ id: string }>
}

export const generateMetadata = async ({
  params
}: Props): Promise<Metadata> => {
  const { id } = await params
  const response = await getPatchDetailData(id)
  if (typeof response === 'string') {
    return {}
  }

  return generateKunMetadataTemplate(response.patch, response.intro)
}

export default async function Kun({ params }: Props) {
  const { id } = await params
  if (!id) {
    return <ErrorComponent error={'提取页面参数错误'} />
  }

  const response = await getPatchDetailData(id)
  if (typeof response === 'string') {
    return <ErrorComponent error={response} />
  }

  return <PatchDetailPage data={response} />
}
