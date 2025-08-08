import mongoose from 'mongoose';
import User from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const normalizeExistingPhones = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jhon-cortes-barber';
    await mongoose.connect(uri);
    console.log('✅ MongoDB conectado');

    const users = await User.find({});
    console.log(`📱 Encontrados ${users.length} usuários`);

    for (const user of users) {
      const originalPhone = user.phone;
      const normalizedPhone = originalPhone.replace(/\D/g, '');
      
      if (originalPhone !== normalizedPhone) {
        user.phone = normalizedPhone;
        await user.save();
        console.log(`✅ Telefone normalizado: ${originalPhone} → ${normalizedPhone} (${user.email})`);
      }
    }

    console.log('✅ Normalização concluída');
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
};

normalizeExistingPhones();
