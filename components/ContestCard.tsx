import Link from './Link'
import { ContestData } from '@/data/contestsData'

const ContestCard = ({
  place,
  ctftimeId,
  name,
  ctfPoints,
  ctftimeRating,
  writeupTag,
}: ContestData) => (
  <div className="w-full p-4 md:w-1/2" style={{ maxWidth: '544px' }}>
    <div className="flex flex-col h-full gap-6 p-6 overflow-hidden border-2 border-gray-200 rounded-md md:flex-row border-opacity-60 dark:border-gray-700">
      <div className="relative w-16 mb-6 -mt-6 text-center h-fit">
        <div className="pt-6 pb-3 z-1 w-16 bg-gradient-to-b from-rose-700 to-rose-900 after:w-16 after:box-border after:absolute after:left-0 after:top-full after:h-6 after:border-l-[2rem] after:border-r-[2rem] after:border-b-[2rem] after:border-rose-900 after:border-b-transparent">
          <span
            className={
              place >= 100 ? '' : place >= 10 ? 'text-2xl font-semibold' : 'text-3xl font-bold'
            }
          >
            <sup>#</sup>
            {place}
          </span>
        </div>
      </div>
      <div>
        <h2 className="mb-3 text-2xl font-bold leading-8 tracking-tight">
          <Link href={`https://ctftime.org/event/${ctftimeId}`} aria-label={`Link to ${name}`}>
            {name}
          </Link>
        </h2>
        <p className="flex flex-col items-start gap-2 mb-3 text-gray-500 xl:flex-row max-w-none dark:text-gray-400">
          <span className="inline-block px-3 py-1 text-white rounded-full bg-sky-800">
            Points: {ctfPoints}
          </span>
          <span className="inline-block px-3 py-1 text-white bg-green-800 rounded-full">
            Rating: {isNaN(ctftimeRating) ? 'Pending' : ctftimeRating}
          </span>
        </p>
        <Link
          href={`https://ctftime.org/event/${ctftimeId}`}
          className="text-base font-medium mr-2 leading-6 text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
          aria-label={`CTFTime Link to ${name}`}
        >
          View on CTFTime &rarr;
        </Link>
        {writeupTag && (
          <Link
            href={`/tags/${writeupTag}`}
            className="text-base font-medium leading-6 text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            aria-label={`Writeups of ${name}`}
          >
            Our writeups &rarr;
          </Link>
        )}
      </div>
    </div>
  </div>
)

export default ContestCard
