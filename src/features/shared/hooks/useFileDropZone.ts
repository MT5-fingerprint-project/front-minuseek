import { useEffect, useRef, useState } from 'react'

type UseFileDropZoneOptions = {
  acceptedMimeTypes: readonly string[]
  onFilesAccepted: (files: File[]) => void
  onFilesRejected?: (files: File[]) => void
  enabled?: boolean
}

function carriesFiles(dataTransfer: DataTransfer | null) {
  return dataTransfer?.types.includes('Files') ?? false
}

let guardedZoneCount = 0

function refuseFileDropOutsideZones(event: DragEvent) {
  if (!carriesFiles(event.dataTransfer)) return
  if (!event.defaultPrevented && event.dataTransfer) event.dataTransfer.dropEffect = 'none'
  event.preventDefault()
}

function useWindowFileDropGuard() {
  useEffect(() => {
    guardedZoneCount += 1
    if (guardedZoneCount === 1) {
      window.addEventListener('dragover', refuseFileDropOutsideZones)
      window.addEventListener('drop', refuseFileDropOutsideZones)
    }
    return () => {
      guardedZoneCount -= 1
      if (guardedZoneCount === 0) {
        window.removeEventListener('dragover', refuseFileDropOutsideZones)
        window.removeEventListener('drop', refuseFileDropOutsideZones)
      }
    }
  }, [])
}


export function useFileDropZone({
  acceptedMimeTypes,
  onFilesAccepted,
  onFilesRejected,
  enabled = true,
}: UseFileDropZoneOptions) {
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const enteredDepth = useRef(0)

  useWindowFileDropGuard()

  useEffect(() => {
    if (!isDraggingOver) return

    const clearHighlight = () => {
      enteredDepth.current = 0
      setIsDraggingOver(false)
    }

    window.addEventListener('drop', clearHighlight)
    window.addEventListener('dragend', clearHighlight)
    return () => {
      window.removeEventListener('drop', clearHighlight)
      window.removeEventListener('dragend', clearHighlight)
    }
  }, [isDraggingOver])

  const handleDragEnter = (event: React.DragEvent<HTMLElement>) => {
    if (!enabled || !carriesFiles(event.dataTransfer)) return
    event.preventDefault()
    enteredDepth.current += 1
    setIsDraggingOver(true)
  }

  const handleDragOver = (event: React.DragEvent<HTMLElement>) => {
    if (!enabled || !carriesFiles(event.dataTransfer)) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }

  const handleDragLeave = (event: React.DragEvent<HTMLElement>) => {
    if (!enabled || !carriesFiles(event.dataTransfer)) return
    enteredDepth.current = Math.max(0, enteredDepth.current - 1)
    if (enteredDepth.current === 0) setIsDraggingOver(false)
  }

  const handleDrop = (event: React.DragEvent<HTMLElement>) => {
    if (!enabled || !carriesFiles(event.dataTransfer)) return
    event.preventDefault()
    enteredDepth.current = 0
    setIsDraggingOver(false)

    const droppedFiles = Array.from(event.dataTransfer.files)
    const acceptedFiles = droppedFiles.filter((file) => acceptedMimeTypes.includes(file.type))
    const rejectedFiles = droppedFiles.filter((file) => !acceptedMimeTypes.includes(file.type))

    if (rejectedFiles.length > 0) onFilesRejected?.(rejectedFiles)
    if (acceptedFiles.length > 0) onFilesAccepted(acceptedFiles)
  }

  return {
    isDraggingOver,
    dropZoneProps: {
      onDragEnter: handleDragEnter,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  }
}
