import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { REGION_NAMES } from '@/lib/digital-skills-calculator'

export async function POST() {
  try {
    // ========== ICT INDEX TEST ==========
    const buildICTIndexSchema = () => {
      const properties: Record<string, any> = {
        intro: {
          type: 'void',
          'x-component': 'FormItem',
          'x-content':
            '📊 Тест для оценки цифровых навыков\n\nОтметьте все навыки, которыми вы обладаете.',
        },
      }

      // 15 цифровых навыков с чекбоксами
      const skills = [
        'Копирование, вставка или перемещение текста, фото-, видео-, аудиофайлов',
        'Набор текста и его редактирование',
        'Работа с электронными таблицами',
        'Использование программ для редактирования фото-, видео- и аудиофайлов',
        'Создание электронных презентаций',
        'Отправка SMS, электронной почты, через мессенджеры',
        'Подключение и установка новых устройств',
        'Передача файлов между устройствами, облачные хранилища',
        'Поиск, загрузка, установка и настройка программного обеспечения',
        'Создание паролей для учетных записей, защита устройства',
        'Проверка достоверности информации в Интернете',
        'Ограничение использования личных данных',
        'Написание программного обеспечения',
        'Иные действия с устройствами',
        'Прочие действия',
      ]

      // Добавляем каждый навык как чекбокс
      for (let i = 1; i <= 15; i++) {
        properties[`skill_${i}`] = {
          type: 'string',
          title: `${i}. ${skills[i - 1]}`,
          'x-decorator': 'FormItem',
          'x-component': 'Checkbox',
          'x-component-props': {},
          enum: ['yes'],
          'x-meta': {
            skill: `skill_${i}`,
            skillType: 'digital',
          },
        }
      }

      // Добавляем выбор региона
      const regionOptions = Object.entries(REGION_NAMES).map(([key, name]) => ({
        label: name,
        value: key,
      }))

      properties['region'] = {
        type: 'string',
        title: 'Выберите ваш регион проживания',
        'x-decorator': 'FormItem',
        'x-component': 'Select',
        'x-component-props': {
          placeholder: 'Выберите регион',
          showSearch: true,
          filterOption: true,
        },
        enum: regionOptions.map((r) => r.value),
        'x-enum-options': regionOptions,
        required: true,
      }

      return {
        type: 'object',
        properties,
        'x-meta': {
          testType: 'ict_index',
          scoringMode: 'custom',
        },
      }
    }

    // ========== EMPLOYMENT SCORING TEST ==========
    const buildEmploymentScoringSchema = () => {
      const properties: Record<string, any> = {
        intro: {
          type: 'void',
          'x-component': 'FormItem',
          'x-content':
            '💼 Тест для оценки вероятности трудоустройства\n\nОтветьте на вопросы о вашем социально-демографическом профиле.',
        },
      }

      // Вопрос 1: Пол
      properties['gender'] = {
        type: 'string',
        title: '1. Каков ваш пол?',
        'x-decorator': 'FormItem',
        'x-component': 'Radio.Group',
        enum: ['male', 'female'],
        'x-enum-options': [
          { label: 'Мужской', value: 'male' },
          { label: 'Женский', value: 'female' },
        ],
        required: true,
        'x-meta': { factor: 'gender' },
      }

      // Вопрос 2: Тип населенного пункта
      properties['settlement_type'] = {
        type: 'string',
        title: '2. В каком типе населенного пункта вы проживаете?',
        'x-decorator': 'FormItem',
        'x-component': 'Radio.Group',
        enum: ['city', 'village'],
        'x-enum-options': [
          { label: 'Город', value: 'city' },
          { label: 'Село и подобные', value: 'village' },
        ],
        required: true,
        'x-meta': { factor: 'settlement_type' },
      }

      // Вопрос 3: Регион (все 85 регионов)
      const employmentRegions = Object.entries(REGION_NAMES).map(([key, name]) => ({
        label: name,
        value: key,
      }))

      properties['region'] = {
        type: 'string',
        title: '3. В каком регионе вы проживаете?',
        'x-decorator': 'FormItem',
        'x-component': 'Select',
        'x-component-props': {
          placeholder: 'Выберите регион',
          showSearch: true,
          filterOption: true,
        },
        enum: employmentRegions.map((r) => r.value),
        'x-enum-options': employmentRegions,
        required: true,
        'x-meta': { factor: 'region' },
      }

      // Вопрос 4: Размер семьи
      const familySizeOptions = Array.from({ length: 13 }, (_, i) => ({
        label: `${i + 1}`,
        value: `${i + 1}`,
      }))

      properties['family_size'] = {
        type: 'string',
        title: '4. Сколько у вас членов семьи?',
        'x-decorator': 'FormItem',
        'x-component': 'Select',
        'x-component-props': {
          placeholder: 'Выберите количество',
        },
        enum: familySizeOptions.map((o) => o.value),
        'x-enum-options': familySizeOptions,
        required: true,
        'x-meta': { factor: 'family_size' },
      }

      // Вопрос 5: Возраст
      const ageOptions = [
        { label: '15-19', value: '15_19' },
        { label: '20-24', value: '20_24' },
        { label: '25-29', value: '25_29' },
        { label: '30-34', value: '30_34' },
        { label: '35-39', value: '35_39' },
        { label: '40-44', value: '40_44' },
        { label: '45-49', value: '45_49' },
        { label: '50-54', value: '50_54' },
        { label: '55-59', value: '55_59' },
        { label: '60-64', value: '60_64' },
        { label: '65-69', value: '65_69' },
        { label: '70-74', value: '70_74' },
        { label: '75-79', value: '75_79' },
        { label: '80+', value: '80_plus' },
      ]

      properties['age'] = {
        type: 'string',
        title: '5. Укажите ваш примерный возраст',
        'x-decorator': 'FormItem',
        'x-component': 'Select',
        'x-component-props': {
          placeholder: 'Выберите возраст',
        },
        enum: ageOptions.map((o) => o.value),
        'x-enum-options': ageOptions,
        required: true,
        'x-meta': { factor: 'age' },
      }

      // Вопрос 6: Образование
      const educationOptions = [
        { label: 'Среднее профессиональное', value: 'vocational' },
        { label: 'Среднее профессиональное кв', value: 'vocational_skilled' },
        { label: 'Среднее общее', value: 'high_school' },
        { label: 'Основное общее', value: 'basic' },
        { label: 'Не имеют основного', value: 'no_basic' },
        { label: 'Высшее профессиональное', value: 'higher' },
        { label: 'Бакалавриат', value: 'bachelor' },
        { label: 'Специалист', value: 'specialist' },
        { label: 'Магистр', value: 'master' },
      ]

      properties['education'] = {
        type: 'string',
        title: '6. Укажите ваш уровень образования',
        'x-decorator': 'FormItem',
        'x-component': 'Select',
        'x-component-props': {
          placeholder: 'Выберите образование',
        },
        enum: educationOptions.map((o) => o.value),
        'x-enum-options': educationOptions,
        required: true,
        'x-meta': { factor: 'education' },
      }

      // Вопрос 7: Профессиональные навыки (множественный выбор)
      const skillsOptions = [
        { label: 'Набор текста и редактирование', value: 'text_editing' },
        { label: 'Работа с электронными таблицами', value: 'spreadsheets' },
        { label: 'Редактирование фото-, видео-', value: 'media_editing' },
        { label: 'Создание презентаций', value: 'presentations' },
        { label: 'Отправка через мессенджеры', value: 'messaging' },
        { label: 'Подключение устройств', value: 'device_connection' },
        { label: 'Передача файлов между устройствами', value: 'file_transfer' },
        { label: 'Поиск и установка ПО', value: 'software_install' },
        { label: 'Создание паролей и защита', value: 'security' },
        { label: 'Проверка информации в Интернете', value: 'info_verification' },
        { label: 'Ограничение личных данных', value: 'privacy' },
        { label: 'Написание программного обеспечения', value: 'programming' },
        { label: 'Иные навыки', value: 'other_skills' },
      ]

      properties['professional_skills'] = {
        type: 'array',
        title: '7. Укажите какими навыками вы обладаете?',
        'x-decorator': 'FormItem',
        'x-component': 'Checkbox.Group',
        'x-component-props': {},
        enum: skillsOptions.map((o) => o.value),
        'x-enum-options': skillsOptions,
        'x-meta': { factor: 'professional_skills' },
      }

      return {
        type: 'object',
        properties,
        'x-meta': {
          testType: 'employment_scoring',
          scoringMode: 'custom',
        },
      }
    }

    // Удаляем существующие тесты с такими же названиями
    await supabaseAdmin.from('tests').delete().eq('title', 'ICT Index - Тест цифровых навыков')
    await supabaseAdmin
      .from('tests')
      .delete()
      .eq('title', 'Employment Scoring - Оценка трудоустройства')

    // Создаем ICT Index Test
    const ictSchema = buildICTIndexSchema()
    const { data: ictTest, error: ictError } = await supabaseAdmin
      .from('tests')
      .insert({
        title: 'ICT Index - Тест цифровых навыков',
        description:
          'Оцените свои цифровые навыки и сравните результат со средним по вашему региону. Тест включает 15 навыков и выбор из 85 регионов.',
        formily_schema: ictSchema,
        status: 'published',
        show_results: true,
        allow_multiple_attempts: true,
        time_limit_minutes: 10,
      })
      .select()
      .single()

    if (ictError) {
      throw new Error('ICT Index error: ' + ictError.message)
    }

    // Создаем Employment Scoring Test
    const employmentSchema = buildEmploymentScoringSchema()
    const { data: employmentTest, error: employmentError } = await supabaseAdmin
      .from('tests')
      .insert({
        title: 'Employment Scoring - Оценка трудоустройства',
        description:
          'Узнайте вашу вероятность трудоустройства на основе социально-демографических характеристик. 7 вопросов о поле, возрасте, образовании и навыках.',
        formily_schema: employmentSchema,
        status: 'published',
        show_results: true,
        allow_multiple_attempts: true,
        time_limit_minutes: 15,
      })
      .select()
      .single()

    if (employmentError) {
      throw new Error('Employment Scoring error: ' + employmentError.message)
    }

    return NextResponse.json({
      success: true,
      data: {
        ictTest,
        employmentTest,
      },
      message: 'Formily tests created and published successfully!',
    })
  } catch (error) {
    console.error('Seed Formily tests error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
