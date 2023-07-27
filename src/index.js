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
        parkingLots = parkingLots != null ? parkingLots : "108,103,104,116";
        // split string
        parkingLots = parkingLots.split(",");

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

        return json.data;
    }

    dateFormat(parking) {
        if (!parking.mvalidtime) return ''
        const date = new Date(parking.mvalidtime)
        return `${date.getHours()}:${String('0' + date.getMinutes()).slice(
            -2
        )}, ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
    }

    name(parking) {
        return parking.smetadata.standard_name ? parking.smetadata.standard_name : parking.sname; 
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

        for (let parking of this.parkings) {
            this.shadow.innerHTML += `
                <h2>${this.name(parking)}</h2 >
            <p>${Math.floor(parking.mvalue / parking.smetadata.capacity * 100)}% - ${parking.mvalue}/${parking.smetadata.capacity}<br />
                ${this.dateFormat(parking)}</p>
        `;
        }
    }
}

// Register our first Custom Element named <hello-world>
customElements.define('parking-dashboard', ParkingDashboard);