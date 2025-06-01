'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { User } from '@/domain/user/User';
import { Client } from '@/domain/client/Client';
import { Professional } from '@/domain/professional/Professional';
import { UserRole } from '@/domain/user/UserRole';

/**
 * Updates the user profile
 */
export async function updateProfile(formData: FormData) {
  // Create Supabase client
  const supabase = createClient();
  
  // Check if user is logged in
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return { error: 'Not authenticated' };
  }
  
  try {
    // Get form data
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const specialty = formData.get('specialty') as string;
    
    // Validate name
    if (!name || name.trim() === '') {
      return { error: 'Name is required' };
    }
    
    // Get user from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single();
    
    if (userError) {
      console.error('Error fetching user:', userError);
      return { error: 'Failed to fetch user data' };
    }
    
    // Create user entity
    const user = User.fromDatabaseRow(userData);
    
    // Update user name
    user.setName(name);
    
    // Update user in database
    const { error: updateError } = await supabase
      .from('users')
      .update(user.toDatabaseUpdateDto())
      .eq('id', user.getId());
    
    if (updateError) {
      console.error('Error updating user:', updateError);
      return { error: 'Failed to update user data' };
    }
    
    // Handle role-specific updates
    const role = user.getRole().getValue();
    
    if (role === UserRole.CLIENT && phone) {
      // Get client data
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.getId())
        .single();
      
      if (clientError && clientError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching client:', clientError);
        return { error: 'Failed to fetch client data' };
      }
      
      if (clientData) {
        // Update existing client
        const client = Client.fromDatabaseRow(clientData);
        client.setPhone(phone);
        
        const { error: updateClientError } = await supabase
          .from('clients')
          .update(client.toDatabaseUpdateDto())
          .eq('id', client.getId());
        
        if (updateClientError) {
          console.error('Error updating client:', updateClientError);
          return { error: 'Failed to update client data' };
        }
      } else {
        // Create new client
        const client = Client.create({
          name: user.getName(),
          phone,
          userId: user.getId()
        });
        
        const { error: insertClientError } = await supabase
          .from('clients')
          .insert(client.toDatabaseInsertDto());
        
        if (insertClientError) {
          console.error('Error creating client:', insertClientError);
          return { error: 'Failed to create client data' };
        }
      }
    } else if (role === UserRole.PROFESSIONAL && specialty) {
      // Get professional data
      const { data: professionalData, error: professionalError } = await supabase
        .from('professionals')
        .select('*')
        .eq('user_id', user.getId())
        .single();
      
      if (professionalError && professionalError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching professional:', professionalError);
        return { error: 'Failed to fetch professional data' };
      }
      
      if (professionalData) {
        // Update existing professional
        const professional = Professional.fromDatabaseRow(professionalData);
        professional.setSpecialty(specialty);
        
        const { error: updateProfessionalError } = await supabase
          .from('professionals')
          .update(professional.toDatabaseUpdateDto())
          .eq('id', professional.getId());
        
        if (updateProfessionalError) {
          console.error('Error updating professional:', updateProfessionalError);
          return { error: 'Failed to update professional data' };
        }
      } else {
        // Create new professional
        const professional = Professional.create({
          name: user.getName(),
          specialty,
          userId: user.getId()
        });
        
        const { error: insertProfessionalError } = await supabase
          .from('professionals')
          .insert(professional.toDatabaseInsertDto());
        
        if (insertProfessionalError) {
          console.error('Error creating professional:', insertProfessionalError);
          return { error: 'Failed to create professional data' };
        }
      }
    }
    
    // Redirect to profile page
    redirect('/profile?updated=true');
  } catch (error) {
    console.error('Error updating profile:', error);
    return { error: 'An unexpected error occurred' };
  }
}
