/**
 * MongoDB Seed Script
 * Run: node seed.js
 * This seeds the database with initial users from the original MySQL data.
 * Passwords are the same bcrypt hashes from the original database.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Consultation = require('./models/Consultation');

const users = [
  { username: 'mugisha', email: 'chret40@gmail.com', password: '$2b$10$i3rfhPzqPl5.YspMSVpCP.VAII9EyQXFbcnIW4BliiJV3JHj9jwxe', role: 'client' },
  { username: 'tumusifu', email: 'mugishatumusifuchretien@gmail.com', password: '$2b$10$kVLZyYhjs3WgzcSRl9laaO6J48lUnTuP.PMEiOvR0PzPHmVS4Ngge', role: 'client' },
  { username: 'Sanyu', email: 'sanyurebecca@gmail.com', password: '$2b$10$j4mM9ywOJUye/dnXhJ80B.1u5TcP3GvCUQB39a8fr3U0nIjf96zFG', role: 'admin' },
  { username: 'weii', email: 'weii@gmail.com', password: '$2b$10$uvt4Izezxs3QYhSVDpS/eeZ5qdzKK0jR3/jL8J4ejWtYdyWFvQlT6', role: 'client' },
  { username: 'caleb', email: 'icewaystudios@gmail.com', password: '$2b$10$XWafZw1KEVjcr.HsJVPt/OFx82HjDkaz9Eh2a5Z.xnm3yUgi6KoQ.', role: 'client' },
  { username: 'Afani', email: 'mugishaafani@gmail.com', password: '$2b$10$WfW6EDOZjfKgSrRfNSHgVOqhIbp01P9EFf3/JsNXwDsbCy7tKSIPi', role: 'client' },
  { username: 'Manager', email: 'manager@gmail.com', password: '$2b$10$gdIotHeFqqxgMwOPSTlUruQ7InimjF5bYE9XPM0NHjrNJ3JHe78bK', role: 'manager' },
  { username: 'client', email: 'client@gmail.com', password: '$2b$10$iXlhVqZQQEDu9C47Y5EcfeHVAhnjx4MYmWh6i6Px8C14BY9HCceny', role: 'client' },
  { username: 'chre', email: 'chretienmugisha@gmail.com', password: '$2b$10$iOhlNujcCSXOEuEYidNQLOooWvWeaB7yuHtBqaniG6oeIk3whIXOa', role: 'admin' },
  { username: 'mugi', email: 'mugi@gmail.com', password: '$2b$10$c9NHdTcguZtRUTiQNalkCux/IkctTlms8Pnx0ri5mJQ.zUOXKsyGG', role: 'client' },
];

const consultations = [
  { first_name: 'Mugisha', last_name: 'Chretien', email: 'mugishatumusifuchretien@gmail.com', phone: '0796418405', company_org: 'IceWeii', subject: 'Consultation', service: 'Research', message: 'Hello There!', status: 'pending', submitted_at: new Date('2025-08-04T08:54:51') },
  { first_name: 'Patient', last_name: 'Tumusifu', email: 'mugishatumusifuchretien@gmail.com', phone: '0796418405', company_org: 'Ice Tech Solutions', subject: 'Consultation', service: 'Business-Strategy', message: 'Okay There!', status: 'pending', submitted_at: new Date('2025-08-04T09:01:49') },
  { first_name: 'Igiraneza', last_name: 'Naomi', email: 'igiranezanaomi@gmail.com', phone: '0796418405', company_org: 'IceWay', subject: 'Proposal', service: 'Capacity-Building', message: 'My Operations', status: 'pending', submitted_at: new Date('2025-08-04T11:40:00') },
  { first_name: 'Sanyu', last_name: 'Patient', email: 'sanyurebecca@gmail.com', phone: '0788888888', company_org: 'BK', subject: 'Consultation', service: 'Policy-Formulation', message: 'Okay Okay', status: 'approved', submitted_at: new Date('2025-08-04T11:40:41') },
  { first_name: 'Rebecca', last_name: 'Patient', email: 'sanyurebecca@gmail.com', phone: '0788888888', company_org: 'IceWay', subject: 'Consultations', service: 'Business-Strategy', message: 'Muuu', status: 'pending', submitted_at: new Date('2025-08-04T11:41:34') },
  { first_name: 'Mugisha', last_name: 'Tumusifu', email: 'mugishatumusifuchretien@gmail.com', phone: '0796418405', company_org: 'Ice Tech Solutions', subject: 'Consultation', service: 'Business-Strategy', message: 'mm', status: 'approved', submitted_at: new Date('2025-08-05T12:05:33') },
  { first_name: 'Weii', last_name: 'Patient', email: 'sanopatient@gmail.com', phone: '0788888888', company_org: 'BK', subject: 'Proposal', service: 'Business-Strategy', message: 'nn', status: 'dismissed', submitted_at: new Date('2025-08-05T12:41:58') },
  { first_name: 'Mugisha Chre', last_name: 'Tumusifu', email: 'mugi@gmail.com', phone: '0796418405', company_org: 'IceWay', subject: 'Consultation', service: 'Policy-Formulation', message: 'Giiiii', status: 'pending', submitted_at: new Date('2025-08-05T12:47:03') },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Consultation.deleteMany({});
    console.log('Cleared existing data');

    // Insert users
    await User.insertMany(users);
    console.log(`Seeded ${users.length} users`);

    // Insert consultations
    await Consultation.insertMany(consultations);
    console.log(`Seeded ${consultations.length} consultations`);

    console.log('Seed completed successfully!');
    console.log('Admin credentials: Sanyu / original password, or chre / original password');
    console.log('Manager credentials: Manager / original password');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await mongoose.connection.close();
  }
}

seed();