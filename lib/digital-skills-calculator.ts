/**
 * Калькулятор для оценки цифровых навыков и скоринга трудоустройства
 */

// Веса для 15 цифровых навыков
export const DIGITAL_SKILLS_WEIGHTS: Record<string, number> = {
  skill_1: 0.0297, // Копирование файлов
  skill_2: 0.0224, // Редактирование текста
  skill_3: 0.0341, // Работа с таблицами
  skill_4: 0.0289, // Редактирование видео/фото
  skill_5: 0.0318, // Презентации
  skill_6: 0.0156, // Мессенджеры
  skill_7: 0.0412, // Подключение устройств
  skill_8: 0.0287, // Передача файлов
  skill_9: 0.0376, // Установка ПО
  skill_10: 0.0298, // Безопасные пароли
  skill_11: 0.0334, // Проверка информации
  skill_12: 0.0389, // Ограничение данных
  skill_13: 0.0445, // Программирование
  skill_14: 0.0312, // Онлайн-покупки
  skill_15: 0.0356, // Другие действия
}

// Региональные средние значения индекса цифровых навыков
export const REGIONAL_AVERAGES: Record<string, number> = {
  moscow: 0.2821,
  spb: 0.2203,
  moscow_oblast: 0.1845,
  leningrad_oblast: 0.1654,
  krasnodar: 0.1523,
  sverdlovsk: 0.1487,
  novosibirsk: 0.1421,
  tatarstan: 0.1556,
  nizhny_novgorod: 0.1398,
  chelyabinsk: 0.1312,
  samara: 0.1365,
  rostov: 0.1289,
  bashkortostan: 0.1245,
  perm: 0.1198,
  krasnoyarsk: 0.1156,
  voronezh: 0.1134,
  volgograd: 0.1089,
  saratov: 0.1045,
  tyumen: 0.1687,
  altai_krai: 0.0987,
  kemerovo: 0.1023,
  irkutsk: 0.0998,
  stavropol: 0.0945,
  udmurtia: 0.0912,
  omsk: 0.0876,
  kaluga: 0.0503,
}

// Названия регионов
export const REGION_NAMES: Record<string, string> = {
  moscow: 'Москва',
  spb: 'Санкт-Петербург',
  moscow_oblast: 'Московская область',
  leningrad_oblast: 'Ленинградская область',
  krasnodar: 'Краснодарский край',
  sverdlovsk: 'Свердловская область',
  novosibirsk: 'Новосибирская область',
  tatarstan: 'Республика Татарстан',
  nizhny_novgorod: 'Нижегородская область',
  chelyabinsk: 'Челябинская область',
  samara: 'Самарская область',
  rostov: 'Ростовская область',
  bashkortostan: 'Республика Башкортостан',
  perm: 'Пермский край',
  krasnoyarsk: 'Красноярский край',
  voronezh: 'Воронежская область',
  volgograd: 'Волгоградская область',
  saratov: 'Саратовская область',
  tyumen: 'Тюменская область',
  altai_krai: 'Алтайский край',
  kemerovo: 'Кемеровская область',
  irkutsk: 'Иркутская область',
  stavropol: 'Ставропольский край',
  udmurtia: 'Удмуртская Республика',
  omsk: 'Омская область',
  kaluga: 'Калужская область',
}

// Веса для скоринга трудоустройства
export const SCORING_WEIGHTS = {
  constant: 0.2142,
  gender: {
    male: 1.0,
    female: 0.415,
  },
  settlement_type: {
    city: 1.0,
    village: 0.91,
  },
  region: {
    moscow: 1.1,
    spb: 1.05,
    moscow_oblast: 0.95,
    leningrad_oblast: 0.92,
    krasnodar: 0.88,
    sverdlovsk: 0.87,
    novosibirsk: 0.85,
    tatarstan: 0.89,
    nizhny_novgorod: 0.84,
    chelyabinsk: 0.82,
    samara: 0.83,
    rostov: 0.81,
    bashkortostan: 0.8,
    perm: 0.79,
    krasnoyarsk: 0.78,
    voronezh: 0.77,
    volgograd: 0.76,
    saratov: 0.75,
    tyumen: 0.91,
    altai_krai: 0.72,
    kemerovo: 0.74,
    irkutsk: 0.73,
    stavropol: 0.71,
    udmurtia: 0.7,
    omsk: 0.69,
    kaluga: 0.86,
  },
  family_size: {
    '1': 0.85,
    '2': 1.0,
    '3': 0.95,
    '4': 0.88,
    '5': 0.82,
    '6': 0.75,
    '7': 0.68,
    '8': 0.6,
  },
  age: {
    '15_17': 0.45,
    '18_20': 0.68,
    '21_25': 1.12,
    '26_30': 1.45,
    '31_35': 1.38,
    '36_40': 1.25,
    '41_45': 1.08,
    '46_50': 0.92,
    '51_55': 0.75,
    '56_60': 0.58,
    '61_65': 0.35,
    '66_plus': 0.18,
  },
  education: {
    primary: 0.15,
    secondary: 0.35,
    high_school: 0.58,
    vocational: 0.88,
    incomplete_higher: 1.05,
    bachelor: 1.45,
    specialist: 1.52,
    master: 1.68,
    phd: 1.82,
    doctorate: 1.95,
  },
  professional_skills: {
    languages: 1.35,
    teamwork: 1.22,
    analytics: 1.45,
    project_management: 1.58,
    communication: 1.18,
    sales: 1.28,
    finance: 1.42,
    creativity: 1.15,
    tech: 1.77,
    legal: 1.52,
    leadership: 1.65,
    organization: 1.25,
    big_data: 1.68,
  },
}

