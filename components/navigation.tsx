import Link from 'next/link'
import { useAuth } from './auth-provider'
import { Button } from './ui/button'
import { BarChart3, Home, LogOut, User, History } from 'lucide-react'

export default function Navigation() {
  const { user, signOut } = useAuth()

  return (
    <nav className="bg-white/10 backdrop-blur-sm border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-purple-400" />
              <span className="text-xl font-bold text-white">Evolv Platform</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-white hover:bg-white/10">
                    <Home className="h-4 w-4 mr-2" />
                    Дашборд
                  </Button>
                </Link>
                
                <Link href="/ai-assistant">
                  <Button variant="ghost" className="text-white hover:bg-white/10">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Тест
                  </Button>
                </Link>

                <Link href="/test-history">
                  <Button variant="ghost" className="text-white hover:bg-white/10">
                    <History className="h-4 w-4 mr-2" />
                    История
                  </Button>
                </Link>

                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-white" />
                  <span className="text-white text-sm">
                    {user.user_metadata?.['name'] || user.email}
                  </span>
                </div>

                <Button
                  onClick={signOut}
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Выйти
                </Button>
              </>
            ) : (
              <Link href="/auth">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600">
                  Войти
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
