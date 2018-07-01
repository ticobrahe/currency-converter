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
        return idb.open('currency-converterdb', 2, (upgradeDb) => {
            switch (upgradeDb.oldVersion) {
              case 0: upgradeDb.createObjectStore('currency', {keyPath: 'id'});
              case 1: upgradeDb.createObjectStore('rate', {keyPath: 'id'});
            }
          });
          
      }

    //fectching  currency from api
    async fetchCurrency(){
        const response = await fetch('https://free.currencyconverterapi.com/api/v5/countries');
        const responseData = await response.json();
        return responseData;    
      }

      //Save currency fetched to inside indexdb
    saveCurrency(){
        //calling fetch currency
        this.fetchCurrency()
            .then(response => {
                this.dbPromise().then(db => {
                if (!db) return;
                const tx = db.transaction('currency', 'readwrite');
                const store = tx.objectStore('currency');
                const data = response.results;
                for(let key of Object.keys(data)){
                    store.put(data[key]);
            }
                return tx.complete;
        })
        
        }).catch( err => console.log('Failed', err));
      }
      //display currency object to select tag
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
      //retreiving currency fom indexdb and inserting to select tag
      getCurrency(){
          this.dbPromise().then(db => {
            if (!db ) return;
            const tx = db.transaction('currency');
            return tx.objectStore('currency').getAll();
          }).then(data => {
                //insert to select tag
               this.displayCurrency(data);
        }).catch(err => console.log('something Went Wrong'));
      }
      //show currency fetched to select tag
      showCurrency(){
          this.fetchCurrency().then(response =>{
            const currency = response.results;
            this.displayCurrency(currency);
          }).catch(this.getCurrency());
    }
    //fetching rate from api
    async fetchRate(){
        const from = this.selFrom.value;
         const to = this.selTo.value;
        let query = `${from}_${to}`;
        const response = await fetch(`https://free.currencyconverterapi.com/api/v3/convert?q=${query}`);
        const responseData = await response.json();
        return responseData; 
    }
    //
   
    //Fetch rate from api and convert to selected currency
    getRate(){
        this.fetchRate().then(response => {
           // console.log(response);
             const responseData = response.results;
             let key = Object.keys(responseData);
             let rate = responseData[key].val;
             this.convertCurrency(rate);
        }).catch( this.retriveRate());
    }

    //convert  currency
    convertCurrency(rate){
        const showResult = document.getElementById('result');
        const amount = document.getElementById('amount').value;
        const from = this.selFrom.value;
        const to = this.selTo.value;
        //console.log(rate);
        if(amount > 0 && rate){
        //console.log(rateValue);
        let result = parseFloat(rate * amount).toFixed(2);
        //console.log(result);
        showResult.innerHTML = `${result} ${to}`;
        document.getElementById('outcome').style.display ='block';
        document.getElementById('loading').style.display ='none';
        document.getElementById('test').innerHTML = `1 ${from} - ${rate.toFixed(2)} ${to}`; 
        document.getElementById('error').innerHTML =''; 
       }else{
       // document.getElementById('test').innerHTML = `1 ${from} - ${rate.toFixed(2)} ${to}`;
       document.getElementById('error').innerHTML ='Invalid  Amount'; 
        document.getElementById('outcome').style.display ='none';
        document.getElementById('loading').style.display ='none';
       }
    }
    
    //save Rate to Indexdb
    saveRate(){
        this.fetchRate()
            .then(response => {
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
                })
    
        }).catch( err => console.log('Failed', err))
    }

    //get Rate from indexdb for conversion
    retriveRate(){
        this.dbPromise().then(db => {
            const from = this.selFrom.value;
            const to = this.selTo.value;
            let query = `${from}_${to}`;
            //console.log(`"${query}"`);
            const tx = db.transaction('rate');
            return tx.objectStore('rate').get(query);
          })
          .then(response => {
                const rate =response.val;
                this.convertCurrency(rate);
        }).catch(() => {
            document.getElementById('loading').style.display ='none';
            
            console.log('failed 000');
        });
    }

    
   
}
myCurrency = new currency;

//document.getElementById('calculate').addEventListener('click',  myCurrency.getRate() );