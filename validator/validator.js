const _ = require('lodash');
// example
// {
//     author:"stanislavh"
//     body:"<center><img src=https://media-news.umarkets.com/admin/img/bc3d5b08-3a22-4c1f-8bc0-b94fff7b8d31></center></br>En el tercer trimestre, la tasa de desempleo en el Reino Unido, según la metodología de la Organización Internacional del Trabajo, aumentó a 4,1% desde 4% en el trimestre anterior. Esto se evidencia en los datos de la Oficina Nacional de Estadística de ONS. Al final del trimestre, el número de desempleados aumentó en 21 mil en comparación con el segundo trimestre y disminuyó en 43 mil en comparación con el mismo trimestre del año anterior. El número de empleados aumentó en 350 mil en términos anuales y se mantuvo casi sin cambios en términos trimestrales. La tasa de empleo de octubre del 75,5% mostró una disminución de 0,1 puntos porcentuales en el trimestre y un aumento de 0,5 puntos porcentuales en el año.</br>  [Russian version](https://www.investforum.ru/)"
//     json_metadata:"{"tags":["spanish"],"image":["https://media-news.umarkets.com/admin/img/bc3d5b08-3a22-4c1f-8bc0-b94fff7b8d31"],"app":"busy/2.5.6"}"
//         parent_author:""
//     parent_permlink:"spanish"
//     permlink:"stanislavh-best-post-rezqknpz56"
//     title:"El desempleo en el Reino Unido aumentó hasta el 4,1% en el tercer trimestre."
// }
// const requiredFields = 'parentAuthor,parentPermlink,author,permlink,title,body,jsonMetadata'.split(',');

const requiredFields = 'author,title,body'.split(',');

const validateAppendObject = (postData) => {
    let isValid = true;
    requiredFields.forEach(field => {
        if(postData[field] === undefined || postData[field] === null) isValid = false
    });
    return isValid;
};

module.exports = {
    validateAppendObject,
};