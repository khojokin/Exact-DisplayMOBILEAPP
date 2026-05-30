module.exports = {
  connectAsync: function() { return Promise.resolve(); },
  disconnectAsync: function() { return Promise.resolve(); },
  getProductsAsync: function() { return Promise.resolve({ results: [] }); },
  purchaseItemAsync: function() { return Promise.resolve(); },
  finishTransactionAsync: function() { return Promise.resolve(); },
  getBillingResponseCodeAsync: function() { return Promise.resolve(0); },
  setPurchaseListener: function() {},
  IAPResponseCode: { OK: 0, USER_CANCELED: 1, ERROR: 2, DEFERRED: 3 },
  IAPItemType: { PURCHASE: 'inapp', SUBSCRIPTION: 'subs' },
};
