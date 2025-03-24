/* eslint-disable @typescript-eslint/no-explicit-any */
import AES from 'crypto-js/aes'
import ENC_UTF8 from 'crypto-js/enc-utf8'

export const getLocalToken = () =>
  localStorage.getItem('token') ? localStorage.getItem('token') : null
export const saveLocalToken = (token: string) => localStorage.setItem('token', token)
export const removeLocalToken = () => localStorage.removeItem('token')

export const getLocalUserInfo = () => {
  const encUserInfo = localStorage.getItem('userInfo')
  if (encUserInfo) {
    const decryptedText = AES.decrypt(
      encUserInfo,
      'Z/WYIOx0kGxkfPnv0u6ZnDv9ELgNjph4UY6HqNdh8zY=',
    ).toString(ENC_UTF8)
    const userInfo = JSON.parse(decryptedText)
    return userInfo
  } else {
    return null
  }
}
export const saveLocalUserInfo = (userInfo: any) => {
  const jsonUserInfo = JSON.stringify(userInfo)
  const encUserInfo = CryptoJS.AES.encrypt(
    jsonUserInfo,
    'Z/WYIOx0kGxkfPnv0u6ZnDv9ELgNjph4UY6HqNdh8zY=',
  ).toString()
  localStorage.setItem('userInfo', encUserInfo)
}
export const removeLocalUserInfo = () => localStorage.removeItem('userInfo')

export const getTimezoneOffset = () =>
  localStorage.getItem('timezoneOffset') ? localStorage.getItem('timezoneOffset') : '+09:00'
export const saveTimezoneOffset = (timezoneOffset: string) =>
  localStorage.setItem('timezoneOffset', timezoneOffset)
export const removeTimezoneOffset = () => localStorage.removeItem('timezoneOffset')

export const getUserLocale = () => localStorage.getItem('locale') ?? 'en-US'
export const saveUserLocale = (locale: string) => localStorage.setItem('locale', locale)
export const removeUserLocale = () => localStorage.removeItem('locale')

export const getDeptIds = () => localStorage.getItem('dept_ids') ?? ''
export const saveDeptIds = (deptIds: any) => localStorage.setItem('dept_ids', deptIds)
export const removeDeptIds = () => localStorage.removeItem('dept_ids')

export const getCustomId = () => localStorage.getItem('custom_id') ?? ''
export const saveCustomId = (customId: string) => localStorage.setItem('custom_id', customId)
export const removeCustomId = () => localStorage.removeItem('custom_id')
