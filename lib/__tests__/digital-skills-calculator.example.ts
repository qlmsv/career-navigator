/**
 * Пример использования калькулятора цифровых навыков
 * Этот файл демонстрирует, как работают алгоритмы расчета
 */

import { calculateFullResults } from '../digital-skills-calculator'

// Пример 1: Пользователь с высокими навыками из Москвы
const highSkillsUser = {
  // Цифровые навыки (12 из 15)
  skill_1: 'yes', // Копирование файлов
  skill_2: 'yes', // Редактирование текста
  skill_3: 'yes', // Работа с таблицами
  skill_4: 'yes', // Редактирование видео/фото
  skill_5: 'yes', // Презентации
  skill_6: 'yes', // Мессенджеры
  skill_7: 'yes', // Подключение устройств
  skill_8: 'yes', // Передача файлов
  skill_9: 'yes', // Установка ПО
  skill_10: 'yes', // Безопасные пароли
  skill_11: 'no', // Проверка информации
  skill_12: 'yes', // Ограничение данных
  skill_13: 'yes', // Программирование
  skill_14: 'yes', // Онлайн-покупки
  skill_15: 'no', // Другие действия

  // Скоринг трудоустройства
  gender: 'male',
  settlement_type: 'city',
  region: 'moscow',
  family_size: '2',
  age: '26_30',
  education: 'bachelor',
  professional_skills: ['tech', 'analytics', 'project_management'],
}

// Пример 2: Пользователь с базовыми навыками из региона
const basicSkillsUser = {
  // Цифровые навыки (5 из 15)
  skill_1: 'yes', // Копирование файлов
  skill_2: 'yes', // Редактирование текста
  skill_3: 'no', // Работа с таблицами
  skill_4: 'no', // Редактирование видео/фото
  skill_5: 'no', // Презентации
  skill_6: 'yes', // Мессенджеры
  skill_7: 'no', // Подключение устройств
  skill_8: 'yes', // Передача файлов
  skill_9: 'no', // Установка ПО
  skill_10: 'yes', // Безопасные пароли
  skill_11: 'no', // Проверка информации
  skill_12: 'no', // Ограничение данных
  skill_13: 'no', // Программирование
  skill_14: 'no', // Онлайн-покупки
  skill_15: 'no', // Другие действия

  // Скоринг трудоустройства
  gender: 'female',
  settlement_type: 'village',
  region: 'kaluga',
  family_size: '4',
  age: '41_45',
  education: 'vocational',
  professional_skills: ['communication'],
}

// Рассчитываем результаты
console.log('═══════════════════════════════════════════════════════════════')
console.log('  ПРИМЕР 1: Пользователь с высокими навыками (Москва)')
console.log('═══════════════════════════════════════════════════════════════')

const results1 = calculateFullResults(highSkillsUser)

console.log('\n📊 Индекс цифровых навыков:')
console.log(`   Индекс: ${results1.digitalSkills.skillIndex.toFixed(4)}`)
console.log(`   Среднее по региону: ${results1.digitalSkills.regionalAverage.toFixed(4)}`)
console.log(`   Разница: ${results1.digitalSkills.difference >= 0 ? '+' : ''}${results1.digitalSkills.difference.toFixed(4)}`)
console.log(`   Процентиль: ${results1.digitalSkills.percentile.toFixed(1)}%`)

console.log('\n💼 Скоринг трудоустройства:')
console.log(`   Вероятность: ${results1.employmentScoring.probabilityPercent.toFixed(2)}%`)
console.log(`   Raw Score: ${results1.employmentScoring.rawScore.toFixed(2)}`)

console.log('\n🎯 Навыки (владеет):')
results1.digitalSkills.skillsBreakdown
  .filter((s) => s.hasSkill)
  .slice(0, 5)
  .forEach((skill) => {
    console.log(`   ✓ ${skill.label} (вес: ${skill.weight.toFixed(4)})`)
  })

console.log('\n═══════════════════════════════════════════════════════════════')
console.log('  ПРИМЕР 2: Пользователь с базовыми навыками (Калуга)')
console.log('═══════════════════════════════════════════════════════════════')

const results2 = calculateFullResults(basicSkillsUser)

console.log('\n📊 Индекс цифровых навыков:')
console.log(`   Индекс: ${results2.digitalSkills.skillIndex.toFixed(4)}`)
console.log(`   Среднее по региону: ${results2.digitalSkills.regionalAverage.toFixed(4)}`)
console.log(`   Разница: ${results2.digitalSkills.difference >= 0 ? '+' : ''}${results2.digitalSkills.difference.toFixed(4)}`)
console.log(`   Процентиль: ${results2.digitalSkills.percentile.toFixed(1)}%`)

console.log('\n💼 Скоринг трудоустройства:')
console.log(`   Вероятность: ${results2.employmentScoring.probabilityPercent.toFixed(2)}%`)
console.log(`   Raw Score: ${results2.employmentScoring.rawScore.toFixed(2)}`)

console.log('\n🎯 Навыки (владеет):')
results2.digitalSkills.skillsBreakdown
  .filter((s) => s.hasSkill)
  .forEach((skill) => {
    console.log(`   ✓ ${skill.label} (вес: ${skill.weight.toFixed(4)})`)
  })

console.log('\n📈 Рекомендации для развития (топ-3):')
results2.digitalSkills.skillsBreakdown
  .filter((s) => !s.hasSkill)
  .sort((a, b) => b.weight - a.weight)
  .slice(0, 3)
  .forEach((skill, index) => {
    console.log(`   ${index + 1}. ${skill.label} (потенциал: +${skill.weight.toFixed(4)})`)
  })

console.log('\n═══════════════════════════════════════════════════════════════')
console.log('  СРАВНЕНИЕ РЕЗУЛЬТАТОВ')
console.log('═══════════════════════════════════════════════════════════════')

console.log('\n                      Пользователь 1    Пользователь 2')
console.log('─────────────────────────────────────────────────────────────')
console.log(
  `Индекс навыков:       ${results1.digitalSkills.skillIndex.toFixed(4)}            ${results2.digitalSkills.skillIndex.toFixed(4)}`,
)
console.log(
  `Вероятность найма:    ${results1.employmentScoring.probabilityPercent.toFixed(2)}%             ${results2.employmentScoring.probabilityPercent.toFixed(2)}%`,
)
console.log(
  `Регион:               ${results1.regionName.padEnd(20)} ${results2.regionName}`,
)

console.log('\n═══════════════════════════════════════════════════════════════')
