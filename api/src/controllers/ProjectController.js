const Project = require('../models/Project');

exports.getAllPublic = async (req, res) => {
  try {
    const projects = await Project.findAllPublic();
    res.json({ data: projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Server error while fetching projects' });
  }
};

exports.getMyProjects = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const projects = await Project.findByUser(userId);
    res.json({ data: projects });
  } catch (error) {
    console.error('Error fetching my projects:', error);
    res.status(500).json({ error: 'Server error while fetching my projects' });
  }
};

exports.createProject = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }
    const projectId = await Project.create(userId, title, description);
    res.status(201).json({ data: { project_id: projectId, title, description, status: 'active' } });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Server error while creating project' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const projectId = parseInt(req.params.projectId, 10);
    const { status } = req.body;
    const affectedRows = await Project.updateStatus(projectId, userId, status);
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating project status:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
