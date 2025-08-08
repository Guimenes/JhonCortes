"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultAdmin = void 0;
const User_1 = __importDefault(require("../models/User"));
const createDefaultAdmin = async () => {
    try {
        // Check if admin already exists
        const existingAdmin = await User_1.default.findOne({ role: 'admin' });
        if (!existingAdmin) {
            const defaultAdmin = new User_1.default({
                name: 'Jhon Cortes',
                email: 'admin@jhoncortes.com',
                password: 'admin123456', // This will be hashed automatically
                phone: '(11) 99999-9999',
                role: 'admin'
            });
            await defaultAdmin.save();
            console.log('✅ Default admin user created');
            console.log('📧 Email: admin@jhoncortes.com');
            console.log('🔑 Password: admin123456');
            console.log('⚠️  Please change the default password after first login!');
        }
        else {
            console.log('✅ Admin user already exists');
        }
    }
    catch (error) {
        console.error('❌ Error creating default admin:', error);
    }
};
exports.createDefaultAdmin = createDefaultAdmin;
//# sourceMappingURL=createDefaultAdmin.js.map