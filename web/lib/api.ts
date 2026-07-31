import { z } from 'zod';
import { clearSession, getStoredSessionToken, storeSession } from './session';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
const API_BASE = '/api/v1';

export const paperSchema = z.object({
  paper_id: z.number(),
  title: z.string(),
  abstract: z.string().optional().default(''),
  journal_name: z.string().optional().default('ResearchHub'),
  citation_count: z.number().optional().default(0),
  view_count: z.number().optional().default(0),
  download_count: z.number().optional().default(0),
  publication_date: z.string().optional().default(''),
  doi: z.string().optional(),
  pdf_url: z.string().optional(),
  cover_image_url: z.string().optional(),
  files: z.array(z.object({ file_id: z.number(), original_name: z.string().optional(), mime_type: z.string().optional(), size_bytes: z.number().optional() })).optional(),
  is_peer_reviewed: z.number().optional(),
  status: z.string().optional(),
  visibility: z.string().optional(),
  publication_type: z.string().optional().default('article'),
  is_open_access: z.number().optional().default(0),
  feed_priority: z.number().optional(),
  feed_reason: z.string().optional(),
  authors: z.array(z.object({
    author_id: z.number(),
    author_order: z.number().optional(),
    full_name: z.string().optional().default(''),
    name: z.string().optional(),
    affiliation: z.string().optional(),
    country: z.string().optional(),
    orcid: z.string().optional(),
    claimed_user_id: z.number().optional().nullable(),
    claimed_profile_slug: z.string().optional().nullable(),
    claimed_profile_headline: z.string().optional().nullable(),
    is_claimed: z.boolean().optional()
  })).optional()
});

export type PaperSummary = z.infer<typeof paperSchema>;
export type ExternalAuthor = {
  author_id: number;
  full_name?: string;
  affiliation?: string;
  country?: string;
  biography?: string;
  h_index?: number;
  orcid?: string;
  papers?: PaperSummary[];
};
export type FeedResult = {
  success?: boolean;
  source?: string;
  data?: PaperSummary[];
  pagination?: { next_cursor?: string | null; has_more?: boolean; limit?: number };
  onboarding?: { needs_interests?: boolean } | null;
};
export type SearchResult = {
  success?: boolean;
  source?: string;
  data?: any[];
  query?: string;
  type?: string;
  pagination?: { limit?: number; offset?: number; has_more?: boolean };
};
export type UserSummary = {
  user_id: number;
  username?: string;
  full_name?: string;
  role?: string;
  affiliation?: string;
  is_active?: number | boolean;
  email?: string;
};

export type CollectionSummary = {
  collection_id?: number;
  user_id?: number;
  name?: string;
  description?: string;
  paper_count?: number;
  created_at?: string;
};

export type NotificationSummary = {
  notification_id?: number;
  user_id?: number;
  title?: string;
  body?: string;
  message?: string;
  type?: string;
  is_read?: number;
  created_at?: string;
};

export type ResearchRequestSummary = {
  request_id?: number;
  user_id?: number;
  recipient_user_id?: number;
  paper_id?: number;
  request_type?: string;
  title?: string;
  recipient_name?: string;
  recipient_full_name?: string;
  recipient_slug?: string;
  sender_full_name?: string;
  sender_slug?: string;
  message?: string;
  status?: string;
  created_at?: string;
};

export type JobSummary = {
  job_id?: number;
  JOB_ID?: number;
  title?: string;
  TITLE?: string;
  employer?: string;
  EMPLOYER?: string;
  location?: string;
  LOCATION?: string;
  country?: string;
  COUNTRY?: string;
  city?: string;
  CITY?: string;
  description?: string;
  DESCRIPTION?: string;
  is_new?: number;
  IS_NEW?: number;
  is_early_applicant?: number;
  IS_EARLY_APPLICANT?: number;
  discipline?: string;
  DISCIPLINE?: string;
  url?: string;
  URL?: string;
  created_at?: string;
  CREATED_AT?: string;
  institution_name?: string;
  INSTITUTION_NAME?: string;
  logo_url?: string;
  LOGO_URL?: string;
  is_bookmarked?: number;
  IS_BOOKMARKED?: number;
  remote_mode?: string;
  REMOTE_MODE?: string;
  career_level?: string;
  CAREER_LEVEL?: string;
};

