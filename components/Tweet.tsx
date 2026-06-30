import type { ReactNode } from 'react'

type TweetProps = {
  id: string
  children?: ReactNode
}

const Tweet = ({ id, children }: TweetProps) => {
  return (
    <div className="my-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
      {children}
      <a
        className="text-sm font-medium text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
        href={`https://twitter.com/i/web/status/${id}`}
        rel="noopener noreferrer"
        target="_blank"
      >
        View tweet
      </a>
    </div>
  )
}

export default Tweet
