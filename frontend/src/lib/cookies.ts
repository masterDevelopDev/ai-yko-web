const checkClientSide = () => {
  if (typeof window === 'undefined') {
    throw new Error('This function should never be used server-side')
  }
}

export function getCookie(name: string) {
  checkClientSide()
  var nameEQ = name + '='
  var ca = document.cookie.split(';')
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

export function setCookie(name: string, value: string, days: number) {
  checkClientSide()
  var expires = ''
  if (days) {
    var date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    expires = '; expires=' + date.toUTCString()
  }
  document.cookie = name + '=' + (value || '') + expires + '; path=/'
}

export function removeCookie(name: string) {
  checkClientSide()
  document.cookie = name + '=; Max-Age=-99999999;'
}

export const saveTokens = ({
  accessToken,
  refreshToken,
}: {
  accessToken: string
  refreshToken: string
}) => {
  setCookie('accessToken', accessToken, 0.1)
  setCookie('refreshToken', refreshToken, 1)
}

export const removeTokens = () => {
  removeCookie('accessToken')
  removeCookie('refreshToken')
}
