import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST() {
  try {
    // Создаем базовые категории тестов
    const categories = [
      {
        name: 'Digital Skills',
        name_ru: 'Цифровые навыки',
        description: 'Тесты на знание цифровых технологий',
        icon: '💻',
        color: '#3B82F6',
        order_index: 1
      },
      {
        name: 'Programming',
        name_ru: 'Программирование',
        description: 'Тесты на знание языков программирования',
        icon: '⚡',
        color: '#10B981',
        order_index: 2
      },
      {
        name: 'Design',
        name_ru: 'Дизайн',
        description: 'Тесты на знание дизайна и UX/UI',
        icon: '🎨',
        color: '#F59E0B',
        order_index: 3
      },
      {
        name: 'Marketing',
        name_ru: 'Маркетинг',
        description: 'Тесты на знание маркетинга и рекламы',
        icon: '📈',
        color: '#EF4444',
        order_index: 4
      },
      {
        name: 'Business',
        name_ru: 'Бизнес',
        description: 'Тесты на знание бизнес-процессов',
        icon: '💼',
        color: '#8B5CF6',
        order_index: 5
      },
      {
        name: 'Languages',
        name_ru: 'Языки',
        description: 'Тесты на знание иностранных языков',
        icon: '🌍',
        color: '#06B6D4',
        order_index: 6
      }
    ]

    // Проверяем, есть ли уже категории
    const { data: existingCategories } = await supabaseAdmin
      .from('test_categories')
      .select('id')
      .limit(1)

    if (existingCategories && existingCategories.length > 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Categories already exist' 
      })
    }

    // Создаем категории
    const { data, error } = await supabaseAdmin
      .from('test_categories')
      .insert(categories)
      .select()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Test categories created successfully' 
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
