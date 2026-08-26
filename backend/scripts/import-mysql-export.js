import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import mongoose from 'mongoose';
import { User, Consultation } from '../server/models/index.js';

function extractInsert(sql, table) {
  const pattern = "INSERT INTO `" + table + "` VALUES ([\\s\\S]*?);";
  const match = sql.match(new RegExp(pattern, 'i'));
  return match ? match[1] : '';
}

function splitRows(input) {
  const rows = [];
  let current = '';
  let depth = 0;
  let quote = false;
  let escaped = false;
  for (const char of input) {
    if (quote) {
      current += char;
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === "'") quote = false;
      continue;
    }
    if (char === "'") { quote = true; current += char; }
    else if (char === '(') { depth += 1; if (depth > 1) current += char; }
    else if (char === ')') { depth -= 1; if (depth === 0) { rows.push(current); current = ''; } else current += char; }
    else if (depth > 0) current += char;
  }
  return rows;
}

function splitValues(row) {
  const values = [];
  let current = '';
  let quote = false;
  let escaped = false;
  for (const char of row) {
    if (quote) {
      if (escaped) { current += char; escaped = false; }
      else if (char === '\\') escaped = true;
      else if (char === "'") quote = false;
      else current += char;
    } else if (char === "'") quote = true;
    else if (char === ',') { values.push(current.trim()); current = ''; }
    else current += char;
  }
  values.push(current.trim());
  return values.map((value) => value === 'NULL' ? null : value.replace(/\\r/g, '\r').replace(/\\n/g, '\n').replace(/\\'/g, "'").replace(/\\\\/g, '\\'));
}

const file = process.argv[2] || path.resolve('database/consulting_site.sql');
const sql = await fs.readFile(file, 'utf8');
const consultationRows = splitRows(extractInsert(sql, 'consultations')).map(splitValues);
const userRows = splitRows(extractInsert(sql, 'users')).map(splitValues);
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hobucoltd');
const consultations = consultationRows.map((row) => ({ first_name: row[1], last_name: row[2], email: row[3], phone: row[4] || '', company_org: row[5] || '', subject: row[6] || '', service: row[7] || '', message: row[8] || '', submitted_at: row[9] ? new Date(row[9]) : new Date(), status: row[10] || 'pending' }));
const users = userRows.map((row) => ({ username: row[1], email: row[2], password: row[3], role: row[4] || 'client' }));
if (process.env.REPLACE_DATA === 'true') { await Consultation.deleteMany({}); await User.deleteMany({}); }
if (consultations.length) await Consultation.insertMany(consultations, { ordered: false }).catch((error) => console.warn('Some consultation rows were skipped:', error.message));
if (users.length) await User.insertMany(users, { ordered: false }).catch((error) => console.warn('Some user rows were skipped:', error.message));
console.log(`Imported ${consultations.length} consultation rows and ${users.length} user rows from ${file}`);
await mongoose.disconnect();
