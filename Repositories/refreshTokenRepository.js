import User from "../models/User.js";

export async function create(data) {
  return User.create(data);
}

export async function findById(userId) {
  return User.findById(userId);
}

export async function findByEmail(email) {
  return User.findOne({
    email: email.toLowerCase().trim(),
  }).select("+password");
}

export async function existsByEmail(email) {
  return User.exists({
    email: email.toLowerCase().trim(),
  });
}

export async function deleteById(userId) {
  return User.findByIdAndDelete(userId);
}