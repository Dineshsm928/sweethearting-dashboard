'use server';

import { getValidationQueue, approveTask, rejectTask } from '@/lib/gcs';
import { revalidatePath } from 'next/cache';

export async function fetchQueue(date?: string) {
  try {
    const queue = await getValidationQueue(date);
    return { success: true, queue };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function handleApprove(taskId: string) {
  try {
    const ok = await approveTask(taskId);
    if (!ok) throw new Error('Task not found or incomplete');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function handleReject(taskId: string) {
  try {
    const ok = await rejectTask(taskId);
    if (!ok) throw new Error('Task not found');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
