import siteMetadata from '@/data/siteMetadata'
import contestsData from '@/data/contestsData'
import ContestCard from '@/components/ContestCard'
import { PageSEO } from '@/components/SEO'

export default function Projects() {
  return (
    <>
      <PageSEO title={`Contests - ${siteMetadata.title}`} description={siteMetadata.description} />
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="pt-6 pb-8 space-y-2 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            Contests
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            Past contests we participated
          </p>
        </div>
        <div className="container py-12">
          <div className="flex flex-wrap -m-4 place-items-stretch">
            {contestsData.map((d) => (
              <ContestCard {...d} key={d.name} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
