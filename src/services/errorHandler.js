function handleError(error, defaultMsg) {
  return {
    success: false,
    message: error?.message || defaultMsg,
  };
}

export default {
  handleError,
};