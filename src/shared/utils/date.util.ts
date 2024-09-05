import { parse, format } from 'date-fns'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class DateUtils {
  static parseDate(dateString: string, formatString: string = 'dd/MM/yyyy'): Date {
    return parse(dateString, formatString, new Date())
  }

  static formatDate(date: Date, formatString: string = 'dd/MM/yyyy'): string {
    return format(date, formatString)
  }
}

export default DateUtils
