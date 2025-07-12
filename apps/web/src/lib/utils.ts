import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: string | number, currency: string = 'SAR', locale: string = 'en'): string {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numericPrice)) return '';
  
  // Format with commas
  const formatted = numericPrice.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  // Return with appropriate currency symbol based on locale
  if (locale === 'ar') {
    return `${formatted} ر.س`;
  } else {
    return `${formatted} ${currency}`;
  }
}
