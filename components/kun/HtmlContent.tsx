interface HtmlContentProps {
  html: string
  className?: string
}

export const HtmlContent = ({
  html,
  className = ''
}: HtmlContentProps) => {
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
