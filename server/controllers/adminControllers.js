const User = require('../models/user');
const Course = require('../models/course');
const Grade = require('../models/grade');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { roles } = require('../roles');
const adminService = require('../service/admin');
async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

async function validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
}
// ---------------------ADD User----------------------
exports.addUser = async (req, res, next) => {
    try {
        const { _id, name, email, password, role } = req.body
        const hashedPassword = await hashPassword(password);
        const checkId = await User.findOne({ _id });
        const checkEmail = await User.findOne({ email });
        if (checkId) {
            res.json({ msg: 'This ID Has Been Used Before' })
        }
        else if (checkEmail) {
            res.json({ msg: 'This Email Has Been Used Before' })
        }
        else {
            const newUser = new User({ _id, name, email, password: hashedPassword, role });
            const accessToken = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
                expiresIn: "1d"
            });
            newUser.accessToken = accessToken;
            await newUser.save();
            res.json({
                msg: 'User Added Successfuly',
                data: newUser,

            })
        }
    } catch (error) {
        next(error)
    }
}

// ---------------------Login----------------------
exports.login = async (req, res, next) => {
    try {
        const { _id, password } = req.body;
        const user = await User.findOne({ _id });
        if (!user) return next(new Error('User does not exist'));
        const validPassword = await validatePassword(password, user.password);
        if (!validPassword) return next(new Error('Password is not correct'))
        const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1d"
        });
        await User.findByIdAndUpdate(user._id, { accessToken }, { useFindAndModify: false })
        res.status(200).json({
            _id: user._id,
            email: user.email, role: user.role,
            accessToken
        })
    } catch (error) {
        next(error);
    }
}

