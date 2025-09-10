import { sequelize } from "./config/db";

const checkTables = async () => {
  try {
    const [results] = await sequelize.query("SHOW TABLES;");
    console.log("📋 Tablas en la base de datos:");
    console.table(results);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error consultando tablas:", error);
    process.exit(1);
  }
};

checkTables();
