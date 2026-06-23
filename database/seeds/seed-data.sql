USE researchhub;

-- ============================================
-- Sample Data for ResearchHub
-- ============================================

-- Users
INSERT INTO USERS (username, email, password_hash, full_name, role, affiliation, country, bio, is_active, created_at) VALUES
('john_smith', 'john@university.edu', '$2a$10$YIjlrJpXr5V5LrV5LrV5LrV5LrV5LrV5LrV5LrV5LrV5LrV5LrV', 'John Smith', 'researcher', 'MIT', 'USA', 'Computer Science Researcher', TRUE, NOW()),
('jane_doe', 'jane@university.edu', '$2a$10$YIjlrJpXr5V5LrV5LrV5LrV5LrV5LrV5LrV5LrV5LrV5LrV5LrV', 'Jane Doe', 'admin', 'Stanford', 'USA', 'Academic Administrator', TRUE, NOW()),
('bob_wilson', 'bob@university.edu', '$2a$10$YIjlrJpXr5V5LrV5LrV5LrV5LrV5LrV5LrV5LrV5LrV5LrV5LrV', 'Bob Wilson', 'researcher', 'Harvard', 'USA', 'Physics Researcher', TRUE, NOW());

-- Authors
INSERT INTO AUTHORS (full_name, affiliation, country, email, h_index, biography, orcid, created_at) VALUES
('Dr. Albert Einstein', 'Princeton University', 'USA', 'einstein@princeton.edu', 92, 'Theoretical physicist known for theory of relativity', '0000-0001-2345-6789', NOW()),
('Dr. Marie Curie', 'University of Paris', 'France', 'curie@paris.edu', 88, 'Chemist known for radioactivity research', '0000-0001-2345-6780', NOW()),
('Dr. Richard Feynman', 'Caltech', 'USA', 'feynman@caltech.edu', 85, 'Theoretical physicist and educator', '0000-0001-2345-6781', NOW()),
('Dr. Carl Sagan', 'Cornell University', 'USA', 'sagan@cornell.edu', 72, 'Astrophysicist and science communicator', '0000-0001-2345-6782', NOW());

-- Journals
INSERT INTO JOURNALS (name, issn, publisher, impact_factor, h_index, website, description, created_at) VALUES
('Nature', '0028-0836', 'Springer Nature', 49.96, 318, 'https://www.nature.com', 'Multidisciplinary science journal', NOW()),
('Science', '0036-8075', 'American Association for the Advancement of Science', 41.86, 298, 'https://www.science.org', 'International science journal', NOW()),
('Physical Review Letters', '0031-9007', 'American Physical Society', 9.16, 287, 'https://journals.aps.org/prl/', 'Physics research journal', NOW()),
('Cell', '0092-8674', 'Elsevier', 66.63, 312, 'https://www.cell.com', 'Cell and molecular biology journal', NOW());

-- Research Fields (Hierarchical)
INSERT INTO RESEARCH_FIELDS (field_id, field_name, description, parent_field_id, created_at) VALUES
(1, 'Physical Sciences', 'Study of matter and energy', NULL, NOW()),
(2, 'Life Sciences', 'Study of living organisms', NULL, NOW()),
(3, 'Computer Science', 'Study of computation and information', NULL, NOW()),
(4, 'Physics', 'Study of matter and forces', 1, NOW()),
(5, 'Chemistry', 'Study of chemical reactions', 1, NOW()),
(6, 'Biology', 'Study of living organisms', 2, NOW()),
(7, 'Artificial Intelligence', 'Study of intelligent machines', 3, NOW()),
(8, 'Quantum Physics', 'Study of quantum systems', 4, NOW());

-- Keywords
INSERT INTO KEYWORDS (keyword, frequency, created_at) VALUES
('machine learning', 1245, NOW()),
('deep learning', 1089, NOW()),
('quantum computing', 456, NOW()),
('relativity', 234, NOW()),
('DNA', 678, NOW()),
('artificial intelligence', 2341, NOW()),
('neural networks', 543, NOW()),
('climate change', 234, NOW());

-- Research Papers
INSERT INTO RESEARCH_PAPERS (journal_id, title, abstract, doi, publication_date, volume, issue, pages, citation_count, view_count, download_count, pdf_url, language, is_peer_reviewed, created_at) VALUES
(1, 'A Theory of Machine Learning Applications in Climate Science', 
'Machine learning techniques have become essential for analyzing large-scale climate data. This paper demonstrates novel approaches for improving climate predictions using deep neural networks.',
'10.1038/nature.2024.12345', '2024-01-15', 615, 7, '45-62', 234, 5678, 1234, 'https://researchhub.example.com/papers/2024/machine-learning-climate.pdf', 'en', TRUE, NOW()),

(2, 'Quantum Computing Advances in Drug Discovery',
'This study explores how quantum computing can revolutionize pharmaceutical research by simulating molecular interactions at unprecedented speeds.',
'10.1126/science.2024.67890', '2024-02-20', 383, 6, '1023-1035', 189, 4567, 987, 'https://researchhub.example.com/papers/2024/quantum-drug-discovery.pdf', 'en', TRUE, NOW()),

(3, 'Novel Applications of Deep Learning in Physics',
'We present breakthrough results in using deep learning for quantum state prediction and particle detection, achieving 99.2% accuracy.',
'10.1103/PhysRevLett.2024.132301', '2024-03-10', 132, 13, '132301', 156, 3456, 756, 'https://researchhub.example.com/papers/2024/deep-learning-physics.pdf', 'en', TRUE, NOW()),

