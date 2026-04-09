module.exports = require('../server.js');
      if (age) {
        filter.age = Number(age);
      } else if (minAge || maxAge) {
        filter.age = {};
        if (minAge) filter.age.$gte = Number(minAge);
        if (maxAge) filter.age.$lte = Number(maxAge);
      }
      if (hobby) filter.hobbies = { $in: hobby.split(',').map(h => h.trim()) };
      if (search) filter.$text = { $search: search };

      const skip = (Number(page || 1) - 1) * Number(limit || 10);
      const sortOrder = (order || 'desc') === 'asc' ? 1 : -1;

      const users = await User.find(filter)
        .sort({ [sortBy || 'createdAt']: sortOrder })
        .skip(skip)
        .limit(Number(limit || 10));
      
      const total = await User.countDocuments(filter);

      return res.status(200).json({ success: true, total, page: Number(page || 1), count: users.length, data: users });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  if (pathname === '/api/users' && method === 'POST') {
    try {
      let body = '';
      for await (const chunk of req) {
        body += chunk;
      }
      const { name, email, age, hobbies, bio } = JSON.parse(body);
      const userId = uuidv4();
      const user = new User({ name, email, age, hobbies, bio, userId });
      const savedUser = await user.save();
      return res.status(201).json({ success: true, message: 'User created', data: savedUser });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  if (pathname === '/api/health') {
    return res.status(200).json({ success: true, message: 'API running', mongoDBConnected: mongoose.connection.readyState === 1 });
  }

  if (pathname === '/') {
    return res.status(200).send('User Management API is running');
  }

  return res.status(404).json({ success: false, message: 'Not found' });
}

module.exports = handler;