export type JobFilter = {
  name?: string;
  NAME?: string;
  count?: number;
  COUNT?: number;
};


export type SettingsSummary = {
  user_id?: number;
  theme?: string;
  density?: string;
  notifications?: unknown;
  privacy?: unknown;
  email_notifications?: boolean;
  paper_recommendations?: boolean;
  profile_visibility?: string;
};

export type ReviewSummary = {
  review_id?: number;
  user_id?: number;
  username?: string;
  full_name?: string;
  rating?: number;
  review_text?: string;
  created_at?: string;
};

type LoginResult = {
  success?: boolean;
  source?: string;
  message?: string;
  token?: string;
  data?: { user_id?: number; username?: string; role?: string };
};

type CitationExportResult = {
  success?: boolean;
  source?: string;
  message?: string;
  citation?: string;
  content?: string;
  filename?: string;
  data?: { citation?: string; content?: string; filename?: string };
};

type FullTextRequestResult = {
  success?: boolean;
  source?: string;
  message?: string;
  data?: { email_id?: number; recipient_email?: string; paper_id?: number };
};

const paperListSchema = z.object({
  success: z.boolean(),
  data: z.array(paperSchema)
});

const answerSchema = z.object({
  answer_id: z.number(),
  question_id: z.number(),
  user_id: z.number(),
  body: z.string(),
  upvotes: z.number().optional().default(0),
  is_accepted: z.number().optional().default(0),
  created_at: z.string().optional().default(''),
  updated_at: z.string().optional().default(''),
  username: z.string().optional().default(''),
  full_name: z.string().optional().default('')
});

export type QuestionAnswer = z.infer<typeof answerSchema>;

const questionSchema = z.object({
  question_id: z.number(),
  user_id: z.number(),
  title: z.string(),
  body: z.string().optional().default(''),
  category: z.string().optional().default(''),
  view_count: z.number().optional().default(0),
  answer_count: z.number().optional().default(0),
  created_at: z.string().optional().default(''),
  updated_at: z.string().optional().default(''),
  username: z.string().optional().default(''),
  full_name: z.string().optional().default(''),
  answers: z.array(answerSchema).optional().default([])
});

export type QuestionSummary = z.infer<typeof questionSchema>;

export type Education = {
  education_id?: number;
  institution?: string;
  degree?: string;
  field_of_study?: string;
  start_year?: number;
  end_year?: number;
};

export type Experience = {
  experience_id?: number;
  company?: string;
  position?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
};

export type Skill = {
  skill_id?: number;
  skill_name?: string;
};

export type Language = {
  language_id?: number;
  language_name?: string;
  proficiency?: string;
};

export type Discipline = {
  discipline_id?: number;
  discipline_name?: string;
};

export type PublicResearcherProfile = UserSummary & {
  slug: string;
  headline?: string;
  department?: string;
  position_title?: string;
  website_url?: string;
  orcid?: string;
  followers?: number;
  following?: number;
  is_verified?: boolean;
  total_reads?: number;
  rg_score?: number;
  bio?: string;
  profile_picture_url?: string;
  country?: string;
  papers?: PaperSummary[];
  questions?: Array<Pick<QuestionSummary, 'question_id' | 'title' | 'category' | 'view_count' | 'answer_count'>>;
  education?: Education[];
  experience?: Experience[];
  skills?: Skill[];
  languages?: Language[];
  disciplines?: Discipline[];
  email_verified_at?: string | null;
  researcher_verified_at?: string | null;
  citations?: number;
  publication_count?: number;
};

export type AdminDashboardResult = {
  users?: { total?: number; active?: number };
  papers?: { total_papers?: number; avg_citations?: number; max_citations?: number; total_views?: number };
  questions?: { total_questions?: number; total_answers?: number; total_views?: number };
  email_queue?: { queued?: number; pending?: number; sent?: number; failed?: number };
  platform?: { cached_profiles?: number; avg_rg_score?: number; max_rg_score?: number; total_full_text_requests?: number; total_reads?: number };
  recent?: QuestionSummary[];
};

export type ModerationCase = {
  case_id: number;
  report_id?: number;
  target_type?: string;
  target_id?: number;
  status?: string;
  priority?: string;
  reason_code?: string;
  reporter_username?: string;
  title?: string;
  entity_type?: string;
  notes?: string;
  created_at?: string;
};

