'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import Column from '@/components/Column';

type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';

type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  user_id: string;
  created_at: string;
  due_date?: string | null;
};

const columns: { id: TaskStatus; title: string }[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'in_review', title: 'In Review' },
  { id: 'done', title: 'Done' },
];

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    const initUser = async () => {
      setErrorMessage('');

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUserId(session.user.id);
        return;
      }

      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) {
        console.error('Anonymous sign-in error:', error.message);
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        setUserId(data.user.id);
      }
    };

    initUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchTasks();
    }
  }, [userId]);

  const fetchTasks = async () => {
    setLoading(true);
    setErrorMessage('');

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Fetch error:', error.message);
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setTasks((data as Task[]) || []);
    setLoading(false);
  };

  const addTask = async () => {
    if (!newTitle.trim()) return;

    setErrorMessage('');

    const {
      data: { session },
    } = await supabase.auth.getSession();

    let currentUserId = session?.user?.id;

    if (!currentUserId) {
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) {
        console.error('Anonymous sign-in error:', error.message);
        setErrorMessage(error.message);
        return;
      }

      currentUserId = data.user.id;
      setUserId(currentUserId);
    }

    const { error } = await supabase.from('tasks').insert({
      title: newTitle.trim(),
      status: 'todo',
      user_id: currentUserId,
      due_date: dueDate || null,
    });

    if (error) {
      console.error('Insert error:', error.message);
      setErrorMessage(error.message);
      return;
    }

    setNewTitle('');
    setDueDate('');
    fetchTasks();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    const existingTask = tasks.find((task) => task.id === taskId);

    if (!existingTask || existingTask.status === newStatus) return;

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );

    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId);

    if (error) {
      console.error('Update error:', error.message);
      setErrorMessage(error.message);
      fetchTasks();
    }
  };

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === 'done').length;
  const inProgressTasks = tasks.filter(
    (task) => task.status === 'in_progress'
  ).length;
  const reviewTasks = tasks.filter(
    (task) => task.status === 'in_review'
  ).length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueTasks = tasks.filter((task) => {
    if (!task.due_date || task.status === 'done') return false;
    const due = new Date(task.due_date);
    due.setHours(0, 0, 0, 0);
    return due < today;
  }).length;

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0f0f0f',
        padding: '32px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 700,
            marginBottom: '8px',
            color: '#f9fafb',
          }}
        >
          Mahendravarmaa&apos;s Kanban Board
        </h1>

        <p
          style={{
            color: '#9ca3af',
            marginBottom: '24px',
            fontSize: '15px',
          }}
        >
          Make each day your masterpiece
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              background: '#1a1a1a',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #2a2a2a',
            }}
          >
            <div style={{ color: '#9ca3af', fontSize: '13px' }}>Total Tasks</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#f97316' }}>
              {totalTasks}
            </div>
          </div>

          <div
            style={{
              background: '#1a1a1a',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #2a2a2a',
            }}
          >
            <div style={{ color: '#9ca3af', fontSize: '13px' }}>In Progress</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#f97316' }}>
              {inProgressTasks}
            </div>
          </div>

          <div
            style={{
              background: '#1a1a1a',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #2a2a2a',
            }}
          >
            <div style={{ color: '#9ca3af', fontSize: '13px' }}>In Review</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#f97316' }}>
              {reviewTasks}
            </div>
          </div>

          <div
            style={{
              background: '#1a1a1a',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #2a2a2a',
            }}
          >
            <div style={{ color: '#9ca3af', fontSize: '13px' }}>Completed</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#f97316' }}>
              {completedTasks}
            </div>
          </div>

          <div
            style={{
              background: '#1a1a1a',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #2a2a2a',
            }}
          >
            <div style={{ color: '#9ca3af', fontSize: '13px' }}>Overdue</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#f97316' }}>
              {overdueTasks}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '16px',
            flexWrap: 'wrap',
          }}
        >
          <input
            type="text"
            placeholder="Enter task"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            style={{
              padding: '12px 14px',
              width: '260px',
              border: '1px solid #333333',
              borderRadius: '10px',
              outline: 'none',
              background: '#111111',
              color: '#f9fafb',
            }}
          />

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            style={{
              padding: '12px 14px',
              border: '1px solid #333333',
              borderRadius: '10px',
              outline: 'none',
              background: '#111111',
              color: '#f9fafb',
            }}
          />

          <button
            onClick={addTask}
            style={{
              padding: '12px 18px',
              border: 'none',
              borderRadius: '10px',
              background: '#f97316',
              color: '#ffffff',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(249, 115, 22, 0.35)',
            }}
          >
            Add Task
          </button>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '12px 14px',
              width: '260px',
              border: '1px solid #333333',
              borderRadius: '10px',
              outline: 'none',
              background: '#111111',
              color: '#f9fafb',
            }}
          />
        </div>

        {errorMessage && (
          <div
            style={{
              marginBottom: '20px',
              padding: '12px 14px',
              borderRadius: '10px',
              background: '#3b0d0d',
              color: '#fca5a5',
              border: '1px solid #7f1d1d',
            }}
          >
            {errorMessage}
          </div>
        )}

        {loading ? (
          <p style={{ color: '#9ca3af' }}>Loading tasks...</p>
        ) : (
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gap: '16px',
              }}
            >
              {columns.map((column) => (
                <Column
                  key={column.id}
                  column={column}
                  tasks={filteredTasks.filter((task) => task.status === column.id)}
                />
              ))}
            </div>
          </DndContext>
        )}
      </div>
    </main>
  );
}