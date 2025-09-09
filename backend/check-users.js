const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...');
    
    const users = await prisma.user.findMany({
      include: {
        role: true
      }
    });
    
    console.log(`📊 Found ${users.length} users in database`);
    
    if (users.length > 0) {
      console.log('\n👥 Users:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Status: ${user.status}`);
        console.log(`   Role: ${user.role?.role_type || 'No role'}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log('---');
      });
    } else {
      console.log('❌ No users found in database');
      console.log('💡 You need to create a user first!');
    }
    
  } catch (error) {
    console.error('❌ Error checking users:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();


