// utils/Cache.js
class Cache {
  constructor(ttl = 60000) { // 기본 TTL: 60초 (60000ms)
      this.cache = new Map();
      this.ttl = ttl;
  }

  set(key, value) {
      this.cache.set(key, { value, expires: Date.now() + this.ttl });
  }

  get(key) {
      const data = this.cache.get(key);
      if (data && Date.now() < data.expires) {
          return data.value;
      }
      this.cache.delete(key);
      return null;
  }

  delete(key) {
      this.cache.delete(key);
  }

  clear() {
      this.cache.clear();
  }
}

module.exports = Cache;
