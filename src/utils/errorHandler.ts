// Centralized Error Handler - Prevents crashes and provides user-friendly messages
import { Alert } from 'react-native';

export interface ErrorResponse {
  message: string;
  code?: string;
  shouldRetry?: boolean;
  userMessage?: string;
}

export class AppError extends Error {
  code?: string;
  shouldRetry: boolean;
  userMessage: string;

  constructor(message: string, code?: string, shouldRetry = false, userMessage?: string) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.shouldRetry = shouldRetry;
    this.userMessage = userMessage || this.getDefaultUserMessage(code);
  }

  private getDefaultUserMessage(code?: string): string {
    switch (code) {
      case 'NETWORK_ERROR':
        return 'Network connection issue. Please check your internet and try again.';
      case 'AUTH_ERROR':
        return 'Authentication failed. Please log in again.';
      case 'NOT_FOUND':
        return 'The requested resource was not found.';
      case 'PERMISSION_DENIED':
        return 'You don\'t have permission to perform this action.';
      case 'DATABASE_ERROR':
        return 'Database error. Please try again later.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }
}

export const handleError = (error: any, context?: string): ErrorResponse => {
  // Log error for debugging
  if (__DEV__) {
    console.error(`Error in ${context || 'unknown context'}:`, error);
  }

  // Handle different error types
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      shouldRetry: error.shouldRetry,
      userMessage: error.userMessage,
    };
  }

  // Network errors
  if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
    return {
      message: error.message,
      code: 'NETWORK_ERROR',
      shouldRetry: true,
      userMessage: 'Network connection issue. Please check your internet.',
    };
  }

  // Supabase errors
  if (error?.code) {
    const supabaseErrors: Record<string, string> = {
      '42P01': 'Database table not found. Please contact support.',
      '42703': 'Database column not found. Please contact support.',
      '23505': 'This record already exists.',
      '23503': 'Related record not found.',
      'PGRST116': 'No data found.',
      'PGRST301': 'Permission denied.',
    };

    return {
      message: error.message,
      code: error.code,
      shouldRetry: false,
      userMessage: supabaseErrors[error.code] || 'Database error. Please try again.',
    };
  }

  // Default error
  return {
    message: error?.message || 'Unknown error',
    code: 'UNKNOWN_ERROR',
    shouldRetry: false,
    userMessage: 'Something went wrong. Please try again.',
  };
};

export const showErrorAlert = (error: any, context?: string, onRetry?: () => void) => {
  const errorResponse = handleError(error, context);

  const buttons: any[] = [{ text: 'OK', style: 'cancel' }];

  if (errorResponse.shouldRetry && onRetry) {
    buttons.push({
      text: 'Retry',
      onPress: onRetry,
    });
  }

  Alert.alert('Error', errorResponse.userMessage, buttons);
};

// Retry mechanism for failed operations
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> => {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      const errorResponse = handleError(error);
      if (!errorResponse.shouldRetry) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, i)));
      }
    }
  }

  throw lastError;
};

// Safe async wrapper - prevents unhandled promise rejections
export const safeAsync = async <T>(
  operation: () => Promise<T>,
  fallbackValue: T,
  context?: string
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    handleError(error, context);
    return fallbackValue;
  }
};
