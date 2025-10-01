/*
  Verification script to check seed data
  - Verifies users exist
  - Checks account table entries
*/

import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { db } from '../src/lib/db';
import * as schema from '../src/lib/db/schema';

async function verifyUsers() {
  const emails = [
    'alice@example.com',
    'bob@example.com',
    'charlie@example.com',
  ];

  console.log('Verifying seeded users...\n');

  for (const email of emails) {
    // Check user
    const user = await db
      .select()
      .from(schema.user)
      .where(eq(schema.user.email, email))
      .limit(1);

    if (user.length === 0) {
      console.log(`❌ User ${email} not found`);
      continue;
    }

    console.log(`✅ User ${email} found:`, {
      id: user[0].id,
      name: user[0].name,
      email: user[0].email,
    });

    // Check account
    const account = await db
      .select()
      .from(schema.account)
      .where(eq(schema.account.userId, user[0].id))
      .limit(1);

    if (account.length === 0) {
      console.log(`  ⚠️  No account entry found for ${email}`);
    } else {
      console.log(`  ✅ Account entry found:`, {
        id: account[0].id,
        providerId: account[0].providerId,
        accountId: account[0].accountId,
        hasPassword: !!account[0].password,
      });
    }
    console.log('');
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  await verifyUsers();
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
