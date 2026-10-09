import { supabase } from '@/lib/supabase';

type Model = 'support_ladder' | 'silent_cards' | 'model_10_10_10' | 'beautiful_mistakes';

interface TrackArgs {
  studentId: string;
  studentName: string;
  model: Model;
  /** نص النشاط اللي هيظهر للمعلم في سجل الطالب. لو فاضي بنحدّث حساب الطالب بس. */
  action?: string;
  /** عدّاد يتزوّد (مثلاً cards_selected أو coupons_used) */
  increment?: 'cards_selected' | 'coupons_used' | 'help_requests_count' | 'mistakes_submitted';
  /** لو true: ما يسجّل حاجة لو الطالب موجود قبل كده (للدخول الأول للنموذج بس) */
  onlyIfNew?: boolean;
}

/**
 * يسجّل نشاط الطالب بحيث يظهر عند المعلم في الداشبورد وصفحة الطالب.
 * كل خطوة بتتأكد من النتيجة وبتطبع الخطأ في الكونسول (F12) بدل ما تسكت،
 * علشان لو في مشكلة صلاحيات (RLS) في سوبابيس تبان بوضوح.
 */
export async function trackStudentActivity({ studentId, studentName, model, action, increment, onlyIfNew }: TrackArgs) {
  const now = new Date().toISOString();

  // حساب الطالب في الداشبورد (student_stats)
  const { data: existing, error: selErr } = await supabase
    .from('student_stats').select('*')
    .eq('student_id', studentId).eq('model', model).maybeSingle();
  if (selErr) console.error('[track] student_stats select failed:', selErr.message, selErr);

  if (existing && onlyIfNew) return;

  // 1) سجل النشاط
  if (action) {
    const { error } = await supabase.from('student_activity_log').insert({
      student_id: studentId, student_name: studentName, action, model,
    });
    if (error) console.error('[track] student_activity_log insert failed:', error.message, error);
  }

  if (existing) {
    const patch: Record<string, any> = { student_name: studentName, last_activity_at: now };
    if (increment) patch[increment] = (existing[increment] || 0) + 1;
    const { error } = await supabase.from('student_stats').update(patch)
      .eq('student_id', studentId).eq('model', model);
    if (error) console.error('[track] student_stats update failed:', error.message, error);
  } else {
    const row: Record<string, any> = {
      student_id: studentId, student_name: studentName, model, last_activity_at: now,
    };
    if (increment) row[increment] = 1;
    const { error } = await supabase.from('student_stats').insert(row);
    if (error) console.error('[track] student_stats insert failed:', error.message, error);
  }
}
