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

        json.data.sort((a, b) => this.name(a) > this.name(b));


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
        return parking.sname;
        // return parking.smetadata.standard_name ? parking.smetadata.standard_name.replace("Parcheggio ", "") : parking.sname;
    }

    badgeColor(parking) {
        const parkingDate = new Date(parking.mvalidtime);
        const referenceDate = new Date();
        referenceDate.setHours(referenceDate.getHours() - 1);
        if (parkingDate < referenceDate)
            return 'gray';
        const percentage = Math.floor(parking.mvalue / parking.smetadata.capacity * 100);
        if (percentage >= 90)
            return 'red';
        if (percentage >= 50)
            return 'orange';
        return 'green';
    }

    connectedCallback() {
        this.render();
    }

    render() {
        console.log("render");
        this.shadow.innerHTML = `
            <style>
                h1 {
                    color: black;
                    font-family: 'Source Sans Pro',sans-serif;
                    margin: 10px;
                    margin-bottom: 20px;
                }
                .container{
                    display: flex;
                    flex-wrap: wrap;
                }
                .card {
                    font-family: 'Source Sans Pro',sans-serif;
                    display: flex;
                    margin: 10px;
                    padding: 5px;
                    border-radius: 20px;
                    height: 150px;
                }
                .badge{
                    display: flex;
                    flex-direction: column;
                    color : white;
                    width: 150px;
                    flex-shrink: 0;
                    font-family: sans-serif;
                    justify-content: center;
                    border-radius: 10px;
                }
                .percentage{
                    text-shadow: 0px 0px 5px #7b7b7b;
                    font-weight: 600;
                    font-size: 50px;
                    text-align: center;
                    width: 100%;
                }
                .capacity{
                    text-shadow: 0px 0px 3px #7b7b7b;
                    font-weight: 600;
                    font-size: 24px;
                    text-align: center;
                    width: 100%;
                }
                .detail {
                    display: flex;
                    flex-direction: column;
                    flex-wrap: wrap;
                    justify-content: space-between;
                    height: 140px;
                    width: 250px;
                    padding: 5px;
                    margin-left: 15px;
                    font-size: 22px;
                    font-family: 'Source Sans Pro',sans-serif;
                }
                @media only screen and (max-width: 932px) {
                    .detail {
                        width: 200px;
                    }
                }
                .name {
                    font-weight: 600;
                    font-size: 24px;
                }

                .red {
                    background-color : #ff4d4d;
                }
                .orange {
                    background-color : #FAC903;
                }
                .green {
                    background-color : #5cd65c;
                }
                .gray {
                    background-color : #bfbfbf;
                }
            </style>
        `;


        let cards = "";

        for (let parking of this.parkings) {
            cards += `
                <div class="card">
                    <div class="badge ${this.badgeColor(parking)}">
                        <div class="percentage">${Math.floor(parking.mvalue / parking.smetadata.capacity * 100)}%</div>
                        <div class="capacity">${parking.mvalue} / ${parking.smetadata.capacity}</div>
                    </div>
                    <div class="detail">
                        <div class="name">${this.name(parking)}</div>
                        <div>${this.dateFormat(parking)}</div>
                    </div>
                </div>
        `;
        }

        this.shadow.innerHTML += `
            <div class="container">
            ${cards}
            </div>
        `;

    }
}

customElements.define('parking-dashboard', ParkingDashboard);