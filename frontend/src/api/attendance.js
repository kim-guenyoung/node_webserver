import client from './client';

export const getMyAttendance = () => {
  return client.get('/api/attendance/my');
};
