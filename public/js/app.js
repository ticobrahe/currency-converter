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
        caches.match('https://free.currconv.com/api/v7/countries?apiKey=1ff15bdb656f557d2a09').then(responseData => {
            if(responseData){
                responseData.json().then(response => {
                    const currency = response.results;
                    this.displayCurrency(currency);
                });
            }else{
                //fetch from network
                fetch('https://free.currconv.com/api/v7/countries?apiKey=1ff15bdb656f557d2a09')
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
        if(!rate)
        this.showError('Opp! rate not available offline')
        //console.log(rate);
        const showResult = document.getElementById('result');
        const showRate = document.getElementById('rate');
        const amount = document.getElementById('amount').value;
        const from = document.getElementById('fromCurrency').value;
        const to = document.getElementById('toCurrency').value;
        //console.log(rate);
        if(amount > 0){     
        let res = parseFloat(rate * amount);
           let result = res.toFixed(3);
            //console.log(result);
            showResult.innerHTML = `${result} ${to}`;
            document.getElementById('loading').style.display ='none';
            showResult.innerHTML = `${result} ${to}`; 
            showRate.innerHTML = `1 ${from} - ${rate} ${to}`;
        }else{
            //showRate.innerHTML = `1 ${from} - ${rate} ${to}`;
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
  
    calculateCurrencyOnline(){
        const from = this.selFrom.value;
        const to = this.selTo.value;
        let query = `${from}_${to}`;
        fetch(`https://free.currconv.com/api/v7/convert?q=${query}&compact=ultra&apiKey=1ff15bdb656f557d2a09`)
        .then((result) => {
           const data = result.json();
            data.then( value => {
                const cur = Object.keys(value);
                const rate = value[cur];
                console.log(cur);
                this.convertCurrency(rate);
                this.dbPromise().then(db => {
                    if (!db) return;
                    const tx = db.transaction('rate', 'readwrite');
                    const store = tx.objectStore('rate');
                    value.id = cur.toString();
                    console.log(value);
                    store.put(value);
                    return tx.complete;
                });
            }).catch( err => {
                this.showError('Opp rate not available offline')
            })
        })
    }

   
    //get rate form indexdb and convert, if !rate, convert online.
    calculateCurrency(){
        this.dbPromise().then(db => {
            const from = this.selFrom.value;
            const to = this.selTo.value;
            const query = `${from}_${to}`;
            //console.log(`"${query}"`);
            const tx = db.transaction('rate');
            return tx.objectStore('rate').get(query);
            })
            .then(response => { 
                if(response){
                    const con = response.id;
                    //console.log(response.id);
                    const rate = response[con]
                   // console.log(rate);
                    this.convertCurrency(rate);
                }else{
                    if(navigator.onLine){
                        document.getElementById('loading').style.display ='none';
                        this.calculateCurrencyOnline();
                    }else{
                        //console.log(navigator.onLine);
                        document.getElementById('loading').style.display ='none';
                        // document.getElementById('error_message').style.display = 'block !important';
                        this.showError('Opp rate not available offline')
                    }                                     
                }           
        }).catch( err => {    
            // document.getElementById('loading').style.display ='none';
            // this.showError('Opp rate not available offline')                 
            })
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
     document.getElementById('result').innerHTML = '';
     document.getElementById('rate').innerHTML = '';
    // show loader
    document.getElementById('loading').style.display ='block';
    
    setTimeout( () => {myCurrency.calculateCurrency()}, 2000);
  } );

// fetch('https://free.currconv.com/api/v7/convert?q=USD_PHP&compact=ultra&apiKey=1ff15bdb656f557d2a09')
// .then((result) => {
//    data = result.json()
//     console.log(data)
// }).catch((err) => {
//     console.log('Error');
// });