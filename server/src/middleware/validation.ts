import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const validateSession = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    meetingId: Joi.string(),
    start: Joi.date().iso(),
    end: Joi.date().iso(),
    uniqueParticipantsCount: Joi.number().integer().min(0),
    participantArray: Joi.array().items(Joi.object({
      participantId: Joi.string().required(),
      name: Joi.string().required(),
      events: Joi.object({
        mic: Joi.array().items(Joi.object({
          start: Joi.date().iso().required(),
          end: Joi.date().iso().required()
        })),
        webcam: Joi.array().items(Joi.object({
          start: Joi.date().iso().required(),
          end: Joi.date().iso().required()
        })),
        screenShare: Joi.array().items(Joi.object({
          start: Joi.date().iso().required(),
          end: Joi.date().iso().required()
        })),
        screenShareAudio: Joi.array().items(Joi.object({
          start: Joi.date().iso().required(),
          end: Joi.date().iso().required()
        })),
        errors: Joi.array().items(Joi.object({
          start: Joi.date().iso().required(),
          message: Joi.string().required()
        }))
      }),
      timelog: Joi.array().items(Joi.object({
        start: Joi.date().iso().required(),
        end: Joi.date().iso().required()
      }))
    }))
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};