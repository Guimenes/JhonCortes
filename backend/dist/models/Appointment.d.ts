import mongoose, { Document } from 'mongoose';
export interface IAppointment extends Document {
    user: mongoose.Types.ObjectId;
    service: mongoose.Types.ObjectId;
    date: Date;
    startTime: string;
    endTime: string;
    status: 'pendente' | 'confirmado' | 'concluido' | 'cancelado';
    notes?: string;
    totalPrice: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IAppointment, {}, {}, {}, mongoose.Document<unknown, {}, IAppointment, {}, {}> & IAppointment & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Appointment.d.ts.map