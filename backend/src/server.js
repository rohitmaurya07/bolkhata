import app from './app.js';
import { connectDB } from './config/db.js';
import { ensureDefaultCategories } from './controllers/categoryController.js';
import { seedDemoData } from './utils/seedData.js';


// second commit

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await ensureDefaultCategories();
    await seedDemoData();

    app.listen(PORT, () => {
      console.log(`[BolKhata API] Server listening on port ${PORT}`);
      console.log(`[BolKhata API] Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('[BolKhata API] Server startup error:', err);
    process.exit(1);
  }
};

startServer();
