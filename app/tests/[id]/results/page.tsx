import { createClient } from '@/lib/supabase/server'
     2 import { notFound } from 'next/navigation'
     3 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
     4 import { CheckCircle, ArrowLeft, TrendingUp, Star, Check } from 'lucide-react'
     5 import Link from 'next/link'
     6 import { Button } from '@/components/ui/button'
     7 import { Progress } from '@/components/ui/progress'
     8 
     9 async function getResponseDetails(responseId: string, userId: string) {
    10   const supabase = createClient()
    11   // Ищем в таблице test_responses, а не test_attempts
    12   const { data, error } = await supabase
    13     .from('test_responses')
    14     .select(
    15       `
    16       *,
    17       tests (
    18         title,
    19         description
    20       )
    21     `
    22     )
    23     .eq('id', responseId)
    24     .eq('user_identifier', userId) // Проверяем по user_identifier
    25     .single()
    26 
    27   if (error) {
    28     console.error('Error fetching response details:', error)
    29     return null
    30   }
    31   return data
    32 }
    33 
    34 // Компонент для отображения шкалы конструкта
    35 function ConstructScore({ name, value }: { name: string; value: number }) {
    36   const percentage = (value / 5) * 100; // Предполагаем, что средний балл по шкале от 1 до 5
    37   return (
    38     <div className="space-y-1">
    39       <div className="flex justify-between items-center text-sm">
    40         <span className="font-medium">{name}</span>
    41         <span className="text-muted-foreground">{value.toFixed(2)} / 5.00</span>
    42       </div>
    43       <Progress value={percentage} />
    44     </div>
    45   )
    46 }
    47 
    48 
    49 export default async function TestResultPage({ params }: { params: { id: string, attemptId: string } }) {
    50   const supabase = createClient()
    51   const { data: { user } } = await supabase.auth.getUser()
    52 
    53   if (!user) {
    54     notFound()
    55   }
    56 
    57   // params.attemptId теперь является response_id
    58   const response = await getResponseDetails(params.attemptId, user.id)
    59 
    60   if (!response || !response.tests) {
    61     notFound()
    62   }
    63 
    64   const test = response.tests
    65   const results = response.results_data as any || {}
    66   const constructs = results.constructs || {}
    67 
    68   return (
    69     <div className="min-h-screen bg-background">
    70       <header className="border-b">
    71         <div className="container mx-auto px-6 py-4">
    72           <Button variant="ghost" asChild>
    73             <Link href={`/tests/${params.id}`}>
    74               <ArrowLeft className="h-4 w-4 mr-2" />
    75               Назад к тесту
    76             </Link>
    77           </Button>
    78         </div>
    79       </header>
    80 
    81       <main className="container mx-auto px-4 py-12">
    82         <div className="max-w-2xl mx-auto text-center">
    83           <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
    84           <h1 className="text-3xl font-bold">Тест «{test.title}» завершен!</h1>
    85           <p className="text-muted-foreground mt-2">Спасибо за участие. Вот ваш результат.</p>
    86         </div>
    87 
    88         <div className="max-w-2xl mx-auto mt-8 grid gap-8">
    89           <Card>
    90             <CardHeader>
    91               <CardTitle className="flex items-center gap-2">
    92                 <TrendingUp className="h-5 w-5" />
    93                 Общий результат
    94               </CardTitle>
    95             </CardHeader>
    96             <CardContent className="space-y-2">
    97               <div className="text-center">
    98                 <p className="text-sm text-muted-foreground">Процент правильных ответов</p>
    99                 <p className="text-6xl font-bold">{results.percentage?.toFixed(1) || '0.0'}%</p>
   100               </div>
   101                <div className="text-center text-sm text-muted-foreground">
   102                 (Набрано {results.totalScore?.toFixed(1)} из {results.maxScore?.toFixed(1)} возможных баллов)
   103               </div>
   104             </CardContent>
   105           </Card>
   106 
   107           {Object.keys(constructs).length > 0 && (
   108             <Card>
   109               <CardHeader>
   110                 <CardTitle className="flex items-center gap-2">
   111                   <Star className="h-5 w-5" />
   112                   Результаты по конструктам
   113                 </CardTitle>
   114               </CardHeader>
   115               <CardContent className="space-y-4">
   116                 {Object.entries(constructs).map(([name, value]) => (
   117                   <ConstructScore key={name} name={name} value={value as number} />
   118                 ))}
   119               </CardContent>
   120             </Card>
   121           )}
   122 
   123           <div className="mt-4 text-center">
   124             <Button asChild size="lg">
   125               <Link href="/admin">Перейти в панель управления</Link>
   126             </Button>
   127           </div>
   128         </div>
   129       </main>
   130     </div>
   131   )
   132 }