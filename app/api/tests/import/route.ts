'use server'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

type CsvRow = Record<string, string>

interface ImportTestJson {
  test: {
    title: string
    title_ru?: string
    description?: string
    description_ru?: string
    category_id?: string
    time_limit_minutes?: number | null
    passing_score?: number | null
    max_attempts?: number | null
    shuffle_questions?: boolean
    shuffle_answers?: boolean
    is_public?: boolean
    requires_auth?: boolean
    tags?: string[]
    instructions?: string
    instructions_ru?: string
  }
  questions: Array<{
    question_text: string
    question_text_ru?: string
    question_type: 'multiple_choice' | 'multiple_select' | 'true_false' | 'rating_scale' | 'text_input' | 'number_input' | 'file_upload'
    points?: number
    required?: boolean
    order_index?: number
    difficulty_level?: 'easy' | 'medium' | 'hard'
    tags?: string[]
    options?: Array<{
      option_text: string
      option_text_ru?: string
      is_correct?: boolean
      points?: number
      order_index?: number
      explanation?: string
      explanation_ru?: string
    }>
  }>
}

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Admin client is not configured. Set SUPABASE_SERVICE_ROLE_KEY on the server.' }, { status: 500 })
    }

    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      const payload = (await request.json()) as ImportTestJson
      const result = await importFromJson(payload)
      return NextResponse.json(result)
    }

    if (contentType.includes('multipart/form-data')) {
      const formData = await (request as any).formData()
      const file = formData.get('file') as File | null
      const meta = formData.get('meta') ? JSON.parse(String(formData.get('meta'))) as Partial<ImportTestJson['test']> : {}

      if (!file) {
        return NextResponse.json({ error: 'No file uploaded. Use form field "file".' }, { status: 400 })
      }

      const text = await file.text()

      if (file.type === 'application/json' || file.name?.endsWith('.json')) {
        const json = JSON.parse(text) as ImportTestJson
        if (meta && Object.keys(meta).length) {
          json.test = { ...json.test, ...meta }
        }
        const result = await importFromJson(json)
        return NextResponse.json(result)
      }

      // Fallback: CSV
      const rows = parseCsv(text)
      const result = await importFromCsv(rows, meta)
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: 'Unsupported content type. Use application/json or multipart/form-data.' }, { status: 415 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function importFromJson(payload: ImportTestJson) {
  const { test, questions } = payload

  // Insert test
  const { data: testRow, error: testError } = await supabaseAdmin!
    .from('tests')
    .insert({
      title: test.title,
      title_ru: test.title_ru || test.title,
      description: test.description || null,
      description_ru: test.description_ru || null,
      category_id: test.category_id || null,
      author_id: (await getCurrentUserId()) || null,
      time_limit_minutes: test.time_limit_minutes ?? null,
      passing_score: test.passing_score ?? 70,
      max_attempts: test.max_attempts ?? 3,
      shuffle_questions: !!test.shuffle_questions,
      shuffle_answers: !!test.shuffle_answers,
      status: 'published',
      is_public: test.is_public ?? true,
      requires_auth: test.requires_auth ?? true,
      tags: test.tags ? JSON.stringify(test.tags) : '[]',
      instructions: test.instructions || null,
      instructions_ru: test.instructions_ru || null,
    })
    .select('id')
    .single()

  if (testError) throw new Error(`Failed to create test: ${testError.message}`)
  const testId = testRow!.id as string

  // Insert questions sequentially to preserve order
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]
    const { data: qRow, error: qErr } = await supabaseAdmin!
      .from('questions')
      .insert({
        test_id: testId,
        question_text: q.question_text,
        question_text_ru: q.question_text_ru || q.question_text,
        question_type: q.question_type,
        points: q.points ?? 1,
        required: q.required ?? true,
        order_index: q.order_index ?? i,
        difficulty_level: q.difficulty_level || 'medium',
        tags: q.tags ? JSON.stringify(q.tags) : '[]',
      })
      .select('id')
      .single()

    if (qErr) throw new Error(`Failed to create question ${i + 1}: ${qErr.message}`)
    const questionId = qRow!.id as string

    if (Array.isArray(q.options) && q.options.length) {
      const options = q.options.map((opt, idx) => ({
        question_id: questionId,
        option_text: opt.option_text,
        option_text_ru: opt.option_text_ru || opt.option_text,
        is_correct: !!opt.is_correct,
        points: typeof opt.points === 'number' ? opt.points : 0,
        order_index: opt.order_index ?? idx,
        explanation: opt.explanation || null,
        explanation_ru: opt.explanation_ru || null,
      }))

      const { error: optErr } = await supabaseAdmin!
        .from('answer_options')
        .insert(options)

      if (optErr) throw new Error(`Failed to create options for question ${i + 1}: ${optErr.message}`)
    }
  }

  return { success: true, test_id: testId }
}

