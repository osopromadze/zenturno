/**
 * Data Transfer Object for user registration requests
 * 
 * This DTO defines the structure of data coming from the outside world
 * (e.g., from a REST API) for user registration.
 */
export interface RegisterUserDto {
  name: string;
  email: string;
  password: string;
  role?: string; // Optional, defaults to CLIENT
}
