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
        return User.find({}, { password: 0 });
    }
    static getUserByRole(role) {
        return User.find({ role: role }, { password: 0 });
    }
    static getUserById(id) {
        return User.findOne({ _id: id }, { password: 0 });
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

    static async addUserCourse(id, courseCode) {
        let courseSemesters = await Course.findOne({ courseCode }, { semesters: { $elemMatch: { semester_status: 'open' } } })
        var course = { Id: courseCode, semester_time: courseSemesters.semesters[0].semester_time };
        return User.findOne({ _id: id }).updateOne(
            {}, // your query, usually match by _id
            { $push: { courses: course } }, // item(s) to match from array you want to pull/remove
            { multi: true } // set this to true if you want to remove multiple elements.
        );
    }

    static async deleteUserCourse(UserId, courseCode) {
        let courseSemesters = await Course.findOne({ courseCode }, { semesters: { $elemMatch: { semester_status: 'open' } } })
        var course = { Id: courseCode, semester_time: courseSemesters.semesters[0].semester_time };
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
    static getAllActiveCourses() {
        return Course.find({ status: 'active' });
    }
    static getDepartmentCourses(department) {
        return Course.find({ courseDepartment: department });
    }

    static getCourseByCode(code) {
        return Course.findOne({ courseCode: code })
    }
    // static getCourseSemesterByCode(code, semester_time) {
    //     return Course.findOne({ courseCode: code }, { semesters: { $elemMatch: { semester_time: semester_time } } })
    // }
    static getCourseByName(courseName) {
        return Course.findOne({ courseName: { $regex: courseName, $options: 'm' } });
    }
    static async addCourseSemester(code, semester_time) {
        var semester_time = { semester_time: semester_time };
        let checkopencoursesemester = await Course.findOne({ courseCode: code }, { semesters: { $elemMatch: { semester_status: 'open' } } })
        if (checkopencoursesemester) {
            return
        }
        else {
            return Course.findOne({ courseCode: code }).updateOne(
                { courseCode: code }, // your query, usually match by _id
                { $push: { semesters: semester_time } }, // item(s) to match from array you want to pull/remove
                { multi: true } // set this to true if you want to remove multiple elements.
            )
        }

    }
    static deleteCourse(code) {
        User.find().updateMany(
            { 'courses.Id': code }, // your query, usually match by _id
            { $pull: { 'courses.Id': { $in: [code] } } }, // item(s) to match from array you want to pull/remove
            { multi: true } // set this to true if you want to remove multiple elements.
        )
        return Course.findOneAndDelete({ courseCode: code });
    }

    static addCourseSemesterGrades(code, semester_time, gradetype, coursegrade) {
        var grade = { type: gradetype, grade: coursegrade };
        return Course.findOne({ courseCode: code }).updateOne(
            { courseCode: code, "semesters.semester_time": semester_time }, // your query, usually match by _id
            { $push: { "semesters.$.grades": grade } }, // item(s) to match from array you want to pull/remove
            { multi: true } // set this to true if you want to remove multiple elements.
        )
    }
    static getCourseGradeType(courseCode, gardeType) {
        return Course.findOne({ courseCode: courseCode }, { "grades.type": 1, "grades.grade": 1, grades: { $elemMatch: { type: gardeType } }, _id: 0 })
    }
    static deleteCourseSemesterGrade(code, semester_time, type) {
        return Course.findOne({ courseCode: code }).updateOne(
            { courseCode: code, "semesters.semester_time": semester_time }, // your query, usually match by _id
            { $pull: { "semesters.$.grades": { type: type } } }, // item(s) to match from array you want to pull/remove
            { multi: true } // set this to true if you want to remove multiple elements.
        )
    }

    static getCourseStudents(courseCode, semester_time) {
        return User.find({ 'courses.Id': { $in: [courseCode] }, 'courses.semester_time': { $in: [semester_time] }, role: 'student' }, { _id: 1, name: 1, email: 1 });

    }

    static getCourseGrades(courseCode, gradeType) {
        return Grade.find({ courseId: courseCode, gradeType: gradeType });
    }
    static updateStudentGrade(studentId, courseId, semester_time, gradeType, score) {
        return Grade.updateOne(
            { studentId, courseId, semester_time, gradeType },
            { $set: { score: score } },
            { multi: true }
        )
    }

    static async updateCourseStatus(courseCode, status) {
        let closesemesters = await Course.findOne({ courseCode }, { semesters: { $elemMatch: { semester_status: 'open' } } })
            .updateOne(
                { 'semesters.semester_status': "open" }, // your query, usually match by _id
                { $set: { 'semesters.$.semester_status': "finished" } }, // item(s) to match from array you want to pull/remove
                { multi: false } // set this to true if you want to remove multiple elements.
            );
        return Course.updateOne(
            { courseCode },
            { $set: { status: status } },
            { multi: false }
        )


    }

}
module.exports = adminService;