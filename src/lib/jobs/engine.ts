/**
 * Durable Background Job Engine
 * Persists status, attempts, backoff retries, and cancellation state in the database.
 */

import { gtmDb } from '../db/store';
import { JobRun } from '../db/types';

export type JobHandler = (
  payload: Record<string, unknown>,
  signal: { isCancelled: () => Promise<boolean> }
) => Promise<Record<string, unknown>>;

class JobEngine {
  private handlers = new Map<string, JobHandler>();

  registerHandler(type: string, handler: JobHandler) {
    this.handlers.set(type, handler);
  }

  async enqueueJob(workspaceId: string, type: string, payload: Record<string, unknown>): Promise<JobRun> {
    const job = await gtmDb.createJob(workspaceId, type, payload);
    // Trigger asynchronous execution without blocking caller
    this.executeJob(job.id).catch((err) => {
      console.error(`[JobEngine] Background execution error on job ${job.id}:`, err);
    });
    return job;
  }

  async cancelJob(jobId: string): Promise<boolean> {
    const job = await gtmDb.getJob(jobId);
    if (!job || job.status === 'COMPLETED' || job.status === 'CANCELLED') {
      return false;
    }
    await gtmDb.updateJob(jobId, { status: 'CANCELLED' });
    return true;
  }

  async getJobStatus(jobId: string): Promise<JobRun | null> {
    return gtmDb.getJob(jobId);
  }

  private async executeJob(jobId: string, maxAttempts = 3): Promise<void> {
    const job = await gtmDb.getJob(jobId);
    if (!job || job.status === 'CANCELLED') return;

    const handler = this.handlers.get(job.type);
    if (!handler) {
      await gtmDb.updateJob(jobId, {
        status: 'FAILED',
        error_message: `No registered handler for job type: ${job.type}`,
      });
      return;
    }

    const nextAttempt = job.attempts + 1;
    await gtmDb.updateJob(jobId, { status: 'RUNNING', attempts: nextAttempt });

    const cancellationSignal = {
      isCancelled: async () => {
        const current = await gtmDb.getJob(jobId);
        return current?.status === 'CANCELLED';
      },
    };

    try {
      const result = await handler(job.payload, cancellationSignal);

      // Check if cancelled during run
      if (await cancellationSignal.isCancelled()) {
        return;
      }

      await gtmDb.updateJob(jobId, {
        status: 'COMPLETED',
        payload: { ...job.payload, result },
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);

      if (nextAttempt < maxAttempts) {
        // Exponential backoff retry
        const backoffMs = Math.pow(2, nextAttempt) * 1000;
        console.warn(`[JobEngine] Job ${jobId} failed attempt ${nextAttempt}/${maxAttempts}. Retrying in ${backoffMs}ms...`);
        setTimeout(() => {
          this.executeJob(jobId, maxAttempts);
        }, backoffMs);
      } else {
        await gtmDb.updateJob(jobId, {
          status: 'FAILED',
          error_message: `Exceeded ${maxAttempts} attempts: ${errorMsg}`,
        });
      }
    }
  }
}

export const jobEngine = new JobEngine();
