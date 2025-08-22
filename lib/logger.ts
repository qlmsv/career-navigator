// Простой логгер, совместимый с клиентом и сервером

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

class Logger {
  private isDevelopment = process.env['NODE_ENV'] === 'development'
  private isTest = process.env['NODE_ENV'] === 'test'

  private log(level: LogLevel, message: string, data?: any) {
    // В тестовом окружении не логируем
    if (this.isTest) return

    // В продакшене только info и выше
    if (!this.isDevelopment && level === 'debug') return

    const timestamp = new Date().toISOString()
    const prefix = `[${level.toUpperCase()}] ${timestamp}`

    switch (level) {
      case 'debug':
        console.log(`${prefix} ${message}`, data || '')
        break
      case 'info':
        console.info(`${prefix} ${message}`, data || '')
        break
      case 'warn':
        console.warn(`${prefix} ${message}`, data || '')
        break
      case 'error':
        console.error(`${prefix} ${message}`, data || '')
        break
    }
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data)
  }

  info(message: string, data?: any) {
    this.log('info', message, data)
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data)
  }

  error(message: string, data?: any) {
    this.log('error', message, data)
  }
}

export const logger = new Logger()
