'use client';

import { useDroppable } from '@dnd-kit/core';
import TaskCard from './TaskCard';

type Task = {
  id: string;
  title: string;
  due_date?: string | null;
};

type ColumnProps = {
  column: {
    id: string;
    title: string;
  };
  tasks: Task[];
};

export default function Column({ column, tasks }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        background: isOver ? '#dbeafe' : '#f1f5f9',
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        padding: '16px',
        minHeight: '420px',
        transition: 'background 0.2s ease',
      }}
    >
      <h2
        style={{
          margin: '0 0 14px 0',
          fontSize: '18px',
          fontWeight: 700,
          color: '#111827',
        }}
      >
        {column.title}
      </h2>

      {tasks.length === 0 ? (
        <div
          style={{
            padding: '16px',
            borderRadius: '12px',
            background: '#f3ebeb',
            color: '#6b7280',
            border: '1px dashed #3a669c',
          }}
        >
          No tasks yet ✨
        </div>
      ) : (
        tasks.map((task) => <TaskCard key={task.id} task={task} />)
      )}
    </div>
  );
}