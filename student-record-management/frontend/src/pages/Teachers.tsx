import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Download } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { useDebounce } from '../hooks/useDebounce';
import { teachersApi, departmentsApi } from '../api/endpoints';
import type { Teacher, Department, PaginatedResponse } from '../types';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Skeleton from '../components/Skeleton';

interface TeacherFormData {
  name: string;
  email: string;
  password?: string;
  employeeId: string;
  department: string;
  designation: string;
  qualification?: string;
  phone?: string;
}

const DESIGNATIONS = ['Assistant Professor', 'Associate Professor', 'Professor', 'Lecturer', 'HOD'];

const Teachers = () => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Teacher | null>(null);

  const { data, loading, refetch } = useFetch<PaginatedResponse<Teacher>>(
    () => teachersApi.list({ search: debouncedSearch, page, limit: 10 }),
    [debouncedSearch, page]
  );
  const { data: deptData } = useFetch<{ data: Department[] }>(() => departmentsApi.list({ limit: 100 }), []);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TeacherFormData>();

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', email: '', employeeId: '', department: '', designation: 'Assistant Professor' });
    setModalOpen(true);
  };

  const openEdit = (teacher: Teacher) => {
    setEditing(teacher);
    reset({
      name: teacher.user.name,
      email: teacher.user.email,
      employeeId: teacher.employeeId,
      department: typeof teacher.department === 'object' ? teacher.department._id : teacher.department,
      designation: teacher.designation,
      qualification: teacher.qualification,
      phone: teacher.phone,
    });
    setModalOpen(true);
  };

  const onSubmit = async (formData: TeacherFormData) => {
    try {
      if (editing) {
        await teachersApi.update(editing._id, formData);
        toast.success('Teacher updated');
      } else {
        await teachersApi.create(formData);
        toast.success('Teacher created');
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
      await teachersApi.remove(deleteTarget._id);
      toast.success('Teacher deleted');
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    }
  };

  const handleExport = async () => {
    const res = await teachersApi.exportCsv();
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'teachers.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teachers</h1>
        <div className="flex flex-wrap items-center gap-2">
          <SearchBar value={search} onChange={setSearch} placeholder="Search teachers..." />
          <button className="btn-secondary" onClick={handleExport}>
            <Download size={16} /> Export
          </button>
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={16} /> Add Teacher
          </button>
        </div>
      </div>

      <div className="card overflow-x-auto p-0">
        {loading ? (
          <div className="p-5"><Skeleton rows={6} cols={5} /></div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="table-th">Employee ID</th>
                <th className="table-th">Name</th>
                <th className="table-th">Department</th>
                <th className="table-th">Designation</th>
                <th className="table-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {data?.data.map((t) => (
                <tr key={t._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="table-td font-medium">{t.employeeId}</td>
                  <td className="table-td">
                    <div>{t.user.name}</div>
                    <div className="text-xs text-gray-400">{t.user.email}</div>
                  </td>
                  <td className="table-td">{typeof t.department === 'object' ? t.department.name : ''}</td>
                  <td className="table-td">{t.designation}</td>
                  <td className="table-td text-right">
                    <button className="mr-2 text-gray-400 hover:text-primary-600" onClick={() => openEdit(t)}>
                      <Pencil size={16} />
                    </button>
                    <button className="text-gray-400 hover:text-red-600" onClick={() => setDeleteTarget(t)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {data?.data.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-sm text-gray-500">No teachers found.</td></tr>
              )}
            </tbody>
          </table>
        )}
        {data && <Pagination page={data.page} limit={data.limit} total={data.total} onPageChange={setPage} />}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Teacher' : 'Add Teacher'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input className="input" {...register('name', { required: 'Required' })} />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" {...register('email', { required: 'Required' })} />
          </div>
          <div>
            <label className="label">Employee ID</label>
            <input className="input" {...register('employeeId', { required: 'Required' })} />
          </div>
          <div>
            <label className="label">Department</label>
            <select className="input" {...register('department', { required: 'Required' })}>
              <option value="">Select department</option>
              {deptData?.data.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Designation</label>
            <select className="input" {...register('designation')}>
              {DESIGNATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Qualification</label>
            <input className="input" {...register('qualification')} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" {...register('phone')} />
          </div>
          {!editing && (
            <div>
              <label className="label">Password (optional, defaults to Teacher@123)</label>
              <input type="password" className="input" {...register('password')} />
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Save changes' : 'Create teacher'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete teacher"
        message={`Are you sure you want to delete ${deleteTarget?.user.name}? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        confirmLabel="Delete"
      />
    </div>
  );
};

export default Teachers;
