import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST() {
  try {
    // Простой способ создания таблиц - попробуем вставить тестовые данные
    // Если таблицы не существуют, это вызовет ошибку, но мы сможем их создать
    
    const results = []
    
    // Пытаемся создать категории
    try {
      const { data, error } = await supabaseAdmin
        .from('test_categories')
        .insert([
          {
            name: 'programming',
            name_ru: 'Программирование',
            description: 'Тесты по программированию и разработке',
            icon: '💻',
            color: '#3B82F6',
            order_index: 1
          }
        ])
        .select()
      
      if (error) {
        results.push({ table: 'test_categories', success: false, error: error.message })
      } else {
        results.push({ table: 'test_categories', success: true, message: 'Table exists and data inserted' })
      }
    } catch (err) {
      results.push({ table: 'test_categories', success: false, error: err instanceof Error ? err.message : 'Unknown error' })
    }
    
    // Пытаемся создать тест
    try {
      const { data, error } = await supabaseAdmin
        .from('tests')
        .insert([
          {
            title: 'Test Test',
            title_ru: 'Тестовый тест',
            description: 'Test description',
            description_ru: 'Описание теста',
            author_id: '00000000-0000-0000-0000-000000000000',
            status: 'published',
            is_public: true
          }
        ])
        .select()
      
      if (error) {
        results.push({ table: 'tests', success: false, error: error.message })
      } else {
        results.push({ table: 'tests', success: true, message: 'Table exists and data inserted' })
      }
    } catch (err) {
      results.push({ table: 'tests', success: false, error: err instanceof Error ? err.message : 'Unknown error' })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Table creation test completed',
      results
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
