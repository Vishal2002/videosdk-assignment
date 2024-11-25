"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSession = void 0;
const joi_1 = __importDefault(require("joi"));
const validateSession = (req, res, next) => {
    const schema = joi_1.default.object({
        meetingId: joi_1.default.string().required(),
        start: joi_1.default.date().iso().required(),
        end: joi_1.default.date().iso(),
        uniqueParticipantsCount: joi_1.default.number().integer().min(0),
        participantArray: joi_1.default.array().items(joi_1.default.object({
            participantId: joi_1.default.string().required(),
            name: joi_1.default.string().required(),
            events: joi_1.default.object({
                mic: joi_1.default.array().items(joi_1.default.object({
                    start: joi_1.default.date().iso().required(),
                    end: joi_1.default.date().iso().required()
                })),
                webcam: joi_1.default.array().items(joi_1.default.object({
                    start: joi_1.default.date().iso().required(),
                    end: joi_1.default.date().iso().required()
                })),
                screenShare: joi_1.default.array().items(joi_1.default.object({
                    start: joi_1.default.date().iso().required(),
                    end: joi_1.default.date().iso().required()
                })),
                screenShareAudio: joi_1.default.array().items(joi_1.default.object({
                    start: joi_1.default.date().iso().required(),
                    end: joi_1.default.date().iso().required()
                })),
                errors: joi_1.default.array().items(joi_1.default.object({
                    start: joi_1.default.date().iso().required(),
                    message: joi_1.default.string().required()
                }))
            }),
            timelog: joi_1.default.array().items(joi_1.default.object({
                start: joi_1.default.date().iso().required(),
                end: joi_1.default.date().iso().required()
            }))
        }))
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};
exports.validateSession = validateSession;
