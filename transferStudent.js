// transferStudent.js
const pool = require('./db');

async function transferStudent(studentId, oldDeptId, newDeptId) {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    
    // 1. 更新學生所屬系所
    await conn.query(
      'UPDATE STUDENT SET Department_ID = ? WHERE Student_ID = ?',
      [newDeptId, studentId]
    );
    
    // 2. 標記舊系所必修課程為「轉系退選」
    await conn.query(`
      UPDATE ENROLLMENT 
      SET Status = '轉系退選' 
      WHERE Student_ID = ? 
        AND Course_ID IN (
          SELECT Course_ID FROM COURSE 
          WHERE Department_ID = ? AND Is_Required = 1
        )
    `, [studentId, oldDeptId]);
    
    // 3. 加選新系所必修課程
    const requiredCourses = await conn.query(`
      SELECT Course_ID 
      FROM COURSE 
      WHERE Department_ID = ? AND Is_Required = 1
    `, [newDeptId]);
    
    // 假設有個當前學期的 ID
    const currentSemester = '112-2';
    
    for (const course of requiredCourses) {
      await conn.query(`
        INSERT INTO ENROLLMENT (Student_ID, Course_ID, Semester, Status)
        VALUES (?, ?, ?, '轉系加選')
      `, [studentId, course.Course_ID, currentSemester]);
    }
    
    await conn.commit();
    console.log(`學生 ${studentId} 已從 ${oldDeptId} 轉到 ${newDeptId}`);
  } catch (err) {
    if (conn) await conn.rollback();
    console.error('轉系處理失敗：', err);
  } finally {
    if (conn) conn.release();
  }
}

// 執行轉系功能（範例）
transferStudent('S10810005', 'CS001', 'EE001');
