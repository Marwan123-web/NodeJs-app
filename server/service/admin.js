const User = require('../models/user');
const Course = require('../models/course');
const Grade = require('../models/grade');
const Attendance = require('../models/attendance');

// const attendanceModel = require('../module/attendance');


class adminService {

    // ------------------------Student Services ----------------------------------------
    static getUserData(id) {
        return User.findOne({ _id: id }, { password: 0, accessToken: 0 });
    }

    static getAllUsers() {
        return User.find();
    }
    static getUserByRole(role) {
        return User.find({ role: role });
    }
    static getUserById(id) {
        return User.findOne({ _id: id });
    }

    static getUserByName(UserName, role) {
        return User.findOne({ name: { $regex: UserName, $options: 'i' }, role })
    }

    static deleteUser(id) {
        return User.findOneAndDelete({ _id: id });
    }

    static getUserCourses(id) {
        return User.findOne({ _id: id }, { _id: 1, name: 1, courses: 1 })
    }

    static addUserCourse(id, courseCode) {
        var course = { Id: courseCode };
        return User.findOne({ _id: id }).updateOne(
            {}, // your query, usually match by _id
            { $push: { courses: course } }, // item(s) to match from array you want to pull/remove
            { multi: true } // set this to true if you want to remove multiple elements.
        );
    }

    static deleteUserCourse(UserId, courseCode) {
        var course = { Id: courseCode };
        return User.findOne({ _id: UserId }).updateOne(
            {}, // your query, usually match by _id
            { $pull: { courses: course } }, // item(s) to match from array you want to pull/remove
            { multi: true } // set this to true if you want to remove multiple elements.
        )
    }

    // ---------------------------------------------------------
    static getAllCourses() {
        return Course.find();
    }
    static getDepartmentCourses(department) {
        return Course.find({ courseDepartment: department });
    }

    static getCourseByCode(code) {
        return Course.findOne({ courseCode: code })
    }

    static getCourseByName(courseName) {
        return Course.findOne({ courseName: { $regex: courseName, $options: 'm' } });
    }

    static deleteCourse(code) {
        User.find().updateMany(
            { 'courses.Id': code }, // your query, usually match by _id
            { $pull: { 'courses.Id': { $in: [code] } } }, // item(s) to match from array you want to pull/remove
            { multi: true } // set this to true if you want to remove multiple elements.
        )
        return Course.findOneAndDelete({ courseCode: code });
    }

    static addCourseGrades(code, gradetype, coursegrade) {
        var grade = { type: gradetype, grade: coursegrade };
        return Course.findOne({ courseCode: code }).updateOne(
            { courseCode: code }, // your query, usually match by _id
            { $push: { grades: grade } }, // item(s) to match from array you want to pull/remove
            { multi: true } // set this to true if you want to remove multiple elements.
        )
    }

    static getCourseGradeType(courseCode, gardeType) {
        return Course.findOne({ courseCode: courseCode }, { "grades.type": 1, "grades.grade": 1, grades: { $elemMatch: { type: gardeType } }, _id: 0 })
    }
    static deleteCourseGrade(code, type) {
        return Course.findOne({ courseCode: code }).updateOne(
            { courseCode: code }, // your query, usually match by _id
            { $pull: { grades: { type: type } } }, // item(s) to match from array you want to pull/remove
            { multi: true } // set this to true if you want to remove multiple elements.
        )
    }

    static getCourseStudents(courseCode) {
        return User.find({ 'courses.Id': { $in: [courseCode] }, role: 'student' }, { _id: 1, name: 1, email: 1 });

    }

    static getCourseGrades(courseCode, gradeType) {
        return Grade.find({ courseId: courseCode, gradeType: gradeType });
    }
    static updateStudentGrade(studentId, courseId, gradeType, score) {
        return Grade.updateOne(
            { studentId, courseId, gradeType },
            { $set: { score: score } },
            { multi: true }
        )
    }

}
module.exports = adminService;