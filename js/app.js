//Instance of currency
myCurrency = new currency;

if ('serviceWorker' in navigator) {

    navigator.serviceWorker
      .register('./sw.js')
      .then(function(registration) {
        console.log("Service Worker Registered");
      })
      .catch(function(err) {
        console.log("Service Worker Failed to Register", err);
      })
  
  }
  myCurrency.showCurrency();
  myCurrency.saveCurrency();
  myCurrency.getCurrency();
  