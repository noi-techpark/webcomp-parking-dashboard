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

    badgeColor(parking) {
        const parkingDate = new Date(parking.mvalidtime);
        const referenceDate = new Date();
        referenceDate.setHours(referenceDate.getHours() - 1);
        if (parkingDate < referenceDate)
            return 'gray';
        const percentage = Math.floor(parking.mvalue / parking.smetadata.capacity * 100);
        if (percentage >= 80)
            return 'red'
        return 'green'
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
                .card {
                    display: flex;
                    margin: 20px;
                    padding: 5px;
                    border-radius: 20px;
                    height: 100px;
                }
                .badge{
                    display: flex;
                    flex-direction: column;
                    color : white;
                    width: 150px;
                    font-family: sans-serif;
                    justify-content: center;
                    border-radius: 10px;
                }
                .percentage{
                    font-weight: 600;
                    font-size: 32px;
                    text-align: center;
                    width: 100%;
                }
                .capacity{
                    font-weight: 600;
                    font-size: 18px;
                    text-align: center;
                    width: 100%;
                }
                .detail {
                    margin-left: 15px;
                    font-size: 24px;
                }
                .red {
                    background-color : #ff4d4d;
                }
                .green {
                    background-color : #5cd65c;
                }
                .gray {
                    background-color : #bfbfbf;
                }
            </style>
            <h1>Parking dashboard</h1>
        `;

        // for (let parking of this.parkings) {
        //     this.shadow.innerHTML += `
        //         <h2>${this.name(parking)}</h2 >
        //     <p>${Math.floor(parking.mvalue / parking.smetadata.capacity * 100)}% - ${parking.mvalue}/${parking.smetadata.capacity}<br />
        //         ${this.dateFormat(parking)}</p>
        // `;
        // }

        for (let parking of this.parkings) {
            this.shadow.innerHTML += `
                <div class="card">
                    <div class="badge ${this.badgeColor(parking)}">
                        <div class="percentage">${Math.floor(parking.mvalue / parking.smetadata.capacity * 100)}%</div>
                        <div class="capacity">${parking.mvalue} / ${parking.smetadata.capacity}</div>
                    </div>
                    <div class="detail">
                        <strong>${this.name(parking)}</strong>
                        <p>${this.dateFormat(parking)}</p>
                    </div>
                </div>
        `;
        }
    }
}

customElements.define('parking-dashboard', ParkingDashboard);