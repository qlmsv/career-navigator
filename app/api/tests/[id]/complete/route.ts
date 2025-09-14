import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

// Функция для генерации интерпретации результатов
function generateInterpretation(factorScores: { [key: string]: number }) {
  const interpretations: { [key: string]: any } = {}

  for (const [factor, score] of Object.entries(factorScores)) {
    let level = 'medium'
    let description = ''

    if (score <= 40) {
      level = 'low'
    } else if (score >= 60) {
      level = 'high'
    }

    let descriptions: { [key: string]: string }
    switch (factor) {
      case 'honesty_humility':
        descriptions = {
          low: 'Склонны к манипуляциям и преследованию личных интересов',
          medium: 'Умеренно честны и скромны',
          high: 'Высоко честны, скромны и альтруистичны'
        }
        break
      case 'emotionality':
        descriptions = {
          low: 'Эмоционально стабильны и независимы',
          medium: 'Умеренно эмоциональны',
          high: 'Высоко эмоциональны и нуждаетесь в поддержке'
        }
        break
      case 'extraversion':
        descriptions = {
          low: 'Предпочитаете спокойную обстановку',
          medium: 'Балансируете между общением и уединением',
          high: 'Энергичны в общении и социально активны'
        }
        break
      case 'agreeableness':
        descriptions = {
          low: 'Прямолинейны и критичны',
          medium: 'Умеренно терпимы и прощающи',
          high: 'Высоко терпимы и склонны к прощению'
        }
        break
      case 'conscientiousness':
        descriptions = {
          low: 'Гибко подходите к планированию',
          medium: 'Умеренно организованы',
          high: 'Высоко организованы и дисциплинированы'
        }
        break
      case 'openness':
        descriptions = {
          low: 'Предпочитаете традиционные подходы',
          medium: 'Балансируете между традиционным и новым',
          high: 'Открыты к новому опыту и идеям'
        }
        break
      default:
        descriptions = {
          low: 'Низкий уровень',
          medium: 'Средний уровень',
          high: 'Высокий уровень'
        }
    }

    interpretations[factor] = {
      score: score,
      level: level,
      description: descriptions[level]
    }
  }

  return interpretations
}

