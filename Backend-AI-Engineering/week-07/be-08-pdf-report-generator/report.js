const { getDb } = require('./db');

/**
 * Executes the SQL aggregation queries to build the report data object.
 * 
 * 4 Core Sections:
 * 1. total_books: COUNT(*)
 * 2. average_price: AVG(price)
 * 3. top_expensive: top 5 most expensive books (ORDER BY price DESC LIMIT 5)
 * 4. rating_breakdown: number of books per star rating (GROUP BY rating)
 * 
 * Plus all_books for the full table render in Stage 3.
 */
function getReportData(options = {}) {
  const db = getDb();

  // 1. Total books
  const totalRow = db.prepare('SELECT COUNT(*) as total_books FROM books;').get();
  const totalBooks = totalRow.total_books;

  // 2. Average price
  const avgRow = db.prepare('SELECT ROUND(AVG(price), 2) as avg_price FROM books;').get();
  const avgPrice = avgRow.avg_price !== null ? avgRow.avg_price : 0;

  // 3. Top 5 most expensive books
  const topExpensive = db.prepare(`
    SELECT id, title, price, rating, url
    FROM books
    ORDER BY price DESC
    LIMIT 5;
  `).all();

  // 4. Number of books per star rating (GROUP BY rating)
  const ratingBreakdown = db.prepare(`
    SELECT rating, COUNT(*) as count
    FROM books
    GROUP BY rating
    ORDER BY rating ASC;
  `).all();

  // All books for the detailed document table
  let allBooksQuery = 'SELECT id, title, price, rating, url FROM books';
  const params = [];
  if (options.min_rating) {
    allBooksQuery += ' WHERE rating >= ?';
    params.push(options.min_rating);
  }
  allBooksQuery += ' ORDER BY id ASC;';
  const allBooks = db.prepare(allBooksQuery).all(...params);

  return {
    generated_at: new Date().toISOString(),
    summary: {
      total_books: totalBooks,
      average_price: avgPrice
    },
    top_expensive: topExpensive,
    rating_breakdown: ratingBreakdown,
    all_books: allBooks
  };
}

module.exports = { getReportData };
