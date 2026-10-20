
import Role from "../models/Role.js";

export async function create(data) {
  return Role.create(data);
}

export async function findById(roleId) {
  return Role.findById(roleId);
}

export async function findByName(name) {
  return Role.findOne({
    name: name.toLowerCase().trim(),
  });
}

export async function findAll() {
  return Role.find().sort({ name: 1 });
}

export async function updateById(roleId, data) {
  return Role.findByIdAndUpdate(roleId, data, {
    new: true,
    runValidators: true,
  });
}

export async function deleteById(roleId) {
  return Role.findByIdAndDelete(roleId);
}
