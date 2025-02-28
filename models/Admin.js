import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  AdminID: { type: Number, required: true,unique: true, 
    validate: 
    {
      validator: function(v) 
      {
        return /^\d{7}$/.test(v); // Ensure it's a 7-digit number
      },
      message: props => `${props.value} is not a valid 7-digit AdminID!`
    }
  }
}, { timestamps: true });

export default mongoose.model("Admin", adminSchema);
