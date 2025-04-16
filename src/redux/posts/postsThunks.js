import { setPosts, setStatus, setError } from "./postSlice";

export const fetchPosts = () => async (dispatch) => {
    dispatch(setStatus('loading'));
  try {
    const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/posts/`, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
    const data = await response.json();
    dispatch(setPosts(data.data));
    dispatch(setStatus('succeeded'));
  } catch (error) {
    dispatch(setError(error.toString()));
    dispatch(setStatus('failed'));
  }
};
