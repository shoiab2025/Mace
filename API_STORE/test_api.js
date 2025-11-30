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

export const submitTestAPI = async (submissionData) => {
  try {
    const response = await fetchDatas('post', '/testSubmission/submit', submissionData);

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