export type EmailQueueItem = {
  email_id: number;
  requester_username?: string;
  recipient_email?: string;
  subject?: string;
  status?: string;
  attempts?: number;
  error_message?: string;
  queued_at?: string;
  created_at?: string;
};

const questionListSchema = z.object({
  success: z.boolean(),
  data: z.array(questionSchema)
});

export async function authFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const sessionToken = getStoredSessionToken();
  if (sessionToken) headers.set('Authorization', `Bearer ${sessionToken}`);
  if (!(typeof FormData !== 'undefined' && init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers, credentials: 'include', cache: 'no-store' });
  } catch {
    throw new Error('Network error — is the server running?');
  }

  let json: { error?: string };
  try {
    json = await response.json() as { error?: string };
  } catch {
    if (!response.ok) throw new Error(`Request failed (HTTP ${response.status})`);
    throw new Error('Invalid JSON response from server');
  }

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      clearSession();
      const publicAuthRoute = window.location.pathname === '/login' || window.location.pathname === '/signup';
      if (!publicAuthRoute && !/\/users\/(login|register)|\/forgot-password|\/reset-password/.test(path)) {
        const returnTo = `${window.location.pathname}${window.location.search}`;
        window.location.assign(`/login?returnTo=${encodeURIComponent(returnTo)}`);
      }
    }
    throw new Error(json?.error || `Request failed (HTTP ${response.status})`);
  }
  return json;
}

export async function searchPapers(query: string, filters?: { field_id?: number; year?: number; journal_id?: number }) {
  let url = `/api/v1/papers/search?query=${encodeURIComponent(query)}&limit=20`;
  if (filters?.field_id) url += `&field_id=${filters.field_id}`;
  if (filters?.year) url += `&year=${filters.year}`;
  if (filters?.journal_id) url += `&journal_id=${filters.journal_id}`;
  const result = await authFetch(url);
  return paperListSchema.parse(result).data;
}

export async function unifiedSearch(query: string, type = 'publications', filters: Record<string, string | number | boolean | Array<string | number> | undefined> = {}) {
  const params = new URLSearchParams({ q: query, type, limit: '20' });
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === '' || value === false) continue;
    params.set(key, Array.isArray(value) ? value.join(',') : String(value));
  }
  return authFetch(`/api/v1/search?${params.toString()}`) as Promise<SearchResult>;
}

export async function getSearchFacets(query: string) {
  return authFetch(`/api/v1/search/facets?q=${encodeURIComponent(query)}`) as Promise<{ success?: boolean; data?: { fields?: any[]; journals?: any[]; publication_types?: any[]; languages?: any[] } }>;
}

export async function getTopPapers() {
  const result = await authFetch('/api/v1/papers/top-cited?limit=10');
  return paperListSchema.parse(result).data;
}

