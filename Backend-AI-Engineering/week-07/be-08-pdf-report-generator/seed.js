const fs = require('fs');
const path = require('path');
const { getDb } = require('./db');

const ratingMap = {
  'One': 1,
  'Two': 2,
  'Three': 3,
  'Four': 4,
  'Five': 5
};

function seed() {
  const db = getDb();
  
  // Safe to run twice: start by deleting all rows
  db.exec('DELETE FROM books;');

  const booksPath = path.join(__dirname, 'books.json');
  const rawData = fs.readFileSync(booksPath, 'utf8');
  const books = JSON.parse(rawData);

  const insertStmt = db.prepare(`
    INSERT INTO books (title, price, rating, url)
    VALUES (?, ?, ?, ?)
  `);

  for (const book of books) {
    const rating = ratingMap[book.rating_text] || (typeof book.rating === 'number' ? book.rating : 1);
    const price = typeof book.price_gbp === 'number' ? book.price_gbp : parseFloat(book.price_text.replace(/[^0-9.]/g, ''));
    const url = book.product_url || book.url || '';
    insertStmt.run(book.title, price, rating, url);
  }

  const countRow = db.prepare('SELECT COUNT(*) as count FROM books;').get();
  console.log(`Seeding complete. Row count: ${countRow.count}`);
  return countRow.count;
}

if (require.main === module) {
  seed();
}

module.exports = { seed };
