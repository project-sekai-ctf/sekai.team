'use client'

import ContestSocial from '@/components/ContestSocial'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Share from '@/data/share.svg'
import { ColumnDef } from '@tanstack/react-table'
import clsx from 'clsx'
import {
  BookOpen,
  BookOpenCheck,
  ChevronDown,
  ChevronUp,
  Flag,
  Merge,
  MoreHorizontal,
  Plane,
} from 'lucide-react'
import { useState } from 'react'
import type { ContestData } from './contestsData'
import Link from 'next/link'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'

export const columns: ColumnDef<ContestData>[] = [
  {
    accessorKey: 'place',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="-ml-4 hover:bg-background"
          onClick={() => column.toggleSorting()}
        >
          <div className="flex items-center gap-1">
            <p>Place</p>
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
        <div
          className={clsx(
            'py-8 [clip-path:polygon(0%_0%,_100%_0%,_calc(100%_-_20px)_50%,_100%_100%,_0%_100%)]',
            row.original.place == 1
              ? 'bg-gradient-to-r from-yellow-300 to-yellow-400 dark:from-yellow-500 dark:to-yellow-700'
              : row.original.place == 2
              ? 'bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-400 dark:to-gray-600'
              : 'bg-gradient-to-r from-rose-300 to-rose-400 dark:from-rose-700 dark:to-rose-900'
          )}
        >
          <span className="-ml-4 flex items-center justify-center text-2xl font-semibold leading-none text-foreground">
            <sup className="pt-4">#</sup>
            {row.original.place}
          </span>
        </div>
      )
    },
  },
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
      // @ts-ignore
      const startDate = new Date(row.original.startDate).toLocaleDateString(
        'en-US',
        {
          month: 'long',
          day: 'numeric',
        }
      )

      // @ts-ignore
      const endDate = new Date(row.original.endDate).toLocaleDateString(
        'en-US',
        {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }
      )

      return (
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1 px-4">
            <p className="flex items-center gap-1 font-medium">
              {row.original.name}
              {row.original.writeupTag && (
                <TooltipProvider>
                  <Tooltip>
                    {/* @ts-ignore */}
                    <TooltipTrigger asChild>
                      <BookOpenCheck size={16} />
                    </TooltipTrigger>
                    {/* @ts-ignore */}
                    <TooltipContent>Writeups available</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {startDate} – {endDate}
            </p>
            <p className="text-xs text-muted-foreground">
              {row.original.location}
            </p>
          </div>
          <div className="flex flex-col justify-end gap-2 px-4 xl:flex-row">
            {row.original.isMerger && (
              <span className="flex h-fit w-fit items-center gap-1 whitespace-nowrap rounded-full bg-cyan-300 px-3 py-1 text-foreground dark:bg-cyan-800">
                <Merge size={16} /> Merger
              </span>
            )}
            {row.original.onSite && (
              <span className="flex h-fit w-fit items-center gap-1 whitespace-nowrap rounded-full bg-emerald-300 px-3 py-1 text-foreground dark:bg-emerald-800">
                <Plane size={16} /> On-site
              </span>
            )}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'ctftimeRating',
    header: ({ column }) => {
      return (
        <div className="flex h-full w-full flex-row-reverse items-center">
          <Button
            variant="ghost"
            className="-mr-4 hover:bg-background"
            onClick={() => column.toggleSorting()}
          >
            <div className="flex items-center gap-1">
              <div className="flex items-center">
                {column.getIsSorted() === 'asc' && <ChevronUp size={16} />}
                {column.getIsSorted() === 'desc' && <ChevronDown size={16} />}
              </div>
              <p>CTFtime Rating</p>
            </div>
          </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      const [open, setOpen] = useState(false)

      return (
        <div className="flex justify-between px-4">
          <ContestSocial
            open={open}
            setOpen={setOpen}
            place={row.original.place}
            name={row.original.name}
            ctfPoints={row.original.ctfPoints}
          />
          <div className="flex flex-col items-center justify-center">
            {row.original.writeupTag && (
              <Link href={`/tags/${row.original.writeupTag}`}>
                <Button variant="ghost" className="h-fit w-fit p-2">
                  <BookOpen size={16} />
                </Button>
              </Link>
            )}
            <DropdownMenu modal={false}>
              {/* @ts-ignore */}
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              {/* @ts-ignore */}
              <DropdownMenuContent align="end">
                {/* @ts-ignore */}
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {row.original.ctftimeId && (
                  <Link
                    href={`https://ctftime.org/event/${row.original.ctftimeId}`}
                  >
                    {/* @ts-ignore */}
                    <DropdownMenuItem className="flex justify-between">
                      View on CTFtime
                      <DropdownMenuShortcut>
                        <Flag size={16} className="ml-4" />
                      </DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </Link>
                )}
                <button onClick={() => setOpen(!open)} className="w-full">
                  {/* @ts-ignore */}
                  <DropdownMenuItem className="flex justify-between">
                    Share
                    <DropdownMenuShortcut>
                      <Share size={16} className="ml-4" />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                </button>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div>
            <span className="flex items-center justify-end gap-1 text-base font-bold">
              {row.original.ctftimeRating !== undefined &&
                row.original.ctftimeRating.toFixed(2)}
              <Flag size={16} />
            </span>
            <span className="flex justify-end text-xs text-muted-foreground">
              rating
            </span>
            <span className="flex justify-end gap-1 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">
                {row.original.ctfPoints}
              </p>{' '}
              points
            </span>
          </div>
        </div>
      )
    },
  },
]
