'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

type Task = {
  id: string;
  title: string;
  due_date?: string | null;
};

export default function TaskCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = task.due_date ? new Date(task.due_date) : null;

  let dueLabel = '';
  let dueColor = '#6b7280';

  if (due) {
    due.setHours(0, 0, 0, 0);
    const diff = due.getTime() - today.getTime();
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      dueLabel = 'Overdue';
      dueColor = '#dc2626';
    } else if (daysLeft <= 2) {
      dueLabel = 'Due soon';
      dueColor = '#d97706';
    } else {
      dueLabel = 'Upcoming';
      dueColor = '#2563eb';
    }
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        ...style,
        background: '#ffffff',
        padding: '14px',
        borderRadius: '12px',
        marginBottom: '12px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
        cursor: 'grab',
      }}
    >
      <div
        style={{
          fontWeight: 600,
          color: '#111827',
          fontSize: '15px',
          marginBottom: '6px',
        }}
      >
        {task.title}
      </div>

      <div style={{ fontSize: '12px', color: '#6b7280' }}>
        Drag to update status
      </div>

      {task.due_date && (
        <div style={{ marginTop: '10px' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: dueColor,
            }}
          >
            {dueLabel} · {task.due_date}
          </span>
        </div>
      )}
    </div>
  );
}