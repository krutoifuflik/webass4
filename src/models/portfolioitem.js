import mongoose from 'mongoose';

const portfolioItemSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pictures: { 
      type: [{ type: String }],
      required: true,
      // validate: [function (v) {
      //   return v.length >= 3;
      // }, 'Cannot have less than three pictures'],
    },
    names: {
        type: {
            ru: { type: String, required: true },
            en: { type: String, required: true }
        },
        required: true,
        _id: false,
    },
    descriptions: {
        type: {
            ru: { type: String, required: true },
            en: { type: String, required: true }
        },
        required: true,
        _id: false
    },
    timestamps: {
        creationDate: { type: Date, default: Date.now },
        updateDate: { type: Date, default: Date.now  }
    }
}, {
  versionKey: false
});

const PortfolioItemModel = mongoose.model('PortfolioItem', portfolioItemSchema);

export default PortfolioItemModel;
