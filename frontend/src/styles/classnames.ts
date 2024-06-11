import clsx, { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const classnames = (...names: ClassValue[]) => twMerge(clsx(...names))
