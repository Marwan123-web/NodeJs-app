const User = require('../models/user');
const Course = require('../models/course');
const Grade = require('../models/grade');

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
        if (!checkCourseId) {
            return res.status(400).json({
                msg: "course Not Found"
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
        if (!checkCourseId) {
            return res.status(400).json({
                msg: "course Not Found"
            });
        }
        else {

            for (var i = 0; i < Students.length; i++) {
                let stu = Students[i];
                teacherService.addAttendance(stu._id, courseId, lectureNumber, beacon_id);
            }
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Adding");
    }
}

// -------------------View Attendance--------------------------
exports.viewAttendance = async (req, res, next) => {
    let courseId = req.body.courseId
    try {
        teacherService.viewAttendance(courseId).then((sheet) => {
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








// ------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------Student--------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------

exports.myGrades = async (req, res, next) => {
    let id = req.params.id;
    let courseId = req.params.courseCode;
    let gradeType=req.params.gradeType;
    teacherService.MyGrades(id, courseId,gradeType).then((Grades) => {
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
    let id = req.params.id
    let courseId = req.params.courseCode;
    let lectureNumber = req.body.lectureNumber;
    let beacon_Id = req.body.beacon_id;
    try {
        teacherService.attendme(id, courseId, lectureNumber, beacon_Id).then((data) => {
            if (data) {
                res.json({ msg: 'You Attended successfuly' });
            }
            else {
                res.status(500).json({ msg: "something wrong in your data" });
            }
        });
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