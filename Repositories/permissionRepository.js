
import Permission from "../models/Permission.js";

export async function create(data) {
  return Permission.create(data);
}

export async function findById(permissionId) {
  return Permission.findById(permissionId);
}

export async function findByName(name) {
  return Permission.findOne({
    name: name.toLowerCase().trim(),
  });
}

export async function findByNames(names) {
  return Permission.find({
    name: {
      $in: names.map((name) => name.toLowerCase().trim()),
    },
  });
}

export async function findByIds(permissionIds) {
  return Permission.find({
    _id: { $in: permissionIds },
  }).select("_id name");
}

export async function findAll() {
  return Permission.find().sort({ name: 1 });
}

export async function updateById(permissionId, data) {
  return Permission.findByIdAndUpdate(permissionId, data, {
    new: true,
    runValidators: true,
  });
}

export async function deleteById(permissionId) {
  return Permission.findByIdAndDelete(permissionId);
}
