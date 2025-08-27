import mongoose from "mongoose";

const colorSchema = new mongoose.Schema({
  page: { type: String, required: true },  // e.g. "home", "profile"
  color: { type: String, required: true }, // e.g. "#b8ccca"
});

const PageColor = mongoose.model("pagecolor", colorSchema);

export default PageColor;