export async function login(username: string, password: string): Promise<LoginResult> {
  const result = await authFetch('/api/v1/users/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  }) as LoginResult;
  storeSession(result.token, result?.data?.role);
  return result;
}

export async function register(payload: { username: string; email: string; password: string; full_name: string }): Promise<LoginResult> {
  const result = await authFetch('/api/v1/users/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  }) as LoginResult;
  storeSession(result.token, result?.data?.role || 'researcher');
  return result;
}

export async function logout() {
  const result = await authFetch('/api/v1/users/logout', { method: 'POST' });
  storeSession(null, null);
  return result;
}

export async function forgotPassword(email: string) {
  return authFetch('/api/v1/users/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
}

export async function verifyEmail(token: string) {
  return authFetch(`/api/v1/users/verify-email?token=${encodeURIComponent(token)}`);
}

export async function resetPassword(token: string, password: string) {
  return authFetch('/api/v1/users/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) });
}

export async function savePaper(paperId: number, collectionName = 'Saved Papers') {
  return authFetch('/api/v1/saved-papers', {
    method: 'POST',
    body: JSON.stringify({ paper_id: paperId, collection_name: collectionName })
  });
}

export async function getSavedPapers() {
  return authFetch('/api/v1/saved-papers') as Promise<{ success?: boolean; source?: string; data?: any[] }>;
}

export const removeSavedPaper = (paperId: number) => 
  authFetch(`/api/v1/saved-papers/${paperId}`, { method: 'DELETE' });

export const getCollections = () => authFetch('/api/v1/collections') as Promise<any>;
export const createCollection = (name: string, description?: string) => 
  authFetch('/api/v1/collections', {
    method: 'POST',
    body: JSON.stringify({ name, description })
  });
export const getCollectionPapers = (name: string) => authFetch(`/api/v1/collections/${encodeURIComponent(name)}/papers`) as Promise<any>;

export async function getNotifications() {
  return authFetch('/api/v1/notifications') as Promise<{ success?: boolean; source?: string; data?: NotificationSummary[] }>;
}

export async function markNotificationRead(notificationId: number) {
  return authFetch(`/api/v1/notifications/${notificationId}/read`, { method: 'PUT' });
}

export async function getResearchRequests() {
  return authFetch('/api/v1/research-requests') as Promise<{ success?: boolean; source?: string; data?: ResearchRequestSummary[] }>;
}

export async function createResearchRequest(payload: { title: string; recipient_user_id?: number; recipient_name?: string; paper_id?: number; request_type?: string; message: string }) {
  return authFetch('/api/v1/research-requests', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function getReceivedRequests() {
  return authFetch('/api/v1/research-requests/received') as Promise<{ success?: boolean; source?: string; data?: ResearchRequestSummary[] }>;
}

export async function updateRequestStatus(requestId: number, status: 'approved' | 'declined' | 'cancelled') {
  return authFetch(`/api/v1/research-requests/${requestId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
}

export async function getSettings() {
  return authFetch('/api/v1/settings') as Promise<{ success?: boolean; source?: string; data?: SettingsSummary }>;
}

export async function updateSettings(payload: unknown) {
  return authFetch('/api/v1/settings', {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export async function exportCitation(paperId: number, format: string = 'bib'): Promise<CitationExportResult> {
  return authFetch(`/api/v1/citations/export?paper_id=${paperId}&format=${format}`) as Promise<CitationExportResult>;
}

export async function submitResearch(payload: unknown) {
  return authFetch('/api/v1/papers', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function uploadPaperFile(paperId: number, file: File) {
  const body = new FormData();
  body.append('file', file);
  return authFetch(`/api/v1/uploads/papers/${paperId}/file`, { method: 'POST', body });
}

export async function uploadPaperCover(paperId: number, file: File) {
  const body = new FormData();
  body.append('file', file);
  return authFetch(`/api/v1/uploads/papers/${paperId}/cover`, { method: 'POST', body });
}

export async function uploadAvatar(file: File) {
  const body = new FormData();
  body.append('file', file);
  return authFetch('/api/v1/researchers/me/avatar', { method: 'POST', body });
}

export async function createFeedAction(paperId: number, action_type: 'not_interested' | 'mute') {
  return authFetch('/api/v1/feed/actions', {
    method: 'POST',
    body: JSON.stringify({ paper_id: paperId, action_type })
  });
}

export async function getPaperReviews(paperId: string | number) {
  return authFetch(`/api/v1/reviews/paper/${paperId}`) as Promise<{ success?: boolean; source?: string; data?: any[]; stats?: { avg_rating?: number; review_count?: number } }>;
}

export async function createReview(paperId: number, rating: number, review_text: string) {
  return authFetch('/api/v1/reviews', {
    method: 'POST',
    body: JSON.stringify({ paper_id: paperId, rating, review_text })
  }) as Promise<{ success?: boolean; source?: string; data?: { review_id?: number; user_id?: number; paper_id?: number } }>;
}

export async function followAuthor(authorId: number) {
  return authFetch(`/api/v1/authors/${authorId}/follow`, { method: 'POST' });
}

export async function getAuthor(authorId: number) {
  return authFetch(`/api/v1/authors/${authorId}`) as Promise<{ success?: boolean; data?: ExternalAuthor }>;
}

export async function claimAuthor(authorId: number) {
  return authFetch(`/api/v1/authors/${authorId}/claim`, { method: 'POST' });
}

export async function unfollowAuthor(authorId: number) {
  return authFetch(`/api/v1/authors/${authorId}/follow`, { method: 'DELETE' });
}

export async function isFollowingAuthor(authorId: number) {
  return authFetch(`/api/v1/authors/${authorId}/following`) as Promise<{ success?: boolean; source?: string; data?: { is_following?: boolean } }>;
}

export async function followResearcher(userId: number) {
  return authFetch(`/api/v1/researchers/${userId}/follow`, { method: 'POST' });
}


// ==========================================
// MESSAGES
// ==========================================
export const getConversations = () => authFetch(`${API_BASE}/messages`) as Promise<any>;
export const getConversationWithUser = (userId: number) => authFetch(`${API_BASE}/messages/${userId}`) as Promise<any>;
export const searchMessageUsers = (query: string) => authFetch(`${API_BASE}/messages/search-users?q=${encodeURIComponent(query)}`) as Promise<any>;
export const getMessageRequests = () => authFetch(`${API_BASE}/messages/requests`) as Promise<any>;
export const createMessageRequest = (recipientId: number, content: string) => authFetch(`${API_BASE}/messages/requests`, { method: 'POST', body: JSON.stringify({ recipient_id: recipientId, content }) }) as Promise<any>;
export const updateMessageRequest = (requestId: number, status: 'accepted' | 'declined' | 'blocked') => authFetch(`${API_BASE}/messages/requests/${requestId}`, { method: 'PUT', body: JSON.stringify({ status }) }) as Promise<any>;
export const sendMessage = (receiverId: number, content: string) => 
  authFetch(`${API_BASE}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ receiver_id: receiverId, content }),
  }) as Promise<any>;
export const markMessageRead = (messageId: number) => 
  authFetch(`${API_BASE}/messages/${messageId}/read`, { method: 'PUT' }) as Promise<any>;

// ==========================================
// PROJECTS
// ==========================================
export const getAdminAuditLogs = () => authFetch(`${API_BASE}/admin/audit-logs`) as Promise<any>;

export const getAdminPlatformActivity = () => authFetch(`${API_BASE}/admin/activity`) as Promise<any>;
export const getPublicProjects = () => authFetch(`${API_BASE}/projects`) as Promise<any>;
export const getMyProjects = () => authFetch(`${API_BASE}/projects/me`) as Promise<any>;
export const createProject = (title: string, description: string) => 
  authFetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description }),
  }) as Promise<any>;
