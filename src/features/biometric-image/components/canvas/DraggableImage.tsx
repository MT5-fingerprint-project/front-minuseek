import { useEffect, useState } from 'react'
import { Image as KonvaImage } from 'react-konva'

function useImage(url: string) {
  const [image, setImage] = useState<HTMLImageElement>()

  useEffect(() => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.src = url
    img.onload = () => setImage(img)
    return () => {
      img.onload = null
      setImage(undefined)
    }
  }, [url])

  return image
}

const MAX_IMAGE_SIZE = 400

type DraggableImageProps = {
  url: string
  stageSize: { width: number; height: number }
}

export default function DraggableImage({ url, stageSize }: DraggableImageProps) {
  const image = useImage(url)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)

  if (!image) return null

  const scale = Math.min(1, MAX_IMAGE_SIZE / Math.max(image.width, image.height))
  const width = image.width * scale
  const height = image.height * scale

  const centered = {
    x: Math.max(0, (stageSize.width - width) / 2),
    y: Math.max(0, (stageSize.height - height) / 2),
  }

  return (
    <KonvaImage
      image={image}
      x={position?.x ?? centered.x}
      y={position?.y ?? centered.y}
      width={width}
      height={height}
      draggable
      onDragEnd={(e) => setPosition({ x: e.target.x(), y: e.target.y() })}
    />
  )
}
