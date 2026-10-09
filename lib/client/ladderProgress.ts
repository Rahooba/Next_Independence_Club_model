// Helpers to compute support-ladder step progress from student_activity_log rows.
export const TOTAL_LADDER_STEPS = 5;

export const STEP_DONE_PREFIX = 'أنهى الخطوة';
export const STEP_UNDO_PREFIX = 'ألغى الخطوة';
export const COUPON_ACTION_MARK = 'استخدم كوبون';

export interface ActivityRow {
  student_id: string;
  action: string;
  activity_time?: string;
}

/** Returns Map<studentId, Set<stepNumber>> using the latest event per step (done / undone). */
export function computeStepsByStudent(rows: ActivityRow[]): Map<string, Set<number>> {
  const sorted = [...rows].sort((a, b) =>
    new Date(a.activity_time || 0).getTime() - new Date(b.activity_time || 0).getTime()
  );
  const result = new Map<string, Set<number>>();
  for (const r of sorted) {
    const m = r.action?.match(/الخطوة\s*(\d+)/);
    if (!m) continue;
    const step = parseInt(m[1], 10);
    const set = result.get(r.student_id) ?? new Set<number>();
    if (r.action.startsWith(STEP_DONE_PREFIX)) set.add(step);
    else if (r.action.startsWith(STEP_UNDO_PREFIX)) set.delete(step);
    result.set(r.student_id, set);
  }
  return result;
}
