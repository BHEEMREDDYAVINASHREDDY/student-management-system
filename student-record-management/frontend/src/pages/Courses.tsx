import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { coursesApi, departmentsApi } from '../api/endpoints';
import type { Course, Department } from '../types';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Skeleton from '../components/Skeleton';

interface FormData {
  name: string;
  code: string;
  department: string;
  durationYears: number;
  totalSemesters: number;
  description?: string;
}

const Courses = () => {
  const { data, loading, refetch } = useFetch<{ data: Course[] }>(() => coursesApi.list({ limit: 100 }), []);
  const { data: deptData } = useFetch<{ data: Department[] }>(() => departmentsApi.list({ limit: 100 }), []);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', code: '', department: '', durationYears: 4, totalSemesters: 8, description: '' });
    setModalOpen(true);
  };

  const openEdit = (course: Course) => {
    setEditing(course);
    reset({
      name: course.name,
      code: course.code,
      department: typeof course.department === 'object' ? course.department._id : course.department,
      durationYears: course.durationYears,
      totalSemesters: course.totalSemesters,
      description: course.description,
    });
    setModalOpen(true);
  };

  const onSubmit = async (formData: FormData) => {
    try {
      if (editing) {
        await coursesApi.update(editing._id, formData);
        toast.success('Course updated');
      } else {
        await coursesApi.create(formData);
        toast.success('Course created');
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
      await coursesApi.remove(deleteTarget._id);
      toast.success('Course deleted');
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Courses</h1>
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={16} /> Add Course
        </button>
      </div>

      {loading ? (
        <Skeleton rows={4} cols={3} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.data.map((c) => (
            <div key={c._id} className="card">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-900/30">
                  <BookOpen size={20} />
                </div>
                <div className="flex gap-2">
                  <button className="text-gray-400 hover:text-primary-600" onClick={() => openEdit(c)}>
                    <Pencil size={15} />
                  </button>
                  <button className="text-gray-400 hover:text-red-600" onClick={() => setDeleteTarget(c)}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{c.name}</h3>
              <p className="text-xs text-gray-500">{c.code} • {typeof c.department === 'object' ? c.department.name : ''}</p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {c.durationYears} years • {c.totalSemesters} semesters
              </p>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Course' : 'Add Course'} maxWidth="max-w-md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <label className="label">Department</label>
            <select className="input" {...register('department', { required: 'Required' })}>
              <option value="">Select department</option>
              {deptData?.data.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Duration (years)</label>
              <input type="number" className="input" {...register('durationYears', { required: true, valueAsNumber: true })} />
            </div>
            <div>
              <label className="label">Total Semesters</label>
              <input type="number" className="input" {...register('totalSemesters', { required: true, valueAsNumber: true })} />
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={3} {...register('description')} />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Save changes' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete course"
        message={`Are you sure you want to delete ${deleteTarget?.name}?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        confirmLabel="Delete"
      />
    </div>
  );
};

export default Courses;
