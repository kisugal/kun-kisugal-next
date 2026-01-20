// 测试头像配置脚本
import { env } from '../validations/dotenv-check'

console.log('=== 头像配置测试 ===\n')

console.log('环境变量:')
console.log('KUN_VISUAL_NOVEL_IMAGE_BED_URL:', process.env.KUN_VISUAL_NOVEL_IMAGE_BED_URL)
console.log('KUN_VISUAL_NOVEL_IMAGE_BED_HOST:', process.env.KUN_VISUAL_NOVEL_IMAGE_BED_HOST)
console.log('KUN_VISUAL_NOVEL_S3_STORAGE_ENDPOINT:', process.env.KUN_VISUAL_NOVEL_S3_STORAGE_ENDPOINT)
console.log('KUN_VISUAL_NOVEL_S3_STORAGE_BUCKET_NAME:', process.env.KUN_VISUAL_NOVEL_S3_STORAGE_BUCKET_NAME)

console.log('\n生成的头像 URL 示例:')
const uid = 1
const timestamp = Date.now()
const imageLink = `${process.env.KUN_VISUAL_NOVEL_IMAGE_BED_URL}/user/avatar/user_${uid}/avatar-mini-${timestamp}.avif`
console.log(imageLink)

console.log('\n请在浏览器中测试这个 URL 是否可以访问')
console.log('如果返回 403/404，说明 Backblaze B2 配置有问题')




