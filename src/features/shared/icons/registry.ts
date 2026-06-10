import Home from './home.svg?react'
import Investigation from './investigation.svg?react'
import Information from './information.svg?react'

export const icons = {
  home: Home,
  investigation: Investigation,
  information: Information,
}

export type IconName = keyof typeof icons
