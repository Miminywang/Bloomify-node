// 這支用來初始化課程平均評分
import sequelize from '#configs/db.js'
const { Course, Course_Review } = sequelize.models

// 更新課程平均星數
async function updateCourseAverageStars(courseId) {
  // console.log('Updating average stars for course:', courseId)
  try {
    const reviews = await Course_Review.findAll({
      where: { course_id: courseId },
      attributes: ['stars'],
    })
    console.log('Fetched reviews:', reviews.length) // 查看獲取到的評價資料
    if (reviews.length > 0) {
      const totalStars = reviews.reduce((acc, review) => acc + review.stars, 0)
      const averageStars = totalStars / reviews.length
      // console.log('Calculated average stars:', averageStars) // 打印計算的平均量級
      await Course.update(
        { average_stars: averageStars },
        { where: { id: courseId } }
      )
    } else {
      await Course.update({ average_stars: null }, { where: { id: courseId } })
    }
  } catch (error) {
    console.error('Error updating course average stars:', error)
  }
}

// 遍歷所有課程，更新課程平均星數
async function updateAllCoursesAverageStars() {
  try {
    const courses = await Course.findAll()
    for (const course of courses) {
      await updateCourseAverageStars(course.id)
    }
    console.log('Initialized all courses with average stars.')
  } catch (error) {
    console.error('Failed to initialize average stars:', error)
  }
}

// 導出，放在app.js
export { updateAllCoursesAverageStars as initializeAverageStars }
