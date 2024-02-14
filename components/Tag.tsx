import Link from 'next/link'
import { slug } from 'github-slugger'
import { Badge } from './ui/badge'
import clsx from 'clsx'
import { specialtyColors, specialtyIcons } from '@/scripts/utils'

interface Props {
  text: string
}

const Tag = ({ text }: Props) => {
  const IconComponent = specialtyIcons[text.toLowerCase()]

  return (
    <Link href={`/tags/${slug(text)}`}>
      <Badge
        className={clsx(
          'mb-1 mr-1 font-normal text-foreground hover:!bg-primary/80',
          specialtyColors[text.toLowerCase()]
            ? `bg-${specialtyColors[text.toLowerCase()]}-300 dark:bg-${
                specialtyColors[text.toLowerCase()]
              }-700`
            : 'bg-secondary'
        )}
      >
        {IconComponent && <IconComponent className="mr-1 h-4 w-4" />}
        {text}
      </Badge>
    </Link>
  )
}

export default Tag
