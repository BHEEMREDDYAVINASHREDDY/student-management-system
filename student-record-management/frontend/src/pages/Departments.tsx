import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { departmentsApi } from '../api/endpoints';
import type { Department } from '../types';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Skeleton from '../components/Skeleton';

interface FormData {
  name: string;
  code: string;
  description?: string;
}

const Departments = () => {
  const { data, loading, refetch } = useFetch<{ data: Department[] }>(() => departmentsApi.list({ limit: 100 }), []);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', code: '', description: '' });
    setModalOpen(true);
  };

  const openEdit = (dept: Department) => {
    setEditing(dept);
    reset({ name: dept.name, code: dept.code, description: dept.description });
    setModalOpen(true);
  };

  const onSubmit = async (formData: FormData) => {
    try {
      if (editing) {
        await departmentsApi.update(editing._id, formData);
        toast.success('Department updated');
      } else {
        await departmentsApi.create(formData);
        toast.success('Department created');
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
      await departmentsApi.remove(deleteTarget._id);
      toast.success('Department deleted');
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Departments</h1>
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={16} /> Add Department
        </button>
      </div>

      {loading ? (
        <Skeleton rows={4} cols={3} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.data.map((d) => (
            <div key={d._id} className="card">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-900/30">
                  <Building2 size={20} />
                </div>
                <div className="flex gap-2">
                  <button className="text-gray-400 hover:text-primary-600" onClick={() => openEdit(d)}>
                    <Pencil size={15} />
                  </button>
                  <button className="text-gray-400 hover:text-red-600" onClick={() => setDeleteTarget(d)}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{d.name}</h3>
              <p className="text-xs text-gray-500">{d.code}</p>
              <div className="mt-3 flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span>{d.studentCount ?? 0} students</span>
                <span>{d.teacherCount ?? 0} teachers</span>
                <span>{d.courseCount ?? 0} courses</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Department' : 'Add Department'} maxWidth="max-w-md">
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
        title="Delete department"
        message={`Are you sure you want to delete ${deleteTarget?.name}?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        confirmLabel="Delete"
      />
    </div>
  );
};

export default Departments;
