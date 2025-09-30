import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST() {
  try {
    // Тест Big5
    const big5Schema = {
      type: 'object',
      properties: {
        intro: {
          type: 'void',
          'x-component': 'FormItem',
          'x-content': '📊 Оцените каждое утверждение по шкале от 1 до 5\n\n1 = Абсолютно не согласен | 5 = Полностью согласен'
        },
        q1: {
          type: 'number',
          title: '1. Я разговорчивый человек',
          'x-decorator': 'FormItem',
          'x-component': 'Slider',
          'x-component-props': {
            min: 1,
            max: 5,
            step: 1,
            marks: { 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' }
          },
          required: true
        },
        q2: {
          type: 'number',
          title: '2. Я склонен критиковать других',
          'x-decorator': 'FormItem',
          'x-component': 'Slider',
          'x-component-props': {
            min: 1,
            max: 5,
            step: 1,
            marks: { 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' }
          },
          required: true
        },
        q3: {
          type: 'number',
          title: '3. Я выполняю работу тщательно',
          'x-decorator': 'FormItem',
          'x-component': 'Slider',
          'x-component-props': {
            min: 1,
            max: 5,
            step: 1,
            marks: { 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' }
          },
          required: true
        },
        q4: {
          type: 'number',
          title: '4. Я часто нервничаю',
          'x-decorator': 'FormItem',
          'x-component': 'Slider',
          'x-component-props': {
            min: 1,
            max: 5,
            step: 1,
            marks: { 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' }
          },
          required: true
        },
        q5: {
          type: 'number',
          title: '5. Я имею богатое воображение',
          'x-decorator': 'FormItem',
          'x-component': 'Slider',
          'x-component-props': {
            min: 1,
            max: 5,
            step: 1,
            marks: { 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' }
          },
          required: true
        },
        q6: {
          type: 'number',
          title: '6. Я общительный и энергичный',
          'x-decorator': 'FormItem',
          'x-component': 'Slider',
          'x-component-props': {
            min: 1,
            max: 5,
            step: 1,
            marks: { 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' }
          },
          required: true
        },
        q7: {
          type: 'number',
          title: '7. Я уважительно отношусь к другим',
          'x-decorator': 'FormItem',
          'x-component': 'Slider',
          'x-component-props': {
            min: 1,
            max: 5,
            step: 1,
            marks: { 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' }
          },
          required: true
        },
        q8: {
          type: 'number',
          title: '8. Я склонен к лени',
          'x-decorator': 'FormItem',
          'x-component': 'Slider',
          'x-component-props': {
            min: 1,
            max: 5,
            step: 1,
            marks: { 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' }
          },
          required: true
        },
        q9: {
          type: 'number',
          title: '9. Я остаюсь спокойным в стрессовых ситуациях',
          'x-decorator': 'FormItem',
          'x-component': 'Slider',
          'x-component-props': {
            min: 1,
            max: 5,
            step: 1,
            marks: { 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' }
          },
          required: true
        },
        q10: {
          type: 'number',
          title: '10. Я интересуюсь искусством и культурой',
          'x-decorator': 'FormItem',
          'x-component': 'Slider',
          'x-component-props': {
            min: 1,
            max: 5,
            step: 1,
            marks: { 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' }
          },
          required: true
        }
      }
    }

    const { data: big5, error: big5Error } = await supabaseAdmin
      .from('tests')
      .insert({
        title: 'Big Five - Тест личности',
        description: 'Опросник личности по модели Большой Пятерки. Оцените 10 утверждений о себе по шкале от 1 до 5.',
        formily_schema: big5Schema,
        status: 'published',
        show_results: true,
        allow_multiple_attempts: true,
        time_limit_minutes: 15
      })
      .select()
      .single()

    if (big5Error) {
      throw new Error('Big5 error: ' + big5Error.message)
    }

    // Тест HEXACO
    const hexacoSchema = {
      type: 'object',
      properties: {
        intro: {
          type: 'void',
          'x-component': 'FormItem',
          'x-content': '⭐ Оцените каждое утверждение звездочками от 1 до 5\n\n1 звезда = Совершенно не согласен | 5 звезд = Совершенно согласен'
        },
        h1: {
          type: 'number',
          title: '1. Я бы никогда не взял взятку, даже если бы была большая сумма',
          'x-decorator': 'FormItem',
          'x-component': 'Rate',
          'x-component-props': { count: 5 },
          required: true
        },
        h2: {
          type: 'number',
          title: '2. Я боюсь чувствовать себя физически больным',
          'x-decorator': 'FormItem',
          'x-component': 'Rate',
          'x-component-props': { count: 5 },
          required: true
        },
        h3: {
          type: 'number',
          title: '3. Я чувствую себя комфортно в социальных собраниях',
          'x-decorator': 'FormItem',
          'x-component': 'Rate',
          'x-component-props': { count: 5 },
          required: true
        },
        h4: {
          type: 'number',
          title: '4. Я быстро прощаю людей, которые меня обидели',
          'x-decorator': 'FormItem',
          'x-component': 'Rate',
          'x-component-props': { count: 5 },
          required: true
        },
        h5: {
          type: 'number',
          title: '5. Я планирую и организую дела заранее',
          'x-decorator': 'FormItem',
          'x-component': 'Rate',
          'x-component-props': { count: 5 },
          required: true
        },
        h6: {
          type: 'number',
          title: '6. Меня интересует изучение природы вселенной',
          'x-decorator': 'FormItem',
          'x-component': 'Rate',
          'x-component-props': { count: 5 },
          required: true
        },
        h7: {
          type: 'number',
          title: '7. Я не хочу, чтобы меня воспринимали как важную персону',
          'x-decorator': 'FormItem',
          'x-component': 'Rate',
          'x-component-props': { count: 5 },
          required: true
        },
        h8: {
          type: 'number',
          title: '8. Я плачу, когда смотрю грустные фильмы',
          'x-decorator': 'FormItem',
          'x-component': 'Rate',
          'x-component-props': { count: 5 },
          required: true
        },
        h9: {
          type: 'number',
          title: '9. Я предпочитаю работу, которая требует общения с людьми',
          'x-decorator': 'FormItem',
          'x-component': 'Rate',
          'x-component-props': { count: 5 },
          required: true
        },
        h10: {
          type: 'number',
          title: '10. Я редко злюсь даже на людей, которые плохо со мной обращаются',
          'x-decorator': 'FormItem',
          'x-component': 'Rate',
          'x-component-props': { count: 5 },
          required: true
        },
        h11: {
          type: 'number',
          title: '11. Я стараюсь выполнять все задачи на 100%',
          'x-decorator': 'FormItem',
          'x-component': 'Rate',
          'x-component-props': { count: 5 },
          required: true
        },
        h12: {
          type: 'number',
          title: '12. Я интересуюсь философскими дискуссиями',
          'x-decorator': 'FormItem',
          'x-component': 'Rate',
          'x-component-props': { count: 5 },
          required: true
        }
      }
    }

    const { data: hexaco, error: hexacoError } = await supabaseAdmin
      .from('tests')
      .insert({
        title: 'HEXACO - Личностный опросник',
        description: 'Опросник HEXACO измеряет 6 основных факторов личности. Оцените 12 утверждений звездочками от 1 до 5.',
        formily_schema: hexacoSchema,
        status: 'published',
        show_results: true,
        allow_multiple_attempts: true,
        time_limit_minutes: 20
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
        hexaco
      },
      message: 'Tests created and published successfully!'
    })
  } catch (error) {
    console.error('Seed tests error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
