'use client'

import Link from './Link'
import { ContestData } from '@/data/contestsData'
import { useState } from 'react'
import ContestSocial from '@/components/ContestSocial'
import Share from '@/data/share.svg'
import clsx from 'clsx'

const ContestCard = ({
  place,
  ctftimeId,
  name,
  ctfPoints,
  ctftimeRating,
  writeupTag,
  isMerger,
}: ContestData) => {
  const [open, setOpen] = useState(false)

  if (place > 25) return null
  return (
    <div className="w-full max-w-[544px] p-4 md:w-1/2">
      <ContestSocial
        open={open}
        setOpen={setOpen}
        place={place}
        name={name}
        ctfPoints={ctfPoints}
      />
      <div className="relative flex h-full flex-col gap-6 overflow-hidden rounded-md border-2 border-border border-opacity-60 p-6 md:flex-row">
        <div className="relative -mt-6 mb-6 h-fit w-16 text-center">
          <div
            className={clsx(
              place == 1
                ? 'from-yellow-500 to-yellow-700 after:border-yellow-700'
                : place == 2
                ? 'from-gray-400 to-gray-600 after:border-gray-600'
                : 'from-rose-700 to-rose-900 after:border-rose-900',
              'z-1 flex h-[4.5rem] w-16 items-end justify-center bg-gradient-to-b pb-3 after:absolute after:left-0 after:top-full after:box-border after:h-6 after:w-16 after:border-b-[2rem] after:border-l-[2rem] after:border-r-[2rem] after:border-b-transparent'
            )}
          >
            <span
              className={clsx(
                place >= 100
                  ? ''
                  : place >= 10
                  ? 'text-2xl font-semibold'
                  : place >= 4
                  ? 'text-2xl font-bold'
                  : 'text-3xl font-bold',
                'inline-block leading-none text-white'
              )}
            >
              <sup>#</sup>
              {place}
            </span>
          </div>
        </div>
        <div>
          <h2 className="mb-3 text-2xl font-bold leading-8 tracking-tight">
            {ctftimeId ? (
              <Link
                href={`https://ctftime.org/event/${ctftimeId}`}
                aria-label={`Link to ${name}`}
              >
                {name}
              </Link>
            ) : (
              name
            )}
          </h2>
          <p className="mb-3 flex max-w-none flex-col items-start gap-2 text-muted-foreground xl:flex-row">
            {ctftimeRating !== undefined && (
              <span className="inline-block rounded-full bg-green-800 px-3 py-1 text-white">
                Rating:{' '}
                {isNaN(ctftimeRating) ? 'Pending' : ctftimeRating.toFixed(2)}
              </span>
            )}
            <span className="inline-block rounded-full bg-sky-800 px-3 py-1 text-white">
              Points: {ctfPoints}
            </span>
            {isMerger && (
              <span className="inline-block rounded-full bg-cyan-800 px-3 py-1 text-white">
                Merger
              </span>
            )}
          </p>
          {ctftimeId && (
            <Link
              href={`https://ctftime.org/event/${ctftimeId}`}
              className="mr-2 text-base font-medium leading-6 text-primary"
              aria-label={`CTFTime Link to ${name}`}
            >
              View on CTFTime &rarr;
            </Link>
          )}
          {writeupTag && (
            <Link
              href={`/tags/${writeupTag}`}
              className="text-base font-medium leading-6 text-primary"
              aria-label={`Writeups of ${name}`}
            >
              Our writeups &rarr;
            </Link>
          )}
          <button
            onClick={() => setOpen(!open)}
            className="absolute bottom-4 right-4"
          >
            <Share />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ContestCard
