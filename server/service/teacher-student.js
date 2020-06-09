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
        return Course.findOne({ courseCode: courseId }).updateOne(
            { courseCode: courseId }, // your query, usually match by _id
            { $push: { tasks: task } }, // item(s) to match from array you want to pull/remove
            { multi: true } // set this to true if you want to remove multiple elements.
        )
    }

    static deleteTask(courseId, taskname) {
        return Course.findOne({ courseCode: courseId }).updateOne(
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
        return Course.findOne({ courseCode }).updateOne(
            { courseCode }, // your query, usually match by _id
            { $push: { lectures: lecture } }, // item(s) to match from array you want to pull/remove
            { multi: true } // set this to true if you want to remove multiple elements.
        )
    }

    static getCourseStudents(courseCode) {
        return User.find({ 'courses.Id': { $in: [courseCode] }, role: 'student' }, { _id: 1 });

    }
    static addAttendance(studentId, courseId, lectureNumber, beacon_id) {
        const newAttendance = new Attendance({ studentId, courseId, lectureNumber, beacon_id });
        return newAttendance.save();
    }

    // static viewAttendance(studentId, courseId) {
    //     return Attendance.find({ studentId, courseId });
    // }
    static async viewAttendance(studentId, courseId, lectureNumber) {
        let fakedata = { "_id": "5eba5bb7900576e5c44f34b2", "studentId": studentId, "courseId": courseId, "lectureNumber": lectureNumber, "status": "no attendance", "__v": 0 }

        let checkforattendance = await Attendance.findOne({ studentId, courseId, lectureNumber });
        if (checkforattendance) {
            return checkforattendance;
        }
        else if (checkforattendance == null) {
            return fakedata;
        }
    }
    static async viewGrades(studentId, courseId, gradeType) {
        let fakedata = { "_id": "5eba5bb7900576e5c44f34b2", "studentId": studentId, "courseId": courseId, "gradeType": gradeType, "score": "no grade", "__v": 0 }
        let checkforgarde = await Grade.findOne({ studentId, courseId, gradeType });
        if (checkforgarde) {
            return checkforgarde;
        }
        else if (checkforgarde == null) {
            return fakedata;
        }
    }

    // ------------------------------------------------------Student---Service--------------------------------

    static async MyGrades(studentId, courseId, gradeType) {
        let fakedata = { "_id": "5eba5bb7900576e5c44f34b2", "studentId": studentId, "courseId": courseId, "gradeType": gradeType, "score": "no grade", "__v": 0 }
        let checkforgarde = await Grade.findOne({ studentId, courseId, gradeType });
        if (checkforgarde) {
            return checkforgarde;
        }
        else if (checkforgarde == null) {
            return fakedata;
        }
    }

    static attendme(studentId, courseId, lectureNumber, beacon_id) {
        return Attendance.findOne({ studentId, courseId, lectureNumber, beacon_id }).updateOne(
            {},
            { $set: { status: true } },
            { multi: true }
        )
    }
    static viewMyAttendance(id, courseId) {
        return Attendance.find({ studentId: id, courseId });
    }


    // static getlectureattendancetrue(courseId, lectureNumber) {
    //     return Attendance.find({ courseId, lectureNumber, status: "true" })
    // }




}
module.exports = teacherService;