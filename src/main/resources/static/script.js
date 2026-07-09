let tempChart = null;

const weatherText = {
    0:"Clear Sky",1:"Mostly Clear",2:"Partly Cloudy",3:"Overcast",
    45:"Foggy",48:"Rime Fog",
    51:"Light Drizzle",53:"Moderate Drizzle",55:"Dense Drizzle",
    61:"Light Rain",63:"Moderate Rain",65:"Heavy Rain",
    71:"Light Snow",73:"Moderate Snow",75:"Heavy Snow",
    80:"Rain Showers",81:"Moderate Showers",82:"Violent Showers",
    95:"Thunderstorm",96:"Thunderstorm + Hail",99:"Severe Thunderstorm"
};

const icons = {
    0:"☀️",1:"🌤️",2:"⛅",3:"☁️",45:"🌫️",48:"🌫️",
    51:"🌦️",53:"🌦️",55:"🌧️",61:"🌧️",63:"🌧️",65:"🌧️",
    71:"❄️",73:"❄️",75:"❄️",80:"🌦️",81:"🌧️",82:"⛈️",
    95:"⚡",96:"⛈️",99:"🌩️"
};

function applyWeatherAnimation(code){
    const a=document.getElementById("weatherAnim"); a.innerHTML="";
    if([61,63,65,80,81,82].includes(code)){
        for(let i=0;i<80;i++){const d=document.createElement("div");d.className="rain-drop";d.style.left=Math.random()*100+"vw";a.appendChild(d);} }
    if([71,73,75].includes(code)){
        for(let i=0;i<40;i++){const f=document.createElement("div");f.className="snow-flake";f.innerHTML="❄️";f.style.left=Math.random()*100+"vw";a.appendChild(f);} }
    if([2,3].includes(code)){
        for(let i=0;i<4;i++){const c=document.createElement("div");c.className="cloud";c.innerHTML="☁️";c.style.top=(10+Math.random()*60)+"vh";a.appendChild(c);} }
}

async function getForecast(){
    const city=document.getElementById("cityInput").value.trim();
    const days=document.getElementById("daysInput").value;
    const result=document.getElementById("result");

    if(!city){result.innerHTML=`<p class='text-red-400 text-center'>Enter city</p>`;return;}

    result.innerHTML=`<p class='text-gray-300 text-center animate-pulse'>Loading...</p>`;

    const resp=await fetch(`http://localhost:8080/forecast?city=${city}&days=${days}`);

    if(!resp.ok){result.innerHTML=`<p class='text-red-400 text-center'>City not found</p>`;return;}

    const data=await resp.json();

    const dates=data.daily.time;
    const max=data.daily.temperature_2m_max;
    const min=data.daily.temperature_2m_min;
    const code=data.daily.weathercode;

    window.hourlyData=data.hourly;
    window.dailyDates=dates;

    applyWeatherAnimation(code[0]);

    let html=`<h2 class='text-2xl font-bold text-center mb-4 text-yellow-300'>${days}-Day Forecast</h2>`;

    dates.forEach((date,i)=>{
        const condition=weatherText[code[i]];
        const icon=icons[code[i]];

        html+=`
        <div class=\"day-card p-5 rounded-xl shadow-lg border border-gray-700
                    bg-gray-800/60 backdrop-blur-xl transition
                    transform hover:scale-105 hover:shadow-2xl cursor-pointer\"
             onclick=\"toggleHourly(${i})\">

            <div class=\"flex items-center gap-5\">
                <div class=\"text-5xl\">${icon}</div>
                <div>
                    <p class=\"font-bold text-lg text-white\">${date}</p>
                    <p class=\"text-gray-300\">Max: ${max[i]}°C • Min: ${min[i]}°C</p>
                    <p class=\"font-semibold text-purple-300\">${condition}</p>
                </div>
            </div>

            <div id=\"hourly-${i}\" class=\"hidden mt-5 p-5 rounded-xl bg-gray-900/50 border border-gray-700 transition-all duration-500\">
                <h3 class=\"text-center text-yellow-300 font-semibold mb-3\">Hourly Forecast</h3>
                <canvas id=\"hourlyChart-${i}\" height=\"140\"></canvas>
                <div id=\"hourlyDetails-${i}\" class=\"mt-4 space-y-2\"></div>
            </div>
        </div>`;
    });

    result.innerHTML=html;
    drawChart(dates.slice(0,days),max.slice(0,days));
}

function toggleHourly(i){
    const box=document.getElementById(`hourly-${i}`);
    if(!box.classList.contains("hidden")){box.classList.add("hidden");return;}
    box.classList.remove("hidden");
    buildHourly(i);
}

function buildHourly(dayIndex){
    const hourly=window.hourlyData;
    const dayDate=window.dailyDates[dayIndex];

    const hours=[];
    const temps=[];
    const codes=[];

    for(let i=0;i<hourly.time.length;i++){
        if(hourly.time[i].startsWith(dayDate)){
            hours.push(hourly.time[i].slice(11,16));
            temps.push(hourly.temperature_2m[i]);
            codes.push(hourly.weathercode[i]);
        }
    }

    const ctx=document.getElementById(`hourlyChart-${dayIndex}`).getContext("2d");
    new Chart(ctx,{
        type:"line",
        data:{ labels:hours, datasets:[{ label:"Temp (°C)", data:temps, borderColor:"#FDE047", backgroundColor:"rgba(253,224,71,0.2)", tension:0.4 }] },
        options:{ responsive:true }
    });

    let html="";
    hours.forEach((h,i)=>{
        html+=`
            <div class=\"flex justify-between p-2 rounded-lg bg-gray-800\">
                <span>${h}</span>
                <span>${icons[codes[i]]}</span>
                <span>${temps[i]}°C</span>
            </div>`;
    });

    document.getElementById(`hourlyDetails-${dayIndex}`).innerHTML=html;
}

function drawChart(labels, values){
    if(tempChart) tempChart.destroy();

    const ctx=document.getElementById("tempChart").getContext("2d");

    tempChart=new Chart(ctx,{
        type:"line",
        data:{ labels:labels, datasets:[{ label:"Max Temp (°C)", data:values, borderColor:"#93C5FD", backgroundColor:"rgba(147,197,253,0.3)", tension:0.4 }] },
        options:{ responsive:true }
    });
}
