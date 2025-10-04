interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
  requireAuth?: boolean;
  useAgencyAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl =
      baseUrl ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://booking-kshetra.onrender.com/api";
  }

  private getAuthHeaders(useAgencyAuth = false): Record<string, string> {
    const tokenKey = useAgencyAuth ? "agencyToken" : "token";
    const token = localStorage.getItem(tokenKey);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      if (!response.ok) {
        // Handle specific HTTP errors
        if (response.status === 401) {
          // Clear both tokens and redirect to appropriate login
          localStorage.removeItem("token");
          localStorage.removeItem("agencyToken");
          if (window.location.pathname.startsWith("/agency")) {
            window.location.href = "/agency/login";
          } else {
            window.location.href = "/admin/login";
          }
          throw new Error("Authentication required");
        }

        if (response.status === 403) {
          throw new Error("Access denied");
        }

        if (response.status === 404) {
          throw new Error("Resource not found");
        }

        if (response.status >= 500) {
          throw new Error("Server error. Please try again later.");
        }

        // Try to get error message from response
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API Error:", error);

      if (error instanceof Error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: false,
        error: "An unexpected error occurred",
      };
    }
  }

  async request<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { method = "GET", body, headers = {}, requireAuth = false, useAgencyAuth = false } = options;

    try {
      const url = `${this.baseUrl}${
        endpoint.startsWith("/") ? endpoint : `/${endpoint}`
      }`;

      const requestHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...headers,
      };

      if (requireAuth) {
        Object.assign(requestHeaders, this.getAuthHeaders(useAgencyAuth));
      }

      const config: RequestInit = {
        method,
        headers: requestHeaders,
      };

      if (body && method !== "GET") {
        if (body instanceof FormData) {
          delete requestHeaders["Content-Type"]; // Let browser set multipart boundary
          config.body = body;
        } else {
          config.body = JSON.stringify(body);
        }
      }

      const response = await fetch(url, config);
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error("Request Error:", error);

      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        return {
          success: false,
          error: "Network error. Please check your connection and try again.",
        };
      }

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      };
    }
  }

  // Convenience methods
  async get<T>(endpoint: string, requireAuth = false): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET", requireAuth });
  }

  async post<T>(
    endpoint: string,
    body: any,
    requireAuth = false
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "POST", body, requireAuth });
  }

  async put<T>(
    endpoint: string,
    body: any,
    requireAuth = false
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "PUT", body, requireAuth });
  }

  async patch<T>(
    endpoint: string,
    body: any,
    requireAuth = false
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "PATCH", body, requireAuth });
  }

  async delete<T>(
    endpoint: string,
    requireAuth = false
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE", requireAuth });
  }

  // Agency-specific convenience methods
  async agencyGet<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET", requireAuth: true, useAgencyAuth: true });
  }

  async agencyPost<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "POST", body, requireAuth: true, useAgencyAuth: true });
  }

  async agencyPut<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "PUT", body, requireAuth: true, useAgencyAuth: true });
  }

  async agencyDelete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE", requireAuth: true, useAgencyAuth: true });
  }
}

export const apiClient = new ApiClient();
export type { ApiResponse };
