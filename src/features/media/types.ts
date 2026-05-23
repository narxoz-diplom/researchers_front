export type UploadResourceType = 'image' | 'video' | 'raw'

export interface SignResponse {
  cloudName: string
  apiKey: string
  timestamp: number
  signature: string
  folder: string
  resourceType: UploadResourceType
  publicId?: string
}

export interface CloudinaryUploadResult {
  public_id: string
  secure_url: string
  duration?: number
  bytes: number
  format?: string
  resource_type?: string
}
