'use client'

import { allAuthors } from 'contentlayer/generated'
import { columns } from '@/layouts/MembersColumns'
import { DataTable } from '@/components/ui/data-table'
import { useState, useMemo } from 'react'
import { Checkbox } from '@/components/ui/checkbox'

const MembersTable = () => {
  const [showRetired, setShowRetired] = useState(false)

  const filteredAuthors = useMemo(() => {
    // Filter authors based on the toggle state
    return showRetired
      ? allAuthors.filter((d) => d.name !== 'Project SEKAI')
      : allAuthors
          .filter((d) => d.name !== 'Project SEKAI')
          .filter((d) => !d.retired)
  }, [showRetired])

  const toggleShowRetired = () => setShowRetired((prev) => !prev)

  return (
    <>
      <div className="mb-4 flex flex-row-reverse items-center gap-2">
        <Checkbox
          defaultChecked={showRetired}
          onCheckedChange={toggleShowRetired}
          className="h-4 w-4"
        />
        <p className="text-sm text-muted-foreground">Show retired members</p>
      </div>
      <DataTable
        columns={columns}
        data={filteredAuthors}
        defaultSortState={[{ id: 'joinDate', desc: false }]}
      />
    </>
  )
}

export default MembersTable