// ---------------------Profile----------------------
exports.profile = async (req, res, next) => {
    let id = req.params.id;
    adminService.getUserData(id).then((data) => {
        if (data) {
            res.json(data);
        }
        else {
            res.status(404).json({ msg: 'Your Data Not Found' });
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json({ msg: 'Internal Server Error' });
    })
}

// --------------------All Users----------------------
exports.getAllUsers = async (req, res, next) => {
    // let role = req.body.role;
    adminService.getAllUsers().then((users) => {
        if (users) {
            res.json(users);
        }
        else {
            res.status(404).json({ msg: 'No Users Yet' });
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json({ msg: 'Internal Server Error' });
    })
}
exports.getUserByRole = async (req, res, next) => {
    let role = req.params.role;
    adminService.getUserByRole(role).then((users) => {
        if (users) {
            res.json(users);
        }
        else {
            res.status(404).json({ msg: 'No Users Yet' });
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json({ msg: 'Internal Server Error' });
    })
}

// --------------------get User By Id/Name ----------------------
exports.getUser = async (req, res, next) => {
    let id = req.body._id;
    let name = req.body.name;
    let role = req.body.role;
    if (id) {
        adminService.getUserById(id, role).then((user) => {
            if (user) {
                res.json(user);
            }
            else {
                res.status(404).json({ msg: 'User Not Found' });
            }
        }).catch(err => {
            console.log(err);
            res.status(500).json({ msg: 'Internal Server Error' });
        })
    }
    else {
        adminService.getUserByName(name, role).then((user) => {
            if (user) {
                res.json(user);
            }
            else {
                res.status(404).json({ msg: 'User Not Found' });
            }
        }).catch(err => {
            console.log(err);
            res.status(500).json({ msg: 'Internal Server Error' });
        })
    }
}


// --------------------get User By Id/Name ----------------------
exports.getUserProfile = async (req, res, next) => {
    let id = req.params.id;
    adminService.getUserById(id).then((user) => {
        if (user) {
            res.json(user);
        }
        else {
            res.status(404).json({ msg: 'User Not Found' });
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json({ msg: 'Internal Server Error' });
    })
}

// --------------------update User by ID----------------------
exports.updateUser = async (req, res, next) => {
    let id = req.body._id;
    // let role = req.body.role;
    try {
        let checkforUser = await User.findOne({
            _id: id
        });
        if (!checkforUser) {
            return res.status(400).json({
                msg: "User Not Found"
            });
        }
        else {
            User.findOneAndUpdate({ _id: id },
                req.body,
                { useFindAndModify: false },
                (err) => {
                    if (err) {
                        res.status(404).json({ msg: "Can't Update this User Information" });
                    }
                    res.status(201).json({ msg: "User's Information Updated Successfuly" });
                });
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Saving");
    }
}

// --------------------Delete User by ID----------------------
exports.deleteUser = async (req, res, next) => {
    let id = req.params.id;
    // let role = req.body.role;
    try {
        let checkforUser = await User.findOne({
            _id: id
        });
        if (!checkforUser) {
            return res.status(400).json({
                msg: "User Not Found"
            });
        }
        else {
            adminService.deleteUser(id).then((user) => {
                if (user) {
                    res.status(201).json({ msg: 'User Deleted Successfuly' });
                }
            }).catch(err => {
                console.log(err);
                res.status(500).json({ msg: "Internal Server Error" });
            });
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Saving");
    }
}

// --------------------Get User Courses----------------------
// exports.getUserCourses = async (req, res, next) => {
//     let id = req.params.id;
//     try {
//         let checkforUser = await User.findOne({
//             _id: id
//         });
//         if (!checkforUser) {
//             return res.status(400).json({
//                 msg: "User Not Found"
//             });
//         }
//         else {
//             adminService.getUserCourses(id).then((courses) => {
//                 if (courses) {
//                     res.json(courses);
//                 }
//                 else {
//                     res.status(500).json({ msg: "No Courses For This User" });
//                 }
//             }).catch(err => {
//                 console.log(err);
//                 res.status(500).json({ msg: "Internal Server Error" });
//             });
//         }

//     } catch (err) {
//         console.log(err.message);
//         res.status(500).send("Error in Saving");
//     }
// }
exports.UserCourses = async (req, res, next) => {
    let id = req.params.id;
    try {
        let usercourses = [];
        usercourses = await User.findOne({ _id: id }, { 'courses.Id': 1, _id: 0 })
        let data = usercourses.courses;
        if (data) {
            let courseInfo = [];
            for (let i = 0; i < data.length; i++) {
                courseInfo[i] = await adminService.getCourseByCode(data[i].Id)
            }
            res.json(courseInfo)

        }
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Adding");
    }
}

// --------------------ADD User Course----------------------
exports.addUserCourse = async (req, res, next) => {
    let courseCode = req.body.courseCode;
    let id = req.params.id;
    try {
        let checkforUser = await User.findOne({
            _id: id
        });
        let checkforcourse = await User.findOne({
            _id: id, 'courses.Id': courseCode
        });
        if (!checkforUser) {
            return res.status(400).json({
                msg: "User Not Found"
            });
        }
        else if (checkforcourse) {
            return res.status(400).json({
                msg: "This User Had Register This Course Before"
            });
        }
        else {

            adminService.addUserCourse(id, courseCode).then((course) => {
                if (course) {
                    res.json({ msg: 'course is added successfuly' });
                }
                else {
                    res.status(500).json({ msg: "Can't Add This Course For This User" });
                }
            });
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Saving");
    }
}

// --------------------Delete User Course----------------------
exports.deleteUserCourse = async (req, res, next) => {
    let courseCode = req.params.courseCode;
    let id = req.params.id;
    try {
        let checkforUser = await User.findOne({
            _id: id
        });
        let checkforcourse = await User.findOne({
            _id: id, courses: courseCode
        });
        if (!checkforUser) {
            return res.status(400).json({
                msg: "User Not Found"
            });
        }
        else if (!checkforcourse) {
            return res.status(400).json({
                msg: "This User Dont Register This Course"
            });
        } else {
            adminService.deleteUserCourse(id, courseCode).then((course) => {
                if (course) {
                    res.status(201).json({ msg: 'Course Deleted Successfuly from this User' });
                }
            }).catch(err => {
                console.log(err);
                res.status(500).json({ msg: "Internal Server Error" });
            });

        }
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Saving");
    }
}
// ---------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------


// --------------------Add Course----------------------
exports.addCourse = async (req, res, next) => {
    try {
        const { courseCode, courseName, courseDepartment, creaditHours } = req.body
        const checkCourseId = await Course.findOne({ courseCode });
        const checkCourseName = await Course.findOne({ courseName });
        if (checkCourseId) {
            res.json({ msg: 'This Course ID Has Been Used Before' })
        }
        else if (checkCourseName) {
            res.json({ msg: 'This Course Name Has Been Used Before' })
        }
        else {
            const newCourse = new Course({ courseCode, courseName, courseDepartment, creaditHours });
            await newCourse.save();
            res.json({
                msg: 'Course Added Successfuly',
                data: newCourse,

            })
        }
    } catch (error) {
        next(error)
    }
}

// --------------------Update Course----------------
exports.updateCourse = async (req, res, next) => {
    let code = req.body.courseCode;
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
            Course.findOneAndUpdate({ courseCode: code },
                req.body,
                { useFindAndModify: false },
                (err) => {
                    if (err) {
                        res.status(404).json({ msg: "Can't Update this Course Information" });
                    }
                    res.status(201).json({ msg: "Course's Information Updated Successfuly" });
                });
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in updating");
    }
}

// --------------------Delete Course----------------
exports.deleteCourse = async (req, res, next) => {
    let code = req.params.courseCode;
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
            adminService.deleteCourse(code).then((course) => {
                if (course) {
                    res.status(201).json({ msg: 'Course Deleted Successfuly' });
                }
            }).catch(err => {
                console.log(err);
                res.status(500).json({ msg: "Internal Server Error" });
            });
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Saving");
    }
}


// --------------------Get Courses---------------------
exports.getAllCourses = async (req, res, next) => {
    adminService.getAllCourses().then((courses) => {
        if (courses) {
            res.json(courses);
        }
        else {
            res.status(404).json({ msg: 'No Courses Yet' });
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json({ msg: 'Internal Server Error' });
    })
}

// --------------------Get Department Courses---------------------
exports.getDepartmentCourses = async (req, res, next) => {
    let department = req.params.courseDepartment;
    adminService.getDepartmentCourses(department).then((courses) => {
        if (courses) {
            res.json(courses);
        }
        else {
            res.status(404).json({ msg: 'No Courses Yet' });
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json({ msg: 'Internal Server Error' });
    })
}

// --------------------Get Course By Id/Name---------------------
// exports.getCourse = async (req, res, next) => {
//     let code = req.body.courseCode;
//     let name = req.body.courseName;
//     try {
//         if (code) {
//             adminService.getCourseByCode(code).then((user) => {
//                 if (user) {
//                     res.json(user);
//                 }
//                 else {
//                     res.status(404).json({ msg: 'Course Not Found' });
//                 }
//             }).catch(err => {
//                 console.log(err);
//                 res.status(500).json({ msg: 'Internal Server Error' });
//             })
//         }
//         else {
//             adminService.getCourseByName(name).then((user) => {
//                 if (user) {
//                     res.json(user);
//                 }
//                 else {
//                     res.status(404).json({ msg: 'Course Not Found' });
//                 }
//             }).catch(err => {
//                 console.log(err);
//                 res.status(500).json({ msg: 'Internal Server Error' });
//             })
//         }
//     } catch (err) {
//         console.log(err.message);
//         res.status(500).send("Error in Saving");
//     }
// }
// --------------------Get Course Data---------------------
exports.getCourseData = async (req, res, next) => {
    let code = req.params.courseCode;
    try {
        adminService.getCourseByCode(code).then((user) => {
            if (user) {
                res.json(user);
            }
            else {
                res.status(404).json({ msg: 'Course Not Found' });
            }
        }).catch(err => {
            console.log(err);
            res.status(500).json({ msg: 'Internal Server Error' });
        })


    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Saving");
    }
}

// --------------------Add Course Grades----------------------
exports.addCourseGrade = async (req, res, next) => {
    let courseCode = req.params.courseCode;
    let type = req.body.type;
    let grade = req.body.grade;
    console.log(type);
    console.log(grade);
    try {
        let checkforcourse = await Course.findOne({ courseCode });
        if (!checkforcourse) {
            return res.status(400).json({
                msg: "Course Not Found"
            });
        }
        else {
            adminService.addCourseGrades(courseCode, type, grade).then((garde) => {
                if (garde) {
                    res.json(garde);
                }
                else {
                    res.status(500).json({ msg: "Can't Add This Grade For This Course" });
                }
            });
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Saving");
    }
}

// --------------------Delete Course Grade----------------------
exports.deleteCourseGrade = async (req, res, next) => {
    let courseCode = req.params.courseCode;
    let type = req.params.type;
    try {
        let checkforcourse = await Course.findOne({ courseCode });
        if (!checkforcourse) {
            return res.status(400).json({
                msg: "Course Not Found"
            });
        }
        else {
            adminService.deleteCourseGrade(courseCode, type).then((garde) => {
                if (garde) {
                    res.json(garde);
                }
                else {
                    res.status(500).json({ msg: "Can't Delete This Grade Form This Course" });
                }
            });
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Saving");
    }

}


// --------------------Get Users In Course----------------------
exports.getCourseStudents = async (req, res, next) => {
    let code = req.params.courseCode;
    try {
        adminService.getCourseStudents(code).then((users) => {
            if (users) {
                res.json(users);
            }
        }).catch(err => {
            console.log(err);
            res.status(500).json({ msg: "Internal Server Error" });
        });
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Saving");
    }
}

// --------------------Add Grade----------------------
exports.addGrade = async (req, res, next) => {
    const { studentId, gradeType, score } = req.body
    let courseId = req.params.courseCode;
    try {
        let checkForStudent = await User.findOne({ _id: studentId });
        let checkStudentId = await Grade.findOne({
            studentId
        });
        let checkCourseId = await Grade.findOne({
            courseId
        });
        let checkGradeType = await Grade.findOne({
            gradeType
        });
        if (!checkForStudent) {
            return res.status(400).json({
                msg: "Student Not Found"
            });
        }
        else if (checkStudentId && checkCourseId && checkGradeType) {
            return res.status(400).json({
                msg: "Grade Already Exists"
            });
        }
        else {
            const newGrade = new Grade({ studentId, courseId, gradeType, score });
            await newGrade.save();
            res.json({
                msg: 'Grade Added Successfuly',
                data: newGrade
            })
        }

    } catch (error) {
        next(error)
    }
}

// --------------------Update Grade----------------------
exports.updateGrade = async (req, res, next) => {
    const { studentId, courseId, gradeType, score } = req.body

    try {
        let checkStudentId = await Grade.find({
            studentId
        });
        let checkCourseId = await Grade.find({
            courseId
        });
        let checkGradeType = await Grade.find({
            gradeType, studentId, courseId
        });

        if (!checkCourseId || !checkStudentId || !checkGradeType) {
            return res.status(400).json({
                msg: "This Grade Not Found"
            });
        }
        else {

            adminService.updateStudentGrade(studentId, courseId, gradeType, score).then((grade) => {
                if (grade) {
                    console.log(grade)
                    res.status(201).json({ msg: "Student's Grade Updated Successfuly" });
                }
                else {
                    res.status(404).json({ msg: "Can't Update this Student's Grade Information" });
                }
            }).catch(err => {
                console.log(err);
                res.status(500).json({ msg: 'Internal Server Error' });
            })
            // Grade.findOneAndUpdate({ studentId: studentId, courseId: courseId, gradeType: gradeType },
            //     { $set: { score: score } },
            //     { useFindAndModify: false },
            //     (err) => {
            //         if (err) {
            //             console.log(err)
            //             res.status(404).json({ msg: "Can't Update this Student's Grade Information" });
            //         }
            //         console.log('done')
            //         res.status(201).json({ msg: "Student's Grade Updated Successfuly" });
            //     });
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in updating");
    }

}

// -------------------Get Students Grades----------------------
exports.getStudentsGrades = async (req, res, next) => {
    let code = req.params.courseCode;
    let gradeType = req.params.gradeType;
    try {
        let checkforcourse = await Grade.findOne({
            courseId: code
        });
        if (!checkforcourse) {
            return res.status(400).json({
                msg: "Course Not Found"
            });
        }
        else {
            adminService.getCourseGrades(code, gradeType).then((grades) => {
                if (grades) {
                    res.json(grades);
                }
                else {
                    res.status(404).json({ msg: 'No Grades For This Course Yet' });
                }
            }).catch(err => {
                console.log(err);
                res.status(500).json({ msg: 'Internal Server Error' });
            })
        }

    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Saving");
    }
}


// -------------------Get Students Grades----------------------
exports.getCourseGradeType = async (req, res, next) => {
    let code = req.params.courseCode;
    let gradeType = req.params.gradeType;
    try {
        let checkforcourse = await Grade.findOne({
            courseId: code
        });
        if (!checkforcourse) {
            return res.status(400).json({
                msg: "Course Not Found"
            });
        }
        else {
            adminService.getCourseGradeType(code, gradeType).then((grades) => {
                if (grades) {
                    // data=grades.type==gradeType;
                    res.json(grades);
                }
                else {
                    res.status(404).json({ msg: 'No Grades For This Course Yet' });
                }
            }).catch(err => {
                console.log(err);
                res.status(500).json({ msg: 'Internal Server Error' });
            })
        }

    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Saving");
    }
}

// ---------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------
exports.grantAccess = function (action, resource) {
    return async (req, res, next) => {
        try {
            const permission = roles.can(req.user.role)[action](resource);
            if (!permission.granted) {
                return res.status(401).json({
                    error: "You don't have enough permission to perform this action"
                });
            }
            next()
        } catch (error) {
            next(error)
        }
    }
}

exports.allowIfLoggedin = async (req, res, next) => {
    try {
        const user = res.locals.loggedInUser;
        if (!user)
            return res.status(401).json({
                error: "You need to be logged in to access this route"
            });
        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
}