const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function resetAdmin() {
  try {
    // Reset admin password to admin123
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const user = await prisma.user.update({
      where: { email: 'admin@example.com' },
      data: { password: hashedPassword }
    });
    
    console.log('✅ Admin password reset to "admin123"');
    console.log('👤 User:', user.firstName, user.lastName);
    
    // Test the new password
    const isValid = await bcrypt.compare('admin123', user.password);
    console.log('✅ Password test:', isValid);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

resetAdmin();
