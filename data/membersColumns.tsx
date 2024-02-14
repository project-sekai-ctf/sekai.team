'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import SocialBar, { socialKeys } from '@/components/SocialBar'
import { pick } from 'lodash'
import { ColumnDef } from '@tanstack/react-table'
import type { Authors } from 'contentlayer/generated'
import { specialtyColors, specialtyIcons } from '@/scripts/utils'
import { ChevronDown, ChevronUp, Crown, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import clsx from 'clsx'
import Link from 'next/link'

export const columns: ColumnDef<Authors>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="-ml-4 hover:bg-background"
          onClick={() => column.toggleSorting()}
        >
          <div className="flex items-center gap-1">
            <p>Name</p>
            <div className="flex items-center">
              {column.getIsSorted() === 'asc' && <ChevronUp size={16} />}
              {column.getIsSorted() === 'desc' && <ChevronDown size={16} />}
            </div>
          </div>
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <TooltipProvider>
          <div className="flex items-center gap-4 p-4">
            {/* @ts-ignore */}
            <Avatar>
              {/* @ts-ignore */}
              <AvatarImage src={row.original.avatar} alt={row.original.name} />
              {/* @ts-ignore */}
              <AvatarFallback>{row.original.name.slice(0, 2)}</AvatarFallback>
            </Avatar>

            <div className="flex flex-col gap-1">
              <p className="flex items-center gap-1 text-sm font-medium leading-none">
                <Link href={`/members/${row.original.slug}`}>
                  {row.original.name}
                </Link>
                {row.original.isCaptain && (
                  <Tooltip>
                    {/* @ts-ignore */}
                    <TooltipTrigger asChild>
                      <Crown size={16} />
                    </TooltipTrigger>
                    {/* @ts-ignore */}
                    <TooltipContent>Captain</TooltipContent>
                  </Tooltip>
                )}
                {row.original.retired && (
                  <Tooltip>
                    {/* @ts-ignore */}
                    <TooltipTrigger asChild>
                      <GraduationCap size={16} />
                    </TooltipTrigger>
                    {/* @ts-ignore */}
                    <TooltipContent>Retired</TooltipContent>
                  </Tooltip>
                )}
              </p>
              <p className="overflow-wrap w-48 break-words text-xs text-muted-foreground">
                {row.original.description}
              </p>
            </div>
          </div>
        </TooltipProvider>
      )
    },
  },
  {
    accessorKey: 'specialties',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="-ml-4 hover:bg-background"
          onClick={() => column.toggleSorting()}
        >
          <div className="flex items-center gap-1">
            <p>Specialties</p>
            <div className="flex items-center">
              {column.getIsSorted() === 'asc' && <ChevronUp size={16} />}
              {column.getIsSorted() === 'desc' && <ChevronDown size={16} />}
            </div>
          </div>
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="flex flex-wrap gap-2 p-4">
          {row.original.specialties &&
            row.original.specialties.map((specialty) => {
              const IconComponent = specialtyIcons[specialty.toLowerCase()]
              const color = specialtyColors[specialty.toLowerCase()]

              return (
                <span
                  key={specialty}
                  className={clsx(
                    'inline-block rounded-full px-3 py-1 text-foreground',
                    color
                      ? `bg-${color}-300 dark:bg-${color}-700`
                      : 'bg-secondary'
                  )}
                >
                  {IconComponent ? (
                    <div className="flex items-center gap-1">
                      <IconComponent size={18} /> {specialty}
                    </div>
                  ) : null}
                  {/* ALTERNATIVE DISPLAY METHOD */}
                  {/* {IconComponent ? (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <IconComponent size={18} />
                                                </TooltipTrigger>
                                                <TooltipContent>{specialty}</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    ) : null} */}
                  {/* <span className="ml-2">{specialty}</span> */}
                </span>
              )
            })}
        </div>
      )
    },
  },
  {
    accessorKey: 'joinDate',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="-ml-4 hover:bg-background"
          onClick={() => column.toggleSorting()}
        >
          <div className="flex items-center gap-1">
            <p>Join Date</p>
            <div className="flex items-center">
              {column.getIsSorted() === 'asc' && <ChevronUp size={16} />}
              {column.getIsSorted() === 'desc' && <ChevronDown size={16} />}
            </div>
          </div>
        </Button>
      )
    },
    cell: ({ row }) => {
      // @ts-ignore
      const joinDate = new Date(row.original.joinDate).toLocaleDateString(
        'en-US',
        {
          year: 'numeric',
          month: 'long',
        }
      )

      return <p className="p-4 text-muted-foreground">{joinDate}</p>
    },
  },
  {
    accessorKey: 'socials',
    header: () => {
      return (
        <div className="py-2 text-muted-foreground">
          <p>Socials</p>
        </div>
      )
    },
    cell: ({ row }) => {
      const socials = pick(row.original, socialKeys)
      return <SocialBar {...socials} size={5} />
    },
  },
]
