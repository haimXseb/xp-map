// API endpoint to serve project files
// For Vercel serverless function

export default async function handler(req, res) {
  const fs = require('fs');
  const path = require('path');

  const { file } = req.query;

  if (!file) {
    return res.status(400).json({ error: 'File parameter required' });
  }

  try {
    // Security: only allow reading from project root
    const projectRoot = path.resolve(__dirname, '../..');
    const filePath = path.join(projectRoot, file);
    
    // Ensure file is within project root
    if (!filePath.startsWith(projectRoot)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const stats = fs.statSync(filePath);

    res.json({
      content,
      modified: stats.mtime.toISOString(),
      size: stats.size
    });
  } catch (error) {
    res.status(404).json({ error: 'File not found' });
  }
}

