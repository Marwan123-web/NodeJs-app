const User = require('../models/user');
const Course = require('../models/course');
const Grade = require('../models/grade');
const Attendance = require('../models/attendance');


class teacherService {

    static getMyCourses(id) {
        let usercourses = [];
        usercourses = User.findOne({ _id: id, }, { 'courses.Id': 1, _id: 0 });
        return usercourses

    }
    static getCourseData(code) {
        return Course.findOne({ courseCode: code })
    }

    // ---
    static searchfortask(courseId, taskname) {
        return Course.findOne({ courseCode: courseId, 'tasks.type': { $in: taskname } })
    }

    static addTask(courseId, taskType, taskPath) {
        var task = { type: taskType, path: taskPath };
        return Course.findOne({ courseCode: courseId }).update(
            { courseCode: courseId }, // your query, usually match by _id
            { $push: { tasks: task } }, // item(s) to match from array you want to pull/remove
            { multi: true } // set this to true if you want to remove multiple elements.
        )
    }

    static deleteTask(courseId, taskname) {
        return Course.findOne({ courseCode: courseId }).update(
            { courseCode: courseId }, // your query, usually match by _id
            { $pull: { tasks: { type: taskname } } }, // item(s) to match from array you want to pull/remove
            { multi: true } // set this to true if you want to remove multiple elements.
        )

    }

    static viewTasks(courseId) {
        return Course.findOne({ courseCode: courseId }, { 'tasks': 1, _id: 0 })
    }


    static addLecture(courseCode, lectureNumber, lectureLocation, beacon_id) {
        var lecture = { lectureNumber, lectureLocation, beacon_id };
        return Course.findOne({ courseCode }).update(
            { courseCode }, // your query, usually match by _id
            { $push: { lectures: lecture } }, // item(s) to match from array you want to pull/remove
            { multi: true } // set this to true if you want to remove multiple elements.
        )
    }

    static getCourseStudents(courseCode) {
        return User.find({ courses: { $in: [courseCode] }, role: 'student' }, { _id: 1 });

    }
    static addAttendance(studentId, courseId, lectureNumber, beacon_id) {
        let newAttendance = new Attendance(studentId, courseId, lectureNumber, beacon_id);
        return newAttendance.save();
    }

    static viewAttendance(courseId) {
        return Attendance.find({ courseId });
    }




    // ------------------------------------------------------Student---Service--------------------------------

    static MyGrades(id, courseId) {
        return Grade.find({ studentId: id, courseId: courseId });
    }

    static attendme(id, courseId, lectureNumber, beacon_Id) {
        Attendance.findOne({ studentId: id, courseId, lectureNumber, beacon_Id }).update(
            {},
            { $set: { status: true } }
        )
    }
    static viewMyAttendance(id, courseId) {
        return Attendance.find({ studentId: id, courseId });
    }







}
module.exports = teacherService;