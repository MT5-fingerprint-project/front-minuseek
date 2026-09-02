export const UPLOADABLE_IMAGE_MIME_TYPES = ['image/png', 'image/jpeg', 'image/tiff'] as const

export const UPLOADABLE_IMAGE_ACCEPT = UPLOADABLE_IMAGE_MIME_TYPES.join(',')
