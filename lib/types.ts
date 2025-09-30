// ============================================================================
// Типы для новой системы тестирования с Formily
// ============================================================================

import { ISchema } from '@formily/react'

// Типы вопросов (расширенный список как в Qualtrics)
export type QuestionType = 
  // Базовые типы
  | 'text'              // Текстовый ввод (короткий)
  | 'textarea'          // Многострочный текст
  | 'number'            // Числовой ввод
  | 'email'             // Email адрес
  | 'phone'             // Телефон
  | 'url'               // URL адрес
  
  // Выбор из вариантов
  | 'radio'             // Один выбор (Radio)
  | 'checkbox'          // Множественный выбор
  | 'select'            // Dropdown (выпадающий список)
  | 'image_choice'      // Выбор изображений
  
  // Шкалы и рейтинги
  | 'rating'            // Звездочки / рейтинг
  | 'scale'             // Шкала Лайкерта (1-5, 1-7, 1-10)
  | 'slider'            // Слайдер
  | 'nps'               // Net Promoter Score (0-10)
  
  // Даты и время
  | 'date'              // Дата
  | 'time'              // Время
  | 'datetime'          // Дата и время
  
  // Булевы
  | 'boolean'           // Да/Нет (switch)
  | 'yes_no'            // Да/Нет (radio)
  
  // Сложные типы
  | 'matrix'            // Матричная таблица
  | 'ranking'           // Ранжирование (drag & drop)
  | 'constant_sum'      // Постоянная сумма (сумма должна быть N)
  | 'upload'            // Загрузка файла
  | 'signature'         // Подпись
  | 'location'          // Выбор местоположения
  
  // Специальные
  | 'divider'           // Разделитель (только текст)
  | 'html'              // Произвольный HTML

export interface Admin {
  id: string
  email: string
  name?: string
  created_at: string
}

export interface Test {
  id: string
  title: string
  description?: string
  formily_schema: ISchema
  status: 'draft' | 'published' | 'archived'
  show_results: boolean
  allow_multiple_attempts: boolean
  time_limit_minutes?: number
  created_by?: string
  created_at: string
  updated_at: string
  total_responses: number
}

export interface TestResponse {
  id: string
  test_id: string
  response_data: Record<string, any>
  user_identifier?: string
  ip_address?: string
  user_agent?: string
  started_at: string
  completed_at: string
  time_spent_seconds?: number
  score?: number
  results_data?: any
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Типы для создания теста
export interface CreateTestInput {
  title: string
  description?: string
  formily_schema: ISchema
  show_results?: boolean
  allow_multiple_attempts?: boolean
  time_limit_minutes?: number
}

// Типы для отправки ответа
export interface SubmitResponseInput {
  test_id: string
  response_data: Record<string, any>
  user_identifier?: string
  time_spent_seconds?: number
}

// Настройки вопроса в схеме
export interface QuestionSettings {
  questionType?: QuestionType
  correctAnswer?: any
  points?: number
  required?: boolean
  placeholder?: string
  min?: number
  max?: number
  step?: number
  options?: Array<{ label: string; value: any }>
  rows?: number
  maxLength?: number
}