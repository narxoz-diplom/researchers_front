export type SectionId = 'courses' | 'about' | 'publication' | 'methods' | 'tools' | 'wellness'

/** Sections with static Unsplash images on the landing page. */
export type ImageSectionId = Exclude<SectionId, 'courses' | 'about'>
