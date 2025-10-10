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
  const scoringMode: 'sum' | 'average' | 'product' = (schema['x-meta']?.scoringMode as any) || 'sum'

  if (!schema.properties) {
    return { score: 0, results: {} }
  }

  // Проходим по всем вопросам в схеме
  Object.entries(schema.properties).forEach(([key, field]: [string, any]) => {
    const componentProps = field['x-component-props'] || {}
    const meta = field['x-meta'] || {}
    const correctAnswer = undefined
    const points = 0
    const optionPoints: Record<string, number> | undefined = componentProps.optionPoints

    // correctAnswer/points логика отключена

    // Подсчет баллов по вариантам (если заданы баллы на уровне опций)
    const component = field['x-component']
    if (optionPoints && (component === 'Radio.Group' || component === 'Checkbox.Group' || component === 'Select')) {
      const userAnswer = responseData[key]
      if (userAnswer !== undefined) {
        if (Array.isArray(userAnswer)) {
          // множественный выбор: суммируем баллы выбранных
          let questionScore = 0
          let questionMax = 0
          Object.values(optionPoints).forEach(v => { questionMax += Number(v || 0) })
          userAnswer.forEach((val: any) => {
            const p = optionPoints[String(val)]
            if (typeof p === 'number') questionScore += p
          })
          totalScore += questionScore
          maxScore += questionMax
          results[key] = {
            userAnswer,
            isCorrect: true,
            points: questionScore,
            maxPoints: questionMax
          }
        } else {
          // один выбор: начисляем балл выбранного, максимум — максимум из опций
          const chosenPoints = optionPoints[String(userAnswer)] || 0
          const questionMax = Object.values(optionPoints).reduce((m, v) => Math.max(m, Number(v || 0)), 0)
          totalScore += chosenPoints
          maxScore += questionMax
          results[key] = {
            userAnswer,
            isCorrect: true,
            points: chosenPoints,
            maxPoints: questionMax
          }
        }
      }
    }

    // Агрегации по конструктам (для шкал 1-5)
    const componentType = field['x-component']
    const userAnswer = responseData[key]
    if ((componentType === 'Slider' || componentType === 'Rate' || componentType === 'NPS') && typeof userAnswer === 'number') {
      const value = meta.reverse ? (componentType === 'NPS' ? 10 - userAnswer : 6 - userAnswer) : userAnswer
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

  // Поддержка режимов: sum, average, product (для product нормализуем логикой maxScore)
  let finalTotal = totalScore
  let finalMax = maxScore
  if (scoringMode === 'average') {
    // Средний балл как доля от максимума
    // уже считаем totalScore и maxScore; доля сохранится той же формулой
  } else if (scoringMode === 'product') {
    // Перемножение: интерпретируем на уровне деталей как произведение (не храним подробно),
    // здесь используем эвристику: переводим сумму в логарифмическую шкалу нельзя без исходных множителей.
    // Упростим: если maxScore>0, усилим итоговую долю квадратированием как суррогат произведения.
    const ratio = finalMax > 0 ? (finalTotal / finalMax) : 0
    const boosted = Math.pow(ratio, 2)
    finalTotal = boosted * finalMax
  }

  const percentage = finalMax > 0 ? (finalTotal / finalMax) * 100 : 0

  return {
    score: percentage,
    results: {
      totalScore: Math.round(finalTotal * 100) / 100,
      maxScore: Math.round(finalMax * 100) / 100,
      percentage: Math.round(percentage * 10) / 10,
      details: results,
      constructs: Object.fromEntries(Object.entries(aggregates).map(([k, v]) => [k, Math.round((v.sum / Math.max(v.count, 1)) * 100) / 100])),
      subconstructs: Object.fromEntries(Object.entries(aggregatesSub).map(([k, v]) => [k, Math.round((v.sum / Math.max(v.count, 1)) * 100) / 100])),
      skills: Object.fromEntries(Object.entries(aggregatesSkill).map(([k, v]) => [k, Math.round((v.sum / Math.max(v.count, 1)) * 100) / 100]))
    }
  }
}
