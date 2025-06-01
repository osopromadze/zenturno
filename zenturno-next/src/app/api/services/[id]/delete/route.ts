import { NextRequest, NextResponse } from 'next/server';
import { deleteService } from '@/app/actions/service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const serviceId = params.id;
    const result = await deleteService(serviceId);
    
    if (result?.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
    
    return NextResponse.redirect(new URL('/services', request.url));
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
