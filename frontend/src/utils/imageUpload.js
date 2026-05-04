/**
 * Resize and compress an image file to a JPEG data URL suitable for profile_picture.
 * Works with gallery picks and camera captures on mobile (image/*).
 *
 * @param {File} file
 * @returns {Promise<string>}
 */
export function fileToProfilePictureDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Please choose an image file.'))
      return
    }

    const maxDimension = 720
    const maxChars = 380_000

    const url = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      try {
        let { width, height } = img
        if (width < 1 || height < 1) {
          URL.revokeObjectURL(url)
          reject(new Error('Invalid image dimensions.'))
          return
        }
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          URL.revokeObjectURL(url)
          reject(new Error('Could not process this image.'))
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        URL.revokeObjectURL(url)

        let quality = 0.88
        let dataUrl = canvas.toDataURL('image/jpeg', quality)
        while (dataUrl.length > maxChars && quality > 0.42) {
          quality -= 0.07
          dataUrl = canvas.toDataURL('image/jpeg', quality)
        }
        if (dataUrl.length > maxChars) {
          reject(
            new Error('Image is still too large after compression. Try a smaller or simpler photo.'),
          )
          return
        }
        resolve(dataUrl)
      } catch (err) {
        URL.revokeObjectURL(url)
        reject(err instanceof Error ? err : new Error('Could not process this image.'))
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read this image.'))
    }

    img.src = url
  })
}
