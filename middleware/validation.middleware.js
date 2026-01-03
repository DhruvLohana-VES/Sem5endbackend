const { validationResult } = require('express-validator');

exports.validate = (req, res, next) => {
  console.log('🔍 Validation middleware called');
  const errors = validationResult(req);
  console.log('🔍 Validation result isEmpty:', errors.isEmpty());
  
  if (!errors.isEmpty()) {
    console.log('❌ Validation errors:', errors.array());
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};
