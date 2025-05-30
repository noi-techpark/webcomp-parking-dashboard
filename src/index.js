// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

// easy configuration
const DEFAULT_PARKINGS = "103,104,105,106";
const REFRESH_INTERVAL = 60000;
const THRESHOLD_RED = 80;
const THRESHOLD_ORANGE = 50;
// badge becomes gray, if timestamp is older than THRESHOLD_GRAY in minutes
const THRESHOLD_GRAY = 15;
const SHOW_TIMESTAMP = false;



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


        function getParkings(parkingLots) {
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

            return json.data
                .filter(item => {
                const ts = item._timestamp;
                if (!ts) return false; // skip if no timestamp
                return !isOlderThanOneMonth(ts);
              })
              .sort((a, b) => name(a) > name(b));


        }

        function dateFormat(parking) {
            if (!parking.mvalidtime || !SHOW_TIMESTAMP) return ''
            const date = new Date(parking.mvalidtime)
            return `${date.getHours()}:${String('0' + date.getMinutes()).slice(
                -2
            )}, ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
        }

        function isOlderThanOneMonth(input) {
            let normalized;
          
            // Normalize input: replace space with 'T'
            if (input.includes('+')) {
              // Format: 2021-12-26 07:05:03.000+0000
              // Turn into ISO 8601: 2021-12-26T07:05:03.000+00:00
              normalized = input
                .replace(' ', 'T')
                .replace(/([+-]\d{2})(\d{2})$/, '$1:$2'); // +0000 → +00:00
            } else {
              // Format: 2021-12-26 07:05:03.000
              normalized = input.replace(' ', 'T');
            }
          
            const parsedDate = new Date(normalized);
            if (isNaN(parsedDate)) {
              throw new Error(`Invalid date format: ${input}`);
            }
          
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          
            return parsedDate < oneMonthAgo;
          }

        function name(parking) {
            return parking.sname;
            // return parking.smetadata.standard_name ? parking.smetadata.standard_name.replace("Parcheggio ", "") : parking.sname;
        }

        function badgeColor(parking) {
            const parkingDate = new Date(parking.mvalidtime);
            const referenceDate = new Date();
            referenceDate.setMinutes(referenceDate.getMinutes() - THRESHOLD_GRAY);
            if (parkingDate < referenceDate)
                return 'gray';
            const percentage = Math.floor(parking.mvalue / parking.smetadata.capacity * 100);
            if (percentage >= THRESHOLD_RED)
                return 'red';
            if (percentage >= THRESHOLD_ORANGE)
                return 'orange';
            return 'green';
        }

        function createHtml(parkingLots) {
            let html = `
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
                    text-shadow: 0px 0px 5px #00000073;
                    font-weight: 600;
                    font-size: 50px;
                    text-align: center;
                    width: 100%;
                }
                .capacity{
                    text-shadow: 0px 0px 3px #00000073;
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

            for (let parking of getParkings(parkingLots)) {
                cards += `
                <div class="card">
                    <div class="badge ${badgeColor(parking)}">
                        <div class="percentage">${Math.floor(parking.mvalue / parking.smetadata.capacity * 100)}%</div>
                        <div class="capacity">${parking.mvalue} / ${parking.smetadata.capacity}</div>
                    </div>
                    <div class="detail">
                        <div class="name">${name(parking)}</div>
                        <div>${dateFormat(parking)}</div>
                    </div>
                </div>
        `;
            }

            html += `
            <div class="container">
            ${cards}
            </div>
        `;

            return html;
        }

        function render(parkingLots, shadow) {
            shadow.innerHTML = createHtml(parkingLots)
        }

        // this calls and all above functions need to be inside constructor, to be abel to call setInterval
        render(this.parkings, this.shadow)
        setInterval(render, REFRESH_INTERVAL, this.parkings, this.shadow);
    }

    // this function needs tto be outside constructor to be able to access getAttributes
    get parkings() {
        let parkingLots = this.getAttribute("parkings");

        // default value
        parkingLots = parkingLots != null ? parkingLots : DEFAULT_PARKINGS;
        // split string
        parkingLots = parkingLots.split(",");
        return parkingLots;
    }

}

customElements.define('parking-dashboard', ParkingDashboard);