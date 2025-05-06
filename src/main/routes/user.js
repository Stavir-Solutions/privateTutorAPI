const express = require('express');
const router = express.Router();
const { getUserByUserName } = require('../services/userService');

router.get('/name/:name/type/:type', async (req, res) => {
    const { name, type } = req.params;
  
    if (!name || !type) {
      return res.status(400).json({ error: 'name and type are required' });
    }
  
    console.log('Checking username availability for name:', name, 'and type:', type);
  
    try {
      const user = await getUserByUserName(name, type);
  
      if (user) {
        return res.status(200).json({ message: `User ${name} exists as ${type}` }); 
      } 
      
      return res.status(404).json({ message: `User ${name} does not exist as ${type}` });
  
    } catch (err) {
      console.error('Error checking username:', err);
  
      if (!res.headersSent) {
        return res.status(500).json({ error: 'Internal server error' });
      }
    }
  });
  module.exports = router;
