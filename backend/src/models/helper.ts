import mongoose from 'mongoose';

const helperSchema = new mongoose.Schema({
  serviceType: { type: String, required: true },
  organization: { type: String, required: true },
  fullName: { type: String, required: true },
  gender: { type: String, required: true },
  phno: { type: Number, required: true },
  email: String,
  vehicleType: String,
  vehicleNumber: String,
  docType: { type: String, required: true },
  kycdoc:  String,
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
  },
  employeeCode: { type: String, unique: true, required: true },
  joinedOn: { type: Date, default: Date.now }
});

export const Helper = mongoose.model('Helper', helperSchema);
