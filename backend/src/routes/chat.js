const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { auth } = require('../middlewares/auth');

const router = express.Router();

const { getBotResponse } = require('../utils/chatbot');

// Đảm bảo Bot user tồn tại
const ensureBotExists = async () => {
  let bot = await User.findOne({ email: 'chatbot@chungmobile.com' });
  if (!bot) {
    bot = new User({
      name: 'Trợ lý ảo Chung Mobile',
      email: 'chatbot@chungmobile.com',
      password: await require('bcryptjs').hash('bot_password_secure', 10),
      role: 'admin',
      avatar: '/assets/images/bot-avatar.png' // Bạn có thể thay ảnh này sau
    });
    await bot.save();
  }
  return bot;
};

// Lấy danh sách cuộc trò chuyện
router.get('/conversations', auth, async (req, res) => {
  try {
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { receiver: req.user._id }
          ]
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', req.user._id] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiver', req.user._id] }, { $eq: ['$read', false] }] },
                1, 0
              ]
            }
          }
        }
      },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      {
        $project: {
          user: { _id: 1, name: 1, email: 1, avatar: 1, role: 1 },
          lastMessage: { content: 1, createdAt: 1, read: 1 },
          unreadCount: 1
        }
      },
      { $sort: { 'lastMessage.createdAt': -1 } }
    ]);
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy cuộc trò chuyện', error: error.message });
  }
});

// Lấy tin nhắn với user
router.get('/:userId', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id }
      ]
    }).sort('-createdAt').skip((page - 1) * limit).limit(Number(limit))
      .populate('sender', 'name avatar').populate('receiver', 'name avatar');

    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user._id, read: false },
      { read: true, readAt: new Date() }
    );
    res.json({ success: true, data: messages.reverse() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy tin nhắn', error: error.message });
  }
});

// Gửi tin nhắn
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, content, messageType = 'text' } = req.body;
    
    // Check Receiver
    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ success: false, message: 'Không tìm thấy người nhận' });

    // 1. Save User Message
    const message = new Message({ sender: req.user._id, receiver: receiverId, content, messageType });
    await message.save();
    await message.populate('sender', 'name avatar');

    const io = req.app.get('io');
    
    // Notify Receiver (if real user)
    io.to(`user_${receiverId}`).emit('receive_message', message);
    
    // Send Notification
    if (receiver.email !== 'chatbot@chungmobile.com') { // Don't notify bot
        const notification = new Notification({
            user: receiverId, type: 'message', title: 'Tin nhắn mới',
            content: `${req.user.name}: ${content.substring(0, 50)}`, data: { senderId: req.user._id }
        });
        await notification.save();
        io.to(`user_${receiverId}`).emit('new_notification', notification);
    }

    // 2. CHECK IF RECEIVER IS BOT
    if (receiver.email === 'chatbot@chungmobile.com') {
        const { context } = req.body;
        
        // Fetch recent history for context
        const history = await Message.find({
            $or: [
                { sender: req.user._id, receiver: receiverId },
                { sender: receiverId, receiver: req.user._id }
            ]
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();
        
        const botResponse = await getBotResponse(content, { ...context, history: history.reverse() });
        
        // getBotResponse now returns { text, suggestedProducts }
        const botResponseContent = typeof botResponse === 'string' ? botResponse : botResponse.text;
        const suggestedProducts = typeof botResponse === 'object' ? (botResponse.suggestedProducts || []) : [];
        
        // Create reply from Bot
        const botMessage = new Message({
            sender: receiverId, // Bot sends back
            receiver: req.user._id,
            content: botResponseContent,
            messageType: 'text'
        });
        
        await botMessage.save();
        await botMessage.populate('sender', 'name avatar');

        // Delay slightly for natural feel
        setTimeout(() => {
            const messagePayload = botMessage.toObject();
            messagePayload.suggestedProducts = suggestedProducts;
            io.to(`user_${req.user._id}`).emit('receive_message', messagePayload);
        }, 500); 
    }

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi gửi tin nhắn', error: error.message });
  }
});

// Đánh dấu đã đọc
router.put('/:userId/read', auth, async (req, res) => {
  try {
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user._id, read: false },
      { read: true, readAt: new Date() }
    );
    res.json({ success: true, message: 'Đã đánh dấu đã đọc' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi', error: error.message });
  }
});

// Xóa cuộc trò chuyện (Reset chat)
router.delete('/conversations/:partnerId', auth, async (req, res) => {
  try {
    await Message.deleteMany({
      $or: [
        { sender: req.user._id, receiver: req.params.partnerId },
        { sender: req.params.partnerId, receiver: req.user._id }
      ]
    });
    res.json({ success: true, message: 'Đã xóa cuộc trò chuyện' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi xóa trò chuyện', error: error.message });
  }
});

// Lấy danh sách admin (bao gồm Bot)
router.get('/admins/list', auth, async (req, res) => {
  try {
    // Ensure bot exists first
    await ensureBotExists();
    
    const admins = await User.find({ role: 'admin', isActive: true }).select('name email avatar');
    
    // Sort logic: Bot first, then others
    const sortedAdmins = admins.sort((a, b) => {
        if (a.email === 'chatbot@chungmobile.com') return -1;
        if (b.email === 'chatbot@chungmobile.com') return 1;
        return a.name.localeCompare(b.name);
    });

    res.json({ success: true, data: sortedAdmins });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi', error: error.message });
  }
});

module.exports = router;
