import { prisma } from "../lib/prisma";

async function main() {
  console.log("Seeding database...");

  // Existing mock data
  const mockClients = [
    {
      id: "1",
      name: "Infinity Realtors",
      email: "alice@example.com",
      status: "Active",
      phone: "+1 234 567 8900",
      company: "Infinity Realtors",
      website: "https://infinity-realtors.vercel.app/",
      joinDate: "Jan 12, 2025",
      pocName: "Sharmistha Dey",
      pocEmail: "sharmisthamayur@gmail.com",
      services: [
        { name: "Web Application Development", startDate: "2026-01-15", endDate: "2027-01-14", price: 5000, status: "Active" },
        { name: "SEO Optimization", startDate: "2026-03-01", endDate: "2026-08-31", price: 1200, status: "Active" },
        { name: "Platform Maintenance", startDate: "2026-03-01", endDate: "2026-03-31", price: 300, status: "Active" }
      ],
      bills: [
        { month: "March 2026", amount: 6500, status: "Pending", datePaid: "-", invoiceUri: "#" },
        { month: "February 2026", amount: 5000, status: "Paid", datePaid: "Feb 05, 2026", invoiceUri: "#" }
      ]
    },
    {
      id: "2",
      name: "Bob Smith",
      email: "bob@example.com",
      status: "Inactive",
      phone: "+1 987 654 3210",
      company: "Global Corp",
      website: "",
      joinDate: "Sep 05, 2024",
      pocName: "John Doe",
      pocEmail: "john@globalcorp.com",
      services: [
        { name: "Cloud Hosting", startDate: "2025-09-01", endDate: "2026-08-31", price: 2400, status: "Inactive" }
      ],
      bills: []
    },
    {
      id: "3",
      name: "Charlie Davis",
      email: "charlie@example.com",
      status: "Active",
      phone: "+1 555 123 4567",
      company: "StartUp Inc",
      website: "",
      joinDate: "Mar 22, 2026",
      pocName: "Sarah Connor",
      pocEmail: "sarah@startup.inc",
      services: [
        { name: "Mobile App Development", startDate: "2026-04-01", endDate: "2026-10-31", price: 8500, status: "Active" }
      ],
      bills: []
    },
    {
      id: "4",
      name: "Diana Prince",
      email: "diana@example.com",
      status: "Active",
      phone: "+1 800 123 4567",
      company: "Wonder Corp",
      website: "",
      joinDate: "Dec 10, 2025",
      pocName: "Steve Trevor",
      pocEmail: "steve@wonder.corp",
      services: [
        { name: "Cybersecurity Audit", startDate: "2026-02-15", endDate: "2026-03-15", price: 3500, status: "Active" }
      ],
      bills: []
    },
    {
      id: "5",
      name: "Evan Wright",
      email: "evan@example.com",
      status: "Inactive",
      phone: "+1 555 987 6543",
      company: "Wright Enterprises",
      website: "",
      joinDate: "Jun 15, 2023",
      pocName: "Oliver Queen",
      pocEmail: "oliver@wright.ent",
      services: [
        { name: "IT Consulting", startDate: "2023-06-15", endDate: "2024-06-14", price: 5000, status: "Inactive" }
      ],
      bills: []
    },
  ];

  // Seed Admin User
  const bcrypt = await import("bcryptjs");
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "sankalpyadav96@gmail.com" },
    update: { role: "admin" },
    create: {
      name: "Sankalp Yadav",
      email: "sankalpyadav96@gmail.com",
      password: hashedPassword,
      role: "admin",
    },
  });
  console.log(`Admin user ready: ${adminUser.email}`);

  // Seed Default Modules
  const defaultModules = [
    {
      slug: "clients",
      title: "Clients",
      description: "Manage and view client details",
      icon: "👥",
      href: "/clients",
    },
    {
      slug: "calorie-calculator",
      title: "Calorie Calculator",
      description: "Calculate your BMR, maintenance calories (TDEE), and optimal macro splits.",
      icon: "🔥",
      href: "/calorie-calculator",
    },
    {
      slug: "daily-quests",
      title: "Daily Quests",
      description: "One quest per day, consistency heatmap, attributes, streaks & the Consistency Ladder.",
      icon: "⚔️",
      href: "/daily-quests",
    },
  ];

  for (const mod of defaultModules) {
    await prisma.module.upsert({
      where: { slug: mod.slug },
      update: mod,
      create: mod,
    });
    console.log(`Upserted module: ${mod.title}`);
  }

  for (const clientData of mockClients) {
    const { services, bills, ...clientInfo } = clientData;

    // Create client
    const client = await prisma.client.upsert({
      where: { email: clientInfo.email },
      update: {
        ...clientInfo,
        id: undefined, // Let DB generate UUID if it doesn't exist
      },
      create: {
        ...clientInfo,
        id: undefined,
      },
    });

    console.log(`Upserted client: ${client.name}`);

    // Create services
    for (const service of services) {
      await prisma.service.create({
        data: {
          ...service,
          clientId: client.id,
        },
      });
    }

    // Create bills
    for (const bill of bills) {
      await prisma.bill.create({
        data: {
          ...bill,
          clientId: client.id,
        },
      });
    }
  }

  // Seed Achievement Catalogue — Daily Quests Gamification Module (§5.3, §6.5)
  const achievements = [
    { code: "first-blood", name: "First Blood", description: "Complete your very first quest.", icon: "🥇", color: "#eab308", predicate: JSON.stringify({ completedDays: 1 }), order: 1 },
    { code: "climber", name: "Climber", description: "Reach half the top rung on any Consistency Ladder pillar.", icon: "🧗", color: "#f97316", predicate: JSON.stringify({ maxLadderPercent: 0.5 }), order: 2 },
    { code: "summit", name: "Summit", description: "Reach the top rung on any Consistency Ladder pillar.", icon: "🏁", color: "#8b5cf6", predicate: JSON.stringify({ maxLadderPercent: 1 }), order: 3 },
    { code: "on-a-roll", name: "On A Roll", description: "Maintain a 7-day completion streak.", icon: "🔥", color: "#ef4444", predicate: JSON.stringify({ streak: 7 }), order: 4 },
    { code: "iron-fist", name: "Iron Fist", description: "Earn 50 Strength attribute points.", icon: "💪", color: "#f43f5e", predicate: JSON.stringify({ strength: 50 }), order: 5 },
    { code: "bookworm", name: "Bookworm", description: "Complete 30 Study or Reading quests.", icon: "🧠", color: "#3b82f6", predicate: JSON.stringify({ studyReading: 30 }), order: 6 },
    { code: "zen-eyes", name: "Zen Eyes", description: "Earn 30 Sense attribute points.", icon: "👁️", color: "#10b981", predicate: JSON.stringify({ sense: 30 }), order: 7 },
    { code: "early-riser", name: "Early Riser", description: "Finish 10 quests before 9 AM.", icon: "☀️", color: "#f59e0b", predicate: JSON.stringify({ earlyCompletions: 10 }), order: 8 },
    { code: "legend", name: "Legend", description: "Reach Level 10.", icon: "🐲", color: "#a855f7", predicate: JSON.stringify({ level: 10 }), order: 9 },
  ];

  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { code: ach.code },
      update: ach,
      create: ach,
    });
  }
  console.log(`Achievement catalogue ready: ${achievements.length} achievements`);

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
