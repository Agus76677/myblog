import React, { useEffect, useMemo, useState } from 'react'

type RatingLevel = 0 | 1 | 2 | 3 | 4 | 5
type RatingMap = Record<string, RatingLevel>

const BOARD_BG = '#313c4a'
const BOARD_BORDER = '#425061'
const EMPTY_BG = '#465364'
const FUTURE_BG = '#5f5a5a'
const WEEKDAY_LABELS = ['', 'Tue', '', 'Thu', '', 'Sat', '']
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const LEVELS = [
  { level: 1 as const, emoji: '🙄', label: '状态很差', color: '#f4f8fb', border: '#d8e4ef', text: '#5c6c7b' },
  { level: 2 as const, emoji: '', label: '勉强推进', color: '#d5e6f3', border: '#c0d6e6', text: '#45627d' },
  { level: 3 as const, emoji: '', label: '正常工作', color: '#7ea1c7', border: '#7295bb', text: '#f8fbff' },
  { level: 4 as const, emoji: '', label: '进展不错', color: '#1f5f94', border: '#174e7b', text: '#f8fbff' },
  { level: 5 as const, emoji: '🥳', label: '大丰收', color: '#0a3156', border: '#092742', text: '#f8fbff' }
] as const

const pad = (value: number) => String(value).padStart(2, '0')
const toDateKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

const parseDateKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const getStorageKey = (year: number) => `research-status-${year}`

const getMonthColumns = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const start = new Date(firstDay)
  start.setDate(firstDay.getDate() - firstDay.getDay())
  const end = new Date(lastDay)
  end.setDate(lastDay.getDate() + (6 - lastDay.getDay()))

  const columns: Array<Array<Date | null>> = []
  const cursor = new Date(start)

  while (cursor <= end) {
    const column: Array<Date | null> = []
    for (let day = 0; day < 7; day += 1) {
      const cellDate = new Date(cursor)
      column.push(cellDate.getMonth() === month ? cellDate : null)
      cursor.setDate(cursor.getDate() + 1)
    }
    columns.push(column)
  }

  return columns
}