export const updateProjectStatus = (projectId: number, status: string) => 
  authFetch(`${API_BASE}/projects/${projectId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  }) as Promise<any>;

export const getProjectUpdates = (projectId: number) => authFetch(`${API_BASE}/projects/${projectId}/updates`) as Promise<any>;
export const addProjectUpdate = (projectId: number, body: string) => 
  authFetch(`${API_BASE}/projects/${projectId}/updates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body }),
  }) as Promise<any>;

// ==========================================
// NETWORK
// ==========================================
export const getNetworkRecommendations = () => authFetch(`${API_BASE}/network/recommendations`) as Promise<any>;

// ==========================================
// FEED
// ==========================================
export const getFeedPapers = () => authFetch(`${API_BASE}/papers/feed`) as Promise<any>;
export const getGlobalFeed = (options: { cursor?: string; limit?: number } = {}) => {
  const params = new URLSearchParams();
  if (options.cursor) params.set('cursor', options.cursor);
  if (options.limit) params.set('limit', String(options.limit));
  const query = params.toString();
  return authFetch(`${API_BASE}/feed${query ? `?${query}` : ''}`) as Promise<FeedResult>;
};

export async function getInterests() {
  return authFetch(`${API_BASE}/interests`) as Promise<{ success?: boolean; data?: any[] }>;
}

export async function replaceInterests(interests: Array<{ interest_type: string; interest_id: number; source?: string; weight?: number }>) {
  return authFetch(`${API_BASE}/interests`, { method: 'PUT', body: JSON.stringify({ interests }) });
}

export async function unfollowResearcher(userId: number) {
  return authFetch(`/api/v1/researchers/${userId}/follow`, { method: 'DELETE' }) as Promise<any>;
}

export async function isFollowingResearcher(userId: number) {
  return authFetch(`/api/v1/researchers/${userId}/follow`, { method: 'GET' }) as Promise<any>;
}

export async function getResearcherFollowingList(userId: number) {
  return authFetch(`/api/v1/researchers/${userId}/following-list`) as Promise<{ success?: boolean; source?: string; data?: any[] }>;
}

