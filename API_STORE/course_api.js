import { fetchDatas } from "./api";

export const fetchCourses = async () => {
  try {
    const courses = await fetchDatas('get', '/courses/');

    if (courses && courses.length > 0) { 
      return courses;
    } else {
      throw new Error('No courses found'); 
    }

  } catch (error) {
    console.error(`Error fetching courses error is: ${error}`);
  }
};

export const fetchPublicCourses = async () => {
  try {
    const courses = await fetchDatas('get', '/courses/');

    if (courses && courses.length > 0) { 
      return courses.filter(course => course.course_type === "public");
    } else {
      throw new Error('No courses found'); 
    }

  } catch (error) {
    console.error(`Error fetching public courses error is: ${error}`);
  }
};

export const fetchPrivateCourses = async () => {
  try {
    const courses = await fetchDatas('get', '/courses/');

    if (courses && courses.length > 0) { 
      return courses.filter(course => course.course_type === "private");
    } else {
      throw new Error('No courses found'); 
    }

  } catch (error) {
    console.error(`Error fetching public courses error is: ${error}`);
  }
};

export const AddCourseJoin = async (data) => {
  try {
    const response = await fetchDatas('post', '/courses/request-join/', data);
    console.log("the data", response)
    if (response) { 
      return response;
    } else {
      throw new Error('Cant Join courses found'); 
    }

  } catch (error) {
    console.error(`Error fetching Joining courses error is: ${error}`);
  }
};

export const ApprovalJoinRequest = async (data) => {
  try {
    const response = await fetchDatas('post', '/courses/handle-join-request/', data);
    console.log("the data", response)
    if (response) { 
      return response;
    } else {
      throw new Error('Cant Join courses found'); 
    }

  } catch (error) {
    console.error(`Error fetching Joining courses error is: ${error}`);
  }
};

