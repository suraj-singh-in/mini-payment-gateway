import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function SuccessResponse<T>(data: T) {
  return { success: true, data }
}

export function FailureResponse<T>(data: T, message: string) {
  return { success: false, data, message }
}