const router = require('express').Router();
const checkBan = require('../middleware/checkBan');
const { validateBody } = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validation/schemas');
const { register, login } = require('../controllers/authController');

router.post('/register', validateBody(registerSchema), checkBan, register);
router.post('/login', validateBody(loginSchema), checkBan, login);

module.exports = router;
