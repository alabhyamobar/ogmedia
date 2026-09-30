import readline from 'readline';
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { ROLES, SERVICES, AUDIT_ACTIONS } from '../constants/index.js';
import { AuditLog } from '../models/AuditLog.js';
import { logger } from '../utils/logger.js';

dotenv.config();

function prompt(rl, question, hidden = false) {
  return new Promise((resolve) => {
    if (!hidden) {
      rl.question(question, (answer) => resolve(answer.trim()));
    } else {
      // In terminal environments, ask for password
      rl.question(question, (answer) => resolve(answer.trim()));
    }
  });
}

function parseCliArgs() {
  const args = process.argv.slice(2);
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      const next = args[i + 1];
      if (next && !next.startsWith('--')) {
        parsed[key] = next;
        i++;
      } else {
        parsed[key] = true;
      }
    }
  }
  return parsed;
}

async function createSuperAdmin() {
  console.log('\n=============================================');
  console.log('    OG MEDIA CRM - CREATE SUPER ADMIN        ');
  console.log('=============================================\n');

  await connectDB();

  const cliArgs = parseCliArgs();
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
    const name = cliArgs.name || (await prompt(rl, 'Enter Admin Full Name: '));
    const username = (cliArgs.username || (await prompt(rl, 'Enter Admin Username: '))).toLowerCase();
    const email = (cliArgs.email || (await prompt(rl, 'Enter Admin Email: '))).toLowerCase();
    const password = cliArgs.password || (await prompt(rl, 'Enter Admin Password (min 8 chars): ', true));

    if (!name || !username || !email || !password) {
      console.error('\n[Error] All fields (Name, Username, Email, Password) are required.');
      process.exit(1);
    }

    if (password.length < 8) {
      console.error('\n[Error] Password must be at least 8 characters long.');
      process.exit(1);
    }

    // Check if user already exists
    const existing = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existing) {
      console.error(
        `\n[Error] An account with username "${username}" or email "${email}" already exists.`
      );
      process.exit(1);
    }

    const passwordHash = await User.hashPassword(password);

    const admin = await User.create({
      name,
      username,
      email,
      passwordHash,
      role: ROLES.SUPER_ADMIN,
      expertise: Object.values(SERVICES), // Super admin has access to all services
      status: 'ACTIVE',
      mustChangePassword: false
    });

    await AuditLog.create({
      action: AUDIT_ACTIONS.EMPLOYEE_CREATED,
      targetType: 'USER',
      targetId: admin._id.toString(),
      performedByName: 'CLI_INITIALIZER',
      role: ROLES.SUPER_ADMIN,
      details: { role: ROLES.SUPER_ADMIN, username: admin.username, email: admin.email }
    }).catch(() => {});

    console.log('\n---------------------------------------------');
    console.log('✓ SUPER ADMIN CREATED SUCCESSFULLY!');
    console.log(`  ID:       ${admin._id}`);
    console.log(`  Name:     ${admin.name}`);
    console.log(`  Username: ${admin.username}`);
    console.log(`  Email:    ${admin.email}`);
    console.log(`  Role:     ${admin.role}`);
    console.log('---------------------------------------------\n');
  } catch (error) {
    console.error('\n[Fatal Error] Could not create Super Admin:', error.message);
  } finally {
    rl.close();
    await disconnectDB();
    process.exit(0);
  }
}

createSuperAdmin();
