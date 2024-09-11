import express from 'express';
import cors from 'cors';
import { setupDatabase } from './db/database';
import { Database } from 'sqlite';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

interface SqliteError extends Error {
  code?: string;
}

function isSqliteError(error: unknown): error is SqliteError {
  return error instanceof Error && 'code' in error;
}

async function startServer() {
  const db: Database = await setupDatabase();

  // Get all buttons
  app.get('/buttons', async (req, res) => {
    try {
      const filter = req.query.filter as string;
      let buttons;

      if (filter) {
        buttons = await db.all('SELECT * FROM buttons WHERE name LIKE ?', [`%${filter}%`]);
      } else {
        buttons = await db.all('SELECT * FROM buttons');
      }

      res.json(buttons);
    } catch (error) {
      console.error('Error fetching buttons:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Add a new button
  app.post('/buttons', async (req, res) => {
    try {
      const { name } = req.body;
      const width = Math.floor(Math.random() * (500 - 50 + 1)) + 50;
      const height = Math.floor(Math.random() * (500 - 50 + 1)) + 50;
      
      const result = await db.run(
        'INSERT INTO buttons (name, width, height) VALUES (?, ?, ?)',
        [name, width, height]
      );
      
      res.status(201).json({ id: result.lastID, name, width, height });
    } catch (error) {
      console.error('Error adding button:', error);
      if (isSqliteError(error) && error.code === 'SQLITE_CONSTRAINT') {
        res.status(409).json({ error: 'A button with this name already exists' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // Update a button
  app.put('/buttons/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      
      await db.run('UPDATE buttons SET name = ? WHERE id = ?', [name, id]);
      
      const updatedButton = await db.get('SELECT * FROM buttons WHERE id = ? LIMIT 1', [id]);
      res.json(updatedButton);
    } catch (error) {
      console.error('Error updating button:', error);
      if (isSqliteError(error) && error.code === 'SQLITE_CONSTRAINT') {
        res.status(409).json({ error: 'A button with this name already exists' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // Delete a button
  app.delete('/buttons/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      await db.run('DELETE FROM buttons WHERE id = ?', [id]);
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting button:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  // Cleanup function
  const cleanup = async () => {
    console.log('Closing database connection...');
    await db.close();
    console.log('Database connection closed');
    process.exit(0);
  };

  // Handle graceful shutdown
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

startServer().catch(console.error);