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
        let userdata = await User.findOne({ _id: studentId }, { password: 0, accessToken: 0 });
        if (numberofattendance) {
            total = { totalattendance: numberofattendance.length };
            res.json({ user: userdata, totalattendance: total });
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
        teacherService.viewAttendance(studentId, courseId, lectureNumber).then((attendance) => {
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

exports.viewGrades = async (req, res, next) => {
    let courseId = req.params.courseCode;
    let gradeType = req.params.gradeType;
    let studentId = req.params.id;
    try {
        teacherService.viewGrades(studentId, courseId, gradeType).then((grade) => {
            if (grade) {
                res.json(grade);
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
exports.studentTotalGrades = async (req, res, next) => {
    let courseId = req.params.courseCode
    let studentId = req.params.id;
    try {
        let totalGrades = await Grade.find({ courseId, studentId });
        let userdata = await User.findOne({ _id: studentId }, { password: 0, accessToken: 0 });
        if (totalGrades) {
            let totalg = 0;
            for (let i = 0; i < totalGrades.length; i++) {
                totalg = totalg + totalGrades[i].score;
            }
            total = { totalGrades: totalg };
            res.json({ user: userdata, totalGrades: total });
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Viewing");
    }

}
exports.totalCourseGrades = async (req, res, next) => {
    let courseCode = req.params.courseCode;
    try {
        let totalGrades = await Course.findOne({ courseCode });
        if (totalGrades) {
            let totalg = 0;
            for (let i = 0; i < totalGrades.grades.length; i++) {
                totalg = totalg + totalGrades.grades[i].grade;
            }
            total = { totalGrades: totalg };
            res.json(total);
        }
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


exports.viewAttendanceReport = async (req, res, next) => {
    let courseId = req.params.courseCode;
    try {
        let getCourseLectures = await Course.findOne({ courseCode: courseId }, { "lectures.lectureNumber": 1, _id: 0 });
        if (getCourseLectures) {

            let courselectures = getCourseLectures.lectures;
            let arrayoflectures = [];
            for (let i = 0; i < courselectures.length; i++) {
                arrayoflectures[i] = courselectures[i].lectureNumber;
            }
            let arrayofattendance = [];
            for (let y = 0; y < arrayoflectures.length; y++) {
                arrayofattendance[y] = await Attendance.find({ courseId, lectureNumber: arrayoflectures[y] });
            }
            let arrayoftrueattendance = [];
            for (let y = 0; y < arrayoflectures.length; y++) {
                arrayoftrueattendance[y] = await Attendance.find({ courseId, lectureNumber: arrayoflectures[y], status: true });
            }
            let arrayoffalseattendance = [];
            for (let y = 0; y < arrayoflectures.length; y++) {
                arrayoffalseattendance[y] = await Attendance.find({ courseId, lectureNumber: arrayoflectures[y], status: false });
            }

            let arrayofreport = [];

            for (let z = 0; z < arrayoflectures.length; z++) {
                let lectureNumber = arrayoflectures[z];

                let attendance = arrayofattendance[z];
                let numberOfAttendance = attendance.length;

                let trueAttendance = arrayoftrueattendance[z];
                let numberOfTrueAttendance = trueAttendance.length;

                let FalseAttendance = arrayoffalseattendance[z];
                let numberOfFalseAttendance = FalseAttendance.length;

                arrayofreport[z] = { lectureNumber, numberOfAttendance, numberOfTrueAttendance, numberOfFalseAttendance }
            }

            return res.status(200).json(
                arrayofreport
            );
        }

        // teacherService.viewAttendanceReport(studentId, courseId, lectureNumber).then((attendance) => {
        //     if (attendance) {
        //         res.json(attendance);
        //     }
        // }).catch(err => {
        //     console.log(err);
        //     res.status(500).json({ msg: 'Internal Server Error' });
        // })
    }
    catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Viewing");
    }

}



exports.GradesReport = async (req, res, next) => {
    let courseId = req.params.courseCode;

    try {
        let getCourseGrades = await Course.findOne({ courseCode: courseId }, { "grades.type": 1, "grades.grade": 1, _id: 0 });
        if (getCourseGrades) {

            let courseGrades = getCourseGrades.grades;
            let arrayofGrades = [];
            for (let i = 0; i < courseGrades.length; i++) {
                arrayofGrades[i] = [courseGrades[i].type, courseGrades[i].grade];
            }
            let arrayofStudentsGades = [];
            for (let y = 0; y < arrayofGrades.length; y++) {
                arrayofStudentsGades[y] = await Grade.find({ courseId, gradeType: arrayofGrades[y][0] });
            }

            let arrayOfGradesUnder50Percent = [];
            for (let y = 0; y < arrayofGrades.length; y++) {
                let Percent_50 = (arrayofGrades[y][1] * 50) / 100;
                arrayOfGradesUnder50Percent[y] = await Grade.find({ courseId, gradeType: arrayofGrades[y][0], score: { $lt: Percent_50 } });
            }

            let arrayOfGradesUnder65Percent = [];
            for (let y = 0; y < arrayofGrades.length; y++) {
                let Percent_50 = (arrayofGrades[y][1] * 50) / 100;
                let Percent_65 = (arrayofGrades[y][1] * 65) / 100;
                arrayOfGradesUnder65Percent[y] = await Grade.find({ courseId, gradeType: arrayofGrades[y][0], score: { $lt: Percent_65, $gte: Percent_50 } });
            }

            let arrayOfGradesUnder75Percent = [];
            for (let y = 0; y < arrayofGrades.length; y++) {
                let Percent_65 = (arrayofGrades[y][1] * 65) / 100;
                let Percent_75 = (arrayofGrades[y][1] * 75) / 100;
                arrayOfGradesUnder75Percent[y] = await Grade.find({ courseId, gradeType: arrayofGrades[y][0], score: { $lt: Percent_75, $gte: Percent_65 } });
            }

            let arrayOfGradesUnder85Percent = [];
            for (let y = 0; y < arrayofGrades.length; y++) {
                let Percent_85 = (arrayofGrades[y][1] * 85) / 100;
                let Percent_75 = (arrayofGrades[y][1] * 75) / 100;
                arrayOfGradesUnder85Percent[y] = await Grade.find({ courseId, gradeType: arrayofGrades[y][0], score: { $lt: Percent_85, $gte: Percent_75 } });
            }

            let arrayOfGradesAbove85Percent = [];
            for (let y = 0; y < arrayofGrades.length; y++) {
                let Percent_85 = (arrayofGrades[y][1] * 85) / 100;
                arrayOfGradesAbove85Percent[y] = await Grade.find({ courseId, gradeType: arrayofGrades[y][0], score: { $gte: Percent_85 } });
            }

            let arrayofGradesreport = [];
            for (let z = 0; z < arrayofGrades.length; z++) {
                let GradeType = arrayofGrades[z][0];
                let GradeGrade = arrayofGrades[z][1];


                let Student = arrayofStudentsGades[z];
                let numberOfStudent = Student.length;

                let gradesUnder50 = arrayOfGradesUnder50Percent[z];
                let numberOfGradesUnder50 = gradesUnder50.length;

                let gradesUnder65 = arrayOfGradesUnder65Percent[z];
                let numberOfGradesUnder65 = gradesUnder65.length;

                let gradesUnder75 = arrayOfGradesUnder75Percent[z];
                let numberOfGradesUnder75 = gradesUnder75.length;

                let gradesUnder85 = arrayOfGradesUnder85Percent[z];
                let numberOfGradesUnder85 = gradesUnder85.length;

                let gradesAbove85 = arrayOfGradesAbove85Percent[z];
                let numberOfGradesAbove85 = gradesAbove85.length;

                arrayofGradesreport[z] = { GradeType, GradeGrade, numberOfStudent, numberOfGradesUnder50, numberOfGradesUnder65, numberOfGradesUnder75, numberOfGradesUnder85, numberOfGradesAbove85 };
            }

            return res.status(200).json(
                arrayofGradesreport
            );
        }
    }
    catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Viewing");
    }

}