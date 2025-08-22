import { z } from 'zod'
import { testService } from './test-service'

const questionsData = [
  // BIG FIVE QUESTIONS - 30 total (6 per category)
  
  // EXTRAVERSION (6 questions)
  {
    id: 'bf_01',
    type: 'big_five',
    facet: 'extraversion',
    text: 'Я легко завожу новые знакомства.',
    options: [
      { text: 'Полностью согласен', score: 5 },
      { text: 'Согласен', score: 4 },
      { text: 'Нейтрально', score: 3 },
      { text: 'Не согласен', score: 2 },
      { text: 'Категорически не согласен', score: 1 },
    ],
  },
  {
    id: 'bf_02',
    type: 'big_five',
    facet: 'extraversion',
    text: 'Я чувствую себя опустошенным после общения с большим количеством людей.',
    options: [
      { text: 'Полностью согласен', score: 1 },
      { text: 'Согласен', score: 2 },
      { text: 'Нейтрально', score: 3 },
      { text: 'Не согласен', score: 4 },
      { text: 'Категорически не согласен', score: 5 },
    ],
  },
  {
    id: 'bf_03',
    type: 'big_five',
    facet: 'extraversion',
    text: 'Я предпочитаю быть в центре внимания.',
    options: [
      { text: 'Полностью согласен', score: 5 },
      { text: 'Согласен', score: 4 },
      { text: 'Нейтрально', score: 3 },
      { text: 'Не согласен', score: 2 },
      { text: 'Категорически не согласен', score: 1 },
    ],
  },
  {
    id: 'bf_04',
    type: 'big_five',
    facet: 'extraversion',
    text: 'Я энергичный и активный человек.',
    options: [
      { text: 'Полностью согласен', score: 5 },
      { text: 'Согласен', score: 4 },
      { text: 'Нейтрально', score: 3 },
      { text: 'Не согласен', score: 2 },
      { text: 'Категорически не согласен', score: 1 },
    ],
  },
  {
    id: 'bf_05',
    type: 'big_five',
    facet: 'extraversion',
    text: 'Я говорю много и быстро.',
    options: [
      { text: 'Полностью согласен', score: 5 },
      { text: 'Согласен', score: 4 },
      { text: 'Нейтрально', score: 3 },
      { text: 'Не согласен', score: 2 },
      { text: 'Категорически не согласен', score: 1 },
    ],
  },
  {
    id: 'bf_06',
    type: 'big_five',
    facet: 'extraversion',
    text: 'Я предпочитаю работать в одиночестве.',
    options: [
      { text: 'Полностью согласен', score: 1 },
      { text: 'Согласен', score: 2 },
      { text: 'Нейтрально', score: 3 },
      { text: 'Не согласен', score: 4 },
      { text: 'Категорически не согласен', score: 5 },
    ],
  },

  // AGREEABLENESS (6 questions)
  {
    id: 'bf_07',
    type: 'big_five',
    facet: 'agreeableness',
    text: 'Я сочувствую другим людям.',
    options: [
      { text: 'Полностью согласен', score: 5 },
      { text: 'Согласен', score: 4 },
      { text: 'Нейтрально', score: 3 },
      { text: 'Не согласен', score: 2 },
      { text: 'Категорически не согласен', score: 1 },
    ],
  },
  {
    id: 'bf_08',
    type: 'big_five',
    facet: 'agreeableness',
    text: 'Я склонен спорить с людьми.',
    options: [
      { text: 'Полностью согласен', score: 1 },
      { text: 'Согласен', score: 2 },
      { text: 'Нейтрально', score: 3 },
      { text: 'Не согласен', score: 4 },
      { text: 'Категорически не согласен', score: 5 },
    ],
  },
  {
    id: 'bf_09',
    type: 'big_five',
    facet: 'agreeableness',
    text: 'Мне нравится помогать другим.',
    options: [
      { text: 'Полностью согласен', score: 5 },
      { text: 'Согласен', score: 4 },
      { text: 'Нейтрально', score: 3 },
      { text: 'Не согласен', score: 2 },
      { text: 'Категорически не согласен', score: 1 },
    ],
  },
  {
    id: 'bf_10',
    type: 'big_five',
    facet: 'agreeableness',
    text: 'Я доверяю людям.',
    options: [
      { text: 'Полностью согласен', score: 5 },
      { text: 'Согласен', score: 4 },
      { text: 'Нейтрально', score: 3 },
      { text: 'Не согласен', score: 2 },
      { text: 'Категорически не согласен', score: 1 },
    ],
  },
  {
    id: 'bf_11',
    type: 'big_five',
    facet: 'agreeableness',
    text: 'Я часто критикую других.',
    options: [
      { text: 'Полностью согласен', score: 1 },
      { text: 'Согласен', score: 2 },
      { text: 'Нейтрально', score: 3 },
      { text: 'Не согласен', score: 4 },
      { text: 'Категорически не согласен', score: 5 },
    ],
  },
  {
    id: 'bf_12',
    type: 'big_five',
    facet: 'agreeableness',
    text: 'У меня мягкое сердце.',
    options: [
      { text: 'Полностью согласен', score: 5 },
      { text: 'Согласен', score: 4 },
      { text: 'Нейтрально', score: 3 },
      { text: 'Не согласен', score: 2 },
      { text: 'Категорически не согласен', score: 1 },
    ],
  },

  // CONSCIENTIOUSNESS (6 questions)
  {
    id: 'bf_13',
    type: 'big_five',
    facet: 'conscientiousness',
    text: 'Я всегда подготовлен.',
    options: [
      { text: 'Полностью согласен', score: 5 },
      { text: 'Согласен', score: 4 },
      { text: 'Нейтрально', score: 3 },
      { text: 'Не согласен', score: 2 },
      { text: 'Категорически не согласен', score: 1 },
    ],
  },
  {
    id: 'bf_14',
    type: 'big_five',
    facet: 'conscientiousness',
    text: 'Я оставляю беспорядок.',
    options: [
      { text: 'Полностью согласен', score: 1 },
      { text: 'Согласен', score: 2 },
      { text: 'Нейтрально', score: 3 },
      { text: 'Не согласен', score: 4 },
      { text: 'Категорически не согласен', score: 5 },
    ],
  },
  {
    id: 'bf_15',
    type: 'big_five',
    facet: 'conscientiousness',
    text: 'Я обращаю внимание на детали.',
    options: [
      { text: 'Полностью согласен', score: 5 },
      { text: 'Согласен', score: 4 },
      { text: 'Нейтрально', score: 3 },
      { text: 'Не согласен', score: 2 },
      { text: 'Категорически не согласен', score: 1 },
    ],
  },
  {
    id: 'bf_16',
    type: 'big_five',
    facet: 'conscientiousness',
    text: 'Я откладываю дела на потом.',
    options: [
      { text: 'Полностью согласен', score: 1 },
      { text: 'Согласен', score: 2 },
      { text: 'Нейтрально', score: 3 },
      { text: 'Не согласен', score: 4 },
      { text: 'Категорически не согласен', score: 5 },
    ],
  },
  {
    id: 'bf_17',
    type: 'big_five',
    facet: 'conscientiousness',
    text: 'Я следую расписанию.',
    options: [
      { text: 'Полностью согласен', score: 5 },
      { text: 'Согласен', score: 4 },
      { text: 'Нейтрально', score: 3 },
      { text: 'Не согласен', score: 2 },
      { text: 'Категорически не согласен', score: 1 },
    ],
  },
  {
    id: 'bf_18',
    type: 'big_five',
    facet: 'conscientiousness',
    text: 'Я ответственный человек.',
    options: [
      { text: 'Полностью согласен', score: 5 },
      { text: 'Согласен', score: 4 },
      { text: 'Нейтрально', score: 3 },
      { text: 'Не согласен', score: 2 },
      { text: 'Категорически не согласен', score: 1 },
    ],
  },

  // NEUROTICISM (6 questions)
  {
    id: 'bf_19',
    type: 'big_five',
    facet: 'neuroticism',
    text: 'Я часто испытываю стресс.',
    options: [
      { text: 'Полностью согласен', score: 5 },
      { text: 'Согласен', score: 4 },
      { text: 'Нейтрально', score: 3 },
      { text: 'Не согласен', score: 2 },
      { text: 'Категорически не согласен', score: 1 },
    ],
  },
  {
    id: 'bf_20',
    type: 'big_five',
    facet: 'neuroticism',
    text: 'Я спокоен большую часть времени.',
    options: [
      { text: 'Полностью согласен', score: 1 },
      { text: 'Согласен', score: 2 },
      { text: 'Нейтрально', score: 3 },
      { text: 'Не согласен', score: 4 },
      { text: 'Категорически не согласен', score: 5 },
    ],
  },
  {
    id: 'bf_21',
    type: 'big_five',
    facet: 'neuroticism',
    text: 'Я легко расстраиваюсь.',
    options: [
      { text: 'Полностью согласен', score: 5 },
      { text: 'Согласен', score: 4 },
      { text: 'Нейтрально', score: 3 },
      { text: 'Не согласен', score: 2 },
      { text: 'Категорически не согласен', score: 1 },
    ],
  },
  {
    id: 'bf_22',
    type: 'big_five',
    facet: 'neuroticism',
    text: 'Я часто беспокоюсь о будущем.',
    options: [
      { text: 'Полностью согласен', score: 5 },
      { text: 'Согласен', score: 4 },
      { text: 'Нейтрально', score: 3 },
      { text: 'Не согласен', score: 2 },
      { text: 'Категорически не согласен', score: 1 },
    ],
  },
  {
    id: 'bf_23',
    type: 'big_five',
    facet: 'neuroticism',
    text: 'Меня легко вывести из себя.',
    options: [
      { text: 'Полностью согласен', score: 5 },
      { text: 'Согласен', score: 4 },
      { text: 'Нейтрально', score: 3 },
      { text: 'Не согласен', score: 2 },
      { text: 'Категорически не согласен', score: 1 },
    ],
  },
  {
    id: 'bf_24',
    type: 'big_five',
    facet: 'neuroticism',
    text: 'Я уверен в себе.',
    options: [
      { text: 'Полностью согласен', score: 1 },
      { text: 'Согласен', score: 2 },
      { text: 'Нейтрально', score: 3 },
      { text: 'Не согласен', score: 4 },
      { text: 'Категорически не согласен', score: 5 },
    ],
  },

  // OPENNESS (6 questions)
  {
    id: 'bf_25',
    type: 'big_five',
    facet: 'openness',
    text: 'У меня богатое воображение.',
    options: [
      { text: 'Полностью согласен', score: 5 },
      { text: 'Согласен', score: 4 },
      { text: 'Нейтрально', score: 3 },
      { text: 'Не согласен', score: 2 },
      { text: 'Категорически не согласен', score: 1 },
    ],
  },
  {
    id: 'bf_26',
    type: 'big_five',
    facet: 'openness',
    text: 'Я люблю пробовать что-то новое.',
    options: [
      { text: 'Полностью согласен', score: 5 },
      { text: 'Согласен', score: 4 },
      { text: 'Нейтрально', score: 3 },
      { text: 'Не согласен', score: 2 },
      { text: 'Категорически не согласен', score: 1 },
    ],
  },
  {
    id: 'bf_27',
    type: 'big_five',
    facet: 'openness',
    text: 'Я любопытен.',
    options: [
      { text: 'Полностью согласен', score: 5 },
      { text: 'Согласен', score: 4 },
      { text: 'Нейтрально', score: 3 },
      { text: 'Не согласен', score: 2 },
      { text: 'Категорически не согласен', score: 1 },
    ],
  },
  {
    id: 'bf_28',
    type: 'big_five',
    facet: 'openness',
    text: 'Я ценю искусство и красоту.',
    options: [
      { text: 'Полностью согласен', score: 5 },
      { text: 'Согласен', score: 4 },
      { text: 'Нейтрально', score: 3 },
      { text: 'Не согласен', score: 2 },
      { text: 'Категорически не согласен', score: 1 },
    ],
  },
  {
    id: 'bf_29',
    type: 'big_five',
    facet: 'openness',
    text: 'Я люблю размышлять о сложных вещах.',
    options: [
      { text: 'Полностью согласен', score: 5 },
      { text: 'Согласен', score: 4 },
      { text: 'Нейтрально', score: 3 },
      { text: 'Не согласен', score: 2 },
      { text: 'Категорически не согласен', score: 1 },
    ],
  },
  {
    id: 'bf_30',
    type: 'big_five',
    facet: 'openness',
    text: 'У меня широкий круг интересов.',
    options: [
      { text: 'Полностью согласен', score: 5 },
      { text: 'Согласен', score: 4 },
      { text: 'Нейтрально', score: 3 },
      { text: 'Не согласен', score: 2 },
      { text: 'Категорически не согласен', score: 1 },
    ],
  },

  // JUNGIAN ARCHETYPE QUESTIONS - 20 total
  {
    id: 'jung_01',
    type: 'jungian_archetype',
    text: 'Когда я сталкиваюсь с проблемой, я предпочитаю:',
    options: [
      { text: 'Найти инновационное, нестандартное решение.', archetype: 'magician' },
      { text: 'Разработать четкий план и следовать ему.', archetype: 'ruler' },
      { text: 'Заботиться о тех, кого затронула проблема.', archetype: 'caregiver' },
      { text: 'Найти способ насладиться процессом решения.', archetype: 'jester' },
    ],
  },
  {
    id: 'jung_02',
    type: 'jungian_archetype',
    text: 'Моя главная цель в жизни — это:',
    options: [
      { text: 'Обрести глубокое понимание мира.', archetype: 'sage' },
      { text: 'Создать что-то вечное и прекрасное.', archetype: 'creator' },
      { text: 'Оставить мир лучшим местом, чем он был.', archetype: 'hero' },
      { text: 'Быть свободным и независимым.', archetype: 'explorer' },
    ],
  },
  {
    id: 'jung_03',
    type: 'jungian_archetype',
    text: 'В отношениях для меня важнее всего:',
    options: [
      { text: 'Глубокая эмоциональная связь и близость.', archetype: 'lover' },
      { text: 'Чувство принадлежности и общности.', archetype: 'everyman' },
      { text: 'Сохранение чистоты и простоты.', archetype: 'innocent' },
      { text: 'Взаимная поддержка и забота.', archetype: 'caregiver' },
    ],
  },
  {
    id: 'jung_04',
    type: 'jungian_archetype',
    text: 'Люди чаще всего описывают меня как:',
    options: [
      { text: 'Лидера, который берет на себя ответственность.', archetype: 'ruler' },
      { text: 'Мечтателя, который верит в лучшее.', archetype: 'innocent' },
      { text: 'Бунтаря, который идет против системы.', archetype: 'outlaw' },
      { text: 'Смельчака, который преодолевает трудности.', archetype: 'hero' },
    ],
  },
  {
    id: 'jung_05',
    type: 'jungian_archetype',
    text: 'Когда я вижу несправедливость, я:',
    options: [
      { text: 'Пытаюсь изменить правила.', archetype: 'outlaw' },
      { text: 'Использую свои знания, чтобы объяснить ситуацию.', archetype: 'sage' },
      { text: 'Создаю произведение искусства, чтобы выразить свои чувства.', archetype: 'creator' },
      { text: 'Превращаю ситуацию в шутку, чтобы разрядить обстановку.', archetype: 'jester' },
    ],
  },
  {
    id: 'jung_06',
    type: 'jungian_archetype',
    text: 'Мой идеальный отпуск — это:',
    options: [
      { text: 'Путешествие в неизведанные земли.', archetype: 'explorer' },
      { text: 'Романтический уикенд с любимым человеком.', archetype: 'lover' },
      { text: 'Посещение мастер-класса для создания чего-то нового.', archetype: 'creator' },
      { text: 'Волонтерская поездка, чтобы помогать другим.', archetype: 'caregiver' },
    ],
  },
  {
    id: 'jung_07',
    type: 'jungian_archetype',
    text: 'Я чувствую себя наиболее живым, когда:',
    options: [
      { text: 'Я контролирую ситуацию и все идет по плану.', archetype: 'ruler' },
      { text: 'Я открываю для себя что-то новое и удивительное.', archetype: 'explorer' },
      { text: 'Я вижу, как моя идея воплощается в жизнь.', archetype: 'magician' },
      { text: 'Я являюсь частью дружной компании.', archetype: 'everyman' },
    ],
  },
  {
    id: 'jung_08',
    type: 'jungian_archetype',
    text: 'Что для вас самое страшное?',
    options: [
      { text: 'Быть как все, потерять индивидуальность.', archetype: 'outlaw' },
      { text: 'Потерять контроль и стабильность.', archetype: 'ruler' },
      { text: 'Быть обманутым или введенным в заблуждение.', archetype: 'sage' },
      { text: 'Причинить кому-то боль.', archetype: 'innocent' },
    ],
  },
  {
    id: 'jung_09',
    type: 'jungian_archetype',
    text: 'В свободное время я предпочитаю:',
    options: [
      { text: 'Читать, учиться, расширять кругозор.', archetype: 'sage' },
      { text: 'Проводить время с друзьями и семьей.', archetype: 'everyman' },
      { text: 'Преодолевать физические или интеллектуальные вызовы.', archetype: 'hero' },
      { text: 'Наслаждаться моментом и веселиться.', archetype: 'jester' },
    ],
  },
  {
    id: 'jung_10',
    type: 'jungian_archetype',
    text: 'Мой девиз:',
    options: [
      { text: '"Свобода превыше всего".', archetype: 'outlaw' },
      { text: '"Знание — сила".', archetype: 'sage' },
      { text: '"Где есть воля, есть и путь".', archetype: 'hero' },
      { text: '"Любовь спасет мир".', archetype: 'lover' },
    ],
  },
  {
    id: 'jung_11',
    type: 'jungian_archetype',
    text: 'Если бы я мог обладать сверхспособностью, это была бы:',
    options: [
      { text: 'Способность исцелять.', archetype: 'caregiver' },
      { text: 'Способность воплощать мечты в реальность.', archetype: 'magician' },
      { text: 'Невероятная сила и выносливость.', archetype: 'hero' },
      { text: 'Способность понимать все языки мира.', archetype: 'explorer' },
    ],
  },
  {
    id: 'jung_12',
    type: 'jungian_archetype',
    text: 'Я верю, что:',
    options: [
      { text: 'В каждом человеке есть что-то хорошее.', archetype: 'innocent' },
      { text: 'Правила созданы, чтобы их нарушать.', archetype: 'outlaw' },
      { text: 'Порядок — залог успеха.', archetype: 'ruler' },
      { text: 'Воображение может изменить мир.', archetype: 'creator' },
    ],
  },
  {
    id: 'jung_13',
    type: 'jungian_archetype',
    text: 'В команде я обычно:',
    options: [
      { text: 'Тот, кто генерирует идеи.', archetype: 'creator' },
      { text: 'Тот, кто всех поддерживает и ободряет.', archetype: 'caregiver' },
      { text: 'Тот, кто следит за весельем и хорошим настроением.', archetype: 'jester' },
      { text: 'Тот, кто стремится быть обычным участником, как все.', archetype: 'everyman' },
    ],
  },
  {
    id: 'jung_14',
    type: 'jungian_archetype',
    text: 'Моя самая сильная сторона — это:',
    options: [
      { text: 'Моя страсть и преданность.', archetype: 'lover' },
      { text: 'Моя способность находить истину.', archetype: 'sage' },
      { text: 'Моя смелость и решительность.', archetype: 'hero' },
      { text: 'Моя способность видеть скрытые возможности.', archetype: 'magician' },
    ],
  },
  {
    id: 'jung_15',
    type: 'jungian_archetype',
    text: 'Я восхищаюсь людьми, которые:',
    options: [
      { text: 'Живут полной жизнью и не боятся рисковать.', archetype: 'explorer' },
      { text: 'Посвящают свою жизнь помощи другим.', archetype: 'caregiver' },
      { text: 'Создают стабильность и процветание.', archetype: 'ruler' },
      { text: 'Сохраняют оптимизм и веру в добро.', archetype: 'innocent' },
    ],
  },
  {
    id: 'jung_16',
    type: 'jungian_archetype',
    text: 'Что из этого лучше всего описывает ваш подход к работе?',
    options: [
      { text: 'Я ищу проекты, которые бросают мне вызов.', archetype: 'hero' },
      { text: 'Мне нравится работа, где я могу творить и самовыражаться.', archetype: 'creator' },
      { text: 'Я предпочитаю быть частью команды и вносить свой вклад.', archetype: 'everyman' },
      { text: 'Я хочу, чтобы моя работа приносила людям радость.', archetype: 'jester' },
    ],
  },
  {
    id: 'jung_17',
    type: 'jungian_archetype',
    text: 'Какое окружение вас вдохновляет?',
    options: [
      { text: 'Гармоничное и красивое, полное любви.', archetype: 'lover' },
      { text: 'Дикое и неизведанное, полное приключений.', archetype: 'explorer' },
      { text: 'Тихое и уединенное, где можно размышлять.', archetype: 'sage' },
      { text: 'Полное тайн и загадок, где возможно все.', archetype: 'magician' },
    ],
  },
  {
    id: 'jung_18',
    type: 'jungian_archetype',
    text: 'Я стремлюсь к:',
    options: [
      { text: 'Разрушению старых порядков, чтобы построить что-то новое.', archetype: 'outlaw' },
      { text: 'Созданию наследия, которое переживет меня.', archetype: 'ruler' },
      { text: 'Простому, счастливому и безопасному существованию.', archetype: 'innocent' },
      { text: 'Гармонии с собой и миром.', archetype: 'lover' },
    ],
  },
  {
    id: 'jung_19',
    type: 'jungian_archetype',
    text: 'Мой стиль общения:',
    options: [
      { text: 'Прямой и честный, я говорю то, что думаю.', archetype: 'everyman' },
      { text: 'Вдохновляющий и дальновидный, я вижу потенциал.', archetype: 'magician' },
      { text: 'Заботливый и сопереживающий, я умею слушать.', archetype: 'caregiver' },
      { text: 'Остроумный и игривый, я люблю смешить людей.', archetype: 'jester' },
    ],
  },
  {
    id: 'jung_20',
    type: 'jungian_archetype',
    text: 'Что важнее: свобода или безопасность?',
    options: [
      { text: 'Свобода. Без нее жизнь не имеет смысла.', archetype: 'explorer' },
      { text: 'Безопасность. Она дает основу для всего остального.', archetype: 'ruler' },
      { text: 'Свобода нарушать правила ради высшей цели.', archetype: 'outlaw' },
      { text: 'Безопасность и счастье для всех.', archetype: 'innocent' },
    ],
  },
]

