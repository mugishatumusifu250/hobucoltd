# HOBUCO Backend

This folder contains the Node.js/Express API and MongoDB persistence layer. MySQL has been fully replaced with Mongoose models in `server/models/`. The original SQL exports are retained in `database/` only as import sources.

## Install and run

```bash
cp .env.example .env
npm install
npm start
```

The backend listens on port `3001` by default. It serves the sibling `frontend/dist` build and `frontend/public` assets when the frontend has been built.

MongoDB must be available through `MONGODB_URI`, for example:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/hobucoltd
SESSION_SECRET=replace-with-a-long-random-secret
```

## Import existing SQL data

Start MongoDB, then run this from the backend folder:

```bash
npm run seed
```

The importer reads `database/consulting_site.sql`, converts the `users` and `consultations` rows to MongoDB documents, and preserves existing bcrypt password hashes. To use another SQL export:

```bash
node scripts/import-mysql-export.js database/1.mydb.sql
```

Use `REPLACE_DATA=true npm run seed` only when intentionally replacing the existing MongoDB collections.

## Backend directories

`server/routes/` contains the Express API routes. `server/models/` contains the MongoDB schemas. `scripts/` contains the SQL-to-MongoDB importer. `database/` contains the supplied SQL exports used as migration input.
