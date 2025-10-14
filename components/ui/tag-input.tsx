'use client'

import { useState, KeyboardEvent } from 'react'
import { Input } from './input'
import { Button } from './button'
import { X } from 'lucide-react'

interface TagInputProps {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
}

export function TagInput({ value, onChange, placeholder }: TagInputProps) {
  const [inputValue, setInputValue] = useState('')

  const handleAddTag = () => {
    if (inputValue.trim() === '') return
    const newTags = inputValue.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    const uniqueNewTags = newTags.filter(tag => !value.includes(tag))
    if (uniqueNewTags.length > 0) {
      onChange([...value, ...uniqueNewTags])
    }
    setInputValue('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      handleAddTag()
    }
    if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove))
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px]">
        {value.map(tag => (
          <div key={tag} className="flex items-center gap-1 bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-sm">
            {tag}
            <button onClick={() => handleRemoveTag(tag)} className="focus:outline-none">
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleAddTag}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-none focus:ring-0 h-auto p-0 m-0"
        />
      </div>
    </div>
  )
}