const answerSchema = z.object({
  questionId: z.string(),
  type: z.enum(['big_five', 'jungian_archetype']),
  value: z.union([z.number(), z.string()]),
})

type Answer = z.infer<typeof answerSchema>

const bigFiveResultSchema = z.object({
  extraversion: z.number(),
  agreeableness: z.number(),
  conscientiousness: z.number(),
  neuroticism: z.number(),
  openness: z.number(),
})

type BigFiveResult = z.infer<typeof bigFiveResultSchema>

const jungianResultSchema = z.record(z.string(), z.number())

type JungianResult = z.infer<typeof jungianResultSchema>

export class TestEngine {
  private questions: any[]
  private answers: Answer[] = []
  private currentQuestionIndex: number = 0
  private userId: string | null = null

  constructor(userId?: string) {
    this.userId = userId || null
    this.questions = questionsData
    console.log('TestEngine: Constructor called with userId:', userId)
    console.log('TestEngine: Questions loaded:', this.questions.length)
  }

  // Загрузка сохраненного прогресса
  async loadSavedProgress(): Promise<boolean> {
    if (!this.userId) {
      console.log('TestEngine: No userId, cannot load progress')
      return false
    }

    try {
      console.log('TestEngine: Loading saved progress for user:', this.userId)
      
      const progress = await testService.loadProgress(this.userId)
      console.log('TestEngine: Loaded progress from DB:', progress)
      
      if (progress && progress.answers && progress.answers.length > 0) {
        // Восстанавливаем прогресс если есть ответы, независимо от is_completed
        this.currentQuestionIndex = progress.current_question_index
        this.answers = progress.answers || []
        
        console.log('TestEngine: Restored test state:', {
          currentIndex: this.currentQuestionIndex,
          answersCount: this.answers.length,
          answers: this.answers,
          isCompleted: progress.is_completed
        })
        return true
      } else {
        console.log('TestEngine: No progress with answers found')
        return false
      }
    } catch (error) {
      console.error('TestEngine: Failed to load progress:', error)
      return false
    }
  }

