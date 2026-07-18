const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const PaperFile = require('../models/PaperFile');
const Paper = require('../models/Paper');
const UserFile = require('../models/UserFile');
const User = require('../models/User');

const uploadRoot = path.resolve(process.env.UPLOAD_ROOT || path.join(__dirname, '../../storage/uploads'));

class UploadController {
  static async uploadPaperFile(req, res) {
    if (!req.file) return res.status(400).json({ error: 'A PDF file is required' });
    const paperId = Number(req.params.paperId);
    if (!Number.isInteger(paperId) || paperId <= 0) return res.status(400).json({ error: 'Invalid paper ID' });
    const paper = await Paper.findById(paperId);
    if (!paper) return res.status(404).json({ error: 'Paper not found' });
    if (paper.status !== 'draft' && paper.status !== 'submitted' && paper.status !== 'published') {
      return res.status(409).json({ error: 'Paper is not accepting files' });
    }

    const checksum = crypto.createHash('sha256').update(req.file.buffer).digest('hex');
    const storageKey = `${req.user.user_id}/${paperId}/${crypto.randomUUID()}.pdf`;
    const destination = path.join(uploadRoot, storageKey);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, req.file.buffer, { flag: 'wx' });
    try {
      const fileId = await PaperFile.create({
        paper_id: paperId,
        owner_user_id: req.user.user_id,
        storage_key: storageKey,
        original_name: req.file.originalname,
        mime_type: 'application/pdf',
        size_bytes: req.file.size,
        checksum_sha256: checksum,
        visibility: paper.visibility || 'public',
        file_kind: 'paper'
      });
      return res.status(201).json({ success: true, data: { file_id: fileId, paper_id: paperId, original_name: req.file.originalname } });
    } catch (error) {
      fs.rmSync(destination, { force: true });
      throw error;
    }
  }

  static async uploadPaperCover(req, res) {
    if (!req.file) return res.status(400).json({ error: 'A JPG, PNG, or WebP cover image is required' });
    const paperId = Number(req.params.paperId);
    if (!Number.isInteger(paperId) || paperId <= 0) return res.status(400).json({ error: 'Invalid paper ID' });
    const paper = await Paper.findById(paperId);
    if (!paper) return res.status(404).json({ error: 'Paper not found' });
    const checksum = crypto.createHash('sha256').update(req.file.buffer).digest('hex');
    const extension = req.file.mimetype.split('/')[1].replace('jpeg', 'jpg');
    const storageKey = `${req.user.user_id}/${paperId}/${crypto.randomUUID()}.${extension}`;
    const destination = path.join(uploadRoot, storageKey);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, req.file.buffer, { flag: 'wx' });
    try {
      const fileId = await PaperFile.create({ paper_id: paperId, owner_user_id: req.user.user_id, storage_key: storageKey, original_name: req.file.originalname, mime_type: req.file.mimetype, size_bytes: req.file.size, checksum_sha256: checksum, visibility: paper.visibility || 'public', file_kind: 'cover' });
      const coverUrl = `${process.env.API_PUBLIC_URL || 'http://localhost:3000'}/api/v1/uploads/${fileId}?inline=1`;
      await poolUpdateCover(paperId, coverUrl);
      return res.status(201).json({ success: true, data: { file_id: fileId, paper_id: paperId, cover_image_url: coverUrl } });
    } catch (error) { fs.rmSync(destination, { force: true }); throw error; }
  }

  static async uploadAvatar(req, res) {
    if (!req.file) return res.status(400).json({ error: 'A JPG, PNG, or WebP image is required' });
    const extension = req.file.mimetype.split('/')[1].replace('jpeg', 'jpg');
    const storageKey = `${req.user.user_id}/avatar/${crypto.randomUUID()}.${extension}`;
    const destination = path.join(uploadRoot, storageKey);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, req.file.buffer, { flag: 'wx' });
    try {
      const fileId = await UserFile.create({ user_id: req.user.user_id, storage_key: storageKey, original_name: req.file.originalname, mime_type: req.file.mimetype, size_bytes: req.file.size });
      const profilePictureUrl = `${process.env.API_PUBLIC_URL || 'http://localhost:3000'}/api/v1/uploads/user-files/${fileId}`;
      await User.updateAvatar(req.user.user_id, profilePictureUrl);
      return res.status(201).json({ success: true, data: { file_id: fileId, profile_picture_url: profilePictureUrl } });
    } catch (error) { fs.rmSync(destination, { force: true }); throw error; }
  }

  static async downloadPaperFile(req, res) {
    const file = await PaperFile.findAccessible(Number(req.params.fileId), req.user?.user_id);
    if (!file) return res.status(404).json({ error: 'File not found' });
    const destination = path.join(uploadRoot, file.storage_key);
    if (!destination.startsWith(`${uploadRoot}${path.sep}`) || !fs.existsSync(destination)) {
      return res.status(404).json({ error: 'File not found' });
    }
    await Paper.incrementDownloads(file.paper_id);
    if (req.query.inline === '1') {
      res.type(file.mime_type || 'application/octet-stream');
      return res.sendFile(destination);
    }
    return res.download(destination, file.original_name);
  }

  static async downloadUserFile(req, res) {
    const file = await UserFile.findAccessible(Number(req.params.fileId));
    if (!file) return res.status(404).json({ error: 'File not found' });
    const destination = path.join(uploadRoot, file.storage_key);
    if (!destination.startsWith(`${uploadRoot}${path.sep}`) || !fs.existsSync(destination)) return res.status(404).json({ error: 'File not found' });
    res.type(file.mime_type || 'application/octet-stream');
    return res.sendFile(destination);
  }
}

async function poolUpdateCover(paperId, coverUrl) {
  const { pool } = require('../config/database');
  await pool.query('UPDATE RESEARCH_PAPERS SET cover_image_url = ?, updated_at = SYSTIMESTAMP WHERE paper_id = ?', [coverUrl, paperId]);
}

module.exports = UploadController;
