/**
 * Калькулятор для оценки цифровых навыков и скоринга трудоустройства
 */

// Веса для 15 цифровых навыков (ICT Index Test)
export const DIGITAL_SKILLS_WEIGHTS: Record<string, number> = {
  skill_1: 0.029676049467350713, // Копирование файлов
  skill_2: 0.022367832355977127, // Редактирование текста
  skill_3: 0.03408213780605006, // Работа с таблицами
  skill_4: 0.03744360233695229, // Редактирование видео/фото
  skill_5: 0.041419130070706474, // Презентации
  skill_6: 0.005668239394095721, // Мессенджеры
  skill_7: 0.05959972376659287, // Подключение устройств
  skill_8: 0.04263246589422435, // Передача файлов
  skill_9: 0.09444088531949234, // Установка ПО
  skill_10: 0.10207284869860532, // Безопасные пароли
  skill_11: 0.14164493457913216, // Проверка информации
  skill_12: 0.12611403265548982, // Ограничение данных
  skill_13: 0.13363649198311303, // Программирование
  skill_14: 0.1292016256722177, // Иные действия
  skill_15: 0.1292016256722177, // Прочие действия
}

// Региональные средние значения индекса цифровых навыков (85 регионов)
export const REGIONAL_AVERAGES: Record<string, number> = {
  altai_krai: 0.16415575226947818,
  krasnodar_krai: 0.09986910541929511,
  krasnoyarsk_krai: 0.10703505413910533,
  primorsky_krai: 0.23481577823093636,
  stavropol_krai: 0.13970293182814356,
  khabarovsk_krai: 0.10326562481169636,
  amur_oblast: 0.11977317624379108,
  arkhangelsk_oblast: 0.12456350173530747,
  astrakhan_oblast: 0.0946678300877534,
  nenets_ao: 0.1451234187365042,
  belgorod_oblast: 0.13236756227983534,
  bryansk_oblast: 0.1030882151914204,
  vladimir_oblast: 0.16973462013874638,
  volgograd_oblast: 0.14245171823957267,
  vologda_oblast: 0.21071827812083702,
  voronezh_oblast: 0.10501283993265806,
  nizhny_novgorod_oblast: 0.12592505587448943,
  ivanovo_oblast: 0.09100405417894979,
  irkutsk_oblast: 0.1316858467359999,
  ingushetia: 0.1349889476492691,
  kaliningrad_oblast: 0.23087036167389816,
  tver_oblast: 0.1338981796396758,
  kaluga_oblast: 0.050251817869273706,
  kamchatka_krai: 0.1412790642961421,
  kemerovo_oblast: 0.1531796996008675,
  kirov_oblast: 0.09279410751936862,
  kostroma_oblast: 0.11392089326778566,
  crimea: 0.12721367496282704,
  samara_oblast: 0.13991951584472517,
  kurgan_oblast: 0.10131177483391153,
  kursk_oblast: 0.12528560539446013,
  spb: 0.2202858927054161,
  leningrad_oblast: 0.13093428886861458,
  lipetsk_oblast: 0.059198802855528095,
  magadan_oblast: 0.1187012023213447,
  moscow: 0.2821017566069127,
  moscow_oblast: 0.18044823135367094,
  murmansk_oblast: 0.19672651466094168,
  novgorod_oblast: 0.08331493198240458,
  novosibirsk_oblast: 0.24261628463450996,
  omsk_oblast: 0.21832273728918075,
  orenburg_oblast: 0.08880698376953661,
  orel_oblast: 0.06409407505777781,
  penza_oblast: 0.1085822860380671,
  perm_krai: 0.16504757358787087,
  pskov_oblast: 0.1922996976176249,
  rostov_oblast: 0.1678670595739791,
  ryazan_oblast: 0.17616040043515413,
  saratov_oblast: 0.13133059658975785,
  sakhalin_oblast: 0.28307023069331805,
  sverdlovsk_oblast: 0.13610383679715374,
  smolensk_oblast: 0.07548966201343939,
  sevastopol: 0.1903655913391894,
  tambov_oblast: 0.07413049654043877,
  tomsk_oblast: 0.13701248223193524,
  tula_oblast: 0.13450360749401422,
  tyumen_oblast: 0.06759590612383111,
  khmao: 0.1981622317989648,
  ulyanovsk_oblast: 0.13540270633753415,
  yamalo_nenets_ao: 0.18435618524736969,
  chelyabinsk_oblast: 0.09725519320774287,
  zabaykalsky_krai: 0.11557151980468852,
  chukotka_ao: 0.2413116240005887,
  yaroslavl_oblast: 0.07902434802997928,
  adygea: 0.11410632689651995,
  bashkortostan: 0.09328808345828082,
  buryatia: 0.24663776307647792,
  dagestan: 0.0834398788803497,
  kabardino_balkaria: 0.06591068933535382,
  altai_republic: 0.15737929354498117,
  kalmykia: 0.08705922793383374,
  karelia: 0.07563286495861606,
  komi: 0.09263452344450654,
  mari_el: 0.15592881287677157,
  mordovia: 0.16305753868581882,
  north_ossetia: 0.047968398792891935,
  karachay_cherkessia: 0.06579091746171689,
  tatarstan: 0.14562673670768184,
  tuva: 0.08476864791289496,
  udmurtia: 0.175577171258305,
  khakassia: 0.10841458635176573,
  chechnya: 0.06557304648501308,
  chuvashia: 0.1292917101780034,
  sakha_yakutia: 0.10616364274665871,
  jewish_ao: 0.08868811665665532,
}

