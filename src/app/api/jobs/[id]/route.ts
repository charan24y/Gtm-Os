import { NextResponse } from 'next/server';
import { jobEngine } from '@/lib/jobs/engine';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    const job = await jobEngine.getJobStatus(jobId);

    if (!job) {
      return NextResponse.json({ error: 'Job not found.' }, { status: 404 });
    }

    return NextResponse.json({ job });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    const cancelled = await jobEngine.cancelJob(jobId);

    if (!cancelled) {
      return NextResponse.json(
        { error: 'Job cannot be cancelled (either not found or already completed/cancelled).' },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: 'Job successfully cancelled.', jobId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
