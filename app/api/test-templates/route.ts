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

    // Создаем тип теста
    const { data: testType, error: testTypeError } = await supabaseAdmin
      .from('test_types')
      .upsert({
        name: templateData.testType.name,
        display_name: templateData.testType.displayName,
        description: templateData.testType.description,
        version: templateData.testType.version
      }, { onConflict: 'name' })
      .select()
      .single()

    if (testTypeError) {
      return NextResponse.json({ 
        success: false, 
        error: testTypeError.message 
      }, { status: 400 })
    }

    // Создаем факторы личности
    const factors = []
    for (const factorData of templateData.factors) {
      const { data: factor, error: factorError } = await supabaseAdmin
        .from('personality_factors')
        .upsert({
          test_type_id: testType.id,
          name: factorData.name,
          display_name: factorData.displayName,
          description: factorData.description,
          order_index: factorData.orderIndex
        }, { onConflict: 'test_type_id,name' })
        .select()
        .single()

      if (factorError) {
        return NextResponse.json({ 
          success: false, 
          error: factorError.message 
        }, { status: 400 })
      }

      factors.push(factor)
    }

    // Создаем шкалу оценок
    const { data: ratingScale, error: scaleError } = await supabaseAdmin
      .from('rating_scales')
      .upsert({
        name: templateData.ratingScale.name,
        display_name: templateData.ratingScale.displayName,
        min_value: templateData.ratingScale.minValue,
        max_value: templateData.ratingScale.maxValue,
        labels: templateData.ratingScale.labels
      }, { onConflict: 'name' })
      .select()
      .single()

    if (scaleError) {
      return NextResponse.json({ 
        success: false, 
        error: scaleError.message 
      }, { status: 400 })
    }

    // Создаем тест
    const { data: test, error: testError } = await supabaseAdmin
      .from('tests')
      .insert({
        title: testTitle,
        title_ru: testTitle,
        description: testDescription || templateData.testType.description,
        description_ru: testDescription || templateData.testType.description,
        test_type_id: testType.id,
        author_id: authorId,
        status: 'draft',
        is_public: true,
        scoring_config: templateData.scoringConfig,
        interpretation_config: templateData.interpretationConfig,
        total_questions: templateData.questions.length
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
      const factor = factors.find(f => f.name === questionData.factor)

      const { data: question, error: questionError } = await supabaseAdmin
        .from('questions')
        .insert({
          test_id: test.id,
          question_text: questionData.text,
          question_text_ru: questionData.text,
          question_type: 'rating_scale',
          factor_id: factor?.id,
          rating_scale_id: ratingScale.id,
          scale_min: templateData.ratingScale.minValue,
          scale_max: templateData.ratingScale.maxValue,
          scale_labels: templateData.ratingScale.labels,
          weight: questionData.weight,
          is_reverse: questionData.isReverse,
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
        testType,
        factors,
        ratingScale,
        questions
      }
    })

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
