import StudentProfile from "../models/StudentProfile.js";
import TeacherProfile from "../models/TeacherProfile.js";
import EmployeeProfile from "../models/EmployeeProfile.js";

export async function createStudentProfile(data) {
  return StudentProfile.create(data);
}

export async function createTeacherProfile(data) {
  return TeacherProfile.create(data);
}

export async function createEmployeeProfile(data) {
  return EmployeeProfile.create(data);
}

export async function findStudentProfile(userId) {
  return StudentProfile.findOne({ userId });
}

export async function findTeacherProfile(userId) {
  return TeacherProfile.findOne({ userId });
}

export async function findEmployeeProfile(userId) {
  return EmployeeProfile.findOne({ userId });
}

export async function deleteStudentProfile(userId) {
  return StudentProfile.deleteOne({ userId });
}

export async function deleteTeacherProfile(userId) {
  return TeacherProfile.deleteOne({ userId });
}

export async function deleteEmployeeProfile(userId) {
  return EmployeeProfile.deleteOne({ userId });
}