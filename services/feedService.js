import api from './apiService';

const FeedService = {
  getPersonalizedFeed: ({ userId, page = 1, limit = 10 } = {}) =>
    api.get('/feed', { userId, page, limit }),
  getExploreFeed: ({ page = 1, limit = 10 } = {}) =>
    api.get('/feed/explore', { page, limit }),
};

export default FeedService;