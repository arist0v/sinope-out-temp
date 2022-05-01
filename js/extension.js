(function() {
    console.log("extension.js loaded");
    class sinopeOutTemp extends window.Extension {
        constructor(){
            console.log("extension.js class created");
            super('sinope-out-temp');
            this.addMenuEntry('Sinope');
			
			this.sinopeMacOUI = "500b914"

			this.sinope_thermostats = this.get_sinope_thermostat();
			
			this.temperature_property = this.get_temp_property();
            
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
            let testDiv = 'extension-sinope-out-temp-test'
    		if(this.content == ''){
    			return;
    		}
    		else{
    			this.view.innerHTML = this.content;
    		}
			console.log(this.sinope_thermostats.length);
			if(this.sinope_thermostats.length < 1){
				document.getElementById('extension-sinope-out-temp-warning')
				.innerHTML = 'No sinope Thermostat found. Did you have any on the gateway?'
				return;
			}
			document.getElementById(testDiv)
			.innerHTML = 'TEST'
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
			console.log('get sinope thermostats')
			let sinope_theromstats = []
			API.getThings().then((things)=>{
				
				for (let key in things){
					if ((things[key]['@type'] == "Thermostat") && (things[key]['id']
					.indexOf(this.sinopeMacOUI) >= 0)){
						if (!sinope_theromstats.includes(things[key]['id'])){
							//console.log('thermostats id: ' + things[key]['id'])
							sinope_theromstats.push(things[key]['id']);
						}
					}
				}
				//console.log('sinope thermostats: '+ sinope_theromstats)
				
			})
			return sinope_theromstats;
		}

		get_temp_property(){
			let tempProperty = []
			API.getThings().then((things)=> {
				for (let thing in things){
					let thingID = things[thing]['id']
					for (let property in things[thing]['properties']){
							let propertyTitle = things[thing]['properties'][property]['title']
							if (things[thing]['properties'][property]['@type'] == "TemperatureProperty"){
								if (!tempProperty.includes([thingID, propertyTitle])){
									if (thingID.indexOf(this.sinopeMacOUI) < 0){
										tempProperty.push([thingID, propertyTitle]);
									}
								}
							}
					}
				}	
			})
			return tempProperty;
		}
    }
    
    new sinopeOutTemp();
})();