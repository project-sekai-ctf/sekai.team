import ContestCard from '@/components/ContestCard'
import { DataTable } from '@/components/ui/data-table'
import { columns } from '@/layouts/ContestsColumns'
import contestsData from '@/data/contestsData'
import { genPageMetadata } from 'app/seo'
import { groupBy } from 'lodash'
import { Fragment } from 'react'

export const metadata = genPageMetadata({
  title: 'Contests',
  description: 'CTFs we have participated in.',
})

export default function Contests() {
  return (
    <>
      <div className="divide-y divide-border">
        <div className="space-y-2 pb-8 pt-6 md:space-y-5">
          <h1 className="text-3xl font-semibold leading-9 tracking-tight text-foreground sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            Contests
          </h1>
          <p className="text-lg leading-7 text-muted-foreground">
            CTFs we have participated in.
          </p>
        </div>
        <div className="container hidden py-12 md:block">
          <DataTable
            data={contestsData.filter((d) => d.place <= 25)}
            columns={columns}
          />
        </div>
        <div className="container block py-12 md:hidden">
          {Object.entries(groupBy(contestsData, 'year'))
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([year, contests]) => (
              <Fragment key={year}>
                <h2 className="mb-6 mt-12 text-2xl font-bold first:mt-0 sm:text-3xl md:text-4xl">
                  {year}
                </h2>
                <div className="-m-4 flex flex-wrap place-items-stretch">
                  {/* @ts-ignore */}
                  {contests.map((d) => (
                    <ContestCard {...d} key={d.name} />
                  ))}
                </div>
              </Fragment>
            ))}
        </div>
      </div>
    </>
  )
}
