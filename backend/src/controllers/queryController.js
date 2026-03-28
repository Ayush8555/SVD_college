import Query from '../models/Query.js';

/**
 * @desc    Create a new query (Student)
 * @route   POST /api/queries
 * @access  Private (Student)
 */
export const createQuery = async (req, res) => {
  try {
    const { subject, message } = req.body;

    const query = await Query.create({
      student: req.user._id,
      subject,
      message,
    });

    res.status(201).json({
      success: true,
      message: 'Query submitted successfully',
      data: query,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

/**
 * @desc    Get logged in student's queries
 * @route   GET /api/queries/my
 * @access  Private (Student)
 */
export const getMyQueries = async (req, res) => {
  try {
    const queries = await Query.find({ student: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: queries.length,
      data: queries,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Get all queries (Admin)
 * @route   GET /api/queries
 * @access  Private (Admin)
 */
export const getAllQueries = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const queries = await Query.find(query)
      .populate('student', 'firstName lastName rollNumber department')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: queries.length,
      data: queries,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Reply to a query (Admin)
 * @route   PUT /api/queries/:id/reply
 * @access  Private (Admin)
 */
export const replyQuery = async (req, res) => {
  try {
    const { reply, status } = req.body;
    const query = await Query.findById(req.params.id);

    if (!query) {
      return res.status(404).json({ success: false, message: 'Query not found' });
    }

    query.adminReply = reply;
    // If status is provided, use it; otherwise defaults to Resolved if reply is added
    query.status = status || 'Resolved';
    query.repliedBy = req.user._id;
    query.repliedAt = Date.now();

    await query.save();

    res.json({
      success: true,
      message: 'Reply sent successfully',
      data: query,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
