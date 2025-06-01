import { NextRequest, NextResponse } from 'next/server';
import { updateService } from '@/app/actions/service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const serviceId = params.id;
    const formData = await request.formData();
    const result = await updateService(serviceId, formData);
    
    if (result?.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
    
    return NextResponse.redirect(new URL(`/services/${serviceId}`, request.url));
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
