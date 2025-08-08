"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const appointmentSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Usuário é obrigatório']
    },
    service: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Service',
        required: [true, 'Serviço é obrigatório']
    },
    date: {
        type: Date,
        required: [true, 'Data é obrigatória'],
        validate: {
            validator: function (value) {
                return value >= new Date();
            },
            message: 'Data não pode ser no passado'
        }
    },
    startTime: {
        type: String,
        required: [true, 'Horário de início é obrigatório'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de horário inválido (HH:MM)']
    },
    endTime: {
        type: String,
        required: [true, 'Horário de fim é obrigatório'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de horário inválido (HH:MM)']
    },
    status: {
        type: String,
        enum: ['pendente', 'confirmado', 'concluido', 'cancelado'],
        default: 'pendente'
    },
    notes: {
        type: String,
        maxlength: [500, 'Observações não podem ter mais que 500 caracteres']
    },
    totalPrice: {
        type: Number,
        required: [true, 'Preço total é obrigatório'],
        min: [0, 'Preço não pode ser negativo']
    }
}, {
    timestamps: true
});
// Index for efficient queries
appointmentSchema.index({ date: 1, startTime: 1 });
appointmentSchema.index({ user: 1 });
appointmentSchema.index({ status: 1 });
// Validate that end time is after start time
appointmentSchema.pre('save', function (next) {
    const startHour = parseInt(this.startTime.split(':')[0]);
    const startMinute = parseInt(this.startTime.split(':')[1]);
    const endHour = parseInt(this.endTime.split(':')[0]);
    const endMinute = parseInt(this.endTime.split(':')[1]);
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    if (endTotalMinutes <= startTotalMinutes) {
        next(new Error('Horário de fim deve ser posterior ao horário de início'));
    }
    else {
        next();
    }
});
exports.default = mongoose_1.default.model('Appointment', appointmentSchema);
//# sourceMappingURL=Appointment.js.map