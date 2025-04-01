export const addToDate = (
  date: Date | string,
  options: {
    year?: number
    month?: number
    day?: number
    hour?: number
    minute?: number
    second?: number
  },
): Date => {
  const d = new Date(date)

  if (options.year) d.setFullYear(d.getFullYear() + options.year)
  if (options.month) d.setMonth(d.getMonth() + options.month)
  if (options.day) d.setDate(d.getDate() + options.day)
  if (options.hour) d.setHours(d.getHours() + options.hour)
  if (options.minute) d.setMinutes(d.getMinutes() + options.minute)
  if (options.second) d.setSeconds(d.getSeconds() + options.second)

  return d
}

export const formatDate = (date: Date | string, formatStr: string): string => {
  const d = new Date(date)

  const pad = (n: number) => n.toString().padStart(2, '0')

  const replacements: Record<string, string> = {
    YYYY: d.getFullYear().toString(),
    MM: pad(d.getMonth() + 1),
    DD: pad(d.getDate()),
    HH: pad(d.getHours()),
    mm: pad(d.getMinutes()),
    ss: pad(d.getSeconds()),
  }

  return Object.entries(replacements).reduce(
    (acc, [token, value]) => acc.replace(token, value),
    formatStr,
  )
}

export const dateTimezoneOffsetAddFormat = (dateTime: Date | string, timezoneOffset: string) => {
  const splitHour = timezoneOffset ? timezoneOffset.split(':')[0] : '+09'
  const splitMinute = timezoneOffset ? timezoneOffset.split(':')[1] : '00'
  const addTimezone = addToDate(dateTime, {
    hour: Number(splitHour) + Math.ceil(new Date().getTimezoneOffset() / 60),
    minute: Number(splitMinute) + (new Date().getTimezoneOffset() % 60),
  })
  if (typeof dateTime === 'object') {
    return addTimezone
  } else if (typeof dateTime === 'string') {
    return formatDate(addTimezone, 'HH:mm:ss')
  } else {
    return ''
  }
}

export const filenameTodisplayDateFormat = (filename: string) => {
  if (!filename) return '-'
  try {
    const fileNameFilter1 = filename.replaceAll(/CAMFront_camera|\.webp/g, '')
    const fileNameFilter2 = fileNameFilter1.replaceAll('T', ' ').replaceAll('_', ':').split(':')
    const fileNameFilter3 = fileNameFilter2[3].split('+')

    const dateTime =
      fileNameFilter2[0] +
      ':' +
      fileNameFilter2[1] +
      ':' +
      fileNameFilter2[2] +
      '.' +
      fileNameFilter3[0]
    const timezoneOffset = '+' + fileNameFilter3[1] + ':' + fileNameFilter2[4]
    const resultDateTime =
      fileNameFilter1.split('T')[0] + ' ' + dateTimezoneOffsetAddFormat(dateTime, timezoneOffset)
    return resultDateTime
  } catch (error) {
    return '-'
  }
}
