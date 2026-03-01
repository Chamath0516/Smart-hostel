import mongoose from "mongoose";

const qrLogSchema = new mongoose.Schema(
  {
    studentUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, enum: ["exit", "entry"], required: true },
    destination: { type: String, trim: true }, // only for exit
    goingHome: { type: Boolean, default: false }, // if true, skip curfew checks
    scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional for public QR flow
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("QRLog", qrLogSchema);
