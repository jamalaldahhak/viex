
export const PERMISSION_CATALOG = [
  // Users
  { name: "users.view", description: "View users" },
  { name: "users.create", description: "Create users" },
  { name: "users.update", description: "Update users" },
  { name: "users.delete", description: "Delete users" },
  { name: "users.assign_roles", description: "Assign roles to users" },
  { name: "users.assign_permissions", description: "Assign direct permissions to users" },
{ name: "employees.view", description: "View employees" },
{ name: "employees.create", description: "Create employees" },
{ name: "employees.update", description: "Update employees" },
{ name: "employees.delete", description: "Delete employees" },
  // Students
  { name: "students.view", description: "View students" },
  { name: "students.create", description: "Create students" },
  { name: "students.update", description: "Update students" },
  { name: "students.delete", description: "Delete students" },

  // Teachers
  { name: "teachers.view", description: "View teachers" },
  { name: "teachers.create", description: "Create teachers" },
  { name: "teachers.update", description: "Update teachers" },
  { name: "teachers.delete", description: "Delete teachers" },

  // Courses
  { name: "courses.view", description: "View courses" },
  { name: "courses.create", description: "Create courses" },
  { name: "courses.update", description: "Update courses" },
  { name: "courses.delete", description: "Delete courses" },

  // Quizzes
  { name: "quizzes.view", description: "View quizzes" },
  { name: "quizzes.create", description: "Create quizzes" },
  { name: "quizzes.update", description: "Update quizzes" },
  { name: "quizzes.delete", description: "Delete quizzes" },
  { name: "quizzes.submit", description: "Submit quiz answers" },
  { name: "course_students.manage", description: "Manage course student enrollments" },

  // Attendance
  { name: "attendance.view", description: "View attendance" },
  { name: "attendance.create", description: "Record attendance" },
  { name: "attendance.update", description: "Update attendance" },
  { name: "attendance.delete", description: "Delete attendance" },

  // Payments
  { name: "payments.view", description: "View payments" },
  { name: "payments.create", description: "Record payments" },
  { name: "payments.update", description: "Update payments" },
  { name: "payments.delete", description: "Delete payments" },

  // Student self-service
  { name: "profile.view_own", description: "View own profile" },
  { name: "profile.update_own", description: "Update own profile" },
  { name: "courses.view_own", description: "View own courses" },
  { name: "attendance.view_own", description: "View own attendance" },
  { name: "payments.view_own", description: "View own payments" },

  // Teacher self-service
  { name: "teacher.courses.view_assigned", description: "View assigned courses" },
  { name: "teacher.attendance.manage_assigned", description: "Manage attendance for assigned courses" },
];

export const DEFAULT_ROLE_PERMISSIONS = {
  student: [
    "profile.view_own",
    "profile.update_own",
    "courses.view_own",
    "quizzes.view",
    "quizzes.submit",
    "attendance.view_own",
    "payments.view_own",
  ],

  teacher: [
    "profile.view_own",
    "profile.update_own",
    "teacher.courses.view_assigned",
    "teacher.attendance.manage_assigned",
    "quizzes.view",
    "quizzes.create",
    "quizzes.update",
    "quizzes.delete",
  ],

  employee: [],

  admin: PERMISSION_CATALOG.map((permission) => permission.name),
};
