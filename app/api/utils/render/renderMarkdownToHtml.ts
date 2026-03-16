import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypePrismPlus from 'rehype-prism-plus'
import { unified } from 'unified'
import { rehypeCodeLanguage } from '~/components/kun/rehype-code-language'

const customSchema = {
  tagNames: [
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
  ],
  attributes: {
    '*': ['className'],
    pre: ['className', 'dataLanguage'],
    code: ['className'],
    a: ['href', 'title'],
    img: ['src', 'alt', 'title', 'width', 'height']
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