  // Сохранение прогресса
  async saveProgress(): Promise<void> {
    if (!this.userId) {
      console.log('TestEngine: No userId, skipping progress save')
      return
    }

    try {
      console.log('TestEngine: Saving progress:', {
        userId: this.userId,
        currentIndex: this.currentQuestionIndex,
        answersCount: this.answers.length,
        answers: this.answers
      })

      await testService.saveProgress(
        this.userId,
        this.currentQuestionIndex,
        this.answers
      )
      console.log('TestEngine: Progress saved successfully:', {
        currentIndex: this.currentQuestionIndex,
        answersCount: this.answers.length
      })
    } catch (error) {
      console.error('TestEngine: Failed to save progress:', error)
      // Не бросаем ошибку дальше, чтобы не прерывать тест
    }
  }

  // Сохранение результатов
  async saveResults(
    bigFiveScores: BigFiveResult,
    dominantArchetype: string,
    aiAnalysis: any,
    analysisTime: number
  ): Promise<string | null> {
    if (!this.userId) return null

    try {
      const resultId = await testService.saveResults(
        this.userId,
        bigFiveScores,
        dominantArchetype,
        this.answers,
        aiAnalysis,
        analysisTime
      )
      console.log('TestEngine: Results saved with ID:', resultId)
      return resultId
    } catch (error) {
      console.error('TestEngine: Failed to save results:', error)
      return null
    }
  }

