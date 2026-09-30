import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';

async function migrate() {
  await connectDB();
  const res = await User.updateMany({ role: 'SUPER_ADMIN' }, { $set: { role: 'ADMIN' } });
  console.log('✓ Successfully migrated roles to ADMIN. Count:', res.modifiedCount);
  await disconnectDB();
  process.exit(0);
}

migrate();
