import Home from './home.svg?react'
import Investigation from './investigation.svg?react'
import Information from './information.svg?react'
import Folder from "./folder.svg?react"
import DateStart from "./date-start.svg?react"

export const icons = {
  home: Home,
  investigation: Investigation,
  information: Information,
  folder: Folder,
  dateStart: DateStart
}

export type IconName = keyof typeof icons
