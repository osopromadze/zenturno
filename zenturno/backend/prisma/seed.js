const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcrypt');

const prisma = new PrismaClient();

/**
 * Function to seed the database with initial data
 */
async function main() {
    console.log('🌱 Starting seeding process...');

    // Create users
    console.log('Creating users...');

    // Admin user
    const adminPassword = await hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@zenturno.com' },
        update: {},
        create: {
            name: 'Administrator',
            email: 'admin@zenturno.com',
            password: adminPassword,
            role: 'admin',
        },
    });
    console.log(`Admin user created: ${admin.id}`);

    // Professional users
    const professionalPassword = await hash('prof123', 10);
    const professional1 = await prisma.user.upsert({
        where: { email: 'juan@zenturno.com' },
        update: {},
        create: {
            name: 'Juan Perez',
            email: 'juan@zenturno.com',
            password: professionalPassword,
            role: 'professional',
        },
    });

    const professional2 = await prisma.user.upsert({
        where: { email: 'maria@zenturno.com' },
        update: {},
        create: {
            name: 'Maria Garcia',
            email: 'maria@zenturno.com',
            password: professionalPassword,
            role: 'professional',
        },
    });

    console.log(`Professional user created: ${professional1.id}`);
    console.log(`Professional user created: ${professional2.id}`);

    // Client users
    const clientPassword = await hash('client123', 10);
    const client1 = await prisma.user.upsert({
        where: { email: 'cliente1@example.com' },
        update: {},
        create: {
            name: 'Client One',
            email: 'cliente1@example.com',
            password: clientPassword,
            role: 'client',
        },
    });

    const client2 = await prisma.user.upsert({
        where: { email: 'cliente2@example.com' },
        update: {},
        create: {
            name: 'Client Two',
            email: 'cliente2@example.com',
            password: clientPassword,
            role: 'client',
        },
    });

    console.log(`Client user created: ${client1.id}`);
    console.log(`Client user created: ${client2.id}`);

    // Create professionals
    console.log('Creating professionals...');

    const prof1 = await prisma.professional.upsert({
        where: { user_id: professional1.id },
        update: {},
        create: {
            name: 'Juan Perez',
            specialty: 'Haircut',
            user_id: professional1.id,
        },
    });

    const prof2 = await prisma.professional.upsert({
        where: { user_id: professional2.id },
        update: {},
        create: {
            name: 'Maria Garcia',
            specialty: 'Manicure',
            user_id: professional2.id,
        },
    });

    console.log(`Professional created: ${prof1.id}`);
    console.log(`Professional created: ${prof2.id}`);

    // Create clients
    console.log('Creating clients...');

    const clientOne = await prisma.client.upsert({
        where: { user_id: client1.id },
        update: {},
        create: {
            name: 'Client One',
            phone: '123456789',
            user_id: client1.id,
        },
    });

    const clientTwo = await prisma.client.upsert({
        where: { user_id: client2.id },
        update: {},
        create: {
            name: 'Client Two',
            phone: '987654321',
            user_id: client2.id,
        },
    });

    console.log(`Client created: ${clientOne.id}`);
    console.log(`Client created: ${clientTwo.id}`);

    // Create services
    console.log('Creating services...');

    const service1 = await prisma.service.upsert({
        where: { name: 'Haircut' },
        update: {},
        create: {
            name: 'Haircut',
            price: 20.0,
            duration_minutes: 30,
        },
    });

    const service2 = await prisma.service.upsert({
        where: { name: 'Hair Coloring' },
        update: {},
        create: {
            name: 'Hair Coloring',
            price: 50.0,
            duration_minutes: 90,
        },
    });

    const service3 = await prisma.service.upsert({
        where: { name: 'Manicure' },
        update: {},
        create: {
            name: 'Manicure',
            price: 15.0,
            duration_minutes: 45,
        },
    });

    console.log(`Service created: ${service1.id}`);
    console.log(`Service created: ${service2.id}`);
    console.log(`Service created: ${service3.id}`);

    // Create some appointments
    console.log('Creating appointments...');

    // Date for today at 10:00
    const today = new Date();
    today.setHours(10, 0, 0, 0);

    // Date for tomorrow at 15:00
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(15, 0, 0, 0);

    // Date for day after tomorrow at 11:30
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    dayAfterTomorrow.setHours(11, 30, 0, 0);

    const appointment1 = await prisma.appointment.create({
        data: {
            datetime: today,
            client_id: clientOne.id,
            professional_id: prof1.id,
            service_id: service1.id,
            status: 'confirmed',
        },
    });

    const appointment2 = await prisma.appointment.create({
        data: {
            datetime: tomorrow,
            client_id: clientTwo.id,
            professional_id: prof2.id,
            service_id: service3.id,
            status: 'pending',
        },
    });

    const appointment3 = await prisma.appointment.create({
        data: {
            datetime: dayAfterTomorrow,
            client_id: clientOne.id,
            professional_id: prof2.id,
            service_id: service3.id,
            status: 'pending',
        },
    });

    console.log(`Appointment created: ${appointment1.id}`);
    console.log(`Appointment created: ${appointment2.id}`);
    console.log(`Appointment created: ${appointment3.id}`);

    console.log('🌱 Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
