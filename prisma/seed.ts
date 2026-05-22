import { PrismaClient, PlayerStatus, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@musicrent.local";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";
  const adminHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: adminHash,
      name: "Администратор",
      role: Role.ADMIN,
      balance: 0,
    },
  });

  const demoHash = await bcrypt.hash("demo1234", 10);
  await prisma.user.upsert({
    where: { email: "demo@musicrent.local" },
    update: {},
    create: {
      email: "demo@musicrent.local",
      password: demoHash,
      name: "Демо Пользователь",
      role: Role.USER,
      balance: 1000,
    },
  });

  const stationsData = [
    {
      name: "Метро Парк Культуры",
      address: "Москва, ул. Остоженка, 1",
      lat: 55.7361,
      lng: 37.5934,
    },
    {
      name: "Метро Чистые Пруды",
      address: "Москва, Чистопрудный б-р, 12",
      lat: 55.7654,
      lng: 37.6383,
    },
    {
      name: "Метро Маяковская",
      address: "Москва, Тверская ул., 24",
      lat: 55.7700,
      lng: 37.5956,
    },
    {
      name: "ВДНХ Главный вход",
      address: "Москва, пр. Мира, 119",
      lat: 55.8295,
      lng: 37.6325,
    },
    {
      name: "Парк Горького",
      address: "Москва, Крымский Вал, 9",
      lat: 55.7298,
      lng: 37.6011,
    },
  ];

  const FEATURED_MODEL = "AnalogWave";
  const REGULAR_PRICE = 100;
  const FLAGSHIP_PRICE = 150;

  const otherModels = [
    "Sony Walkman NW-A306",
    "iPod Classic Reborn",
    "FiiO M11S",
    "Astell&Kern A&norma SR25",
    "Shanling M3 Ultra",
  ];

  const existingStations = await prisma.station.count();
  if (existingStations === 0) {
    for (const data of stationsData) {
      const station = await prisma.station.create({ data });

      const playerCount = 3 + Math.floor(Math.random() * 4);
      for (let i = 0; i < playerCount; i++) {
        const model = otherModels[Math.floor(Math.random() * otherModels.length)];
        await prisma.player.create({
          data: {
            model,
            serialNumber: `${station.id.slice(-4).toUpperCase()}-${i + 1}-${Date.now().toString().slice(-5)}`,
            batteryLevel: 60 + Math.floor(Math.random() * 41),
            status: PlayerStatus.AVAILABLE,
            stationId: station.id,
            pricePerHour: REGULAR_PRICE,
            isFlagship: false,
          },
        });
      }
    }
    console.log(`Created ${stationsData.length} stations with random players.`);
  } else {
    console.log(`Skipping station seed: ${existingStations} stations already exist.`);
  }

  const allStations = await prisma.station.findMany();
  let featuredAdded = 0;
  for (const station of allStations) {
    const hasFeatured = await prisma.player.count({
      where: { stationId: station.id, model: FEATURED_MODEL },
    });
    if (hasFeatured === 0) {
      await prisma.player.create({
        data: {
          model: FEATURED_MODEL,
          serialNumber: `AW-${station.id.slice(-4).toUpperCase()}-${Date.now().toString().slice(-6)}`,
          batteryLevel: 100,
          status: PlayerStatus.AVAILABLE,
          stationId: station.id,
          pricePerHour: FLAGSHIP_PRICE,
          isFlagship: true,
        },
      });
      featuredAdded += 1;
    }
  }
  console.log(`AnalogWave: added to ${featuredAdded} station(s).`);

  const normalizedFlagship = await prisma.player.updateMany({
    where: { model: FEATURED_MODEL },
    data: { pricePerHour: FLAGSHIP_PRICE, isFlagship: true },
  });
  const normalizedRegular = await prisma.player.updateMany({
    where: { model: { not: FEATURED_MODEL } },
    data: { pricePerHour: REGULAR_PRICE, isFlagship: false },
  });
  console.log(
    `Normalized prices: ${normalizedFlagship.count} flagship (${FLAGSHIP_PRICE} ₽), ${normalizedRegular.count} regular (${REGULAR_PRICE} ₽).`,
  );

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
