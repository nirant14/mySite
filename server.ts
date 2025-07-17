import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { MongoClient, Db } from 'mongodb';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';
import bcrypt from 'bcrypt';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  const mongoUrl = 'mongodb://localhost:27017';
  const dbName = 'mySite';
  let db: Db;

  // Only start the server after MongoDB is connected
  function startServer() {
    const port = process.env['PORT'] || 3000;
    server.listen(port, () => {
      console.log(`Node Express server listening on http://localhost:${port}`);
    });
  }

  MongoClient.connect(mongoUrl).then((client) => {
    db = client.db(dbName);
    console.log('Connected to MongoDB');
    startServer();
  });

  // Middleware to parse JSON bodies
  server.use(express.json());

  // Example Express Rest API endpoints
  server.post('/api/change-password', async (req, res) => {
    if (!db) {
      res.status(503).json({ error: 'Database not connected' });
      return;
    }
    const { username, oldPassword, newPassword } = req.body;
    if (!username || !oldPassword || !newPassword) {
      res.status(400).json({ error: 'Missing fields' });
      return;
    }
    try {
      const user = await db.collection('users').findOne({ username });
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      const match = await bcrypt.compare(oldPassword, user['password']);
      if (!match) {
        res.status(401).json({ error: 'Old password is incorrect' });
        return;
      }
      const hashed = await bcrypt.hash(newPassword, 10);
      await db.collection('users').updateOne(
        { username },
        { $set: { password: hashed } }
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to change password' });
    }
  });
  server.get('/api/users', async (req, res) => {
    if (!db) {
      res.status(503).json({ error: 'Database not connected' });
      return;
    }
    try {
      const users = await db
        .collection('users')
        .find({}, { projection: { _id: 0, username: 1 } })
        .toArray();
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  server.delete('/api/users/:username', async (req, res) => {
    if (!db) {
      res.status(503).json({ error: 'Database not connected' });
      return;
    }
    try {
      const result = await db
        .collection('users')
        .deleteOne({ username: req.params.username });
      if (result.deletedCount === 1) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete user' });
    }
  });

  // Serve static files from /browser
  server.get(
    '*.*',
    express.static(browserDistFolder, {
      maxAge: '1y',
    })
  );

  // All regular routes use the Angular engine
  // (MUST be last route)
  server.get('*', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

// No need for run() anymore; server starts after MongoDB connects
