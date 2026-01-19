import { z } from 'zod'

// Base schemas without refinements
const baseSigninSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional()
})

const baseSignupSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
           'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
  acceptTerms: z
    .boolean()
    .refine(val => val === true, 'You must accept the terms and conditions')
})

// Export schemas with refinements
export const signinSchema = baseSigninSchema

export const signupSchema = baseSignupSchema.refine(
  data => data.password === data.confirmPassword, 
  {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  }
)

export type SigninFormData = z.infer<typeof signinSchema>
export type SignupFormData = z.infer<typeof signupSchema>

// Individual validation functions using base schemas
export const validateEmail = (email: string): string | null => {
  try {
    baseSigninSchema.shape.email.parse(email)
    return null
  } catch (error: any) {
    return error.issues[0]?.message || 'Please enter a valid email address'
  }
}

export const validatePassword = (password: string): string | null => {
  try {
    baseSignupSchema.shape.password.parse(password)
    return null
  } catch (error: any) {
    return error.issues[0]?.message || 'Invalid password'
  }
}

export const validateName = (name: string): string | null => {
  try {
    baseSignupSchema.shape.name.parse(name)
    return null
  } catch (error: any) {
    return error.issues[0]?.message || 'Invalid name'
  }
}

export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) {
    return 'Please confirm your password'
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match'
  }
  return null
}

export const validateTerms = (acceptTerms: boolean): string | null => {
  if (!acceptTerms) {
    return 'You must accept the terms and conditions'
  }
  return null
}

// Complete form validation functions
export const validateSigninFormData = (data: SigninFormData): Record<string, string> => {
  const errors: Record<string, string> = {}
  
  try {
    signinSchema.parse(data)
  } catch (error: any) {
    if (error.issues) {
      error.issues.forEach((issue: any) => {
        errors[issue.path[0]] = issue.message
      })
    }
  }
  
  return errors
}

export const validateSignupFormData = (data: SignupFormData): Record<string, string> => {
  const errors: Record<string, string> = {}
  
  try {
    signupSchema.parse(data)
  } catch (error: any) {
    if (error.issues) {
      error.issues.forEach((issue: any) => {
        errors[issue.path[0]] = issue.message
      })
    }
  }
  
  return errors
}

// Password strength checker
export const getPasswordStrength = (password: string): {
  score: number
  feedback: string[]
} => {
  const feedback: string[] = []
  let score = 0

  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push('Password should be at least 8 characters long')
  }

  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Include at least one lowercase letter')
  }

  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Include at least one uppercase letter')
  }

  if (/\d/.test(password)) {
    score += 1
  } else {
    feedback.push('Include at least one number')
  }

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 1
    feedback.unshift('Great! Your password includes special characters')
  }

  return { score, feedback }
}

// Email validation with detailed feedback
export const validateEmailWithFeedback = (email: string): {
  isValid: boolean
  message: string
} => {
  if (!email) {
    return { isValid: false, message: 'Email is required' }
  }

  if (!email.includes('@')) {
    return { isValid: false, message: 'Email must contain @ symbol' }
  }

  if (!email.includes('.')) {
    return { isValid: false, message: 'Email must contain a domain' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' }
  }

  return { isValid: true, message: 'Email looks good!' }
}
