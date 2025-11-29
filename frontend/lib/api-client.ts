// Configuración de la API
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

export class ApiClient {
  private static token: string | null = null

  // Usar la key `auth_token` que esperan los hooks del frontend
  static setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token)
    }
  }

  static getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token") || this.token
    }
    return this.token
  }

  static clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }
  }

  private static async request(method: string, endpoint: string, data?: any) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    const token = this.getToken()
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const config: RequestInit = {
      method,
      headers,
    }

    if (data) {
      config.body = JSON.stringify(data)
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

    if (response.status === 401) {
      this.clearToken()
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    }

    const responseData = await response.json()

    if (!response.ok) {
      throw new Error(responseData.message || `Error: ${response.status}`)
    }

    return responseData
  }

  static async get(endpoint: string) {
    return this.request("GET", endpoint)
  }

  static async post(endpoint: string, data: any) {
    return this.request("POST", endpoint, data)
  }

  static async patch(endpoint: string, data: any) {
    return this.request("PATCH", endpoint, data)
  }

  static async delete(endpoint: string) {
    return this.request("DELETE", endpoint)
  }
}

// Auth APIs
export const authApi = {
  // Acepta un payload { email, password } o (email, password)
  login: (...args: any[]) => {
    const payload = args[0]
    if (typeof payload === 'object') return ApiClient.post('/auth/login', payload)
    const email = args[0]
    const password = args[1]
    return ApiClient.post('/auth/login', { email, password })
  },
  // Registro: acepta un objeto con campos { firstName, lastName, email, password, role }
  register: (payload: any) => ApiClient.post('/auth/register', payload),
  getCurrentUser: () => ApiClient.get('/auth/me'),
  // Alias `me` para compatibilidad con hooks existentes
  me: () => ApiClient.get('/auth/me'),
}

// Courses APIs
export const coursesApi = {
  list: () => ApiClient.get("/courses"),
  get: (id: string) => ApiClient.get(`/courses/${id}`),
  getStudents: (courseId: string) => ApiClient.get(`/courses/${courseId}/students`),
  create: (data: any) => ApiClient.post("/courses", data),
  update: (id: string, data: any) => ApiClient.patch(`/courses/${id}`, data),
  delete: (id: string) => ApiClient.delete(`/courses/${id}`),
  enrollStudent: (courseId: string, studentId: string) =>
    ApiClient.post(`/courses/${courseId}/students`, { studentId }),
  unenrollStudent: (courseId: string, studentId: string) =>
    ApiClient.post(`/courses/${courseId}/students/${studentId}/unenroll`, {}),
}

// Challenges APIs
export const challengesApi = {
  list: (groupId?: string) => {
    const query = groupId ? `?groupId=${groupId}` : ""
    return ApiClient.get(`/challenges${query}`)
  },
  get: (id: string) => ApiClient.get(`/challenges/${id}`),
  create: (data: any) => ApiClient.post("/challenges", data),
  update: (id: string, data: any) => ApiClient.patch(`/challenges/${id}`, data),
  delete: (id: string) => ApiClient.delete(`/challenges/${id}`),
}

// Test Cases APIs
export const testCasesApi = {
  list: (challengeId: string) => ApiClient.get(`/challenges/${challengeId}/test-cases`),
  add: (challengeId: string, data: any) =>
    ApiClient.post(`/challenges/${challengeId}/test-cases`, data),
  delete: (challengeId: string, testCaseId: string) =>
    ApiClient.delete(`/challenges/${challengeId}/test-cases/${testCaseId}`),
}

// Submissions APIs
export const submissionsApi = {
  list: () => ApiClient.get("/submissions/my-submissions"),
  listUserSubmissions: () => ApiClient.get("/submissions/my-submissions"),
  get: (id: string) => ApiClient.get(`/submissions/${id}`),
  submit: (data: any) => ApiClient.post("/submissions", data),
}

// Evaluations APIs
export const evaluationsApi = {
  list: (groupId?: string) => {
    const query = groupId ? `?groupId=${groupId}` : ""
    return ApiClient.get(`/evaluations${query}`)
  },
  active: (groupId?: string) => {
    const query = groupId ? `?groupId=${groupId}` : ""
    return ApiClient.get(`/evaluations/active${query}`)
  },
  get: (id: string) => ApiClient.get(`/evaluations/${id}`),
  create: (data: any) => ApiClient.post("/evaluations", data),
  update: (id: string, data: any) => ApiClient.patch(`/evaluations/${id}`, data),
  delete: (id: string) => ApiClient.delete(`/evaluations/${id}`),
  addChallenge: (evaluationId: string, data: any) =>
    ApiClient.post(`/evaluations/${evaluationId}/challenges`, data),
  removeChallenge: (evaluationId: string, challengeId: string) =>
    ApiClient.delete(`/evaluations/${evaluationId}/challenges/${challengeId}`),
}

// Leaderboards APIs
export const leaderboardsApi = {
  getChallengeLeaderboard: (challengeId: string, limit?: number) =>
    ApiClient.get(`/leaderboards/challenges/${challengeId}${limit ? `?limit=${limit}` : ""}`),
  getCourseLeaderboard: (courseId: string, limit?: number) =>
    ApiClient.get(`/leaderboards/courses/${courseId}${limit ? `?limit=${limit}` : ""}`),
  getEvaluationLeaderboard: (evaluationId: string, limit?: number) =>
    ApiClient.get(`/leaderboards/evaluations/${evaluationId}${limit ? `?limit=${limit}` : ""}`),
}

// Users APIs
export const usersApi = {
  get: (id: string) => ApiClient.get(`/users/${id}`),
  list: () => ApiClient.get("/users"),
}

// Groups APIs
export const groupsApi = {
  list: (courseId: string) => ApiClient.get(`/groups?courseId=${courseId}`),
  get: (id: string) => ApiClient.get(`/groups/${id}`),
  getByNumber: (courseId: string, number: number) =>
    ApiClient.get(`/groups/course/${courseId}/number/${number}`),
  create: (data: any) => ApiClient.post("/groups", data),
  update: (id: string, data: any) => ApiClient.patch(`/groups/${id}`, data),
  delete: (id: string) => ApiClient.delete(`/groups/${id}`),
  enrollStudent: (groupId: string, studentId: string) =>
    ApiClient.post(`/groups/${groupId}/students`, { studentId }),
}

// Export consolidated client
export const apiClient = {
  authApi,
  coursesApi,
  challengesApi,
  testCasesApi,
  submissionsApi,
  evaluationsApi,
  leaderboardsApi,
  usersApi,
  groupsApi,
}
