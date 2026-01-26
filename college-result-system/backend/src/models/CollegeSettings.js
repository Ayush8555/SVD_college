import mongoose from 'mongoose';

const collegeSettingsSchema = new mongoose.Schema(
  {
    universityName: {
      type: String,
      required: [true, 'University name is required'],
      trim: true,
      default: 'Savitribai Phule Pune University',
    },
    collegeName: {
      type: String,
      required: [true, 'College name is required'],
      trim: true,
      default: 'Government Engineering College, Pune',
    },
    aisheCode: {
      type: String,
      required: [true, 'AISHE code is required'], // All India Survey on Higher Education code
      trim: true,
      uppercase: true,
    },
    websiteUrl: {
      type: String,
      required: [true, 'Website URL is required'],
      trim: true,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        'Please use a valid URL with http or https',
      ],
    },
    logoUrl: {
      type: String,
      default: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Gec_pune_logo.png/1200px-Gec_pune_logo.png',
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: {
        type: String,
        match: [/^[1-9][0-9]{5}$/, 'Please enter a valid 6-digit Indian pincode'],
      },
    },
    contactEmail: {
      type: String,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
    },
    contactPhone: {
      type: String,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'],
    },
    currentAcademicYear: {
      type: String,
      default: '2025-26',
    },
    isResultPortalActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent multiple settings documents
collegeSettingsSchema.pre('save', async function () {
  const model = this.constructor;
  if (this.isNew) {
    const count = await model.estimatedDocumentCount();
    if (count > 0) {
      throw new Error('Cannot create more than one CollegeSettings document');
    }
  }
});

const CollegeSettings = mongoose.model('CollegeSettings', collegeSettingsSchema);

export default CollegeSettings;
