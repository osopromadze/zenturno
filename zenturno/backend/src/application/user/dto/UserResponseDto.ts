/**
 * Data Transfer Object for user responses
 * 
 * This DTO defines the structure of user data sent back to the outside world.
 * It excludes sensitive information like passwords.
 */
export interface UserResponseDto {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}