async function importFromCsv(rows: CsvRow[], meta: Partial<ImportTestJson['test']>) {
  if (!rows.length) throw new Error('CSV file is empty')

  // Expect columns: test_title,test_description,question_text,question_type,points,required,option_1_text,option_1_correct,... up to 6
  const first = rows[0]
  const testTitle = (meta.title as string) || first['test_title']
  if (!testTitle) throw new Error('CSV must include test_title (or provide in meta.title)')

  const testJson: ImportTestJson = {
    test: {
      title: testTitle,
      title_ru: (meta.title_ru as string) || first['test_title_ru'] || testTitle,
      description: (meta.description as string) || first['test_description'] || undefined,
      description_ru: (meta.description_ru as string) || first['test_description_ru'] || undefined,
      category_id: (meta.category_id as string) || first['category_id'] || undefined,
      time_limit_minutes: numberOrNull(meta.time_limit_minutes ?? first['time_limit_minutes']),
      passing_score: numberOrNull(meta.passing_score ?? first['passing_score']) ?? 70,
      max_attempts: numberOrNull(meta.max_attempts ?? first['max_attempts']) ?? 3,
      shuffle_questions: booleanOr(meta.shuffle_questions ?? first['shuffle_questions'], false),
      shuffle_answers: booleanOr(meta.shuffle_answers ?? first['shuffle_answers'], false),
      is_public: booleanOr(meta.is_public ?? first['is_public'], true),
      requires_auth: booleanOr(meta.requires_auth ?? first['requires_auth'], true),
      tags: parseJsonArray(meta.tags ?? first['tags']),
      instructions: String(meta.instructions || first['instructions'] || '' ) || undefined,
      instructions_ru: String(meta.instructions_ru || first['instructions_ru'] || '' ) || undefined,
    },
    questions: [],
  }

  rows.forEach((r, idx) => {
    const qText = r['question_text']
    if (!qText) return
    const qType = (r['question_type'] as any) || 'multiple_choice'
    const q: ImportTestJson['questions'][number] = {
      question_text: qText,
      question_text_ru: r['question_text_ru'] || qText,
      question_type: qType,
      points: numberOrNull(r['points']) ?? 1,
      required: booleanOr(r['required'], true),
      order_index: numberOrNull(r['order_index']) ?? idx,
      difficulty_level: (r['difficulty_level'] as any) || 'medium',
      tags: parseJsonArray(r['tags']),
      options: [],
    }

    for (let i = 1; i <= 6; i++) {
      const text = r[`option_${i}_text`]
      if (!text) continue
      q.options!.push({
        option_text: text,
        option_text_ru: r[`option_${i}_text_ru`] || text,
        is_correct: booleanOr(r[`option_${i}_correct`], false),
        points: numberOrNull(r[`option_${i}_points`]) ?? 0,
        order_index: i - 1,
        explanation: r[`option_${i}_explanation`] || undefined,
        explanation_ru: r[`option_${i}_explanation_ru`] || undefined,
      })
    }

    testJson.questions.push(q)
  })

  return importFromJson(testJson)
}

function parseCsv(text: string): CsvRow[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0)
  if (!lines.length) return []
  const headers = splitCsvRow(lines[0]).map(h => h.trim())
  const rows: CsvRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvRow(lines[i])
    const row: CsvRow = {}
    headers.forEach((h, idx) => {
      row[h] = cells[idx] ?? ''
    })
    rows.push(row)
  }
  return rows
}

function splitCsvRow(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result.map(c => c.trim())
}

function numberOrNull(value: any): number | null {
  if (value === undefined || value === null || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function booleanOr(value: any, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const v = value.toLowerCase().trim()
    if (['true', '1', 'yes', 'y'].includes(v)) return true
    if (['false', '0', 'no', 'n'].includes(v)) return false
  }
  if (typeof value === 'number') return value !== 0
  return fallback
}

function parseJsonArray(value: any): string[] | undefined {
  if (!value) return undefined
  if (Array.isArray(value)) return value.map(String)
  try {
    const arr = JSON.parse(String(value))
    return Array.isArray(arr) ? arr.map(String) : undefined
  } catch {
    return undefined
  }
}

async function getCurrentUserId(): Promise<string | null> {
  // In server routes we don't have session by default; store null author_id and let admins edit later
  return null
}