export async function getResearcherFollowersList(userId: number) {
  return authFetch(`/api/v1/researchers/${userId}/followers`) as Promise<{ success?: boolean; source?: string; data?: any[] }>;
}

export async function checkFollowingResearcher(userId: number) {
  return authFetch(`/api/v1/researchers/${userId}/following`) as Promise<{ success?: boolean; source?: string; data?: { is_following?: boolean } }>;
}

export async function getMyStats() {
  return authFetch('/api/v1/analytics/my-stats') as Promise<{ success?: boolean; source?: string; data?: { saved_papers?: number; following?: number; followers?: number; reviews?: number; questions?: number; answers?: number; full_text_requests?: number; total_reads?: number; rg_score?: number } }>;
}

export async function getTrendingFields() {
  const result = await authFetch('/api/v1/papers/trending-fields') as { data?: { field_id: number; field_name: string; paper_count: number }[] };
  return (result?.data || []) as { field_id: number; field_name: string; paper_count: number }[];
}

export async function getUsers(limit = 20, offset = 0): Promise<{ success?: boolean; source?: string; data?: UserSummary[]; pagination?: { limit?: number; offset?: number; total?: number } }> {
  const result = await authFetch(`/api/v1/users?limit=${limit}&offset=${offset}`) as { success?: boolean; source?: string; data?: UserSummary[]; pagination?: { limit?: number; offset?: number; total?: number } };
  return result;
}

export async function getInstitutionalRankings() {
  return authFetch('/api/v1/researchers/institutions/rankings') as Promise<{
    success?: boolean;
    data?: Array<{
      institution_name: string;
      country?: string;
      researchers_count: number;
      total_publications: number;
      total_citations: number;
      total_reads: number;
    }>;
  }>;
}

export async function getResearchers(limit = 20, offset = 0) {
  const result = await authFetch(`/api/v1/researchers?limit=${limit}&offset=${offset}`) as { data?: PublicResearcherProfile[] };
  return result.data || [];
}

export async function getResearcherContributions(slug: string, limit = 20, offset = 0) {
  return authFetch(`/api/v1/researchers/${encodeURIComponent(slug)}/contributions?limit=${limit}&offset=${offset}`) as Promise<{ success?: boolean; data?: any[]; pagination?: { has_more?: boolean } }>;
}

export async function getVerificationStatus() {
  return authFetch('/api/v1/researchers/me/verification-status') as Promise<{ success?: boolean; data?: { email_verified?: boolean; researcher_verified?: boolean; eligible?: boolean; request?: any } }>;
}

export async function resendVerificationEmail() {
  return authFetch('/api/v1/users/me/resend-verification', { method: 'POST' });
}

export async function requestResearcherVerification(payload: { institutional_email?: string; evidence?: string } = {}) {
  return authFetch('/api/v1/researchers/me/verification-request', { method: 'POST', body: JSON.stringify(payload) }) as Promise<{ success?: boolean; data?: any; error?: string }>;
}

export type VerificationRequestSummary = {
  verification_request_id?: number;
  user_id?: number;
  username?: string;
  full_name?: string;
  email?: string;
  institutional_email?: string;
  institutional_domain?: string;
  affiliation?: string;
  evidence?: string;
  status?: string;
  created_at?: string;
  rejection_reason?: string;
};

export async function getVerificationRequests() {
  const result = await authFetch('/api/v1/admin/verification-requests') as { data?: VerificationRequestSummary[] };
  return result.data || [];
}

export async function decideVerificationRequest(requestId: number, status: 'approved' | 'rejected', reason = '') {
  return authFetch(`/api/v1/admin/verification-requests/${requestId}`, {
    method: 'PUT',
    body: JSON.stringify({ status, reason })
  });
}

export type UpdateSummary = { event_id?: number; event_type?: string; title?: string; body?: string; route_url?: string; is_read?: number; created_at?: string };
export async function getUpdates(limit = 30, offset = 0) {
  return authFetch(`/api/v1/updates?limit=${limit}&offset=${offset}`) as Promise<{ success?: boolean; data?: UpdateSummary[]; unread_count?: number; pagination?: { has_more?: boolean } }>;
}
export const markUpdateRead = (eventId: number) => authFetch(`/api/v1/updates/${eventId}/read`, { method: 'PUT' });
export const markAllUpdatesRead = () => authFetch('/api/v1/updates/read-all', { method: 'PUT' });