(4, 'CRISPR Gene Editing: Recent Breakthroughs and Clinical Applications',
'Comprehensive review of recent advances in CRISPR technology and its emerging clinical applications for treating genetic diseases.',
'10.1016/j.cell.2024.02.015', '2024-02-28', 187, 3, '456-478', 267, 6789, 1456, 'https://researchhub.example.com/papers/2024/crispr-clinical.pdf', 'en', TRUE, NOW());

-- Paper Authors
INSERT INTO PAPER_AUTHORS (paper_id, author_id, author_order) VALUES
(1, 1, 1),  -- Einstein on ML Climate paper
(1, 3, 2),  -- Feynman on ML Climate paper
(2, 2, 1),  -- Curie on Quantum Drug
(2, 4, 2),  -- Sagan on Quantum Drug
(3, 1, 1),  -- Einstein on Deep Learning Physics
(4, 2, 1);  -- Curie on CRISPR

-- Paper Fields
INSERT INTO PAPER_FIELDS (paper_id, field_id, relevance_score) VALUES
(1, 7, 0.95),   -- ML Climate uses AI heavily
(1, 3, 0.90),   -- Also related to CS
(2, 8, 0.88),   -- Quantum Computing is Quantum Physics
(2, 4, 0.92),   -- Also Physics
(3, 4, 0.98),   -- Deep Learning in Physics
(3, 7, 0.85),   -- Uses AI techniques
(4, 6, 0.95),   -- CRISPR is Biology
(4, 5, 0.80);   -- Also Chemistry related

-- Paper Keywords
INSERT INTO PAPER_KEYWORDS (paper_id, keyword_id) VALUES
(1, 1),  -- ML Climate: machine learning
(1, 8),  -- ML Climate: climate change
(2, 3),  -- Quantum Drug: quantum computing
(2, 1),  -- Quantum Drug: machine learning
(3, 2),  -- Deep Learning Physics: deep learning
(3, 4),  -- Deep Learning Physics: quantum physics (conceptual)
(4, 5),  -- CRISPR: DNA
(4, 6);  -- CRISPR: genetics

-- Reviews
INSERT INTO REVIEWS (user_id, paper_id, rating, review_text, is_helpful, created_at) VALUES
(1, 1, 5, 'Excellent work on applying machine learning to climate science. Well-written and comprehensive.', TRUE, NOW()),
(2, 2, 4, 'Good research on quantum computing applications. Could use more experimental data.', TRUE, NOW()),
(3, 3, 5, 'Outstanding contribution to the field. The results are groundbreaking.', TRUE, NOW()),
(1, 4, 4, 'Solid review of CRISPR technology. Very informative.', TRUE, NOW());

-- Saved Papers
INSERT INTO SAVED_PAPERS (user_id, paper_id, collection_name, saved_at) VALUES
(1, 1, 'Machine Learning Research', NOW()),
(1, 2, 'Quantum Research', NOW()),
(1, 3, 'Physics Papers', NOW()),
(2, 4, 'Genetic Research', NOW()),
(3, 1, 'AI Applications', NOW());

-- Followed Authors
INSERT INTO FOLLOWED_AUTHORS (user_id, author_id, followed_at) VALUES
(1, 1, NOW()),  -- John follows Einstein
(1, 3, NOW()),  -- John follows Feynman
(2, 2, NOW()),  -- Jane follows Curie
(3, 4, NOW());  -- Bob follows Sagan

-- Citations (Papers citing other papers)
INSERT INTO CITATIONS (citing_paper_id, cited_paper_id, context) VALUES
(1, 3, 'Referenced for quantum computing methods in climate modeling'),
(2, 1, 'Cited for machine learning applications in research'),
(3, 1, 'Built upon previous ML techniques discussed'),
(4, 2, 'Referenced for advanced computational methods');

-- Search History
INSERT INTO SEARCH_HISTORY (user_id, search_query, filters_applied, results_count, search_type, searched_at) VALUES
(1, 'machine learning climate', JSON_OBJECT('field_id', 7, 'year', 2024), 15, 'advanced', NOW()),
(1, 'quantum computing', JSON_OBJECT('year', 2024), 8, 'simple', NOW()),
(2, 'CRISPR gene', JSON_OBJECT('journal_id', 4), 12, 'simple', NOW()),
(3, 'physics', JSON_OBJECT('year_range', '2020-2024'), 45, 'advanced', NOW());

-- User Activity
INSERT INTO USER_ACTIVITY (user_id, activity_type, paper_id, activity_timestamp) VALUES
(1, 'view', 1, NOW()),
(1, 'download', 1, DATE_ADD(NOW(), INTERVAL 5 MINUTE)),
(1, 'review', 2, DATE_ADD(NOW(), INTERVAL 10 MINUTE)),
(2, 'save', 4, DATE_ADD(NOW(), INTERVAL 15 MINUTE)),
(3, 'view', 3, DATE_ADD(NOW(), INTERVAL 20 MINUTE));

-- Audit Logs
INSERT INTO AUDIT_LOGS (user_id, action, table_name, record_id, old_values, new_values, action_timestamp) VALUES
(2, 'INSERT', 'RESEARCH_PAPERS', 1, NULL, JSON_OBJECT('title', 'ML Climate Paper'), NOW()),
(2, 'INSERT', 'RESEARCH_PAPERS', 2, NULL, JSON_OBJECT('title', 'Quantum Drug Paper'), NOW()),
(2, 'UPDATE', 'RESEARCH_PAPERS', 1, JSON_OBJECT('citation_count', 233), JSON_OBJECT('citation_count', 234), NOW());

COMMIT;
