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
            switch (upgradeDb.oldVersion) {
              case 0: upgradeDb.createObjectStore('currency', {keyPath: 'id'});
            }
          });
          
      }

    //fectching  currency from api
    async fetchCurrency(){
        const response = await fetch('https://free.currencyconverterapi.com/api/v5/countries');
        const responseData = await response.json();
        return responseData;
      
      }

      deliver(){
          this.fetchCurrency()
            .then(response => {
                const data = response.results;
                for(let key of Object.keys(data)){
                    console.log(data[key].name);
                }
            });
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
            console.log('Saved');
            })
        
        }).catch( err => console.log(err))
      }
      //display currency object to select tag
      displayCurrency(data){
        for(let key of Object.keys(data)){
         //create an option tag 
         const option = document.createElement('option');
         option.innerHTML = `${data[key].currencyName} (${data[key].currencyId})`;
         option.setAttribute('value', data[key].currencyId );
         //apend the option tag to select tags
         this.selFrom.appendChild(option);
         this.selTo.appendChild(option.cloneNode(true));
        }
      }
      //retreiving currency fom indexdb and inserting to select tag
      getCurrency(){
          this.dbPromise().then(db => {
            if (!db || this.showCurrency()) return;
            const tx = db.transaction('currency');
            return tx.objectStore('currency').getAll();
          }).then(data => {
                //insert to select tag
               this.displayCurrency(data);
        })
      }
      //show currency fetched to select tag
      showCurrency(){
          this.fetchCurrency().then(response =>{
            const data = response.results;
            this.displayCurrency(data);
          })


    }



}