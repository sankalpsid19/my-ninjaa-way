import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const newPassword = process.argv[2];

  if (!newPassword) {
    console.error("Usage: npx tsx prisma/reset-admin-password.ts <new-password>");
    process.exit(1);
  }

  if (newPassword.length < 6) {
    console.error("Password must be at least 6 characters.");
    process.exit(1);
  }

  const email = process.env.ADMIN_EMAIL || "sankalpyadav96@gmail.com";
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const updated = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: "admin",
    },
    create: {
      name: "Sankalp Yadav",
      email,
      password: hashedPassword,
      role: "admin",
    },
  });

  console.log(`✅ Successfully set new password for admin user (${updated.email})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
