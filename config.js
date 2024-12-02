const productionDomains = [
    'tmp--omlpi-www.appcivico.com',
];

export default {
    api: {
        domain: (productionDomains.indexOf(window.location.hostname) > -1
            ? 'https://tmp--omlpi-api.appcivico.com/v2/'
            : ''
        ),
        docs: (productionDomains.indexOf(window.location.hostname) > -1
            ? 'https://tmp--omlpi-docs.appcivico.com/'
            : '/'
        ),
    },
    apiCMS: {
        domain: (productionDomains.indexOf(window.location.hostname) > -1
            ? 'https://tmp--omlpi-strapi.appcivico.com'
            : 'http://localhost:1337/'
        ),
    },
    storage: {
        domain: (productionDomains.indexOf(window.location.hostname) > -1
            ? 'https://tmp--omlpi-strapi.appcivico.com'
            : 'https://tmp--omlpi-strapi.appcivico.com'
        ),
    },
    firstCityId: 5200050,
};
