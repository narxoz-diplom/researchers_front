export interface LibraryCourse {
  id: string
  title: string
  coverUrl?: string
  category?: string
}

export interface LibraryLesson {
  id: string
  title: string
  courseId: string
  courseTitle: string
  coverUrl?: string
}

export interface MyLibrary {
  courses: LibraryCourse[]
  lessons: LibraryLesson[]
}
