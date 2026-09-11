/**
 * Standardized API Error Handling for Ghurabo
 */

export interface ApiValidationErrorDetail {
  field?: string;
  message: string;
}

export interface ApiErrorPayload {
  status: number;
  code?: string;
  message: string;
  errors?: ApiValidationErrorDetail[];
}

export class ApiError extends Error {
  public status: number;
  public code?: string;
  public errors?: ApiValidationErrorDetail[];

  constructor(payload: ApiErrorPayload) {
    super(payload.message || 'An unexpected API error occurred.');
    this.name = 'ApiError';
    this.status = payload.status;
    this.code = payload.code;
    this.errors = payload.errors;
  }
}

/**
 * Normalizes any unknown error into a clean user-facing error message
 */
export function normalizeApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.errors && error.errors.length > 0) {
      return error.errors.map((e) => (e.field ? `${e.field}: ${e.message}` : e.message)).join(', ');
    }
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Network or server communication failure. Please check your connection.';
}