export interface DigitalSkillsResult {
  skillIndex: number
  regionalAverage: number
  difference: number
  percentile: number
  skillsBreakdown: Array<{
    skill: string
    label: string
    hasSkill: boolean
    weight: number
    contribution: number
  }>
}

export interface EmploymentScoringResult {
  probability: number
  probabilityPercent: number
  rawScore: number
  factorsBreakdown: Array<{
    factor: string
    label: string
    value: string | string[]
    weight: number
  }>
}

export interface CalculationResult {
  digitalSkills: DigitalSkillsResult
  employmentScoring: EmploymentScoringResult
  region: string
  regionName: string
}

const SKILL_LABELS: Record<string, string> = {
  skill_1: 'Копирование файлов',
  skill_2: 'Редактирование текста',
  skill_3: 'Работа с таблицами',
  skill_4: 'Редактирование видео/фото',
  skill_5: 'Презентации',
  skill_6: 'Мессенджеры',
  skill_7: 'Подключение устройств',
  skill_8: 'Передача файлов',
  skill_9: 'Установка ПО',
  skill_10: 'Безопасные пароли',
  skill_11: 'Проверка информации',
  skill_12: 'Ограничение данных',
  skill_13: 'Программирование',
  skill_14: 'Онлайн-покупки',
  skill_15: 'Другие действия',
}

/**
 * Рассчитывает индекс цифровых навыков
 */
export function calculateDigitalSkillsIndex(answers: Record<string, any>): DigitalSkillsResult {
  let totalIndex = 0
  const skillsBreakdown = []

  // Проходим по всем 15 навыкам
  for (let i = 1; i <= 15; i++) {
    const skillKey = `skill_${i}`
    const answer = answers[skillKey]
    const hasSkill = answer === 'yes'
    const weight = DIGITAL_SKILLS_WEIGHTS[skillKey] || 0
    const contribution = hasSkill ? weight : 0

    totalIndex += contribution

    skillsBreakdown.push({
      skill: skillKey,
      label: SKILL_LABELS[skillKey] || skillKey,
      hasSkill,
      weight,
      contribution,
    })
  }

  // Получаем региональное среднее
  const region = answers['region'] || 'moscow'
  const regionalAverage = REGIONAL_AVERAGES[region] || 0
  const difference = totalIndex - regionalAverage

  // Вычисляем процентиль (упрощенно)
  const allRegionalValues = Object.values(REGIONAL_AVERAGES)
  const sortedValues = [...allRegionalValues].sort((a, b) => a - b)
  const position = sortedValues.filter((v) => v <= totalIndex).length
  const percentile = (position / sortedValues.length) * 100

  return {
    skillIndex: totalIndex,
    regionalAverage,
    difference,
    percentile,
    skillsBreakdown,
  }
}

/**
 * Рассчитывает вероятность трудоустройства
 */
