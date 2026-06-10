import { forwardRef } from 'react'
import type { SVGProps } from 'react'
import { icons, type IconName } from './registry'

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName
  color?: string
  size?: number
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ name, color = 'var(--color-blue-dark-1)', size = 24, style, ...props }, ref) => {
    const Svg = icons[name]
    return <Svg ref={ref} width={size} height={size} style={{ color, ...style }} {...props} />
  }
)

Icon.displayName = 'Icon'
