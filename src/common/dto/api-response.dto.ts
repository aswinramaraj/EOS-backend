/**
 * Standard API response wrapper.
 * All controller responses are wrapped by the TransformInterceptor automatically.
 * You can also use this class directly for custom responses.
 */
export class ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;

  constructor(partial: Partial<ApiResponse<T>>) {
    Object.assign(this, partial);
    this.timestamp = new Date().toISOString();
  }

  static ok<T>(data: T, message = 'Success'): ApiResponse<T> {
    return new ApiResponse<T>({ success: true, message, data });
  }

  static created<T>(data: T, message = 'Created successfully'): ApiResponse<T> {
    return new ApiResponse<T>({ success: true, message, data });
  }

  static error(message: string, error?: string): ApiResponse<null> {
    return new ApiResponse<null>({ success: false, message, error });
  }
}
