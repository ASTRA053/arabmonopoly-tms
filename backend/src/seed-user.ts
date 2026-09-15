import { DataSource } from 'typeorm';
import { User } from './users/user.entity';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from './data-source';

async function createTestUser() {
  const ds = await AppDataSource.initialize();

  const email = process.env.TEST_USER_EMAIL?.toLowerCase();
  const password = process.env.TEST_USER_PASSWORD;
  const name = process.env.TEST_USER_NAME || 'Test User';
  if (!email || !password) {
    throw new Error('TEST_USER_EMAIL and TEST_USER_PASSWORD must be set before seeding users');
  }
  const exists = await ds.getRepository(User).findOne({ where: { email } });
  if (exists) {
    console.log('User already exists');
    await ds.destroy();
    return;
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = ds.getRepository(User).create({
    email,
    password: hashed,
    name,
    role: 'USER', // or whatever roles you have
  });

  await ds.getRepository(User).save(user);
  console.log('User created:', email);

  await ds.destroy();
}

createTestUser().catch(console.error);