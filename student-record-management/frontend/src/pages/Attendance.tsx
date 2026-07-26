import { useState } from 'react';
import toast from 'react-hot-toast';
import { CalendarCheck } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { subjectsApi, studentsApi, attendanceApi } from '../api/endpoints';
import type { Subject, Student } from '../types';
import Skeleton from '../components/Skeleton';
import Badge from '../components/Badge';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTIONS: Array<Student['status'] extends never ? never : 'present' | 'absent' | 'late' | 'excused'> = [
  'present', 'absent', 'late', 'excused',
];

const Attendance = () => {
  const { user } = useAuth();
  const canMark = user?.role === 'admin' || user?.role === 'teacher';

  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [statusMap, setStatusMap] = useState<Record<string, 'present' | 'absent' | 'late' | 'excused'>>({});
  const [saving, setSaving] = useState(false);

  const { data: subjectData } = useFetch<{ data: Subject[] }>(() => subjectsApi.list({ limit: 100 }), []);
  const { data: studentData, loading: studentsLoading } = useFetch<{ data: Student[] }>(
    () => studentsApi.list({ limit: 100 }),
    []
  );

  const { data: recordsData, refetch } = useFetch<{ data: any[] }>(
    () => attendanceApi.list(subjectId ? { subject: subjectId } : {}),
    [subjectId]
  );

  const setStatus = (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    setStatusMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    if (!subjectId) {
      toast.error('Please select a subject first');
      return;
    }
    const records = Object.entries(statusMap).map(([student, status]) => ({ student, status }));
    if (records.length === 0) {
      toast.error('Mark at least one student');
      return;
    }
    setSaving(true);
    try {
      await attendanceApi.markBulk({ subject: subjectId, date, records });
      toast.success('Attendance saved');
      setStatusMap({});
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Attendance</h1>

      {canMark && (
        <div className="card mb-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
            <CalendarCheck size={18} /> Mark Attendance
          </h3>
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Subject</label>
              <select className="input" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                <option value="">Select subject</option>
                {subjectData?.data.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
              </select>
            </div>
            <div>
              <label className="label">Date</label>
              <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          {studentsLoading ? (
            <Skeleton rows={4} cols={3} />
          ) : (
            <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-100 dark:border-gray-800">
              {studentData?.data.map((s) => (
                <div key={s._id} className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5 last:border-0 dark:border-gray-800">
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{s.user.name}</p>
                    <p className="text-xs text-gray-400">{s.rollNumber}</p>
                  </div>
                  <div className="flex gap-1">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setStatus(s._id, opt)}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                          statusMap[s._id] === opt
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <button className="btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </div>
      )}

      <div className="card overflow-x-auto p-0">
        <h3 className="p-5 font-semibold text-gray-900 dark:text-white">Recent Records</h3>
        <table className="w-full">
          <thead className="border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th className="table-th">Date</th>
              <th className="table-th">Student</th>
              <th className="table-th">Subject</th>
              <th className="table-th">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {recordsData?.data.slice(0, 20).map((r) => (
              <tr key={r._id}>
                <td className="table-td">{new Date(r.date).toLocaleDateString()}</td>
                <td className="table-td">{r.student?.user?.name || '—'}</td>
                <td className="table-td">{r.subject?.name}</td>
                <td className="table-td"><Badge status={r.status} /></td>
              </tr>
            ))}
            {(!recordsData || recordsData.data.length === 0) && (
              <tr><td colSpan={4} className="p-8 text-center text-sm text-gray-500">No attendance records yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;
