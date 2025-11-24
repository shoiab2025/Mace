export const submitTest = async (data) => {
  try {
    const response = await fetchDatas('post', '/testSubmission/submit', data);

    if (response) {
        return response
    } else {
      throw new Error('Error Submitting the test.'); 
    }

  } catch (error) {
    console.error(`Error submitting test: ${error}`);
    throw error; // Re-throw to let caller handle the error
  }
};