const ResearchStatusBoard = ({ year = new Date().getFullYear() }: { year?: number }) => {
  const [ratings, setRatings] = useState<RatingMap>({})
  const today = useMemo(() => new Date(), [])
  const todayKey = useMemo(() => toDateKey(today), [today])
  const [selectedDate, setSelectedDate] = useState(todayKey)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(getStorageKey(year))
      if (!raw) return
      setRatings(JSON.parse(raw) as RatingMap)
    } catch {
      setRatings({})
    }
  }, [year])

  useEffect(() => {
    window.localStorage.setItem(getStorageKey(year), JSON.stringify(ratings))
  }, [ratings, year])

  const selectedDateText = useMemo(() => {
    const date = parseDateKey(selectedDate)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      weekday: 'short'
    })
  }, [selectedDate])

  const months = useMemo(
    () =>
      MONTH_LABELS.map((label, month) => ({
        label,
        month,
        columns: getMonthColumns(year, month)
      })),
    [year]
  )

  const selectedRating = ratings[selectedDate] ?? 0

  const assignRating = (level: RatingLevel) => {
    setRatings((current) => ({ ...current, [selectedDate]: level }))
  }

  const clearSelected = () => {
    setRatings((current) => {
      const next = { ...current }
      delete next[selectedDate]
      return next
    })
  }

  return (
    <section
      className='mx-auto w-fit overflow-hidden rounded-[1.5rem] border px-3 py-3 shadow-sm sm:px-4 sm:py-4'
      style={{ backgroundColor: BOARD_BG, borderColor: BOARD_BORDER }}
    >
      <div className='mb-3 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between'>
        <div className='space-y-1'>
          <h2 className='text-lg font-semibold text-white sm:text-xl'>{year} 科研状态日历</h2>
          <p className='text-xs text-slate-300 sm:text-sm'>点击某一天，再选择 1 到 5 档状态。数据仅保存在当前浏览器。</p>
        </div>

        <div
          className='rounded-2xl border px-3 py-2 text-xs text-slate-100 shadow-inner xl:min-w-[320px]'
          style={{ borderColor: '#536274', backgroundColor: '#2a3441' }}
        >
          <div className='flex flex-wrap items-center gap-x-3 gap-y-2'>
            <div>
              <div className='uppercase tracking-[0.18em] text-[10px] text-slate-300'>Selected Day</div>
              <div className='mt-0.5 text-sm font-semibold sm:text-base'>{selectedDateText}</div>
            </div>
            <button
              type='button'
              onClick={clearSelected}
              className='rounded-full border px-2.5 py-1 text-[11px] font-medium text-slate-200 transition-colors hover:bg-slate-700/60'
              style={{ borderColor: '#59687a' }}
            >
              清空
            </button>
          </div>
          <div className='mt-3 flex flex-wrap gap-2'>
            {LEVELS.map((item) => {
              const active = selectedRating === item.level
              return (
                <button
                  key={item.level}
                  type='button'
                  onClick={() => assignRating(item.level)}
                  className='flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 transition-transform hover:-translate-y-0.5'
                  style={{
                    backgroundColor: item.color,
                    borderColor: active ? '#ffffff' : item.border,
                    color: item.text,
                    boxShadow: active ? '0 0 0 2px rgba(255,255,255,0.16)' : 'none'
                  }}
                >
                  {item.emoji ? <span className='text-sm'>{item.emoji}</span> : null}
                  <span className='text-[11px] font-semibold'>{item.level}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className='overflow-x-auto pb-1'>
        <div className='inline-flex gap-0'>
          <div className='grid grid-rows-7 gap-1 pr-1 pt-7 text-[10px] font-semibold text-slate-200 sm:text-[11px]'>
            {WEEKDAY_LABELS.map((label, index) => (
              <div key={`${label}-${index}`} className='flex h-5 items-center justify-end pr-1 sm:h-6'>
                {label}
              </div>
            ))}
          </div>

          {months.map(({ label, month, columns }) => (
            <div key={label} className='flex flex-col gap-1.5'>
              <div className='pl-1 text-center text-sm font-semibold tracking-wide text-slate-100 sm:text-base'>{label}</div>
              <div className='grid auto-cols-max grid-flow-col gap-1'>
                {columns.map((column, columnIndex) => (
                  <div key={`${month}-${columnIndex}`} className='grid grid-rows-7 gap-1'>
                    {column.map((cellDate, rowIndex) => {
                      if (!cellDate) {
                        return (
                          <div
                            key={`${month}-${columnIndex}-${rowIndex}`}
                            className='h-4 w-4 rounded-md opacity-0 sm:h-5 sm:w-5'
                          />
                        )
                      }

                      const dateKey = toDateKey(cellDate)
                      const rating = ratings[dateKey] ?? 0
                      const isFuture = cellDate > today
                      const level = LEVELS.find((item) => item.level === rating)
                      const isSelected = selectedDate === dateKey
                      const isToday = dateKey === todayKey

                      return (
                        <button
                          key={dateKey}
                          type='button'
                          onClick={() => setSelectedDate(dateKey)}
                          disabled={isFuture}
                          title={dateKey}
                          className='relative flex h-4 w-4 items-center justify-center rounded-md border text-[10px] transition hover:-translate-y-0.5 sm:h-5 sm:w-5 sm:text-[11px] disabled:cursor-not-allowed'
                          style={{
                            backgroundColor: isFuture ? FUTURE_BG : level?.color ?? EMPTY_BG,
                            borderColor: isSelected ? '#f8fbff' : level?.border ?? '#526172',
                            color: level?.text ?? '#dbe4ed',
                            boxShadow: isSelected
                              ? '0 0 0 2px rgba(255,255,255,0.18)'
                              : isToday
                                ? 'inset 0 0 0 1px rgba(255,255,255,0.35)'
                                : 'none',
                            opacity: isFuture ? 0.45 : 1
                          }}
                        >
                          {rating === 1 || rating === 5 ? level?.emoji ?? '' : ''}
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ResearchStatusBoard
