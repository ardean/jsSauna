import $ from "jquery";
import Connection from "./connection.js";

const connection = new Connection();
const socket = connection.socket;

const $loading = $(".loading");
const $login = $(".login");
const $loginForm = $(".login-form");
const $loginError = $(".login-error");
const $loginUsername = $(".login-username");
const $loginPw = $(".login-pw");
const $error = $(".error-wrapper");
const $main = $(".main");
const $errorSpan = $error.find("span");
const $currentTemperatureInfo = $(".current-temperature");
const $currentHumidityInfo = $(".current-humidity");
const $targetTemperatureRange = $(".target-temperature-range");
const $currentTargetTemperature = $(".current-target-temperature");
const $isSaunaOn = $(".is-sauna-on");
let settings = null;

connection
  .on("connect", () => {
    socket.on("settings.res", (data) => {
      settings = data;

      updateTemperatureInfo(settings.temperature);
      updateHumidityInfo(settings.humidity);
      setTargetTemperatureMax(settings.maxTemperature);
      setTargetTemperature(settings.targetTemperature);
      setIsSaunaOn(settings.isOn);

      hideLoading();
      hideError();

      if (settings.isLoginRequired) {
        const sessionId = localStorage.getItem("sId");
        if (sessionId) {
          socket.on("sId.res", (success) => {
            if (success) {
              showMain();
            } else {
              localStorage.removeItem("sId");
              showLogin();
            }
          });

          socket.emit("sId", sessionId);
        } else {
          showLogin();
        }
      } else {
        showMain();
      }
    });

    socket.on("turnOn", () => {
      setIsSaunaOn(true);
    }).on("turnOff", () => {
      setIsSaunaOn(false);
    }).on("temperatureChange", (temperature) => {
      updateTemperatureInfo(temperature);
    }).on("targetTemperatureChange", (targetTemperature) => {
      setTargetTemperature(targetTemperature);
    }).on("humidityChange", (humidity) => {
      updateHumidityInfo(humidity);
    });

    socket.emit("settings");
  })
  .on("disconnect", () => {
    hideMain();
    showError("No Connection");
  });

function showMain() {
  $main.show();

  $targetTemperatureRange.on("input", () => {
    const targetTemperature = parseInt($targetTemperatureRange.val());
    setTargetTemperature(targetTemperature);
    socket.emit("setTargetTemperature", targetTemperature);
  });

  $isSaunaOn.on("change", () => {
    if (!$isSaunaOn.is(":checked")) {
      setSaunaOn();
    } else {
      setSaunaOff();
    }
  });
}

function updateTemperatureInfo(temperature) {
  $currentTemperatureInfo.text(temperature + "°C");
}

function updateHumidityInfo(humidity) {
  $currentHumidityInfo.text(humidity + "%");
}

function setSaunaOff() {
  socket.emit("setSaunaOn");
}

function setSaunaOn() {
  socket.emit("setSaunaOff");
}

function setTargetTemperature(targetTemperature) {
  $targetTemperatureRange.val(targetTemperature);
  $currentTargetTemperature.text(targetTemperature + "°C");
}

function setTargetTemperatureMax(maxTemperature) {
  $targetTemperatureRange.attr("max", maxTemperature);
}

function setIsSaunaOn(isSaunaOn) {
  $isSaunaOn.attr("checked", !!isSaunaOn);
}

function hideMain() {
  $targetTemperatureRange.off("change");
}

function hideLoading() {
  $loading.hide();
}

function showLogin() {
  socket.on("login.res", (sessionId) => {
    if (!sessionId) return showLoginError("Login failed");

    localStorage.setItem("sId", sessionId);

    hideLogin();
    showMain();
  });

  $loginForm.on("submit", () => {
    socket.emit("login", {
      username: $loginUsername.val(),
      pw: $loginPw.val()
    });

    return false;
  });
  $login.show();
}

function hideLogin() {
  $login.hide();
}

function showLoginError(message) {
  $loginError.text(message);
}

function showError(text) {
  $errorSpan.text(text);
  $error.show();
}

function hideError() {
  $error.hide();
}
