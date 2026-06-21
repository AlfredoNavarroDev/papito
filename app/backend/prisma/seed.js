const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcrypt");
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });




async function main() {
  console.log("Seeding database...");

  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@coffeevibes.com" },
    update: {},
    create: {
      email: "admin@coffeevibes.com",
      name: "Admin",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  const ownerPassword = await bcrypt.hash("owner123", 10);

  const owner = await prisma.user.upsert({
    where: { email: "owner@coffeevibes.com" },
    update: {},
    create: {
      email: "owner@coffeevibes.com",
      name: "Dueno Coffee Vibes",
      password: ownerPassword,
      role: "OWNER",
    },
  });

  const customerPassword = await bcrypt.hash("test123", 10);

  const customer = await prisma.user.upsert({
    where: { email: "cliente@test.com" },
    update: {},
    create: {
      email: "cliente@test.com",
      name: "Cliente Test",
      password: customerPassword,
      role: "CUSTOMER",
    },
  });

  const categoriesData = [
    { name: "Cafe en Grano", slug: "cafe-en-grano" },
    { name: "Cafe Molido", slug: "cafe-molido" },
    { name: "Bebidas Calientes", slug: "bebidas-calientes" },
    { name: "Bebidas Frias", slug: "bebidas-frias" },
    { name: "Accesorios", slug: "accesorios" },
  ];

  const categories = {};
  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categories[cat.slug] = category;
  }

  const productsData = [
    {
      name: "Cafe Arábica Peruano",
      description: "Cafe de especialidad cultivado en las alturas de Chanchamayo",
      imageUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e",
      categorySlug: "cafe-en-grano",
      productType: "grano",
      basePrice: 25.0,
      stock: 50,
      hasSizes: false,
    },
    {
      name: "Cafe Colombiano Supremo",
      description: "Cafe colombiano de exportacion, sabor suave y aroma intenso",
      imageUrl: "https://images.unsplash.com/photo-1587734195503-904fca47e0e9",
      categorySlug: "cafe-en-grano",
      productType: "grano",
      basePrice: 28.0,
      stock: 40,
      hasSizes: false,
    },
    {
      name: "Cafe Molido Clasico",
      description: "Cafe molido para preparacion en filtro o prensa francesa",
      imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefda",
      categorySlug: "cafe-molido",
      productType: "molido",
      basePrice: 22.0,
      stock: 60,
      hasSizes: false,
    },
    {
      name: "Cafe Molido Descafeinado",
      description: "Cafe molido descafeinado, mismo sabor sin la cafeina",
      imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93",
      categorySlug: "cafe-molido",
      productType: "molido",
      basePrice: 24.0,
      stock: 30,
      hasSizes: false,
    },
    {
      name: "Espresso",
      description: "Cafe espresso clasico",
      imageUrl: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a",
      categorySlug: "bebidas-calientes",
      productType: "bebida",
      basePrice: 8.0,
      stock: 100,
      hasSizes: true,
    },
    {
      name: "Cafe Latte",
      description: "Cafe latte con leche vaporizada",
      imageUrl: "https://images.unsplash.com/photo-1572442388796-11668a67e53d",
      categorySlug: "bebidas-calientes",
      productType: "bebida",
      basePrice: 10.0,
      stock: 80,
      hasSizes: true,
    },
    {
      name: "Cold Brew",
      description: "Cafe de extraccion en frio, suave y refrescante",
      imageUrl: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735",
      categorySlug: "bebidas-frias",
      productType: "bebida",
      basePrice: 12.0,
      stock: 60,
      hasSizes: true,
    },
    {
      name: "Frappe de Cafe",
      description: "Cafe frappe con hielo y crema",
      imageUrl: "https://images.unsplash.com/photo-1525803377221-718e83daef4f",
      categorySlug: "bebidas-frias",
      productType: "bebida",
      basePrice: 14.0,
      stock: 50,
      hasSizes: false,
    },
    {
      name: "Taza Ceramica Coffee Vibes",
      description: "Taza de ceramica con logo de Coffee Vibes",
      imageUrl: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d",
      categorySlug: "accesorios",
      productType: "accesorio",
      basePrice: 18.0,
      stock: 30,
      hasSizes: false,
    },
    {
      name: "Prensa Francesa",
      description: "Prensa francesa de vidrio para preparar cafe",
      imageUrl: "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd",
      categorySlug: "accesorios",
      productType: "accesorio",
      basePrice: 45.0,
      stock: 20,
      hasSizes: false,
    },
  ];

  for (const prod of productsData) {
    const existingProduct = await prisma.product.findFirst({
      where: { name: prod.name },
    });

    if (!existingProduct) {
      const product = await prisma.product.create({
        data: {
          name: prod.name,
          description: prod.description,
          imageUrl: prod.imageUrl,
          categoryId: categories[prod.categorySlug].id,
          productType: prod.productType,
          basePrice: prod.basePrice,
          stock: prod.stock,
          hasSizes: prod.hasSizes,
        },
      });

      if (prod.hasSizes) {
        await prisma.productSize.createMany({
          data: [
            { productId: product.id, size: "SMALL", price: prod.basePrice },
            { productId: product.id, size: "MEDIUM", price: prod.basePrice + 2.0 },
            { productId: product.id, size: "LARGE", price: prod.basePrice + 4.0 },
          ],
        });
      }

      if (prod.productType === "bebida") {
        await prisma.productModifier.createMany({
          data: [
            { productId: product.id, name: "Shot extra de espresso", extraPrice: 2.0 },
            { productId: product.id, name: "Leche de almendras", extraPrice: 1.5 },
            { productId: product.id, name: "Crema batida", extraPrice: 1.0 },
          ],
        });
      }
    }
  }

  console.log("Seed completed successfully");
  console.log("  Admin: admin@coffeevibes.com / admin123");
  console.log("  Owner: owner@coffeevibes.com / owner123");
  console.log("  Customer: cliente@test.com / test123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
