CREATE TABLE tasks (
    id INTEGER PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    done BOOLEAN NOT NULL DEFAULT 0
);

INSERT INTO tasks (title) VALUES
('Learn SQL'),
('Build a REST API'),
('Deploy the application');