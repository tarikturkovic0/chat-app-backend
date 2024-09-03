const redisClient = require('../redisClient');
const bcrypt = require('bcryptjs');

class UserModel {
    static async createUser(username, password) {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            await redisClient.hSet(`user:${username}`, 'password', hashedPassword);
        } catch (error) {
            console.error('Error creating user:', error);
            throw new Error('Error creating user');
        }
    }
 
    static async getUser(username) {
        try {
            const user = await redisClient.hGetAll(`user:${username}`);
            return user;
        } catch (error) {
            console.error('Error retrieving user:', error);
            throw new Error('Error retrieving user');
        }
    }

    static async verifyPassword(username, password) {
        try {
            const user = await this.getUser(username);
            if (!user || Object.keys(user).length === 0) {
                console.error('User not found or empty:', username);
                return false;
            }

            const isValid = await bcrypt.compare(password, user.password);
            return isValid;
        } catch (error) {
            console.error('Error verifying password:', error);
            throw new Error('Error verifying password');
        }
    }
}

module.exports = UserModel;
