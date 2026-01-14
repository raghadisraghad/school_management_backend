import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const seedAdmin = async () => {
  try {
    
    const adminExists = await User.findOne({ username: 'admin' });
    if (adminExists) return;

    console.log('No admin found. Creating initial admin user...');

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin123!', 10);

    const admin = new User({
      role: 0,
      firstName: 'System',
      lastName: 'Admin',
      username: 'admin',
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: hashedPassword,
      birthDate: new Date('1970-01-01'), 
      tel: '00000000',                   
      status: true                       
    });

    await admin.save();
    console.log('✅ Initial Admin user created.');
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
  }
};

export default seedAdmin;