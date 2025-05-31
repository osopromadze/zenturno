#!/usr/bin/env node

/**
 * Script to test Prisma configuration with PostgreSQL
 * 
 * This script performs a series of basic operations to verify
 * that the Prisma configuration with PostgreSQL works correctly.
 */

const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcrypt');
const prisma = new PrismaClient();

// Colors for output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Function to print messages with colors
function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// Function to print errors
function logError(message, error) {
    console.error(`${colors.red}${message}${colors.reset}`);
    console.error(error);
}

// Function to run a test
async function runTest(name, testFn) {
    try {
        log(`\n🧪 Running test: ${name}...`, 'cyan');
        await testFn();
        log(`✅ Test completed: ${name}`, 'green');
        return true;
    } catch (error) {
        logError(`❌ Error in test: ${name}`, error);
        return false;
    }
}

// Main function
async function main() {
    log('🚀 Starting Prisma tests with PostgreSQL...', 'magenta');

    let successCount = 0;
    let failCount = 0;

    // Test 1: Database connection
    const test1 = await runTest('Database connection', async () => {
        await prisma.$connect();
        log('Connection established successfully', 'green');
    });

    if (test1) successCount++; else failCount++;

    // Test 2: Create a user
    const test2 = await runTest('Create a user', async () => {
        const hashedPassword = await hash('password123', 10);

        const user = await prisma.user.create({
            data: {
                name: 'Test User',
                email: `test-${Date.now()}@example.com`,
                password: hashedPassword,
                role: 'admin'
            }
        });

        log(`User created with ID: ${user.id}`, 'green');

        // Save ID for later tests
        global.testUserId = user.id;
    });

    if (test2) successCount++; else failCount++;

    // Test 3: Create a professional
    const test3 = await runTest('Create a professional', async () => {
        if (!global.testUserId) {
            throw new Error('Could not create test user');
        }

        const professional = await prisma.professional.create({
            data: {
                name: 'Test Professional',
                specialty: 'Automated Testing',
                user_id: global.testUserId
            }
        });

        log(`Professional created with ID: ${professional.id}`, 'green');

        // Save ID for later tests
        global.testProfessionalId = professional.id;
    });

    if (test3) successCount++; else failCount++;

    // Test 4: Create a service
    const test4 = await runTest('Create a service', async () => {
        const service = await prisma.service.create({
            data: {
                name: `Test Service ${Date.now()}`,
                price: 100.0,
                duration_minutes: 60
            }
        });

        log(`Service created with ID: ${service.id}`, 'green');

        // Save ID for later tests
        global.testServiceId = service.id;
    });

    if (test4) successCount++; else failCount++;

    // Test 5: Create a client
    const test5 = await runTest('Create a client', async () => {
        // Create a new user for the client
        const hashedPassword = await hash('password123', 10);

        const user = await prisma.user.create({
            data: {
                name: 'Test Client',
                email: `client-${Date.now()}@example.com`,
                password: hashedPassword,
                role: 'client'
            }
        });

        const client = await prisma.client.create({
            data: {
                name: 'Test Client',
                phone: '123456789',
                user_id: user.id
            }
        });

        log(`Client created with ID: ${client.id}`, 'green');

        // Save ID for later tests
        global.testClientId = client.id;
    });

    if (test5) successCount++; else failCount++;

    // Test 6: Create an appointment
    const test6 = await runTest('Create an appointment', async () => {
        if (!global.testClientId || !global.testProfessionalId || !global.testServiceId) {
            throw new Error('Could not create necessary entities for the appointment');
        }

        // Create an appointment for tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);

        const appointment = await prisma.appointment.create({
            data: {
                datetime: tomorrow,
                client_id: global.testClientId,
                professional_id: global.testProfessionalId,
                service_id: global.testServiceId,
                status: 'pending'
            }
        });

        log(`Appointment created with ID: ${appointment.id}`, 'green');

        // Save ID for later tests
        global.testAppointmentId = appointment.id;
    });

    if (test6) successCount++; else failCount++;

    // Test 7: Query appointments
    const test7 = await runTest('Query appointments', async () => {
        const appointments = await prisma.appointment.findMany({
            where: {
                client_id: global.testClientId
            },
            include: {
                client: true,
                professional: true,
                service: true
            }
        });

        log(`Found ${appointments.length} appointments for the client`, 'green');

        if (appointments.length === 0) {
            throw new Error('No appointments found for the client');
        }

        // Show details of the first appointment
        const appointment = appointments[0];
        log(`Appointment details:`, 'yellow');
        log(`- ID: ${appointment.id}`, 'yellow');
        log(`- Date: ${appointment.datetime}`, 'yellow');
        log(`- Client: ${appointment.client.name}`, 'yellow');
        log(`- Professional: ${appointment.professional.name}`, 'yellow');
        log(`- Service: ${appointment.service.name}`, 'yellow');
        log(`- Status: ${appointment.status}`, 'yellow');
    });

    if (test7) successCount++; else failCount++;

    // Test 8: Update an appointment
    const test8 = await runTest('Update an appointment', async () => {
        if (!global.testAppointmentId) {
            throw new Error('Could not create test appointment');
        }

        const updatedAppointment = await prisma.appointment.update({
            where: {
                id: global.testAppointmentId
            },
            data: {
                status: 'confirmed'
            }
        });

        log(`Appointment updated: ${updatedAppointment.id} - Status: ${updatedAppointment.status}`, 'green');

        if (updatedAppointment.status !== 'confirmed') {
            throw new Error('The appointment status was not updated correctly');
        }
    });

    if (test8) successCount++; else failCount++;

    // Test summary
    log('\n📊 Test summary:', 'magenta');
    log(`✅ Successful tests: ${successCount}`, 'green');
    log(`❌ Failed tests: ${failCount}`, 'red');

    if (failCount === 0) {
        log('\n🎉 All tests passed! The Prisma configuration with PostgreSQL is correct.', 'green');
    } else {
        log('\n⚠️ Some tests failed. Check the errors and fix the problems.', 'red');
    }

    // Close the connection
    await prisma.$disconnect();
}

// Execute the script
main()
    .catch((error) => {
        logError('Error executing the script', error);
        process.exit(1);
    });
