import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './users/user.entity';      // adjust path if needed
import { AppDataSource } from './data-source';   // adjust path if needed

async function createAdmin() {
  const ds = await AppDataSource.initialize();

  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || 'Admin';
  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set before seeding users');
  }
  const repo = ds.getRepository(User);

  const exists = await repo.findOne({ where: { email } });
  if (exists) {
    console.log('Admin already exists:', email);
    await ds.destroy();
    return;
  }

  const hashed = await bcrypt.hash(password, 10);

  const admin = repo.create({
    email,
    password: hashed,
    name,
    role: 'ADMIN', // or 'admin' depending on your enum/string
  });

  await repo.save(admin);
  console.log('Admin created:', email);

  await ds.destroy();
}

createAdmin().catch(console.error);