  // Очистка прогресса теста
  async clearProgress(): Promise<void> {
    if (!this.userId) return

    try {
      await testService.clearProgress(this.userId)
      this.currentQuestionIndex = 0
      this.answers = []
      console.log('TestEngine: Progress cleared')
    } catch (error) {
      console.error('TestEngine: Failed to clear progress:', error)
    }
  }

  // Начать новый тест (очистить прогресс и сбросить состояние)
  async startNewTest(): Promise<void> {
    if (!this.userId) return

    try {
      // Сбрасываем состояние
      this.currentQuestionIndex = 0
      this.answers = []
      
      // Очищаем старый прогресс или создаем новый
      try {
        await testService.clearProgress(this.userId)
      } catch (error) {
        // Если записи нет, создаем новую
        await testService.createProgress(this.userId)
      }
      
      console.log('TestEngine: New test started')
    } catch (error) {
      console.error('TestEngine: Failed to start new test:', error)
    }
  }

  // Возобновить тест с сохраненного прогресса
  async resumeTest(savedQuestionIndex: number, savedAnswers: Record<string, number | string>): Promise<void> {
    if (!this.userId) {
      throw new Error('No userId provided')
    }

    try {
      console.log('TestEngine: Resuming test with:', { savedQuestionIndex, savedAnswers })
      
      // Восстанавливаем состояние
      this.currentQuestionIndex = savedQuestionIndex
      this.answers = Object.entries(savedAnswers).map(([questionId, value]) => {
        const question = this.questions.find((q) => q.id === questionId)
        return {
          questionId,
          type: question?.type as 'big_five' | 'jungian_archetype' || 'big_five',
          value,
        }
      })
      
      console.log('TestEngine: Test resumed successfully:', {
        currentIndex: this.currentQuestionIndex,
        answersCount: this.answers.length,
        answers: this.answers
      })
    } catch (error) {
      console.error('TestEngine: Failed to resume test:', error)
      throw error
    }
  }

