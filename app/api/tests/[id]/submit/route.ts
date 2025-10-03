import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import type { SubmitResponseInput } from '@/lib/types'

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()
  console.log('[TEST-SUBMIT] Starting submission process')

  try {
    const { id } = await context.params
    console.log('[TEST-SUBMIT] Processing test ID:', id)

    const input: Omit<SubmitResponseInput, 'test_id'> = await request.json()
    console.log('[TEST-SUBMIT] Input data size:', JSON.stringify(input).length, 'characters')

    if (!input.response_data) {
      console.log('[TEST-SUBMIT] Missing response data')
      return NextResponse.json(
        { success: false, error: 'Response data required' },
        { status: 400 }
      )
    }

    // Получаем тест для подсчета баллов
    const { data: test, error: testError } = await supabaseAdmin
      .from('tests')
      .select('*')
      .eq('id', id)
      .single()

    if (testError || !test) {
      return NextResponse.json(
        { success: false, error: 'Test not found' },
        { status: 404 }
      )
    }

    // Подсчет баллов
    const { score, results } = calculateScore(
      test.formily_schema,
      input.response_data
    )

    // Сохраняем ответ
    const { data: response, error: responseError } = await supabaseAdmin
      .from('test_responses')
      .insert({
        test_id: id,
        response_data: input.response_data,
        user_identifier: input.user_identifier,
        time_spent_seconds: input.time_spent_seconds,
        score,
        results_data: results
      })
      .select()
      .single()

    if (responseError) {
      return NextResponse.json(
        { success: false, error: responseError.message },
        { status: 400 }
      )
    }

    const duration = Date.now() - startTime
    console.log(`[TEST-SUBMIT] Successfully processed test ${id} in ${duration}ms, score: ${score}`)

    return NextResponse.json({
      success: true,
      data: {
        response_id: response.id,
        score,
        results,
        show_results: test.show_results
      }
    })
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`[TEST-SUBMIT] Error after ${duration}ms:`, error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Функция подсчета баллов
function calculateScore(schema: any, responseData: Record<string, any>) {
  let totalScore = 0
  let maxScore = 0
  const results: Record<string, any> = {}
  const aggregates: Record<string, { sum: number; count: number }> = {}
  const aggregatesSub: Record<string, { sum: number; count: number }> = {}
  const aggregatesSkill: Record<string, { sum: number; count: number }> = {}

  if (!schema.properties) {
    return { score: 0, results: {} }
  }

  // Проходим по всем вопросам в схеме
  Object.entries(schema.properties).forEach(([key, field]: [string, any]) => {
    const componentProps = field['x-component-props'] || {}
    const meta = field['x-meta'] || {}
    const correctAnswer = componentProps.correctAnswer
    const points = componentProps.points || 0

    if (correctAnswer !== undefined && points > 0) {
      maxScore += points
      const userAnswer = responseData[key]

      // Проверка правильности ответа
      let isCorrect = false
      if (Array.isArray(correctAnswer)) {
        // Для множественного выбора
        isCorrect = JSON.stringify(userAnswer?.sort()) === JSON.stringify(correctAnswer.sort())
      } else {
        isCorrect = userAnswer === correctAnswer
      }

      if (isCorrect) {
        totalScore += points
      }

      results[key] = {
        userAnswer,
        correctAnswer,
        isCorrect,
        points: isCorrect ? points : 0,
        maxPoints: points
      }
    }

    // Агрегации по конструктам (для шкал 1-5)
    const component = field['x-component']
    const userAnswer = responseData[key]
    if ((component === 'Slider' || component === 'Rate' || component === 'NPS') && typeof userAnswer === 'number') {
      const value = meta.reverse ? (component === 'NPS' ? 10 - userAnswer : 6 - userAnswer) : userAnswer
      if (meta.construct) {
        const k = String(meta.construct)
        aggregates[k] = aggregates[k] || { sum: 0, count: 0 }
        aggregates[k].sum += value
        aggregates[k].count += 1
      }
      if (meta.subconstruct) {
        const k = String(meta.subconstruct)
        aggregatesSub[k] = aggregatesSub[k] || { sum: 0, count: 0 }
        aggregatesSub[k].sum += value
        aggregatesSub[k].count += 1
      }
      if (meta.skill) {
        const k = String(meta.skill)
        aggregatesSkill[k] = aggregatesSkill[k] || { sum: 0, count: 0 }
        aggregatesSkill[k].sum += value
        aggregatesSkill[k].count += 1
      }
    }
  })

  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0

  return {
    score: percentage,
    results: {
      totalScore,
      maxScore,
      percentage: Math.round(percentage * 10) / 10,
      details: results,
      constructs: Object.fromEntries(Object.entries(aggregates).map(([k, v]) => [k, Math.round((v.sum / Math.max(v.count, 1)) * 100) / 100])),
      subconstructs: Object.fromEntries(Object.entries(aggregatesSub).map(([k, v]) => [k, Math.round((v.sum / Math.max(v.count, 1)) * 100) / 100])),
      skills: Object.fromEntries(Object.entries(aggregatesSkill).map(([k, v]) => [k, Math.round((v.sum / Math.max(v.count, 1)) * 100) / 100]))
    }
  }
}