// Названия регионов (85 регионов)
export const REGION_NAMES: Record<string, string> = {
  altai_krai: 'Алтайский край',
  krasnodar_krai: 'Краснодарский край',
  krasnoyarsk_krai: 'Красноярский край',
  primorsky_krai: 'Приморский край',
  stavropol_krai: 'Ставропольский край',
  khabarovsk_krai: 'Хабаровский край',
  amur_oblast: 'Амурская область',
  arkhangelsk_oblast: 'Архангельская область',
  astrakhan_oblast: 'Астраханская область',
  nenets_ao: 'Ненецкий автономный округ',
  belgorod_oblast: 'Белгородская область',
  bryansk_oblast: 'Брянская область',
  vladimir_oblast: 'Владимирская область',
  volgograd_oblast: 'Волгоградская область',
  vologda_oblast: 'Вологодская область',
  voronezh_oblast: 'Воронежская область',
  nizhny_novgorod_oblast: 'Нижегородская область',
  ivanovo_oblast: 'Ивановская область',
  irkutsk_oblast: 'Иркутская область',
  ingushetia: 'Республика Ингушетия',
  kaliningrad_oblast: 'Калининградская область',
  tver_oblast: 'Тверская область',
  kaluga_oblast: 'Калужская область',
  kamchatka_krai: 'Камчатский край',
  kemerovo_oblast: 'Кемеровская область',
  kirov_oblast: 'Кировская область',
  kostroma_oblast: 'Костромская область',
  crimea: 'Республика Крым',
  samara_oblast: 'Самарская область',
  kurgan_oblast: 'Курганская область',
  kursk_oblast: 'Курская область',
  spb: 'г. Санкт-Петербург',
  leningrad_oblast: 'Ленинградская область',
  lipetsk_oblast: 'Липецкая область',
  magadan_oblast: 'Магаданская область',
  moscow: 'г. Москва',
  moscow_oblast: 'Московская область',
  murmansk_oblast: 'Мурманская область',
  novgorod_oblast: 'Новгородская область',
  novosibirsk_oblast: 'Новосибирская область',
  omsk_oblast: 'Омская область',
  orenburg_oblast: 'Оренбургская область',
  orel_oblast: 'Орловская область',
  penza_oblast: 'Пензенская область',
  perm_krai: 'Пермский край',
  pskov_oblast: 'Псковская область',
  rostov_oblast: 'Ростовская область',
  ryazan_oblast: 'Рязанская область',
  saratov_oblast: 'Саратовская область',
  sakhalin_oblast: 'Сахалинская область',
  sverdlovsk_oblast: 'Свердловская область',
  smolensk_oblast: 'Смоленская область',
  sevastopol: 'г. Севастополь',
  tambov_oblast: 'Тамбовская область',
  tomsk_oblast: 'Томская область',
  tula_oblast: 'Тульская область',
  tyumen_oblast: 'Тюменская область',
  khmao: 'Ханты-Мансийский автономный округ – Югра',
  ulyanovsk_oblast: 'Ульяновская область',
  yamalo_nenets_ao: 'Ямало-Ненецкий автономный округ',
  chelyabinsk_oblast: 'Челябинская область',
  zabaykalsky_krai: 'Забайкальский край',
  chukotka_ao: 'Чукотский авт.округ',
  yaroslavl_oblast: 'Ярославская область',
  adygea: 'Республика Адыгея',
  bashkortostan: 'Республика Башкортостан',
  buryatia: 'Республика Бурятия',
  dagestan: 'Республика Дагестан',
  kabardino_balkaria: 'Кабардино-Балкарская Республика',
  altai_republic: 'Республика Алтай',
  kalmykia: 'Республика Калмыкия',
  karelia: 'Республика Карелия',
  komi: 'Республика Коми',
  mari_el: 'Республика Марий Эл',
  mordovia: 'Республика Мордовия',
  north_ossetia: 'Республика Северная Осетия-Алания',
  karachay_cherkessia: 'Карачаево-Черкесская Республика',
  tatarstan: 'Республика Татарстан',
  tuva: 'Республика Тыва',
  udmurtia: 'Удмуртская Республика',
  khakassia: 'Республика Хакасия',
  chechnya: 'Чеченская Республика',
  chuvashia: 'Чувашская Республика',
  sakha_yakutia: 'Республика Саха (Якутия)',
  jewish_ao: 'Еврейская автономная область',
}

