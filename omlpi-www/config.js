const productionDomains = [
    'tmp--omlpi.appcivico.com',
];

export default {
    api: {
        domain: (productionDomains.indexOf(window.location.hostname) > -1
            ? 'http://tmp--omlpi-api.appcivico.com/v2/'
            : ''
        ),
        docs: (productionDomains.indexOf(window.location.hostname) > -1
            ? 'http://tmp--omlpi-docs.appcivico.com/'
            : '/'
        ),
    },
    apiCMS: {
        domain: (productionDomains.indexOf(window.location.hostname) > -1
            ? 'http://tmp--omlpi-strapi.appcivico.com'
            : 'http://localhost:1243/'
        ),
    },
    storage: {
        domain: (productionDomains.indexOf(window.location.hostname) > -1
            ? 'http://tmp--omlpi-strapi.appcivico.com'
            : 'https://tmp--omlpi-strapi.appcivico.com'
        ),
    },
    firstCityId: 5200050,
};
