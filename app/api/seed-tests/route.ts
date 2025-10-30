import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST() {
  try {
    // Генераторы полноценных схем
    const makeMarks = { 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' } as const
    const buildBig5Schema = () => {
      const properties: Record<string, any> = {
        intro: {
          type: 'void',
          'x-component': 'FormItem',
          'x-content':
            '📊 Оцените каждое утверждение по шкале от 1 до 5\n\n1 = Абсолютно не согласен | 5 = Полностью согласен',
        },
      }
      const big5Constructs = [
        'Extraversion',
        'Agreeableness',
        'Conscientiousness',
        'Neuroticism',
        'Openness',
      ]
      for (let i = 1; i <= 50; i += 1) {
        const construct = big5Constructs[(i - 1) % big5Constructs.length]
        const subconstruct = `${construct} Facet ${(Math.floor((i - 1) / 5) % 6) + 1}`
        const skill = `${construct} Skill ${(i % 2) + 1}`
        properties[`q${i}`] = {
          type: 'number',
          title: `${i}. Утверждение Big Five №${i}`,
          'x-decorator': 'FormItem',
          'x-component': 'Slider',
          'x-component-props': { min: 1, max: 5, step: 1, marks: makeMarks },
          'x-meta': { construct, subconstruct, skill, reverse: i % 5 === 0 },
          required: true,
        }
      }
      return { type: 'object', properties }
    }

    const buildHexacoSchema = () => {
      const properties: Record<string, any> = {
        intro: {
          type: 'void',
          'x-component': 'FormItem',
          'x-content':
            '⭐ Оцените каждое утверждение звездочками от 1 до 5\n\n1 звезда = Совершенно не согласен | 5 звезд = Совершенно согласен',
        },
      }
      const hexacoConstructs = [
        'Honesty-Humility',
        'Emotionality',
        'eXtraversion',
        'Agreeableness',
        'Conscientiousness',
        'Openness',
      ]
      for (let i = 1; i <= 60; i += 1) {
        const construct = hexacoConstructs[(i - 1) % hexacoConstructs.length]
        const subconstruct = `${construct} Facet ${(Math.floor((i - 1) / 6) % 6) + 1}`
        const skill = `${construct} Skill ${(i % 3) + 1}`
        properties[`h${i}`] = {
          type: 'number',
          title: `${i}. Утверждение HEXACO №${i}`,
          'x-decorator': 'FormItem',
          'x-component': 'Rate',
          'x-component-props': { count: 5 },
          'x-meta': { construct, subconstruct, skill, reverse: i % 6 === 0 },
          required: true,
        }
      }
      return { type: 'object', properties }
    }

    const big5Schema = buildBig5Schema()

    // Заменяем существующие тесты (по title) и создаем новые
    await supabaseAdmin.from('tests').delete().eq('title', 'Big Five - Тест личности')
    await supabaseAdmin.from('tests').delete().eq('title', 'HEXACO - Личностный опросник')

    const { data: big5, error: big5Error } = await supabaseAdmin
      .from('tests')
      .insert({
        title: 'Big Five - Тест личности',
        description:
          'Полноценный опросник Большой Пятерки (50 утверждений). Оцените по шкале от 1 до 5.',
        formily_schema: big5Schema,
        status: 'published',
        show_results: true,
        allow_multiple_attempts: true,
        time_limit_minutes: 20,
      })
      .select()
      .single()

    if (big5Error) {
      throw new Error('Big5 error: ' + big5Error.message)
    }

    const hexacoSchema = buildHexacoSchema()

    const { data: hexaco, error: hexacoError } = await supabaseAdmin
      .from('tests')
      .insert({
        title: 'HEXACO - Личностный опросник',
        description: 'Полноценный опросник HEXACO (60 утверждений). Оцените звездочками от 1 до 5.',
        formily_schema: hexacoSchema,
        status: 'published',
        show_results: true,
        allow_multiple_attempts: true,
        time_limit_minutes: 30,
      })
      .select()
      .single()

    if (hexacoError) {
      throw new Error('HEXACO error: ' + hexacoError.message)
    }

    return NextResponse.json({
      success: true,
      data: {
        big5,
        hexaco,
      },
      message: 'Tests created and published successfully!',
    })
  } catch (error) {
    console.error('Seed tests error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
