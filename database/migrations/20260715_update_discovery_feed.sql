CREATE OR REPLACE PACKAGE BODY PKG_DISCOVERY AS
  PROCEDURE get_feed(
    p_user_id IN NUMBER,
    p_before_date IN DATE,
    p_before_id IN NUMBER,
    p_before_priority IN NUMBER,
    p_limit IN NUMBER,
    p_cursor OUT SYS_REFCURSOR
  ) AS
  BEGIN
    OPEN p_cursor FOR
      WITH scored AS (
        SELECT
          p.paper_id,
          p.title,
          p.abstract,
          p.publication_date,
          p.doi,
          p.journal_id,
          j.name AS journal_name,
          p.citation_count,
          p.view_count,
          p.download_count,
          p.pdf_url,
          p.language,
          p.is_peer_reviewed,
          p.publication_type,
          p.is_open_access,
          CASE
            WHEN p_user_id IS NOT NULL AND EXISTS (
              SELECT 1
              FROM PAPER_AUTHORS pa
              JOIN USER_AUTHOR_CLAIMS uac ON uac.author_id = pa.author_id AND uac.status = 'verified'
              WHERE pa.paper_id = p.paper_id AND uac.user_id = p_user_id
            ) THEN 4
            WHEN p_user_id IS NOT NULL AND EXISTS (
              SELECT 1
              FROM PAPER_AUTHORS pa
              JOIN USER_AUTHOR_CLAIMS uac ON uac.author_id = pa.author_id AND uac.status = 'verified'
              JOIN USER_FOLLOWS uf ON uf.followed_user_id = uac.user_id
              WHERE pa.paper_id = p.paper_id AND uf.follower_user_id = p_user_id
            ) THEN 3
            WHEN p_user_id IS NOT NULL AND EXISTS (
              SELECT 1 FROM PAPER_AUTHORS pa
              JOIN FOLLOWED_AUTHORS fa ON fa.author_id = pa.author_id
              WHERE pa.paper_id = p.paper_id AND fa.user_id = p_user_id
            ) THEN 2
            WHEN p_user_id IS NOT NULL AND EXISTS (
              SELECT 1
              FROM USER_INTERESTS ui
              WHERE ui.user_id = p_user_id
                AND (
                  (ui.interest_type = 'field' AND EXISTS (SELECT 1 FROM PAPER_FIELDS pf WHERE pf.paper_id = p.paper_id AND pf.field_id = ui.interest_id))
                  OR (ui.interest_type = 'keyword' AND EXISTS (SELECT 1 FROM PAPER_KEYWORDS pk WHERE pk.paper_id = p.paper_id AND pk.keyword_id = ui.interest_id))
                  OR (ui.interest_type = 'journal' AND ui.interest_id = p.journal_id)
                  OR (ui.interest_type = 'author' AND EXISTS (SELECT 1 FROM PAPER_AUTHORS pa WHERE pa.paper_id = p.paper_id AND pa.author_id = ui.interest_id))
                )
            ) THEN 1
            ELSE 0
          END AS feed_priority
        FROM RESEARCH_PAPERS p
        LEFT JOIN JOURNALS j ON j.journal_id = p.journal_id
        WHERE NVL(p.status, 'published') = 'published'
          AND NVL(p.visibility, 'public') = 'public'
          AND (p_user_id IS NULL OR NOT EXISTS (
            SELECT 1 FROM USER_FEED_ACTIONS ufa
            WHERE ufa.user_id = p_user_id AND ufa.paper_id = p.paper_id
          ))
      ),
      filtered AS (
        SELECT scored.*,
          CASE feed_priority
            WHEN 4 THEN 'own_publication'
            WHEN 3 THEN 'followed_researcher'
            WHEN 2 THEN 'followed_author'
            WHEN 1 THEN 'interest_match'
            ELSE 'discovery'
          END AS feed_reason
        FROM scored
        WHERE p_before_date IS NULL
           OR feed_priority < NVL(p_before_priority, 0)
           OR (feed_priority = NVL(p_before_priority, 0) AND (
                publication_date < p_before_date
                OR (publication_date = p_before_date AND paper_id < NVL(p_before_id, 999999999999))
           ))
      ),
      selected AS (
        SELECT filtered.*, ROW_NUMBER() OVER (
          ORDER BY publication_date DESC, paper_id DESC
        ) AS row_number_value
        FROM filtered
      )
      SELECT
        s.paper_id,
        s.title,
        s.abstract,
        s.publication_date,
        s.doi,
        s.journal_id,
        s.journal_name,
        s.citation_count,
        s.view_count,
        s.download_count,
        s.pdf_url,
        s.language,
        s.is_peer_reviewed,
        s.publication_type,
        s.is_open_access,
        s.feed_priority,
        s.feed_reason,
        pa.author_id,
        pa.author_order,
        a.full_name AS author_name,
        a.affiliation AS author_affiliation,
        a.country AS author_country,
        a.orcid AS author_orcid,
        uac.user_id AS claimed_user_id,
        rp.slug AS claimed_profile_slug,
        rp.headline AS claimed_profile_headline
      FROM selected s
      LEFT JOIN PAPER_AUTHORS pa ON pa.paper_id = s.paper_id
      LEFT JOIN AUTHORS a ON a.author_id = pa.author_id
      LEFT JOIN USER_AUTHOR_CLAIMS uac ON uac.author_id = pa.author_id AND uac.status = 'verified'
      LEFT JOIN RESEARCHER_PROFILES rp ON rp.user_id = uac.user_id
      WHERE s.row_number_value <= LEAST(NVL(p_limit, 20), 100)
      ORDER BY s.publication_date DESC, s.paper_id DESC, pa.author_order;
  END get_feed;
END PKG_DISCOVERY;
/
