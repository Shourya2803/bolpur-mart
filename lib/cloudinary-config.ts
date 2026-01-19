// Basic Cloudinary helpers with graceful fallback
type Opts = { width?: number; height?: number; quality?: number; crop?: "fill" | "fit" }

export function getOptimizedImageUrl(src: string, opts: Opts = {}): string {
  if (!src) return "/missing-image.png"
  // If it's a Cloudinary URL, inject basic transformations; otherwise, return src unchanged
  if (src.includes("res.cloudinary.com")) {
    const { width, height, quality = 70, crop = "fill" } = opts
    const parts = src.split("/upload/")
    if (parts.length === 2) {
      const transform = [
        width ? `w_${width}` : null,
        height ? `h_${height}` : null,
        quality ? `q_${quality}` : null,
        crop ? `c_${crop}` : null,
      ]
        .filter(Boolean)
        .join(",")
      return `${parts[0]}/upload/${transform}/${parts[1]}`
    }
  }
  return src
}

export function getPlaceholderUrl(width = 24, height = 24, query = "image-placeholder") {
  return `/placeholder.svg?height=${height}&width=${width}&query=${query}`
}
