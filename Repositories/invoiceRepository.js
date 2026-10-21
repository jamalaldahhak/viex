
import Invoice from "../models/Invoice.js";

export function create(data) {
  return Invoice.create(data);
}

export function findAll({ page, limit }) {
  return Invoice.find()
    .populate("userId", "full_name email")
    .populate("courseId", "name title")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
}

export function countAll() {
  return Invoice.countDocuments();
}

export function findById(id) {
  return Invoice.findById(id)
    .populate("userId", "full_name email")
    .populate("courseId", "name title");
}

export function findByIdForUpdate(id) {
  return Invoice.findById(id);
}

export function updateById(id, data) {
  return Invoice.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  })
    .populate("userId", "full_name email")
    .populate("courseId", "name title");
}

export function deleteById(id) {
  return Invoice.findByIdAndDelete(id);
}
