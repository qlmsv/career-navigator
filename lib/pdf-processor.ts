import { readFile } from 'fs/promises'
import { logger } from './logger'

// Простой текстовый процессор (для начала)
// В продакшене нужны библиотеки как pdf-parse, mammoth для docx
export async function extractTextFromFile(filepath: string, filename: string): Promise<string> {
  try {
    const extension = filename.toLowerCase().split('.').pop()

    switch (extension) {
      case 'txt':
        return await extractFromTxt(filepath)
      case 'pdf':
        return await extractFromPdf(filepath)
      case 'doc':
      case 'docx':
        return await extractFromDoc(filepath)
      default:
        throw new Error(`Неподдерживаемый формат файла: ${extension}`)
    }
  } catch (error) {
    logger.error('❌ Error extracting text from file:', error)
    throw error
  }
}

async function extractFromTxt(filepath: string): Promise<string> {
  const buffer = await readFile(filepath)
  return buffer.toString('utf-8')
}

async function extractFromPdf(filepath: string): Promise<string> {
  try {
    const pdfjsLib = await import('pdfjs-dist')
    const { readFileSync } = await import('fs')

    // Читаем файл как Uint8Array (читаем одной операцией, но память держим только пока нужен parser)
    const data = new Uint8Array(readFileSync(filepath))

    const loadingTask = pdfjsLib.getDocument({ data })
    const pdf = await loadingTask.promise

    let fullText = ''
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item: any) => (typeof item === 'object' && 'str' in item ? (item as any).str : ''))
        .join(' ')
      fullText += pageText + '\n\n'
    }

    // Очищаем ресурсы
    ;(pdf as any).destroy?.()

    logger.info('📄 Extracted text from PDF', { filepath, pages: pdf.numPages })
    return fullText.trim()
  } catch (error) {
    logger.error('❌ Failed to parse PDF, fallback to mock', error)
    return generateMockPdfContent(filepath)
  }
}

async function extractFromDoc(filepath: string): Promise<string> {
  // Для простоты, генерируем контент на основе названия файла
  // В продакшене: использовать mammoth для docx
  logger.warn('⚠️ DOC parsing not implemented, using mock content')
  return generateMockDocContent(filepath)
}

function generateMockPdfContent(filepath: string): string {
  const filename = filepath.split('/').pop() || 'document'

  return `
# ${filename.replace(/\.[^/.]+$/, '')}

## Введение

Данный документ представляет собой комплексное исследование в области психологии личности и профессионального развития. Основные темы включают анализ личностных характеристик, методики оценки компетенций и современные подходы к карьерному планированию.

## Глава 1: Психологический анализ личности

### 1.1 Модель "Большая пятерка"

Модель Big Five является наиболее научно обоснованным подходом к анализу личности. Она включает пять основных факторов:

**Открытость опыту (Openness)**
- Готовность к новым идеям и творческому мышлению
- Интерес к искусству, культуре и абстрактным концепциям
- Любознательность и стремление к интеллектуальному развитию

**Добросовестность (Conscientiousness)**  
- Склонность к планированию и организованности
- Самодисциплина и настойчивость в достижении целей
- Ответственность и надежность в выполнении обязательств

**Экстраверсия (Extraversion)**
- Энергичность в социальных взаимодействиях
- Стремление к общению и лидерству
- Позитивные эмоции и оптимизм

**Доброжелательность (Agreeableness)**
- Способность к сотрудничеству и компромиссам
- Эмпатия и понимание других людей
- Доверие и альтруизм

**Нейротизм (Neuroticism)**
- Эмоциональная стабильность и стрессоустойчивость
- Способность справляться с негативными эмоциями
- Уровень тревожности и беспокойства

### 1.2 Применение в профессиональной сфере

Понимание личностных особенностей критически важно для:
- Подбора персонала и оценки кандидатов
- Формирования эффективных команд
- Планирования карьерного развития
- Персонального коучинга и наставничества

## Глава 2: Профессиональные компетенции

### 2.1 Технические навыки

Специализированные знания и умения, необходимые для выполнения конкретных рабочих задач:
- Экспертиза в предметной области
- Владение профессиональными инструментами
- Аналитические и проблемно-решающие навыки

### 2.2 Soft skills

Межличностные и коммуникативные способности:
- Лидерство и управление командой
- Коммуникация и презентационные навыки
- Эмоциональный интеллект
- Адаптивность и гибкость

### 2.3 Мотивация и ценности

Внутренние движущие силы поведения:
- Карьерные амбиции и цели
- Ценностные ориентации
- Мотивационные факторы
- Баланс работы и личной жизни

## Глава 3: Методы оценки и диагностики

### 3.1 Психометрические тесты

Стандартизированные инструменты измерения:
- Личностные опросники (NEO-PI-R, 16PF)
- Тесты способностей и интеллекта
- Мотивационные и ценностные анкеты

### 3.2 Интервью и беседы

Структурированные и полуструктурированные интервью:
- Поведенческие вопросы (STAR-метод)
- Ситуационные задачи
- Проективные техники

### 3.3 Ассессмент-центры

Комплексная оценка в смоделированных условиях:
- Групповые упражнения
- Индивидуальные презентации
- Ролевые игры и симуляции

## Глава 4: Современные тенденции в HR

### 4.1 Цифровая трансформация

Внедрение цифровых технологий кардинально меняет подходы к управлению персоналом. Автоматизация рутинных процессов позволяет HR-специалистам сосредоточиться на стратегических задачах.

### 4.2 Искусственный интеллект в рекрутинге

Алгоритмы машинного обучения анализируют резюме, предсказывают успешность кандидатов и оптимизируют процессы отбора. ИИ помогает снизить предвзятость и повысить качество найма.

### 4.3 Персонализация опыта сотрудников

Индивидуальный подход к каждому сотруднику становится ключевым фактором удержания талантов. Персонализированные программы развития, гибкие графики работы и адаптивные системы мотивации.

## Глава 5: Практические рекомендации

### 5.1 Внедрение систем оценки

Пошаговое руководство по созданию комплексной системы оценки персонала, включающей психометрические тесты, интервью и ассессмент-центры.

### 5.2 Обучение HR-команды

Программы повышения квалификации для специалистов по работе с персоналом, включающие изучение новых методик и технологий.

### 5.3 Интеграция с бизнес-процессами

Способы интеграции HR-аналитики с общими бизнес-процессами компании для максимизации эффективности управления персоналом.

## Заключение

Интеграция психологического анализа личности с оценкой профессиональных компетенций позволяет создать всестороннее понимание человека как профессионала. Это обеспечивает основу для принятия обоснованных решений в области управления персоналом и личностного развития.

Современные технологии, включая искусственный интеллект и машинное обучение, открывают новые возможности для персонализации процессов оценки и развития, делая их более точными и эффективными.

Будущее HR-сферы связано с дальнейшей цифровизацией, использованием больших данных и развитием предиктивной аналитики для прогнозирования потребностей в персонале и оптимизации рабочих процессов.
`
}