export async function submitPaperReview(paperId: string, rating: number, comment: string) {
  const result = await authFetch(`/api/v1/reviews`, {
    method: 'POST',
    body: JSON.stringify({ paper_id: paperId, rating, comment_text: comment }),
  }) as { success?: boolean };
  return result;
}


export async function getAdminDashboard(): Promise<AdminDashboardResult> {
  const result = await authFetch('/api/v1/admin/dashboard') as { data?: AdminDashboardResult };
  return (result?.data || result) as AdminDashboardResult;
}

export async function getModerationCases(limit = 20, offset = 0): Promise<ModerationCase[]> {
  const result = await authFetch(`/api/v1/admin/moderation/cases?limit=${limit}&offset=${offset}`) as { data?: ModerationCase[] };
  return result.data || [];
}

export async function applyModerationAction(caseId: number, action_type: 'hide' | 'restore' | 'warn' | 'suspend' | 'ban' | 'edit_metadata' | 'delete', notes = '') {
  return authFetch(`/api/v1/admin/moderation/cases/${caseId}/actions`, {
    method: 'POST',
    body: JSON.stringify({ action_type, notes })
  });
}

export async function getAdminEmailQueue(limit = 20, offset = 0): Promise<EmailQueueItem[]> {
  const result = await authFetch(`/api/v1/admin/email-queue?limit=${limit}&offset=${offset}`) as { data?: EmailQueueItem[] };
  return result.data || [];
}

export async function retryAdminEmail(emailId: number) {
  return authFetch(`/api/v1/admin/email-queue/${emailId}/retry`, { method: 'POST' });
}