// Веса для скоринга трудоустройства (Employment Scoring Test)
export const SCORING_WEIGHTS = {
  constant: 0.2141984549392455,
  gender: {
    male: 1.0,
    female: 0.41515971498747267,
  },
  settlement_type: {
    city: 1.0,
    village: 0.9101080303331768,
  },
  region: {
    altai_krai: 1.0,
    krasnodar_krai: 0.6395973241338996,
    moscow: 0.6199263585167778,
    spb: 0.7910777134204542,
    moscow_oblast: 0.669042966582742,
    nizhny_novgorod_oblast: 0.888670376123304,
    novosibirsk_oblast: 0.4518292552525212,
  },
  family_size: {
    '1': 1.0,
    '2': 0.8544587006420509,
    '3': 1.0031657795397888,
    '4': 0.9296183740977185,
    '5': 0.8382896696119219,
    '6': 0.8461732919967863,
    '7': 0.847170028330513,
    '8': 0.7539239845040535,
    '9': 0.979285024078923,
    '10': 0.5556311264564824,
    '11': 0.6872786205955081,
    '12': 0.21280920603052517,
    '13': 1.4212291049384058,
  },
  age: {
    '15_19': 1.0,
    '20_24': 11.896097286100106,
    '25_29': 74.19578405473189,
    '30_34': 96.62902355943548,
    '35_39': 114.95454036167561,
    '40_44': 148.66752997865376,
    '45_49': 157.95355765972843,
    '50_54': 119.18162629164809,
    '55_59': 47.18115449064516,
    '60_64': 9.896983913864728,
    '65_69': 2.2887685838516036,
    '70_74': 0.577607183361729,
    '75_79': 0.29320869865757,
    '80_plus': 0.1489498556605862,
  },
  education: {
    vocational: 1.0,
    vocational_skilled: 0.8598326898942144,
    high_school: 0.41460476733670965,
    basic: 0.29911357337878375,
    no_basic: 0.06074688884616126,
    higher: 3.783101784775002,
    bachelor: 1.004397118188909,
    specialist: 1.030918308003592,
    master: 1.2910376522815379,
  },
  professional_skills: {
    text_editing: 1.302512704238067,
    spreadsheets: 1.7701005074919822,
    media_editing: 0.89908629666158,
    presentations: 0.6299579048762336,
    messaging: 1.2160650323106195,
    device_connection: 1.0546283731885393,
    file_transfer: 1.0946876519230606,
    software_install: 1.0110042461139885,
    security: 1.0245335961933553,
    info_verification: 1.0849189728728592,
    privacy: 1.013802620172671,
    programming: 0.7875183478062073,
    other_skills: 1.0654115309026808,
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
  skill_1: 'Копирование, вставка или перемещение текста, фото-, видео-, аудиофайлов',
  skill_2: 'Набор текста и его редактирование',
  skill_3: 'Работа с электронными таблицами',
  skill_4: 'Использование программ для редактирования фото-, видео- и аудиофайлов',
  skill_5: 'Создание электронных презентаций',
  skill_6: 'Отправка SMS, электронной почты, через мессенджеры',
  skill_7: 'Подключение и установка новых устройств',
  skill_8: 'Передача файлов между устройствами, облачные хранилища',
  skill_9: 'Поиск, загрузка, установка и настройка программного обеспечения',
  skill_10: 'Создание паролей для учетных записей, защита устройства',
  skill_11: 'Проверка достоверности информации в Интернете',
  skill_12: 'Ограничение использования личных данных',
  skill_13: 'Написание программного обеспечения',
  skill_14: 'Иные действия с устройствами',
  skill_15: 'Прочие действия',
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
    '15_19': '15-19 лет',
    '20_24': '20-24 лет',
    '25_29': '25-29 лет',
    '30_34': '30-34 лет',
    '35_39': '35-39 лет',
    '40_44': '40-44 лет',
    '45_49': '45-49 лет',
    '50_54': '50-54 лет',
    '55_59': '55-59 лет',
    '60_64': '60-64 лет',
    '65_69': '65-69 лет',
    '70_74': '70-74 лет',
    '75_79': '75-79 лет',
    '80_plus': '80+ лет',
  }
  return labels[age] || age
}

function getEducationLabel(education: string): string {
  const labels: Record<string, string> = {
    no_basic: 'Не имеют основного',
    basic: 'Основное общее',
    high_school: 'Среднее общее',
    vocational: 'Среднее профессиональное',
    vocational_skilled: 'Среднее профессиональное кв',
    higher: 'Высшее профессиональное',
    bachelor: 'Бакалавриат',
    specialist: 'Специалист',
    master: 'Магистр',
  }
  return labels[education] || education
}

function getProfessionalSkillLabel(skill: string): string {
  const labels: Record<string, string> = {
    text_editing: 'Набор текста и редактирование',
    spreadsheets: 'Работа с электронными таблицами',
    media_editing: 'Редактирование фото-, видео-',
    presentations: 'Создание презентаций',
    messaging: 'Отправка через мессенджеры',
    device_connection: 'Подключение устройств',
    file_transfer: 'Передача файлов между устройствами',
    software_install: 'Поиск и установка ПО',
    security: 'Создание паролей и защита',
    info_verification: 'Проверка информации в Интернете',
    privacy: 'Ограничение личных данных',
    programming: 'Написание программного обеспечения',
    other_skills: 'Иные навыки',
  }
  return labels[skill] || skill
}