// POST - завершение теста и расчет результатов
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const testId = params.id
    const body = await request.json()
    const { answers, timeSpent } = body

    // Получаем тест
    const { data: test, error: testError } = await supabaseAdmin
      .from('tests')
      .select('*')
      .eq('id', testId)
      .single()

    if (testError || !test) {
      return NextResponse.json({ success: false, error: 'Test not found' }, { status: 404 })
    }

    // Получаем вопросы с правильными ответами и текстом для анализа факторов
    const { data: questions, error: questionsError } = await supabaseAdmin
      .from('questions')
      .select(`
        id,
        question_text_ru,
        question_type,
        points,
        answer_options(id, is_correct, points)
      `)
      .eq('test_id', testId)

    if (questionsError) {
      return NextResponse.json({ success: false, error: questionsError.message }, { status: 400 })
    }

    // Рассчитываем результаты
    let totalScore = 0
    let maxPossibleScore = 0
    const questionResults = []
    const factorScores: { [key: string]: { score: number, maxScore: number, count: number } } = {}

    for (const question of questions || []) {
      const userAnswer = answers[question.id]
      const correctOptions = question.answer_options?.filter(opt => opt.is_correct) || []
      const maxPoints = question.points
      maxPossibleScore += maxPoints

      let isCorrect = false
      let earnedPoints = 0

      if (userAnswer !== undefined && userAnswer !== null) {
        if (question.question_type === 'rating_scale') {
          // Для психологических тестов со шкалой оценок
          const ratingValue = parseFloat(userAnswer)
          if (!isNaN(ratingValue)) {
            earnedPoints = maxPoints // Даем полный балл за ответ
            totalScore += earnedPoints
            isCorrect = true

            // Определяем фактор по тексту вопроса
            const questionText = question.question_text_ru.toLowerCase()
            let factor = 'general'
            
            if (questionText.includes('порядок') || questionText.includes('планирую') || questionText.includes('цель') || 
                questionText.includes('перепроверяю') || questionText.includes('организовываю') || questionText.includes('тщательно') ||
                questionText.includes('масштабные') || questionText.includes('упорства') || questionText.includes('идеально')) {
              factor = 'conscientiousness'
            } else if (questionText.includes('зло') || questionText.includes('критичен') || questionText.includes('простить') || 
                       questionText.includes('терпим') || questionText.includes('снисходительным') || questionText.includes('прощать') ||
                       questionText.includes('упрям') || questionText.includes('компромисс') || questionText.includes('сочувствую')) {
              factor = 'agreeableness'
            } else if (questionText.includes('энерги') || questionText.includes('бодр') || questionText.includes('собрания') || 
                       questionText.includes('люди') || questionText.includes('коллектив') || questionText.includes('друзей') ||
                       questionText.includes('популярный') || questionText.includes('выступать') || questionText.includes('смущаюсь')) {
              factor = 'extraversion'
            } else if (questionText.includes('страшно') || questionText.includes('беспокоюсь') || questionText.includes('поддержк') || 
                       questionText.includes('нервничаю') || questionText.includes('волнения') || questionText.includes('паник') ||
                       questionText.includes('сон') || questionText.includes('стресс') || questionText.includes('плакать')) {
              factor = 'emotionality'
            } else if (questionText.includes('честн') || questionText.includes('деньги') || questionText.includes('льстить') || 
                       questionText.includes('обычный') || questionText.includes('скромн') || questionText.includes('взятк') ||
                       questionText.includes('украсть') || questionText.includes('краденое') || questionText.includes('фальшивые')) {
              factor = 'honesty_humility'
            } else if (questionText.includes('искусств') || questionText.includes('творческ') || questionText.includes('воображен') || 
                       questionText.includes('философ') || questionText.includes('идеи') || questionText.includes('эксцентр') ||
                       questionText.includes('галерея') || questionText.includes('стихи') || questionText.includes('концерт')) {
              factor = 'openness'
            }

            // Добавляем балл к фактору
            if (!factorScores[factor]) {
              factorScores[factor] = { score: 0, maxScore: 0, count: 0 }
            }
            const factorData = factorScores[factor]!
            factorData.score += ratingValue
            factorData.maxScore += 5 // максимальная оценка по шкале
            factorData.count += 1
          }
        } else {
          // Обычные тесты с вариантами ответов
          if (Array.isArray(userAnswer)) {
            // Множественный выбор
            const correctIds = correctOptions.map(opt => opt.id)
            const userIds = userAnswer
            isCorrect = correctIds.length === userIds.length && 
                       correctIds.every(id => userIds.includes(id))
          } else {
            // Одиночный выбор
            isCorrect = correctOptions.some(opt => opt.id === userAnswer)
          }

          earnedPoints = isCorrect ? maxPoints : 0
          totalScore += earnedPoints
        }
      }

      questionResults.push({
        question_id: question.id,
        answer_data: userAnswer,
        is_correct: isCorrect,
        points_earned: earnedPoints,
        max_points: maxPoints
      })
    }

    const percentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0
    const passed = percentage >= test.passing_score

    // Рассчитываем средние баллы по факторам
    const factorAverages: { [key: string]: number } = {}
    for (const [factor, data] of Object.entries(factorScores)) {
      if (data.count > 0) {
        factorAverages[factor] = Math.round((data.score / data.count) * 20) // Нормализуем к 0-100
      }
    }

    // Создаем попытку прохождения
    let attempt
    let attemptError
    
    // Пытаемся создать попытку с factor_scores
    const { data: attemptWithFactors, error: errorWithFactors } = await supabaseAdmin
      .from('test_attempts')
      .insert({
        test_id: testId,
        status: 'completed',
        score: totalScore,
        max_possible_score: maxPossibleScore,
        percentage: percentage,
        passed: passed,
        time_spent_seconds: timeSpent || 0,
        completed_at: new Date().toISOString(),
        factor_scores: factorAverages
      })
      .select()
      .single()
    
    if (errorWithFactors && errorWithFactors.message.includes('factor_scores')) {
      // Если колонка factor_scores не существует, создаем без неё
      const { data: attemptWithoutFactors, error: errorWithoutFactors } = await supabaseAdmin
        .from('test_attempts')
        .insert({
          test_id: testId,
          status: 'completed',
          score: totalScore,
          max_possible_score: maxPossibleScore,
          percentage: percentage,
          passed: passed,
          time_spent_seconds: timeSpent || 0,
          completed_at: new Date().toISOString()
        })
        .select()
        .single()
      
      attempt = attemptWithoutFactors
      attemptError = errorWithoutFactors
    } else {
      attempt = attemptWithFactors
      attemptError = errorWithFactors
    }

    if (attemptError) {
      return NextResponse.json({ success: false, error: attemptError.message }, { status: 400 })
    }

    // Сохраняем ответы пользователя
    for (const result of questionResults) {
      const { error: answerError } = await supabaseAdmin
        .from('user_answers')
        .insert({
          attempt_id: attempt.id,
          question_id: result.question_id,
          answer_data: result.answer_data,
          is_correct: result.is_correct,
          points_earned: result.points_earned,
          max_points: result.max_points
        })

      if (answerError) {
        console.error('Error saving answer:', answerError)
      }
    }

    // Обновляем статистику теста
    const { error: statsError } = await supabaseAdmin
      .from('tests')
      .update({
        total_attempts: test.total_attempts + 1,
        average_score: test.average_score 
          ? (test.average_score * test.total_attempts + percentage) / (test.total_attempts + 1)
          : percentage
      })
      .eq('id', testId)

    if (statsError) {
      console.error('Error updating test stats:', statsError)
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        attempt_id: attempt.id,
        score: totalScore,
        max_possible_score: maxPossibleScore,
        percentage: percentage,
        passed: passed,
        factor_scores: factorAverages,
        interpretation: generateInterpretation(factorAverages)
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
