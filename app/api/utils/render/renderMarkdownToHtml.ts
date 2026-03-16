import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypePrismPlus from 'rehype-prism-plus'
import { unified } from 'unified'
import { rehypeCodeLanguage } from '~/components/kun/rehype-code-language'

const customSchema = {
  // Start from the default schema to preserve its built-in safety rules.
  ...defaultSchema,
  tagNames: Array.from(
    new Set([
      ...(defaultSchema.tagNames || []),
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'p',
      'br',
      'strong',
      'em',
      'u',
      's',
      'code',
      'pre',
      'blockquote',
      'ul',
      'ol',
      'li',
      'a',
      'img',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'hr',
      'del',
      'ins',
      'sup',
      'sub',
      'span',
      'div'
    ])
  ),
  attributes: {
    ...(defaultSchema.attributes || {}),
    '*': [
      ...(defaultSchema.attributes?.['*'] || []),
      'className'
    ],
    pre: [
      ...(defaultSchema.attributes?.pre || []),
      'className',
      'dataLanguage'
    ],
    code: [
      ...(defaultSchema.attributes?.code || []),
      'className'
    ],
    a: [
      ...(defaultSchema.attributes?.a || []),
      'href',
      'title'
    ],
    img: [
      ...(defaultSchema.attributes?.img || []),
      'src',
      'alt',
      'title',
      'width',
      'height'
    ]
  },
  protocols: {
    ...(defaultSchema.protocols || {}),
    a: {
      ...(defaultSchema.protocols?.a || {}),
      href: ['http', 'https', 'mailto', 'tel']
    },
    img: {
      ...(defaultSchema.protocols?.img || {}),
      src: ['http', 'https']
    }
  }
}

export const renderMarkdownToHtml = async (markdown: string) => {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypePrismPlus, {
      ignoreMissing: true,
      showLineNumbers: true,
      defaultLanguage: 'text'
    })
    .use(rehypeSanitize, customSchema)
    .use(rehypeCodeLanguage)
    .use(rehypeStringify)
    .process(markdown)

  return String(result)
}