export async function setAdminUserStatus(userId: number, is_active: boolean) {
  return authFetch(`/api/v1/admin/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ is_active })
  });
}

export async function assignAdminRole(userId: number, role_key: 'researcher' | 'student' | 'librarian' | 'moderator' | 'admin') {
  return authFetch(`/api/v1/admin/users/${userId}/roles`, {
    method: 'POST',
    body: JSON.stringify({ role_key })
  });
}

export async function getUnverifiedUsers() {
  const result = await authFetch('/api/v1/admin/unverified-users') as { data?: UserSummary[] };
  return result.data || [];
}

export async function verifyUser(userId: number) {
  return authFetch(`/api/v1/admin/users/${userId}/verify`, { method: 'PUT' });
}

export async function recalculateAdminStats() {
  return authFetch('/api/v1/admin/stats/recalculate', { method: 'POST' });
}

export async function getQuestions(tab = 'all', limit = 20, offset = 0) {
  const result = await authFetch(`/api/v1/questions?tab=${tab}&limit=${limit}&offset=${offset}`);
  return questionListSchema.parse(result).data;
}

export async function getMyQuestions() {
  const result = await authFetch('/api/v1/questions/me');
  return questionListSchema.parse(result).data;
}

export async function getMyProfile() {
  return authFetch('/api/v1/researchers/me') as Promise<{ success?: boolean; source?: string; data?: Partial<PublicResearcherProfile> }>;
}

export async function updateResearcherProfile(data: Partial<PublicResearcherProfile>) {
  return authFetch('/api/v1/researchers/me', {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function updateUser(userId: number, data: any) {
  return authFetch(`/api/v1/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function getResearcherProfile(slug: string): Promise<PublicResearcherProfile> {
  const result = await authFetch(`/api/v1/researchers/${encodeURIComponent(slug)}`) as { data?: PublicResearcherProfile };
  if (!result.data) throw new Error('Researcher profile not found');
  return result.data;
}

export async function getQuestion(questionId: number): Promise<{ success?: boolean; source?: string; data?: QuestionSummary }> {
  return authFetch(`/api/v1/questions/${questionId}`) as Promise<{ success?: boolean; source?: string; data?: QuestionSummary }>;
}

export async function createQuestion(payload: { title: string; body?: string; category?: string }) {
  return authFetch('/api/v1/questions', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function createAnswer(questionId: number, body: string) {
  return authFetch(`/api/v1/questions/${questionId}/answers`, {
    method: 'POST',
    body: JSON.stringify({ body })
  });
}

// Sub-entity API methods
export const addEducation = (data: Partial<Education>) => authFetch('/api/v1/researchers/me/education', { method: 'POST', body: JSON.stringify(data) });
export const deleteEducation = (id: number) => authFetch(`/api/v1/researchers/me/education/${id}`, { method: 'DELETE' });

export const addExperience = (data: Partial<Experience>) => authFetch('/api/v1/researchers/me/experience', { method: 'POST', body: JSON.stringify(data) });
export const deleteExperience = (id: number) => authFetch(`/api/v1/researchers/me/experience/${id}`, { method: 'DELETE' });

export const addSkill = (skill_name: string) => authFetch('/api/v1/researchers/me/skills', { method: 'POST', body: JSON.stringify({ skill_name }) });
export const deleteSkill = (id: number) => authFetch(`/api/v1/researchers/me/skills/${id}`, { method: 'DELETE' });

export const addLanguage = (language_name: string, proficiency: string) => authFetch('/api/v1/researchers/me/languages', { method: 'POST', body: JSON.stringify({ language_name, proficiency }) });
export const deleteLanguage = (id: number) => authFetch(`/api/v1/researchers/me/languages/${id}`, { method: 'DELETE' });

export const addDiscipline = (discipline_name: string) => authFetch('/api/v1/researchers/me/disciplines', { method: 'POST', body: JSON.stringify({ discipline_name }) });
export const deleteDiscipline = (id: number) => authFetch(`/api/v1/researchers/me/disciplines/${id}`, { method: 'DELETE' });

export async function requestFullText(paperId: number): Promise<FullTextRequestResult> {
  return authFetch(`/api/v1/papers/${paperId}/request-fulltext`, { method: 'POST' }) as Promise<FullTextRequestResult>;
}

export async function submitReport(payload: { target_type: 'user' | 'paper' | 'review' | 'question' | 'answer'; target_id: number; reason_code: string; details?: string }) {
  return authFetch('/api/v1/reports', { method: 'POST', body: JSON.stringify(payload) });
}

export async function getJobs(query: string = '', country: string = '', discipline: string = '', page: number = 1, limit: number = 10, filters: Record<string, string | string[] | undefined> = {}) {
  const offset = Math.max(0, (page - 1) * limit);
  let url = `/api/v1/jobs?offset=${offset}&limit=${limit}`;
  if (query) url += `&q=${encodeURIComponent(query)}`;
  if (country) url += `&location=${encodeURIComponent(country)}`;
  if (discipline) url += `&discipline=${encodeURIComponent(discipline)}`;
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === '') continue;
    url += `&${encodeURIComponent(key)}=${encodeURIComponent(Array.isArray(value) ? value.join(',') : value)}`;
  }
  
  return authFetch(url) as Promise<{ data?: any[], success?: boolean }>;
}

export async function getJobFilters() {
  return authFetch('/api/v1/jobs/filters') as Promise<{ countries?: JobFilter[], disciplines?: JobFilter[], employment_types?: JobFilter[], remote_modes?: JobFilter[], career_levels?: JobFilter[], institutions?: JobFilter[] }>;
}

export async function getJob(jobId: number | string) {
  return authFetch(`/api/v1/jobs/${jobId}`) as Promise<{ success?: boolean; data?: JobSummary }>;
}

export async function createJob(payload: { employer: string; title: string; location: string; description: string; requirements?: string; salary_range?: string; employment_type?: string }) {
  return authFetch('/api/v1/jobs', { method: 'POST', body: JSON.stringify(payload) });
}

export async function toggleJobBookmark(jobId: number | string) {
  return authFetch(`/api/v1/jobs/${jobId}/save`, { method: 'POST' }) as Promise<{ success?: boolean, data?: { saved?: boolean } }>;
}

export async function getBookmarkedJobs() {
  return authFetch('/api/v1/jobs/saved') as Promise<{ success?: boolean; data?: JobSummary[] }>;
}
export const getAuthorPapers = (authorId: number, limit = 20, offset = 0) => authFetch(`${API_BASE}/papers/author/${authorId}?limit=${limit}&offset=${offset}`) as Promise<any>;

export async function recommendPaper(paperId: number) {
  return authFetch(`/api/v1/papers/${paperId}/recommend`, { method: 'POST' });
}

export async function unrecommendPaper(paperId: number) {
  return authFetch(`/api/v1/papers/${paperId}/recommend`, { method: 'DELETE' });
}
