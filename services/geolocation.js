const rest = require('./restService.js');

const getGeolocation = async() => {
    let geolocation = await rest.getGeolocationInfoByIpAddress();
    return {
        cityName: geolocation.city,
        countryCode: geolocation.country_code,
        countryName: geolocation.country_name,
        ip: geolocation.ip,
        latitude: geolocation.latitude,
        longitude: geolocation.longitude
    }
}

module.exports = { getGeolocation }