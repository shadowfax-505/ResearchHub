const demoPapers = [
  {
    paper_id: 1,
    title: 'A Theory of Machine Learning Applications in Climate Science',
    abstract: 'Machine learning techniques for large-scale climate data analysis.',
    journal_name: 'Nature',
    citation_count: 234,
    view_count: 5678,
    publication_date: '2024-01-15'
  },
  {
    paper_id: 2,
    title: 'Quantum Computing Advances in Drug Discovery',
    abstract: 'Quantum simulation methods for pharmaceutical research.',
    journal_name: 'Science',
    citation_count: 189,
    view_count: 4567,
    publication_date: '2024-02-20'
  },
  {
    paper_id: 3,
    title: 'Novel Applications of Deep Learning in Physics',
    abstract: 'Deep learning for quantum state prediction and particle detection.',
    journal_name: 'Physical Review Letters',
    citation_count: 156,
    view_count: 3456,
    publication_date: '2024-03-10'
  }
];

const demoUser = {
  user_id: 1,
  username: 'demo',
  full_name: 'Demo Researcher',
  role: 'researcher'
};

const demoUsers = [
  demoUser,
  {
    user_id: 2,
    username: 'jane_doe',
    full_name: 'Jane Doe',
    role: 'admin',
    affiliation: 'Stanford',
    country: 'USA',
    is_active: 1
  },
  {
    user_id: 3,
    username: 'bob_wilson',
    full_name: 'Bob Wilson',
    role: 'researcher',
    affiliation: 'Harvard',
    country: 'USA',
    is_active: 1
  }
];

const demoCollections = [
  {
    collection_id: 1,
    user_id: 1,
    name: 'Machine Learning',
    description: 'Core papers for applied machine learning',
    paper_count: 1,
    created_at: '2026-07-05T00:00:00.000Z'
  }
];

const demoSavedPapers = [
  {
    saved_id: 1,
    user_id: 1,
    paper_id: 1,
    collection_name: 'Machine Learning',
    saved_at: '2026-07-05T00:00:00.000Z',
    ...demoPapers[0]
  }
];

const demoNotifications = [
  {
    notification_id: 1,
    user_id: 1,
    title: 'New citation activity',
    body: 'A paper in your library received new citation activity.',
    type: 'citation',
    is_read: 0,
    created_at: '2026-07-05T00:00:00.000Z'
  }
];

const demoResearchRequests = [
  {
    request_id: 1,
    user_id: 1,
    title: 'Request replication package',
    recipient_name: 'Dr. Curie',
    message: 'Could you share the supplementary dataset?',
    status: 'pending',
    created_at: '2026-07-05T00:00:00.000Z'
  }
];

const demoJobs = [
  {
    job_id: 1,
    title: 'Postdoctoral Research Fellow in Machine Learning',
    employer: 'ResearchHub Institute',
    location: 'Remote · Global',
    description: 'Join a collaborative team working on transparent models for scientific discovery.',
    discipline: 'Computer Science',
    is_new: 1,
    is_early_applicant: 1
  },
  {
    job_id: 2,
    title: 'Research Software Engineer',
    employer: 'Northstar University',
    location: 'Cambridge, United Kingdom',
    description: 'Build reproducible data systems for interdisciplinary research teams.',
    discipline: 'Engineering',
    is_new: 1,
    is_early_applicant: 0
  }
];

const demoQuestions = [
  {
    question_id: 1,
    user_id: 1,
    title: 'How do you evaluate explainability in biomedical ML?',
    body: 'Looking for practical metrics and review methods for model interpretability.',
    category: 'Machine Learning',
    view_count: 42,
    answer_count: 2,
    created_at: '2026-07-05T00:00:00.000Z',
    username: 'john_smith',
    full_name: 'John Smith',
    answers: [
      {
        answer_id: 1,
        question_id: 1,
        user_id: 2,
        body: 'Use calibration, feature attribution stability, and domain expert review.',
        upvotes: 4,
        is_accepted: 1,
        created_at: '2026-07-05T00:00:00.000Z',
        username: 'jane_doe',
        full_name: 'Jane Doe'
      }
    ]
  }
];

const demoResearcherStats = {
  user_id: 1,
  saved_papers: 3,
  following: 2,
  followers: 1,
  reviews: 2,
  questions: 1,
  answers: 1,
  full_text_requests: 1,
  total_reads: 2,
  rg_score: 18
};

const demoSettings = {
  user_id: 1,
  theme: 'system',
  density: 'comfortable',
  notifications: {
    citations: true,
    weekly_digest: true
  },
  privacy: {
    public_profile: true
  }
};

function isDatabaseUnavailable(error) {
  const message = String(error && error.message ? error.message : error);
  return /access denied|connect|connection|database|pool|ECONNREFUSED|ENOTFOUND|ORACLE|ORA-|NJS-|driver unavailable/i.test(message);
}

function filterPapers(query) {
  if (!query) return demoPapers;
  const term = String(query).toLowerCase();
  return demoPapers.filter(paper =>
    paper.title.toLowerCase().includes(term) ||
    paper.abstract.toLowerCase().includes(term) ||
    paper.journal_name.toLowerCase().includes(term)
  );
}

module.exports = {
  demoCollections,
  demoQuestions,
  demoNotifications,
  demoPapers,
  demoResearchRequests,
  demoJobs,
  demoSavedPapers,
  demoResearcherStats,
  demoSettings,
  demoUser,
  demoUsers,
  filterPapers,
  isDatabaseUnavailable
};
