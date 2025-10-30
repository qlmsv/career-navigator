import { NextRequest, NextResponse } from 'next/server'
import { calculateFullResults } from '@/lib/digital-skills-calculator'
import { logger } from '@/lib/logger'

/**
 * POST /api/tests/calculate-skills
 * Рассчитывает индекс цифровых навыков и скоринг трудоустройства
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { answers } = body

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json(
        {
          success: false,
          error: 'Некорректный формат данных. Необходим объект answers.',
        },
        { status: 400 },
      )
    }

    // Проверяем обязательные поля
    const requiredFields = ['region', 'gender', 'settlement_type', 'age', 'education']
    const missingFields = requiredFields.filter((field) => !answers[field])

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Не заполнены обязательные поля: ${missingFields.join(', ')}`,
        },
        { status: 400 },
      )
    }

    // Рассчитываем результаты
    const results = calculateFullResults(answers)

    logger.info('Calculated digital skills and employment scoring', {
      region: results.region,
      skillIndex: results.digitalSkills.skillIndex,
      employmentProbability: results.employmentScoring.probabilityPercent,
    })

    return NextResponse.json({
      success: true,
      data: results,
      message: 'Результаты успешно рассчитаны',
    })
  } catch (error: any) {
    logger.error('Failed to calculate skills', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Ошибка при расчете результатов',
        message: error?.message || 'Неизвестная ошибка',
      },
      { status: 500 },
    )
  }
}
