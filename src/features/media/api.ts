import axios from 'axios'
import { api } from '@/shared/api/axios'
import { API } from '@/shared/api/endpoints'
import type { CloudinaryUploadResult, SignResponse, UploadResourceType } from './types'

export interface SignUploadPayload {
  resourceType: UploadResourceType
  folder: string
  publicId?: string
}

export const mediaApi = {
  sign: (payload: SignUploadPayload) =>
    api.post<SignResponse>(API.media.sign, payload).then((r) => r.data),
}

export async function uploadToCloudinary(
  file: File,
  sign: SignResponse,
  onProgress?: (percent: number) => void,
): Promise<CloudinaryUploadResult> {
  const form = new FormData()
  form.append('file', file)
  form.append('api_key', sign.apiKey)
  form.append('timestamp', String(sign.timestamp))
  form.append('signature', sign.signature)
  form.append('folder', sign.folder)
  if (sign.publicId) form.append('public_id', sign.publicId)

  const { data } = await axios.post<CloudinaryUploadResult>(
    `https://api.cloudinary.com/v1_1/${sign.cloudName}/${sign.resourceType}/upload`,
    form,
    {
      onUploadProgress: (event) => {
        if (!onProgress || !event.total) return
        onProgress(Math.round((event.loaded / event.total) * 100))
      },
    },
  )

  return data
}
