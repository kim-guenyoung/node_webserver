import React, { useEffect, useState } from 'react';
import { getMyAttendance } from '../api/attendance';

export default function StudentDashboard() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await getMyAttendance();
        setRecords(res.data);
      } catch (err) {
        console.error(err);
        alert('출석 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  return (
    <div>
      <h2 className="mb-4">📋 나의 출결 현황</h2>

      {loading ? (
        <p>불러오는 중...</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>과목</th>
              <th>날짜</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan="3">출석 기록이 없습니다.</td>
              </tr>
            ) : (
              records.map((r) => (
                <tr key={r.id}>
                  <td>{r.subject}</td>
                  <td>{r.date}</td>
                  <td>{r.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
