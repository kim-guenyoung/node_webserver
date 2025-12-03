import axios from 'axios';

// API 베이스 URL 설정 (개발 환경)
const API_BASE_URL = 'http://localhost:3000/api/v1';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // 쿠키 전송을 위해 필수
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 토큰이 있으면 헤더에 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 인증 실패 시 로그아웃 처리
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API 함수들
export const authAPI = {
  // 로그인
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  // 로그아웃
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  
  // 현재 사용자 정보
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const courseAPI = {
  // 과목 목록 조회
  getCourses: async (params = {}) => {
    const response = await api.get('/courses', { params });
    return response.data;
  },
  
  // 과목 상세 조회
  getCourse: async (id) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },
};

export const sessionAPI = {
  // 세션 목록 조회
  getSessions: async (params = {}) => {
    const response = await api.get('/sessions', { params });
    return response.data;
  },
  
  // 특정 세션의 출석 현황
  getSessionAttendance: async (sessionId) => {
    const response = await api.get(`/sessions/${sessionId}/attendance`);
    return response.data;
  },
  
  // 출석 시작
  openAttendance: async (sessionId, data) => {
    const response = await api.post(`/sessions/${sessionId}/attendance/open`, data);
    return response.data;
  },
  
  // 출석 마감
  closeAttendance: async (sessionId) => {
    const response = await api.post(`/sessions/${sessionId}/attendance/close`);
    return response.data;
  },
};

export const attendanceAPI = {
  // 출석 체크 (학생)
  checkAttendance: async (data) => {
    const response = await api.post('/attendance/check', data);
    return response.data;
  },
  
  // 학생 출석 현황 조회
  getStudentAttendance: async (studentId, courseId = null) => {
    const params = courseId ? { course_id: courseId } : {};
    const response = await api.get(`/students/${studentId}/attendance`, { params });
    return response.data;
  },
};

export const notificationAPI = {
  // 알림 목록 조회
  getNotifications: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },
  
  // 알림 읽음 처리
  markAsRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },
  
  // 모든 알림 읽음 처리
  markAllAsRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },
};

export default api;