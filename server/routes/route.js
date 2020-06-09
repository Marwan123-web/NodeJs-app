const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminControllers');
const TeacherStudentController = require('../controllers/teacher-student-Controllers');


router.post('/login', adminController.login); //mo4trk m3 admin w student w teacher

router.get('/profile/:id', adminController.profile); //mo4trk m3 admin w student w teacher

// ------------------------------------------------------------------------------------------------
// --------------------------------------Admin Only----------------------------------------------
// ------------------------------------------------------------------------------------------------

// ----------------POST Requests----------------

router.post('/add/user', adminController.addUser);

router.post('/add/user/course/:id', adminController.addUserCourse);

router.post('/add/course', adminController.addCourse);

router.post('/add/course/grade/:courseCode', adminController.addCourseGrade);

router.post('/add/student/grade/:courseCode', adminController.addGrade); //mo4trk m3 teacher



// ----------------GET Requests----------------
router.get('/users', adminController.getAllUsers);

router.get('/users/:role', adminController.getUserByRole);


// router.get('/user', adminController.getUser);

router.get('/user/:id/profile', adminController.getUserProfile);


router.get('/user/:id/courses', adminController.UserCourses);

router.get('/courses', adminController.getAllCourses);

router.get('/courses/:courseDepartment', adminController.getDepartmentCourses);


router.get('/course/:courseCode', adminController.getCourseData);//-------------------

router.get('/course/students/:courseCode', adminController.getCourseStudents); //mo4trk m3 teacher w student

router.get('/course/students/grades/:courseCode/:gradeType', adminController.getStudentsGrades); //mo4trk m3 teacher w student

router.get('/course/grades/:courseCode/:gradeType', adminController.getCourseGradeType);

// ----------------PUT Requests----------------

router.put('/update/user/:id', adminController.updateUser);

router.put('/update/course/:courseCode', adminController.updateCourse);

router.put('/update/student/grade/:id/:courseCode', adminController.updateGrade);


// ----------------DELETE Requests----------------

router.delete('/delete/user/:id', adminController.deleteUser);

router.delete('/delete/user/course/:id/:courseCode', adminController.deleteUserCourse);

router.delete('/delete/course/:courseCode', adminController.deleteCourse);

router.delete('/delete/course/grade/:courseCode/:type', adminController.deleteCourseGrade);


// ------------------------------------------------------------------------------------------------
// --------------------------------------Teacher Only----------------------------------------------
// ------------------------------------------------------------------------------------------------

// ----------------POST Requests----------------

router.post('/add/course/task/:id', TeacherStudentController.addTask);

router.post('/add/course/lecture/:id', TeacherStudentController.addLecture);

router.post('/add/course/attendance/:id', TeacherStudentController.addAttendance);


// ----------------GET Requests----------------
router.get('/my/courses/:id', TeacherStudentController.myCourses); //mo4trk m3 student

router.get('/course/tasks', TeacherStudentController.getTasks); //mo4trk m3 student

// router.get('/course/attendance/sheet/:courseCode', TeacherStudentController.viewAttendance);
router.get('/course/attendance/sheet/:id/:courseCode/:lectureNumber', TeacherStudentController.viewAttendance);

router.get('/course/student/total/attendance/:id/:courseCode', TeacherStudentController.studentTotalAttendance);


router.get('/course/grade/sheet/:id/:courseCode/:gradeType', TeacherStudentController.viewGrades);

router.get('/course/student/total/grade/:id/:courseCode', TeacherStudentController.studentTotalGrades);

router.get('/course/total/grades/:courseCode', TeacherStudentController.totalCourseGrades);


// ----------------DELETE Requests----------------

router.delete('/delete/course/task/:id/:taskname', TeacherStudentController.deleteTask);





// ------------------------------------------------------------------------------------------------
// --------------------------------------Student Only----------------------------------------------
// ------------------------------------------------------------------------------------------------


// ----------------POST Requests----------------

router.post('/course/attend/me/:id/:courseCode', TeacherStudentController.attendme);



// ----------------GET Requests----------------
router.get('/course/my/grades/:id/:courseCode/:gradeType', TeacherStudentController.myGrades);

router.get('/course/my/attendance/:id/:courseCode', TeacherStudentController.viewMyAttendance);



router.get('/course/attendance/report/:courseCode', TeacherStudentController.viewAttendanceReport);

router.get('/course/grades-report/:courseCode', TeacherStudentController.GradesReport);





































// router.post('/login', adminController.login);

// router.get('/user/:userId', adminController.allowIfLoggedin, adminController.getUser);

// router.get('/users', adminController.allowIfLoggedin, adminController.grantAccess('readAny', 'profile'), adminController.getUsers);

// router.put('/user/:userId', adminController.allowIfLoggedin, adminController.grantAccess('updateAny', 'profile'), adminController.updateUser);

// router.delete('/user/:userId', adminController.allowIfLoggedin, adminController.grantAccess('deleteAny', 'profile'), adminController.deleteUser);

module.exports = router;