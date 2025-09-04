import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import * as z from 'zod'

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date to a readable string
 */
export function formatDate(date: Date | string | number) {
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Converts a string to title case
 */
export function toTitleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
  )
}

/**
 * Truncates a string to a specified length
 */
export function truncate(str: string, length: number) {
  return str.length > length ? `${str.substring(0, length)}...` : str
}

/**
 * Creates a debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

/**
 * Validates data against a Zod schema
 */
export async function validateFormData<T extends z.ZodTypeAny>(
  formData: FormData,
  schema: T
): Promise<{ data: z.infer<T>; errors: Record<string, string> }> {
  const data = Object.fromEntries(formData.entries())
  try {
    const validatedData = await schema.parseAsync(data)
    return { data: validatedData, errors: {} }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.reduce<Record<string, string>>((acc, curr) => {
        const key = curr.path[0] as string
        acc[key] = curr.message
        return acc
      }, {})
      return { data: {} as z.infer<T>, errors }
    }
    throw error
  }
}

/**
 * Creates a URL-friendly slug from a string
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Converts an object to URL query parameters
 */
export function objectToQueryParams(obj: Record<string, any>): string {
  const params = new URLSearchParams()
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value))
    }
  })
  return params.toString()
}
