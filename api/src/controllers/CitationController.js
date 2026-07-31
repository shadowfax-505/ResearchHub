const Paper = require('../models/Paper');
const { demoPapers, isDatabaseUnavailable } = require('../utils/demoData');

function formatBib(paper) {
  const key = `researchhub${paper.paper_id || 'paper'}`;
  const year = String(paper.publication_date || '').slice(0, 4) || '2026';
  return `@article{${key},\n  title={${paper.title}},\n  journal={${paper.journal_name || 'ResearchHub'}},\n  year={${year}}\n}`;
}

function formatText(paper) {
  const year = String(paper.publication_date || '').slice(0, 4) || '2026';
  return `${paper.title}. ${paper.journal_name || 'ResearchHub'}, ${year}.`;
}

function formatRis(paper) {
  const year = String(paper.publication_date || '').slice(0, 4) || '2026';
  return `TY  - JOUR\nTI  - ${paper.title}\nJO  - ${paper.journal_name || 'ResearchHub'}\nPY  - ${year}\nER  -`;
}

function formatEndNote(paper) {
  const year = String(paper.publication_date || '').slice(0, 4) || '2026';
  return `%0 Journal Article\n%T ${paper.title}\n%J ${paper.journal_name || 'ResearchHub'}\n%D ${year}`;
}

class CitationController {
  static async export(req, res) {
    const paperId = Number(req.query.paper_id || 1);
    const format = req.query.format || 'bib';

    try {
      const paper = await Paper.findById(paperId);
      if (!paper) return res.status(404).json({ error: 'Paper not found' });
      
      let citation = '';
      if (format === 'bib') citation = formatBib(paper);
      else if (format === 'ris') citation = formatRis(paper);
      else if (format === 'enw') citation = formatEndNote(paper);
      else citation = formatText(paper);

      res.status(200).json({ success: true, data: { filename: `researchhub-citation.${format}`, format, citation, content: citation } });
    } catch (error) {
      if (isDatabaseUnavailable(error)) {
        const paper = demoPapers.find(item => item.paper_id === paperId) || demoPapers[0];
        
        let citation = '';
        if (format === 'bib') citation = formatBib(paper);
        else if (format === 'ris') citation = formatRis(paper);
        else if (format === 'enw') citation = formatEndNote(paper);
        else citation = formatText(paper);

        return res.status(200).json({ success: true, source: 'demo', data: { filename: `researchhub-citation.${format}`, format, citation, content: citation } });
      }
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = CitationController;
