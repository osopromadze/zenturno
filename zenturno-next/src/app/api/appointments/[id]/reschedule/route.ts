import { NextRequest, NextResponse } from 'next/server';
import { rescheduleAppointment } from '@/app/actions/appointment';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = params.id;
    const formData = await request.formData();
    const result = await rescheduleAppointment(appointmentId, formData);
    
    if (result?.error) {
      return NextResponse.json(
        { error: result.error, fields: result.fields },
        { status: 400 }
      );
    }
    
    return NextResponse.redirect(new URL(`/appointments/${appointmentId}`, request.url));
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
