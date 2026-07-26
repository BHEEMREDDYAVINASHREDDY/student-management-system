import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ClipboardList, Award } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { studentsApi, subjectsApi, semestersApi, marksApi } from '../api/endpoints';
import type { Student, Subject, Semester } from '../types';
import { useAuth } from '../context/AuthContext';

interface FormData {
  student: string;
  subject: string;
  semester: string;
  examType: 'quiz' | 'assignment' | 'midterm' | 'final' | 'practical';
  marksObtained: number;
  maxMarks: number;
}

const EXAM_TYPES = ['quiz', 'assignment', 'midterm', 'final', 'practical'];

const gradeColor = (grade: string) => {
  if (['A+', 'A'].includes(grade)) return 'text-green-600 dark:text-green-400';
  if (['B+', 'B'].includes(grade)) return 'text-blue-600 dark:text-blue-400';
  if (grade === 'C' || grade === 'D') return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
};

const Marks = () => {
  const { user } = useAuth();
  const canGrade = user?.role === 'admin' || user?.role === 'teacher';

  const { data: studentData } = useFetch<{ data: Student[] }>(() => studentsApi.list({ limit: 100 }), []);
  const { data: subjectData } = useFetch<{ data: Subject[] }>(() => subjectsApi.list({ limit: 100 }), []);
  const { data: semesterData } = useFetch<{ data: Semester[] }>(() => semestersApi.list(), []);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: { examType: 'quiz', maxMarks: 100 },
  });

  const [reportStudent, setReportStudent] = useState('');
  const [reportSemester, setReportSemester] = useState('');
  const [report, setReport] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const onSubmit = async (formData: FormData) => {
    try {
      await marksApi.upsert(formData);
      toast.success('Marks saved');
      reset({ examType: 'quiz', maxMarks: 100 });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save marks');
    }
  };

  const runReport = async () => {
    if (!reportStudent || !reportSemester) {
      toast.error('Select both a student and a semester');
      return;
    }
    setLoadingReport(true);
    try {
      const { data } = await marksApi.report(reportStudent, reportSemester);
      setReport(data.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to compute report');
    } finally {
      setLoadingReport(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Marks & Grade Calculator</h1>

      {canGrade && (
        <div className="card">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
            <ClipboardList size={18} /> Enter Marks
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Student</label>
              <select className="input" {...register('student', { required: 'Required' })}>
                <option value="">Select student</option>
                {studentData?.data.map((s) => <option key={s._id} value={s._id}>{s.user.name} ({s.rollNumber})</option>)}
              </select>
              {errors.student && <p className="mt-1 text-xs text-red-500">{errors.student.message}</p>}
            </div>
            <div>
              <label className="label">Subject</label>
              <select className="input" {...register('subject', { required: 'Required' })}>
                <option value="">Select subject</option>
                {subjectData?.data.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Semester</label>
              <select className="input" {...register('semester', { required: 'Required' })}>
                <option value="">Select semester</option>
                {semesterData?.data.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Exam Type</label>
              <select className="input" {...register('examType')}>
                {EXAM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Marks Obtained</label>
              <input type="number" step="0.01" className="input" {...register('marksObtained', { required: true, valueAsNumber: true })} />
            </div>
            <div>
              <label className="label">Max Marks</label>
              <input type="number" step="0.01" className="input" {...register('maxMarks', { required: true, valueAsNumber: true })} />
            </div>
            <div className="sm:col-span-3 flex justify-end">
              <button type="submit" className="btn-primary">Save Marks</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
          <Award size={18} /> Grade Calculator / Semester Report
        </h3>
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Student</label>
            <select className="input" value={reportStudent} onChange={(e) => setReportStudent(e.target.value)}>
              <option value="">Select student</option>
              {studentData?.data.map((s) => <option key={s._id} value={s._id}>{s.user.name} ({s.rollNumber})</option>)}
            </select>
          </div>
          <div>
            <label className="label">Semester</label>
            <select className="input" value={reportSemester} onChange={(e) => setReportSemester(e.target.value)}>
              <option value="">Select semester</option>
              {semesterData?.data.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button className="btn-secondary w-full" onClick={runReport} disabled={loadingReport}>
              {loadingReport ? 'Calculating...' : 'Calculate GPA'}
            </button>
          </div>
        </div>

        {report && (
          <div>
            <div className="mb-4 flex items-center gap-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
              <div>
                <p className="text-xs text-gray-500">GPA</p>
                <p className="text-2xl font-bold text-primary-600">{report.gpa}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Credits</p>
                <p className="text-2xl font-bold">{report.totalCredits}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Result</p>
                <p className={`text-2xl font-bold ${report.resultStatus === 'PASS' ? 'text-green-600' : 'text-red-600'}`}>
                  {report.resultStatus}
                </p>
              </div>
            </div>
            <table className="w-full">
              <thead className="border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="table-th">Subject</th>
                  <th className="table-th">Credits</th>
                  <th className="table-th">Percentage</th>
                  <th className="table-th">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {report.subjectResults.map((r: any) => (
                  <tr key={r.code}>
                    <td className="table-td">{r.subject}</td>
                    <td className="table-td">{r.credits}</td>
                    <td className="table-td">{r.percentage}%</td>
                    <td className={`table-td font-bold ${gradeColor(r.grade)}`}>{r.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marks;
