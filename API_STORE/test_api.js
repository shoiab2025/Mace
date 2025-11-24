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

