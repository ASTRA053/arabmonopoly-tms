import { DataSource } from 'typeorm';
import { User } from './users/user.entity';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from './data-source';

async function createTestUser() {
  const ds = await AppDataSource.initialize();

  const email = 'test@tms.local';
  const exists = await ds.getRepository(User).findOne({ where: { email } });
  if (exists) {
    console.log('User already exists');
    await ds.destroy();
    return;
  }

  const password = 'Test1234!';
  const hashed = await bcrypt.hash(password, 10);

  const user = ds.getRepository(User).create({
    email,
    password: hashed,
    name: 'Test User',
    role: 'USER', // or whatever roles you have
  });

  await ds.getRepository(User).save(user);
  console.log('User created:', email);

  await ds.destroy();
}

createTestUser().catch(console.error);