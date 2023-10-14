const os = require('os');

const platforms = {
    WINDOWS: 'WINDOWS',
    MAC: 'MAC',
    LINUX: 'LINUX'
}

const platformsNames = {
    win32: platforms.WINDOWS,
    darwin: platforms.MAC,
    linux: platforms.LINUX
}

const releases = {
    WIN7: 'WIN7',
    WIN8: 'WIN8',
    WIN10: 'WIN10',
    ANY: 'ANY'
}

const releaseTest = {
    [platforms.WINDOWS]: (version) => {
        const [majorVersion, minorVersion] = version.split('.');

        // Windows 10 (10.0)
        if (parseInt(majorVersion) >= 10) {
            return releases.WIN10;
        }

        // Windows 8.1 (6.3)
        // Windows 8 (6.2)
        // Windows 7 (6.1)
        if (majorVersion === '6') {
            if (minorVersion === '3' || minorVersion === '2') {
                return releases.WIN8;
            }

            return releases.WIN7;
        }

        return releases.WIN7;
    },
    [platforms.MAC]: () => releases.ANY,
    [platforms.LINUX]: () => releases.ANY,
};

const currentPlatform = platformsNames[os.platform()];
const currentRelease = releaseTest[currentPlatform](os.release());

const findHandlerOrDefault = (handlerName, dictionary) => {
    const handler = dictionary[handlerName];

    if (handler) {
        return handler;
    }

    if (dictionary.default) {
        return dictionary.default;
    }

    return () => null;
}

const byOS = findHandlerOrDefault.bind(null, currentPlatform);
const byRelease = findHandlerOrDefault.bind(null, currentRelease);

module.exports = {
    byOS,
    byRelease,
    platforms,
    releases,
    currentPlatform,
    currentRelease
};