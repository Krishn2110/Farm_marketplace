import getWeather from './weather.js'


(async () => {
  try {
    const data = await getWeather("Ahmedabad");
    console.log(data);
  } catch (err) {
    console.error(err.message);
  }
})();