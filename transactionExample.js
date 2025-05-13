const pool = require('./db'); // 引入資料庫連線池

async function doTransaction(studentId, newDept) {
  let conn;

  try {
    // 開始交易
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // 檢查學號是否存在
    const [check] = await conn.query('SELECT * FROM STUDENT WHERE Student_ID = ?', [studentId]);
    if (!check || check.length === 0) {
      // 學號不存在，回滾交易並終止後續操作
      console.log(`查無學號 ${studentId} 的資料，交易已回滾`);
      await conn.rollback();
      return; // 結束後續執行
    }

    // 學號存在，執行更新操作

    // 更新學生系所
    const updateStudent = 'UPDATE STUDENT SET Department_ID = ? WHERE Student_ID = ?';
    await conn.query(updateStudent, [newDept, studentId]);

    // 更新學生選課表中的系所標記
    const updateCourses = 'UPDATE ENROLLMENT SET Status = ? WHERE Student_ID = ?';
    await conn.query(updateCourses, ['轉系', studentId]);

    // 查詢更新後的系所
    const [result] = await conn.query(
      'SELECT Department_ID FROM STUDENT WHERE Student_ID = ?', 
      [studentId]
    );

    // 輸出查詢結果，以便進一步排查問題
    console.log('查詢結果:', result);

    // 檢查查詢結果
    if (!result || !result.Department_ID) {
      console.log(`查無學號 ${studentId} 的資料`);
    } else {
      console.log(`學號 ${studentId} 目前的系所為：${result.Department_ID}`);
    }

    // 所有操作無誤，提交交易
    await conn.commit();
    console.log('交易成功，已提交');
  } catch (err) {
    // 若有任何錯誤，回滾所有操作
    if (conn) await conn.rollback();
    console.error('交易失敗，已回滾：', err.message);
  } finally {
    // 釋放連線
    if (conn) conn.release();
  }
}

// 調用函數，傳入學號與新的系所
doTransaction('S10810001', 'CS001');
