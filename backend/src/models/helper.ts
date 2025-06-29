import mongoose from 'mongoose';

const helperSchema = new mongoose.Schema({
  serviceType: { type: String, required: true },
  organization: { type: String, required: true },
  name: { type: String, required: true },
  gender: { type: String, required: true },
  phone: { type: Number, required: true },
  email: String,
  vehicleType: String,
  documentType: { type: String, required: true },
  kycDocURL: { type: String, required: true },
  photoURL: String,
  languages: {
    type: [String],
    required: true,
    validate: {
      validator: function (val: string[]) {
        return val.length > 0;
      },
      message: 'At least one language is required.'
    }
  }
});

export const Helper = mongoose.model('Helper', helperSchema);