'use client'

import { useEffect, useMemo, useState } from 'react'
import api from '@/lib/api'
import type { Label } from '@/types'

type LabelInputProps = {
  value: Label[]
  onChange: (labels: Label[]) => void
  placeholder?: string
}

const getContrastColor = (hexColor: string) => {
  const hex = hexColor.replace('#', '')
  if (hex.length !== 6) return '#111827'
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? '#111827' : '#FFFFFF'
}

export default function LabelInput({ value, onChange, placeholder }: LabelInputProps) {
  const [query, setQuery] = useState('')
  const [options, setOptions] = useState<Label[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const selectedIds = useMemo(() => new Set(value.map((label) => label.id)), [value])
  const trimmedQuery = query.trim()
  const hasExactMatch = options.some(
    (label) => label.name.toLowerCase() === trimmedQuery.toLowerCase()
  )

  useEffect(() => {
    let isMounted = true
    if (!isOpen) return undefined
    const handle = setTimeout(async () => {
      setIsLoading(true)
      try {
        const response = await api.get('/labels', {
          params: { query: trimmedQuery },
        })
        if (!isMounted) return
        setOptions(response.data?.data || [])
      } catch (error) {
        if (!isMounted) return
        setOptions([])
      } finally {
        if (!isMounted) return
        setIsLoading(false)
      }
    }, 200)
    return () => {
      isMounted = false
      clearTimeout(handle)
    }
  }, [trimmedQuery, isOpen])

  const addLabel = (label: Label) => {
    if (selectedIds.has(label.id)) return
    onChange([...value, label])
    setQuery('')
    setIsOpen(false)
  }

  const removeLabel = (labelId: number) => {
    onChange(value.filter((label) => label.id !== labelId))
  }

  const createLabel = async () => {
    if (!trimmedQuery) return
    try {
      const response = await api.post('/labels', { name: trimmedQuery })
      const created = response.data as Label
      addLabel(created)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        className="input-field"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => {
          setTimeout(() => setIsOpen(false), 150)
        }}
      />
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {value.map((label) => (
            <button
              key={label.id}
              type="button"
              onClick={() => removeLabel(label.id)}
              className="badge text-xs"
              style={{ backgroundColor: label.color, color: getContrastColor(label.color) }}
              title="削除"
            >
              {label.name} <span className="ml-1">×</span>
            </button>
          ))}
        </div>
      )}
      {isOpen && (
        <div className="absolute z-20 mt-2 w-full rounded-2xl bg-surface border border-line shadow-lg max-h-40 overflow-auto custom-scrollbar">
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-ink-muted">読み込み中...</div>
          ) : (
            <>
              {options
                .filter((label) => !selectedIds.has(label.id))
                .map((label) => (
                  <button
                    key={label.id}
                    type="button"
                    onClick={() => addLabel(label)}
                    className="w-full flex items-center justify-between px-4 py-2 text-left hover:bg-subtle"
                  >
                    <span className="text-sm text-ink-sub">{label.name}</span>
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: label.color }}
                    />
                  </button>
                ))}
              {!hasExactMatch && trimmedQuery && (
                <button
                  type="button"
                  onClick={createLabel}
                  className="w-full px-4 py-2 text-left text-sm text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20"
                >
                  「{trimmedQuery}」を作成
                </button>
              )}
              {!trimmedQuery && options.length === 0 && (
                <div className="px-4 py-3 text-sm text-ink-muted">ラベルがありません</div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
