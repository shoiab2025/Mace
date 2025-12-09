import { fetchDatas } from "./api";

export const fetchTests = async () => {
  try {
    const tests = await fetchDatas('get', '/tests/');

    if (tests && tests.length > 0) { 
      return tests;
    } else {
      throw new Error('No tests found'); 
    }

  } catch (error) {
    console.error(`Error fetching tests error is: ${error}`);
  }
};

export const fetchPreTests = async () => {
  try {
    const tests = await fetchDatas('get', '/tests/');
    if (tests.data && tests.data.length > 0) {
        return tests.data.filter(test => test.test_type === "pre-test"); 
    } else {
      throw new Error('No tests found'); 
    }

  } catch (error) {
    console.error(`Error fetching tests error is: ${error}`);
  }
};

export const fetchTeacherPreTests = async (user) => {
  try {
    const tests = await fetchDatas('get', '/tests/');
    if (tests.data && tests.data.length > 0) {
        return tests.data.filter(test => test.test_type === "pre-test" && test.created_by?._id != user?._id); 
    } else {
      throw new Error('No tests found'); 
    }

  } catch (error) {
    console.error(`Error fetching tests error is: ${error}`);
  }
};

export const fetchTeacherPostTests = async (user) => {
  try {
    const tests = await fetchDatas('get', '/tests/');
    if (tests.data && tests.data.length > 0) {
        return tests.data.filter(test => test.test_type === "post-test" && test.created_by?._id != user?._id); 
    } else {
      throw new Error('No tests found'); 
    }

  } catch (error) {
    console.error(`Error fetching tests error is: ${error}`);
  }
};

export const fetchTeacherTests = async (user) => {
  try {
    const tests = await fetchDatas('get', '/tests/');
    if (tests.data && tests.data.length > 0) {
        const teacherTest = tests.data.filter(test => test.created_by._id === user?._id); 
        return teacherTest
    } else {
      throw new Error('No tests found'); 
    }

  } catch (error) {
    console.error(`Error fetching tests error is: ${error}`);
  }
};

export const fetchPostTests = async () => {
  try {
    const tests = await fetchDatas('get', '/tests/');

    if (tests.data && tests.data.length > 0) {
        return tests.data.filter(test => test.test_type === "post-test"); 
    } else {
      throw new Error('No tests found'); 
    }

  } catch (error) {
    console.error(`Error fetching tests error is: ${error}`);
  }
};


export const fetchLeaderBoardForTest = async (testId) => {
  try {
    const response = await fetchDatas('get', `/leaderboard/test/${testId}`);

    if (response && response.data) {
      console.log("The response", response.data);
      
      return response.data;
    } else {
      throw new Error('Leaderboard not found for this test'); 
    }

  } catch (error) {
    console.error(`Error fetching leaderboard: ${error}`);
    throw error; // Re-throw to handle in the calling component
  }
};

export const updateTestStatus = async (testId, data) => {
  try {

    const response = await fetchDatas('put', `/tests//test-status/${testId}`, data);
    if (response && (response.data || response.success)) {
      console.log("Test status updated successfully:", response.data || response);
      return response.data || response;
    } else {
      throw new Error('Failed to update test status');
    }

  } catch (error) {
    console.error(`Error updating test status: ${error.message}`);
    throw error;
  }
};

export const submitTestAPI = async (submissionData) => {
  try {
    const response = await fetchDatas('post', '/result/submit', submissionData);
    if (response && response.data) {
      console.log("Test submitted successfully:", response.data);
      return {
        success: true,
        data: response.data
      };
    } else {
      throw new Error('Failed to submit test'); 
    }

  } catch (error) {
    console.error(`Error submitting test: ${error}`);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to submit test'
    };
  }
};
