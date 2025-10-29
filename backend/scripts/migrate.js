#!/usr/bin/env node

/**
 * Script de migración para crear el esquema de base de datos
 * Uso: node scripts/migrate.js
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();
const db = require('../config/database');

async function runMigration() {
  console.log('\n📋 Iniciando migración de base de datos...\n');

  try {
    // Leer archivo de esquema
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    console.log('📁 Leyendo schema.sql...');

    // Ejecutar esquema
    console.log('🔨 Creando tablas...');
    await db.pool.query(schema);
    console.log('✅ Tablas creadas exitosamente');

    // Leer archivo de seed
    const seedPath = path.join(__dirname, '../database/seed.sql');
    const seed = fs.readFileSync(seedPath, 'utf-8');

    console.log('\n🌱 Cargando datos iniciales...');
    await db.pool.query(seed);
    console.log('✅ Datos iniciales cargados\n');

    console.log('🎉 Migración completada exitosamente!\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error en la migración:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();