export function calculateEmploymentScoring(answers: Record<string, any>): EmploymentScoringResult {
  const factorsBreakdown = []

  // 1. Константа (всегда применяется)
  let product = SCORING_WEIGHTS.constant

  // 2. Пол
  const gender = answers['gender'] || 'male'
  const genderWeight = SCORING_WEIGHTS.gender[gender as keyof typeof SCORING_WEIGHTS.gender] || 1
  product *= genderWeight
  factorsBreakdown.push({
    factor: 'gender',
    label: 'Пол',
    value: gender === 'male' ? 'Мужской' : 'Женский',
    weight: genderWeight,
  })

  // 3. Тип поселения
  const settlementType = answers['settlement_type'] || 'city'
  const settlementWeight =
    SCORING_WEIGHTS.settlement_type[
      settlementType as keyof typeof SCORING_WEIGHTS.settlement_type
    ] || 1
  product *= settlementWeight
  factorsBreakdown.push({
    factor: 'settlement_type',
    label: 'Тип населенного пункта',
    value: settlementType === 'city' ? 'Город' : 'Село/Деревня',
    weight: settlementWeight,
  })

  // 4. Регион
  const region = answers['region'] || 'moscow'
  const regionWeight = SCORING_WEIGHTS.region[region as keyof typeof SCORING_WEIGHTS.region] || 0.8
  product *= regionWeight
  factorsBreakdown.push({
    factor: 'region',
    label: 'Регион',
    value: REGION_NAMES[region] || region,
    weight: regionWeight,
  })

  // 5. Размер семьи
  const familySize = answers['family_size'] || '2'
  const familyWeight =
    SCORING_WEIGHTS.family_size[familySize as keyof typeof SCORING_WEIGHTS.family_size] || 0.9
  product *= familyWeight
  factorsBreakdown.push({
    factor: 'family_size',
    label: 'Количество членов семьи',
    value: `${familySize} ${getFamilySizeLabel(familySize)}`,
    weight: familyWeight,
  })

  // 6. Возраст
  const age = answers['age'] || '26_30'
  const ageWeight = SCORING_WEIGHTS.age[age as keyof typeof SCORING_WEIGHTS.age] || 1
  product *= ageWeight
  factorsBreakdown.push({
    factor: 'age',
    label: 'Возраст',
    value: getAgeLabel(age),
    weight: ageWeight,
  })

  // 7. Образование
  const education = answers['education'] || 'bachelor'
  const educationWeight =
    SCORING_WEIGHTS.education[education as keyof typeof SCORING_WEIGHTS.education] || 1
  product *= educationWeight
  factorsBreakdown.push({
    factor: 'education',
    label: 'Образование',
    value: getEducationLabel(education),
    weight: educationWeight,
  })

  // 8. Профессиональные навыки (множественный выбор)
  const professionalSkills = answers['professional_skills'] || []
  const skillsList: string[] = Array.isArray(professionalSkills)
    ? professionalSkills
    : [professionalSkills]

  if (skillsList.length > 0) {
    // Для множественного выбора умножаем веса всех выбранных навыков
    for (const skill of skillsList) {
      const skillWeight =
        SCORING_WEIGHTS.professional_skills[
          skill as keyof typeof SCORING_WEIGHTS.professional_skills
        ] || 1
      product *= skillWeight
    }

    factorsBreakdown.push({
      factor: 'professional_skills',
      label: 'Профессиональные навыки',
      value: skillsList.map(getProfessionalSkillLabel),
      weight: skillsList.reduce(
        (acc, skill) =>
          acc *
          (SCORING_WEIGHTS.professional_skills[
            skill as keyof typeof SCORING_WEIGHTS.professional_skills
          ] || 1),
        1,
      ),
    })
  }

  // Рассчитываем вероятность по формуле: P = rawScore / (rawScore + 1)
  const probability = product / (product + 1)
  const probabilityPercent = probability * 100

  return {
    probability,
    probabilityPercent,
    rawScore: product,
    factorsBreakdown,
  }
}

/**
 * Полный расчет всех метрик
 */
export function calculateFullResults(answers: Record<string, any>): CalculationResult {
  const digitalSkills = calculateDigitalSkillsIndex(answers)
  const employmentScoring = calculateEmploymentScoring(answers)
  const region = answers['region'] || 'moscow'
  const regionName = REGION_NAMES[region] || region

  return {
    digitalSkills,
    employmentScoring,
    region,
    regionName,
  }
}

// Утилиты для меток
function getFamilySizeLabel(size: string): string {
  const num = parseInt(size, 10)
  if (num === 1) return 'человек'
  if (num >= 2 && num <= 4) return 'человека'
  return 'человек'
}

function getAgeLabel(age: string): string {
  const labels: Record<string, string> = {
    '15_17': '15-17 лет',
    '18_20': '18-20 лет',
    '21_25': '21-25 лет',
    '26_30': '26-30 лет',
    '31_35': '31-35 лет',
    '36_40': '36-40 лет',
    '41_45': '41-45 лет',
    '46_50': '46-50 лет',
    '51_55': '51-55 лет',
    '56_60': '56-60 лет',
    '61_65': '61-65 лет',
    '66_plus': '66+ лет',
  }
  return labels[age] || age
}

function getEducationLabel(education: string): string {
  const labels: Record<string, string> = {
    primary: 'Начальное общее',
    secondary: 'Основное общее',
    high_school: 'Среднее общее',
    vocational: 'Среднее профессиональное',
    incomplete_higher: 'Неоконченное высшее',
    bachelor: 'Высшее (бакалавриат)',
    specialist: 'Высшее (специалитет)',
    master: 'Высшее (магистратура)',
    phd: 'Аспирантура/Кандидат наук',
    doctorate: 'Докторская степень',
  }
  return labels[education] || education
}

function getProfessionalSkillLabel(skill: string): string {
  const labels: Record<string, string> = {
    languages: 'Знание иностранных языков',
    teamwork: 'Опыт работы в команде',
    analytics: 'Аналитическое мышление',
    project_management: 'Управление проектами',
    communication: 'Коммуникативные навыки',
    sales: 'Навыки продаж',
    finance: 'Финансовая грамотность',
    creativity: 'Креативность и дизайн',
    tech: 'Технические навыки (IT)',
    legal: 'Юридические знания',
    leadership: 'Лидерские качества',
    organization: 'Организаторские способности',
    big_data: 'Работа с большими данными',
  }
  return labels[skill] || skill
}