  public async loadQuestions() {
    if (this.questions.length > 0) return // Загружаем только один раз

    this.questions = questionsData
    this.questions.sort(() => Math.random() - 0.5) // Перемешиваем
  }

  public startTest() {
    this.currentQuestionIndex = 0
    this.answers = []
  }

  public getCurrentQuestion() {
    if (this.isTestFinished()) {
      return null
    }
    return this.questions[this.currentQuestionIndex]
  }

  public answerQuestion(questionId: string, value: number | string) {
    const question = this.questions.find((q) => q.id === questionId)
    if (!question || this.isTestFinished()) {
      console.warn('Cannot answer question:', { questionId, isFinished: this.isTestFinished() })
      return
    }

    console.log('TestEngine: Answering question:', { 
      questionId, 
      value, 
      type: question.type,
      questionText: question.text,
      currentIndex: this.currentQuestionIndex,
      totalQuestions: this.questions.length
    })

    this.answers.push({
      questionId,
      type: question.type as 'big_five' | 'jungian_archetype',
      value,
    })

    this.currentQuestionIndex++
    console.log('TestEngine: Updated test state:', { 
      currentIndex: this.currentQuestionIndex, 
      totalQuestions: this.questions.length,
      answersCount: this.answers.length,
      lastAnswer: this.answers[this.answers.length - 1]
    })
  }

