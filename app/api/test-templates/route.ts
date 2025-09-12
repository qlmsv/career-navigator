import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import fs from 'fs'
import path from 'path'

// GET - получение списка доступных шаблонов тестов
export async function GET() {
  try {
    const templatesDir = path.join(process.cwd(), 'test-templates')
    const templateFiles = fs.readdirSync(templatesDir).filter(file => file.endsWith('.json'))
    
    const templates = templateFiles.map(file => {
      const templatePath = path.join(templatesDir, file)
      const templateData = JSON.parse(fs.readFileSync(templatePath, 'utf8'))
      
      return {
        id: templateData.testType.name,
        name: templateData.testType.displayName,
        description: templateData.testType.description,
        version: templateData.testType.version,
        factors: templateData.factors.length,
        questions: templateData.questions.length,
        file: file
      }
    })

    return NextResponse.json({ success: true, data: templates })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

// POST - создание теста из шаблона
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { templateId, testTitle, testDescription, authorId } = body

    if (!templateId || !testTitle || !authorId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Template ID, test title and author ID are required' 
      }, { status: 400 })
    }

    // Загружаем шаблон
    const templatePath = path.join(process.cwd(), 'test-templates', `${templateId}-template.json`)
    
    if (!fs.existsSync(templatePath)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Template not found' 
      }, { status: 404 })
    }

    const templateData = JSON.parse(fs.readFileSync(templatePath, 'utf8'))

    // Пока используем существующую структуру без новых таблиц
    // TODO: Добавить поддержку test_types, personality_factors, rating_scales

    // Создаем тест
    const { data: test, error: testError } = await supabaseAdmin
      .from('tests')
      .insert({
        title: testTitle,
        title_ru: testTitle,
        description: testDescription || templateData.testType.description,
        description_ru: testDescription || templateData.testType.description,
        author_id: authorId,
        status: 'published',
        is_public: true,
        total_questions: templateData.questions.length,
        instructions_ru: `Это тест ${templateData.testType.displayName}. Отвечайте честно на каждый вопрос, выбирая наиболее подходящий вариант ответа.`
      })
      .select()
      .single()

    if (testError) {
      return NextResponse.json({ 
        success: false, 
        error: testError.message 
      }, { status: 400 })
    }

    // Создаем вопросы
    const questions = []
    for (let i = 0; i < templateData.questions.length; i++) {
      const questionData = templateData.questions[i]

      const { data: question, error: questionError } = await supabaseAdmin
        .from('questions')
        .insert({
          test_id: test.id,
          question_text: questionData.text,
          question_text_ru: questionData.text,
          question_type: 'rating_scale',
          points: 1,
          order_index: i
        })
        .select()
        .single()

      if (questionError) {
        return NextResponse.json({ 
          success: false, 
          error: questionError.message 
        }, { status: 400 })
      }

      questions.push(question)
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        test,
        questions,
        template: templateData
      }
    })

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
