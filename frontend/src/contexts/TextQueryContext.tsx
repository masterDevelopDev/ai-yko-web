import { FilterOrFilterGroupDto } from '@/lib/axios-client'
import { createContext } from 'react'

interface TextQueryContextValue {
  text: string

  textMatches: (s: string) => boolean

  textMatchesOrMatchesAtLeastOneChild: (f: FilterOrFilterGroupDto) => boolean
}

export const TextQueryContext = createContext<TextQueryContextValue>({
  text: '',

  textMatches: () => false,

  textMatchesOrMatchesAtLeastOneChild: () => false,
})
