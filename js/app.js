class currency {
    constructor(){
        this.selFrom = document.getElementById('fromCurrency');
        this.selTo   = document.getElementById('toCurrency');
    }
  
    dbPromise() {
        // If the browser doesn't support service worker,
        // we don't care about having a database
        if (!navigator.serviceWorker) {
          return Promise.resolve();
        }
        return idb.open('currency-converterdb', 1, (upgradeDb) => {
               upgradeDb.createObjectStore('rate', {keyPath: 'id'});
            
          });
          
      }
  
      //display currencies object to select tag
      displayCurrency(currency){
        for(let key of Object.keys(currency)){
         //create an option tag 
         const option = document.createElement('option');
         option.innerHTML = `${currency[key].currencyName} (${currency[key].currencyId})`;
         option.setAttribute('value', currency[key].currencyId );
         //apend the option tag to select tags
         this.selFrom.appendChild(option);
         this.selTo.appendChild(option.cloneNode(true));
        }
      }
     
    //fecth currencies from cache or network and populate to user
    showCurrency(){
        //fetch from cache
        caches.match('https://free.currencyconverterapi.com/api/v5/countries').then(responseData => {
            if(responseData){
                responseData.json().then(response => {
                    const currency = response.results;
                    this.displayCurrency(currency);
                });
            }else{
                //fetch from network
                fetch('https://free.currencyconverterapi.com/api/v5/countries')
                .then(responseData => responseData.json())
                .then(response =>{
                    const currency = response.results;
                    this.displayCurrency(currency);
                });
            }   
        });
      }
      //method that takes rate and convert to another currency
      convertCurrency(rate){
       //console.log(rate);
       const showResult = document.getElementById('result');
       const showRate = document.getElementById('rate');
       const amount = document.getElementById('amount').value;
       const from = document.getElementById('fromCurrency').value;
       const to = document.getElementById('toCurrency').value;
       //console.log(rate);
       if(amount > 0){
       //console.log(rateValue);
       let result = parseFloat(rate * amount).toFixed(2);
       //console.log(result);
       showResult.innerHTML = `${result} ${to}`;
       document.getElementById('loading').style.display ='none';
       showResult.innerHTML = `${result} ${to}`; 
       showRate.innerHTML = `1 ${from} - ${rate.toFixed(2)} ${to}`;
      }else{
       showRate.innerHTML = `1 ${from} - ${rate.toFixed(2)} ${to}`;
       this.showError('Amount must not be empty');
       document.getElementById('loading').style.display ='none';
      }
   }
    //show error message
    showError(message){
        const error = document.getElementById('error');
        error.style.display = 'block';
        error.innerHTML = message;
        //insert div after heading
        //this.clearError();
        setTimeout(() => {this.clearError()}, 3000);
    }
    //clear error message 
    clearError(){
        const error = document.getElementById('error');
        error.innerHTML = '';
        error.style.display = 'none';
    }
  
    //fetch rate from api, convert currency and save into indexdb
    calculateCurrencyOnline(){
        const from = this.selFrom.value;
        const to = this.selTo.value;
        let query = `${from}_${to}`;
        fetch(`https://free.currencyconverterapi.com/api/v3/convert?q=${query}`)
        .then( responseData => {
            responseData.json().then( response => {
                const result = response.results;
                const key = Object.keys(result);    
                       
                const rate = result[key].val;
                //console.log(rate);
                this.convertCurrency(rate);
                this.dbPromise().then(db => {
                    if (!db) return;
                    const tx = db.transaction('rate', 'readwrite');
                    const store = tx.objectStore('rate');
                    const rate = response.results;
                    //console.log(rate);
                    let key = Object.keys(rate);
                    //console.log(rate[key]);
                    store.put(rate[key]);
                    return tx.complete;
                });
             })
        }).catch(() => { this.showError('Opp rate not available offline')}); 
    }

   
    //get rate form indexdb and convert, if !rate, convert online.
    calculateCurrency(){
        this.dbPromise().then(db => {
            const from = this.selFrom.value;
            const to = this.selTo.value;
            let query = `${from}_${to}`;
            //console.log(`"${query}"`);
            const tx = db.transaction('rate');
            return tx.objectStore('rate').get(query);
            })
            .then(response => {
                if(response){
                    const rate = response.val;
                    this.convertCurrency(rate);
                }else{
                    document.getElementById('loading').style.display ='none';
                    this.calculateCurrencyOnline();
                }
               
        });
    }
  }
  
  
  if ('serviceWorker' in navigator) {
  
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          console.log("Service Worker Registered");
        })
        .catch(err => {
          console.log("Service Worker Failed to Register", err);
        }) 
    }
  

  myCurrency = new currency;
  myCurrency.showCurrency();
  //convert rate when convert button is clicked
  document.getElementById('calculate').addEventListener('click',  e => {
    // show loader
    document.getElementById('loading').style.display ='block';
    setTimeout( () => {myCurrency.calculateCurrency()}, 2000);
  } );