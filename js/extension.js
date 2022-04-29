(function() {
    console.log("extension.js loaded");
    class sinopeOutTemp extends window.Extension {
        constructor(){
            console.log("extension.js class created");
            super('sinope-out-temp');
            this.addMenuEntry('Sinope');
			
			this.sinopeMacOUI = "500b914"

			this.sinope_thermostats = this.get_sinope_thermostat();
            
            this.content = '';
			fetch(`/extensions/${this.id}/views/content.html`)
			.then((res) => res.text())
			.then((text) => {
				this.content = text;
				if( document.location.href.endsWith("sinope-out-temp") ){
					this.show();
				}
			})
			.catch((e) => console.error('Failed to fetch content:', e));
        }

        show(){
            
    		if(this.content == ''){
    			return;
    		}
    		else{
    			this.view.innerHTML = this.content;
    		}
            /*
			window.API.postJson(
				`/extensions/${this.id}]/api/init`,
				{'action':'init' }
			).then((body) => { 
				console.log("init response: ");
				console.log(body);
                
				if( body['state'] != true ){
					console.log("response was OK");
				}
                else{
                    console.log("response was not OK");
                }

			}).catch((e) => {
				alert("connection error");
			});*/
            
        }

		get_sinope_thermostat(){
			let sinope_theromstats = []
			API.getThings().then((things)=>{
				
				for (let key in things){
					if ((things[key]['@type'] == "Thermostat") && (things[key]['id'].indexOf(this.sinopeMacOUI) >= 0)){
						if (!sinope_theromstats.includes(things[key]['id'])){
							sinope_theromstats.push(things[key]['id']);
						}
					}
				}
				document.getElementById("extension-sinope-out-temp-test").innerHTML = this.test;
			})
			return sinope_theromstats;
		}
    }
    
    new sinopeOutTemp();
})();