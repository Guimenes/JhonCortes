import mongoose, { Document } from 'mongoose';
export interface IService extends Document {
    name: string;
    description: string;
    duration: number;
    price: number;
    isActive: boolean;
    category: 'corte' | 'barba' | 'combo' | 'tratamento';
    image?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IService, {}, {}, {}, mongoose.Document<unknown, {}, IService, {}, {}> & IService & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Service.d.ts.map