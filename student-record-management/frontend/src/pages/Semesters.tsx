import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Layers } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { semestersApi, coursesApi } from '../api/endpoints';
import type { Semester, Course } from '../types';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Skeleton from '../components/Skeleton';

interface FormData {
  name: string;
  number: number;
  course: string;
}

const Semesters = () => {
  const { data: courseData } = useFetch<{ data: Course[] }>(() => coursesApi.list({ limit: 100 }), []);
  const [courseFilter, setCourseFilter] = useState('');
  const { data, loading, refetch } = useFetch<{ data: Semester[] }>(
    () => semestersApi.list(courseFilter ? { course: courseFilter } : undefined),
    [courseFilter]
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Semester | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Semester | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', number: 1, course: courseFilter || '' });
    setModalOpen(true);
  };

  const openEdit = (sem: Semester) => {
    setEditing(sem);
    reset({ name: sem.name, number: sem.number, course: typeof sem.course === 'object' ? sem.course._id : sem.course });
    setModalOpen(true);
  };

  const onSubmit = async (formData: FormData) => {
    try {
      if (editing) {
        await semestersApi.update(editing._id, formData);
        toast.success('Semester updated');
      } else {
        await semestersApi.create(formData);
        toast.success('Semester created');
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
      await semestersApi.remove(deleteTarget._id);
      toast.success('Semester deleted');
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Semesters</h1>
        <div className="flex items-center gap-2">
          <select className="input" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
            <option value="">All courses</option>
            {courseData?.data.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={16} /> Add Semester
          </button>
        </div>
      </div>

      {loading ? (
        <Skeleton rows={4} cols={3} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data?.data.map((s) => (
            <div key={s._id} className="card">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/30">
                  <Layers size={20} />
                </div>
                <div className="flex gap-2">
                  <button className="text-gray-400 hover:text-primary-600" onClick={() => openEdit(s)}><Pencil size={15} /></button>
                  <button className="text-gray-400 hover:text-red-600" onClick={() => setDeleteTarget(s)}><Trash2 size={15} /></button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{s.name}</h3>
              <p className="text-xs text-gray-500">{typeof s.course === 'object' ? s.course.name : ''}</p>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Semester' : 'Add Semester'} maxWidth="max-w-md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input className="input" {...register('name', { required: 'Required' })} />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Number</label>
            <input type="number" className="input" {...register('number', { required: true, valueAsNumber: true })} />
          </div>
          <div>
            <label className="label">Course</label>
            <select className="input" {...register('course', { required: 'Required' })}>
              <option value="">Select course</option>
              {courseData?.data.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Save changes' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete semester"
        message={`Are you sure you want to delete ${deleteTarget?.name}?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        confirmLabel="Delete"
      />
    </div>
  );
};

export default Semesters;