  public getProgress(): number {
    return (this.currentQuestionIndex / this.questions.length) * 100
  }

  public isTestFinished(): boolean {
    return this.currentQuestionIndex >= this.questions.length
  }

  public getResults() {
    if (!this.isTestFinished()) {
      console.warn('Test not finished, cannot get results')
      return null
    }

    console.log('Getting results with answers:', this.answers.length)

    const bigFiveAnswers = this.answers.filter((a) => a.type === 'big_five')
    const jungianAnswers = this.answers.filter((a) => a.type === 'jungian_archetype')

    console.log('Big Five answers:', bigFiveAnswers.length)
    console.log('Jungian answers:', jungianAnswers.length)

    const bigFiveResult: BigFiveResult = this.calculateBigFive(bigFiveAnswers)
    const jungianResult: JungianResult = this.calculateJungian(jungianAnswers)

    const dominantArchetype = this.getDominantArchetype(jungianResult)

    console.log('Results calculated:', { bigFiveResult, jungianResult, dominantArchetype })

    return {
      bigFive: bigFiveResult,
      jungian: jungianResult,
      dominantArchetype,
      answers: this.answers,
    }
  }

  private calculateBigFive(answers: Answer[]): BigFiveResult {
    const scores = {
      extraversion: { total: 0, count: 0 },
      agreeableness: { total: 0, count: 0 },
      conscientiousness: { total: 0, count: 0 },
      neuroticism: { total: 0, count: 0 },
      openness: { total: 0, count: 0 },
    }

    answers.forEach((answer) => {
      const question = this.questions.find((q) => q.id === answer.questionId)
      if (question && question.type === 'big_five') {
        const facet = question.facet as keyof typeof scores
        if (typeof answer.value === 'number' && scores[facet]) {
          scores[facet].total += answer.value
          scores[facet].count++
        }
      }
    })

    const result: BigFiveResult = {
      extraversion: scores.extraversion.count > 0 ? (scores.extraversion.total / (scores.extraversion.count * 5)) * 100 : 50,
      agreeableness: scores.agreeableness.count > 0 ? (scores.agreeableness.total / (scores.agreeableness.count * 5)) * 100 : 50,
      conscientiousness: scores.conscientiousness.count > 0 ? (scores.conscientiousness.total / (scores.conscientiousness.count * 5)) * 100 : 50,
      neuroticism: scores.neuroticism.count > 0 ? (scores.neuroticism.total / (scores.neuroticism.count * 5)) * 100 : 50,
      openness: scores.openness.count > 0 ? (scores.openness.total / (scores.openness.count * 5)) * 100 : 50,
    }

    return Object.entries(result).reduce((acc, [key, value]) => {
      acc[key as keyof BigFiveResult] = Math.round(value)
      return acc
    }, {} as BigFiveResult)
  }

  private calculateJungian(answers: Answer[]): JungianResult {
    const archetypes: { [key: string]: number } = {}
    answers.forEach((answer) => {
      if (typeof answer.value === 'string') {
        archetypes[answer.value] = (archetypes[answer.value] || 0) + 1
      }
    })
    return archetypes
  }

  private getDominantArchetype(result: JungianResult): string {
    const keys = Object.keys(result)
    if (keys.length === 0) {
      return 'sage' // Default archetype if no answers
    }
    return keys.reduce((a, b) => (result[a]! > result[b]! ? a : b))
  }
}
