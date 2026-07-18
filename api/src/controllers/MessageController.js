const Message = require('../models/Message');
const ActivityEvent = require('../models/ActivityEvent');

exports.getConversations = async (req, res) => {
  try { res.json({ data: await Message.getConversations(req.user.user_id) }); }
  catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getConversationWithUser = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    if (!Number.isInteger(userId) || userId <= 0) return res.status(400).json({ error: 'Invalid user ID' });
    res.json({ data: await Message.getConversationWithUser(req.user.user_id, userId) });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.searchUsers = async (req, res) => {
  try { res.json({ data: await Message.searchUsers(req.user.user_id, String(req.query.q || '').trim()) }); }
  catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getRequests = async (req, res) => {
  try { res.json({ data: await Message.getRequests(req.user.user_id) }); }
  catch (error) { res.status(500).json({ error: error.message }); }
};

exports.createRequest = async (req, res) => {
  try {
    const recipientId = Number(req.body.recipient_id);
    const content = String(req.body.content || '').trim();
    if (!Number.isInteger(recipientId) || recipientId <= 0 || !content || content.length > 2000) return res.status(400).json({ error: 'recipient_id and a message up to 2000 characters are required' });
    if (recipientId === req.user.user_id) return res.status(400).json({ error: 'You cannot message yourself' });
    const request = await Message.createRequest(req.user.user_id, recipientId, content);
    if (request.status === 'pending' && request.sender_id === req.user.user_id) {
      await ActivityEvent.create({ recipient_user_id: recipientId, actor_user_id: req.user.user_id, event_type: 'message_request', source_type: 'message_request', source_id: request.request_id, title: 'New message request', body: content.slice(0, 180), route_url: '/messages' }).catch(() => undefined);
    }
    res.status(201).json({ data: request });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.updateRequest = async (req, res) => {
  const status = String(req.body.status || '').toLowerCase();
  if (!['accepted', 'declined', 'blocked'].includes(status)) return res.status(400).json({ error: 'Invalid message request status' });
  try {
    const updated = await Message.updateRequest(Number(req.params.id), req.user.user_id, status);
    if (!updated) return res.status(404).json({ error: 'Message request not found or already decided' });
    res.json({ data: { request_id: Number(req.params.id), status } });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.sendMessage = async (req, res) => {
  try {
    const receiverId = Number(req.body.receiver_id);
    const content = String(req.body.content || '').trim();
    if (!Number.isInteger(receiverId) || receiverId <= 0 || !content || content.length > 4000) return res.status(400).json({ error: 'receiver_id and a message up to 4000 characters are required' });
    if (receiverId === req.user.user_id) return res.status(400).json({ error: 'You cannot message yourself' });
    if (!await Message.canMessage(req.user.user_id, receiverId)) return res.status(409).json({ error: 'Accept the message request before continuing the conversation' });
    const messageId = await Message.create(req.user.user_id, receiverId, content);
    await ActivityEvent.create({ recipient_user_id: receiverId, actor_user_id: req.user.user_id, event_type: 'new_message', source_type: 'message', source_id: messageId, title: 'New message', body: content.slice(0, 180), route_url: '/messages' }).catch(() => undefined);
    res.status(201).json({ data: { message_id: messageId, sender_id: req.user.user_id, receiver_id: receiverId, content } });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.markAsRead = async (req, res) => {
  try {
    const affectedRows = await Message.markAsRead(Number(req.params.messageId), req.user.user_id);
    if (!affectedRows) return res.status(404).json({ error: 'Message not found or you are not the receiver' });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
};
