(function() {
    console.log("extension.js loaded");
    class sinopeOutTemp extends window.Extension {
        constructor(){
            console.log("extension.js class created");
            super('sinope-out-temp');
            this.addMenuEntry('Sinope');
			
			this.sinopeMacOUI = "500b914"

            this.content = '';
			fetch(`/extensions/${this.id}/views/content.html`)
			.then((res) => res.text())
			.then((text) => {
				this.content = text;
				/*if( document.location.href.endsWith("sinope-out-temp") ){
					this.show();
				}*/
			})
			.catch((e) => console.error('Failed to fetch content:', e));
        }

        show(){
			API.getThings().then((things)=>{
				let testDiv = 'extension-sinope-out-temp-test';
				let warningDiv = 'extension-sinope-out-temp-warning'
				let listDiv = 'extension-sinope-out-temp-list';

				this.sinope_thermostats = this.get_sinope_thermostat(things);
				this.temperature_property = this.get_temp_property(things);
				if(this.content == ''){
					return;
				}
				else{
					this.view.innerHTML = this.content;
				}

				console.log(this.sinope_thermostats.length);
				if(this.sinope_thermostats.length < 1){
					document.getElementById(warningDiv)
					.innerHTML = 'No sinope Thermostat found. Did you have any on the gateway?'
					return;
				}

				if(this.temperature_property.length < 1){
					document.getElementById(warningDiv)
					.innerHTML = 'No Temperature Property found on other devices.'
					return;
				}
				document.getElementById(testDiv)
				.innerHTML = this.show_list(things);
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
			})
        }

		show_list(things){
			let listContent = "";
			let thingName;
			let dropDown = this.get_dropDown(things);
			this.sinope_thermostats.forEach((thingsID) => {
				for (let thing in things){
					if (things[thing]['id'] == thingsID){
						thingName = things[thing]['title']
					}
				}
				listContent = listContent + '<div id =\'extension-sinope-out-temp-list-element\'>'
				 + 
				 'Sinope Thermostat : ' 
				 + 
				 thingName 
				 + 
				 ' will display Outside Temperature from source: '
				 + 
				 dropDown 
				 +				 
				 '</div>';
			});

			return listContent;
		}

		get_dropDown(things){
			let tempDropdown = `
			<select name=\'sensor\' id=\'sensor\'>
			 <option value=\'none\'>None</option>
			`
			this.temperature_property.forEach((property) => {
				for (let thing in things){
					if (property[0] == things[thing]['id']){
						console.log('in thing')
						let thingName = things[thing]['title']
						for (let thingProperty in things[thing]['properties']){
							if (property[1] == things[thing]['properties'][thingProperty]['title']){
								tempDropdown = tempDropdown +
								'<option value=\'' 
								+ thingName 
								+'_'
								+ property[1] 
								+'\'>' + thingName + ' > ' + property[1] 
								+ '</option>'
							}
						}

					}
				}
			})

			tempDropdown = tempDropdown + '</select>'
			return tempDropdown
		}

		get_sinope_thermostat(things){
			console.log('get sinope thermostats')
			let sinopeTheromstats = []
				
			for (let key in things){
				if ((things[key]['@type'] == "Thermostat") && (things[key]['id']
				.indexOf(this.sinopeMacOUI) >= 0)){
					if (!sinopeTheromstats.includes(things[key]['id'])){
						//console.log('thermostats id: ' + things[key]['id'])
						sinopeTheromstats.push(things[key]['id']);
					}
				}
			}
			return sinopeTheromstats;
		};

		get_temp_property(things){
			let tempProperty = []
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
			return tempProperty;
		};

    }
    
    new sinopeOutTemp();
})();