const isGuest = (account = '') => account.includes('_');

const postOrCommentGuest = (data) => {
  if (data.comment.parent_author) return 'COMMENT';
  return 'POST';
};

const getManaError = () => ({
  status: 429, message: 'MP is to low for this request',
});

module.exports = {
  isGuest,
  postOrCommentGuest,
  getManaError,
};
