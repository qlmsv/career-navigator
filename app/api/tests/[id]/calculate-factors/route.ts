import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

// POST - подсчет баллов по факторам личности
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const testId = params.id
    const { attemptId, answers } = await request.json()

    if (!attemptId || !answers) {
      return NextResponse.json({ 
        success: false, 
        error: 'Attempt ID and answers are required' 
      }, { status: 400 })
    }

    // Получаем тест с факторами
    const { data: test, error: testError } = await supabaseAdmin
      .from('tests')
      .select(`
        *,
        test_type:test_types(*),
        questions(
          id,
          factor_id,
          weight,
          is_reverse,
          scale_min,
          scale_max,
          personality_factors(name, display_name)
        )
      `)
      .eq('id', testId)
      .single()

    if (testError) {
      return NextResponse.json({ 
        success: false, 
        error: testError.message 
      }, { status: 400 })
    }

    // Группируем вопросы по факторам
    const factorGroups: { [key: string]: any[] } = {}
    const factorNames: { [key: string]: string } = {}

    test.questions.forEach((question: any) => {
      if (question.factor_id && question.personality_factors) {
        const factorName = question.personality_factors.name
        if (!factorGroups[factorName]) {
          factorGroups[factorName] = []
          factorNames[factorName] = question.personality_factors.display_name
        }
        factorGroups[factorName].push(question)
      }
    })

    // Подсчитываем баллы по факторам
    const factorScores: { [key: string]: number } = {}
    const factorDetails: { [key: string]: any } = {}

    for (const [factorName, questions] of Object.entries(factorGroups)) {
      let totalScore = 0
      let maxScore = 0
      let questionCount = 0

      questions.forEach((question: any) => {
        const answer = answers[question.id]
        if (answer !== undefined && answer !== null && answer !== '') {
          let score = parseFloat(answer)
          
          // Обрабатываем обратные вопросы
          if (question.is_reverse) {
            const scaleRange = question.scale_max - question.scale_min + 1
            score = question.scale_max - score + question.scale_min
          }

          // Применяем вес вопроса
          const weightedScore = score * question.weight
          totalScore += weightedScore
          maxScore += question.scale_max * question.weight
          questionCount++
        }
      })

      // Нормализуем балл (0-100)
      const normalizedScore = questionCount > 0 ? (totalScore / maxScore) * 100 : 0

      factorScores[factorName] = Math.round(normalizedScore * 100) / 100
      factorDetails[factorName] = {
        displayName: factorNames[factorName],
        rawScore: totalScore,
        maxScore: maxScore,
        questionCount: questionCount,
        normalizedScore: normalizedScore
      }
    }

    // Определяем интерпретацию результатов
    const interpretation = generateInterpretation(factorScores, test.interpretation_config)

    // Обновляем попытку с результатами по факторам
    const { error: updateError } = await supabaseAdmin
      .from('test_attempts')
      .update({
        factor_scores: factorScores,
        personality_profile: interpretation,
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', attemptId)

    if (updateError) {
      return NextResponse.json({ 
        success: false, 
        error: updateError.message 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        factorScores,
        factorDetails,
        interpretation,
        testType: test.test_type
      }
    })

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

// Функция для генерации интерпретации результатов
function generateInterpretation(factorScores: { [key: string]: number }, config: any) {
  if (!config || !config.ranges || !config.descriptions) {
    return {}
  }

  const interpretation: { [key: string]: any } = {}

  for (const [factorName, score] of Object.entries(factorScores)) {
    let level = 'medium'
    
    if (score <= config.ranges.low.max) {
      level = 'low'
    } else if (score >= config.ranges.high.min) {
      level = 'high'
    }

    interpretation[factorName] = {
      score: score,
      level: level,
      description: config.descriptions[factorName]?.[level] || 'Описание недоступно'
    }
  }

  return interpretation
}
