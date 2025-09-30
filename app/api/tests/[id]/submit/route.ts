import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import type { SubmitResponseInput } from '@/lib/types'

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const input: Omit<SubmitResponseInput, 'test_id'> = await request.json()

    if (!input.response_data) {
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
    console.error('Submit response error:', error)
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

  if (!schema.properties) {
    return { score: 0, results: {} }
  }

  // Проходим по всем вопросам в схеме
  Object.entries(schema.properties).forEach(([key, field]: [string, any]) => {
    const componentProps = field['x-component-props'] || {}
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
  })

  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0

  return {
    score: percentage,
    results: {
      totalScore,
      maxScore,
      percentage: Math.round(percentage * 10) / 10,
      details: results
    }
  }
}
