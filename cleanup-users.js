
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const adminId = 'cmko8lb4z0000vmzcq1plsspw'; // usama

    console.log(`Preserving Admin ID: ${adminId}`);

    const result = await prisma.user.deleteMany({
        where: {
            id: {
                not: adminId
            }
        }
    });

    console.log(`Deleted ${result.count} users.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
