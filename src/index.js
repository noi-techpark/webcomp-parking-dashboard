// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

class ParkingDashboard extends HTMLElement {
    constructor() {
        super();

        // We need an encapsulation of our component to not
        // interfer with the host, nor be vulnerable to outside
        // changes --> Solution = SHADOW DOM
        this.shadow = this.attachShadow(
            { mode: "open" }    // Set mode to "open", to have access to
            // the shadow dom from inside this component
        );
    }

    get parkings() {
        let parkingLots = this.getAttribute("parkings");

        // default value
        parkingLots = parkingLots != null ? parkingLots: "108,103,104,116"; 
        // split string
        parkingLots = parkingLots.split(",");
        console.log(parkingLots);


        // https://mobility.api.opendatahub.com/v2/flat,node/ParkingStation/occupied/latest?where=scode.in.(%22108%22,%22103%22,%22104%22,%22116%22)
        const api = "https://mobility.api.opendatahub.com";
        
        const xhttp = new XMLHttpRequest();
        const searchString = "scode.in.(" + parkingLots
            .map(e => `"${encodeURIComponent(e)}"`)
            .join(',')
            + ")";
        xhttp.open("GET", `${api}/v2/flat,node/ParkingStation/occupied/latest?limit=-1&where=${searchString}&origin=webcomp-parking-dashboard`, false)
        xhttp.send();
        const json = JSON.parse(xhttp.response);

        console.log(json);
        return json.data;
    }

    get visits() {
        return value;
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadow.innerHTML = `
            <style>
                h1 {
                    color: black;
                    font-size: ${this.fontSize}px;
                    font-family: 'Source Sans Pro',sans-serif;
                }
            </style>
            <h1>Parking dashboard</h1>
        `;

        for(let parking of this.parkings){
            this.shadow.innerHTML += `
                <h2>${parking.sname}</h2>
                <p>${parking.mvalue}/${parking.smetadata.capacity} ${Math.floor(parking.mvalue/parking.smetadata.capacity * 100)}% ${parking.mvalidtime}</p>  
            `;
        }
    }
}

// Register our first Custom Element named <hello-world>
customElements.define('parking-dashboard', ParkingDashboard);