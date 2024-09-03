const UserModel = require('../models/userModel');
const jwt = require('jsonwebtoken');

const authController = {
    register: async (req, res) => {
        const { username, password } = req.body;
        try {
            await UserModel.createUser(username, password);
            res.status(201).json({ message: 'User registered successfully' });
        } catch (error) {
            console.error('Error registering user:', error);
            res.status(500).json({ error: 'Error registering user' });
        }
    },

    login: async (req, res) => {
        const { username, password } = req.body;
        try {
            const user = await UserModel.getUser(username);
            if (!user || Object.keys(user).length === 0) {
                console.error('User not found:', username);
                return res.status(401).send('Invalid credentials');
            }

            const isValid = await UserModel.verifyPassword(username, password);
            if (!isValid) {
                console.error('Invalid password for user:', username);
                return res.status(401).send('Invalid credentials');
            }

            const token = jwt.sign({ username }, process.env.JWT_SECRET, {
                expiresIn: '1h',
            });
            res.json({ token, username });
        } catch (error) {
            console.error('Error logging in:', error);
            res.status(500).send('Error logging in');
        }
    },
};

module.exports = authController;
