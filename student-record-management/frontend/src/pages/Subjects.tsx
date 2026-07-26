import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { subjectsApi, coursesApi, semestersApi, teachersApi } from '../api/endpoints';
import type { Subject, Course, Semester, Teacher } from '../types';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Skeleton from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';

interface FormData {
  name: string;
  code: string;
  course: string;
  semester: string;
  credits: number;
  teacher?: string;
  maxMarks: number;
  passingMarks: number;
}

const Subjects = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const { data, loading, refetch } = useFetch<{ data: Subject[] }>(() => subjectsApi.list({ limit: 100 }), []);
  const { data: courseData } = useFetch<{ data: Course[] }>(() => coursesApi.list({ limit: 100 }), []);
  const { data: teacherData } = useFetch<{ data: Teacher[] }>(() => teachersApi.list({ limit: 100 }), []);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>();

  const selectedCourse = watch('course');
  const { data: semesterData } = useFetch<{ data: Semester[] }>(() => semestersApi.byCourse(selectedCourse), [selectedCourse]);

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', code: '', course: '', semester: '', credits: 4, maxMarks: 100, passingMarks: 40, teacher: '' });
    setModalOpen(true);
  };

  const openEdit = (subject: Subject) => {
    setEditing(subject);
    reset({
      name: subject.name,
      code: subject.code,
      course: typeof subject.course === 'object' ? subject.course._id : subject.course,
      semester: typeof subject.semester === 'object' ? subject.semester._id : subject.semester,
      credits: subject.credits,
      teacher: subject.teacher ? (typeof subject.teacher === 'object' ? subject.teacher._id : subject.teacher) : '',
      maxMarks: subject.maxMarks,
      passingMarks: subject.passingMarks,
    });
    setModalOpen(true);
  };

  const onSubmit = async (formData: FormData) => {
    try {
      const payload = { ...formData, teacher: formData.teacher || null };
      if (editing) {
        await subjectsApi.update(editing._id, payload);
        toast.success('Subject updated');
      } else {
        await subjectsApi.create(payload);
        toast.success('Subject created');
      }
      setModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Something went wrong');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await subjectsApi.remove(deleteTarget._id);
      toast.success('Subject deleted');
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subjects</h1>
        {isAdmin && (
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={16} /> Add Subject
          </button>
        )}
      </div>

      <div className="card overflow-x-auto p-0">
        {loading ? (
          <div className="p-5"><Skeleton rows={6} cols={5} /></div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="table-th">Code</th>
                <th className="table-th">Name</th>
                <th className="table-th">Course / Semester</th>
                <th className="table-th">Credits</th>
                <th className="table-th">Teacher</th>
                {isAdmin && <th className="table-th text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {data?.data.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="table-td font-medium">{s.code}</td>
                  <td className="table-td">{s.name}</td>
                  <td className="table-td">
                    {typeof s.course === 'object' ? s.course.name : ''} / {typeof s.semester === 'object' ? s.semester.name : ''}
                  </td>
                  <td className="table-td">{s.credits}</td>
                  <td className="table-td">{s.teacher && typeof s.teacher === 'object' ? s.teacher.user.name : '—'}</td>
                  {isAdmin && (
                    <td className="table-td text-right">
                      <button className="mr-2 text-gray-400 hover:text-primary-600" onClick={() => openEdit(s)}><Pencil size={16} /></button>
                      <button className="text-gray-400 hover:text-red-600" onClick={() => setDeleteTarget(s)}><Trash2 size={16} /></button>
                    </td>
                  )}
                </tr>
              ))}
              {data?.data.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-sm text-gray-500">No subjects found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Subject' : 'Add Subject'} maxWidth="max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Name</label>
            <input className="input" {...register('name', { required: 'Required' })} />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Code</label>
            <input className="input" {...register('code', { required: 'Required' })} />
          </div>
          <div>
            <label className="label">Course</label>
            <select className="input" {...register('course', { required: 'Required' })}>
              <option value="">Select course</option>
              {courseData?.data.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
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
            <label className="label">Credits</label>
            <input type="number" className="input" {...register('credits', { required: true, valueAsNumber: true })} />
          </div>
          <div>
            <label className="label">Teacher</label>
            <select className="input" {...register('teacher')}>
              <option value="">Unassigned</option>
              {teacherData?.data.map((t) => <option key={t._id} value={t._id}>{t.user.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Max Marks</label>
            <input type="number" className="input" {...register('maxMarks', { required: true, valueAsNumber: true })} />
          </div>
          <div>
            <label className="label">Passing Marks</label>
            <input type="number" className="input" {...register('passingMarks', { required: true, valueAsNumber: true })} />
          </div>
          <div className="flex justify-end gap-3 sm:col-span-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Save changes' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete subject"
        message={`Are you sure you want to delete ${deleteTarget?.name}?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        confirmLabel="Delete"
      />
    </div>
  );
};

export default Subjects;
