-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'client',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create professionals table
CREATE TABLE professionals (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  specialty VARCHAR(255),
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create clients table
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create services table
CREATE TABLE services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  datetime TIMESTAMP NOT NULL,
  client_id INTEGER REFERENCES clients(id),
  professional_id INTEGER REFERENCES professionals(id),
  service_id INTEGER REFERENCES services(id),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_professionals_user_id ON professionals(user_id);
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_appointments_client_id ON appointments(client_id);
CREATE INDEX idx_appointments_professional_id ON appointments(professional_id);
CREATE INDEX idx_appointments_service_id ON appointments(service_id);
CREATE INDEX idx_appointments_datetime ON appointments(datetime);

-- Insert sample data for testing
INSERT INTO users (name, email, password, role)
VALUES 
  ('Admin User', 'admin@zenturno.com', '$2b$10$XOPbrlUPQdwdJUpSrIF6X.MPaOGBw1KeWVDrSQw1MNbBaFS9LsLQy', 'admin'),  -- Password: Admin123!
  ('Professional User', 'profesional@zenturno.com', '$2b$10$XOPbrlUPQdwdJUpSrIF6X.MPaOGBw1KeWVDrSQw1MNbBaFS9LsLQy', 'professional'),  -- Password: Prof123!
  ('Client User', 'cliente@zenturno.com', '$2b$10$XOPbrlUPQdwdJUpSrIF6X.MPaOGBw1KeWVDrSQw1MNbBaFS9LsLQy', 'client');  -- Password: Cliente123!

-- Insert sample professionals
INSERT INTO professionals (name, specialty, user_id)
VALUES 
  ('Juan Perez', 'Haircut', 2);

-- Insert sample clients
INSERT INTO clients (name, phone, user_id)
VALUES 
  ('Maria Garcia', '123456789', 3);

-- Insert sample services
INSERT INTO services (name, price, duration_minutes)
VALUES 
  ('Haircut', 15.00, 30),
  ('Hair Coloring', 45.00, 90),
  ('Manicure', 20.00, 45),
  ('Pedicure', 25.00, 60),
  ('Facial Treatment', 35.00, 60);
