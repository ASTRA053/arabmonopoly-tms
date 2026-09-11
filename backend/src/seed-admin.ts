import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './users/user.entity';      // adjust path if needed
import { AppDataSource } from './data-source';   // adjust path if needed

async function createAdmin() {
  const ds = await AppDataSource.initialize();

  const email = 'admin@tms.local';
  const repo = ds.getRepository(User);

  const exists = await repo.findOne({ where: { email } });
  if (exists) {
    console.log('Admin already exists:', email);
    await ds.destroy();
    return;
  }

  const password = 'Admin1234!';
  const hashed = await bcrypt.hash(password, 10);

  const admin = repo.create({
    email,
    password: hashed,
    name: 'Ahmed',
    role: 'ADMIN', // or 'admin' depending on your enum/string
  });

  await repo.save(admin);
  console.log('Admin created:', email, 'with password:', password);

  await ds.destroy();
}

createAdmin().catch(console.error);