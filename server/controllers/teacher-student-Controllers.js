const User = require('../models/user');
const Course = require('../models/course');
const Grade = require('../models/grade');
const Attendance = require('../models/attendance');

const teacherService = require('../service/teacher-student');

// ----------------------My Courses-----------------------
exports.myCourses = async (req, res, next) => {
    let id = req.params.id;
    try {
        let usercourses = [];

        usercourses = await User.findOne({ _id: id }, { 'courses.Id': 1, _id: 0 })
        let data = usercourses.courses;
        if (data) {
            let courseInfo = [];
            for (let i = 0; i < data.length; i++) {
                courseInfo[i] = await teacherService.getCourseData(data[i].Id)
            }
            res.json(courseInfo)

        }
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Adding");
    }
}

// -------------------Add Task--------------------------
exports.addTask = async (req, res, next) => {
    let taskType = req.body.type;
    let taskPath = req.body.path;
    let courseId = req.params.id;
    try {
        let checkCourseId = await Course.findOne({
            courseCode: courseId
        });
        let checkfortask = await teacherService.searchfortask(courseId, taskType)
        if (!checkCourseId) {
            return res.status(400).json({
                msg: "course Not Found"
            });
        }
        else if (checkfortask) {
            return res.status(400).json({
                msg: "this name of task was added before"
            });
        }
        else {
            teacherService.addTask(courseId, taskType, taskPath).then((courseId) => {
                if (courseId) {
                    res.json({ msg: 'Task Added Successfuly' });
                }
            }).catch(err => {
                console.log(err);
                res.status(500).json({ msg: 'Internal Server Error' });
            })
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Adding");
    }
}

// -------------------Delete Task--------------------------
exports.deleteTask = async (req, res, next) => {
    let code = req.params.id;
    let taskname = req.params.taskname;
    try {
        let checkforcourse = await Course.findOne({
            courseCode: code
        });
        if (!checkforcourse) {
            return res.status(400).json({
                msg: "Course Not Found"
            });
        }
        else {
            teacherService.deleteTask(code, taskname).then((task) => {
                if (task) {
                    res.status(201).json({ msg: 'Task Deleted Successfuly' });
                }
            }).catch(err => {
                console.log(err);
                res.status(500).json({ msg: "Internal Server Error" });
            });
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Deleting");
    }
}

// -------------------View Tasks--------------------------
exports.getTasks = async (req, res, next) => {
    let courseCode = req.body.courseCode;
    teacherService.viewTasks(courseCode).then((data) => {
        if (data) {
            res.json(data);
        }
        else {
            res.status(404).json({ msg: 'No Tasks Yet' });
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json({ msg: 'Internal Server Error' });
    })
}



// -------------------Add Lecture--------------------------
exports.addLecture = async (req, res, next) => {
    const { lectureNumber, lectureLocation, beacon_id } = req.body
    let courseCode = req.params.id;
    try {
        let checkCourseId = await Course.findOne({
            courseCode
        });
        let checklectureNumber = await Course.findOne({
            courseCode, 'lectures.lectureNumber': lectureNumber
        });
        if (!checkCourseId) {
            return res.status(400).json({
                msg: "course Not Found"
            });
        }
        else if (checklectureNumber) {
            return res.status(400).json({
                msg: "This Number Of Lecture Was Added Before"
            });
        }
        else {
            teacherService.addLecture(courseCode, lectureNumber, lectureLocation, beacon_id).then((lecture) => {
                if (lecture) {
                    res.json({ msg: 'Lecture Added Successfuly' });
                }
            }).catch(err => {
                console.log(err);
                res.status(500).json({ msg: 'Internal Server Error' });
            })
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Adding");
    }
}


// -------------------Add Attendance--------------------------
exports.addAttendance = async (req, res, next) => {
    const { lectureNumber, beacon_id } = req.body
    let courseId = req.params.id;
    try {
        let Students = await teacherService.getCourseStudents(courseId);

        let checkCourseId = await Course.findOne({
            courseCode: courseId
        });
        let checkAttendance = await Attendance.findOne({
            courseId, lectureNumber
        });
        let checklectureNumber = await Course.findOne({
            courseCode: courseId, 'lectures.lectureNumber': lectureNumber
        });
        let checkbeacon_id = await Course.findOne({
            courseCode: courseId, 'lectures.lectureNumber': lectureNumber, 'lectures.beacon_id': beacon_id
        });
        if (!checkCourseId) {
            return res.status(400).json({
                msg: "course Not Found"
            });
        }
        if (checkAttendance) {
            return res.status(400).json({
                msg: "This Lecture Attendance Was Added Before"
            });
        }
        else if (!checklectureNumber) {
            return res.status(400).json({
                msg: "No Lecture With This Number"
            });
        }
        else if (!checkbeacon_id) {
            return res.status(400).json({
                msg: "The Beacon ID Is Wrong"
            });
        }
        else {
            for (var i = 0; i < Students.length; i++) {
                let stu = Students[i];
                teacherService.addAttendance(stu._id, courseId, lectureNumber, beacon_id);
            }
            res.status(200).json({
                msg: "Lecture Attendance Added Successfuly"
            });
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Adding");
    }
}

// -------------------get Student Total Attendance Attendance--------------------------
exports.studentTotalAttendance = async (req, res, next) => {
    let courseId = req.params.courseCode
    let studentId = req.params.id;
    try {
        let numberofattendance = await Attendance.find({ courseId, studentId, status: 'true' });
        if (numberofattendance) {
            total = { totalattendance: numberofattendance.length }
            res.json(total);
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Viewing");
    }

}

// -------------------View Attendance--------------------------
exports.viewAttendance = async (req, res, next) => {
    let courseId = req.params.courseCode;
    let lectureNumber = req.params.lectureNumber;
    let studentId = req.params.id;
    try {
        teacherService.viewAttendance2(studentId, courseId, lectureNumber).then((attendance) => {
            if (attendance) {
                res.json(attendance);
            }
        }).catch(err => {
            console.log(err);
            res.status(500).json({ msg: 'Internal Server Error' });
        })
    }
    catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Viewing");
    }

}





// ------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------Student--------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------

exports.myGrades = async (req, res, next) => {
    let id = req.params.id;
    let courseId = req.params.courseCode;
    let gradeType = req.params.gradeType;
    teacherService.MyGrades(id, courseId, gradeType).then((Grades) => {
        if (Grades) {
            res.json(Grades);
        }
        else {
            res.status(404).json({ msg: 'Your Courses Not Found' });
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json({ msg: 'Internal Server Error' });
    })
}


exports.attendme = async (req, res, next) => {
    let studentId = req.params.id
    let courseId = req.params.courseCode;
    let lectureNumber = req.body.lectureNumber;
    let beacon_id = req.body.beacon_id;
    try {
        let checkbeacon_id = await Attendance.findOne({
            studentId, courseId, lectureNumber, beacon_id
        });
        if (!checkbeacon_id) {
            return res.status(400).json({
                msg: "Lecture Number Or Beacon ID Is Wrong"
            });
        }
        else {
            teacherService.attendme(studentId, courseId, lectureNumber, beacon_id).then((data) => {
                if (data) {
                    res.json({ msg: 'You Attended successfuly' });
                }
                else {
                    res.status(500).json({ msg: "something wrong in your data" });
                }
            });
        }

    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Viewing");
    }
}


exports.viewMyAttendance = async (req, res, next) => {
    let id = req.params.id;
    let courseId = req.params.courseCode;
    try {
        teacherService.viewMyAttendance(id, courseId).then((sheet) => {
            if (sheet) {
                res.json(sheet);
            }
        }).catch(err => {
            console.log(err);
            res.status(500).json({ msg: 'Internal Server Error' });
        });
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Viewing");
    }

}