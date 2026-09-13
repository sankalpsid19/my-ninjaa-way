import { prisma } from "../lib/prisma";

async function main() {
  console.log("Seeding modules...");
  
  const modules = [
    {
      slug: "calorie-calculator",
      title: "Calorie Calculator",
      description: "Estimate daily calorie & macro needs using BMR & TDEE scientific formulas.",
      icon: "Calculator",
      href: "/calorie-calculator",
    },
    {
      slug: "nutrition",
      title: "Nutrition Intelligence",
      description: "Track daily meals, calories, macros, vitamins, minerals, RDA gaps & daily habit focus.",
      icon: "Apple",
      href: "/nutrition",
    },
    {
      slug: "clients",
      title: "Client Management",
      description: "Manage client directory, services, billing, and access control.",
      icon: "Users",
      href: "/clients",
    },
  ];

  for (const mod of modules) {
    await prisma.module.upsert({
      where: { slug: mod.slug },
      update: {
        title: mod.title,
        description: mod.description,
        icon: mod.icon,
        href: mod.href,
      },
      create: mod,
    });
  }

  console.log("Modules seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
