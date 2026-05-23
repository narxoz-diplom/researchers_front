import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(1, 'Введите пароль'),
})

export const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Имя должно содержать не менее 2 символов'),
    email: z.string().email('Некорректный email'),
    password: z
      .string()
      .min(8, 'Пароль — не менее 8 символов')
      .regex(/(?=.*[a-zA-Z])(?=.*\d)/, 'Пароль должен содержать буквы и цифры'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  })

export type LoginSchema = z.infer<typeof loginSchema>
export type RegisterSchema = z.infer<typeof registerSchema>
