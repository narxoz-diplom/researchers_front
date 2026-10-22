import axios from 'axios'
import { mediaApi, uploadToCloudinary } from '@/features/media/api'
import type { CloudinaryUploadResult, UploadResourceType } from '@/features/media/types'
import { extractApiError } from '@/shared/api/axios'

/**
 * Uploads a file the way the studio does: signed Cloudinary upload when the
 * server has Cloudinary, otherwise the local-disk fallback of the API.
 */
export async function uploadMedia(
  file: File,
  payload: { resourceType: UploadResourceType; folder: string },
  onProgress?: (percent: number) => void,
): Promise<CloudinaryUploadResult> {
  try {
    const sign = await mediaApi.sign(payload)
    return await uploadToCloudinary(file, sign, onProgress)
  } catch (err) {
    const status = axios.isAxiosError(err) ? err.response?.status : undefined
    const apiErr = extractApiError(err)
    const cloudinaryOff = status === 503 || apiErr?.message?.toLowerCase().includes('cloudinary')
    if (!cloudinaryOff) throw err
    return mediaApi.uploadLocal(file, payload, onProgress)
  }
}