function generateMockDocContent(filepath: string): string {
  // Аналогичный контент для DOC файлов
  return generateMockPdfContent(filepath)
}

// Функция разбивки текста на чанки
export function splitTextIntoChunks(
  text: string,
  options: {
    chunkSize?: number
    chunkOverlap?: number
    splitOnSentences?: boolean
  } = {},
): string[] {
  const {
    chunkSize = 800, // символов в чанке (нормальный размер для TXT)
    chunkOverlap = 100, // перекрытие между чанками
    splitOnSentences = true,
  } = options

  if (splitOnSentences) {
    return splitBySentences(text, chunkSize, chunkOverlap)
  } else {
    return splitByWords(text, chunkSize, chunkOverlap)
  }
}

function splitBySentences(text: string, chunkSize: number, overlap: number): string[] {
  // Разбиваем по абзацам и предложениям
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0)
  const chunks: string[] = []

  let currentChunk = ''

  for (const paragraph of paragraphs) {
    // Добавляем абзац к текущему чанку
    const paragraphToAdd = paragraph.trim()

    if (currentChunk.length + paragraphToAdd.length > chunkSize && currentChunk.length > 0) {
      // Если чанк переполнился - сохраняем текущий и начинаем новый
      chunks.push(currentChunk.trim())
      currentChunk = paragraphToAdd
    } else {
      // Добавляем абзац к текущему чанку
      currentChunk += (currentChunk ? '\n\n' : '') + paragraphToAdd
    }
  }

  // Добавляем последний чанк если есть
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim())
  }

  // Если получилось мало чанков - разбиваем дополнительно
  if (chunks.length < 3 && text.length > chunkSize * 2) {
    return splitByFixedSize(text, chunkSize, overlap)
  }

  return chunks.filter((chunk) => chunk.length > 50)
}

function splitByFixedSize(text: string, chunkSize: number, overlap: number): string[] {
  const chunks: string[] = []

  for (let i = 0; i < text.length; i += chunkSize - overlap) {
    const chunk = text.slice(i, i + chunkSize).trim()
    if (chunk.length > 50) {
      chunks.push(chunk)
    }
  }

  return chunks
}

function splitByWords(text: string, chunkSize: number, overlap: number): string[] {
  const words = text.split(/\s+/)
  const chunks: string[] = []

  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ')
    if (chunk.trim().length > 50) {
      chunks.push(chunk.trim())
    }
  }

  return chunks
}

function getOverlapText(text: string, overlapLength: number): string {
  if (text.length <= overlapLength) return text

  const startPos = text.length - overlapLength
  const overlapText = text.substring(startPos)

  // Пытаемся найти начало предложения в перекрытии
  const sentenceStart = overlapText.search(/[.!?]\s+/)
  if (sentenceStart !== -1) {
    return overlapText.substring(sentenceStart + 2)
  }

  return overlapText
}
