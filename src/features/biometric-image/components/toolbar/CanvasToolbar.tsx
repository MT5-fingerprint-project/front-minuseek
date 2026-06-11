import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { type IconName } from '@/features/shared/icons'
import ModeButton from './ModeButton'
import ItemToolbar from './ItemToolbar'

type ToolbarMode = 'image' | 'annotation'

const IMAGE_TOOLS = [
  { icon: 'mirror', label: 'biometricImage.toolbar.tools.mirror' },
  { icon: 'rotate', label: 'biometricImage.toolbar.tools.rotation' },
  { icon: 'luminosity', label: 'biometricImage.toolbar.tools.luminosity' },
  { icon: 'contrast', label: 'biometricImage.toolbar.tools.contrast' },
  { icon: 'compare', label: 'biometricImage.toolbar.tools.invertColors'},
  { icon: 'invertColors', label: 'biometricImage.toolbar.tools.saturation' },
] as const satisfies readonly { icon: IconName; label: string }[]

const ANNOTATION_TOOLS = [
  { icon: 'palette', label: 'biometricImage.toolbar.tools.palette' },
  { icon: 'circle', label: 'biometricImage.toolbar.tools.point' },
  { icon: 'circleLine', label: 'biometricImage.toolbar.tools.pointArrow' },
  { icon: 'penTrace', label: 'biometricImage.toolbar.tools.pencil' },
] as const satisfies readonly { icon: IconName; label: string }[]

export default function CanvasToolbar() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<ToolbarMode>('image')
  const tools = mode === 'image' ? IMAGE_TOOLS : ANNOTATION_TOOLS

  return (
    <div className="flex items-center gap-3 rounded-md bg-blue-dark-1 px-3 py-2 text-white shadow-lg">
      <div className="flex items-center gap-1 rounded-sm bg-white/25 p-1">
        <ModeButton
          icon="image"
          label={t('biometricImage.toolbar.modes.image')}
          active={mode === 'image'}
          onClick={() => setMode('image')}
        />
        <ModeButton
          icon="pen"
          label={t('biometricImage.toolbar.modes.annotation')}
          active={mode === 'annotation'}
          onClick={() => setMode('annotation')}
        />
      </div>
      {tools.map(({ icon, label }) => <ItemToolbar icon={icon} label={t(label)} />)}
    </div>
  )
}
