import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

// Google Gemini configuration
const GEMINI_CONFIG = {
  apiKey: process.env['GOOGLE_API_KEY'] || '',
  model: 'gemini-2.5-flash-lite',
  temperature: 0.7,
  maxOutputTokens: 2000,
}

// API Key validation
function validateApiKey(): void {
  if (!GEMINI_CONFIG.apiKey || GEMINI_CONFIG.apiKey === '') {
    throw new Error('Google API key not found')
  }
}

// Direct API call to Google Gemini
async function callGeminiAPI(prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_CONFIG.model}:generateContent?key=${GEMINI_CONFIG.apiKey}`
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: GEMINI_CONFIG.temperature,
        maxOutputTokens: GEMINI_CONFIG.maxOutputTokens,
      }
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

// Analysis prompt template
const ANALYSIS_PROMPT = `
Создайте JSON анализ на основе психометрического теста.

ДАННЫЕ:
Big Five: {bigFiveResults}
Архетип: {dominantArchetype}

ВОЗВРАТИТЕ ТОЛЬКО JSON БЕЗ ДОПОЛНИТЕЛЬНОГО ТЕКСТА:

{{
  "archetype": {{
    "primary": "{dominantArchetype}",
    "description": "Краткое описание архетипа",
    "strengths": ["Сильная сторона 1", "Сильная сторона 2", "Сильная сторона 3"],
    "growth_areas": ["Область роста 1", "Область роста 2"]
  }},
  "personality_insights": {{
    "openness": "Описание открытости на основе {opennessScore}%",
    "conscientiousness": "Описание добросовестности на основе {conscientiousnessScore}%",
    "extraversion": "Описание экстраверсии на основе {extraversionScore}%",
    "agreeableness": "Описание доброжелательности на основе {agreeablenessScore}%",
    "neuroticism": "Описание нейротизма на основе {neuroticismScore}%"
  }},
  "career_paths": [
    {{
      "title": "Рекомендуемая роль 1",
      "description": "Описание роли",
      "companies": ["Компания 1", "Компания 2", "Компания 3"]
    }},
    {{
      "title": "Рекомендуемая роль 2", 
      "description": "Описание роли",
      "companies": ["Компания 1", "Компания 2", "Компания 3"]
    }}
  ],
  "educational_recommendations": [
    {{
      "area": "Область развития 1",
      "recommendation": "Рекомендация по развитию"
    }},
    {{
      "area": "Область развития 2",
      "recommendation": "Рекомендация по развитию"
    }}
  ],
  "action_plan": [
    {{
      "title": "Действие 1",
      "description": "Описание действия"
    }},
    {{
      "title": "Действие 2",
      "description": "Описание действия"
    }},
    {{
      "title": "Действие 3",
      "description": "Описание действия"
    }}
  ],
  "swot_analysis": {{
    "strengths": ["Сила 1", "Сила 2", "Сила 3"],
    "weaknesses": ["Слабость 1", "Слабость 2"],
    "opportunities": ["Возможность 1", "Возможность 2", "Возможность 3"],
    "threats": ["Угроза 1", "Угроза 2"]
  }},
  "big5_scores": {{
    "openness": {opennessScore},
    "conscientiousness": {conscientiousnessScore},
    "extraversion": {extraversionScore},
    "agreeableness": {agreeablenessScore},
    "neuroticism": {neuroticismScore}
  }},
  "summary": "Краткое резюме профиля личности"
}}
`

export async function POST(request: NextRequest) {
  try {
    const { bigFiveResults, dominantArchetype, allAnswers } = await request.json()

    // Validate input
    if (!bigFiveResults || !dominantArchetype) {
      return NextResponse.json(
        { success: false, error: 'Missing required data' },
        { status: 400 }
      )
    }

    // Log API Key status
    logger.info('Google API Key status:', {
      hasKey: !!process.env['GOOGLE_API_KEY'],
      keyLength: process.env['GOOGLE_API_KEY']?.length || 0,
      keyPreview: process.env['GOOGLE_API_KEY']?.substring(0, 10) + '...' || 'NOT_SET'
    })

    validateApiKey()

    const startTime = Date.now()

    // Format prompt data
    const promptData = {
      bigFiveResults: JSON.stringify(bigFiveResults),
      dominantArchetype,
      opennessScore: bigFiveResults.openness || 50,
      conscientiousnessScore: bigFiveResults.conscientiousness || 50,
      extraversionScore: bigFiveResults.extraversion || 50,
      agreeablenessScore: bigFiveResults.agreeableness || 50,
      neuroticismScore: bigFiveResults.neuroticism || 50,
      answersCount: Object.keys(allAnswers || {}).length
    }

    // Log the actual prompt being sent
    const actualPrompt = ANALYSIS_PROMPT
      .replace('{bigFiveResults}', promptData.bigFiveResults)
      .replace('{dominantArchetype}', promptData.dominantArchetype)
      .replace('{opennessScore}', promptData.opennessScore.toString())
      .replace('{conscientiousnessScore}', promptData.conscientiousnessScore.toString())
      .replace('{extraversionScore}', promptData.extraversionScore.toString())
      .replace('{agreeablenessScore}', promptData.agreeablenessScore.toString())
      .replace('{neuroticismScore}', promptData.neuroticismScore.toString())

    logger.info('ACTUAL PROMPT SENT TO AI:', actualPrompt)

    let response: string
    let duration: number

    try {
      response = await callGeminiAPI(actualPrompt)
      duration = Date.now() - startTime
      logger.info(`AI analysis completed in ${duration}ms`)
      logger.info('Raw AI response length:', response.length)
      logger.info('Raw AI response preview:', response.substring(0, 200))
      logger.info('Full AI response:', response)
    } catch (aiError) {
      logger.error('Error calling AI:', aiError)
      return NextResponse.json(
        { success: false, error: 'AI service unavailable' },
        { status: 500 }
      )
    }

    try {
      const results = JSON.parse(response.trim())
      logger.info('Successfully parsed AI response')
      
      return NextResponse.json({
        success: true,
        data: results,
        analysisTime: duration,
      })
    } catch (parseError) {
      logger.error('Failed to parse AI response:', parseError)
      logger.error('Raw AI response:', response)
      
      // Try to extract JSON from the response if it's wrapped in markdown or has extra text
      try {
        // Remove any markdown code blocks
        let cleanedResponse = response.replace(/```json\s*/g, '').replace(/```\s*/g, '')
        
        // Try to find JSON object
        const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const extractedJson = jsonMatch[0]
          logger.info('Attempting to parse extracted JSON:', extractedJson.substring(0, 200))
          const results = JSON.parse(extractedJson)
          logger.info('Successfully parsed extracted JSON')
          
          return NextResponse.json({
            success: true,
            data: results,
            analysisTime: duration,
            extracted: true
          })
        }
      } catch (extractError) {
        logger.error('Failed to extract and parse JSON:', extractError)
      }
      
      // Try to fix common JSON issues
      try {
        let fixedResponse = response.trim()
        
        // Remove any text before the first {
        const firstBrace = fixedResponse.indexOf('{')
        if (firstBrace > 0) {
          fixedResponse = fixedResponse.substring(firstBrace)
        }
        
        // Remove any text after the last }
        const lastBrace = fixedResponse.lastIndexOf('}')
        if (lastBrace > 0 && lastBrace < fixedResponse.length - 1) {
          fixedResponse = fixedResponse.substring(0, lastBrace + 1)
        }
        
        // Fix common issues
        fixedResponse = fixedResponse
          .replace(/,\s*}/g, '}') // Remove trailing commas
          .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
          .replace(/\\"/g, '"')   // Fix escaped quotes
        
        logger.info('Attempting to parse fixed JSON:', fixedResponse.substring(0, 200))
        const results = JSON.parse(fixedResponse)
        logger.info('Successfully parsed fixed JSON')
        
        return NextResponse.json({
          success: true,
          data: results,
          analysisTime: duration,
          fixed: true
        })
      } catch (fixError) {
        logger.error('Failed to fix and parse JSON:', fixError)
      }
      
      // Return fallback result
      logger.warn('Using fallback data due to parsing failure')
      return NextResponse.json({
        success: true,
        data: {
          archetype: {
            primary: dominantArchetype,
            description: 'Анализ завершен с базовой оценкой архетипа',
            strengths: ['Адаптивность', 'Потенциал роста', 'Готовность к развитию'],
            growth_areas: ['Развитие навыков', 'Самопознание', 'Профессиональное развитие']
          },
          personality_insights: {
            openness: 'Базовый анализ открытости к опыту и готовности к новому',
            conscientiousness: 'Базовый анализ организованности и ответственности',
            extraversion: 'Базовый анализ общительности и социальной активности',
            agreeableness: 'Базовый анализ сотрудничества и эмпатии',
            neuroticism: 'Базовый анализ эмоциональной стабильности'
          },
          career_paths: [
            {
              title: 'Универсальная позиция',
              description: 'Адаптивная роль с возможностями роста',
              companies: ['Крупные корпорации', 'Стартапы', 'Консалтинговые компании']
            },
            {
              title: 'Junior специалист',
              description: 'Начальная позиция для развития навыков',
              companies: ['Технологические компании', 'Финансовые организации', 'Консалтинг']
            }
          ],
          educational_recommendations: [
            {
              area: 'Коммуникация',
              recommendation: 'Развитие навыков презентации и переговоров'
            },
            {
              area: 'Лидерство',
              recommendation: 'Изучение основ управления командой'
            }
          ],
          action_plan: [
            {
              title: 'Самооценка навыков',
              description: 'Провести детальную оценку текущих компетенций'
            },
            {
              title: 'Изучение рынка',
              description: 'Исследовать возможности в целевых отраслях'
            },
            {
              title: 'Обновление резюме',
              description: 'Адаптировать резюме под новые цели'
            }
          ],
          swot_analysis: {
            strengths: ['Адаптивность', 'Готовность к обучению', 'Потенциал роста'],
            weaknesses: ['Недостаток опыта', 'Нужно развитие навыков'],
            opportunities: ['Растущий рынок', 'Удаленная работа', 'Новые технологии'],
            threats: ['Конкуренция', 'Быстрые изменения', 'Экономические риски']
          },
          summary: 'Анализ личности завершен с базовыми рекомендациями для карьерного развития'
        },
        analysisTime: duration,
        fallback: true
      })
    }

  } catch (error) {
    logger.error('Error in analyze-results API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
