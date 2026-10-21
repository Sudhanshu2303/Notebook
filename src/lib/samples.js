import { toDateKey } from './journal.js';
import { uid } from './id.js';
import { dayKeyFromToday, newTask } from './todos.js';

const DAY = 24 * 60 * 60 * 1000;

// Example content for new users who'd rather look around than start from a blank page.
export function sampleTasks() {
  const plan = newTask({ title: 'Plan the week', priority: 'medium', due: dayKeyFromToday(0) });
  plan.notes = 'Tap a task to see its notes and subtasks.';
  plan.subtasks = [
    { id: uid(), title: 'Check the calendar', done: true },
    { id: uid(), title: 'Pick my top 3 priorities', done: false },
  ];
  return [
    plan,
    newTask({ title: 'Finish the project draft', priority: 'high', due: dayKeyFromToday(2) }),
    newTask({ title: 'Buy groceries', priority: 'low', due: dayKeyFromToday(1) }),
  ];
}

export function sampleEntries() {
  const now = Date.now();
  const yesterday = now - DAY;
  return [
    {
      id: uid(),
      title: 'A slow, good day',
      body: 'Went for a long walk and finally sorted out my desk. Small wins, but it felt good to get them done.',
      mood: 4,
      energy: 3,
      tags: ['walk', 'small-wins'],
      date: toDateKey(new Date(yesterday)),
      createdAt: yesterday,
      updatedAt: yesterday,
    },
    {
      id: uid(),
      title: 'Starting my notebook',
      body: 'Trying out a daily journal. The plan: a few lines each day, a mood, and a tag or two so I can spot patterns later.',
      mood: 5,
      energy: 4,
      tags: ['goals'],
      date: toDateKey(new Date(now)),
      createdAt: now,
      updatedAt: now,
    },
  ];
}
