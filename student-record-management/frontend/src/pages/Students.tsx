import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Download, Upload } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { useDebounce } from '../hooks/useDebounce';
import { studentsApi, coursesApi, departmentsApi, semestersApi } from '../api/endpoints';
import type { Student, Course, Department, Semester, PaginatedResponse } from '../types';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Skeleton from '../components/Skeleton';
import Badge from '../components/Badge';
import { useAuth } from '../context/AuthContext';

interface StudentFormData {
  name: string;
  email: string;
  password?: string;
  rollNumber: string;
  course: string;
  department: string;
  currentSemester: string;
  batchYear: number;
  phone?: string;
  guardianName?: string;
  guardianPhone?: string;
}

const Students = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);

  const { data, loading, refetch } = useFetch<PaginatedResponse<Student>>(
    () => studentsApi.list({ search: debouncedSearch, page, limit: 10 }),
    [debouncedSearch, page]
  );
  const { data: courseData } = useFetch<{ data: Course[] }>(() => coursesApi.list({ limit: 100 }), []);
  const { data: deptData } = useFetch<{ data: Department[] }>(() => departmentsApi.list({ limit: 100 }), []);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<StudentFormData>();

  const selectedCourse = watch('course');
  const { data: semesterData } = useFetch<{ data: Semester[] }>(
    () => semestersApi.byCourse(selectedCourse),
    [selectedCourse]
  );

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', email: '', rollNumber: '', course: '', department: '', currentSemester: '', batchYear: new Date().getFullYear() });
    setModalOpen(true);
  };

  const openEdit = (student: Student) => {
    setEditing(student);
    reset({
      name: student.user.name,
      email: student.user.email,
      rollNumber: student.rollNumber,
      course: typeof student.course === 'object' ? student.course._id : student.course,
      department: typeof student.department === 'object' ? student.department._id : student.department,
      currentSemester: typeof student.currentSemester === 'object' ? student.currentSemester._id : student.currentSemester,
      batchYear: student.batchYear,
      phone: student.phone,
      guardianName: student.guardianName,
      guardianPhone: student.guardianPhone,
    });
    setModalOpen(true);
  };

  const onSubmit = async (formData: StudentFormData) => {
    try {
      if (editing) {
        await studentsApi.update(editing._id, formData);
        toast.success('Student updated');
      } else {
        await studentsApi.create(formData);
        toast.success('Student created');
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
      await studentsApi.remove(deleteTarget._id);
      toast.success('Student deleted');
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    }
  };

  const handleExport = async () => {
    const res = await studentsApi.exportCsv();
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'students.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await studentsApi.importCsv(formData);
      const { created, skipped } = res.data.results;
      toast.success(`Imported ${created} students (${skipped} skipped)`);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Import failed');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Students</h1>
        <div className="flex flex-wrap items-center gap-2">
          <SearchBar value={search} onChange={setSearch} placeholder="Search students..." />
          {isAdmin && (
            <>
              <button className="btn-secondary" onClick={handleExport}>
                <Download size={16} /> Export
              </button>
              <label className="btn-secondary cursor-pointer">
                <Upload size={16} /> Import
                <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
              </label>
              <button className="btn-primary" onClick={openCreate}>
                <Plus size={16} /> Add Student
              </button>
            </>
          )}
        </div>
      </div>

      <div className="card overflow-x-auto p-0">
        {loading ? (
          <div className="p-5">
            <Skeleton rows={6} cols={6} />
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="table-th">Roll No.</th>
                <th className="table-th">Name</th>
                <th className="table-th">Course</th>
                <th className="table-th">Semester</th>
                <th className="table-th">Status</th>
                {isAdmin && <th className="table-th text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {data?.data.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="table-td font-medium">{s.rollNumber}</td>
                  <td className="table-td">
                    <div>{s.user.name}</div>
                    <div className="text-xs text-gray-400">{s.user.email}</div>
                  </td>
                  <td className="table-td">{s.course?.name}</td>
                  <td className="table-td">{s.currentSemester?.name}</td>
                  <td className="table-td">
                    <Badge status={s.status} />
                  </td>
                  {isAdmin && (
                    <td className="table-td text-right">
                      <button className="mr-2 text-gray-400 hover:text-primary-600" onClick={() => openEdit(s)}>
                        <Pencil size={16} />
                      </button>
                      <button className="text-gray-400 hover:text-red-600" onClick={() => setDeleteTarget(s)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {data?.data.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-gray-500">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
        {data && <Pagination page={data.page} limit={data.limit} total={data.total} onPageChange={setPage} />}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Student' : 'Add Student'} maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            <label className="label">Roll Number</label>
            <input className="input" {...register('rollNumber', { required: 'Required' })} />
          </div>
          <div>
            <label className="label">Batch Year</label>
            <input type="number" className="input" {...register('batchYear', { required: 'Required', valueAsNumber: true })} />
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
            <label className="label">Course</label>
            <select className="input" {...register('course', { required: 'Required' })}>
              <option value="">Select course</option>
              {courseData?.data.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Semester</label>
            <select className="input" {...register('currentSemester', { required: 'Required' })}>
              <option value="">Select semester</option>
              {semesterData?.data.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" {...register('phone')} />
          </div>
          <div>
            <label className="label">Guardian Name</label>
            <input className="input" {...register('guardianName')} />
          </div>
          <div>
            <label className="label">Guardian Phone</label>
            <input className="input" {...register('guardianPhone')} />
          </div>
          {!editing && (
            <div className="sm:col-span-2">
              <label className="label">Password (optional, defaults to Student@123)</label>
              <input type="password" className="input" {...register('password')} />
            </div>
          )}
          <div className="flex justify-end gap-3 sm:col-span-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editing ? 'Save changes' : 'Create student'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete student"
        message={`Are you sure you want to delete ${deleteTarget?.user.name}? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        confirmLabel="Delete"
      />
    </div>
  );
};

export default Students;
