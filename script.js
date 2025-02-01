let configButton = document.querySelector(".config-btn");
let configContainer = document.querySelector(".config-items-container");
let notificationCheckbox = document.querySelector("#notify");
let soundAlertCheckbox = document.querySelector("#ring");
let timerTitle = document.querySelector(".timer-title");
let timerContainer = document.querySelector(".timer");
let totalWorkContainer = document.querySelector(".total-work > .timer");
let totalRestContainer = document.querySelector(".total-rest > .timer");
let swapButton = document.querySelector(".swap-btn");
let pauseResumeButton = document.querySelector(".pause-resume-btn");
let resetButton = document.querySelector(".reset-btn");
let workTimeInput = document.querySelector("#work-time");
let restTimeInput = document.querySelector("#rest-time");
let iterationContainer = document.querySelector(".iteration");

let working = true;


class Timer {
    constructor() {
        this.startTime = null;

        this.partialTime = new Date(0);
        this.totalTime = new Date(0);
        this.running = false;
    }

    run() {
        if (this.running) {
            this.stop();
        }
        this.startTime = new Date();
        this.running = true;
    }

    pause() {
        this.partialTime = this.getTimeSum(this.partialTime, this.getCurrentFragment());
        this.running = false;
    }

    resetPartial() {
        this.totalTime = this.getTimeSum(this.totalTime, this.getPartialTime());
        this.partialTime = new Date(0);
        this.startTime = new Date();
    }

    stop() {
        this.pause();
        this.resetPartial();
    }

    getTimeString(time) {
        const hours = "0" + time.getUTCHours();
        const minutes = "0" + time.getUTCMinutes();
        const seconds = "0" + time.getUTCSeconds();

        return `${hours.slice(-2)}:${minutes.slice(-2)}:${seconds.slice(-2)}`;
    }

    getCurrentTimeString() {
        return this.getTimeString(this.getPartialTime());
    }

    getPartialTime() {
        return this.getTimeSum(this.partialTime, this.getCurrentFragment());
    }

    getCurrentFragment() {
        if (this.running) {
            return this.getTimeDifference(new Date(), this.startTime);
        }
        else {
            return new Date(0);
        }
    }

    getTimeDifference(time1, time2) {
        if (time1 < time2) {
            [time1, time2] = [time2, time1];
        }
        return new Date(time1.getTime() - time2.getTime());
    }

    getTimeSum(time1, time2) {
        return new Date(time1.getTime() + time2.getTime());
    }

    getTotalTime() {
        return this.getTimeSum(this.totalTime, this.getPartialTime());
    }

    getTotalTimeString() {
        return this.getTimeString(this.getTotalTime());
    }
}

const workTimer = new Timer();
const restTimer = new Timer();
let currentTimer = null;
let iteration = 1;
let beeped = false;

setInterval(updateTimer, 100);

function updateTimer() {
    if (!currentTimer) {
        return;
    }

    let timeLimit = null;

    if (currentTimer === workTimer) {
        timeLimit = +workTimeInput.value;
    }
    else {
        timeLimit = iteration % 4 !== 0 ? +restTimeInput.value : +restTimeInput.value * 3;
    }

    if (soundAlertCheckbox.checked && !beeped && Math.floor(currentTimer.getPartialTime().getTime() / 1000 / 60) === timeLimit) {
        console.log("BEEPING", new Date());
        alarm(300, 200, 5);
        beeped = true;

        if ("Notification" in window && Notification.permission === "granted" && notificationCheckbox.checked) {
            let notificationText = "";
            if (currentTimer === workTimer) {
                notificationText = "Time to rest!";
            }
            else {
                notificationText = "Time to work!";
            }
            const notification = new Notification(notificationText, { requireInteraction: true });
        }
    }

    timerContainer.textContent = `${currentTimer.getCurrentTimeString()} / ${timeLimit}`;
    totalWorkContainer.textContent = workTimer.getTotalTimeString();
    totalRestContainer.textContent = restTimer.getTotalTimeString();
}

configButton.addEventListener("click", () => {
    if (configContainer.style.display === "none") {
        configContainer.style.display = "flex";
    }
    else {
        configContainer.style.display = "none";
    }
});

pauseResumeButton.addEventListener("click", (event) => {
    const target = event.target;
    if (target.textContent === "📵") {
        if ("Notification" in window && Notification.permission !== "granted") {
            Notification.requestPermission();
        }
        currentTimer = workTimer;
        target.textContent = "⏸︎";
        workTimer.run();
        iterationContainer.textContent = `#${iteration}`;
    }
    else if (target.textContent === "⏸︎") {
        target.textContent = "▶";
        swapButton.style.display = "none";
        restTimer.run();
        workTimer.pause();
    }
    else {
        swapButton.style.removeProperty("display");
        target.textContent = "⏸︎";
        workTimer.run();
        restTimer.stop();
    }
});

swapButton.addEventListener("click", (event) => {
    currentTimer.stop();

    if (currentTimer === workTimer) {
        working = false;
        pauseResumeButton.style.display = "none";
        currentTimer = restTimer;
        document.documentElement.style.setProperty("--background-color-light", "hsl(184, 42%, 67%)");
        document.documentElement.style.setProperty("--background-color", "hsl(184, 42%, 63%)");
        document.documentElement.style.setProperty("--border-color", "hsl(184, 42%, 57%)");
    }
    else {
        working = true;
        pauseResumeButton.style.removeProperty("display");
        currentTimer = workTimer;
        document.documentElement.style.setProperty("--background-color-light", "hsl(0, 100%, 67%)");
        document.documentElement.style.setProperty("--background-color", "hsl(0, 100%, 63%)");
        document.documentElement.style.setProperty("--border-color", "hsl(0, 100%, 57%)");
        iteration++;
        iterationContainer.textContent = `#${iteration}`;
    }

    currentTimer.run();
    beeped = false;
})

/**
 * variables
 * tiempo total trabajando
 * tiempo total descansando
 * tiempo parcial trabajando
 * tiempo parcial descansando
 * numero de iteración
 *
 * tener 2 tiempos totales
 * trabajando y descansando
 * sumar tiempo a trabajando
 * habilitar boton de descanso a los 25 minutos
 * seguir sumando tiempo a los 25 parciales y al total
 * cuando se aprete el boton de descansar ...
 * ... agregar el tiempo parcial a una lista
 * ... arrancar el tiempo de descanso
 * al llegar a los 5 minutos habilitar el boton de trabajar
 * cuando se aprete el boton de trabajar ...
 * ... agregar el tiempo parcial a una lista
 * ... arrancar el tiempo de trabajo
 * sumar 1 a la iteracion
 *
 * mantener un boton de switch que cambie de trabajo a descanso
 * pausando trabajo y sumando descanso pero sin reiniciar trabajo
 *
 * hacer que todos los botones y relojes sean visibles solo on hover
 */

function alarm(frecuency, duration, repetitions) {
    for (let i = 0; i < repetitions; i++) {
        beep(frecuency, duration, duration * i * 2);
        beep(frecuency + 100, duration, duration * ((i * 2) + 1));
    }
}

function beep(frecuency, duration, start) {
    let context = new AudioContext();
    let oscillator = context.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = frecuency;
    oscillator.connect(context.destination);
    oscillator.start(start / 1000);
    oscillator.stop((start + duration) / 1000);
}



/// ARREGLAR EL RESET CUANDO PAUSED Y PROGRAMAR EL SWAP